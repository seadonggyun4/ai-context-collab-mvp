import type {
  ApcName,
  CropType,
  MatrixCell,
  MonitoringStatus,
  SnpSe
} from "@shared/types/monitoring";

export type ApcManagementTab =
  | "monitoring"
  | "ingestions"
  | "issues"
  | "pipeline"
  | "actions"
  | "rules"
  | "lookup"
  | "visualization";

export interface MatrixDrilldownContext {
  apc: ApcName;
  crop: CropType;
  snpSe: SnpSe;
  status?: MonitoringStatus;
  traceId?: string | null;
  source: "matrix";
}

export type MatrixDrilldownCell = MatrixCell;

export type ActionEntrySource = "pipeline" | "operation-actions";

export interface ActionEntryContext {
  issueId: string;
  traceId?: string | null;
  focusActionForm: boolean;
  source: ActionEntrySource;
}

export type PipelineRelatedContext = ActionEntryContext & {
  source: "pipeline";
  traceId: string;
};
