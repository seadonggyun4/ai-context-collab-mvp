"""Project read repository backed by SQLAlchemy."""

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from app.domain import Project, ProjectHealth
from app.infrastructure.database.models import ProjectRow


class SqlAlchemyProjectRepository:
    def __init__(self, session_factory: async_sessionmaker[AsyncSession]) -> None:
        self._session_factory = session_factory

    async def get(self, project_id: str) -> Project | None:
        async with self._session_factory() as session:
            row = await session.get(ProjectRow, project_id)
        if row is None:
            return None
        return Project(
            id=row.id,
            name=row.name,
            description=row.description,
            repository_url=row.repository_url,
            default_branch=row.default_branch,
            document_root=row.document_root,
            active_context_version=row.active_context_version,
            effective_date=row.effective_date,
            health=ProjectHealth(row.health),
            created_at=row.created_at,
            updated_at=row.updated_at,
        )
