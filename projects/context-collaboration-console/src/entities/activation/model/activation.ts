import type { ChangeStatus } from "@entities/change-request";
import type { Actor } from "@entities/review";

export interface ActivationEvidence {
  id: string;
  testId: string;
  type: "AUTOMATED" | "MANUAL";
  result: "PASSED" | "FAILED" | "PARTIALLY_VERIFIED" | "NOT_EXECUTED" | "MANUAL_REQUIRED";
  commitSha: string | null;
  verifiedBy: string;
}

export interface GitPublication {
  branch: string;
  commitSha: string;
  pullRequestUrl: string;
  pullRequestStatus: "OPEN" | "MERGED" | "CLOSED";
  proposalRevision: number;
  scopeFingerprint: string;
  implementationRevision: number;
  baseCommitSha: string;
  publishedBy: string;
  publishedAt: string;
}

export interface ActivatedContextVersion {
  version: string;
  projectId: string;
  changeRequestId: string;
  documentIds: readonly string[];
  sourceCommitSha: string;
  activatedBy: string;
  activatedAt: string;
}

export interface ActivationAuditEvent {
  id: string;
  actorId: string;
  action: string;
  targetType: "CHANGE_REQUEST" | "REVIEW" | "EVIDENCE" | "CONTEXT_VERSION";
  targetId: string;
  requestId: string;
  occurredAt: string;
}

export interface ActivationWorkspace {
  projectId: string;
  changeId: string;
  title: string;
  status: ChangeStatus;
  currentActor: Actor;
  contextSnapshot: string;
  baseCommitSha: string;
  proposalRevision: number;
  scopeFingerprint: string;
  implementationRevision: number;
  documentIds: readonly string[];
  evidence: readonly ActivationEvidence[];
  publication: GitPublication | null;
  contextVersion: ActivatedContextVersion | null;
  publishCapability: { allowed: boolean; reason: string | null };
  activationCapability: { allowed: boolean; reason: string | null };
  auditEvents: readonly ActivationAuditEvent[];
}

export interface PublishGitInput {
  projectId: string;
  changeId: string;
  actorId: string;
  expectedBaseCommitSha: string;
  proposalRevision: number;
  scopeFingerprint: string;
  implementationRevision: number;
  idempotencyKey: string;
}

export interface ActivateContextInput {
  projectId: string;
  changeId: string;
  actorId: string;
  version: string;
  documentIds: readonly string[];
  idempotencyKey: string;
}
