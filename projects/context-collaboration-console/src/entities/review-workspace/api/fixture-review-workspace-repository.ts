import {
  APC_FIXTURE_ACTORS,
  createApcDomainFixture,
  recordEvidence,
  recordReview,
  selectCurrentEvidence,
  selectCurrentProposal,
  selectCurrentReview,
  selectVerificationGate,
  transitionChange,
} from "@entities/change-request";
import { getProposalScopeFingerprint } from "@entities/proposal";
import { getReviewDecisionCapability, hasPermission } from "@entities/review";
import { domainFailure, domainSuccess } from "@shared/lib/result";

import type {
  ActionCapability,
  RecordReviewInput,
  RecordVerificationInput,
  ReviewWorkspace,
  TransitionAction,
  TransitionReviewInput,
} from "../model/review-workspace";
import type { ReviewWorkspaceRepository } from "../model/review-workspace-repository";
import type { ChangeRequestAggregate } from "@entities/change-request";
import type { Evidence } from "@entities/evidence";
import type { Actor, ReviewDecision } from "@entities/review";
import type { DomainResult } from "@shared/lib/result";

const fixtureProjectId = "apc-monitoring-mvp";
const fixtureChangeId = "CR-DEMO-001";
const commandTime = "2026-07-23T10:30:00+09:00";
const actorRegistry = new Map(Object.values(APC_FIXTURE_ACTORS).map((actor) => [actor.id, actor]));

function initialAggregate(): ChangeRequestAggregate {
  const result = transitionChange(createApcDomainFixture().aggregate, {
    target: "IN_REVIEW",
    actor: APC_FIXTURE_ACTORS.requester,
    requestId: "fixture-review-open",
    occurredAt: "2026-07-23T09:30:00+09:00",
  });
  if (!result.ok) throw new Error(result.error.detail);
  return result.value;
}

function disabled(reason: string): ActionCapability {
  return { allowed: false, reason };
}

function decisionCapability(aggregate: ChangeRequestAggregate, actor: Actor, decision: ReviewDecision): ActionCapability {
  if (aggregate.request.status !== "IN_REVIEW") return disabled("현재 변경은 검토 결정 단계가 아닙니다.");
  const capability = getReviewDecisionCapability(actor, decision, {
    requesterId: aggregate.request.requester.id,
    risk: aggregate.request.risk,
  });
  return capability.allowed ? { allowed: true, reason: null } : disabled(capability.detail);
}

function transitionAction(aggregate: ChangeRequestAggregate): TransitionAction | null {
  if (aggregate.request.status === "APPROVED") return { target: "IMPLEMENTING", label: "구현 시작", allowed: true, reason: null };
  if (aggregate.request.status === "IMPLEMENTING") return { target: "VERIFYING", label: "검증 시작", allowed: true, reason: null };
  if (aggregate.request.status === "VERIFYING") {
    const gate = selectVerificationGate(aggregate);
    return { target: "READY_TO_ACTIVATE", label: "활성화 준비 완료", allowed: gate.ready, reason: gate.blockers[0]?.title ?? null };
  }
  return null;
}

function toWorkspace(aggregate: ChangeRequestAggregate, actor: Actor): ReviewWorkspace {
  const proposal = selectCurrentProposal(aggregate);
  if (proposal === null) throw new Error("Fixture proposal is missing");
  const currentEvidence = new Map(selectCurrentEvidence(aggregate).map((item) => [item.testId, item]));
  const evidenceState = proposal.qaScenarios.map((scenario) => ({ scenario, evidence: currentEvidence.get(scenario.id) ?? null }));
  const evidenceStateAllowed = aggregate.request.status === "IMPLEMENTING" || aggregate.request.status === "VERIFYING";
  return {
    projectId: aggregate.request.projectId,
    changeId: aggregate.request.id,
    title: aggregate.request.title,
    status: aggregate.request.status,
    risk: aggregate.request.risk,
    requester: aggregate.request.requester,
    currentActor: actor,
    contextSnapshot: aggregate.request.contextSnapshot,
    proposalRevision: proposal.revision,
    scopeFingerprint: getProposalScopeFingerprint(proposal),
    implementationRevision: aggregate.implementation.revision,
    diff: {
      baseRevision: "context-v1.3",
      targetRevision: `proposal-r${proposal.revision}`,
      semantic: [
        { id: "diff-summary", section: "SUMMARY", label: "변경 요약", before: "APC 수신 상태와 지연 여부를 표시합니다.", after: proposal.summary, changeType: "UPDATED" },
        ...proposal.acceptanceCriteria.map((criterion) => ({ id: `diff-${criterion.id}`, section: "ACCEPTANCE" as const, label: `${criterion.priority} ${criterion.id}`, before: null, after: criterion.statement, changeType: "ADDED" as const })),
        ...proposal.affectedFiles.map((file) => ({ id: `diff-file-${file.path}`, section: "FILE" as const, label: file.path, before: null, after: file.reason, changeType: "ADDED" as const })),
        ...proposal.qaScenarios.map((scenario) => ({ id: `diff-${scenario.id}`, section: "QA" as const, label: scenario.title, before: null, after: `${scenario.type} · ${scenario.required ? "필수" : "선택"}`, changeType: "ADDED" as const })),
      ],
      raw: {
        format: "MARKDOWN",
        before: "## 모니터링 목록\n\n- APC 수신 상태와 지연 여부를 표시한다.\n",
        after: `## 모니터링 목록\n\n- APC별 최근 정상 수신 시간을 표시한다.\n- 마지막 정상 수신 후 24시간 이상이면 경고한다.\n\n### 검증\n\n${proposal.qaScenarios.map((item) => `- ${item.id}: ${item.title}`).join("\n")}\n`,
      },
    },
    currentReview: selectCurrentReview(aggregate),
    evidence: evidenceState,
    verificationGate: selectVerificationGate(aggregate),
    auditEvents: aggregate.auditEvents,
    decisionCapabilities: {
      APPROVED: decisionCapability(aggregate, actor, "APPROVED"),
      CHANGES_REQUESTED: decisionCapability(aggregate, actor, "CHANGES_REQUESTED"),
      REJECTED: decisionCapability(aggregate, actor, "REJECTED"),
    },
    evidenceCapabilities: {
      automated: evidenceStateAllowed ? { allowed: true, reason: null } : disabled("구현 또는 검증 단계에서 실행할 수 있습니다."),
      manual: evidenceStateAllowed && hasPermission(actor, "evidence.accept_manual")
        ? { allowed: true, reason: null }
        : disabled(evidenceStateAllowed ? "수동 검증 확정은 검토자 권한이 필요합니다." : "구현 또는 검증 단계에서 실행할 수 있습니다."),
    },
    transitionAction: transitionAction(aggregate),
  };
}

function resolveActor(actorId: string): DomainResult<Actor> {
  const actor = actorRegistry.get(actorId);
  return actor === undefined
    ? domainFailure("ACTOR_NOT_FOUND", "사용자 권한을 확인할 수 없습니다", "등록된 사용자로 다시 시도해 주세요.")
    : domainSuccess(actor);
}

function inputFingerprint(input: object): string {
  return JSON.stringify(input, Object.keys(input).sort());
}

export interface FixtureReviewWorkspaceRepositoryOptions {
  actorId?: string;
}

export function createFixtureReviewWorkspaceRepository(
  options: FixtureReviewWorkspaceRepositoryOptions = {},
): ReviewWorkspaceRepository {
  let aggregate = initialAggregate();
  const defaultActor = actorRegistry.get(options.actorId ?? APC_FIXTURE_ACTORS.reviewer.id) ?? APC_FIXTURE_ACTORS.reviewer;
  const receipts = new Map<string, { fingerprint: string; result: DomainResult<ReviewWorkspace> }>();

  function executeIdempotently<T extends object>(key: string, input: T, execute: () => DomainResult<ReviewWorkspace>) {
    const fingerprint = inputFingerprint(input);
    const receipt = receipts.get(key);
    if (receipt !== undefined) {
      return receipt.fingerprint === fingerprint
        ? receipt.result
        : domainFailure("IDEMPOTENCY_KEY_REUSED", "요청 식별자가 다른 명령에 사용되었습니다", "새 Idempotency-Key로 다시 요청해 주세요.");
    }
    const result = execute();
    receipts.set(key, { fingerprint, result });
    return result;
  }

  function validateTarget(projectId: string, changeId: string): DomainResult<true> {
    return projectId === fixtureProjectId && changeId === fixtureChangeId
      ? domainSuccess(true)
      : domainFailure("REVIEW_WORKSPACE_NOT_FOUND", "검토 대상을 찾을 수 없습니다", "프로젝트와 변경 요청 ID를 확인해 주세요.");
  }

  return {
    getWorkspace(projectId, changeId) {
      if (projectId !== fixtureProjectId || changeId !== fixtureChangeId) return Promise.resolve(domainSuccess(null));
      return Promise.resolve(domainSuccess(toWorkspace(aggregate, defaultActor)));
    },
    recordReview(input: RecordReviewInput) {
      return Promise.resolve(executeIdempotently(input.idempotencyKey, input, () => {
        const target = validateTarget(input.projectId, input.changeId);
        if (!target.ok) return target;
        const actor = resolveActor(input.actorId);
        if (!actor.ok) return actor;
        const reviewed = recordReview(aggregate, {
          id: `review-${input.idempotencyKey}`,
          decision: input.decision,
          proposalRevision: input.proposalRevision,
          scopeFingerprint: input.scopeFingerprint,
          comment: input.comment,
          actor: actor.value,
          requestId: input.idempotencyKey,
          occurredAt: commandTime,
        });
        if (!reviewed.ok) return reviewed;
        const transitioned = transitionChange(reviewed.value, {
          target: input.decision,
          actor: actor.value,
          requestId: `${input.idempotencyKey}-transition`,
          occurredAt: commandTime,
        });
        if (!transitioned.ok) return transitioned;
        aggregate = transitioned.value;
        return domainSuccess(toWorkspace(aggregate, actor.value));
      }));
    },
    recordVerification(input: RecordVerificationInput) {
      return Promise.resolve(executeIdempotently(input.idempotencyKey, input, () => {
        const target = validateTarget(input.projectId, input.changeId);
        if (!target.ok) return target;
        const actor = resolveActor(input.actorId);
        if (!actor.ok) return actor;
        const proposal = selectCurrentProposal(aggregate);
        const scenario = proposal?.qaScenarios.find((item) => item.id === input.testId);
        if (scenario === undefined) return domainFailure("EVIDENCE_SCENARIO_MISMATCH", "승인된 검증 항목이 아닙니다", "현재 proposal의 QA 시나리오를 확인해 주세요.");
        const evidence: Evidence = {
          id: `evidence-${input.idempotencyKey}`,
          changeRequestId: aggregate.request.id,
          testId: scenario.id,
          type: scenario.type,
          result: input.result,
          required: scenario.required,
          command: scenario.type === "AUTOMATED" ? "npm test -- --run review-verification" : null,
          artifact: scenario.type === "AUTOMATED" ? "fixture://test-report/review-verification" : "fixture://manual/review-verification",
          implementationRevision: aggregate.implementation.revision,
          verifiedBy: actor.value.id,
          verifiedAt: commandTime,
        };
        const recorded = recordEvidence(aggregate, { evidence, actor: actor.value, requestId: input.idempotencyKey, occurredAt: commandTime });
        if (!recorded.ok) return recorded;
        aggregate = recorded.value;
        return domainSuccess(toWorkspace(aggregate, actor.value));
      }));
    },
    transition(input: TransitionReviewInput) {
      return Promise.resolve(executeIdempotently(input.idempotencyKey, input, () => {
        const target = validateTarget(input.projectId, input.changeId);
        if (!target.ok) return target;
        const actor = resolveActor(input.actorId);
        if (!actor.ok) return actor;
        const transitioned = transitionChange(aggregate, {
          target: input.target,
          actor: actor.value,
          requestId: input.idempotencyKey,
          occurredAt: commandTime,
        });
        if (!transitioned.ok) return transitioned;
        aggregate = transitioned.value;
        return domainSuccess(toWorkspace(aggregate, actor.value));
      }));
    },
  };
}

export const fixtureReviewWorkspaceRepository = createFixtureReviewWorkspaceRepository();
