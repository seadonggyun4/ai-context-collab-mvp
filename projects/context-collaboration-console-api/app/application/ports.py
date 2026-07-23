"""Inbound-independent repository contracts."""

from dataclasses import dataclass
from datetime import datetime
from typing import Protocol

from app.domain import (
    ChangeWorkflow,
    DocumentDetail,
    DocumentDiagnostic,
    DocumentDraft,
    DocumentFormat,
    DocumentSummary,
    Project,
)


@dataclass(frozen=True, slots=True)
class GitPublishSpec:
    project_id: str
    change_id: str
    branch: str
    base_commit_sha: str
    document_path: str
    document_content: str
    commit_message: str


@dataclass(frozen=True, slots=True)
class GitPublishResult:
    branch: str
    commit_sha: str
    pull_request_url: str
    pull_request_status: str


class GitPublisher(Protocol):
    async def publish(self, spec: GitPublishSpec) -> GitPublishResult: ...


class ChangeWorkflowRepository(Protocol):
    async def get(self, change_id: str) -> ChangeWorkflow | None: ...

    async def find_receipt(self, idempotency_key: str) -> tuple[str, str] | None: ...

    async def save_command(
        self,
        workflow: ChangeWorkflow,
        *,
        expected_revision: int,
        new_audit_offset: int,
        idempotency_key: str,
        input_fingerprint: str,
    ) -> None: ...

    async def append_denied_command(
        self,
        *,
        change_id: str,
        actor_id: str,
        request_id: str,
        command_type: str,
        error_code: str,
        occurred_at: datetime,
    ) -> None: ...


class ProjectRepository(Protocol):
    async def get(self, project_id: str) -> Project | None: ...


class DocumentRepository(Protocol):
    async def list_for_project(self, project: Project) -> tuple[DocumentSummary, ...]: ...

    async def get(self, project: Project, document_id: str) -> DocumentDetail | None: ...


class DocumentDraftRepository(Protocol):
    async def save(self, draft: DocumentDraft) -> DocumentDraft: ...


class DocumentValidator(Protocol):
    def validate(
        self,
        content: str,
        document_format: DocumentFormat,
        document_path: str | None = None,
    ) -> tuple[DocumentDiagnostic, ...]: ...
