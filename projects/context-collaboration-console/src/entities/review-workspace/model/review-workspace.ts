import type { AuditEvent } from "@entities/audit";
import type { ChangeStatus, VerificationGate } from "@entities/change-request";
import type { Evidence, EvidenceResult } from "@entities/evidence";
import type { QaScenario, RiskLevel } from "@entities/proposal";
import type { Actor, Review, ReviewDecision } from "@entities/review";

export type DiffChangeType = "ADDED" | "UPDATED" | "REMOVED" | "UNCHANGED";

export interface SemanticDiffEntry {
  id: string;
  section: "SUMMARY" | "ACCEPTANCE" | "IMPACT" | "FILE" | "QA";
  label: string;
  before: string | null;
  after: string | null;
  changeType: DiffChangeType;
}

export interface ReviewDiff {
  baseRevision: string;
  targetRevision: string;
  semantic: readonly SemanticDiffEntry[];
  raw: { format: "MARKDOWN" | "YAML"; before: string; after: string };
}

export interface EvidenceScenarioState {
  scenario: QaScenario;
  evidence: Evidence | null;
}

export interface ActionCapability {
  allowed: boolean;
  reason: string | null;
}

export interface TransitionAction extends ActionCapability {
  target: Extract<ChangeStatus, "IMPLEMENTING" | "VERIFYING" | "READY_TO_ACTIVATE">;
  label: string;
}

export interface ReviewWorkspace {
  projectId: string;
  changeId: string;
  title: string;
  status: ChangeStatus;
  risk: RiskLevel;
  requester: Actor;
  currentActor: Actor;
  contextSnapshot: string;
  proposalRevision: number;
  scopeFingerprint: string;
  implementationRevision: number;
  diff: ReviewDiff;
  currentReview: Review | null;
  evidence: readonly EvidenceScenarioState[];
  verificationGate: VerificationGate;
  auditEvents: readonly AuditEvent[];
  decisionCapabilities: Readonly<Record<ReviewDecision, ActionCapability>>;
  evidenceCapabilities: {
    automated: ActionCapability;
    manual: ActionCapability;
  };
  transitionAction: TransitionAction | null;
}

export interface RecordReviewInput {
  projectId: string;
  changeId: string;
  actorId: string;
  decision: ReviewDecision;
  proposalRevision: number;
  scopeFingerprint: string;
  comment: string;
  idempotencyKey: string;
}

export interface RecordVerificationInput {
  projectId: string;
  changeId: string;
  actorId: string;
  testId: string;
  result: EvidenceResult;
  idempotencyKey: string;
}

export interface TransitionReviewInput {
  projectId: string;
  changeId: string;
  actorId: string;
  target: TransitionAction["target"];
  idempotencyKey: string;
}
