import { useEffect, useState } from "react";

import { useDocumentRepository } from "./use-document-repository";

import type { DocumentDetail } from "../model/document";
import type { DomainError } from "@shared/lib/result";

export type DocumentDetailState =
  | { status: "loading" }
  | { status: "ready"; document: DocumentDetail }
  | { status: "not-found" }
  | { status: "error"; error: DomainError };

export function useDocumentDetail(documentId: string): DocumentDetailState {
  const repository = useDocumentRepository();
  const [state, setState] = useState<DocumentDetailState>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: "loading" });
    void repository.get(documentId, controller.signal).then((result) => {
      if (controller.signal.aborted) return;
      if (!result.ok) setState({ status: "error", error: result.error });
      else if (result.value === null) setState({ status: "not-found" });
      else setState({ status: "ready", document: result.value });
    });
    return () => controller.abort();
  }, [documentId, repository]);

  return state;
}
