import { CHANGE_STATUSES } from "@entities/change-request";
import { ACTOR_ROLES } from "@entities/review";

import type { ActivationWorkspace } from "../model/activation";

function object(value: unknown, label: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) throw new Error(`${label} must be an object`);
  return value as Record<string, unknown>;
}
function field(source: Record<string, unknown>, camel: string, snake: string = camel) { return camel in source ? source[camel] : source[snake]; }
function string(value: unknown, label: string) { if (typeof value !== "string" || value === "") throw new Error(`${label} must be a string`); return value; }
function integer(value: unknown, label: string) { if (typeof value !== "number" || !Number.isInteger(value) || value < 0) throw new Error(`${label} must be an integer`); return value; }
function enumeration<T extends string>(value: unknown, values: readonly T[], label: string): T { if (typeof value !== "string" || !values.includes(value as T)) throw new Error(`${label} is invalid`); return value as T; }
function list(value: unknown, label: string): unknown[] { if (!Array.isArray(value)) throw new Error(`${label} must be an array`); return value as unknown[]; }
function nullableString(value: unknown, label: string) { return value === null ? null : string(value, label); }
function capability(value: unknown) { const item = object(value, "capability"); const reason = field(item, "reason"); return { allowed: field(item, "allowed") === true, reason: reason === null ? null : string(reason, "capability reason") }; }

export function parseActivationWorkspace(value: unknown): ActivationWorkspace {
  const item = object(value, "activation workspace");
  const actor = object(field(item, "currentActor", "current_actor"), "actor");
  const publicationValue = field(item, "publication");
  const contextValue = field(item, "contextVersion", "context_version");
  return {
    projectId: string(field(item, "projectId", "project_id"), "project id"),
    changeId: string(field(item, "changeId", "change_id"), "change id"),
    title: string(field(item, "title"), "title"),
    status: enumeration(field(item, "status"), CHANGE_STATUSES, "status"),
    currentActor: { id: string(field(actor, "id"), "actor id"), displayName: string(field(actor, "displayName", "display_name"), "actor name"), role: enumeration(field(actor, "role"), ACTOR_ROLES, "actor role") },
    contextSnapshot: string(field(item, "contextSnapshot", "context_snapshot"), "context snapshot"),
    baseCommitSha: string(field(item, "baseCommitSha", "base_commit_sha"), "base commit"),
    proposalRevision: integer(field(item, "proposalRevision", "proposal_revision"), "proposal revision"),
    scopeFingerprint: string(field(item, "scopeFingerprint", "scope_fingerprint"), "scope fingerprint"),
    implementationRevision: integer(field(item, "implementationRevision", "implementation_revision"), "implementation revision"),
    documentIds: list(field(item, "documentIds", "document_ids"), "document ids").map((entry) => string(entry, "document id")),
    evidence: list(field(item, "evidence"), "evidence").map((entry) => { const evidence = object(entry, "evidence"); return { id: string(field(evidence, "id"), "evidence id"), testId: string(field(evidence, "testId", "test_id"), "test id"), type: enumeration(field(evidence, "type"), ["AUTOMATED", "MANUAL"], "evidence type"), result: enumeration(field(evidence, "result"), ["PASSED", "FAILED", "PARTIALLY_VERIFIED", "NOT_EXECUTED", "MANUAL_REQUIRED"], "evidence result"), commitSha: nullableString(field(evidence, "commitSha", "commit_sha"), "commit sha"), verifiedBy: string(field(evidence, "verifiedBy", "verified_by"), "verified by") }; }),
    publication: publicationValue === null ? null : (() => { const publication = object(publicationValue, "publication"); return { branch: string(field(publication, "branch"), "branch"), commitSha: string(field(publication, "commitSha", "commit_sha"), "commit sha"), pullRequestUrl: string(field(publication, "pullRequestUrl", "pull_request_url"), "PR URL"), pullRequestStatus: enumeration(field(publication, "pullRequestStatus", "pull_request_status"), ["OPEN", "MERGED", "CLOSED"], "PR status"), proposalRevision: integer(field(publication, "proposalRevision", "proposal_revision"), "proposal revision"), scopeFingerprint: string(field(publication, "scopeFingerprint", "scope_fingerprint"), "scope"), implementationRevision: integer(field(publication, "implementationRevision", "implementation_revision"), "implementation revision"), baseCommitSha: string(field(publication, "baseCommitSha", "base_commit_sha"), "base commit"), publishedBy: string(field(publication, "publishedBy", "published_by"), "published by"), publishedAt: string(field(publication, "publishedAt", "published_at"), "published at") }; })(),
    contextVersion: contextValue === null ? null : (() => { const context = object(contextValue, "context version"); return { version: string(field(context, "version"), "version"), projectId: string(field(context, "projectId", "project_id"), "project id"), changeRequestId: string(field(context, "changeRequestId", "change_request_id"), "change id"), documentIds: list(field(context, "documentIds", "document_ids"), "document ids").map((entry) => string(entry, "document id")), sourceCommitSha: string(field(context, "sourceCommitSha", "source_commit_sha"), "source commit"), activatedBy: string(field(context, "activatedBy", "activated_by"), "activated by"), activatedAt: string(field(context, "activatedAt", "activated_at"), "activated at") }; })(),
    publishCapability: capability(field(item, "publishCapability", "publish_capability")),
    activationCapability: capability(field(item, "activationCapability", "activation_capability")),
    auditEvents: list(field(item, "auditEvents", "audit_events"), "audit events").map((entry) => { const audit = object(entry, "audit"); return { id: string(field(audit, "id"), "audit id"), actorId: string(field(audit, "actorId", "actor_id"), "actor id"), action: string(field(audit, "action"), "action"), targetType: enumeration(field(audit, "targetType", "target_type"), ["CHANGE_REQUEST", "REVIEW", "EVIDENCE", "CONTEXT_VERSION"], "target type"), targetId: string(field(audit, "targetId", "target_id"), "target id"), requestId: string(field(audit, "requestId", "request_id"), "request id"), occurredAt: string(field(audit, "occurredAt", "occurred_at"), "occurred at") }; }),
  };
}
