import type { ProjectSummary } from "./project";

export type AttentionKind = "APPROVAL" | "VERIFICATION" | "ALIGNMENT";
export type AttentionPriority = "CRITICAL" | "HIGH" | "NORMAL";
export type DashboardTone = "neutral" | "info" | "success" | "warning" | "danger";

export interface ActiveChangeSummary {
  id: string;
  title: string;
  status: string;
  statusLabel: string;
  risk: "LOW" | "MEDIUM" | "HIGH";
  riskLabel: string;
  ownerLabel: string;
  updatedAt: string;
  updatedLabel: string;
  attentionPriority: number;
}

export interface AttentionItem {
  id: string;
  kind: AttentionKind;
  title: string;
  reason: string;
  actionLabel: string;
  target: string;
  priority: AttentionPriority;
}

export interface LatestArtifact {
  id: string;
  title: string;
  role: "PLANNING" | "PUBLISHING" | "DEVELOPMENT" | "QA";
  roleLabel: string;
  version: string;
  status: string;
  statusLabel: string;
  updatedAt: string;
  updatedLabel: string;
}

export interface AlignmentIssue {
  id: string;
  title: string;
  detail: string;
  source: string;
}

export interface AlignmentSummary {
  status: "ALIGNED" | "NEEDS_ATTENTION" | "UNVERIFIED";
  statusLabel: string;
  score: number;
  lastCheckedAt: string;
  lastCheckedLabel: string;
  issues: readonly AlignmentIssue[];
}

export interface QaRunSummary {
  id: string;
  title: string;
  kind: "AUTOMATED" | "MANUAL" | "EVALUATION";
  kindLabel: string;
  result: "PASSED" | "FAILED" | "PARTIAL" | "PENDING";
  resultLabel: string;
  runAt: string;
  runLabel: string;
  summary: string;
  evidenceCount: number;
}

export interface ProjectDashboard {
  project: ProjectSummary;
  activeChanges: readonly ActiveChangeSummary[];
  attentionQueue: readonly AttentionItem[];
  latestArtifacts: readonly LatestArtifact[];
  alignment: AlignmentSummary;
  recentQa: readonly QaRunSummary[];
}
