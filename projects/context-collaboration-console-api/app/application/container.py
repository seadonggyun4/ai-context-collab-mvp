"""Application service composition contract exposed to API routes."""

from dataclasses import dataclass

from app.application.document_commands import DocumentCommands
from app.application.health import ReadinessProbe
from app.application.queries import DocumentQueries, ProjectQueries
from app.application.review_commands import ReviewWorkflowCommands
from app.application.security import AuthenticationService, SecurityStore


@dataclass(frozen=True, slots=True)
class ApplicationContainer:
    projects: ProjectQueries
    documents: DocumentQueries
    document_commands: DocumentCommands
    readiness: ReadinessProbe
    review_workflow: ReviewWorkflowCommands
    authentication: AuthenticationService | None = None
    security_store: SecurityStore | None = None
