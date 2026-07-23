import type { ProjectMetric, ProjectSummary } from "../model/project";
import type {
  ActiveChangeSummary,
  AlignmentIssue,
  AttentionItem,
  LatestArtifact,
  ProjectDashboard,
  QaRunSummary,
} from "../model/project-dashboard";

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(record: JsonRecord, key: string): string {
  const value = record[key];
  if (typeof value !== "string") throw new Error(`Expected string at ${key}`);
  return value;
}

function readNumber(record: JsonRecord, key: string): number {
  const value = record[key];
  if (typeof value !== "number" || !Number.isFinite(value)) throw new Error(`Expected number at ${key}`);
  return value;
}

function readArray(record: JsonRecord, key: string): unknown[] {
  const value = record[key];
  if (!Array.isArray(value)) throw new Error(`Expected array at ${key}`);
  return value;
}

function readRecord(record: JsonRecord, key: string): JsonRecord {
  const value = record[key];
  if (!isRecord(value)) throw new Error(`Expected object at ${key}`);
  return value;
}

function enumValue<T extends string>(value: string, values: readonly T[], key: string): T {
  if (!values.includes(value as T)) throw new Error(`Unexpected value at ${key}`);
  return value as T;
}

function parseMetric(value: unknown): ProjectMetric {
  if (!isRecord(value)) throw new Error("Expected metric object");
  return {
    id: enumValue(readString(value, "id"), ["activeChanges", "pendingApprovals", "verificationRequired", "alignment"], "metric.id"),
    label: readString(value, "label"),
    value: readString(value, "value"),
    detail: readString(value, "detail"),
    tone: enumValue(readString(value, "tone"), ["neutral", "warning", "success"], "metric.tone"),
  };
}

function parseProject(value: unknown): ProjectSummary {
  if (!isRecord(value)) throw new Error("Expected project object");
  return {
    id: readString(value, "id"),
    name: readString(value, "name"),
    description: readString(value, "description"),
    repository: readString(value, "repository"),
    activeContextVersion: readString(value, "active_context_version"),
    effectiveDate: readString(value, "effective_date"),
    lastVerifiedAt: readString(value, "last_verified_at"),
    health: enumValue(readString(value, "health"), ["ALIGNED", "NEEDS_ATTENTION", "UNVERIFIED"], "project.health"),
    metrics: readArray(value, "metrics").map(parseMetric),
  };
}

function parseActiveChange(value: unknown): ActiveChangeSummary {
  if (!isRecord(value)) throw new Error("Expected active change object");
  return {
    id: readString(value, "id"),
    title: readString(value, "title"),
    status: readString(value, "status"),
    statusLabel: readString(value, "status_label"),
    risk: enumValue(readString(value, "risk"), ["LOW", "MEDIUM", "HIGH"], "change.risk"),
    riskLabel: readString(value, "risk_label"),
    ownerLabel: readString(value, "owner_label"),
    updatedAt: readString(value, "updated_at"),
    updatedLabel: readString(value, "updated_label"),
    attentionPriority: readNumber(value, "attention_priority"),
  };
}

function parseAttention(value: unknown): AttentionItem {
  if (!isRecord(value)) throw new Error("Expected attention object");
  return {
    id: readString(value, "id"),
    kind: enumValue(readString(value, "kind"), ["APPROVAL", "VERIFICATION", "ALIGNMENT"], "attention.kind"),
    title: readString(value, "title"),
    reason: readString(value, "reason"),
    actionLabel: readString(value, "action_label"),
    target: readString(value, "target"),
    priority: enumValue(readString(value, "priority"), ["CRITICAL", "HIGH", "NORMAL"], "attention.priority"),
  };
}

function parseArtifact(value: unknown): LatestArtifact {
  if (!isRecord(value)) throw new Error("Expected artifact object");
  return {
    id: readString(value, "id"),
    title: readString(value, "title"),
    role: enumValue(readString(value, "role"), ["PLANNING", "PUBLISHING", "DEVELOPMENT", "QA"], "artifact.role"),
    roleLabel: readString(value, "role_label"),
    version: readString(value, "version"),
    status: readString(value, "status"),
    statusLabel: readString(value, "status_label"),
    updatedAt: readString(value, "updated_at"),
    updatedLabel: readString(value, "updated_label"),
  };
}

function parseAlignmentIssue(value: unknown): AlignmentIssue {
  if (!isRecord(value)) throw new Error("Expected alignment issue object");
  return {
    id: readString(value, "id"),
    title: readString(value, "title"),
    detail: readString(value, "detail"),
    source: readString(value, "source"),
  };
}

function parseQaRun(value: unknown): QaRunSummary {
  if (!isRecord(value)) throw new Error("Expected QA run object");
  return {
    id: readString(value, "id"),
    title: readString(value, "title"),
    kind: enumValue(readString(value, "kind"), ["AUTOMATED", "MANUAL", "EVALUATION"], "qa.kind"),
    kindLabel: readString(value, "kind_label"),
    result: enumValue(readString(value, "result"), ["PASSED", "FAILED", "PARTIAL", "PENDING"], "qa.result"),
    resultLabel: readString(value, "result_label"),
    runAt: readString(value, "run_at"),
    runLabel: readString(value, "run_label"),
    summary: readString(value, "summary"),
    evidenceCount: readNumber(value, "evidence_count"),
  };
}

export function parseProjectDashboard(value: unknown): ProjectDashboard {
  if (!isRecord(value)) throw new Error("Expected project dashboard object");
  const alignment = readRecord(value, "alignment");

  return {
    project: parseProject(readRecord(value, "project")),
    activeChanges: readArray(value, "active_changes").map(parseActiveChange)
      .sort((a, b) => b.attentionPriority - a.attentionPriority),
    attentionQueue: readArray(value, "attention_queue").map(parseAttention),
    latestArtifacts: readArray(value, "latest_artifacts").map(parseArtifact),
    alignment: {
      status: enumValue(readString(alignment, "status"), ["ALIGNED", "NEEDS_ATTENTION", "UNVERIFIED"], "alignment.status"),
      statusLabel: readString(alignment, "status_label"),
      score: readNumber(alignment, "score"),
      lastCheckedAt: readString(alignment, "last_checked_at"),
      lastCheckedLabel: readString(alignment, "last_checked_label"),
      issues: readArray(alignment, "issues").map(parseAlignmentIssue),
    },
    recentQa: readArray(value, "recent_qa").map(parseQaRun),
  };
}
