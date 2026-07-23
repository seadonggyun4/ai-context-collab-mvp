import { domainFailure, domainSuccess } from "@shared/lib/result";

import type {
  DocumentConflict,
  DocumentDetail,
  DocumentDiagnostic,
  DocumentDraftInput,
  DocumentDraftResult,
  DocumentFormat,
  DocumentRole,
  DocumentSummary,
  DocumentType,
  DocumentValidationResult,
} from "../model/document";
import type { DocumentRepository } from "../model/document-repository";

interface HttpDocumentRepositoryOptions {
  apiBaseUrl: string;
  fetcher?: typeof fetch;
}

function record(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null) throw new Error("object expected");
  return value as Record<string, unknown>;
}

function string(value: unknown): string {
  if (typeof value !== "string") throw new Error("string expected");
  return value;
}

function number(value: unknown): number {
  if (typeof value !== "number") throw new Error("number expected");
  return value;
}

function roleFromPath(path: string): DocumentRole {
  if (path.includes("/planning/")) return "PLANNING";
  if (path.includes("/publishing/")) return "PUBLISHING";
  if (path.includes("/development/")) return "DEVELOPMENT";
  if (path.includes("/qa/")) return "QA";
  return "ORGANIZATION";
}

function typeFromRole(role: DocumentRole): DocumentType {
  const mapping: Record<DocumentRole, DocumentType> = {
    ORGANIZATION: "project_context",
    PLANNING: "planning",
    PUBLISHING: "publishing",
    DEVELOPMENT: "development",
    QA: "qa",
  };
  return mapping[role];
}

function parseSummary(value: unknown): DocumentSummary {
  const item = record(value);
  const path = string(item.path);
  const role = roleFromPath(path);
  return {
    id: string(item.id),
    projectId: string(item.projectId),
    path,
    title: string(item.title),
    format: string(item.format) as DocumentFormat,
    role,
    status: "ACTIVE",
    version: string(item.revision).slice(0, 8),
    owner: role === "ORGANIZATION" ? "프로젝트 운영" : role,
    updatedAt: "Git HEAD",
    relationCount: 0,
    revision: string(item.revision),
    sizeBytes: number(item.sizeBytes),
  };
}

function parseDetail(value: unknown): DocumentDetail {
  const item = record(value);
  const summary = parseSummary(item);
  return {
    ...summary,
    source: string(item.source),
    metadata: {
      id: summary.id,
      title: summary.title,
      projectId: summary.projectId,
      documentType: typeFromRole(summary.role),
      status: summary.status,
      version: summary.version,
      sourcePath: summary.path,
      approvedBy: null,
      effectiveAt: null,
    },
    relations: [],
  };
}

function parseDiagnostic(value: unknown): DocumentDiagnostic {
  const item = record(value);
  const from = record(item.from);
  const to = item.to === null || item.to === undefined ? null : record(item.to);
  return {
    severity: string(item.severity) as DocumentDiagnostic["severity"],
    code: string(item.code),
    message: string(item.message),
    from: { line: number(from.line), column: number(from.column) },
    to: to === null ? null : { line: number(to.line), column: number(to.column) },
  };
}

function parseConflict(value: unknown): DocumentConflict {
  const item = record(value);
  if (item.code !== "DOCUMENT_REVISION_CONFLICT") throw new Error("conflict expected");
  return {
    code: "DOCUMENT_REVISION_CONFLICT",
    title: string(item.title),
    detail: string(item.detail),
    baseRevision: string(item.baseRevision),
    currentRevision: string(item.currentRevision),
    baseSource: string(item.baseSource),
    currentSource: string(item.currentSource),
    draftSource: string(item.draftSource),
  };
}

function requestInit(input: DocumentDraftInput, signal?: AbortSignal): RequestInit {
  const init: RequestInit = {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "Idempotency-Key": input.clientDraftId,
    },
  };
  if (signal !== undefined) init.signal = signal;
  return init;
}

async function parseMutation<T>(
  response: Response,
  parseValue: (value: unknown) => T,
) {
  const payload: unknown = await response.json();
  if (response.status === 409) return domainSuccess<T | DocumentConflict>(parseConflict(payload));
  if (!response.ok) return domainFailure("DOCUMENT_MUTATION_HTTP_ERROR", "문서 작업을 완료하지 못했습니다", `API가 ${response.status} 상태를 반환했습니다.`);
  return domainSuccess<T | DocumentConflict>(parseValue(payload));
}

export function createHttpDocumentRepository({ apiBaseUrl, fetcher = fetch }: HttpDocumentRepositoryOptions): DocumentRepository {
  const baseUrl = apiBaseUrl.replace(/\/$/, "");

  return {
    async list(projectId, signal) {
      try {
        const init: RequestInit = { headers: { Accept: "application/json" } };
        if (signal !== undefined) init.signal = signal;
        const response = await fetcher(`${baseUrl}/api/v1/projects/${encodeURIComponent(projectId)}/documents`, init);
        if (!response.ok) return domainFailure("DOCUMENT_LIST_HTTP_ERROR", "문서 목록을 불러오지 못했습니다", `API가 ${response.status} 상태를 반환했습니다.`);
        const payload = record(await response.json());
        if (!Array.isArray(payload.items)) throw new Error("items expected");
        return domainSuccess(payload.items.map(parseSummary));
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") throw error;
        return domainFailure("DOCUMENT_LIST_NETWORK_ERROR", "문서 목록을 불러오지 못했습니다", "API 연결과 응답 계약을 확인해 주세요.");
      }
    },
    async get(documentId, signal) {
      try {
        const init: RequestInit = { headers: { Accept: "application/json" } };
        if (signal !== undefined) init.signal = signal;
        const response = await fetcher(`${baseUrl}/api/v1/documents/${encodeURIComponent(documentId)}`, init);
        if (response.status === 404) return domainSuccess(null);
        if (!response.ok) return domainFailure("DOCUMENT_DETAIL_HTTP_ERROR", "문서를 불러오지 못했습니다", `API가 ${response.status} 상태를 반환했습니다.`);
        return domainSuccess(parseDetail(await response.json()));
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") throw error;
        return domainFailure("DOCUMENT_DETAIL_NETWORK_ERROR", "문서를 불러오지 못했습니다", "API 연결과 응답 계약을 확인해 주세요.");
      }
    },
    async saveDraft(input, signal) {
      try {
        const init = requestInit(input, signal);
        init.body = JSON.stringify({ content: input.content, baseRevision: input.baseRevision, clientDraftId: input.clientDraftId });
        const response = await fetcher(`${baseUrl}/api/v1/documents/${encodeURIComponent(input.documentId)}/drafts`, init);
        return await parseMutation<DocumentDraftResult>(response, (value) => {
          const item = record(value);
          return {
            clientDraftId: string(item.clientDraftId),
            documentId: string(item.documentId),
            baseRevision: string(item.baseRevision),
            savedAt: string(item.savedAt),
            valid: item.valid === true,
            diagnostics: Array.isArray(item.diagnostics) ? item.diagnostics.map(parseDiagnostic) : [],
          };
        });
      } catch {
        return domainFailure("DOCUMENT_DRAFT_NETWORK_ERROR", "초안을 저장하지 못했습니다", "입력 내용은 브라우저에 보존했습니다. 연결 후 다시 시도해 주세요.");
      }
    },
    async validateDraft(input, signal) {
      try {
        const init = requestInit(input, signal);
        init.body = JSON.stringify({ content: input.content, baseRevision: input.baseRevision });
        const response = await fetcher(`${baseUrl}/api/v1/documents/${encodeURIComponent(input.documentId)}/validate`, init);
        return await parseMutation<DocumentValidationResult>(response, (value) => {
          const item = record(value);
          return {
            documentId: string(item.documentId),
            baseRevision: string(item.baseRevision),
            currentRevision: string(item.currentRevision),
            valid: item.valid === true,
            diagnostics: Array.isArray(item.diagnostics) ? item.diagnostics.map(parseDiagnostic) : [],
          };
        });
      } catch {
        return domainFailure("DOCUMENT_VALIDATION_NETWORK_ERROR", "문서를 검증하지 못했습니다", "연결 상태를 확인한 뒤 다시 시도해 주세요.");
      }
    },
  };
}
