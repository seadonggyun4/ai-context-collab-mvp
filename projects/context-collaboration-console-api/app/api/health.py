"""Liveness and dependency-aware readiness routes."""

from typing import Annotated

from fastapi import APIRouter, Depends, Response, status

from app.api.dependencies import get_container
from app.api.schemas import LiveResponse, ReadinessChecks, ReadyResponse
from app.application.container import ApplicationContainer

router = APIRouter(prefix="/health", tags=["health"])


@router.get("/live", response_model=LiveResponse)
async def live() -> LiveResponse:
    return LiveResponse(status="live")


@router.get(
    "/ready",
    response_model=ReadyResponse,
    responses={503: {"model": ReadyResponse}},
)
async def ready(
    response: Response,
    container: Annotated[ApplicationContainer, Depends(get_container)],
) -> ReadyResponse:
    report = await container.readiness.check()
    if not report.ready:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    return ReadyResponse(
        status="ready" if report.ready else "not_ready",
        checks=ReadinessChecks(
            database=report.database,
            migration=report.migration,
            security_store=report.security_store,
        ),
    )
