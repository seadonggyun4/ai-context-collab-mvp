import { useState } from "react";

import { useReviewWorkspaceRepository } from "@entities/review-workspace";

import type { EvidenceResult } from "@entities/evidence";
import type { ReviewDecision } from "@entities/review";
import type { ReviewWorkspace, TransitionAction } from "@entities/review-workspace";
import type { DomainError, DomainResult } from "@shared/lib/result";

function commandKey(workspace: ReviewWorkspace, action: string) {
  return `${workspace.changeId}-${workspace.proposalRevision}-${workspace.implementationRevision}-${action}`.replace(/[^A-Za-z0-9_-]/g, "-");
}

export function useReviewActions(workspace: ReviewWorkspace, onWorkspace: (workspace: ReviewWorkspace) => void) {
  const repository = useReviewWorkspaceRepository();
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [error, setError] = useState<DomainError | null>(null);

  async function run(action: string, operation: () => Promise<DomainResult<ReviewWorkspace>>) {
    if (pendingAction !== null) return;
    setPendingAction(action);
    setError(null);
    try {
      const result = await operation();
      if (result.ok) onWorkspace(result.value);
      else setError(result.error);
    } finally {
      setPendingAction(null);
    }
  }

  function submitDecision(decision: ReviewDecision, comment: string) {
    return run(`decision-${decision}`, () => repository.recordReview({
      projectId: workspace.projectId,
      changeId: workspace.changeId,
      actorId: workspace.currentActor.id,
      decision,
      proposalRevision: workspace.proposalRevision,
      scopeFingerprint: workspace.scopeFingerprint,
      comment,
      idempotencyKey: commandKey(workspace, `review-${decision}`),
    }));
  }

  function recordVerification(testId: string, result: EvidenceResult) {
    return run(`evidence-${testId}`, () => repository.recordVerification({
      projectId: workspace.projectId,
      changeId: workspace.changeId,
      actorId: workspace.currentActor.id,
      testId,
      result,
      idempotencyKey: commandKey(workspace, `evidence-${testId}-${result}`),
    }));
  }

  function transition(action: TransitionAction) {
    return run(`transition-${action.target}`, () => repository.transition({
      projectId: workspace.projectId,
      changeId: workspace.changeId,
      actorId: workspace.currentActor.id,
      target: action.target,
      idempotencyKey: commandKey(workspace, `transition-${action.target}`),
    }));
  }

  return { pendingAction, error, clearError: () => setError(null), submitDecision, recordVerification, transition };
}
