import { domainFailure, domainSuccess } from "@shared/lib/result";

import { parseActivationWorkspace } from "./activation-parser";

import type { ActivationWorkspace } from "../model/activation";
import type { ActivationRepository } from "../model/activation-repository";
import type { DomainResult } from "@shared/lib/result";

interface Options { apiBaseUrl: string; fetcher?: typeof fetch }

function errorText(value: unknown, fallback: string): string { return typeof value === "string" && value !== "" ? value : fallback; }

export function createHttpActivationRepository({ apiBaseUrl, fetcher = fetch }: Options): ActivationRepository {
  const base = apiBaseUrl.replace(/\/$/, "");
  async function request(url: string, init?: RequestInit): Promise<DomainResult<ActivationWorkspace>> {
    try {
      const response = await fetcher(`${base}${url}`, init);
      const payload: unknown = await response.json();
      if (!response.ok) {
        const error = payload as Record<string, unknown>;
        return domainFailure(errorText(error.code, "ACTIVATION_REQUEST_FAILED"), errorText(error.title, "활성화 요청을 처리하지 못했습니다"), errorText(error.detail, "잠시 후 다시 시도하세요."));
      }
      return domainSuccess(parseActivationWorkspace(payload));
    } catch {
      return domainFailure("ACTIVATION_RESPONSE_INVALID", "활성화 응답을 확인할 수 없습니다", "API 연결과 응답 계약을 확인하세요.");
    }
  }
  return {
    async getWorkspace(projectId, changeId, signal) {
      const result = await request(`/api/v1/projects/${encodeURIComponent(projectId)}/changes/${encodeURIComponent(changeId)}/activation-workspace`, signal === undefined ? undefined : { signal });
      return !result.ok && result.error.code === "CHANGE_REQUEST_NOT_FOUND" ? domainSuccess(null) : result;
    },
    publishGit(input, signal) { return request(`/api/v1/changes/${encodeURIComponent(input.changeId)}/git-publications`, { method: "POST", ...(signal === undefined ? {} : { signal }), headers: { "Content-Type": "application/json", "X-Actor-Id": input.actorId, "Idempotency-Key": input.idempotencyKey }, body: JSON.stringify({ projectId: input.projectId, expectedBaseCommitSha: input.expectedBaseCommitSha, proposalRevision: input.proposalRevision, scopeFingerprint: input.scopeFingerprint, implementationRevision: input.implementationRevision }) }); },
    activate(input, signal) { return request(`/api/v1/changes/${encodeURIComponent(input.changeId)}/activations`, { method: "POST", ...(signal === undefined ? {} : { signal }), headers: { "Content-Type": "application/json", "X-Actor-Id": input.actorId, "Idempotency-Key": input.idempotencyKey }, body: JSON.stringify({ projectId: input.projectId, version: input.version, documentIds: input.documentIds }) }); },
  };
}
