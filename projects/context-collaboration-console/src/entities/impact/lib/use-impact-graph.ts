import { useEffect, useState } from "react";

import { useImpactRepository } from "./use-impact-repository";

import type { ImpactGraph } from "../model/impact";
import type { DomainError } from "@shared/lib/result";

export type ImpactGraphState =
  | { status: "loading" }
  | { status: "ready"; graph: ImpactGraph }
  | { status: "not-found" }
  | { status: "error"; error: DomainError };

export function useImpactGraph(projectId: string, changeId: string): ImpactGraphState {
  const repository = useImpactRepository();
  const [state, setState] = useState<ImpactGraphState>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: "loading" });
    void repository.getImpactGraph(projectId, changeId, controller.signal).then((result) => {
      if (controller.signal.aborted) return;
      if (!result.ok) setState({ status: "error", error: result.error });
      else if (result.value === null) setState({ status: "not-found" });
      else setState({ status: "ready", graph: result.value });
    });
    return () => controller.abort();
  }, [changeId, projectId, repository]);

  return state;
}
