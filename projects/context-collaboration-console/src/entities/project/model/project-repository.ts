import type { ProjectDashboard } from "./project-dashboard";
import type { DomainResult } from "@shared/lib/result";

export interface ProjectRepository {
  getProjectDashboard(
    projectId: string,
    signal?: AbortSignal,
  ): Promise<DomainResult<ProjectDashboard | null>>;
}
