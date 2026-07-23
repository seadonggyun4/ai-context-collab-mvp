import type {
  DocumentConflict,
  DocumentDetail,
  DocumentDraftInput,
  DocumentDraftResult,
  DocumentSummary,
  DocumentValidationResult,
} from "./document";
import type { DomainResult } from "@shared/lib/result";

export type DocumentMutationResult<T> = DomainResult<T | DocumentConflict>;

export interface DocumentRepository {
  list(projectId: string, signal?: AbortSignal): Promise<DomainResult<DocumentSummary[]>>;
  get(documentId: string, signal?: AbortSignal): Promise<DomainResult<DocumentDetail | null>>;
  saveDraft(input: DocumentDraftInput, signal?: AbortSignal): Promise<DocumentMutationResult<DocumentDraftResult>>;
  validateDraft(input: DocumentDraftInput, signal?: AbortSignal): Promise<DocumentMutationResult<DocumentValidationResult>>;
}

export function isDocumentConflict(value: unknown): value is DocumentConflict {
  return typeof value === "object" && value !== null && "code" in value
    && value.code === "DOCUMENT_REVISION_CONFLICT";
}
