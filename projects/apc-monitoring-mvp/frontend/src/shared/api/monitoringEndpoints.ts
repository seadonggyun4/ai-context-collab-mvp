export const MONITORING_ENDPOINTS = {
  summary: "/api/monitoring/summary",
  ingestions: "/api/monitoring/ingestions",
  issues: "/api/monitoring/issues",
  pipeline: (traceId: string) =>
    `/api/monitoring/pipeline/${encodeURIComponent(traceId)}`
} as const;
