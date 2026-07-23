"""Small protocol-compatible fakes used by API tests."""

from dataclasses import dataclass, field, replace
from datetime import UTC, date, datetime

from app.application.health import ReadinessReport
from app.application.ports import GitPublishResult, GitPublishSpec
from app.domain import (
    AuditRecord,
    ChangeWorkflow,
    DocumentDetail,
    DocumentDraft,
    DocumentFormat,
    DocumentSummary,
    Project,
    ProjectHealth,
)


def sample_project(**overrides: object) -> Project:
    values: dict[str, object] = {
        "id": "apc-monitoring-mvp",
        "name": "APC 데이터 운영 모니터링",
        "description": "APC data operations",
        "repository_url": "https://example.com/repository.git",
        "default_branch": "main",
        "document_root": "docs/apc-monitoring-mvp",
        "active_context_version": "context-v1.3",
        "effective_date": date(2026, 7, 21),
        "health": ProjectHealth.NEEDS_ATTENTION,
        "created_at": datetime(2026, 7, 22, tzinfo=UTC),
        "updated_at": datetime(2026, 7, 22, tzinfo=UTC),
    }
    values.update(overrides)
    return Project(**values)  # type: ignore[arg-type]


def sample_document(project_id: str = "apc-monitoring-mvp") -> DocumentDetail:
    return DocumentDetail(
        id=f"{project_id}:0123456789abcdefabcd",
        project_id=project_id,
        path=f"docs/{project_id}/Project_Context.md",
        title="Project Context",
        format=DocumentFormat.MARKDOWN,
        revision="a" * 40,
        size_bytes=18,
        source="# Project Context\n",
    )


class FakeProjectRepository:
    def __init__(self, project: Project | None = None) -> None:
        self.project = project

    async def get(self, project_id: str) -> Project | None:
        if self.project is None or self.project.id != project_id:
            return None
        return self.project


class FakeDocumentRepository:
    def __init__(self, document: DocumentDetail | None = None) -> None:
        self.document = document

    async def list_for_project(self, project: Project) -> tuple[DocumentSummary, ...]:
        if self.document is None or self.document.project_id != project.id:
            return ()
        return (
            DocumentSummary(
                id=self.document.id,
                project_id=self.document.project_id,
                path=self.document.path,
                title=self.document.title,
                format=self.document.format,
                revision=self.document.revision,
                size_bytes=self.document.size_bytes,
            ),
        )

    async def get(self, project: Project, document_id: str) -> DocumentDetail | None:
        if self.document is None or self.document.project_id != project.id or self.document.id != document_id:
            return None
        return self.document


class FakeDocumentDraftRepository:
    def __init__(self) -> None:
        self.drafts: dict[str, DocumentDraft] = {}

    async def save(self, draft: DocumentDraft) -> DocumentDraft:
        self.drafts[draft.client_draft_id] = draft
        return draft


class FakeChangeWorkflowRepository:
    def __init__(self, workflow: ChangeWorkflow | None = None) -> None:
        self.workflow = workflow
        self.receipts: dict[str, tuple[str, str]] = {}

    async def get(self, change_id: str) -> ChangeWorkflow | None:
        return self.workflow if self.workflow is not None and self.workflow.id == change_id else None

    async def find_receipt(self, idempotency_key: str) -> tuple[str, str] | None:
        return self.receipts.get(idempotency_key)

    async def save_command(
        self,
        workflow: ChangeWorkflow,
        *,
        expected_revision: int,
        new_audit_offset: int,
        idempotency_key: str,
        input_fingerprint: str,
    ) -> None:
        if self.workflow is None or self.workflow.storage_revision != expected_revision:
            raise RuntimeError("stale workflow")
        self.workflow = workflow
        self.receipts[idempotency_key] = (workflow.id, input_fingerprint)

    async def append_denied_command(
        self,
        *,
        change_id: str,
        actor_id: str,
        request_id: str,
        command_type: str,
        error_code: str,
        occurred_at: datetime,
    ) -> None:
        if self.workflow is None:
            return
        event_id = f"{request_id}:command.denied"
        if any(item.id == event_id for item in self.workflow.audit_events):
            return
        event = AuditRecord(
            id=event_id,
            change_request_id=change_id,
            actor_id=actor_id,
            action="command.denied",
            target_type="CHANGE_REQUEST",
            target_id=change_id,
            before={},
            after={"commandType": command_type, "errorCode": error_code},
            request_id=request_id,
            occurred_at=occurred_at,
        )
        self.workflow = replace(self.workflow, audit_events=(*self.workflow.audit_events, event))


class FakeGitPublisher:
    def __init__(self) -> None:
        self.calls: list[GitPublishSpec] = []

    async def publish(self, spec: GitPublishSpec) -> GitPublishResult:
        self.calls.append(spec)
        return GitPublishResult(
            branch=spec.branch,
            commit_sha="b" * 40,
            pull_request_url=f"sandbox://pull-requests/{spec.change_id}",
            pull_request_status="OPEN",
        )


@dataclass(frozen=True, slots=True)
class FakeReadinessProbe:
    report: ReadinessReport = field(
        default_factory=lambda: ReadinessReport(ready=True, database="available", migration="current")
    )

    async def check(self) -> ReadinessReport:
        return self.report
