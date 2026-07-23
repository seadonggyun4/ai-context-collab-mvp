"""API DTOs intentionally separate from domain and persistence models."""

from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel

from app.application.document_commands import DocumentValidation
from app.domain import (
    Actor,
    ChangeStatus,
    ChangeWorkflow,
    DocumentConflict,
    DocumentDetail,
    DocumentDiagnostic,
    DocumentDraft,
    DocumentSummary,
    EvidenceRecord,
    EvidenceResult,
    GateBlocker,
    Project,
    ReviewDecision,
    current_evidence,
    review_denial,
    verification_gate,
)


class ApiModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, from_attributes=True, extra="forbid")


class ProjectResponse(ApiModel):
    id: str
    name: str
    description: str
    repository_url: str
    default_branch: str
    document_root: str
    active_context_version: str
    effective_date: date
    health: str
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_domain(cls, project: Project) -> "ProjectResponse":
        return cls.model_validate(project)


class DocumentSummaryResponse(ApiModel):
    id: str
    project_id: str
    path: str
    title: str
    format: str
    revision: str
    size_bytes: int

    @classmethod
    def from_domain(cls, document: DocumentSummary) -> "DocumentSummaryResponse":
        return cls.model_validate(document)


class DocumentDetailResponse(DocumentSummaryResponse):
    source: str

    @classmethod
    def from_detail(cls, document: DocumentDetail) -> "DocumentDetailResponse":
        return cls.model_validate(document)


class DocumentListResponse(ApiModel):
    items: tuple[DocumentSummaryResponse, ...]
    total: int


class DocumentPositionResponse(ApiModel):
    line: int
    column: int


class DocumentDiagnosticResponse(ApiModel):
    severity: str
    code: str
    message: str
    from_: DocumentPositionResponse = Field(alias="from")
    to: DocumentPositionResponse | None = None

    @classmethod
    def from_domain(cls, diagnostic: DocumentDiagnostic) -> "DocumentDiagnosticResponse":
        return cls(
            severity=diagnostic.severity,
            code=diagnostic.code,
            message=diagnostic.message,
            from_=DocumentPositionResponse.model_validate(diagnostic.start),
            to=DocumentPositionResponse.model_validate(diagnostic.end) if diagnostic.end else None,
        )


class DocumentDraftRequest(ApiModel):
    content: str = Field(max_length=1_048_576)
    base_revision: str = Field(min_length=7, max_length=64, pattern=r"^[0-9a-f]+$")
    client_draft_id: str = Field(min_length=8, max_length=100, pattern=r"^[A-Za-z0-9_-]+$")


class DocumentValidationRequest(ApiModel):
    content: str = Field(max_length=1_048_576)
    base_revision: str = Field(min_length=7, max_length=64, pattern=r"^[0-9a-f]+$")


class DocumentDraftResponse(ApiModel):
    client_draft_id: str
    document_id: str
    base_revision: str
    saved_at: datetime
    valid: bool
    diagnostics: tuple[DocumentDiagnosticResponse, ...]

    @classmethod
    def from_domain(cls, draft: DocumentDraft) -> "DocumentDraftResponse":
        diagnostics = tuple(DocumentDiagnosticResponse.from_domain(item) for item in draft.diagnostics)
        return cls(
            client_draft_id=draft.client_draft_id,
            document_id=draft.document_id,
            base_revision=draft.base_revision,
            saved_at=draft.saved_at,
            valid=not any(item.severity == "ERROR" for item in draft.diagnostics),
            diagnostics=diagnostics,
        )


class DocumentValidationResponse(ApiModel):
    document_id: str
    base_revision: str
    current_revision: str
    valid: bool
    diagnostics: tuple[DocumentDiagnosticResponse, ...]

    @classmethod
    def from_domain(cls, result: DocumentValidation) -> "DocumentValidationResponse":
        return cls(
            document_id=result.document_id,
            base_revision=result.base_revision,
            current_revision=result.current_revision,
            valid=result.valid,
            diagnostics=tuple(DocumentDiagnosticResponse.from_domain(item) for item in result.diagnostics),
        )


class DocumentConflictResponse(ApiModel):
    code: str
    title: str
    detail: str
    base_revision: str
    current_revision: str
    base_source: str
    current_source: str
    draft_source: str

    @classmethod
    def from_domain(cls, conflict: DocumentConflict) -> "DocumentConflictResponse":
        return cls.model_validate(conflict)


class ErrorResponse(ApiModel):
    code: str
    title: str
    detail: str
    trace_id: str | None


class AuthPrincipalResponse(ApiModel):
    actor_id: str
    display_name: str
    role: str


class AuthSessionResponse(ApiModel):
    authenticated: bool
    principal: AuthPrincipalResponse
    csrf_token: str
    expires_at: datetime


class ReviewRequest(ApiModel):
    project_id: str
    decision: ReviewDecision
    proposal_revision: int = Field(ge=1)
    scope_fingerprint: str = Field(min_length=8, max_length=500)
    comment: str = Field(max_length=2_000)


class EvidenceRequest(ApiModel):
    project_id: str
    test_id: str = Field(min_length=3, max_length=100)
    result: EvidenceResult


class TransitionRequest(ApiModel):
    project_id: str
    target: ChangeStatus


class GitPublicationRequest(ApiModel):
    project_id: str
    expected_base_commit_sha: str = Field(min_length=40, max_length=40, pattern=r"^[0-9a-f]+$")
    proposal_revision: int = Field(ge=1)
    scope_fingerprint: str = Field(min_length=8, max_length=500)
    implementation_revision: int = Field(ge=1)


class ContextActivationRequest(ApiModel):
    project_id: str
    version: str = Field(min_length=3, max_length=100, pattern=r"^[A-Za-z0-9._-]+$")
    document_ids: tuple[str, ...] = Field(min_length=1, max_length=100)


class ActivationWorkspaceResponse(ApiModel):
    project_id: str
    change_id: str
    title: str
    status: str
    current_actor: dict[str, object]
    context_snapshot: str
    base_commit_sha: str
    proposal_revision: int
    scope_fingerprint: str
    implementation_revision: int
    document_ids: tuple[str, ...]
    evidence: tuple[dict[str, object], ...]
    publication: dict[str, object] | None
    context_version: dict[str, object] | None
    publish_capability: dict[str, object]
    activation_capability: dict[str, object]
    audit_events: tuple[dict[str, object], ...]

    @classmethod
    def from_domain(cls, workflow: ChangeWorkflow, actor: Actor) -> "ActivationWorkspaceResponse":
        publication = workflow.git_publication
        context_version = workflow.context_versions[-1] if workflow.context_versions else None
        publish_allowed = (
            workflow.status == ChangeStatus.READY_TO_ACTIVATE
            and actor.role.value in {"contributor", "reviewer", "admin"}
            and publication is None
        )
        activation_allowed = (
            workflow.status == ChangeStatus.READY_TO_ACTIVATE
            and actor.role.value == "admin"
            and publication is not None
        )
        return cls(
            project_id=workflow.project_id,
            change_id=workflow.id,
            title=workflow.title,
            status=workflow.status.value,
            current_actor=_actor_response(actor),
            context_snapshot=workflow.context_snapshot,
            base_commit_sha=workflow.base_commit_sha,
            proposal_revision=workflow.proposal_revision,
            scope_fingerprint=workflow.scope_fingerprint,
            implementation_revision=workflow.implementation_revision,
            document_ids=workflow.document_ids,
            evidence=tuple(
                response for item in current_evidence(workflow) if (response := _evidence_response(item)) is not None
            ),
            publication=None
            if publication is None
            else {
                "branch": publication.branch,
                "commitSha": publication.commit_sha,
                "pullRequestUrl": publication.pull_request_url,
                "pullRequestStatus": publication.pull_request_status,
                "proposalRevision": publication.proposal_revision,
                "scopeFingerprint": publication.scope_fingerprint,
                "implementationRevision": publication.implementation_revision,
                "baseCommitSha": publication.base_commit_sha,
                "publishedBy": publication.published_by,
                "publishedAt": publication.published_at.isoformat(),
            },
            context_version=None
            if context_version is None
            else {
                "version": context_version.version,
                "projectId": context_version.project_id,
                "changeRequestId": context_version.change_request_id,
                "documentIds": context_version.document_ids,
                "sourceCommitSha": context_version.source_commit_sha,
                "activatedBy": context_version.activated_by,
                "activatedAt": context_version.activated_at.isoformat(),
            },
            publish_capability=_capability(
                publish_allowed,
                "READY 상태의 승인된 변경과 기여자 권한이 필요합니다."
                if publication is None
                else "Git publication이 이미 생성되었습니다.",
            ),
            activation_capability=_capability(
                activation_allowed,
                "관리자 권한과 현재 Git publication이 필요합니다.",
            ),
            audit_events=tuple(
                {
                    "id": item.id,
                    "actorId": item.actor_id,
                    "action": item.action,
                    "targetType": item.target_type,
                    "targetId": item.target_id,
                    "before": item.before,
                    "after": item.after,
                    "requestId": item.request_id,
                    "occurredAt": item.occurred_at.isoformat(),
                }
                for item in workflow.audit_events
            ),
        )


class ReviewWorkspaceResponse(ApiModel):
    project_id: str
    change_id: str
    title: str
    status: str
    risk: str
    requester: dict[str, object]
    current_actor: dict[str, object]
    context_snapshot: str
    proposal_revision: int
    scope_fingerprint: str
    implementation_revision: int
    diff: dict[str, object]
    current_review: dict[str, object] | None
    evidence: tuple[dict[str, object], ...]
    verification_gate: dict[str, object]
    audit_events: tuple[dict[str, object], ...]
    decision_capabilities: dict[str, object]
    evidence_capabilities: dict[str, object]
    transition_action: dict[str, object] | None

    @classmethod
    def from_domain(cls, workflow: ChangeWorkflow, actor: Actor) -> "ReviewWorkspaceResponse":
        latest = {item.test_id: item for item in current_evidence(workflow)}
        blockers = verification_gate(workflow)
        review = workflow.current_review
        in_evidence_state = workflow.status in {ChangeStatus.IMPLEMENTING, ChangeStatus.VERIFYING}
        transition = _transition_action(workflow, blockers)
        return cls(
            project_id=workflow.project_id,
            change_id=workflow.id,
            title=workflow.title,
            status=workflow.status.value,
            risk=workflow.risk,
            requester=_actor_response(workflow.requester),
            current_actor=_actor_response(actor),
            context_snapshot=workflow.context_snapshot,
            proposal_revision=workflow.proposal_revision,
            scope_fingerprint=workflow.scope_fingerprint,
            implementation_revision=workflow.implementation_revision,
            diff={
                "baseRevision": workflow.context_snapshot,
                "targetRevision": f"proposal-r{workflow.proposal_revision}",
                "semantic": [
                    {
                        "id": item.id,
                        "section": item.section,
                        "label": item.label,
                        "before": item.before,
                        "after": item.after,
                        "changeType": item.change_type,
                    }
                    for item in workflow.semantic_diff
                ],
                "raw": {"format": "MARKDOWN", "before": workflow.raw_before, "after": workflow.raw_after},
            },
            current_review=None
            if review is None
            else {
                "id": review.id,
                "changeRequestId": review.change_request_id,
                "reviewer": _actor_response(review.reviewer),
                "decision": review.decision.value,
                "proposalRevision": review.proposal_revision,
                "scopeFingerprint": review.scope_fingerprint,
                "comment": review.comment,
                "decidedAt": review.decided_at.isoformat(),
            },
            evidence=tuple(
                {
                    "scenario": {
                        "id": scenario.id,
                        "title": scenario.title,
                        "type": scenario.type.value,
                        "required": scenario.required,
                    },
                    "evidence": _evidence_response(latest.get(scenario.id)),
                }
                for scenario in workflow.qa_scenarios
            ),
            verification_gate={
                "ready": not blockers,
                "blockers": [
                    {"code": item.code, "title": item.title, "detail": item.detail, "testId": item.test_id}
                    for item in blockers
                ],
                "currentEvidence": [_evidence_response(item) for item in latest.values()],
            },
            audit_events=tuple(
                {
                    "id": item.id,
                    "actorId": item.actor_id,
                    "action": item.action,
                    "targetType": item.target_type,
                    "targetId": item.target_id,
                    "before": item.before,
                    "after": item.after,
                    "requestId": item.request_id,
                    "occurredAt": item.occurred_at.isoformat(),
                }
                for item in workflow.audit_events
            ),
            decision_capabilities={
                decision.value: _decision_capability(workflow, actor, decision) for decision in ReviewDecision
            },
            evidence_capabilities={
                "automated": _capability(in_evidence_state, "구현 또는 검증 단계에서 실행할 수 있습니다."),
                "manual": _capability(
                    in_evidence_state and actor.role.value in {"reviewer", "admin"},
                    "수동 검증 확정은 검토자 권한이 필요합니다."
                    if in_evidence_state
                    else "구현 또는 검증 단계에서 실행할 수 있습니다.",
                ),
            },
            transition_action=transition,
        )


def _actor_response(actor: Actor) -> dict[str, object]:
    return {"id": actor.id, "displayName": actor.display_name, "role": actor.role.value}


def _evidence_response(item: EvidenceRecord | None) -> dict[str, object] | None:
    if item is None:
        return None
    return {
        "id": item.id,
        "changeRequestId": item.change_request_id,
        "testId": item.test_id,
        "type": item.type.value,
        "result": item.result.value,
        "required": item.required,
        "command": item.command,
        "artifact": item.artifact,
        "implementationRevision": item.implementation_revision,
        "verifiedBy": item.verified_by,
        "verifiedAt": item.verified_at.isoformat(),
        "commitSha": item.commit_sha,
    }


def _capability(allowed: bool, reason: str) -> dict[str, object]:
    return {"allowed": allowed, "reason": None if allowed else reason}


def _decision_capability(
    workflow: ChangeWorkflow,
    actor: Actor,
    decision: ReviewDecision,
) -> dict[str, object]:
    if workflow.status != ChangeStatus.IN_REVIEW:
        return _capability(False, "현재 변경은 검토 결정 단계가 아닙니다.")
    denial = review_denial(workflow, actor, decision)
    return _capability(denial is None, denial.detail if denial else "")


def _transition_action(workflow: ChangeWorkflow, blockers: tuple[GateBlocker, ...]) -> dict[str, object] | None:
    definitions = {
        ChangeStatus.APPROVED: (ChangeStatus.IMPLEMENTING, "구현 시작"),
        ChangeStatus.IMPLEMENTING: (ChangeStatus.VERIFYING, "검증 시작"),
        ChangeStatus.VERIFYING: (ChangeStatus.READY_TO_ACTIVATE, "활성화 준비 완료"),
    }
    definition = definitions.get(workflow.status)
    if definition is None:
        return None
    target, label = definition
    allowed = target != ChangeStatus.READY_TO_ACTIVATE or not blockers
    return {
        "target": target.value,
        "label": label,
        "allowed": allowed,
        "reason": None if allowed else blockers[0].title,
    }


class LiveResponse(ApiModel):
    status: str


class ReadinessChecks(ApiModel):
    database: str
    migration: str
    security_store: str


class ReadyResponse(ApiModel):
    status: str
    checks: ReadinessChecks
