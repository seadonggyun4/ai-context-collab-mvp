"""Idempotently seed the first managed project."""

import asyncio
from datetime import date

from app.domain import demo_workflow
from app.infrastructure.database import create_database_engine, create_session_factory
from app.infrastructure.database.models import ChangeWorkflowRow, ProjectRow
from app.infrastructure.database.review_workflow_repository import _audit_to_row, _serialize
from app.settings import Settings


async def seed(settings: Settings) -> None:
    engine = create_database_engine(settings.sqlalchemy_database_url)
    session_factory = create_session_factory(engine)
    try:
        async with session_factory.begin() as session:
            project = await session.get(ProjectRow, "apc-monitoring-mvp")
            values = {
                "name": "APC 데이터 운영 모니터링",
                "description": "산지유통센터의 데이터 수신과 품질 상태를 추적합니다.",
                "repository_url": settings.source_repository_url,
                "default_branch": settings.document_branch,
                "document_root": "docs/apc-monitoring-mvp",
                "active_context_version": "context-v1.3",
                "effective_date": date(2026, 7, 21),
                "health": "NEEDS_ATTENTION",
            }
            if project is None:
                session.add(ProjectRow(id="apc-monitoring-mvp", **values))
            else:
                for key, value in values.items():
                    setattr(project, key, value)
            await session.flush()
            workflow = demo_workflow()
            workflow_row = await session.get(ChangeWorkflowRow, workflow.id)
            if workflow_row is None:
                session.add(
                    ChangeWorkflowRow(
                        id=workflow.id,
                        project_id=workflow.project_id,
                        storage_revision=workflow.storage_revision,
                        payload=_serialize(workflow),
                    )
                )
                await session.flush()
                session.add_all(_audit_to_row(item) for item in workflow.audit_events)
    finally:
        await engine.dispose()


def main() -> None:
    asyncio.run(seed(Settings()))


if __name__ == "__main__":
    main()
