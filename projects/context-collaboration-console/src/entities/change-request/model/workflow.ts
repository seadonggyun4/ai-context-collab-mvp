import { getProposalScopeFingerprint, type Proposal } from "@entities/proposal";
import {
  getReviewDecisionCapability,
  hasPermission,
  type Actor,
  type Review,
  type ReviewDecision,
} from "@entities/review";
import { domainFailure, domainSuccess, type DomainResult } from "@shared/lib/result";

import {
  selectCurrentProposal,
  selectCurrentReview,
  selectVerificationGate,
} from "./selectors";
import { isTerminalChangeStatus, isTransitionAllowed } from "./workflow-policy";

import type { ChangeRequestAggregate, ChangeStatus } from "./change-request";
import type { AuditEvent } from "@entities/audit";
import type { ContextVersion } from "@entities/context-version";
import type { Evidence } from "@entities/evidence";

interface CommandMetadata {
  actor: Actor;
  requestId: string;
  occurredAt: string;
}

export interface RecordReviewCommand extends CommandMetadata {
  id: string;
  decision: ReviewDecision;
  proposalRevision: number;
  scopeFingerprint: string;
  comment: string;
  allowFixtureSelfApproval?: boolean;
}

export interface RecordEvidenceCommand extends CommandMetadata {
  evidence: Evidence;
}

export interface AddProposalCommand extends CommandMetadata {
  proposal: Proposal;
}

export interface ActivationInput {
  version: string;
  documentIds: readonly string[];
}

export interface TransitionCommand extends CommandMetadata {
  target: ChangeStatus;
  activation?: ActivationInput;
}

function createAuditEvent(
  command: CommandMetadata,
  action: string,
  targetType: AuditEvent["targetType"],
  targetId: string,
  before: Readonly<Record<string, unknown>>,
  after: Readonly<Record<string, unknown>>,
): AuditEvent {
  return {
    id: `${command.requestId}:${action}`,
    actorId: command.actor.id,
    action,
    targetType,
    targetId,
    before,
    after,
    requestId: command.requestId,
    occurredAt: command.occurredAt,
  };
}

function validateReviewPermission(
  aggregate: ChangeRequestAggregate,
  command: RecordReviewCommand,
): DomainResult<true> {
  const fixtureSelfApprovalAllowed = command.allowFixtureSelfApproval === true
    && aggregate.request.id === "CR-DEMO-001"
    && aggregate.request.projectId === "apc-monitoring-mvp";
  const capability = getReviewDecisionCapability(command.actor, command.decision, {
    requesterId: aggregate.request.requester.id,
    risk: aggregate.request.risk,
    fixtureSelfApprovalAllowed,
  });
  return capability.allowed
    ? domainSuccess(true)
    : domainFailure(capability.code, capability.title, capability.detail);
}

export function addProposalRevision(
  aggregate: ChangeRequestAggregate,
  command: AddProposalCommand,
): DomainResult<ChangeRequestAggregate> {
  if (aggregate.request.status !== "ANALYZED" && aggregate.request.status !== "CHANGES_REQUESTED") {
    return domainFailure("PROPOSAL_REVISION_LOCKED", "제안 범위가 잠겨 있습니다", "수정 요청 상태로 되돌린 뒤 새 제안을 작성하세요.");
  }
  const current = selectCurrentProposal(aggregate);
  if (current !== null && command.proposal.revision <= current.revision) {
    return domainFailure("PROPOSAL_REVISION_INVALID", "제안 revision이 유효하지 않습니다", "현재 revision보다 큰 값을 사용하세요.");
  }

  const audit = createAuditEvent(
    command,
    "proposal.revision_added",
    "CHANGE_REQUEST",
    aggregate.request.id,
    { proposalRevision: current?.revision ?? null },
    { proposalRevision: command.proposal.revision },
  );
  return domainSuccess({
    ...aggregate,
    request: { ...aggregate.request, risk: command.proposal.risk, updatedAt: command.occurredAt },
    proposals: [...aggregate.proposals, command.proposal],
    auditEvents: [...aggregate.auditEvents, audit],
  });
}

export function recordReview(
  aggregate: ChangeRequestAggregate,
  command: RecordReviewCommand,
): DomainResult<ChangeRequestAggregate> {
  if (aggregate.request.status !== "IN_REVIEW") {
    return domainFailure("REVIEW_STATE_INVALID", "현재 상태에서는 검토할 수 없습니다", "검토 중 상태인지 확인하세요.");
  }
  if (command.comment.trim() === "") {
    return domainFailure("REVIEW_COMMENT_REQUIRED", "검토 의견이 필요합니다", "결정의 이유와 후속 조치를 입력하세요.");
  }
  const proposal = selectCurrentProposal(aggregate);
  if (proposal === null) {
    return domainFailure("PROPOSAL_REQUIRED", "검토할 제안이 없습니다", "분석 제안을 먼저 생성하세요.");
  }
  if (
    command.proposalRevision !== proposal.revision
    || command.scopeFingerprint !== getProposalScopeFingerprint(proposal)
  ) {
    return domainFailure("REVIEW_SCOPE_STALE", "검토 범위가 최신 제안과 다릅니다", "최신 revision의 변경 범위를 다시 검토하세요.");
  }

  const permission = validateReviewPermission(aggregate, command);
  if (!permission.ok) return permission;

  const review: Review = {
    id: command.id,
    changeRequestId: aggregate.request.id,
    reviewer: command.actor,
    decision: command.decision,
    proposalRevision: command.proposalRevision,
    scopeFingerprint: command.scopeFingerprint,
    comment: command.comment,
    decidedAt: command.occurredAt,
  };
  const audit = createAuditEvent(
    command,
    "review.recorded",
    "REVIEW",
    review.id,
    {},
    { decision: review.decision, proposalRevision: review.proposalRevision },
  );
  return domainSuccess({
    ...aggregate,
    reviews: [...aggregate.reviews, review],
    auditEvents: [...aggregate.auditEvents, audit],
  });
}

export function recordEvidence(
  aggregate: ChangeRequestAggregate,
  command: RecordEvidenceCommand,
): DomainResult<ChangeRequestAggregate> {
  if (aggregate.request.status !== "IMPLEMENTING" && aggregate.request.status !== "VERIFYING") {
    return domainFailure("EVIDENCE_STATE_INVALID", "현재 상태에서는 검증 근거를 기록할 수 없습니다", "구현 또는 검증 상태에서 실행하세요.");
  }
  const { evidence } = command;
  if (evidence.changeRequestId !== aggregate.request.id) {
    return domainFailure("EVIDENCE_CHANGE_MISMATCH", "검증 대상이 변경 요청과 다릅니다", "검증 근거의 변경 요청 ID를 확인하세요.");
  }
  if (evidence.implementationRevision !== aggregate.implementation.revision) {
    return domainFailure("EVIDENCE_REVISION_STALE", "이전 구현의 검증 근거입니다", "현재 구현 revision에서 검증을 다시 실행하세요.");
  }
  const proposal = selectCurrentProposal(aggregate);
  const scenario = proposal?.qaScenarios.find(({ id }) => id === evidence.testId);
  if (scenario === undefined || scenario.type !== evidence.type || scenario.required !== evidence.required) {
    return domainFailure("EVIDENCE_SCENARIO_MISMATCH", "제안에 없는 검증 근거입니다", "승인된 QA 시나리오와 유형·필수 여부를 확인하세요.");
  }
  if (
    evidence.type === "MANUAL"
    && evidence.result === "PASSED"
    && !hasPermission(command.actor, "evidence.accept_manual")
  ) {
    return domainFailure("MANUAL_EVIDENCE_PERMISSION_DENIED", "수동 검증을 확정할 권한이 없습니다", "검토자 이상의 확인이 필요합니다.");
  }
  if (evidence.type === "MANUAL" && evidence.verifiedBy !== command.actor.id) {
    return domainFailure("MANUAL_EVIDENCE_ACTOR_MISMATCH", "수동 검증자 정보가 일치하지 않습니다", "인증된 실행자와 검증자 ID를 동일하게 기록하세요.");
  }

  const audit = createAuditEvent(
    command,
    "evidence.recorded",
    "EVIDENCE",
    evidence.id,
    {},
    { testId: evidence.testId, result: evidence.result, implementationRevision: evidence.implementationRevision },
  );
  return domainSuccess({
    ...aggregate,
    evidence: [...aggregate.evidence, evidence],
    auditEvents: [...aggregate.auditEvents, audit],
  });
}

function validateInReview(aggregate: ChangeRequestAggregate): DomainResult<true> {
  const proposal = selectCurrentProposal(aggregate);
  if (proposal === null || proposal.acceptanceCriteria.length === 0) {
    return domainFailure("ACCEPTANCE_CRITERIA_REQUIRED", "수용 기준이 필요합니다", "검토 전에 하나 이상의 수용 기준을 작성하세요.");
  }
  if (!proposal.contextSnapshotLocked) {
    return domainFailure("CONTEXT_SNAPSHOT_UNLOCKED", "Context 기준이 고정되지 않았습니다", "검토 대상 Context snapshot을 잠그세요.");
  }
  if (proposal.impacts.length === 0 || proposal.impacts.some(({ reviewable }) => !reviewable)) {
    return domainFailure("IMPACTS_NOT_REVIEWABLE", "영향 범위를 검토할 수 없습니다", "모든 영향 항목의 근거와 경로를 확정하세요.");
  }
  return domainSuccess(true);
}

function validateReviewDecision(
  aggregate: ChangeRequestAggregate,
  expectedDecision: ReviewDecision,
): DomainResult<true> {
  const review = selectCurrentReview(aggregate);
  if (review === null || review.decision !== expectedDecision) {
    return domainFailure("REVIEW_DECISION_REQUIRED", "현재 범위의 검토 결정이 없습니다", "최신 제안 범위를 검토하고 결정을 기록하세요.");
  }
  return domainSuccess(true);
}

function validateReadyToActivate(aggregate: ChangeRequestAggregate): DomainResult<true> {
  const blocker = selectVerificationGate(aggregate).blockers[0];
  return blocker === undefined
    ? domainSuccess(true)
    : domainFailure(blocker.code, blocker.title, blocker.detail);
}

function validateActivation(
  aggregate: ChangeRequestAggregate,
  command: TransitionCommand,
): DomainResult<ActivationInput> {
  if (!hasPermission(command.actor, "context.activate")) {
    return domainFailure("ACTIVATION_PERMISSION_DENIED", "Context 활성화 권한이 없습니다", "관리자 승인이 필요합니다.");
  }
  if (command.activation === undefined || command.activation.documentIds.length === 0) {
    return domainFailure("CONTEXT_VERSION_REQUIRED", "새 Context version이 필요합니다", "활성화할 문서와 version을 지정하세요.");
  }
  if (aggregate.contextVersions.some(({ version }) => version === command.activation?.version)) {
    return domainFailure("CONTEXT_VERSION_EXISTS", "이미 존재하는 Context version입니다", "새 version 식별자를 사용하세요.");
  }
  return domainSuccess(command.activation);
}

function validateTransitionGuard(
  aggregate: ChangeRequestAggregate,
  command: TransitionCommand,
): DomainResult<true> {
  switch (command.target) {
    case "IN_REVIEW":
      return validateInReview(aggregate);
    case "APPROVED":
      return validateReviewDecision(aggregate, "APPROVED");
    case "CHANGES_REQUESTED":
      return validateReviewDecision(aggregate, "CHANGES_REQUESTED");
    case "REJECTED":
      if (!hasPermission(command.actor, "review.reject")) {
        return domainFailure("REVIEW_PERMISSION_DENIED", "반려 권한이 없습니다", "검토자 이상의 역할이 필요합니다.");
      }
      return aggregate.request.status === "IN_REVIEW"
        ? validateReviewDecision(aggregate, "REJECTED")
        : domainSuccess(true);
    case "READY_TO_ACTIVATE":
      return validateReadyToActivate(aggregate);
    default:
      return domainSuccess(true);
  }
}

export function transitionChange(
  aggregate: ChangeRequestAggregate,
  command: TransitionCommand,
): DomainResult<ChangeRequestAggregate> {
  const currentStatus = aggregate.request.status;
  if (isTerminalChangeStatus(currentStatus)) {
    return domainFailure("CHANGE_TERMINAL", "완료된 변경 요청은 수정할 수 없습니다", `${currentStatus} 상태는 종료 상태입니다.`);
  }
  if (!isTransitionAllowed(currentStatus, command.target)) {
    return domainFailure("TRANSITION_FORBIDDEN", "허용되지 않은 상태 전이입니다", `${currentStatus}에서 ${command.target}(으)로 이동할 수 없습니다.`);
  }
  const guard = validateTransitionGuard(aggregate, command);
  if (!guard.ok) return guard;

  let implementation = aggregate.implementation;
  if (command.target === "APPROVED") {
    const proposal = selectCurrentProposal(aggregate);
    if (proposal === null) {
      return domainFailure("PROPOSAL_REQUIRED", "승인할 제안이 없습니다", "제안을 먼저 생성하세요.");
    }
    implementation = {
      ...implementation,
      approvedProposalRevision: proposal.revision,
      approvedScopeFingerprint: getProposalScopeFingerprint(proposal),
    };
  }
  if (command.target === "IMPLEMENTING") {
    implementation = { ...implementation, revision: implementation.revision + 1 };
  }

  let contextVersions = aggregate.contextVersions;
  let activationAudit: AuditEvent | null = null;
  if (command.target === "ACTIVATED") {
    const activation = validateActivation(aggregate, command);
    if (!activation.ok) return activation;
    const contextVersion: ContextVersion = {
      version: activation.value.version,
      projectId: aggregate.request.projectId,
      changeRequestId: aggregate.request.id,
      documentIds: activation.value.documentIds,
      activatedBy: command.actor.id,
      activatedAt: command.occurredAt,
    };
    contextVersions = [...contextVersions, contextVersion];
    activationAudit = createAuditEvent(
      command,
      "context.activated",
      "CONTEXT_VERSION",
      contextVersion.version,
      { changeStatus: currentStatus },
      { changeStatus: command.target, version: contextVersion.version },
    );
  }

  const transitionAudit = createAuditEvent(
    command,
    "change.status_transitioned",
    "CHANGE_REQUEST",
    aggregate.request.id,
    { status: currentStatus },
    { status: command.target },
  );
  return domainSuccess({
    ...aggregate,
    request: { ...aggregate.request, status: command.target, updatedAt: command.occurredAt },
    implementation,
    contextVersions,
    auditEvents: [
      ...aggregate.auditEvents,
      transitionAudit,
      ...(activationAudit === null ? [] : [activationAudit]),
    ],
  });
}
