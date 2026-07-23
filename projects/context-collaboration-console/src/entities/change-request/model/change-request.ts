import type { AuditEvent } from "@entities/audit";
import type { ContextVersion } from "@entities/context-version";
import type { Evidence } from "@entities/evidence";
import type { Proposal, RiskLevel } from "@entities/proposal";
import type { Actor, Review } from "@entities/review";

export const CHANGE_STATUSES = [
  "REQUESTED",
  "ANALYZED",
  "IN_REVIEW",
  "CHANGES_REQUESTED",
  "APPROVED",
  "IMPLEMENTING",
  "VERIFYING",
  "READY_TO_ACTIVATE",
  "ACTIVATED",
  "REJECTED",
] as const;

export type ChangeStatus = (typeof CHANGE_STATUSES)[number];

export interface ChangeRequest {
  id: string;
  projectId: string;
  title: string;
  rawRequest: string;
  status: ChangeStatus;
  risk: RiskLevel;
  requester: Actor;
  contextSnapshot: string;
  createdAt: string;
  updatedAt: string;
}

export interface ImplementationState {
  revision: number;
  approvedProposalRevision: number | null;
  approvedScopeFingerprint: string | null;
}

export interface ChangeRequestAggregate {
  request: ChangeRequest;
  proposals: readonly Proposal[];
  reviews: readonly Review[];
  evidence: readonly Evidence[];
  contextVersions: readonly ContextVersion[];
  auditEvents: readonly AuditEvent[];
  implementation: ImplementationState;
}
