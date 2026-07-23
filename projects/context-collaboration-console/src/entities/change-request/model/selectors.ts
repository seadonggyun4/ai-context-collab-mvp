import { getProposalScopeFingerprint, type Proposal } from "@entities/proposal";

import type { ChangeRequestAggregate } from "./change-request";
import type { Evidence } from "@entities/evidence";
import type { Review } from "@entities/review";

export type VerificationBlockerCode =
  | "IMPLEMENTATION_SCOPE_MISMATCH"
  | "PROPOSAL_REQUIRED"
  | "REQUIRED_EVIDENCE_NOT_EXECUTED"
  | "REQUIRED_EVIDENCE_FAILED"
  | "MANUAL_CHECK_UNRESOLVED"
  | "REQUIRED_EVIDENCE_INCOMPLETE";

export interface VerificationBlocker {
  code: VerificationBlockerCode;
  title: string;
  detail: string;
  testId: string | null;
}

export interface VerificationGate {
  ready: boolean;
  blockers: readonly VerificationBlocker[];
  currentEvidence: readonly Evidence[];
}

export function selectCurrentProposal(aggregate: ChangeRequestAggregate): Proposal | null {
  return aggregate.proposals.reduce<Proposal | null>(
    (latest, proposal) => latest === null || proposal.revision > latest.revision ? proposal : latest,
    null,
  );
}

export function selectCurrentReview(aggregate: ChangeRequestAggregate): Review | null {
  const proposal = selectCurrentProposal(aggregate);
  if (proposal === null) return null;
  const scopeFingerprint = getProposalScopeFingerprint(proposal);

  return aggregate.reviews.reduce<Review | null>(
    (latest, review) => review.proposalRevision === proposal.revision
      && review.scopeFingerprint === scopeFingerprint
      ? review
      : latest,
    null,
  );
}

export function selectCurrentEvidence(aggregate: ChangeRequestAggregate): readonly Evidence[] {
  const byTestId = new Map<string, Evidence>();
  for (const evidence of aggregate.evidence) {
    if (evidence.implementationRevision !== aggregate.implementation.revision) continue;
    byTestId.set(evidence.testId, evidence);
  }
  return [...byTestId.values()];
}

export function selectImplementationMatchesApprovedScope(aggregate: ChangeRequestAggregate): boolean {
  const proposal = selectCurrentProposal(aggregate);
  return proposal !== null
    && aggregate.implementation.approvedProposalRevision === proposal.revision
    && aggregate.implementation.approvedScopeFingerprint === getProposalScopeFingerprint(proposal);
}

export function selectVerificationGate(aggregate: ChangeRequestAggregate): VerificationGate {
  const currentEvidence = selectCurrentEvidence(aggregate);
  const blockers: VerificationBlocker[] = [];
  if (!selectImplementationMatchesApprovedScope(aggregate)) {
    blockers.push({ code: "IMPLEMENTATION_SCOPE_MISMATCH", title: "구현 범위가 승인 범위와 다릅니다", detail: "변경된 범위를 다시 검토하고 승인하세요.", testId: null });
  }
  const proposal = selectCurrentProposal(aggregate);
  if (proposal === null) {
    blockers.push({ code: "PROPOSAL_REQUIRED", title: "승인된 제안이 없습니다", detail: "제안과 승인을 먼저 완료하세요.", testId: null });
    return { ready: false, blockers, currentEvidence };
  }
  const evidenceByTestId = new Map(currentEvidence.map((item) => [item.testId, item]));
  for (const scenario of proposal.qaScenarios.filter(({ required }) => required)) {
    const evidence = evidenceByTestId.get(scenario.id);
    if (evidence === undefined || evidence.result === "NOT_EXECUTED") {
      blockers.push({ code: "REQUIRED_EVIDENCE_NOT_EXECUTED", title: "필수 검증이 실행되지 않았습니다", detail: `${scenario.id} 검증을 현재 구현 revision에서 실행하세요.`, testId: scenario.id });
    } else if (evidence.result === "FAILED") {
      blockers.push({ code: "REQUIRED_EVIDENCE_FAILED", title: "필수 검증이 실패했습니다", detail: `${scenario.id} 실패를 해결하고 다시 검증하세요.`, testId: scenario.id });
    } else if (evidence.result === "MANUAL_REQUIRED") {
      blockers.push({ code: "MANUAL_CHECK_UNRESOLVED", title: "수동 확인이 남아 있습니다", detail: `${scenario.id} 수동 확인을 검토자가 확정해야 합니다.`, testId: scenario.id });
    } else if (evidence.result === "PARTIALLY_VERIFIED") {
      blockers.push({ code: "REQUIRED_EVIDENCE_INCOMPLETE", title: "필수 검증이 일부만 확인됐습니다", detail: `${scenario.id} 전체 범위를 검증하세요.`, testId: scenario.id });
    }
  }
  return { ready: blockers.length === 0, blockers, currentEvidence };
}
