"""FastAPI composition root.

Copyright © 2026 서동균 (DongGyun Seo). All Rights Reserved.
SPDX-License-Identifier: LicenseRef-Proprietary
"""

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from sqlalchemy.ext.asyncio import AsyncEngine
from starlette.exceptions import HTTPException
from starlette.middleware.cors import CORSMiddleware

from app.api.errors import (
    domain_error_handler,
    http_error_handler,
    unexpected_error_handler,
    validation_error_handler,
)
from app.api.health import router as health_router
from app.api.middleware import REQUEST_ID_HEADER, ProductionSecurityMiddleware, RequestIdMiddleware
from app.api.v1.router import router as api_v1_router
from app.application.container import ApplicationContainer
from app.application.document_commands import DocumentCommands
from app.application.queries import DocumentQueries, ProjectQueries
from app.application.review_commands import ReviewWorkflowCommands
from app.domain import ActorRole, DomainError
from app.infrastructure.database import (
    SqlAlchemyChangeWorkflowRepository,
    SqlAlchemyDocumentDraftRepository,
    SqlAlchemyProjectRepository,
    create_database_engine,
    create_session_factory,
)
from app.infrastructure.database.migration import EXPECTED_MIGRATION_REVISION
from app.infrastructure.database.readiness import DatabaseReadinessProbe
from app.infrastructure.document_validator import SafeDocumentValidator
from app.infrastructure.git import GitDocumentRepository, SandboxGitPublisher
from app.infrastructure.security import HttpOidcClient, InMemorySecurityStore, RedisSecurityStore
from app.logging import configure_logging
from app.settings import Settings, get_settings


def create_app(
    settings: Settings | None = None,
    *,
    container: ApplicationContainer | None = None,
    engine: AsyncEngine | None = None,
) -> FastAPI:
    resolved_settings = settings or get_settings()
    configure_logging(resolved_settings.log_level)
    cors_headers = [
        "Accept",
        "Authorization",
        "Content-Type",
        "Idempotency-Key",
        "X-CSRF-Token",
        REQUEST_ID_HEADER,
    ]
    if resolved_settings.app_env != "production":
        cors_headers.append("X-Actor-Id")

    @asynccontextmanager
    async def lifespan(application: FastAPI) -> AsyncIterator[None]:
        owned_engine: AsyncEngine | None = None
        owned_security_store = None
        if container is not None:
            application.state.container = container
        else:
            database_engine = engine or create_database_engine(resolved_settings.sqlalchemy_database_url)
            if engine is None:
                owned_engine = database_engine
            session_factory = create_session_factory(database_engine)
            project_repository = SqlAlchemyProjectRepository(session_factory)
            draft_repository = SqlAlchemyDocumentDraftRepository(session_factory)
            review_repository = SqlAlchemyChangeWorkflowRepository(session_factory)
            document_repository = GitDocumentRepository(
                resolved_settings.resolved_document_repository,
                allowed_refs=frozenset({resolved_settings.document_branch}),
                max_document_bytes=resolved_settings.document_max_bytes,
                timeout_seconds=resolved_settings.git_command_timeout_seconds,
            )
            document_queries = DocumentQueries(project_repository, document_repository)
            sandbox_root = resolved_settings.resolved_git_write_sandbox
            git_publisher = (
                SandboxGitPublisher(sandbox_root, timeout_seconds=resolved_settings.git_command_timeout_seconds)
                if sandbox_root is not None
                else None
            )
            security_url = resolved_settings.security_store_url
            security_store = (
                RedisSecurityStore(security_url.get_secret_value())
                if security_url is not None
                else InMemorySecurityStore()
            )
            owned_security_store = security_store
            authentication = None
            if (
                resolved_settings.oidc_issuer is not None
                and resolved_settings.oidc_client_id is not None
                and resolved_settings.oidc_client_secret is not None
                and resolved_settings.oidc_callback_url is not None
            ):
                from app.application.security import AuthenticationService

                authentication = AuthenticationService(
                    security_store,
                    HttpOidcClient(
                        issuer=resolved_settings.oidc_issuer,
                        client_id=resolved_settings.oidc_client_id,
                        client_secret=resolved_settings.oidc_client_secret.get_secret_value(),
                        callback_url=resolved_settings.oidc_callback_url,
                    ),
                    issuer=resolved_settings.oidc_issuer,
                    allowed_return_origins=resolved_settings.frontend_origin_values,
                    role_claim=resolved_settings.oidc_role_claim,
                    role_mapping={
                        group: ActorRole(role) for group, role in resolved_settings.parsed_oidc_role_mapping.items()
                    },
                    session_ttl_seconds=resolved_settings.session_ttl_seconds,
                )
            application.state.container = ApplicationContainer(
                projects=ProjectQueries(project_repository),
                documents=document_queries,
                document_commands=DocumentCommands(
                    documents=document_queries,
                    drafts=draft_repository,
                    validator=SafeDocumentValidator(resolved_settings.document_max_bytes),
                ),
                readiness=DatabaseReadinessProbe(
                    database_engine,
                    EXPECTED_MIGRATION_REVISION,
                    security_store,
                    security_required=resolved_settings.app_env == "production",
                ),
                review_workflow=ReviewWorkflowCommands(review_repository, git_publisher=git_publisher),
                authentication=authentication,
                security_store=security_store,
            )
        yield
        if owned_security_store is not None:
            await owned_security_store.close()
        if owned_engine is not None:
            await owned_engine.dispose()

    application = FastAPI(
        title=resolved_settings.app_name,
        version="0.1.0",
        openapi_url="/api/openapi.json",
        docs_url="/api/docs",
        redoc_url=None,
        lifespan=lifespan,
    )
    application.state.settings = resolved_settings
    application.add_middleware(ProductionSecurityMiddleware)
    application.add_middleware(RequestIdMiddleware)
    application.add_middleware(
        CORSMiddleware,
        allow_origins=list(resolved_settings.cors_origins),
        allow_credentials=resolved_settings.app_env == "production",
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=cors_headers,
        expose_headers=[REQUEST_ID_HEADER],
        max_age=600,
    )
    application.add_exception_handler(DomainError, domain_error_handler)
    application.add_exception_handler(RequestValidationError, validation_error_handler)
    application.add_exception_handler(HTTPException, http_error_handler)
    application.add_exception_handler(Exception, unexpected_error_handler)
    application.include_router(health_router)
    application.include_router(api_v1_router)
    return application


app = create_app()
