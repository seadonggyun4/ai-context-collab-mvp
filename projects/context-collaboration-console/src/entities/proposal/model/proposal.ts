import type { ImpactNode } from "@entities/impact";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";
export type ConfidenceLevel = "LOW" | "MEDIUM" | "HIGH";
export type CriterionPriority = "P0" | "P1";

export interface AcceptanceCriterion {
  id: string;
  statement: string;
  priority: CriterionPriority;
}

export interface AffectedFile {
  path: string;
  changeType: "CREATE" | "UPDATE" | "MOVE" | "DELETE";
  reason: string;
}

export interface QaScenario {
  id: string;
  title: string;
  type: "AUTOMATED" | "MANUAL";
  required: boolean;
}

export interface Proposal {
  revision: number;
  summary: string;
  acceptanceCriteria: readonly AcceptanceCriterion[];
  impacts: readonly ImpactNode[];
  affectedFiles: readonly AffectedFile[];
  risk: RiskLevel;
  confidence: ConfidenceLevel;
  unknowns: readonly string[];
  qaScenarios: readonly QaScenario[];
  contextSnapshotLocked: boolean;
  createdAt: string;
}

export function getProposalScopeFingerprint(proposal: Proposal): string {
  const scope = {
    summary: proposal.summary,
    acceptanceCriteria: [...proposal.acceptanceCriteria]
      .sort((left, right) => left.id.localeCompare(right.id))
      .map(({ id, statement, priority }) => ({ id, statement, priority })),
    impacts: [...proposal.impacts]
      .sort((left, right) => left.id.localeCompare(right.id))
      .map(({ id, kind, label, status, sourcePath, rationale, reviewable }) => ({
        id,
        kind,
        label,
        status,
        sourcePath,
        rationale,
        reviewable,
      })),
    affectedFiles: [...proposal.affectedFiles]
      .sort((left, right) => left.path.localeCompare(right.path))
      .map(({ path, changeType, reason }) => ({ path, changeType, reason })),
    risk: proposal.risk,
    confidence: proposal.confidence,
    unknowns: [...proposal.unknowns].sort(),
    qaScenarios: [...proposal.qaScenarios]
      .sort((left, right) => left.id.localeCompare(right.id))
      .map(({ id, title, type, required }) => ({ id, title, type, required })),
    contextSnapshotLocked: proposal.contextSnapshotLocked,
  };
  return `revision=${proposal.revision}|scope=${JSON.stringify(scope)}`;
}
