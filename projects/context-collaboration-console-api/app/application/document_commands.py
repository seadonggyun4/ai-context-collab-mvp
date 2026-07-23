"""Document draft and validation use cases."""

from dataclasses import dataclass
from datetime import UTC, datetime

from app.application.ports import DocumentDraftRepository, DocumentValidator
from app.application.queries import DocumentQueries
from app.domain import DocumentConflict, DocumentDiagnostic, DocumentDraft


@dataclass(frozen=True, slots=True)
class SaveDocumentDraft:
    document_id: str
    content: str
    base_revision: str
    client_draft_id: str


@dataclass(frozen=True, slots=True)
class ValidateDocumentDraft:
    document_id: str
    content: str
    base_revision: str


@dataclass(frozen=True, slots=True)
class DocumentValidation:
    document_id: str
    base_revision: str
    current_revision: str
    valid: bool
    diagnostics: tuple[DocumentDiagnostic, ...]


@dataclass(frozen=True, slots=True)
class DocumentCommands:
    documents: DocumentQueries
    drafts: DocumentDraftRepository
    validator: DocumentValidator

    async def save(self, command: SaveDocumentDraft) -> DocumentDraft | DocumentConflict:
        current = await self.documents.get(command.document_id)
        if current.revision != command.base_revision:
            return DocumentConflict(
                code="DOCUMENT_REVISION_CONFLICT",
                title="문서 원본이 변경되었습니다",
                detail="최신 원본과 현재 초안을 비교한 뒤 기준 revision을 선택해 주세요.",
                base_revision=command.base_revision,
                current_revision=current.revision,
                base_source="",
                current_source=current.source,
                draft_source=command.content,
            )
        diagnostics = self.validator.validate(command.content, current.format, current.path)
        return await self.drafts.save(
            DocumentDraft(
                client_draft_id=command.client_draft_id,
                document_id=current.id,
                project_id=current.project_id,
                base_revision=command.base_revision,
                content=command.content,
                diagnostics=diagnostics,
                saved_at=datetime.now(UTC),
            )
        )

    async def validate(self, command: ValidateDocumentDraft) -> DocumentValidation | DocumentConflict:
        current = await self.documents.get(command.document_id)
        if current.revision != command.base_revision:
            return DocumentConflict(
                code="DOCUMENT_REVISION_CONFLICT",
                title="문서 원본이 변경되었습니다",
                detail="최신 원본과 현재 초안을 비교한 뒤 기준 revision을 선택해 주세요.",
                base_revision=command.base_revision,
                current_revision=current.revision,
                base_source="",
                current_source=current.source,
                draft_source=command.content,
            )
        diagnostics = self.validator.validate(command.content, current.format, current.path)
        return DocumentValidation(
            document_id=current.id,
            base_revision=command.base_revision,
            current_revision=current.revision,
            valid=not any(item.severity.value == "ERROR" for item in diagnostics),
            diagnostics=diagnostics,
        )
