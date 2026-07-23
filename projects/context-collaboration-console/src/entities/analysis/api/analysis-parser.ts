import type { AnalysisJob, AnalysisOutcome } from "../model/analysis";
import type { ChangeRequest } from "@entities/change-request";
import type { ImpactNode } from "@entities/impact";
import type { Proposal } from "@entities/proposal";

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function record(value: unknown, key: string): JsonRecord {
  if (!isRecord(value)) throw new Error(`Expected object at ${key}`);
  return value;
}

function stringValue(value: JsonRecord, key: string): string {
  const result = value[key];
  if (typeof result !== "string") throw new Error(`Expected string at ${key}`);
  return result;
}

function nullableString(value: JsonRecord, key: string): string | null {
  const result = value[key];
  if (result === null) return null;
  if (typeof result !== "string") throw new Error(`Expected nullable string at ${key}`);
  return result;
}

function numberValue(value: JsonRecord, key: string): number {
  const result = value[key];
  if (typeof result !== "number" || !Number.isFinite(result)) throw new Error(`Expected number at ${key}`);
  return result;
}

function booleanValue(value: JsonRecord, key: string): boolean {
  const result = value[key];
  if (typeof result !== "boolean") throw new Error(`Expected boolean at ${key}`);
  return result;
}

function arrayValue(value: JsonRecord, key: string): unknown[] {
  const result = value[key];
  if (!Array.isArray(result)) throw new Error(`Expected array at ${key}`);
  return result;
}

function enumValue<T extends string>(value: string, allowed: readonly T[], key: string): T {
  if (!allowed.includes(value as T)) throw new Error(`Unexpected value at ${key}`);
  return value as T;
}

function parseImpact(value: unknown): ImpactNode {
  const item = record(value, "impact");
  return {
    id: stringValue(item, "id"),
    kind: enumValue(stringValue(item, "kind"), ["REQUEST", "PLANNING", "PUBLISHING", "API_CONTRACT", "DATA", "COMPONENT", "CODE", "QA"], "impact.kind"),
    label: stringValue(item, "label"),
    status: enumValue(stringValue(item, "status"), ["AFFECTED", "UNCHANGED", "UNKNOWN"], "impact.status"),
    sourcePath: nullableString(item, "source_path"),
    rationale: stringValue(item, "rationale"),
    reviewable: booleanValue(item, "reviewable"),
  };
}

function parseRequest(value: unknown): ChangeRequest {
  const item = record(value, "request");
  const requester = record(item.requester, "request.requester");
  return {
    id: stringValue(item, "id"),
    projectId: stringValue(item, "project_id"),
    title: stringValue(item, "title"),
    rawRequest: stringValue(item, "raw_request"),
    status: enumValue(stringValue(item, "status"), ["REQUESTED", "ANALYZED", "IN_REVIEW", "CHANGES_REQUESTED", "APPROVED", "IMPLEMENTING", "VERIFYING", "READY_TO_ACTIVATE", "ACTIVATED", "REJECTED"], "request.status"),
    risk: enumValue(stringValue(item, "risk"), ["LOW", "MEDIUM", "HIGH"], "request.risk"),
    requester: {
      id: stringValue(requester, "id"),
      displayName: stringValue(requester, "display_name"),
      role: enumValue(stringValue(requester, "role"), ["viewer", "contributor", "reviewer", "admin"], "requester.role"),
    },
    contextSnapshot: stringValue(item, "context_snapshot"),
    createdAt: stringValue(item, "created_at"),
    updatedAt: stringValue(item, "updated_at"),
  };
}

function parseProposal(value: unknown): Proposal {
  const item = record(value, "proposal");
  return {
    revision: numberValue(item, "revision"),
    summary: stringValue(item, "summary"),
    acceptanceCriteria: arrayValue(item, "acceptance_criteria").map((entry) => {
      const criterion = record(entry, "criterion");
      return { id: stringValue(criterion, "id"), statement: stringValue(criterion, "statement"), priority: enumValue(stringValue(criterion, "priority"), ["P0", "P1"], "criterion.priority") };
    }),
    impacts: arrayValue(item, "impacts").map(parseImpact),
    affectedFiles: arrayValue(item, "affected_files").map((entry) => {
      const file = record(entry, "file");
      return { path: stringValue(file, "path"), changeType: enumValue(stringValue(file, "change_type"), ["CREATE", "UPDATE", "MOVE", "DELETE"], "file.change_type"), reason: stringValue(file, "reason") };
    }),
    risk: enumValue(stringValue(item, "risk"), ["LOW", "MEDIUM", "HIGH"], "proposal.risk"),
    confidence: enumValue(stringValue(item, "confidence"), ["LOW", "MEDIUM", "HIGH"], "proposal.confidence"),
    unknowns: arrayValue(item, "unknowns").map((entry) => {
      if (typeof entry !== "string") throw new Error("Expected unknown string");
      return entry;
    }),
    qaScenarios: arrayValue(item, "qa_scenarios").map((entry) => {
      const scenario = record(entry, "qa scenario");
      return { id: stringValue(scenario, "id"), title: stringValue(scenario, "title"), type: enumValue(stringValue(scenario, "type"), ["AUTOMATED", "MANUAL"], "qa.type"), required: booleanValue(scenario, "required") };
    }),
    contextSnapshotLocked: booleanValue(item, "context_snapshot_locked"),
    createdAt: stringValue(item, "created_at"),
  };
}

export function parseAnalysisJob(value: unknown): AnalysisJob {
  const item = record(value, "analysis job");
  const error = item.error === null ? null : record(item.error, "job.error");
  return {
    id: stringValue(item, "id"),
    projectId: stringValue(item, "project_id"),
    contextSnapshot: stringValue(item, "context_snapshot"),
    rawRequest: stringValue(item, "raw_request"),
    status: enumValue(stringValue(item, "status"), ["QUEUED", "RUNNING", "COMPLETED", "FAILED"], "job.status"),
    stage: enumValue(stringValue(item, "stage"), ["CHECKING_CONTEXT", "STRUCTURING_REQUEST", "DISCOVERING_IMPACTS", "GENERATING_VERIFICATION"], "job.stage"),
    completedStages: arrayValue(item, "completed_stages").map((entry) => enumValue(String(entry), ["CHECKING_CONTEXT", "STRUCTURING_REQUEST", "DISCOVERING_IMPACTS", "GENERATING_VERIFICATION"], "job.completed_stage")),
    attempt: numberValue(item, "attempt"),
    changeId: nullableString(item, "change_id"),
    error: error === null ? null : { code: stringValue(error, "code"), title: stringValue(error, "title"), detail: stringValue(error, "detail") },
    createdAt: stringValue(item, "created_at"),
    updatedAt: stringValue(item, "updated_at"),
  };
}

export function parseAnalysisOutcome(value: unknown): AnalysisOutcome {
  const item = record(value, "analysis outcome");
  return {
    request: parseRequest(item.request),
    proposal: parseProposal(item.proposal),
    clarificationQuestions: arrayValue(item, "clarification_questions").map((entry) => {
      if (typeof entry !== "string") throw new Error("Expected clarification question string");
      return entry;
    }),
  };
}
