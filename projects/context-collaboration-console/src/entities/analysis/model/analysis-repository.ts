import type { AnalysisJob, AnalysisOutcome, StartAnalysisInput } from "./analysis";
import type { DomainResult } from "@shared/lib/result";


export interface AnalysisRepository {
  startAnalysis(input: StartAnalysisInput, idempotencyKey: string, signal?: AbortSignal): Promise<DomainResult<AnalysisJob>>;
  getAnalysisJob(jobId: string, signal?: AbortSignal): Promise<DomainResult<AnalysisJob | null>>;
  retryAnalysis(jobId: string, idempotencyKey: string, signal?: AbortSignal): Promise<DomainResult<AnalysisJob>>;
  getAnalysisOutcome(projectId: string, changeId: string, signal?: AbortSignal): Promise<DomainResult<AnalysisOutcome | null>>;
}
