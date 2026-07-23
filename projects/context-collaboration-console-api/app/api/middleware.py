"""Cross-cutting HTTP behavior."""

import re
import secrets
import time
import uuid
from hashlib import sha256

import structlog
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import JSONResponse, Response

from app.application.container import ApplicationContainer
from app.settings import Settings

REQUEST_ID_HEADER = "X-Request-ID"
_SAFE_REQUEST_ID = re.compile(r"^[A-Za-z0-9._:-]{1,128}$")


class RequestIdMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        supplied = request.headers.get(REQUEST_ID_HEADER, "")
        existing = getattr(request.state, "request_id", None)
        request_id = existing or (supplied if _SAFE_REQUEST_ID.fullmatch(supplied) else str(uuid.uuid4()))
        request.state.request_id = request_id
        response = await call_next(request)
        response.headers[REQUEST_ID_HEADER] = request_id
        return response


class ProductionSecurityMiddleware(BaseHTTPMiddleware):
    """Fail-closed production session, CSRF, rate-limit, and access-log boundary."""

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        started = time.perf_counter()
        settings: Settings = request.app.state.settings
        container: ApplicationContainer = request.app.state.container
        request_id = getattr(request.state, "request_id", None) or str(uuid.uuid4())
        request.state.request_id = request_id
        request.state.request_started = started
        principal = None
        session = None
        auth_path = request.url.path.startswith("/api/v1/auth/")
        protected = request.url.path.startswith("/api/v1/") and not auth_path

        if settings.app_env == "production" and protected:
            if container.authentication is None:
                return _security_error(
                    request,
                    503,
                    "AUTHENTICATION_NOT_CONFIGURED",
                    "인증 서비스를 사용할 수 없습니다",
                    production=True,
                )
            session = await container.authentication.session(request.cookies.get(settings.session_cookie_name))
            if session is None:
                return _security_error(request, 401, "AUTHENTICATION_REQUIRED", "로그인이 필요합니다", production=True)
            principal = session.principal
            request.state.principal = principal
            container.review_workflow.actors.register_authenticated(principal.actor())
            if request.method not in {"GET", "HEAD", "OPTIONS"}:
                supplied_csrf = request.headers.get("X-CSRF-Token", "")
                if not supplied_csrf or not secrets.compare_digest(supplied_csrf, session.csrf_token):
                    return _security_error(
                        request,
                        403,
                        "CSRF_TOKEN_INVALID",
                        "요청을 확인할 수 없습니다",
                        production=True,
                    )

        rate_response = await self._rate_limit(request, container, settings, principal.actor_id if principal else None)
        if rate_response is not None:
            rate_response.headers[REQUEST_ID_HEADER] = request_id
            return rate_response

        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["Referrer-Policy"] = "no-referrer"
        response.headers["X-Frame-Options"] = "DENY"
        if settings.app_env == "production":
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        duration_ms = round((time.perf_counter() - started) * 1000, 2)
        structlog.get_logger("http.access").info(
            "request.completed",
            request_id=request_id,
            actor_id=principal.actor_id if principal else None,
            method=request.method,
            path=request.url.path,
            status=response.status_code,
            duration_ms=duration_ms,
        )
        return response

    async def _rate_limit(
        self,
        request: Request,
        container: ApplicationContainer,
        settings: Settings,
        actor_id: str | None,
    ) -> Response | None:
        store = container.security_store
        if store is None or not request.url.path.startswith(("/api/", "/health/")):
            return None
        mutation = request.method not in {"GET", "HEAD", "OPTIONS"}
        limit = settings.rate_limit_mutation_per_minute if mutation else settings.rate_limit_read_per_minute
        remote = request.client.host if request.client is not None else "unknown"
        identity = actor_id or sha256(remote.encode()).hexdigest()[:24]
        bucket = f"{'write' if mutation else 'read'}:{identity}"
        try:
            allowed, retry_after = await store.hit_rate_limit(bucket, limit, 60)
        except Exception:
            structlog.get_logger("security.store").exception(
                "rate_limit.unavailable",
                request_id=getattr(request.state, "request_id", None),
                path=request.url.path,
            )
            if request.url.path.startswith("/health/"):
                return None
            return _security_error(
                request,
                503,
                "SECURITY_STORE_UNAVAILABLE",
                "보안 상태 저장소를 사용할 수 없습니다",
                production=settings.app_env == "production",
            )
        if allowed:
            return None
        response = _security_error(
            request,
            429,
            "RATE_LIMIT_EXCEEDED",
            "요청이 너무 많습니다. 잠시 후 다시 시도하세요",
            production=settings.app_env == "production",
        )
        response.headers["Retry-After"] = str(retry_after)
        return response


def _security_error(request: Request, status_code: int, code: str, title: str, *, production: bool) -> JSONResponse:
    request_id = getattr(request.state, "request_id", None) or str(uuid.uuid4())
    response = JSONResponse(
        {
            "code": code,
            "title": title,
            "detail": "운영 보안 정책에 따라 요청을 완료할 수 없습니다.",
            "traceId": request_id,
        },
        status_code=status_code,
    )
    response.headers[REQUEST_ID_HEADER] = request_id or str(uuid.uuid4())
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Referrer-Policy"] = "no-referrer"
    response.headers["X-Frame-Options"] = "DENY"
    if production:
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    principal = getattr(request.state, "principal", None)
    started = getattr(request.state, "request_started", time.perf_counter())
    structlog.get_logger("http.access").info(
        "request.denied",
        request_id=request_id,
        actor_id=principal.actor_id if principal is not None else None,
        method=request.method,
        path=request.url.path,
        status=status_code,
        duration_ms=round((time.perf_counter() - started) * 1000, 2),
        denial_code=code,
    )
    return response
