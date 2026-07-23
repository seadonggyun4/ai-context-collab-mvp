import { domainFailure, domainSuccess } from "@shared/lib/result";

import { parseAnalysisJob, parseAnalysisOutcome } from "./analysis-parser";

import type { AnalysisRepository } from "../model/analysis-repository";

interface HttpAnalysisRepositoryOptions {
  apiBaseUrl: string;
  fetcher?: typeof fetch;
}

function requestInit(method: "GET" | "POST", signal: AbortSignal | undefined, body?: unknown, idempotencyKey?: string): RequestInit {
  const headers: Record<string, string> = { Accept: "application/json" };
  const init: RequestInit = { method, headers };
  if (signal !== undefined) init.signal = signal;
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    init.body = JSON.stringify(body);
  }
  if (idempotencyKey !== undefined) headers["Idempotency-Key"] = idempotencyKey;
  return init;
}

function failure(code: string, detail: string) {
  return domainFailure(code, "분석 서비스 요청을 완료하지 못했습니다", detail);
}

export function createHttpAnalysisRepository({ apiBaseUrl, fetcher = fetch }: HttpAnalysisRepositoryOptions): AnalysisRepository {
  const baseUrl = apiBaseUrl.replace(/\/$/, "");

  async function call(url: string, init: RequestInit): Promise<Response | null> {
    try {
      return await fetcher(`${baseUrl}${url}`, init);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") throw error;
      return null;
    }
  }

  return {
    async startAnalysis(input, idempotencyKey, signal) {
      const response = await call(`/api/v1/projects/${encodeURIComponent(input.projectId)}/change-analyses`, requestInit("POST", signal, {
        raw_request: input.rawRequest,
        context_snapshot: input.contextSnapshot,
      }, idempotencyKey));
      if (response === null) return failure("ANALYSIS_NETWORK_ERROR", "API 연결 상태를 확인한 뒤 다시 시도해 주세요.");
      if (!response.ok) return failure("ANALYSIS_START_HTTP_ERROR", `분석 API가 ${response.status} 상태를 반환했습니다.`);
      try { return domainSuccess(parseAnalysisJob(await response.json())); }
      catch { return failure("ANALYSIS_INVALID_RESPONSE", "분석 job 응답이 계약과 다릅니다."); }
    },

    async getAnalysisJob(jobId, signal) {
      const response = await call(`/api/v1/analysis-jobs/${encodeURIComponent(jobId)}`, requestInit("GET", signal));
      if (response === null) return failure("ANALYSIS_NETWORK_ERROR", "API 연결 상태를 확인한 뒤 다시 시도해 주세요.");
      if (response.status === 404) return domainSuccess(null);
      if (!response.ok) return failure("ANALYSIS_POLL_HTTP_ERROR", `분석 API가 ${response.status} 상태를 반환했습니다.`);
      try { return domainSuccess(parseAnalysisJob(await response.json())); }
      catch { return failure("ANALYSIS_INVALID_RESPONSE", "분석 job 응답이 계약과 다릅니다."); }
    },

    async retryAnalysis(jobId, idempotencyKey, signal) {
      const response = await call(`/api/v1/analysis-jobs/${encodeURIComponent(jobId)}/retry`, requestInit("POST", signal, {}, idempotencyKey));
      if (response === null) return failure("ANALYSIS_NETWORK_ERROR", "API 연결 상태를 확인한 뒤 다시 시도해 주세요.");
      if (!response.ok) return failure("ANALYSIS_RETRY_HTTP_ERROR", `분석 API가 ${response.status} 상태를 반환했습니다.`);
      try { return domainSuccess(parseAnalysisJob(await response.json())); }
      catch { return failure("ANALYSIS_INVALID_RESPONSE", "분석 retry 응답이 계약과 다릅니다."); }
    },

    async getAnalysisOutcome(projectId, changeId, signal) {
      const response = await call(`/api/v1/projects/${encodeURIComponent(projectId)}/change-analyses/${encodeURIComponent(changeId)}`, requestInit("GET", signal));
      if (response === null) return failure("ANALYSIS_NETWORK_ERROR", "API 연결 상태를 확인한 뒤 다시 시도해 주세요.");
      if (response.status === 404) return domainSuccess(null);
      if (!response.ok) return failure("ANALYSIS_DETAIL_HTTP_ERROR", `분석 API가 ${response.status} 상태를 반환했습니다.`);
      try { return domainSuccess(parseAnalysisOutcome(await response.json())); }
      catch { return failure("ANALYSIS_INVALID_RESPONSE", "분석 결과 응답이 계약과 다릅니다."); }
    },
  };
}
