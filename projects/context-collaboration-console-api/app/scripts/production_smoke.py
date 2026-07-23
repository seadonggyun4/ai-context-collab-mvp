"""Read-only production release smoke for the public web/API/dependency chain."""

import argparse
from dataclasses import dataclass
from urllib.parse import urljoin

import httpx


@dataclass(frozen=True, slots=True)
class SmokeCheck:
    name: str
    target: str
    status: str


def verify_release(client: httpx.Client, *, web_url: str, api_url: str) -> tuple[SmokeCheck, ...]:
    checks: list[SmokeCheck] = []
    web_root = _get(client, web_url.rstrip("/") + "/", "web-root")
    if "<html" not in web_root.text.lower():
        raise RuntimeError("web-root did not return an HTML document")
    checks.append(SmokeCheck("web-root", str(web_root.url), "ok"))

    spa = _get(client, urljoin(web_url.rstrip("/") + "/", "projects/apc-monitoring-mvp"), "spa-rewrite")
    if "<html" not in spa.text.lower():
        raise RuntimeError("spa-rewrite did not return the application shell")
    checks.append(SmokeCheck("spa-rewrite", str(spa.url), "ok"))

    live = _get(client, api_url.rstrip("/") + "/health/live", "api-live")
    if live.json() != {"status": "live"}:
        raise RuntimeError("api-live returned an unexpected contract")
    checks.append(SmokeCheck("api-live", str(live.url), "ok"))

    ready = _get(client, api_url.rstrip("/") + "/health/ready", "api-ready")
    payload = ready.json()
    expected = {"database": "available", "migration": "current", "securityStore": "available"}
    actual_checks = payload.get("checks")
    checks_ready = isinstance(actual_checks, dict) and all(
        actual_checks.get(key) == value for key, value in expected.items()
    )
    if payload.get("status") != "ready" or not checks_ready:
        raise RuntimeError(f"api-ready dependency contract failed: {payload!r}")
    checks.append(SmokeCheck("api-ready-db-security", str(ready.url), "ok"))

    session = client.get(api_url.rstrip("/") + "/api/v1/auth/me")
    if session.status_code != 401 or session.json().get("code") != "AUTHENTICATION_REQUIRED":
        raise RuntimeError("anonymous auth boundary did not fail closed")
    checks.append(SmokeCheck("anonymous-auth-boundary", str(session.url), "ok"))
    return tuple(checks)


def _get(client: httpx.Client, url: str, name: str) -> httpx.Response:
    response = client.get(url)
    try:
        response.raise_for_status()
    except httpx.HTTPStatusError as error:
        raise RuntimeError(f"{name} failed with HTTP {response.status_code}") from error
    return response


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Verify the production web, API, DB, security store, and auth boundary"
    )
    parser.add_argument("--web-url", required=True, help="Public HTTPS URL of the Render Static Site")
    parser.add_argument("--api-url", required=True, help="Public HTTPS URL of the Render API Web Service")
    parser.add_argument("--timeout", type=float, default=10.0)
    args = parser.parse_args()
    if not args.web_url.startswith("https://") or not args.api_url.startswith("https://"):
        parser.error("production smoke URLs must use HTTPS")
    with httpx.Client(timeout=args.timeout, follow_redirects=False) as client:
        checks = verify_release(client, web_url=args.web_url, api_url=args.api_url)
    for check in checks:
        print(f"PASS {check.name} {check.target}")


if __name__ == "__main__":
    main()
