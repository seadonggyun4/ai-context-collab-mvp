"""Document read, draft, and validation endpoints."""

from typing import Annotated

from fastapi import APIRouter, Depends, Header, Path
from fastapi.responses import JSONResponse

from app.api.dependencies import get_container
from app.api.schemas import (
    DocumentConflictResponse,
    DocumentDetailResponse,
    DocumentDraftRequest,
    DocumentDraftResponse,
    DocumentValidationRequest,
    DocumentValidationResponse,
    ErrorResponse,
)
from app.application.container import ApplicationContainer
from app.application.document_commands import SaveDocumentDraft, ValidateDocumentDraft
from app.domain import DocumentConflict

router = APIRouter(prefix="/documents", tags=["documents"])


@router.get(
    "/{document_id}",
    response_model=DocumentDetailResponse,
    responses={400: {"model": ErrorResponse}, 404: {"model": ErrorResponse}, 503: {"model": ErrorResponse}},
)
async def get_document(
    document_id: Annotated[
        str,
        Path(min_length=3, max_length=160, pattern=r"^[a-z0-9][a-z0-9-]*:[0-9a-f]{20}$"),
    ],
    container: Annotated[ApplicationContainer, Depends(get_container)],
) -> DocumentDetailResponse:
    return DocumentDetailResponse.from_detail(await container.documents.get(document_id))


DocumentId = Annotated[
    str,
    Path(min_length=3, max_length=160, pattern=r"^[a-z0-9][a-z0-9-]*:[0-9a-f]{20}$"),
]
IdempotencyKey = Annotated[
    str,
    Header(alias="Idempotency-Key", min_length=8, max_length=100, pattern=r"^[A-Za-z0-9_-]+$"),
]


def _conflict_response(conflict: DocumentConflict) -> JSONResponse:
    payload = DocumentConflictResponse.from_domain(conflict)
    return JSONResponse(status_code=409, content=payload.model_dump(by_alias=True, mode="json"))


@router.post(
    "/{document_id}/drafts",
    response_model=DocumentDraftResponse,
    responses={
        400: {"model": ErrorResponse},
        404: {"model": ErrorResponse},
        409: {"model": DocumentConflictResponse},
        503: {"model": ErrorResponse},
    },
)
async def save_document_draft(
    document_id: DocumentId,
    request: DocumentDraftRequest,
    idempotency_key: IdempotencyKey,
    container: Annotated[ApplicationContainer, Depends(get_container)],
) -> DocumentDraftResponse | JSONResponse:
    result = await container.document_commands.save(
        SaveDocumentDraft(
            document_id=document_id,
            content=request.content,
            base_revision=request.base_revision,
            client_draft_id=request.client_draft_id,
        )
    )
    if isinstance(result, DocumentConflict):
        return _conflict_response(result)
    return DocumentDraftResponse.from_domain(result)


@router.post(
    "/{document_id}/validate",
    response_model=DocumentValidationResponse,
    responses={
        400: {"model": ErrorResponse},
        404: {"model": ErrorResponse},
        409: {"model": DocumentConflictResponse},
        503: {"model": ErrorResponse},
    },
)
async def validate_document_draft(
    document_id: DocumentId,
    request: DocumentValidationRequest,
    idempotency_key: IdempotencyKey,
    container: Annotated[ApplicationContainer, Depends(get_container)],
) -> DocumentValidationResponse | JSONResponse:
    result = await container.document_commands.validate(
        ValidateDocumentDraft(
            document_id=document_id,
            content=request.content,
            base_revision=request.base_revision,
        )
    )
    if isinstance(result, DocumentConflict):
        return _conflict_response(result)
    return DocumentValidationResponse.from_domain(result)
