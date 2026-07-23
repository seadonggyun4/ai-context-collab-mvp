"""Policy counterexamples for the review workflow aggregate."""

from dataclasses import replace
from datetime import UTC, datetime

import pytest
from app.domain import (
    Actor,
    ActorRole,
    ChangeStatus,
    DomainError,
    EvidenceResult,
    ReviewDecision,
    demo_workflow,
    record_evidence,
    record_review,
    transition_workflow,
    verification_gate,
)

NOW = datetime(2026, 7, 23, 12, tzinfo=UTC)


def test_self_approval_is_forbidden() -> None:
    workflow = demo_workflow()
    with pytest.raises(DomainError) as raised:
        record_review(
            workflow,
            workflow.requester,
            ReviewDecision.APPROVED,
            workflow.proposal_revision,
            workflow.scope_fingerprint,
            "승인",
            "unit-self-review",
            NOW,
        )
    assert raised.value.code == "SELF_APPROVAL_FORBIDDEN"
    assert raised.value.status_code == 403


def test_high_risk_approval_requires_admin() -> None:
    workflow = replace(demo_workflow(), risk="HIGH")
    with pytest.raises(DomainError) as raised:
        record_review(
            workflow,
            Actor("reviewer", "검토자", ActorRole.REVIEWER),
            ReviewDecision.APPROVED,
            workflow.proposal_revision,
            workflow.scope_fingerprint,
            "고위험 승인",
            "unit-high-risk",
            NOW,
        )
    assert raised.value.code == "REVIEW_PERMISSION_DENIED"


def test_manual_evidence_requires_reviewer_and_current_revision() -> None:
    workflow = demo_workflow()
    reviewer = Actor("reviewer", "검토자", ActorRole.REVIEWER)
    approved = record_review(
        workflow,
        reviewer,
        ReviewDecision.APPROVED,
        workflow.proposal_revision,
        workflow.scope_fingerprint,
        "범위 확인",
        "unit-approved",
        NOW,
    )
    implementing = transition_workflow(approved, reviewer, ChangeStatus.IMPLEMENTING, "unit-implement", NOW)
    with pytest.raises(DomainError) as raised:
        record_evidence(
            implementing,
            Actor("contributor", "기여자", ActorRole.CONTRIBUTOR),
            "QA-DEMO-MANUAL-01",
            EvidenceResult.PASSED,
            "unit-manual-denied",
            NOW,
        )
    assert raised.value.code == "MANUAL_EVIDENCE_PERMISSION_DENIED"


def test_viewer_cannot_record_evidence_or_transition() -> None:
    workflow = demo_workflow()
    reviewer = Actor("reviewer", "검토자", ActorRole.REVIEWER)
    viewer = Actor("viewer", "조회자", ActorRole.VIEWER)
    approved = record_review(
        workflow,
        reviewer,
        ReviewDecision.APPROVED,
        workflow.proposal_revision,
        workflow.scope_fingerprint,
        "범위 확인",
        "unit-viewer-review",
        NOW,
    )
    with pytest.raises(DomainError) as transition_error:
        transition_workflow(approved, viewer, ChangeStatus.IMPLEMENTING, "unit-viewer-transition", NOW)
    assert transition_error.value.code == "TRANSITION_PERMISSION_DENIED"

    implementing = transition_workflow(approved, reviewer, ChangeStatus.IMPLEMENTING, "unit-reviewer-transition", NOW)
    with pytest.raises(DomainError) as evidence_error:
        record_evidence(
            implementing,
            viewer,
            "QA-DEMO-AUTO-01",
            EvidenceResult.PASSED,
            "unit-viewer-evidence",
            NOW,
        )
    assert evidence_error.value.code == "EVIDENCE_PERMISSION_DENIED"


def test_ready_gate_reports_all_required_blockers() -> None:
    workflow = demo_workflow()
    reviewer = Actor("reviewer", "검토자", ActorRole.REVIEWER)
    approved = record_review(
        workflow,
        reviewer,
        ReviewDecision.APPROVED,
        workflow.proposal_revision,
        workflow.scope_fingerprint,
        "범위 확인",
        "unit-gate-review",
        NOW,
    )
    implementing = transition_workflow(approved, reviewer, ChangeStatus.IMPLEMENTING, "unit-gate-implement", NOW)
    verifying = transition_workflow(implementing, reviewer, ChangeStatus.VERIFYING, "unit-gate-verify", NOW)
    blockers = verification_gate(verifying)
    assert [item.test_id for item in blockers] == ["QA-DEMO-AUTO-01", "QA-DEMO-MANUAL-01"]
    with pytest.raises(DomainError) as raised:
        transition_workflow(verifying, reviewer, ChangeStatus.READY_TO_ACTIVATE, "unit-gate-ready", NOW)
    assert raised.value.code == "REQUIRED_EVIDENCE_NOT_EXECUTED"
