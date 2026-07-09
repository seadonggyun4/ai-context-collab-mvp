import type {
  ApcName,
  CropType,
  IssueSeverity,
  IssueStatus,
  IssueType,
  MonitoringStatus,
  PipelineStepKey,
  PipelineStepStatus,
  SnpSe
} from "@shared/types/monitoring";

export const APC_LABELS: Record<ApcName, string> = {
  NAMWON: "남원",
  WIMI: "위미",
  SEOGWI: "서귀",
  JUNGMUN: "중문",
  GUJWA: "구좌"
};

export const CROP_LABELS: Record<CropType, string> = {
  CITRUS: "감귤",
  CARROT: "당근"
};

export const SNP_SE_LABELS: Record<SnpSe, string> = {
  WRHS: "입고",
  CLSFY: "선별"
};

export const MONITORING_STATUS_LABELS: Record<MonitoringStatus, string> = {
  NORMAL: "정상",
  DELAYED: "지연",
  ERROR: "오류",
  MISSING: "미수신",
  UNDEFINED_RULE: "기준 미정"
};

export const MONITORING_STATUS_PRIORITY: Record<MonitoringStatus, number> = {
  ERROR: 1,
  MISSING: 2,
  DELAYED: 3,
  UNDEFINED_RULE: 4,
  NORMAL: 5
};

export const ISSUE_STATUS_LABELS: Record<IssueStatus, string> = {
  OPEN: "미확인",
  IN_PROGRESS: "확인중",
  RESOLVED: "조치완료",
  IGNORED: "무시"
};

export const ISSUE_SEVERITY_LABELS: Record<IssueSeverity, string> = {
  HIGH: "높음",
  MEDIUM: "보통",
  LOW: "낮음"
};

export const PIPELINE_STEP_STATUS_LABELS: Record<PipelineStepStatus, string> = {
  SUCCESS: "성공",
  RUNNING: "진행중",
  FAILED: "실패",
  SKIPPED: "건너뜀",
  UNDEFINED: "기준 미정"
};

export const PIPELINE_STEP_LABELS: Record<PipelineStepKey, string> = {
  API_RECEIVED: "APC API 수신",
  AUTH_SCHEMA_VALIDATED: "인증/스키마 검증",
  ORIGIN_SAVED: "origin 저장",
  REFINED_SAVED: "refined 저장",
  AIRFLOW_SNAPSHOT_LOADED: "Airflow snapshot 적재",
  GUIDANCE_API_AVAILABLE: "Guidance API 조회",
  SCREEN_RENDERED: "화면 표시"
};

export const ISSUE_TYPE_LABELS: Record<IssueType, string> = {
  REQUIRED_FIELD_MISSING: "필수값 누락",
  INVALID_FORMAT: "형식 오류",
  DUPLICATE_SUSPECTED: "중복 의심",
  OUTLIER_QUANTITY_WEIGHT: "비정상 중량/수량",
  UNSUPPORTED_APC_CROP: "미지원 APC/품목",
  REFINED_FAILED: "정제 실패"
};
