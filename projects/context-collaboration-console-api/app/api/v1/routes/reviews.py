"""Review, verification, transition, and audit workspace endpoints."""

from typing import Annotated

from fastapi import APIRouter, Depends, Header, Path

from app.api.dependencies import admin_actor_id, get_container, require_actor_id, review_actor_id
from app.api.schemas import (
    ActivationWorkspaceResponse,
    ContextActivationRequest,
    ErrorResponse,
    EvidenceRequest,
    GitPublicationRequest,
    ReviewRequest,
    ReviewWorkspaceResponse,
    TransitionRequest,
)
from app.application.container import ApplicationContainer
from app.application.review_commands import (
    ActivateContextCommand,
    EvidenceCommand,
    PublishGitCommand,
    ReviewCommand,
    TransitionCommand,
)
from app.domain import DomainError

router = APIRouter(tags=["review-workflow"])

ChangeId = Annotated[str, Path(min_length=3, max_length=100, pattern=r"^[A-Za-z0-9_-]+$")]
ProjectId = Annotated[str, Path(min_length=3, max_length=100, pattern=r"^[a-z0-9][a-z0-9-]+$")]
ActorId = Annotated[str, Depends(require_actor_id)]
IdempotencyKey = Annotated[
    str,
    Header(alias="Idempotency-Key", min_length=8, max_length=100, pattern=r"^[A-Za-z0-9_-]+$"),
]


def _assert_project(workflow_project_id: str, request_project_id: str) -> None:
    if workflow_project_id != request_project_id:
        raise DomainError(
            code="REVIEW_WORKSPACE_NOT_FOUND",
            title="검토 대상을 찾을 수 없습니다",
            detail="프로젝트와 변경 요청 ID를 확인하세요.",
            status_code=404,
        )


@router.get(
    "/projects/{project_id}/changes/{change_id}/review-workspace",
    response_model=ReviewWorkspaceResponse,
    responses={401: {"model": ErrorResponse}, 404: {"model": ErrorResponse}},
)
async def get_review_workspace(
    project_id: ProjectId,
    change_id: ChangeId,
    container: Annotated[ApplicationContainer, Depends(get_container)],
    actor_id: Annotated[str, Depends(review_actor_id)],
) -> ReviewWorkspaceResponse:
    workflow = await container.review_workflow.get(change_id)
    _assert_project(workflow.project_id, project_id)
    return ReviewWorkspaceResponse.from_domain(workflow, container.review_workflow.actors.resolve(actor_id))


@router.post(
    "/changes/{change_id}/reviews",
    response_model=ReviewWorkspaceResponse,
    responses={401: {"model": ErrorResponse}, 403: {"model": ErrorResponse}, 409: {"model": ErrorResponse}},
)
async def record_review(
    change_id: ChangeId,
    request: ReviewRequest,
    actor_id: ActorId,
    idempotency_key: IdempotencyKey,
    container: Annotated[ApplicationContainer, Depends(get_container)],
) -> ReviewWorkspaceResponse:
    workflow = await container.review_workflow.get(change_id)
    _assert_project(workflow.project_id, request.project_id)
    updated = await container.review_workflow.review(
        change_id,
        actor_id,
        ReviewCommand(request.decision, request.proposal_revision, request.scope_fingerprint, request.comment),
        idempotency_key,
    )
    return ReviewWorkspaceResponse.from_domain(updated, container.review_workflow.actors.resolve(actor_id))


@router.post(
    "/changes/{change_id}/verifications",
    response_model=ReviewWorkspaceResponse,
    responses={401: {"model": ErrorResponse}, 403: {"model": ErrorResponse}, 409: {"model": ErrorResponse}},
)
async def record_verification(
    change_id: ChangeId,
    request: EvidenceRequest,
    actor_id: ActorId,
    idempotency_key: IdempotencyKey,
    container: Annotated[ApplicationContainer, Depends(get_container)],
) -> ReviewWorkspaceResponse:
    workflow = await container.review_workflow.get(change_id)
    _assert_project(workflow.project_id, request.project_id)
    updated = await container.review_workflow.evidence(
        change_id,
        actor_id,
        EvidenceCommand(request.test_id, request.result),
        idempotency_key,
    )
    return ReviewWorkspaceResponse.from_domain(updated, container.review_workflow.actors.resolve(actor_id))


@router.post(
    "/changes/{change_id}/transitions",
    response_model=ReviewWorkspaceResponse,
    responses={401: {"model": ErrorResponse}, 403: {"model": ErrorResponse}, 409: {"model": ErrorResponse}},
)
async def transition_change(
    change_id: ChangeId,
    request: TransitionRequest,
    actor_id: ActorId,
    idempotency_key: IdempotencyKey,
    container: Annotated[ApplicationContainer, Depends(get_container)],
) -> ReviewWorkspaceResponse:
    workflow = await container.review_workflow.get(change_id)
    _assert_project(workflow.project_id, request.project_id)
    updated = await container.review_workflow.transition(
        change_id,
        actor_id,
        TransitionCommand(request.target),
        idempotency_key,
    )
    return ReviewWorkspaceResponse.from_domain(updated, container.review_workflow.actors.resolve(actor_id))


@router.get(
    "/projects/{project_id}/changes/{change_id}/activation-workspace",
    response_model=ActivationWorkspaceResponse,
    responses={401: {"model": ErrorResponse}, 404: {"model": ErrorResponse}},
)
async def get_activation_workspace(
    project_id: ProjectId,
    change_id: ChangeId,
    container: Annotated[ApplicationContainer, Depends(get_container)],
    actor_id: Annotated[str, Depends(admin_actor_id)],
) -> ActivationWorkspaceResponse:
    workflow = await container.review_workflow.get(change_id)
    _assert_project(workflow.project_id, project_id)
    return ActivationWorkspaceResponse.from_domain(workflow, container.review_workflow.actors.resolve(actor_id))


@router.post(
    "/changes/{change_id}/git-publications",
    response_model=ActivationWorkspaceResponse,
    responses={401: {"model": ErrorResponse}, 403: {"model": ErrorResponse}, 409: {"model": ErrorResponse}},
)
async def publish_git(
    change_id: ChangeId,
    request: GitPublicationRequest,
    actor_id: ActorId,
    idempotency_key: IdempotencyKey,
    container: Annotated[ApplicationContainer, Depends(get_container)],
) -> ActivationWorkspaceResponse:
    workflow = await container.review_workflow.get(change_id)
    _assert_project(workflow.project_id, request.project_id)
    updated = await container.review_workflow.publish_git(
        change_id,
        actor_id,
        PublishGitCommand(
            request.expected_base_commit_sha,
            request.proposal_revision,
            request.scope_fingerprint,
            request.implementation_revision,
        ),
        idempotency_key,
    )
    return ActivationWorkspaceResponse.from_domain(updated, container.review_workflow.actors.resolve(actor_id))


@router.post(
    "/changes/{change_id}/activations",
    response_model=ActivationWorkspaceResponse,
    responses={401: {"model": ErrorResponse}, 403: {"model": ErrorResponse}, 409: {"model": ErrorResponse}},
)
async def activate_context_version(
    change_id: ChangeId,
    request: ContextActivationRequest,
    actor_id: ActorId,
    idempotency_key: IdempotencyKey,
    container: Annotated[ApplicationContainer, Depends(get_container)],
) -> ActivationWorkspaceResponse:
    workflow = await container.review_workflow.get(change_id)
    _assert_project(workflow.project_id, request.project_id)
    updated = await container.review_workflow.activate(
        change_id,
        actor_id,
        ActivateContextCommand(request.version, request.document_ids),
        idempotency_key,
    )
    return ActivationWorkspaceResponse.from_domain(updated, container.review_workflow.actors.resolve(actor_id))
