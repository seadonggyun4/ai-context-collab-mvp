"""Project read endpoints."""

from typing import Annotated

from fastapi import APIRouter, Depends, Path

from app.api.dependencies import get_container
from app.api.schemas import DocumentListResponse, DocumentSummaryResponse, ErrorResponse, ProjectResponse
from app.application.container import ApplicationContainer

router = APIRouter(prefix="/projects", tags=["projects"])


@router.get(
    "/{project_id}",
    response_model=ProjectResponse,
    responses={404: {"model": ErrorResponse}},
)
async def get_project(
    project_id: Annotated[str, Path(min_length=1, max_length=100, pattern=r"^[a-z0-9][a-z0-9-]*$")],
    container: Annotated[ApplicationContainer, Depends(get_container)],
) -> ProjectResponse:
    return ProjectResponse.from_domain(await container.projects.get(project_id))


@router.get(
    "/{project_id}/documents",
    response_model=DocumentListResponse,
    responses={404: {"model": ErrorResponse}, 503: {"model": ErrorResponse}},
)
async def list_documents(
    project_id: Annotated[str, Path(min_length=1, max_length=100, pattern=r"^[a-z0-9][a-z0-9-]*$")],
    container: Annotated[ApplicationContainer, Depends(get_container)],
) -> DocumentListResponse:
    documents = await container.documents.list_for_project(project_id)
    items = tuple(DocumentSummaryResponse.from_domain(document) for document in documents)
    return DocumentListResponse(items=items, total=len(items))
