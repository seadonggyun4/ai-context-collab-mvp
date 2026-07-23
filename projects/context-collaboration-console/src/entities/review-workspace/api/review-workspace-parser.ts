import { CHANGE_STATUSES } from "@entities/change-request";
import { EVIDENCE_RESULTS } from "@entities/evidence";
import { ACTOR_ROLES } from "@entities/review";

import type {
  ActionCapability,
  EvidenceScenarioState,
  ReviewWorkspace,
  SemanticDiffEntry,
  TransitionAction,
} from "../model/review-workspace";
import type { AuditEvent } from "@entities/audit";
import type { Evidence } from "@entities/evidence";
import type { QaScenario } from "@entities/proposal";
import type { Actor, Review } from "@entities/review";

function record(value: unknown, label: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) throw new Error(`${label} must be an object`);
  return value as Record<string, unknown>;
}

function field(source: Record<string, unknown>, camel: string, snake: string = camel): unknown {
  return Object.prototype.hasOwnProperty.call(source, camel) ? source[camel] : source[snake];
}

function string(value: unknown, label: string): string {
  if (typeof value !== "string" || value.trim() === "") throw new Error(`${label} must be a non-empty string`);
  return value;
}

function nullableString(value: unknown, label: string): string | null {
  return value === null ? null : string(value, label);
}

function integer(value: unknown, label: string): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) throw new Error(`${label} must be a positive integer`);
  return value;
}

function enumeration<T extends string>(value: unknown, values: readonly T[], label: string): T {
  if (typeof value !== "string" || !values.includes(value as T)) throw new Error(`${label} is invalid`);
  return value as T;
}

function array(value: unknown, label: string): unknown[] {
  if (!Array.isArray(value)) throw new Error(`${label} must be an array`);
  return value;
}

function parseActor(value: unknown): Actor {
  const item = record(value, "actor");
  return {
    id: string(field(item, "id"), "actor id"),
    displayName: string(field(item, "displayName", "display_name"), "actor display name"),
    role: enumeration(field(item, "role"), ACTOR_ROLES, "actor role"),
  };
}

function parseReview(value: unknown): Review {
  const item = record(value, "review");
  return {
    id: string(field(item, "id"), "review id"),
    changeRequestId: string(field(item, "changeRequestId", "change_request_id"), "review change id"),
    reviewer: parseActor(field(item, "reviewer")),
    decision: enumeration(field(item, "decision"), ["APPROVED", "CHANGES_REQUESTED", "REJECTED"], "review decision"),
    proposalRevision: integer(field(item, "proposalRevision", "proposal_revision"), "proposal revision"),
    scopeFingerprint: string(field(item, "scopeFingerprint", "scope_fingerprint"), "scope fingerprint"),
    comment: string(field(item, "comment"), "review comment"),
    decidedAt: string(field(item, "decidedAt", "decided_at"), "review decided at"),
  };
}

function parseScenario(value: unknown): QaScenario {
  const item = record(value, "QA scenario");
  return {
    id: string(field(item, "id"), "scenario id"),
    title: string(field(item, "title"), "scenario title"),
    type: enumeration(field(item, "type"), ["AUTOMATED", "MANUAL"], "scenario type"),
    required: field(item, "required") === true,
  };
}

function parseEvidence(value: unknown): Evidence {
  const item = record(value, "evidence");
  return {
    id: string(field(item, "id"), "evidence id"),
    changeRequestId: string(field(item, "changeRequestId", "change_request_id"), "evidence change id"),
    testId: string(field(item, "testId", "test_id"), "evidence test id"),
    type: enumeration(field(item, "type"), ["AUTOMATED", "MANUAL"], "evidence type"),
    result: enumeration(field(item, "result"), EVIDENCE_RESULTS, "evidence result"),
    required: field(item, "required") === true,
    command: nullableString(field(item, "command"), "evidence command"),
    artifact: nullableString(field(item, "artifact"), "evidence artifact"),
    implementationRevision: integer(field(item, "implementationRevision", "implementation_revision"), "implementation revision"),
    verifiedBy: string(field(item, "verifiedBy", "verified_by"), "verified by"),
    verifiedAt: string(field(item, "verifiedAt", "verified_at"), "verified at"),
  };
}

function parseEvidenceState(value: unknown): EvidenceScenarioState {
  const item = record(value, "evidence state");
  const evidence = field(item, "evidence");
  return { scenario: parseScenario(field(item, "scenario")), evidence: evidence === null ? null : parseEvidence(evidence) };
}

function parseCapability(value: unknown): ActionCapability {
  const item = record(value, "action capability");
  const reason = field(item, "reason");
  return { allowed: field(item, "allowed") === true, reason: reason === null ? null : string(reason, "capability reason") };
}

function parseSemantic(value: unknown): SemanticDiffEntry {
  const item = record(value, "semantic diff");
  return {
    id: string(field(item, "id"), "diff id"),
    section: enumeration(field(item, "section"), ["SUMMARY", "ACCEPTANCE", "IMPACT", "FILE", "QA"], "diff section"),
    label: string(field(item, "label"), "diff label"),
    before: nullableString(field(item, "before"), "diff before"),
    after: nullableString(field(item, "after"), "diff after"),
    changeType: enumeration(field(item, "changeType", "change_type"), ["ADDED", "UPDATED", "REMOVED", "UNCHANGED"], "diff change type"),
  };
}

function parseAudit(value: unknown): AuditEvent {
  const item = record(value, "audit event");
  return {
    id: string(field(item, "id"), "audit id"),
    actorId: string(field(item, "actorId", "actor_id"), "audit actor"),
    action: string(field(item, "action"), "audit action"),
    targetType: enumeration(field(item, "targetType", "target_type"), ["CHANGE_REQUEST", "REVIEW", "EVIDENCE", "CONTEXT_VERSION"], "audit target type"),
    targetId: string(field(item, "targetId", "target_id"), "audit target id"),
    before: record(field(item, "before"), "audit before"),
    after: record(field(item, "after"), "audit after"),
    requestId: string(field(item, "requestId", "request_id"), "audit request id"),
    occurredAt: string(field(item, "occurredAt", "occurred_at"), "audit occurred at"),
  };
}

function parseTransition(value: unknown): TransitionAction | null {
  if (value === null) return null;
  const item = record(value, "transition action");
  return {
    ...parseCapability(item),
    target: enumeration(field(item, "target"), ["IMPLEMENTING", "VERIFYING", "READY_TO_ACTIVATE"], "transition target"),
    label: string(field(item, "label"), "transition label"),
  };
}

export function parseReviewWorkspace(value: unknown): ReviewWorkspace {
  const item = record(value, "review workspace");
  const diff = record(field(item, "diff"), "review diff");
  const raw = record(field(diff, "raw"), "raw diff");
  const review = field(item, "currentReview", "current_review");
  const gate = record(field(item, "verificationGate", "verification_gate"), "verification gate");
  const decisions = record(field(item, "decisionCapabilities", "decision_capabilities"), "decision capabilities");
  const evidenceCapabilities = record(field(item, "evidenceCapabilities", "evidence_capabilities"), "evidence capabilities");
  const currentEvidence = array(field(gate, "currentEvidence", "current_evidence"), "current evidence").map(parseEvidence);
  const blockers = array(field(gate, "blockers"), "gate blockers").map((value) => {
    const blocker = record(value, "gate blocker");
    const testId = field(blocker, "testId", "test_id");
    return {
      code: enumeration(field(blocker, "code"), ["IMPLEMENTATION_SCOPE_MISMATCH", "PROPOSAL_REQUIRED", "REQUIRED_EVIDENCE_NOT_EXECUTED", "REQUIRED_EVIDENCE_FAILED", "MANUAL_CHECK_UNRESOLVED", "REQUIRED_EVIDENCE_INCOMPLETE"], "blocker code"),
      title: string(field(blocker, "title"), "blocker title"),
      detail: string(field(blocker, "detail"), "blocker detail"),
      testId: testId === null ? null : string(testId, "blocker test id"),
    };
  });
  return {
    projectId: string(field(item, "projectId", "project_id"), "workspace project id"),
    changeId: string(field(item, "changeId", "change_id"), "workspace change id"),
    title: string(field(item, "title"), "workspace title"),
    status: enumeration(field(item, "status"), CHANGE_STATUSES, "workspace status"),
    risk: enumeration(field(item, "risk"), ["LOW", "MEDIUM", "HIGH"], "workspace risk"),
    requester: parseActor(field(item, "requester")),
    currentActor: parseActor(field(item, "currentActor", "current_actor")),
    contextSnapshot: string(field(item, "contextSnapshot", "context_snapshot"), "context snapshot"),
    proposalRevision: integer(field(item, "proposalRevision", "proposal_revision"), "proposal revision"),
    scopeFingerprint: string(field(item, "scopeFingerprint", "scope_fingerprint"), "scope fingerprint"),
    implementationRevision: integer(field(item, "implementationRevision", "implementation_revision"), "implementation revision"),
    diff: {
      baseRevision: string(field(diff, "baseRevision", "base_revision"), "base revision"),
      targetRevision: string(field(diff, "targetRevision", "target_revision"), "target revision"),
      semantic: array(field(diff, "semantic"), "semantic diff").map(parseSemantic),
      raw: {
        format: enumeration(field(raw, "format"), ["MARKDOWN", "YAML"], "raw format"),
        before: string(field(raw, "before"), "raw before"),
        after: string(field(raw, "after"), "raw after"),
      },
    },
    currentReview: review === null ? null : parseReview(review),
    evidence: array(field(item, "evidence"), "evidence states").map(parseEvidenceState),
    verificationGate: { ready: field(gate, "ready") === true, blockers, currentEvidence },
    auditEvents: array(field(item, "auditEvents", "audit_events"), "audit events").map(parseAudit),
    decisionCapabilities: {
      APPROVED: parseCapability(field(decisions, "APPROVED")),
      CHANGES_REQUESTED: parseCapability(field(decisions, "CHANGES_REQUESTED")),
      REJECTED: parseCapability(field(decisions, "REJECTED")),
    },
    evidenceCapabilities: {
      automated: parseCapability(field(evidenceCapabilities, "automated")),
      manual: parseCapability(field(evidenceCapabilities, "manual")),
    },
    transitionAction: parseTransition(field(item, "transitionAction", "transition_action")),
  };
}
