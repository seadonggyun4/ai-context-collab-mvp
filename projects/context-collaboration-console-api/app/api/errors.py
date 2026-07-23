"""Stable public error mapping without stack traces or transport jargon."""

import structlog
from fastapi import Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException

from app.domain import DomainError

logger = structlog.get_logger(__name__)


def _error_response(
    request: Request,
    *,
    status_code: int,
    code: str,
    title: str,
    detail: str,
) -> JSONResponse:
    request_id = getattr(request.state, "request_id", None)
    return JSONResponse(
        status_code=status_code,
        content={"code": code, "title": title, "detail": detail, "traceId": request_id},
    )


async def domain_error_handler(request: Request, error: Exception) -> JSONResponse:
    if not isinstance(error, DomainError):
        raise TypeError("domain error handler received an incompatible exception")
    return _error_response(
        request,
        status_code=error.status_code,
        code=error.code,
        title=error.title,
        detail=error.detail,
    )


async def validation_error_handler(request: Request, error: Exception) -> JSONResponse:
    if not isinstance(error, RequestValidationError):
        raise TypeError("validation error handler received an incompatible exception")
    return _error_response(
        request,
        status_code=422,
        code="REQUEST_VALIDATION_FAILED",
        title="요청 형식이 유효하지 않습니다",
        detail="입력값과 식별자를 확인해 주세요.",
    )


async def http_error_handler(request: Request, error: Exception) -> JSONResponse:
    if not isinstance(error, HTTPException):
        raise TypeError("HTTP error handler received an incompatible exception")
    if error.status_code == 404:
        return _error_response(
            request,
            status_code=404,
            code="ROUTE_NOT_FOUND",
            title="요청한 API를 찾을 수 없습니다",
            detail="API 경로와 version을 확인해 주세요.",
        )
    return _error_response(
        request,
        status_code=error.status_code,
        code="HTTP_REQUEST_FAILED",
        title="요청을 처리할 수 없습니다",
        detail="요청 조건을 확인해 주세요.",
    )


async def unexpected_error_handler(request: Request, error: Exception) -> JSONResponse:
    request_id = getattr(request.state, "request_id", None)
    logger.exception("unhandled_request_error", request_id=request_id, error_type=type(error).__name__)
    return _error_response(
        request,
        status_code=500,
        code="INTERNAL_ERROR",
        title="요청을 완료하지 못했습니다",
        detail="잠시 후 다시 시도해 주세요.",
    )
