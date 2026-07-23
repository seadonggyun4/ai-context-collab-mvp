export const DOCUMENT_TYPES = [
  "project_context",
  "active_context",
  "organization_standard",
  "planning",
  "publishing",
  "development",
  "qa",
  "change_manifest",
  "evidence",
  "impact_analysis",
] as const;

export const DOCUMENT_STATUSES = ["DRAFT", "ACTIVE", "DEPRECATED", "SUPERSEDED", "ARCHIVED"] as const;

export const DOCUMENT_RELATION_TYPES = [
  "governed_by",
  "derives_from",
  "impacts",
  "implements",
  "verifies",
  "supersedes",
  "evidences",
] as const;

export const DOCUMENT_METADATA_REQUIRED_FIELDS = [
  "id",
  "title",
  "project_id",
  "document_type",
  "status",
  "version",
  "source_path",
  "approved_by",
  "effective_at",
] as const;

export const DOCUMENT_RELATION_REQUIRED_FIELDS = [
  "from_document_id",
  "to_document_id",
  "relation_type",
  "reason",
] as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[number];
export type DocumentStatus = (typeof DOCUMENT_STATUSES)[number];
export type DocumentRelationType = (typeof DOCUMENT_RELATION_TYPES)[number];
export type DocumentRole = "ORGANIZATION" | "PLANNING" | "PUBLISHING" | "DEVELOPMENT" | "QA";
export type DocumentFormat = "MARKDOWN" | "YAML";

export interface DocumentMetadata {
  id: string;
  title: string;
  projectId: string;
  documentType: DocumentType;
  status: DocumentStatus;
  version: string;
  sourcePath: string;
  approvedBy: string | null;
  effectiveAt: string | null;
}

export interface Document {
  id: string;
  path: string;
  role: DocumentRole;
  status: DocumentStatus;
  version: string;
  metadata: DocumentMetadata;
  source: string;
  revision: string;
}

export interface DocumentRelation {
  fromDocumentId: string;
  toDocumentId: string;
  relationType: DocumentRelationType;
  reason: string;
}

export interface DocumentSummary {
  id: string;
  projectId: string;
  path: string;
  title: string;
  format: DocumentFormat;
  role: DocumentRole;
  status: DocumentStatus;
  version: string;
  owner: string;
  updatedAt: string;
  relationCount: number;
  revision: string;
  sizeBytes: number;
}

export interface DocumentDetail extends DocumentSummary {
  source: string;
  metadata: DocumentMetadata;
  relations: DocumentRelation[];
}

export type DocumentDiagnosticSeverity = "ERROR" | "WARNING" | "INFO";

export interface DocumentPosition {
  line: number;
  column: number;
}

export interface DocumentDiagnostic {
  severity: DocumentDiagnosticSeverity;
  code: string;
  message: string;
  from: DocumentPosition;
  to: DocumentPosition | null;
}

export interface DocumentDraftInput {
  documentId: string;
  content: string;
  baseRevision: string;
  clientDraftId: string;
}

export interface DocumentDraftResult {
  clientDraftId: string;
  documentId: string;
  baseRevision: string;
  savedAt: string;
  valid: boolean;
  diagnostics: DocumentDiagnostic[];
}

export interface DocumentValidationResult {
  documentId: string;
  baseRevision: string;
  currentRevision: string;
  valid: boolean;
  diagnostics: DocumentDiagnostic[];
}

export interface DocumentConflict {
  code: "DOCUMENT_REVISION_CONFLICT";
  title: string;
  detail: string;
  baseRevision: string;
  currentRevision: string;
  baseSource: string;
  currentSource: string;
  draftSource: string;
}
