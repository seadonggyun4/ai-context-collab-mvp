import type { ImpactGraph } from "./impact";
import type { DomainResult } from "@shared/lib/result";

export interface ImpactRepository {
  getImpactGraph(projectId: string, changeId: string, signal?: AbortSignal): Promise<DomainResult<ImpactGraph | null>>;
}
