"""SQLAlchemy-backed working draft persistence."""

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from app.domain import DocumentDraft
from app.infrastructure.database.models import DocumentDraftRow


class SqlAlchemyDocumentDraftRepository:
    def __init__(self, session_factory: async_sessionmaker[AsyncSession]) -> None:
        self._session_factory = session_factory

    async def save(self, draft: DocumentDraft) -> DocumentDraft:
        async with self._session_factory() as session, session.begin():
            row = await session.get(DocumentDraftRow, draft.client_draft_id)
            if row is None:
                session.add(
                    DocumentDraftRow(
                        client_draft_id=draft.client_draft_id,
                        document_id=draft.document_id,
                        project_id=draft.project_id,
                        base_revision=draft.base_revision,
                        content=draft.content,
                        saved_at=draft.saved_at,
                    )
                )
            else:
                row.document_id = draft.document_id
                row.project_id = draft.project_id
                row.base_revision = draft.base_revision
                row.content = draft.content
                row.saved_at = draft.saved_at
        return draft
