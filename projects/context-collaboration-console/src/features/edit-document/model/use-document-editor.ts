import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { isDocumentConflict, useDocumentRepository } from "@entities/document";

import type { DocumentConflict, DocumentDetail, DocumentDiagnostic } from "@entities/document";
import type { DomainError } from "@shared/lib/result";

export type EditorSaveStatus = "clean" | "dirty" | "saving" | "saved" | "invalid" | "offline" | "conflict";

interface StoredDraft {
  content: string;
  baseRevision: string;
  baseSource: string;
  clientDraftId: string;
}

function storageKey(documentId: string) {
  return `context-console.document-draft.v1:${documentId}`;
}

function readDraft(document: DocumentDetail): StoredDraft | null {
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(storageKey(document.id)) ?? "null");
    if (typeof value !== "object" || value === null) return null;
    const draft = value as Partial<StoredDraft>;
    return typeof draft.content === "string" && typeof draft.baseRevision === "string" && typeof draft.clientDraftId === "string"
      ? { content: draft.content, baseRevision: draft.baseRevision, baseSource: typeof draft.baseSource === "string" ? draft.baseSource : document.source, clientDraftId: draft.clientDraftId }
      : null;
  } catch {
    return null;
  }
}

function newDraftId() {
  return `draft-${crypto.randomUUID()}`;
}

export function useDocumentEditor(document: DocumentDetail) {
  const repository = useDocumentRepository();
  const initialDraft = useMemo(() => readDraft(document), [document]);
  const [content, setContent] = useState(initialDraft?.content ?? document.source);
  const [baseRevision, setBaseRevision] = useState(initialDraft?.baseRevision ?? document.revision);
  const [baseSource, setBaseSource] = useState(initialDraft?.baseSource ?? document.source);
  const [clientDraftId] = useState(initialDraft?.clientDraftId ?? newDraftId);
  const [status, setStatus] = useState<EditorSaveStatus>(initialDraft === null ? "clean" : "dirty");
  const [diagnostics, setDiagnostics] = useState<DocumentDiagnostic[]>([]);
  const [conflict, setConflict] = useState<DocumentConflict | null>(null);
  const [error, setError] = useState<DomainError | null>(null);
  const sequence = useRef(0);

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey(document.id), JSON.stringify({ content, baseRevision, baseSource, clientDraftId }));
    } catch {
      setStatus("offline");
    }
  }, [baseRevision, baseSource, clientDraftId, content, document.id]);

  const save = useCallback(async () => {
    const requestSequence = ++sequence.current;
    setStatus("saving");
    setError(null);
    const result = await repository.saveDraft({ documentId: document.id, content, baseRevision, clientDraftId });
    if (requestSequence !== sequence.current) return;
    if (!result.ok) {
      setError(result.error);
      setStatus("offline");
      return;
    }
    if (isDocumentConflict(result.value)) {
      setConflict({ ...result.value, baseSource: result.value.baseSource || baseSource });
      setStatus("conflict");
      return;
    }
    setDiagnostics(result.value.diagnostics);
    setStatus(result.value.valid ? "saved" : "invalid");
  }, [baseRevision, baseSource, clientDraftId, content, document.id, repository]);

  useEffect(() => {
    if (status !== "dirty") return;
    const timeout = window.setTimeout(() => void save(), 700);
    return () => window.clearTimeout(timeout);
  }, [save, status]);

  const updateContent = useCallback((nextContent: string) => {
    setContent(nextContent);
    setStatus("dirty");
    setConflict(null);
  }, []);

  const validate = useCallback(async () => {
    const result = await repository.validateDraft({ documentId: document.id, content, baseRevision, clientDraftId });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    if (isDocumentConflict(result.value)) {
      setConflict({ ...result.value, baseSource: result.value.baseSource || baseSource });
      setStatus("conflict");
      return;
    }
    setDiagnostics(result.value.diagnostics);
    setStatus(result.value.valid ? "saved" : "invalid");
  }, [baseRevision, baseSource, clientDraftId, content, document.id, repository]);

  const keepDraftOnLatest = useCallback(() => {
    if (conflict === null) return;
    setBaseRevision(conflict.currentRevision);
    setBaseSource(conflict.currentSource);
    setConflict(null);
    setStatus("dirty");
  }, [conflict]);

  const replaceWithLatest = useCallback(() => {
    if (conflict === null) return;
    setContent(conflict.currentSource);
    setBaseRevision(conflict.currentRevision);
    setBaseSource(conflict.currentSource);
    setDiagnostics([]);
    setConflict(null);
    setStatus("clean");
  }, [conflict]);

  return {
    content,
    baseRevision,
    status,
    diagnostics,
    conflict,
    error,
    updateContent,
    save,
    validate,
    keepDraftOnLatest,
    replaceWithLatest,
  };
}
