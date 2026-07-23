export type ProjectHealth = "ALIGNED" | "NEEDS_ATTENTION" | "UNVERIFIED";

export interface ProjectMetric {
  id: "activeChanges" | "pendingApprovals" | "verificationRequired" | "alignment";
  label: string;
  value: string;
  detail: string;
  tone: "neutral" | "warning" | "success";
}

export interface Project {
  id: string;
  name: string;
  description: string;
  repository: string;
  activeContextVersion: string;
  effectiveDate: string;
  health: ProjectHealth;
}

export interface ProjectSummary extends Project {
  lastVerifiedAt: string;
  metrics: readonly ProjectMetric[];
}
