import { domainFailure, domainSuccess } from "@shared/lib/result";

import { parseReviewWorkspace } from "./review-workspace-parser";

import type { ReviewWorkspace } from "../model/review-workspace";
import type { ReviewWorkspaceRepository } from "../model/review-workspace-repository";
import type { DomainError, DomainResult } from "@shared/lib/result";

interface HttpReviewWorkspaceRepositoryOptions {
  apiBaseUrl: string;
  fetcher?: typeof fetch;
}

function errorFromPayload(value: unknown, fallback: DomainError): DomainError {
  if (typeof value !== "object" || value === null) return fallback;
  const item = value as Record<string, unknown>;
  return typeof item.code === "string" && typeof item.title === "string" && typeof item.detail === "string"
    ? { code: item.code, title: item.title, detail: item.detail }
    : fallback;
}

export function createHttpReviewWorkspaceRepository({ apiBaseUrl, fetcher = fetch }: HttpReviewWorkspaceRepositoryOptions): ReviewWorkspaceRepository {
  const baseUrl = apiBaseUrl.replace(/\/$/, "");

  async function request(url: string, init: RequestInit, notFoundAsNull = false): Promise<DomainResult<ReviewWorkspace | null>> {
    let response: Response;
    try {
      response = await fetcher(`${baseUrl}${url}`, init);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") throw error;
      return domainFailure("REVIEW_NETWORK_ERROR", "검토 정보를 불러오지 못했습니다", "API 연결 상태를 확인한 뒤 다시 시도해 주세요.");
    }
    if (response.status === 404 && notFoundAsNull) return domainSuccess(null);
    if (!response.ok) {
      const fallback = { code: "REVIEW_HTTP_ERROR", title: "검토 명령을 처리하지 못했습니다", detail: `API가 ${response.status} 상태를 반환했습니다.` };
      try { return { ok: false, error: errorFromPayload(await response.json(), fallback) }; } catch { return { ok: false, error: fallback }; }
    }
    try { return domainSuccess(parseReviewWorkspace(await response.json())); } catch {
      return domainFailure("REVIEW_INVALID_RESPONSE", "검토 응답을 해석할 수 없습니다", "workspace, diff, capability와 evidence 계약을 확인해 주세요.");
    }
  }

  function mutation(url: string, input: { actorId: string; idempotencyKey: string }, body: object, signal?: AbortSignal) {
    const init: RequestInit = {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json", "Idempotency-Key": input.idempotencyKey, "X-Actor-Id": input.actorId },
      body: JSON.stringify(body),
    };
    if (signal !== undefined) init.signal = signal;
    return request(url, init).then((result): DomainResult<ReviewWorkspace> => result.ok && result.value === null
      ? domainFailure("REVIEW_INVALID_RESPONSE", "검토 응답을 해석할 수 없습니다", "mutation 응답에 workspace가 필요합니다.")
      : result as DomainResult<ReviewWorkspace>);
  }

  return {
    getWorkspace(projectId, changeId, signal) {
      const init: RequestInit = { headers: { Accept: "application/json" } };
      if (signal !== undefined) init.signal = signal;
      return request(`/api/v1/projects/${encodeURIComponent(projectId)}/changes/${encodeURIComponent(changeId)}/review-workspace`, init, true);
    },
    recordReview(input, signal) {
      return mutation(`/api/v1/changes/${encodeURIComponent(input.changeId)}/reviews`, input, {
        projectId: input.projectId, decision: input.decision, proposalRevision: input.proposalRevision, scopeFingerprint: input.scopeFingerprint, comment: input.comment,
      }, signal);
    },
    recordVerification(input, signal) {
      return mutation(`/api/v1/changes/${encodeURIComponent(input.changeId)}/verifications`, input, {
        projectId: input.projectId, testId: input.testId, result: input.result,
      }, signal);
    },
    transition(input, signal) {
      return mutation(`/api/v1/changes/${encodeURIComponent(input.changeId)}/transitions`, input, { projectId: input.projectId, target: input.target }, signal);
    },
  };
}
