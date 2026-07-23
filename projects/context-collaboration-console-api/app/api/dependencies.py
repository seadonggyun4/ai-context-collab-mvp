"""Request-scoped container and trusted actor resolution."""

from typing import Annotated

from fastapi import Header, Request

from app.application.container import ApplicationContainer
from app.domain import DomainError
from app.settings import Settings


def get_container(request: Request) -> ApplicationContainer:
    container: ApplicationContainer = request.app.state.container
    return container


def _actor_from_request(request: Request, supplied: str | None, fallback: str | None) -> str:
    principal = getattr(request.state, "principal", None)
    if principal is not None:
        return str(principal.actor_id)
    settings: Settings = request.app.state.settings
    if settings.app_env == "production":
        raise DomainError(
            code="AUTHENTICATION_REQUIRED",
            title="로그인이 필요합니다",
            detail="조직 계정으로 다시 로그인하세요.",
            status_code=401,
        )
    actor_id = supplied or fallback
    if actor_id is None:
        raise DomainError(
            code="ACTOR_REQUIRED",
            title="실행자를 확인할 수 없습니다",
            detail="비운영 환경의 actor header를 확인하세요.",
            status_code=401,
        )
    return actor_id


def require_actor_id(
    request: Request,
    supplied: Annotated[str | None, Header(alias="X-Actor-Id")] = None,
) -> str:
    return _actor_from_request(request, supplied, None)


def review_actor_id(
    request: Request,
    supplied: Annotated[str | None, Header(alias="X-Actor-Id")] = None,
) -> str:
    return _actor_from_request(request, supplied, "user-review-01")


def admin_actor_id(
    request: Request,
    supplied: Annotated[str | None, Header(alias="X-Actor-Id")] = None,
) -> str:
    return _actor_from_request(request, supplied, "user-admin-01")
