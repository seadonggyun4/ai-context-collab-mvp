"""Shared FastAPI composition fixture."""

from collections.abc import AsyncIterator
from pathlib import Path

import pytest
from app.application.container import ApplicationContainer
from app.application.document_commands import DocumentCommands
from app.application.queries import DocumentQueries, ProjectQueries
from app.application.review_commands import ReviewWorkflowCommands
from app.domain import demo_workflow
from app.infrastructure.document_validator import SafeDocumentValidator
from app.main import create_app
from app.settings import Settings
from httpx import ASGITransport, AsyncClient

from tests.fakes import (
    FakeChangeWorkflowRepository,
    FakeDocumentDraftRepository,
    FakeDocumentRepository,
    FakeGitPublisher,
    FakeProjectRepository,
    FakeReadinessProbe,
    sample_document,
    sample_project,
)


@pytest.fixture
def settings(tmp_path: Path) -> Settings:
    return Settings(
        _env_file=None,
        app_env="test",
        database_url="postgresql://user:password@localhost/test",
        cors_allowed_origins="https://console.example.com",
        document_repository=tmp_path,
        document_branch="main",
    )


@pytest.fixture
def container() -> ApplicationContainer:
    projects = FakeProjectRepository(sample_project())
    documents = FakeDocumentRepository(sample_document())
    document_queries = DocumentQueries(projects, documents)
    return ApplicationContainer(
        projects=ProjectQueries(projects),
        documents=document_queries,
        document_commands=DocumentCommands(
            documents=document_queries,
            drafts=FakeDocumentDraftRepository(),
            validator=SafeDocumentValidator(),
        ),
        readiness=FakeReadinessProbe(),
        review_workflow=ReviewWorkflowCommands(
            FakeChangeWorkflowRepository(demo_workflow()),
            git_publisher=FakeGitPublisher(),
        ),
    )


@pytest.fixture
async def client(settings: Settings, container: ApplicationContainer) -> AsyncIterator[AsyncClient]:
    application = create_app(settings, container=container)
    async with (
        application.router.lifespan_context(application),
        AsyncClient(
            transport=ASGITransport(app=application),
            base_url="https://test.example.com",
        ) as test_client,
    ):
        yield test_client
