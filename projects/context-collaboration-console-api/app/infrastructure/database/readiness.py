"""Database connectivity and migration readiness probe."""

from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncEngine

from app.application.health import ReadinessReport
from app.application.security import SecurityStore


class DatabaseReadinessProbe:
    def __init__(
        self,
        engine: AsyncEngine,
        expected_revision: str,
        security_store: SecurityStore | None = None,
        *,
        security_required: bool = False,
    ) -> None:
        self._engine = engine
        self._expected_revision = expected_revision
        self._security_store = security_store
        self._security_required = security_required

    async def check(self) -> ReadinessReport:
        try:
            async with self._engine.connect() as connection:
                await connection.execute(text("SELECT 1"))
                revision = await connection.scalar(text("SELECT version_num FROM alembic_version LIMIT 1"))
        except SQLAlchemyError:
            return ReadinessReport(ready=False, database="unavailable", migration="unknown", security_store="unknown")

        migration = "current" if revision == self._expected_revision else "outdated"
        security = "not_required"
        if self._security_store is not None:
            security = "available" if await self._security_store.ping() else "unavailable"
        ready = migration == "current" and (not self._security_required or security == "available")
        return ReadinessReport(ready=ready, database="available", migration=migration, security_store=security)
