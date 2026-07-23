import { useMemo, useState } from "react";

import { useActivationRepository } from "@entities/activation";

import type { ActivationWorkspace } from "@entities/activation";
import type { DomainError } from "@shared/lib/result";

export function useActivationActions(workspace: ActivationWorkspace, onWorkspace: (workspace: ActivationWorkspace) => void) {
  const repository = useActivationRepository();
  const [pending, setPending] = useState<"publish" | "activate" | null>(null);
  const [error, setError] = useState<DomainError | null>(null);
  const commandPrefix = useMemo(() => `${workspace.changeId}-${workspace.proposalRevision}-${workspace.implementationRevision}`, [workspace.changeId, workspace.proposalRevision, workspace.implementationRevision]);
  async function publish() {
    setPending("publish"); setError(null);
    const result = await repository.publishGit({ projectId: workspace.projectId, changeId: workspace.changeId, actorId: workspace.currentActor.id, expectedBaseCommitSha: workspace.baseCommitSha, proposalRevision: workspace.proposalRevision, scopeFingerprint: workspace.scopeFingerprint, implementationRevision: workspace.implementationRevision, idempotencyKey: `${commandPrefix}-publish` });
    setPending(null); if (!result.ok) setError(result.error); else onWorkspace(result.value);
  }
  async function activate(version: string) {
    setPending("activate"); setError(null);
    const result = await repository.activate({ projectId: workspace.projectId, changeId: workspace.changeId, actorId: workspace.currentActor.id, version, documentIds: workspace.documentIds, idempotencyKey: `${commandPrefix}-activate-${version}` });
    setPending(null); if (!result.ok) setError(result.error); else onWorkspace(result.value);
  }
  return { pending, error, clearError: () => setError(null), publish, activate };
}
