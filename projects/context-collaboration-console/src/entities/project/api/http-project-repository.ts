import { domainFailure, domainSuccess } from "@shared/lib/result";

import { parseProjectDashboard } from "./project-dashboard-parser";

import type { ProjectRepository } from "../model/project-repository";

interface HttpProjectRepositoryOptions {
  apiBaseUrl: string;
  fetcher?: typeof fetch;
}

export function createHttpProjectRepository({ apiBaseUrl, fetcher = fetch }: HttpProjectRepositoryOptions): ProjectRepository {
  const normalizedBaseUrl = apiBaseUrl.replace(/\/$/, "");

  return {
    async getProjectDashboard(projectId, signal) {
      let response: Response;
      try {
        const requestInit: RequestInit = { headers: { Accept: "application/json" } };
        if (signal !== undefined) requestInit.signal = signal;
        response = await fetcher(`${normalizedBaseUrl}/api/v1/projects/${encodeURIComponent(projectId)}/dashboard`, requestInit);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") throw error;
        return domainFailure("PROJECT_DASHBOARD_NETWORK_ERROR", "대시보드를 불러오지 못했습니다", "API 연결 상태를 확인한 뒤 다시 시도해 주세요.");
      }

      if (response.status === 404) return domainSuccess(null);
      if (!response.ok) {
        return domainFailure("PROJECT_DASHBOARD_HTTP_ERROR", "대시보드를 불러오지 못했습니다", `API가 ${response.status} 상태를 반환했습니다.`);
      }

      try {
        return domainSuccess(parseProjectDashboard(await response.json()));
      } catch {
        return domainFailure("PROJECT_DASHBOARD_INVALID_RESPONSE", "대시보드 응답을 해석할 수 없습니다", "API 계약과 frontend dashboard schema를 확인해 주세요.");
      }
    },
  };
}
