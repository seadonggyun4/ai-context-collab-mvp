export const MONITORING_ENDPOINTS = {
  summary: "/api/monitoring/summary",
  ingestions: "/api/monitoring/ingestions",
  issues: "/api/monitoring/issues",
  pipeline: (traceId: string) =>
    `/api/monitoring/pipeline/${encodeURIComponent(traceId)}`,
  actions: "/api/monitoring/actions",
  issueActions: (issueId: string) =>
    `/api/monitoring/issues/${encodeURIComponent(issueId)}/actions`,
  rules: "/api/monitoring/rules",
  rule: (ruleId: string) =>
    `/api/monitoring/rules/${encodeURIComponent(ruleId)}`
} as const;
