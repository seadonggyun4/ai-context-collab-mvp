import type { Actor } from "./permissions";

export type ReviewDecision = "APPROVED" | "CHANGES_REQUESTED" | "REJECTED";

export interface Review {
  id: string;
  changeRequestId: string;
  reviewer: Actor;
  decision: ReviewDecision;
  proposalRevision: number;
  scopeFingerprint: string;
  comment: string;
  decidedAt: string;
}
