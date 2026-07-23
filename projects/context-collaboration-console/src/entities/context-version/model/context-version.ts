export interface ContextVersion {
  version: string;
  projectId: string;
  changeRequestId: string;
  documentIds: readonly string[];
  activatedBy: string;
  activatedAt: string;
}
