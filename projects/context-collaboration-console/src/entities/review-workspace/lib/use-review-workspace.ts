import { useCallback, useEffect, useState } from "react";

import { useReviewWorkspaceRepository } from "./use-review-workspace-repository";

import type { ReviewWorkspace } from "../model/review-workspace";
import type { DomainError } from "@shared/lib/result";

export type ReviewWorkspaceState =
  | { status: "loading" }
  | { status: "ready"; workspace: ReviewWorkspace }
  | { status: "not-found" }
  | { status: "error"; error: DomainError };

export function useReviewWorkspace(projectId: string, changeId: string) {
  const repository = useReviewWorkspaceRepository();
  const [state, setState] = useState<ReviewWorkspaceState>({ status: "loading" });
  const load = useCallback((signal?: AbortSignal) => {
    setState({ status: "loading" });
    void repository.getWorkspace(projectId, changeId, signal).then((result) => {
      if (signal?.aborted === true) return;
      if (!result.ok) setState({ status: "error", error: result.error });
      else if (result.value === null) setState({ status: "not-found" });
      else setState({ status: "ready", workspace: result.value });
    });
  }, [changeId, projectId, repository]);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  return { state, setState, reload: () => load() };
}
