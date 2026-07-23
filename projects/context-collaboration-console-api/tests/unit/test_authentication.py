"""OIDC transaction, session, production middleware, CSRF, and rate-limit contracts."""

from dataclasses import replace
from datetime import UTC, datetime, timedelta
from typing import Any
from urllib.parse import parse_qs, urlsplit

import httpx
import jwt
import pytest
from app.application.container import ApplicationContainer
from app.application.security import AuthenticationService
from app.domain import ActorRole, AuthenticatedPrincipal, AuthSession, DomainError
from app.domain.security import OidcFlow
from app.infrastructure.security import InMemorySecurityStore
from app.infrastructure.security.oidc_client import HttpOidcClient
from app.main import create_app
from app.settings import Settings
from cryptography.hazmat.primitives.asymmetric import rsa
from httpx import ASGITransport, AsyncClient


class FakeOidcClient:
    async def authorization_url(self, flow: OidcFlow) -> str:
        return f"https://identity.example.com/authorize?state={flow.state}"

    async def authenticate(self, code: str, flow: OidcFlow) -> dict[str, Any]:
        assert code == "authorization-code"
        return {
            "sub": "subject-01",
            "name": "운영 관리자",
            "groups": ["context-admins"],
            "nonce": flow.nonce,
        }


class BrokenRateStore(InMemorySecurityStore):
    async def hit_rate_limit(self, key: str, limit: int, window_seconds: int) -> tuple[bool, int]:
        raise RuntimeError("security store unavailable")


def auth_service(store: InMemorySecurityStore) -> AuthenticationService:
    return AuthenticationService(
        store,
        FakeOidcClient(),
        issuer="https://identity.example.com",
        allowed_return_origins=("https://console.example.com",),
        role_claim="groups",
        role_mapping={"context-admins": ActorRole.ADMIN},
    )


def production_settings(**overrides: object) -> Settings:
    values: dict[str, object] = {
        "_env_file": None,
        "app_env": "production",
        "database_url": "postgresql://user:password@localhost/test",
        "cors_allowed_origins": "https://console.example.com",
        "frontend_origins": "https://console.example.com",
        "security_store_url": "redis://security.internal:6379",
        "oidc_issuer": "https://identity.example.com",
        "oidc_client_id": "console-client",
        "oidc_client_secret": "secret-value",
        "oidc_callback_url": "https://api.example.com/api/v1/auth/callback",
    }
    values.update(overrides)
    return Settings(**values)  # type: ignore[arg-type]


async def test_oidc_flow_is_exact_return_one_time_and_maps_role() -> None:
    store = InMemorySecurityStore()
    service = auth_service(store)
    flow, url = await service.begin("https://console.example.com/projects/apc")
    assert flow.code_verifier not in url
    assert flow.state in url

    completed = await service.complete("authorization-code", flow.state)
    assert completed.session.principal.role == ActorRole.ADMIN
    assert completed.return_to == "https://console.example.com/projects/apc"
    with pytest.raises(DomainError) as replay:
        await service.complete("authorization-code", flow.state)
    assert replay.value.code == "OIDC_FLOW_INVALID"

    with pytest.raises(DomainError) as redirect:
        await service.begin("https://attacker.example.com/callback")
    assert redirect.value.code == "OIDC_RETURN_URL_NOT_ALLOWED"


async def test_http_oidc_client_requires_pkce_and_validates_signed_nonce() -> None:
    # Build an ephemeral RSA key instead of relying on static private material.
    private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    jwk = jwt.algorithms.RSAAlgorithm.to_jwk(private_key.public_key(), as_dict=True)
    jwk.update({"kid": "signing-key-01", "use": "sig", "alg": "RS256"})
    now = datetime.now(UTC)
    observed: dict[str, str] = {}

    def handler(request: httpx.Request) -> httpx.Response:
        if request.url.path.endswith("/.well-known/openid-configuration"):
            return httpx.Response(
                200,
                json={
                    "issuer": "https://identity.example.com",
                    "authorization_endpoint": "https://identity.example.com/authorize",
                    "token_endpoint": "https://identity.example.com/token",
                    "jwks_uri": "https://identity.example.com/jwks",
                    "code_challenge_methods_supported": ["S256"],
                    "token_endpoint_auth_methods_supported": ["client_secret_basic"],
                    "id_token_signing_alg_values_supported": ["RS256"],
                },
            )
        if request.url.path == "/token":
            form = parse_qs(request.content.decode())
            observed["verifier"] = form["code_verifier"][0]
            observed["authorization"] = request.headers["Authorization"]
            token = jwt.encode(
                {
                    "iss": "https://identity.example.com",
                    "aud": "console-client",
                    "sub": "subject-01",
                    "name": "운영 관리자",
                    "nonce": "nonce-01",
                    "iat": int(now.timestamp()),
                    "exp": int((now + timedelta(minutes=5)).timestamp()),
                },
                private_key,
                algorithm="RS256",
                headers={"kid": "signing-key-01"},
            )
            return httpx.Response(200, json={"id_token": token})
        if request.url.path == "/jwks":
            return httpx.Response(200, json={"keys": [jwk]})
        return httpx.Response(404)

    client = HttpOidcClient(
        issuer="https://identity.example.com",
        client_id="console-client",
        client_secret="console-secret",
        callback_url="https://api.example.com/api/v1/auth/callback",
        transport=httpx.MockTransport(handler),
    )
    flow = OidcFlow("state-01", "nonce-01", "verifier-01", "https://console.example.com/", now + timedelta(minutes=5))
    authorization_url = await client.authorization_url(flow)
    query = parse_qs(urlsplit(authorization_url).query)

    assert query["code_challenge_method"] == ["S256"]
    assert query["code_challenge"] != [flow.code_verifier]
    claims = await client.authenticate("code-01", flow)
    assert claims["sub"] == "subject-01"
    assert observed["verifier"] == "verifier-01"
    assert observed["authorization"].startswith("Basic ")


async def test_production_session_csrf_logout_and_security_headers(
    container: ApplicationContainer,
) -> None:
    store = InMemorySecurityStore()
    service = auth_service(store)
    session = AuthSession(
        "session-01",
        AuthenticatedPrincipal("oidc-actor-01", "subject-01", "운영 관리자", ActorRole.ADMIN),
        "csrf-token-01",
        datetime.now(UTC) + timedelta(hours=1),
    )
    await store.save_session(session, 3_600)
    secured = replace(container, authentication=service, security_store=store)
    application = create_app(production_settings(), container=secured)

    async with (
        application.router.lifespan_context(application),
        AsyncClient(transport=ASGITransport(app=application), base_url="https://api.example.com") as client,
    ):
        anonymous = await client.get("/api/v1/projects/apc-monitoring-mvp")
        assert anonymous.status_code == 401
        assert anonymous.headers["x-request-id"] == anonymous.json()["traceId"]
        assert anonymous.headers["x-content-type-options"] == "nosniff"
        assert anonymous.headers["strict-transport-security"].startswith("max-age=31536000")

        client.cookies.set("context_console_session", session.id)
        project = await client.get("/api/v1/projects/apc-monitoring-mvp")
        assert project.status_code == 200
        assert project.headers["x-content-type-options"] == "nosniff"
        assert project.headers["strict-transport-security"].startswith("max-age=31536000")

        me = await client.get("/api/v1/auth/me")
        assert me.json()["principal"] == {
            "actorId": "oidc-actor-01",
            "displayName": "운영 관리자",
            "role": "admin",
        }
        no_csrf = await client.post(
            "/api/v1/changes/CR-DEMO-001/activations",
            json={"projectId": "apc-monitoring-mvp", "version": "context-v2", "documentIds": ["DOC-1"]},
            headers={"Idempotency-Key": "production-csrf"},
        )
        assert no_csrf.status_code == 403
        assert no_csrf.json()["code"] == "CSRF_TOKEN_INVALID"

        logged_out = await client.post("/api/v1/auth/logout", headers={"X-CSRF-Token": session.csrf_token})
        assert logged_out.status_code == 204
        assert (await client.get("/api/v1/auth/me")).status_code == 401


async def test_shared_rate_limit_returns_retry_after(container: ApplicationContainer) -> None:
    store = InMemorySecurityStore()
    application = create_app(
        Settings(
            _env_file=None,
            app_env="test",
            database_url="postgresql://user:password@localhost/test",
            cors_allowed_origins="https://console.example.com",
            rate_limit_read_per_minute=10,
        ),
        container=replace(container, security_store=store),
    )
    async with (
        application.router.lifespan_context(application),
        AsyncClient(transport=ASGITransport(app=application), base_url="https://api.example.com") as client,
    ):
        responses = [await client.get("/health/live") for _ in range(11)]
    assert all(item.status_code == 200 for item in responses[:10])
    assert responses[-1].status_code == 429
    assert int(responses[-1].headers["Retry-After"]) > 0


async def test_security_store_failure_fails_api_closed_but_keeps_health_diagnostic(
    container: ApplicationContainer,
) -> None:
    store = BrokenRateStore()
    service = auth_service(store)
    session = AuthSession(
        "session-02",
        AuthenticatedPrincipal("oidc-actor-02", "subject-02", "검증 담당자", ActorRole.REVIEWER),
        "csrf-token-02",
        datetime.now(UTC) + timedelta(hours=1),
    )
    await store.save_session(session, 3_600)
    application = create_app(
        production_settings(),
        container=replace(container, authentication=service, security_store=store),
    )

    async with (
        application.router.lifespan_context(application),
        AsyncClient(transport=ASGITransport(app=application), base_url="https://api.example.com") as client,
    ):
        client.cookies.set("context_console_session", session.id)
        protected = await client.get("/api/v1/projects/apc-monitoring-mvp")
        health = await client.get("/health/ready")

    assert protected.status_code == 503
    assert protected.json()["code"] == "SECURITY_STORE_UNAVAILABLE"
    assert health.status_code == 200
