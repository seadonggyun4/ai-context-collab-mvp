import type {
  IngestionStatusItem,
  MatrixCell,
  MonitoringKpis,
  QualityIssueItem,
  RecentIssueItem,
  StatusDistributionItem
} from "@shared/types/monitoring";

export const shellGeneratedAt = "2026-07-09T09:30:00+09:00";

export const shellKpis: MonitoringKpis = {
  totalApcCount: 5,
  normalApcCount: 2,
  delayedApcCount: 1,
  errorApcCount: 1,
  missingApcCount: 1
};

export const shellMatrix: MatrixCell[] = [
  {
    apc: "NAMWON",
    crop: "CITRUS",
    snpSe: "CLSFY",
    status: "NORMAL",
    label: "남원 감귤 선별",
    traceId: "trace-namwon-citrus-clsfy",
    issueCount: 0
  },
  {
    apc: "JUNGMUN",
    crop: "CITRUS",
    snpSe: "WRHS",
    status: "NORMAL",
    label: "중문 감귤 입고",
    traceId: "trace-jungmun-citrus-wrhs",
    issueCount: 0
  },
  {
    apc: "JUNGMUN",
    crop: "CITRUS",
    snpSe: "CLSFY",
    status: "ERROR",
    label: "중문 감귤 선별",
    traceId: "trace-jungmun-citrus-clsfy",
    issueCount: 3
  },
  {
    apc: "WIMI",
    crop: "CITRUS",
    snpSe: "CLSFY",
    status: "DELAYED",
    label: "위미 감귤 선별",
    traceId: "trace-wimi-citrus-clsfy",
    issueCount: 1
  },
  {
    apc: "SEOGWI",
    crop: "CARROT",
    snpSe: "WRHS",
    status: "MISSING",
    label: "서귀 당근 입고",
    traceId: "trace-seogwi-carrot-wrhs",
    issueCount: 1
  },
  {
    apc: "GUJWA",
    crop: "CARROT",
    snpSe: "CLSFY",
    status: "UNDEFINED_RULE",
    label: "구좌 당근 선별",
    traceId: "trace-gujwa-carrot-clsfy",
    issueCount: 0
  }
];

export const shellRecentIssues: RecentIssueItem[] = [
  {
    issueId: "issue-jungmun-refined-failed",
    traceId: "trace-jungmun-citrus-clsfy",
    occurredAt: "2026-07-09T09:15:00+09:00",
    apc: "JUNGMUN",
    crop: "CITRUS",
    snpSe: "CLSFY",
    status: "ERROR",
    severity: "HIGH",
    issueTypeLabel: "정제 실패",
    actionRequired: true
  },
  {
    issueId: "issue-wimi-refined-limited",
    traceId: "trace-wimi-citrus-clsfy",
    occurredAt: "2026-07-09T08:40:00+09:00",
    apc: "WIMI",
    crop: "CITRUS",
    snpSe: "CLSFY",
    status: "DELAYED",
    severity: "MEDIUM",
    issueTypeLabel: "정제 제한",
    actionRequired: true
  },
  {
    issueId: "issue-seogwi-carrot-missing",
    traceId: "trace-seogwi-carrot-wrhs",
    occurredAt: "2026-07-09T07:30:00+09:00",
    apc: "SEOGWI",
    crop: "CARROT",
    snpSe: "WRHS",
    status: "MISSING",
    severity: "HIGH",
    issueTypeLabel: "미수신",
    actionRequired: true
  }
];

export const shellStatusDistribution: StatusDistributionItem[] = [
  { status: "NORMAL", label: "정상", count: 2 },
  { status: "DELAYED", label: "지연", count: 1 },
  { status: "ERROR", label: "오류", count: 1 },
  { status: "MISSING", label: "미수신", count: 1 },
  { status: "UNDEFINED_RULE", label: "기준 미정", count: 1 }
];

export const shellIngestions: IngestionStatusItem[] = [
  {
    ingestionId: "ingestion-jungmun-citrus-clsfy",
    traceId: "trace-jungmun-citrus-clsfy",
    apc: "JUNGMUN",
    crop: "CITRUS",
    snpSe: "CLSFY",
    lastReceivedAt: "2026-07-09T09:15:00+09:00",
    expectedIntervalMinutes: 60,
    baseTime: shellGeneratedAt,
    delayMinutes: 0,
    originSaved: true,
    refinedSaved: false,
    status: "ERROR",
    originPath: "origin/apc_cifru_jungmun/type=clsfy/091500.json",
    refinedPath: null
  },
  {
    ingestionId: "ingestion-seogwi-carrot-wrhs",
    traceId: "trace-seogwi-carrot-wrhs",
    apc: "SEOGWI",
    crop: "CARROT",
    snpSe: "WRHS",
    lastReceivedAt: null,
    expectedIntervalMinutes: 120,
    baseTime: shellGeneratedAt,
    delayMinutes: 120,
    originSaved: false,
    refinedSaved: false,
    status: "MISSING",
    originPath: null,
    refinedPath: null
  },
  {
    ingestionId: "ingestion-wimi-citrus-clsfy",
    traceId: "trace-wimi-citrus-clsfy",
    apc: "WIMI",
    crop: "CITRUS",
    snpSe: "CLSFY",
    lastReceivedAt: "2026-07-09T07:55:00+09:00",
    expectedIntervalMinutes: 60,
    baseTime: shellGeneratedAt,
    delayMinutes: 35,
    originSaved: true,
    refinedSaved: false,
    status: "DELAYED",
    originPath: "origin/apc_cifru_wimi/type=clsfy/075500.json",
    refinedPath: null
  }
];

export const shellIssues: QualityIssueItem[] = [
  {
    issueId: "issue-jungmun-refined-failed",
    traceId: "trace-jungmun-citrus-clsfy",
    status: "OPEN",
    severity: "HIGH",
    apc: "JUNGMUN",
    crop: "CITRUS",
    snpSe: "CLSFY",
    issueType: "REFINED_FAILED",
    issueTypeLabel: "정제 실패",
    affectedCount: 184,
    firstOccurredAt: "2026-07-09T09:15:00+09:00",
    lastOccurredAt: "2026-07-09T09:15:00+09:00",
    assignee: null,
    downloadRisk: true,
    summary: "중문 감귤 선별 데이터가 origin 저장 후 refined 저장 단계에서 실패했습니다.",
    impactRange: "중문 감귤 선별 2026-07-09 09:15 수신분",
    recommendedAction: "refined 저장 로그와 스키마 변환 규칙을 확인합니다.",
    sampleRows: []
  }
];
