import { useEffect, useState } from "react";

import { useAnalysisRepository } from "./use-analysis-repository";

import type { AnalysisOutcome } from "../model/analysis";
import type { DomainError } from "@shared/lib/result";

export type AnalysisOutcomeState =
  | { status: "loading" }
  | { status: "ready"; outcome: AnalysisOutcome }
  | { status: "not-found" }
  | { status: "error"; error: DomainError };

export function useAnalysisOutcome(projectId: string, changeId: string): AnalysisOutcomeState {
  const repository = useAnalysisRepository();
  const [state, setState] = useState<AnalysisOutcomeState>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    void repository.getAnalysisOutcome(projectId, changeId, controller.signal).then((result) => {
      if (controller.signal.aborted) return;
      if (!result.ok) setState({ status: "error", error: result.error });
      else if (result.value === null) setState({ status: "not-found" });
      else setState({ status: "ready", outcome: result.value });
    });
    return () => controller.abort();
  }, [changeId, projectId, repository]);

  return state;
}
