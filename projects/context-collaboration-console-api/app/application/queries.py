"""Read use cases with no delivery or persistence dependencies."""

from dataclasses import dataclass

from app.application.ports import DocumentRepository, ProjectRepository
from app.domain import DocumentDetail, DocumentSummary, Project
from app.domain.errors import document_not_found, project_not_found


@dataclass(frozen=True, slots=True)
class ProjectQueries:
    projects: ProjectRepository

    async def get(self, project_id: str) -> Project:
        project = await self.projects.get(project_id)
        if project is None:
            raise project_not_found(project_id)
        return project


@dataclass(frozen=True, slots=True)
class DocumentQueries:
    projects: ProjectRepository
    documents: DocumentRepository

    async def list_for_project(self, project_id: str) -> tuple[DocumentSummary, ...]:
        project = await self.projects.get(project_id)
        if project is None:
            raise project_not_found(project_id)
        return await self.documents.list_for_project(project)

    async def get(self, document_id: str) -> DocumentDetail:
        project_id = document_id.partition(":")[0]
        if not project_id:
            raise document_not_found(document_id)
        project = await self.projects.get(project_id)
        if project is None:
            raise document_not_found(document_id)
        document = await self.documents.get(project, document_id)
        if document is None:
            raise document_not_found(document_id)
        return document
