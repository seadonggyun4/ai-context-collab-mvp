"""Migration, repository, readiness, API, and Git integration against PostgreSQL."""

import os
from collections.abc import Iterator
from pathlib import Path

import pytest
from alembic import command
from alembic.config import Config
from alembic.script import ScriptDirectory
from app.infrastructure.database import (
    SqlAlchemyProjectRepository,
    create_database_engine,
    create_session_factory,
)
from app.infrastructure.database.migration import EXPECTED_MIGRATION_REVISION
from app.infrastructure.database.readiness import DatabaseReadinessProbe
from app.main import create_app
from app.scripts.seed import seed
from app.settings import Settings
from httpx import ASGITransport, AsyncClient
from sqlalchemy import text

API_ROOT = Path(__file__).resolve().parents[2]


@pytest.fixture(scope="module")
def migrated_settings() -> Iterator[Settings]:
    database_url = os.getenv("TEST_DATABASE_URL")
    if database_url is None:
        pytest.skip("TEST_DATABASE_URL is required for PostgreSQL integration tests")

    previous_database_url = os.environ.get("DATABASE_URL")
    previous_branch = os.environ.get("DOCUMENT_BRANCH")
    os.environ["DATABASE_URL"] = database_url
    os.environ["DOCUMENT_BRANCH"] = "HEAD"
    config = Config(str(API_ROOT / "alembic.ini"))
    command.downgrade(config, "base")
    command.upgrade(config, "head")

    settings = Settings(
        _env_file=None,
        app_env="test",
        database_url=database_url,
        document_repository=API_ROOT.parents[1],
        document_branch="HEAD",
        cors_allowed_origins="https://console.example.com",
    )
    script = ScriptDirectory.from_config(config)
    assert script.get_current_head() == EXPECTED_MIGRATION_REVISION
    yield settings

    command.downgrade(config, "base")
    if previous_database_url is None:
        os.environ.pop("DATABASE_URL", None)
    else:
        os.environ["DATABASE_URL"] = previous_database_url
    if previous_branch is None:
        os.environ.pop("DOCUMENT_BRANCH", None)
    else:
        os.environ["DOCUMENT_BRANCH"] = previous_branch


@pytest.mark.postgres
async def test_postgres_migration_seed_readiness_and_read_api(migrated_settings: Settings) -> None:
    await seed(migrated_settings)
    await seed(migrated_settings)
    engine = create_database_engine(migrated_settings.sqlalchemy_database_url)
    try:
        repository = SqlAlchemyProjectRepository(create_session_factory(engine))
        project = await repository.get("apc-monitoring-mvp")
        assert project is not None
        assert project.document_root == "docs/apc-monitoring-mvp"

        readiness = DatabaseReadinessProbe(engine, EXPECTED_MIGRATION_REVISION)
        assert (await readiness.check()).ready is True
        async with engine.begin() as connection:
            await connection.execute(text("UPDATE alembic_version SET version_num = 'stale_revision'"))
        stale = await readiness.check()
        assert stale.ready is False
        assert stale.migration == "outdated"
        async with engine.begin() as connection:
            await connection.execute(
                text("UPDATE alembic_version SET version_num = :revision"),
                {"revision": EXPECTED_MIGRATION_REVISION},
            )

        application = create_app(migrated_settings, engine=engine)
        async with (
            application.router.lifespan_context(application),
            AsyncClient(
                transport=ASGITransport(app=application),
                base_url="https://api.example.com",
            ) as client,
        ):
            ready = await client.get("/health/ready")
            assert ready.status_code == 200
            assert ready.json()["checks"]["migration"] == "current"
            response = await client.get("/api/v1/projects/apc-monitoring-mvp")
            assert response.status_code == 200
            listing = await client.get("/api/v1/projects/apc-monitoring-mvp/documents")
            assert listing.status_code == 200
            assert listing.json()["total"] > 0
            workspace = await client.get("/api/v1/projects/apc-monitoring-mvp/changes/CR-DEMO-001/review-workspace")
            assert workspace.status_code == 200
            assert workspace.json()["scopeFingerprint"] == "revision=1|scope=apc-monitoring-last-received-at-v1"
            assert len(workspace.json()["diff"]["semantic"]) == 8
    finally:
        await engine.dispose()
