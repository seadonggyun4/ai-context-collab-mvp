import { useEffect, useState } from "react";

import { useProjectRepository } from "./use-project-repository";

import type { ProjectDashboard } from "../model/project-dashboard";
import type { DomainError } from "@shared/lib/result";

export type ProjectDashboardState =
  | { status: "loading" }
  | { status: "ready"; dashboard: ProjectDashboard }
  | { status: "not-found" }
  | { status: "error"; error: DomainError };

export function useProjectDashboard(projectId: string): ProjectDashboardState {
  const repository = useProjectRepository();
  const [state, setState] = useState<ProjectDashboardState>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: "loading" });

    void repository.getProjectDashboard(projectId, controller.signal).then((result) => {
      if (controller.signal.aborted) return;
      if (!result.ok) {
        setState({ status: "error", error: result.error });
      } else if (result.value === null) {
        setState({ status: "not-found" });
      } else {
        setState({ status: "ready", dashboard: result.value });
      }
    }).catch((error: unknown) => {
      if (controller.signal.aborted) return;
      setState({
        status: "error",
        error: {
          code: "PROJECT_DASHBOARD_UNEXPECTED_ERROR",
          title: "대시보드를 불러오지 못했습니다",
          detail: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
        },
      });
    });

    return () => controller.abort();
  }, [projectId, repository]);

  return state;
}
