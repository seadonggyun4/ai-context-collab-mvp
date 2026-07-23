import { domainFailure, domainSuccess } from "@shared/lib/result";

import { parseImpactGraph } from "./impact-graph-parser";

import type { ImpactRepository } from "../model/impact-repository";

interface HttpImpactRepositoryOptions {
  apiBaseUrl: string;
  fetcher?: typeof fetch;
}

export function createHttpImpactRepository({ apiBaseUrl, fetcher = fetch }: HttpImpactRepositoryOptions): ImpactRepository {
  const baseUrl = apiBaseUrl.replace(/\/$/, "");
  return {
    async getImpactGraph(projectId, changeId, signal) {
      const init: RequestInit = { headers: { Accept: "application/json" } };
      if (signal !== undefined) init.signal = signal;
      let response: Response;
      try {
        response = await fetcher(`${baseUrl}/api/v1/projects/${encodeURIComponent(projectId)}/changes/${encodeURIComponent(changeId)}/impact`, init);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") throw error;
        return domainFailure("IMPACT_NETWORK_ERROR", "영향 분석을 불러오지 못했습니다", "API 연결 상태를 확인한 뒤 다시 시도해 주세요.");
      }
      if (response.status === 404) return domainSuccess(null);
      if (!response.ok) return domainFailure("IMPACT_HTTP_ERROR", "영향 분석을 불러오지 못했습니다", `API가 ${response.status} 상태를 반환했습니다.`);
      try {
        return domainSuccess(parseImpactGraph(await response.json()));
      } catch {
        return domainFailure("IMPACT_INVALID_RESPONSE", "영향 분석 응답을 해석할 수 없습니다", "node, edge와 endpoint 계약을 확인해 주세요.");
      }
    },
  };
}
