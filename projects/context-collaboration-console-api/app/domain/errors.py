"""Stable domain errors shared by adapters and delivery layers."""

from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class DomainError(Exception):
    code: str
    title: str
    detail: str
    status_code: int


def project_not_found(project_id: str) -> DomainError:
    return DomainError(
        code="PROJECT_NOT_FOUND",
        title="프로젝트를 찾을 수 없습니다",
        detail=f"프로젝트 '{project_id}'이(가) 등록되어 있지 않습니다.",
        status_code=404,
    )


def document_not_found(document_id: str) -> DomainError:
    return DomainError(
        code="DOCUMENT_NOT_FOUND",
        title="문서를 찾을 수 없습니다",
        detail=f"문서 '{document_id}'이(가) 현재 Git revision에 없습니다.",
        status_code=404,
    )


def document_source_unavailable(detail: str) -> DomainError:
    return DomainError(
        code="DOCUMENT_SOURCE_UNAVAILABLE",
        title="문서 원본을 읽을 수 없습니다",
        detail=detail,
        status_code=503,
    )


def document_policy_violation(code: str, detail: str) -> DomainError:
    return DomainError(
        code=code,
        title="허용되지 않은 문서 경로입니다",
        detail=detail,
        status_code=400,
    )
