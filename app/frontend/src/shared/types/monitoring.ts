export type ApcName = "NAMWON" | "WIMI" | "SEOGWI" | "JUNGMUN" | "GUJWA";

export type CropType = "CITRUS" | "CARROT";

export type SnpSe = "WRHS" | "CLSFY";

export type MonitoringStatus =
  | "NORMAL"
  | "DELAYED"
  | "ERROR"
  | "MISSING"
  | "UNDEFINED_RULE";

export type IssueStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "IGNORED";

export type IssueSeverity = "HIGH" | "MEDIUM" | "LOW";

export type PipelineStepStatus =
  | "SUCCESS"
  | "RUNNING"
  | "FAILED"
  | "SKIPPED"
  | "UNDEFINED";

export type PipelineStepKey =
  | "API_RECEIVED"
  | "AUTH_SCHEMA_VALIDATED"
  | "ORIGIN_SAVED"
  | "REFINED_SAVED"
  | "AIRFLOW_SNAPSHOT_LOADED"
  | "GUIDANCE_API_AVAILABLE"
  | "SCREEN_RENDERED";

export type IssueType =
  | "REQUIRED_FIELD_MISSING"
  | "INVALID_FORMAT"
  | "DUPLICATE_SUSPECTED"
  | "OUTLIER_QUANTITY_WEIGHT"
  | "UNSUPPORTED_APC_CROP"
  | "REFINED_FAILED";

export type UserRole = "ADMIN" | "OPERATOR" | "VIEWER";

export interface StatusDistributionItem {
  status: MonitoringStatus;
  label: string;
  count: number;
}

export interface RecentIssueItem {
  issueId: string;
  traceId?: string | null;
  occurredAt: string;
  apc: ApcName;
  crop: CropType;
  snpSe: SnpSe;
  status: MonitoringStatus;
  severity: IssueSeverity;
  issueTypeLabel: string;
  actionRequired: boolean;
}

export interface MonitoringKpis {
  totalApcCount: number;
  normalApcCount: number;
  delayedApcCount: number;
  errorApcCount: number;
  missingApcCount: number;
}

export interface MatrixCell {
  apc: ApcName;
  crop: CropType;
  snpSe: SnpSe;
  status: MonitoringStatus;
  label: string;
  traceId?: string | null;
  issueCount: number;
}

export interface MonitoringSummaryResponse {
  generatedAt: string;
  kpis: MonitoringKpis;
  matrix: MatrixCell[];
  recentIssues: RecentIssueItem[];
  statusDistribution: StatusDistributionItem[];
}

export interface IngestionStatusItem {
  ingestionId: string;
  traceId: string;
  apc: ApcName;
  crop: CropType;
  snpSe: SnpSe;
  lastReceivedAt?: string | null;
  expectedIntervalMinutes?: number | null;
  baseTime: string;
  delayMinutes: number;
  originSaved: boolean;
  refinedSaved: boolean;
  status: MonitoringStatus;
  originPath?: string | null;
  refinedPath?: string | null;
}

export interface IngestionStatusResponse {
  generatedAt: string;
  items: IngestionStatusItem[];
}

export interface SampleRow {
  rowId: string;
  values: Record<string, string | number | null>;
}

export interface QualityIssueItem {
  issueId: string;
  traceId?: string | null;
  status: IssueStatus;
  severity: IssueSeverity;
  apc: ApcName;
  crop: CropType;
  snpSe: SnpSe;
  issueType: IssueType;
  issueTypeLabel: string;
  affectedCount: number;
  firstOccurredAt: string;
  lastOccurredAt: string;
  assignee?: string | null;
  downloadRisk: boolean;
  summary: string;
  impactRange: string;
  recommendedAction: string;
  sampleRows: SampleRow[];
}

export interface QualityIssueResponse {
  generatedAt: string;
  items: QualityIssueItem[];
}

export interface PipelineStepItem {
  stepKey: PipelineStepKey;
  stepLabel: string;
  status: PipelineStepStatus;
  checkedAt?: string | null;
  message: string;
  dagId?: string | null;
  taskId?: string | null;
  logPreview?: string | null;
  nextAction?: string | null;
}

export interface PipelineTraceResponse {
  traceId: string;
  apc: ApcName;
  crop: CropType;
  snpSe: SnpSe;
  status: MonitoringStatus;
  startedAt?: string | null;
  endedAt?: string | null;
  steps: PipelineStepItem[];
  relatedIssueIds: string[];
  recommendedAction?: string | null;
}

export interface OperationActionItem {
  actionId: string;
  issueId: string;
  createdAt: string;
  author: string;
  previousStatus?: IssueStatus | null;
  nextStatus: IssueStatus;
  memo: string;
  recurrenceCount: number;
}

export interface OperationActionResponse {
  generatedAt: string;
  items: OperationActionItem[];
}

export interface SeverityPolicy {
  high: string;
  medium: string;
  low: string;
}

export interface RuleChangeHistoryItem {
  changedAt: string;
  changedBy: string;
  reason: string;
  before: Record<string, string | number | boolean | string[] | null>;
  after: Record<string, string | number | boolean | string[] | null>;
}

export interface MonitoringRuleItem {
  ruleId: string;
  apc: ApcName;
  crop: CropType;
  snpSe: SnpSe;
  expectedIntervalMinutes?: number | null;
  allowedDelayMinutes?: number | null;
  requiredFields: string[];
  duplicateKeys: string[];
  severityPolicy: SeverityPolicy;
  isEditable: boolean;
  lastUpdatedBy?: string | null;
  lastUpdatedAt?: string | null;
  changeHistory: RuleChangeHistoryItem[];
}

export interface MonitoringRuleResponse {
  generatedAt: string;
  items: MonitoringRuleItem[];
}

export interface CreateIssueActionRequest {
  nextStatus: IssueStatus;
  assignee: string;
  memo: string;
}

export interface UpdateMonitoringRuleRequest {
  expectedIntervalMinutes?: number | null;
  allowedDelayMinutes?: number | null;
  requiredFields: string[];
  duplicateKeys: string[];
  reason: string;
}

export interface ApiErrorResponse {
  code: string;
  message: string;
  detail?: string | null;
}
