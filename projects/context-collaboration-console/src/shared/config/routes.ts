export const routes = {
  home: "/",
  project: (projectId: string) => `/projects/${projectId}`,
  changes: (projectId: string) => `/projects/${projectId}/changes`,
  newChange: (projectId: string) => `/projects/${projectId}/changes/new`,
  change: (projectId: string, changeId: string) => `/projects/${projectId}/changes/${changeId}`,
  impact: (projectId: string, changeId: string) => `/projects/${projectId}/changes/${changeId}/impact`,
  review: (projectId: string, changeId: string) => `/projects/${projectId}/changes/${changeId}/review`,
  activation: (projectId: string, changeId: string) => `/projects/${projectId}/changes/${changeId}/activation`,
  context: (projectId: string) => `/projects/${projectId}/context`,
  document: (projectId: string, documentId: string) => `/projects/${projectId}/context/${encodeURIComponent(documentId)}`,
  evidence: (projectId: string) => `/projects/${projectId}/evidence`,
} as const;

export const primaryProjectId = "apc-monitoring-mvp";
