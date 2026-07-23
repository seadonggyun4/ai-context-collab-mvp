"""Policy-first change review and verification aggregate."""

from dataclasses import dataclass, replace
from datetime import UTC, datetime
from enum import StrEnum
from typing import Any

from app.domain.errors import DomainError


class ActorRole(StrEnum):
    VIEWER = "viewer"
    CONTRIBUTOR = "contributor"
    REVIEWER = "reviewer"
    ADMIN = "admin"


class ChangeStatus(StrEnum):
    IN_REVIEW = "IN_REVIEW"
    CHANGES_REQUESTED = "CHANGES_REQUESTED"
    APPROVED = "APPROVED"
    IMPLEMENTING = "IMPLEMENTING"
    VERIFYING = "VERIFYING"
    READY_TO_ACTIVATE = "READY_TO_ACTIVATE"
    ACTIVATED = "ACTIVATED"
    REJECTED = "REJECTED"


class ReviewDecision(StrEnum):
    APPROVED = "APPROVED"
    CHANGES_REQUESTED = "CHANGES_REQUESTED"
    REJECTED = "REJECTED"


class EvidenceType(StrEnum):
    AUTOMATED = "AUTOMATED"
    MANUAL = "MANUAL"


class EvidenceResult(StrEnum):
    PASSED = "PASSED"
    FAILED = "FAILED"
    PARTIALLY_VERIFIED = "PARTIALLY_VERIFIED"
    NOT_EXECUTED = "NOT_EXECUTED"
    MANUAL_REQUIRED = "MANUAL_REQUIRED"


@dataclass(frozen=True, slots=True)
class Actor:
    id: str
    display_name: str
    role: ActorRole


@dataclass(frozen=True, slots=True)
class QaScenario:
    id: str
    title: str
    type: EvidenceType
    required: bool


@dataclass(frozen=True, slots=True)
class ReviewRecord:
    id: str
    change_request_id: str
    reviewer: Actor
    decision: ReviewDecision
    proposal_revision: int
    scope_fingerprint: str
    comment: str
    decided_at: datetime


@dataclass(frozen=True, slots=True)
class EvidenceRecord:
    id: str
    change_request_id: str
    test_id: str
    type: EvidenceType
    result: EvidenceResult
    required: bool
    command: str | None
    artifact: str | None
    implementation_revision: int
    verified_by: str
    verified_at: datetime
    commit_sha: str | None = None


@dataclass(frozen=True, slots=True)
class GitPublication:
    branch: str
    commit_sha: str
    pull_request_url: str
    pull_request_status: str
    proposal_revision: int
    scope_fingerprint: str
    implementation_revision: int
    base_commit_sha: str
    published_by: str
    published_at: datetime


@dataclass(frozen=True, slots=True)
class ContextVersionRecord:
    version: str
    project_id: str
    change_request_id: str
    document_ids: tuple[str, ...]
    source_commit_sha: str
    activated_by: str
    activated_at: datetime


@dataclass(frozen=True, slots=True)
class AuditRecord:
    id: str
    change_request_id: str
    actor_id: str
    action: str
    target_type: str
    target_id: str
    before: dict[str, Any]
    after: dict[str, Any]
    request_id: str
    occurred_at: datetime


@dataclass(frozen=True, slots=True)
class SemanticDiff:
    id: str
    section: str
    label: str
    before: str | None
    after: str | None
    change_type: str


@dataclass(frozen=True, slots=True)
class GateBlocker:
    code: str
    title: str
    detail: str
    test_id: str | None


@dataclass(frozen=True, slots=True)
class ChangeWorkflow:
    id: str
    project_id: str
    title: str
    status: ChangeStatus
    risk: str
    requester: Actor
    context_snapshot: str
    proposal_revision: int
    scope_fingerprint: str
    implementation_revision: int
    qa_scenarios: tuple[QaScenario, ...]
    semantic_diff: tuple[SemanticDiff, ...]
    raw_before: str
    raw_after: str
    current_review: ReviewRecord | None = None
    evidence: tuple[EvidenceRecord, ...] = ()
    audit_events: tuple[AuditRecord, ...] = ()
    storage_revision: int = 1
    base_commit_sha: str = ""
    document_ids: tuple[str, ...] = ()
    git_publication: GitPublication | None = None
    context_versions: tuple[ContextVersionRecord, ...] = ()


def policy_error(code: str, title: str, detail: str, status_code: int = 409) -> DomainError:
    return DomainError(code=code, title=title, detail=detail, status_code=status_code)


def role_at_least(actor: Actor, required: ActorRole) -> bool:
    rank = {ActorRole.VIEWER: 0, ActorRole.CONTRIBUTOR: 1, ActorRole.REVIEWER: 2, ActorRole.ADMIN: 3}
    return rank[actor.role] >= rank[required]


def review_denial(workflow: ChangeWorkflow, actor: Actor, decision: ReviewDecision) -> DomainError | None:
    if decision == ReviewDecision.APPROVED:
        if actor.id == workflow.requester.id:
            return policy_error(
                "SELF_APPROVAL_FORBIDDEN",
                "본인 요청은 승인할 수 없습니다",
                "다른 승인권자의 검토가 필요합니다.",
                403,
            )
        required = ActorRole.ADMIN if workflow.risk == "HIGH" else ActorRole.REVIEWER
        if not role_at_least(actor, required):
            detail = (
                "고위험 변경은 관리자만 승인할 수 있습니다."
                if workflow.risk == "HIGH"
                else "검토자 이상의 권한이 필요합니다."
            )
            return policy_error("REVIEW_PERMISSION_DENIED", "승인 권한이 없습니다", detail, 403)
    elif decision == ReviewDecision.CHANGES_REQUESTED and not role_at_least(actor, ActorRole.CONTRIBUTOR):
        return policy_error(
            "REVIEW_PERMISSION_DENIED", "수정 요청 권한이 없습니다", "기여자 이상의 권한이 필요합니다.", 403
        )
    elif decision == ReviewDecision.REJECTED and not role_at_least(actor, ActorRole.REVIEWER):
        return policy_error("REVIEW_PERMISSION_DENIED", "반려 권한이 없습니다", "검토자 이상의 권한이 필요합니다.", 403)
    return None


def _audit(
    workflow: ChangeWorkflow,
    actor: Actor,
    action: str,
    target_type: str,
    target_id: str,
    before: dict[str, Any],
    after: dict[str, Any],
    request_id: str,
    occurred_at: datetime,
) -> AuditRecord:
    return AuditRecord(
        id=f"{request_id}:{action}",
        change_request_id=workflow.id,
        actor_id=actor.id,
        action=action,
        target_type=target_type,
        target_id=target_id,
        before=before,
        after=after,
        request_id=request_id,
        occurred_at=occurred_at,
    )


def record_review(
    workflow: ChangeWorkflow,
    actor: Actor,
    decision: ReviewDecision,
    proposal_revision: int,
    scope_fingerprint: str,
    comment: str,
    request_id: str,
    occurred_at: datetime,
) -> ChangeWorkflow:
    if workflow.status != ChangeStatus.IN_REVIEW:
        raise policy_error("REVIEW_STATE_INVALID", "현재 상태에서는 검토할 수 없습니다", "검토 중 상태인지 확인하세요.")
    if not comment.strip():
        raise policy_error(
            "REVIEW_COMMENT_REQUIRED", "검토 의견이 필요합니다", "결정의 이유와 후속 조치를 입력하세요.", 422
        )
    if proposal_revision != workflow.proposal_revision or scope_fingerprint != workflow.scope_fingerprint:
        raise policy_error(
            "REVIEW_SCOPE_STALE", "검토 범위가 최신 제안과 다릅니다", "최신 revision의 변경 범위를 다시 검토하세요."
        )
    denial = review_denial(workflow, actor, decision)
    if denial is not None:
        raise denial
    review = ReviewRecord(
        id=f"review-{request_id}",
        change_request_id=workflow.id,
        reviewer=actor,
        decision=decision,
        proposal_revision=proposal_revision,
        scope_fingerprint=scope_fingerprint,
        comment=comment.strip(),
        decided_at=occurred_at,
    )
    review_audit = _audit(
        workflow,
        actor,
        "review.recorded",
        "REVIEW",
        review.id,
        {},
        {"decision": decision.value, "proposalRevision": proposal_revision},
        request_id,
        occurred_at,
    )
    transition_audit = _audit(
        workflow,
        actor,
        "change.status_transitioned",
        "CHANGE_REQUEST",
        workflow.id,
        {"status": workflow.status.value},
        {"status": decision.value},
        f"{request_id}-transition",
        occurred_at,
    )
    return replace(
        workflow,
        status=ChangeStatus(decision.value),
        current_review=review,
        audit_events=(*workflow.audit_events, review_audit, transition_audit),
        storage_revision=workflow.storage_revision + 1,
    )


def current_evidence(workflow: ChangeWorkflow) -> tuple[EvidenceRecord, ...]:
    latest: dict[str, EvidenceRecord] = {}
    for item in workflow.evidence:
        if item.implementation_revision == workflow.implementation_revision:
            latest[item.test_id] = item
    return tuple(latest.values())


def verification_gate(workflow: ChangeWorkflow) -> tuple[GateBlocker, ...]:
    blockers: list[GateBlocker] = []
    if (
        workflow.current_review is None
        or workflow.current_review.proposal_revision != workflow.proposal_revision
        or workflow.current_review.scope_fingerprint != workflow.scope_fingerprint
    ):
        blockers.append(
            GateBlocker(
                "IMPLEMENTATION_SCOPE_MISMATCH",
                "구현 범위가 승인 범위와 다릅니다",
                "최신 범위를 다시 검토하고 승인하세요.",
                None,
            )
        )
    evidence_by_test = {item.test_id: item for item in current_evidence(workflow)}
    for scenario in workflow.qa_scenarios:
        if not scenario.required:
            continue
        evidence = evidence_by_test.get(scenario.id)
        if evidence is None or evidence.result == EvidenceResult.NOT_EXECUTED:
            blockers.append(
                GateBlocker(
                    "REQUIRED_EVIDENCE_NOT_EXECUTED",
                    "필수 검증이 실행되지 않았습니다",
                    f"{scenario.id} 검증을 현재 구현 revision에서 실행하세요.",
                    scenario.id,
                )
            )
        elif evidence.result == EvidenceResult.FAILED:
            blockers.append(
                GateBlocker(
                    "REQUIRED_EVIDENCE_FAILED",
                    "필수 검증이 실패했습니다",
                    f"{scenario.id} 실패를 해결하고 다시 검증하세요.",
                    scenario.id,
                )
            )
        elif evidence.result == EvidenceResult.PARTIALLY_VERIFIED:
            blockers.append(
                GateBlocker(
                    "REQUIRED_EVIDENCE_INCOMPLETE",
                    "필수 검증이 일부만 확인됐습니다",
                    f"{scenario.id} 전체 범위를 검증하세요.",
                    scenario.id,
                )
            )
        elif evidence.result == EvidenceResult.MANUAL_REQUIRED:
            blockers.append(
                GateBlocker(
                    "MANUAL_CHECK_UNRESOLVED",
                    "수동 확인이 남아 있습니다",
                    f"{scenario.id} 수동 확인을 검토자가 확정해야 합니다.",
                    scenario.id,
                )
            )
    return tuple(blockers)


def record_evidence(
    workflow: ChangeWorkflow,
    actor: Actor,
    test_id: str,
    result: EvidenceResult,
    request_id: str,
    occurred_at: datetime,
) -> ChangeWorkflow:
    if workflow.status not in {ChangeStatus.IMPLEMENTING, ChangeStatus.VERIFYING}:
        raise policy_error(
            "EVIDENCE_STATE_INVALID",
            "현재 상태에서는 검증 근거를 기록할 수 없습니다",
            "구현 또는 검증 상태에서 실행하세요.",
        )
    if not role_at_least(actor, ActorRole.CONTRIBUTOR):
        raise policy_error(
            "EVIDENCE_PERMISSION_DENIED",
            "검증 근거를 기록할 권한이 없습니다",
            "기여자 이상의 권한 또는 등록된 자동 검증 실행자가 필요합니다.",
            403,
        )
    scenario = next((item for item in workflow.qa_scenarios if item.id == test_id), None)
    if scenario is None:
        raise policy_error(
            "EVIDENCE_SCENARIO_MISMATCH",
            "승인된 검증 항목이 아닙니다",
            "현재 proposal의 QA 시나리오를 확인하세요.",
            422,
        )
    if (
        scenario.type == EvidenceType.MANUAL
        and result == EvidenceResult.PASSED
        and not role_at_least(actor, ActorRole.REVIEWER)
    ):
        raise policy_error(
            "MANUAL_EVIDENCE_PERMISSION_DENIED",
            "수동 검증을 확정할 권한이 없습니다",
            "검토자 이상의 확인이 필요합니다.",
            403,
        )
    evidence = EvidenceRecord(
        id=f"evidence-{request_id}",
        change_request_id=workflow.id,
        test_id=test_id,
        type=scenario.type,
        result=result,
        required=scenario.required,
        command="npm test -- --run review-verification" if scenario.type == EvidenceType.AUTOMATED else None,
        artifact="fixture://test-report/review-verification"
        if scenario.type == EvidenceType.AUTOMATED
        else "fixture://manual/review-verification",
        implementation_revision=workflow.implementation_revision,
        verified_by=actor.id,
        verified_at=occurred_at,
    )
    audit = _audit(
        workflow,
        actor,
        "evidence.recorded",
        "EVIDENCE",
        evidence.id,
        {},
        {"testId": test_id, "result": result.value, "implementationRevision": workflow.implementation_revision},
        request_id,
        occurred_at,
    )
    return replace(
        workflow,
        evidence=(*workflow.evidence, evidence),
        audit_events=(*workflow.audit_events, audit),
        storage_revision=workflow.storage_revision + 1,
    )


def transition_workflow(
    workflow: ChangeWorkflow,
    actor: Actor,
    target: ChangeStatus,
    request_id: str,
    occurred_at: datetime,
) -> ChangeWorkflow:
    allowed = {
        ChangeStatus.APPROVED: ChangeStatus.IMPLEMENTING,
        ChangeStatus.IMPLEMENTING: ChangeStatus.VERIFYING,
        ChangeStatus.VERIFYING: ChangeStatus.READY_TO_ACTIVATE,
    }
    if allowed.get(workflow.status) != target:
        raise policy_error(
            "TRANSITION_FORBIDDEN",
            "허용되지 않은 상태 전이입니다",
            f"{workflow.status.value}에서 {target.value}(으)로 이동할 수 없습니다.",
        )
    required_role = ActorRole.REVIEWER if target == ChangeStatus.READY_TO_ACTIVATE else ActorRole.CONTRIBUTOR
    if not role_at_least(actor, required_role):
        raise policy_error(
            "TRANSITION_PERMISSION_DENIED",
            "상태를 변경할 권한이 없습니다",
            f"{required_role.value} 이상의 역할이 필요합니다.",
            403,
        )
    if target == ChangeStatus.READY_TO_ACTIVATE:
        blockers = verification_gate(workflow)
        if blockers:
            blocker = blockers[0]
            raise policy_error(blocker.code, blocker.title, blocker.detail)
    implementation_revision = (
        workflow.implementation_revision + 1
        if target == ChangeStatus.IMPLEMENTING
        else workflow.implementation_revision
    )
    audit = _audit(
        workflow,
        actor,
        "change.status_transitioned",
        "CHANGE_REQUEST",
        workflow.id,
        {"status": workflow.status.value},
        {"status": target.value},
        request_id,
        occurred_at,
    )
    return replace(
        workflow,
        status=target,
        implementation_revision=implementation_revision,
        audit_events=(*workflow.audit_events, audit),
        storage_revision=workflow.storage_revision + 1,
    )


def validate_git_publication(
    workflow: ChangeWorkflow,
    actor: Actor,
    *,
    expected_base_commit_sha: str,
    proposal_revision: int,
    scope_fingerprint: str,
    implementation_revision: int,
) -> None:
    if workflow.status != ChangeStatus.READY_TO_ACTIVATE:
        raise policy_error(
            "GIT_PUBLICATION_STATE_INVALID",
            "Git 반영을 시작할 수 없는 상태입니다",
            "필수 검증을 통과해 활성화 준비 상태가 된 뒤 다시 시도하세요.",
        )
    if not role_at_least(actor, ActorRole.CONTRIBUTOR):
        raise policy_error(
            "GIT_PUBLICATION_PERMISSION_DENIED",
            "Git 반영 권한이 없습니다",
            "기여자 이상의 역할이 필요합니다.",
            403,
        )
    if workflow.current_review is None or workflow.current_review.decision != ReviewDecision.APPROVED:
        raise policy_error("APPROVAL_REQUIRED", "승인된 제안이 없습니다", "최신 제안을 승인한 뒤 다시 시도하세요.")
    if (
        proposal_revision != workflow.proposal_revision
        or scope_fingerprint != workflow.scope_fingerprint
        or implementation_revision != workflow.implementation_revision
    ):
        raise policy_error(
            "PUBLICATION_REVISION_STALE",
            "Git 반영 범위가 최신 구현과 다릅니다",
            "최신 proposal, scope와 implementation revision을 다시 확인하세요.",
        )
    if expected_base_commit_sha != workflow.base_commit_sha:
        raise policy_error(
            "GIT_BASE_REVISION_STALE",
            "기준 Git revision이 변경되었습니다",
            "최신 base commit을 확인하고 변경 범위를 다시 검토하세요.",
        )
    blockers = verification_gate(workflow)
    if blockers:
        blocker = blockers[0]
        raise policy_error(blocker.code, blocker.title, blocker.detail)


def record_git_publication(
    workflow: ChangeWorkflow,
    actor: Actor,
    publication: GitPublication,
    request_id: str,
    occurred_at: datetime,
) -> ChangeWorkflow:
    linked_evidence = tuple(
        replace(item, commit_sha=publication.commit_sha)
        if item.implementation_revision == workflow.implementation_revision
        else item
        for item in workflow.evidence
    )
    audit = _audit(
        workflow,
        actor,
        "git.publication_created",
        "CHANGE_REQUEST",
        workflow.id,
        {},
        {"branch": publication.branch, "commitSha": publication.commit_sha},
        request_id,
        occurred_at,
    )
    return replace(
        workflow,
        evidence=linked_evidence,
        git_publication=publication,
        audit_events=(*workflow.audit_events, audit),
        storage_revision=workflow.storage_revision + 1,
    )


def activate_context(
    workflow: ChangeWorkflow,
    actor: Actor,
    *,
    version: str,
    document_ids: tuple[str, ...],
    request_id: str,
    occurred_at: datetime,
) -> ChangeWorkflow:
    if workflow.status != ChangeStatus.READY_TO_ACTIVATE:
        raise policy_error(
            "ACTIVATION_STATE_INVALID", "Context를 활성화할 수 없는 상태입니다", "활성화 준비 상태인지 확인하세요."
        )
    if actor.role != ActorRole.ADMIN:
        raise policy_error(
            "ACTIVATION_PERMISSION_DENIED", "Context 활성화 권한이 없습니다", "관리자 권한이 필요합니다.", 403
        )
    publication = workflow.git_publication
    if publication is None:
        raise policy_error(
            "GIT_PUBLICATION_REQUIRED", "Git 반영 결과가 없습니다", "승인된 범위를 Git에 반영한 뒤 활성화하세요."
        )
    if not version.strip() or not document_ids:
        raise policy_error(
            "CONTEXT_VERSION_REQUIRED",
            "Context version과 문서가 필요합니다",
            "활성화할 version과 문서를 지정하세요.",
            422,
        )
    if any(item.version == version for item in workflow.context_versions):
        raise policy_error("CONTEXT_VERSION_EXISTS", "이미 존재하는 Context version입니다", "새 version을 사용하세요.")
    required_test_ids = {item.id for item in workflow.qa_scenarios if item.required}
    linked_test_ids = {
        item.test_id
        for item in current_evidence(workflow)
        if item.result == EvidenceResult.PASSED and item.commit_sha == publication.commit_sha
    }
    if not required_test_ids.issubset(linked_test_ids):
        raise policy_error(
            "EVIDENCE_COMMIT_MISMATCH",
            "검증 근거와 Git commit이 일치하지 않습니다",
            "현재 publication commit에서 필수 검증을 다시 연결하세요.",
        )
    context_version = ContextVersionRecord(
        version=version.strip(),
        project_id=workflow.project_id,
        change_request_id=workflow.id,
        document_ids=document_ids,
        source_commit_sha=publication.commit_sha,
        activated_by=actor.id,
        activated_at=occurred_at,
    )
    activation_audit = _audit(
        workflow,
        actor,
        "context.activated",
        "CONTEXT_VERSION",
        context_version.version,
        {},
        {"version": context_version.version, "commitSha": publication.commit_sha},
        request_id,
        occurred_at,
    )
    transition_audit = _audit(
        workflow,
        actor,
        "change.status_transitioned",
        "CHANGE_REQUEST",
        workflow.id,
        {"status": workflow.status.value},
        {"status": ChangeStatus.ACTIVATED.value},
        f"{request_id}-transition",
        occurred_at,
    )
    return replace(
        workflow,
        status=ChangeStatus.ACTIVATED,
        context_versions=(*workflow.context_versions, context_version),
        audit_events=(*workflow.audit_events, activation_audit, transition_audit),
        storage_revision=workflow.storage_revision + 1,
    )


def demo_workflow() -> ChangeWorkflow:
    requester = Actor("user-planning-01", "기획 담당자", ActorRole.CONTRIBUTOR)
    scenarios = (
        QaScenario("QA-DEMO-AUTO-01", "24시간 경계 상태 계산", EvidenceType.AUTOMATED, True),
        QaScenario("QA-DEMO-MANUAL-01", "목록 시각 위계와 경고 식별", EvidenceType.MANUAL, True),
    )
    semantic = (
        SemanticDiff(
            "diff-summary",
            "SUMMARY",
            "변경 요약",
            "APC 수신 상태와 지연 여부를 표시합니다.",
            "APC별 최근 정상 수신 시간과 24시간 경고를 표시합니다.",
            "UPDATED",
        ),
        SemanticDiff(
            "diff-ac-01",
            "ACCEPTANCE",
            "P0 AC-DEMO-01",
            None,
            "각 APC의 최근 정상 수신 시간이 목록에 표시된다.",
            "ADDED",
        ),
        SemanticDiff(
            "diff-ac-02",
            "ACCEPTANCE",
            "P0 AC-DEMO-02",
            None,
            "마지막 정상 수신 후 24시간 이상이면 경고 상태가 표시된다.",
            "ADDED",
        ),
        SemanticDiff(
            "diff-file-frontend",
            "FILE",
            "frontend/src/features/monitoring",
            None,
            "목록 열과 경고 표현 추가",
            "ADDED",
        ),
        SemanticDiff(
            "diff-file-backend",
            "FILE",
            "backend/app/api/monitoring.py",
            None,
            "최근 정상 수신 필드 제공",
            "ADDED",
        ),
        SemanticDiff(
            "diff-file-qa",
            "FILE",
            "docs/apc-monitoring-mvp/roles/qa",
            None,
            "24시간 경계 시나리오 추가",
            "ADDED",
        ),
        SemanticDiff(
            "diff-qa-auto",
            "QA",
            "24시간 경계 상태 계산",
            None,
            "AUTOMATED · 필수",
            "ADDED",
        ),
        SemanticDiff(
            "diff-qa-manual",
            "QA",
            "목록 시각 위계와 경고 식별",
            None,
            "MANUAL · 필수",
            "ADDED",
        ),
    )
    return ChangeWorkflow(
        id="CR-DEMO-001",
        project_id="apc-monitoring-mvp",
        title="최근 정상 수신 시간과 24시간 경고 추가",
        status=ChangeStatus.IN_REVIEW,
        risk="MEDIUM",
        requester=requester,
        context_snapshot="context-v1.3",
        proposal_revision=1,
        scope_fingerprint="revision=1|scope=apc-monitoring-last-received-at-v1",
        implementation_revision=0,
        qa_scenarios=scenarios,
        semantic_diff=semantic,
        raw_before="## 모니터링 목록\n\n- APC 수신 상태와 지연 여부를 표시한다.\n",
        raw_after=(
            "## 모니터링 목록\n\n"
            "- APC별 최근 정상 수신 시간을 표시한다.\n"
            "- 마지막 정상 수신 후 24시간 이상이면 경고한다.\n"
        ),
        audit_events=(
            AuditRecord(
                id="fixture-review-open:change.status_transitioned",
                change_request_id="CR-DEMO-001",
                actor_id=requester.id,
                action="change.status_transitioned",
                target_type="CHANGE_REQUEST",
                target_id="CR-DEMO-001",
                before={"status": "ANALYZED"},
                after={"status": "IN_REVIEW"},
                request_id="fixture-review-open",
                occurred_at=datetime(2026, 7, 23, 0, 30, tzinfo=UTC),
            ),
        ),
        base_commit_sha="a" * 40,
        document_ids=("DOC-APC-CONTEXT", "DOC-APC-QA"),
    )
