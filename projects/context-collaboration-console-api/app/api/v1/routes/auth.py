"""OIDC login and revocable server-session endpoints."""

import secrets
from typing import Annotated

from fastapi import APIRouter, Cookie, Depends, Header, Query, Request
from starlette.responses import RedirectResponse, Response

from app.api.dependencies import get_container
from app.api.schemas import AuthPrincipalResponse, AuthSessionResponse, ErrorResponse
from app.application.container import ApplicationContainer
from app.application.security import AuthenticationService
from app.domain import DomainError
from app.settings import Settings

router = APIRouter(prefix="/auth", tags=["authentication"])


def _settings(request: Request) -> Settings:
    settings: Settings = request.app.state.settings
    return settings


def _require_auth(container: ApplicationContainer) -> AuthenticationService:
    if container.authentication is None:
        raise DomainError(
            code="AUTHENTICATION_NOT_CONFIGURED",
            title="인증 서비스가 구성되지 않았습니다",
            detail="OIDC와 security store 설정을 확인하세요.",
            status_code=503,
        )
    return container.authentication


@router.get("/login", responses={400: {"model": ErrorResponse}, 503: {"model": ErrorResponse}})
async def login(
    return_to: Annotated[str, Query(alias="returnTo", min_length=8, max_length=2_000)],
    request: Request,
    container: Annotated[ApplicationContainer, Depends(get_container)],
) -> RedirectResponse:
    flow, authorization_url = await _require_auth(container).begin(return_to)
    settings = _settings(request)
    response = RedirectResponse(authorization_url, status_code=303)
    response.set_cookie(
        "context_oidc_state",
        flow.state,
        max_age=600,
        httponly=True,
        secure=settings.session_cookie_secure,
        samesite="lax",
        path="/api/v1/auth/callback",
    )
    return response


@router.get("/callback", responses={401: {"model": ErrorResponse}, 503: {"model": ErrorResponse}})
async def callback(
    request: Request,
    code: Annotated[str, Query(min_length=8, max_length=4_096)],
    state: Annotated[str, Query(min_length=16, max_length=256)],
    container: Annotated[ApplicationContainer, Depends(get_container)],
    browser_state: Annotated[str | None, Cookie(alias="context_oidc_state")] = None,
) -> RedirectResponse:
    if browser_state is None or not secrets.compare_digest(browser_state, state):
        raise DomainError(
            code="OIDC_STATE_MISMATCH",
            title="로그인 요청 상태가 일치하지 않습니다",
            detail="로그인을 다시 시작하세요.",
            status_code=401,
        )
    completed = await _require_auth(container).complete(code, state)
    settings = _settings(request)
    response = RedirectResponse(completed.return_to, status_code=303)
    response.delete_cookie("context_oidc_state", path="/api/v1/auth/callback")
    response.set_cookie(
        settings.session_cookie_name,
        completed.session.id,
        max_age=settings.session_ttl_seconds,
        httponly=True,
        secure=settings.session_cookie_secure,
        samesite=settings.session_cookie_samesite,
        path="/",
    )
    return response


@router.get("/me", response_model=AuthSessionResponse, responses={401: {"model": ErrorResponse}})
async def me(
    request: Request,
    container: Annotated[ApplicationContainer, Depends(get_container)],
) -> AuthSessionResponse:
    settings = _settings(request)
    session = await _require_auth(container).session(request.cookies.get(settings.session_cookie_name))
    if session is None:
        raise _unauthenticated()
    return AuthSessionResponse(
        authenticated=True,
        principal=AuthPrincipalResponse(
            actor_id=session.principal.actor_id,
            display_name=session.principal.display_name,
            role=session.principal.role.value,
        ),
        csrf_token=session.csrf_token,
        expires_at=session.expires_at,
    )


@router.post("/logout", status_code=204, responses={401: {"model": ErrorResponse}, 403: {"model": ErrorResponse}})
async def logout(
    request: Request,
    container: Annotated[ApplicationContainer, Depends(get_container)],
    csrf_token: Annotated[str | None, Header(alias="X-CSRF-Token")] = None,
) -> Response:
    settings = _settings(request)
    session_id = request.cookies.get(settings.session_cookie_name)
    session = await _require_auth(container).session(session_id)
    if session is None or session_id is None:
        raise _unauthenticated()
    if csrf_token is None or not secrets.compare_digest(csrf_token, session.csrf_token):
        raise DomainError(
            code="CSRF_TOKEN_INVALID",
            title="요청을 확인할 수 없습니다",
            detail="세션을 새로고침한 뒤 다시 시도하세요.",
            status_code=403,
        )
    await _require_auth(container).logout(session_id)
    response = Response(status_code=204)
    response.delete_cookie(settings.session_cookie_name, path="/")
    return response


def _unauthenticated() -> DomainError:
    return DomainError(
        code="AUTHENTICATION_REQUIRED",
        title="로그인이 필요합니다",
        detail="조직 계정으로 다시 로그인하세요.",
        status_code=401,
    )
