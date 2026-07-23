import type { ChangeRequest } from "@entities/change-request";
import type { Proposal } from "@entities/proposal";
import type { DomainError } from "@shared/lib/result";

export const ANALYSIS_STAGES = [
  "CHECKING_CONTEXT",
  "STRUCTURING_REQUEST",
  "DISCOVERING_IMPACTS",
  "GENERATING_VERIFICATION",
] as const;

export type AnalysisStage = (typeof ANALYSIS_STAGES)[number];
export type AnalysisJobStatus = "QUEUED" | "RUNNING" | "COMPLETED" | "FAILED";

export interface AnalysisJob {
  id: string;
  projectId: string;
  contextSnapshot: string;
  rawRequest: string;
  status: AnalysisJobStatus;
  stage: AnalysisStage;
  completedStages: readonly AnalysisStage[];
  attempt: number;
  changeId: string | null;
  error: DomainError | null;
  createdAt: string;
  updatedAt: string;
}

export interface AnalysisOutcome {
  request: ChangeRequest;
  proposal: Proposal;
  clarificationQuestions: readonly string[];
}

export interface StartAnalysisInput {
  projectId: string;
  contextSnapshot: string;
  rawRequest: string;
}

export function createAnalysisIdempotencyKey(input: StartAnalysisInput): string {
  const source = `${input.projectId}\u0000${input.contextSnapshot}\u0000${input.rawRequest}`;
  let hash = 2166136261;
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `analysis-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}
