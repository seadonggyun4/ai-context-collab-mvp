import { parseDocument } from "yaml";

import { domainSuccess } from "@shared/lib/result";

import type {
  DocumentConflict,
  DocumentDetail,
  DocumentDiagnostic,
  DocumentDraftInput,
  DocumentFormat,
  DocumentRole,
  DocumentSummary,
  DocumentType,
} from "../model/document";
import type { DocumentRepository } from "../model/document-repository";

const projectId = "apc-monitoring-mvp";
const revision = "4a7db4a22644d9560e23695859889cd1d2c70ed4";

function detail(input: {
  key: string;
  path: string;
  title: string;
  format: DocumentFormat;
  role: DocumentRole;
  type: DocumentType;
  version: string;
  owner: string;
  updatedAt: string;
  source: string;
}): DocumentDetail {
  const id = `${projectId}:${input.key}`;
  return {
    id,
    projectId,
    path: input.path,
    title: input.title,
    format: input.format,
    role: input.role,
    status: "ACTIVE",
    version: input.version,
    owner: input.owner,
    updatedAt: input.updatedAt,
    relationCount: input.role === "ORGANIZATION" ? 4 : 2,
    revision,
    sizeBytes: new TextEncoder().encode(input.source).length,
    source: input.source,
    metadata: {
      id,
      title: input.title,
      projectId,
      documentType: input.type,
      status: "ACTIVE",
      version: input.version,
      sourcePath: input.path,
      approvedBy: "운영협의체",
      effectiveAt: "2026-07-22",
    },
    relations: [],
  };
}

const documents = [
  detail({
    key: "0a1b2c3d4e5f60718293",
    path: "docs/apc-monitoring-mvp/Project_Context.md",
    title: "Project Context",
    format: "MARKDOWN",
    role: "ORGANIZATION",
    type: "project_context",
    version: "2026.07.22",
    owner: "프로젝트 운영",
    updatedAt: "2026-07-22T11:32:00+09:00",
    source: `# APC 데이터 운영 모니터링\n\n## 목적\n\nAPC 운영 데이터와 협업 기준을 하나의 문맥으로 관리합니다.\n\n## 활성 범위\n\n- 감귤·당근 수신 상태\n- 변경 요청 영향 분석\n- 승인과 검증 증거\n`,
  }),
  detail({
    key: "1a2b3c4d5e6f708192a3",
    path: "docs/apc-monitoring-mvp/workflow-policy.yaml",
    title: "Workflow Policy",
    format: "YAML",
    role: "ORGANIZATION",
    type: "organization_standard",
    version: "1.4",
    owner: "플랫폼 거버넌스",
    updatedAt: "2026-07-22T10:18:00+09:00",
    source: `version: "1.4"\nproject: apc-monitoring-mvp\napproval:\n  high_risk:\n    required_roles:\n      - PRODUCT_OWNER\n      - QA_LEAD\nvalidation:\n  require_evidence: true\n`,
  }),
  detail({
    key: "2a3b4c5d6e7f8091a2b3",
    path: "docs/apc-monitoring-mvp/roles/planning/01_product_requirements.md",
    title: "제품 요구사항",
    format: "MARKDOWN",
    role: "PLANNING",
    type: "planning",
    version: "1.6",
    owner: "기획",
    updatedAt: "2026-07-22T09:10:00+09:00",
    source: "# 제품 요구사항\n\n## 운영 대시보드\n\n사용자는 변경 요청과 검증 상태를 한 화면에서 확인합니다.\n",
  }),
  detail({
    key: "3a4b5c6d7e8f9012a3b4",
    path: "docs/apc-monitoring-mvp/roles/development/02_backend_contract.md",
    title: "Backend API 계약",
    format: "MARKDOWN",
    role: "DEVELOPMENT",
    type: "development",
    version: "1.3",
    owner: "개발",
    updatedAt: "2026-07-21T17:40:00+09:00",
    source: "# Backend API 계약\n\n## Draft 저장\n\n모든 저장 요청은 base revision과 idempotency key를 포함합니다.\n",
  }),
  detail({
    key: "4a5b6c7d8e9f0123a4b5",
    path: "docs/apc-monitoring-mvp/roles/qa/03_acceptance.md",
    title: "QA 수용 기준",
    format: "MARKDOWN",
    role: "QA",
    type: "qa",
    version: "1.3",
    owner: "QA",
    updatedAt: "2026-07-22T10:05:00+09:00",
    source: "# QA 수용 기준\n\n- 한글 IME 조합 중 자동 저장하지 않습니다.\n- revision 충돌은 사용자 선택 전까지 원본을 덮어쓰지 않습니다.\n",
  }),
] satisfies DocumentDetail[];

documents[0]?.relations.push({
  fromDocumentId: documents[0].id,
  toDocumentId: documents[1]?.id ?? "",
  relationType: "governed_by",
  reason: "프로젝트 문맥은 회사 공용 workflow 정책을 따릅니다.",
});
documents[2]?.relations.push({
  fromDocumentId: documents[2].id,
  toDocumentId: documents[3]?.id ?? "",
  relationType: "impacts",
  reason: "제품 요구사항이 API 계약의 입력 기준입니다.",
});

function summary(document: DocumentDetail): DocumentSummary {
  return {
    id: document.id,
    projectId: document.projectId,
    path: document.path,
    title: document.title,
    format: document.format,
    role: document.role,
    status: document.status,
    version: document.version,
    owner: document.owner,
    updatedAt: document.updatedAt,
    relationCount: document.relationCount,
    revision: document.revision,
    sizeBytes: document.sizeBytes,
  };
}

function diagnostics(content: string, format: DocumentFormat, path: string): DocumentDiagnostic[] {
  if (content.trim() === "") return [{ severity: "ERROR", code: "DOCUMENT_EMPTY", message: "문서 내용을 입력해 주세요.", from: { line: 1, column: 1 }, to: null }];
  if (format === "MARKDOWN") {
    return /^#\s+.+/m.test(content) ? [] : [{ severity: "WARNING", code: "MARKDOWN_H1_MISSING", message: "문서의 최상위 제목(H1)을 확인해 주세요.", from: { line: 1, column: 1 }, to: null }];
  }
  const parsed = parseDocument(content);
  const syntaxDiagnostics = parsed.errors.map((error) => ({
    severity: "ERROR",
    code: "YAML_PARSE_ERROR",
    message: error.message.split(" at line")[0] ?? error.message,
    from: { line: error.linePos?.[0]?.line ?? 1, column: error.linePos?.[0]?.col ?? 1 },
    to: null,
  })) satisfies DocumentDiagnostic[];
  if (syntaxDiagnostics.length > 0 || !path.endsWith("/workflow-policy.yaml")) return syntaxDiagnostics;

  const value: unknown = parsed.toJS();
  if (typeof value !== "object" || value === null) return syntaxDiagnostics;
  const policy = value as Record<string, unknown>;
  const required = ["version", "project", "approval", "validation"];
  const missing = required.find((key) => !(key in policy));
  if (missing !== undefined) {
    return [{ severity: "ERROR", code: "SCHEMA_REQUIRED", message: `필수 필드가 누락되었습니다: ${missing}`, from: { line: 1, column: 1 }, to: null }];
  }
  const approval = policy.approval;
  if (typeof approval === "object" && approval !== null && !("high_risk" in approval)) {
    const line = Math.max(content.split("\n").findIndex((item) => /^approval\s*:/.test(item)) + 1, 1);
    return [{ severity: "ERROR", code: "SCHEMA_REQUIRED", message: "필수 필드가 누락되었습니다: high_risk", from: { line, column: 1 }, to: null }];
  }
  return [];
}

export interface FixtureDocumentRepository extends DocumentRepository {
  advanceRevision(documentId: string, source?: string): void;
}

export function createFixtureDocumentRepository(): FixtureDocumentRepository {
  const current = new Map(documents.map((document) => [document.id, structuredClone(document)]));

  function conflict(document: DocumentDetail, input: DocumentDraftInput): DocumentConflict {
    return {
      code: "DOCUMENT_REVISION_CONFLICT",
      title: "문서 원본이 변경되었습니다",
      detail: "최신 원본과 현재 초안을 비교한 뒤 기준 revision을 선택해 주세요.",
      baseRevision: input.baseRevision,
      currentRevision: document.revision,
      baseSource: "",
      currentSource: document.source,
      draftSource: input.content,
    };
  }

  return {
    list(requestedProjectId) {
      return Promise.resolve(domainSuccess(
        [...current.values()].filter((document) => document.projectId === requestedProjectId).map(summary),
      ));
    },
    get(documentId) {
      return Promise.resolve(domainSuccess(structuredClone(current.get(documentId) ?? null)));
    },
    saveDraft(input) {
      const document = current.get(input.documentId);
      if (document === undefined) return Promise.resolve(domainSuccess(null as never));
      if (document.revision !== input.baseRevision) return Promise.resolve(domainSuccess(conflict(document, input)));
      const resultDiagnostics = diagnostics(input.content, document.format, document.path);
      return Promise.resolve(domainSuccess({
        clientDraftId: input.clientDraftId,
        documentId: input.documentId,
        baseRevision: input.baseRevision,
        savedAt: new Date().toISOString(),
        valid: !resultDiagnostics.some((item) => item.severity === "ERROR"),
        diagnostics: resultDiagnostics,
      }));
    },
    validateDraft(input) {
      const document = current.get(input.documentId);
      if (document === undefined) return Promise.resolve(domainSuccess(null as never));
      if (document.revision !== input.baseRevision) return Promise.resolve(domainSuccess(conflict(document, input)));
      const resultDiagnostics = diagnostics(input.content, document.format, document.path);
      return Promise.resolve(domainSuccess({
        documentId: input.documentId,
        baseRevision: input.baseRevision,
        currentRevision: document.revision,
        valid: !resultDiagnostics.some((item) => item.severity === "ERROR"),
        diagnostics: resultDiagnostics,
      }));
    },
    advanceRevision(documentId, source) {
      const document = current.get(documentId);
      if (document === undefined) return;
      document.revision = "9".repeat(40);
      document.source = source ?? `${document.source}\n<!-- 외부 변경 -->\n`;
    },
  };
}

export const fixtureDocumentRepository = createFixtureDocumentRepository();
