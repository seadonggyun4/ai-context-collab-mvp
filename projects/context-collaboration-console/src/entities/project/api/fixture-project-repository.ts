import { domainSuccess } from "@shared/lib/result";

import { parseProjectDashboard } from "./project-dashboard-parser";

import type { ProjectRepository } from "../model/project-repository";

const primaryDashboardPayload = {
  project: {
    id: "apc-monitoring-mvp",
    name: "APC 데이터 운영 모니터링",
    description: "수신·품질·처리 상태를 기준 문서와 검증 증거까지 연결해 관리합니다.",
    repository: "seadonggyun4/ai-context-collab-mvp",
    active_context_version: "2026.07.22",
    effective_date: "2026-07-22",
    last_verified_at: "2026-07-22 11:32 KST",
    health: "NEEDS_ATTENTION",
    metrics: [
      { id: "activeChanges", label: "진행 중 변경", value: "3", detail: "오늘 1건 갱신", tone: "neutral" },
      { id: "pendingApprovals", label: "승인 대기", value: "1", detail: "고위험 검토 필요", tone: "warning" },
      { id: "verificationRequired", label: "검증 필요", value: "2", detail: "수동 확인 1건 포함", tone: "warning" },
      { id: "alignment", label: "문서·구현 정합성", value: "92%", detail: "11:32 검사", tone: "success" },
    ],
  },
  active_changes: [
    {
      id: "CR-APC-014",
      title: "운영 조치 이력 필터 개선",
      status: "IN_REVIEW",
      status_label: "승인 대기",
      risk: "HIGH",
      risk_label: "높음",
      owner_label: "기획 · 퍼블리싱",
      updated_at: "2026-07-22T08:20:00+09:00",
      updated_label: "오늘 08:20",
      attention_priority: 90,
    },
    {
      id: "CR-APC-013",
      title: "수신 현황 기준 보강",
      status: "VERIFYING",
      status_label: "검증 중",
      risk: "MEDIUM",
      risk_label: "보통",
      owner_label: "기획 · 개발 · QA",
      updated_at: "2026-07-22T10:42:00+09:00",
      updated_label: "오늘 10:42",
      attention_priority: 70,
    },
    {
      id: "CR-DEMO-001",
      title: "최근 정상 수신 시간과 24시간 경고 추가",
      status: "ANALYZED",
      status_label: "영향 분석 완료",
      risk: "MEDIUM",
      risk_label: "보통",
      owner_label: "기획 · 개발 · QA",
      updated_at: "2026-07-21T16:10:00+09:00",
      updated_label: "어제 16:10",
      attention_priority: 50,
    },
  ],
  attention_queue: [
    {
      id: "ATT-APPROVAL-01",
      kind: "APPROVAL",
      title: "고위험 변경 승인 대기",
      reason: "운영 조치 이력 필터의 범위와 관리자 권한 검토가 필요합니다.",
      action_label: "승인 범위 확인",
      target: "#active-changes",
      priority: "CRITICAL",
    },
    {
      id: "ATT-VERIFY-01",
      kind: "VERIFICATION",
      title: "수동 화면 확인 미완료",
      reason: "390px 목록에서 경고 상태가 텍스트와 함께 식별되는지 확인해야 합니다.",
      action_label: "최근 QA 확인",
      target: "#recent-qa",
      priority: "HIGH",
    },
    {
      id: "ATT-ALIGN-01",
      kind: "ALIGNMENT",
      title: "API 계약 기준 갱신 필요",
      reason: "최근 정상 수신 필드의 문서 revision이 구현 fixture보다 한 단계 이전입니다.",
      action_label: "불일치 근거 확인",
      target: "#alignment-status",
      priority: "NORMAL",
    },
  ],
  latest_artifacts: [
    { id: "DOC-PLAN-018", title: "수신 지연 경고 수용 기준", role: "PLANNING", role_label: "기획", version: "v1.4", status: "ACTIVE", status_label: "활성", updated_at: "2026-07-22T09:10:00+09:00", updated_label: "오늘 09:10" },
    { id: "DOC-PUB-011", title: "모니터링 목록 상태 표현", role: "PUBLISHING", role_label: "퍼블리싱", version: "v1.2", status: "ACTIVE", status_label: "활성", updated_at: "2026-07-22T08:55:00+09:00", updated_label: "오늘 08:55" },
    { id: "DOC-DEV-024", title: "최근 정상 수신 API 계약", role: "DEVELOPMENT", role_label: "개발", version: "v1.3", status: "REVIEW_REQUIRED", status_label: "검토 필요", updated_at: "2026-07-21T17:40:00+09:00", updated_label: "어제 17:40" },
    { id: "DOC-QA-016", title: "24시간 경계 검증 시나리오", role: "QA", role_label: "QA", version: "v1.3", status: "ACTIVE", status_label: "활성", updated_at: "2026-07-22T10:05:00+09:00", updated_label: "오늘 10:05" },
  ],
  alignment: {
    status: "NEEDS_ATTENTION",
    status_label: "확인 필요",
    score: 92,
    last_checked_at: "2026-07-22T11:32:00+09:00",
    last_checked_label: "오늘 11:32",
    issues: [
      { id: "ALIGN-01", title: "API 계약 revision 차이", detail: "문서 v1.3 · 구현 fixture v1.4", source: "최근 정상 수신 API 계약" },
      { id: "ALIGN-02", title: "수동 증거 미연결", detail: "모바일 경고 상태 확인 결과가 변경 요청에 연결되지 않았습니다.", source: "QA-APC-MANUAL-04" },
    ],
  },
  recent_qa: [
    { id: "QA-RUN-031", title: "수신 지연 상태 계산", kind: "AUTOMATED", kind_label: "자동 검사", result: "PASSED", result_label: "통과", run_at: "2026-07-22T11:32:00+09:00", run_label: "오늘 11:32", summary: "24시간 전후 경계값 8건을 확인했습니다.", evidence_count: 8 },
    { id: "QA-RUN-030", title: "문서 관계 정합성", kind: "EVALUATION", kind_label: "정합성 검사", result: "PARTIAL", result_label: "확인 필요", run_at: "2026-07-22T11:30:00+09:00", run_label: "오늘 11:30", summary: "20개 관계 중 revision 차이 1건을 발견했습니다.", evidence_count: 20 },
    { id: "QA-RUN-029", title: "모바일 상태 식별", kind: "MANUAL", kind_label: "수동 확인", result: "PENDING", result_label: "대기", run_at: "2026-07-22T10:20:00+09:00", run_label: "오늘 10:20", summary: "390px 경고 상태 확인 담당자가 지정되었습니다.", evidence_count: 0 },
  ],
} as const;

export function createProjectDashboardFixturePayload(): unknown {
  return structuredClone(primaryDashboardPayload);
}

export function createFixtureProjectRepository(): ProjectRepository {
  return {
    getProjectDashboard(projectId) {
      if (projectId !== primaryDashboardPayload.project.id) return Promise.resolve(domainSuccess(null));
      return Promise.resolve(domainSuccess(parseProjectDashboard(createProjectDashboardFixturePayload())));
    },
  };
}

export const fixtureProjectRepository = createFixtureProjectRepository();
