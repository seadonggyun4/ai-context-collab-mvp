import type {
  RecordReviewInput,
  RecordVerificationInput,
  ReviewWorkspace,
  TransitionReviewInput,
} from "./review-workspace";
import type { DomainResult } from "@shared/lib/result";

export interface ReviewWorkspaceRepository {
  getWorkspace(projectId: string, changeId: string, signal?: AbortSignal): Promise<DomainResult<ReviewWorkspace | null>>;
  recordReview(input: RecordReviewInput, signal?: AbortSignal): Promise<DomainResult<ReviewWorkspace>>;
  recordVerification(input: RecordVerificationInput, signal?: AbortSignal): Promise<DomainResult<ReviewWorkspace>>;
  transition(input: TransitionReviewInput, signal?: AbortSignal): Promise<DomainResult<ReviewWorkspace>>;
}
