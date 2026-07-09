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
