import type { ActivateContextInput, ActivationWorkspace, PublishGitInput } from "./activation";
import type { DomainResult } from "@shared/lib/result";

export interface ActivationRepository {
  getWorkspace(projectId: string, changeId: string, signal?: AbortSignal): Promise<DomainResult<ActivationWorkspace | null>>;
  publishGit(input: PublishGitInput, signal?: AbortSignal): Promise<DomainResult<ActivationWorkspace>>;
  activate(input: ActivateContextInput, signal?: AbortSignal): Promise<DomainResult<ActivationWorkspace>>;
}
