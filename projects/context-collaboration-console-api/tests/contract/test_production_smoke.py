"""Production smoke stays read-only and validates every runtime dependency."""

import json

import httpx
import pytest
from app.scripts.production_smoke import verify_release


def test_production_smoke_covers_web_spa_api_database_security_and_auth() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        if request.url.host == "console.example.com":
            return httpx.Response(200, text="<!doctype html><html><div id='root'></div></html>", request=request)
        if request.url.path == "/health/live":
            return httpx.Response(200, json={"status": "live"}, request=request)
        if request.url.path == "/health/ready":
            return httpx.Response(
                200,
                json={
                    "status": "ready",
                    "checks": {"database": "available", "migration": "current", "securityStore": "available"},
                },
                request=request,
            )
        if request.url.path == "/api/v1/auth/me":
            return httpx.Response(401, json={"code": "AUTHENTICATION_REQUIRED"}, request=request)
        return httpx.Response(404, request=request)

    with httpx.Client(transport=httpx.MockTransport(handler)) as client:
        checks = verify_release(
            client,
            web_url="https://console.example.com",
            api_url="https://api.example.com",
        )

    assert [item.name for item in checks] == [
        "web-root",
        "spa-rewrite",
        "api-live",
        "api-ready-db-security",
        "anonymous-auth-boundary",
    ]


def test_production_smoke_stops_on_degraded_readiness_without_mutating_state() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        if request.url.host == "console.example.com":
            return httpx.Response(200, text="<html></html>", request=request)
        if request.url.path == "/health/live":
            return httpx.Response(200, json={"status": "live"}, request=request)
        if request.url.path == "/health/ready":
            return httpx.Response(503, content=json.dumps({"status": "not_ready"}), request=request)
        return httpx.Response(404, request=request)

    with (
        httpx.Client(transport=httpx.MockTransport(handler)) as client,
        pytest.raises(RuntimeError, match="api-ready failed with HTTP 503"),
    ):
        verify_release(client, web_url="https://console.example.com", api_url="https://api.example.com")
