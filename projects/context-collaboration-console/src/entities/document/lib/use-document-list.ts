import { useEffect, useState } from "react";

import { useDocumentRepository } from "./use-document-repository";

import type { DocumentSummary } from "../model/document";
import type { DomainError } from "@shared/lib/result";

export type DocumentListState =
  | { status: "loading" }
  | { status: "ready"; documents: DocumentSummary[] }
  | { status: "error"; error: DomainError };

export function useDocumentList(projectId: string): DocumentListState {
  const repository = useDocumentRepository();
  const [state, setState] = useState<DocumentListState>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: "loading" });
    void repository.list(projectId, controller.signal).then((result) => {
      if (controller.signal.aborted) return;
      setState(result.ok ? { status: "ready", documents: result.value } : { status: "error", error: result.error });
    });
    return () => controller.abort();
  }, [projectId, repository]);

  return state;
}
