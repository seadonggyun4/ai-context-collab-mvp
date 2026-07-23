import { domainSuccess } from "@shared/lib/result";

import { parseImpactGraph } from "./impact-graph-parser";

import type { ImpactGraph } from "../model/impact";
import type { ImpactRepository } from "../model/impact-repository";

const projectId = "apc-monitoring-mvp";

function graphPayload(changeId: string): unknown {
  return {
    project_id: projectId,
    change_id: changeId,
    revision: 1,
    generated_at: "2026-07-23T09:20:00+09:00",
    entry_node_id: "impact-request",
    nodes: [
      { id: "impact-request", kind: "REQUEST", depth: 0, label: "최근 정상 수신 시간과 24시간 경고 추가", status: "AFFECTED", change_type: "UPDATE", source_path: null, rationale: "변경 요청 원문이 모든 영향 경로의 시작점입니다.", reviewable: false, owner: "기획 담당자" },
      { id: "impact-role-planning", kind: "PLANNING", depth: 1, label: "기획 기준", status: "AFFECTED", change_type: "UPDATE", source_path: "docs/apc-monitoring-mvp/roles/planning", rationale: "24시간 경고 조건과 예외 기준을 확정해야 합니다.", reviewable: true, owner: "기획" },
      { id: "impact-role-publishing", kind: "PUBLISHING", depth: 1, label: "화면 표현 기준", status: "AFFECTED", change_type: "UPDATE", source_path: "docs/apc-monitoring-mvp/roles/publishing", rationale: "최근 정상 수신 열과 경고 표현의 정보 위계가 바뀝니다.", reviewable: true, owner: "퍼블리싱" },
      { id: "impact-doc-requirements", kind: "DOCUMENT", depth: 2, label: "수신 지연 수용 기준", status: "AFFECTED", change_type: "UPDATE", source_path: "docs/apc-monitoring-mvp/roles/planning/01_product_requirements.md", rationale: "관찰 가능한 24시간 경계와 데이터 없음 조건을 문서화합니다.", reviewable: true, owner: "기획" },
      { id: "impact-doc-ui", kind: "DOCUMENT", depth: 2, label: "모니터링 목록 UI 기준", status: "AFFECTED", change_type: "UPDATE", source_path: "docs/apc-monitoring-mvp/roles/publishing/monitoring-list.md", rationale: "desktop과 mobile의 시간·경고 표현을 함께 갱신합니다.", reviewable: true, owner: "퍼블리싱" },
      { id: "impact-contract-api", kind: "API_CONTRACT", depth: 3, label: "모니터링 현황 API", status: "AFFECTED", change_type: "ADD", source_path: "projects/apc-monitoring-mvp/backend/app/api/monitoring.py", rationale: "last_successful_received_at 필드와 null 계약이 필요합니다.", reviewable: true, owner: "Backend" },
      { id: "impact-code-backend", kind: "CODE", depth: 4, label: "최근 정상 수신 계산", status: "AFFECTED", change_type: "UPDATE", source_path: "projects/apc-monitoring-mvp/backend/app/services/monitoring.py", rationale: "정상 이벤트 중 가장 최근 시각을 안정적으로 계산합니다.", reviewable: true, owner: "Backend" },
      { id: "impact-code-frontend", kind: "COMPONENT", depth: 4, label: "수신 상태 테이블", status: "AFFECTED", change_type: "UPDATE", source_path: "projects/apc-monitoring-mvp/frontend/src/features/monitoring", rationale: "열, 경고 문구와 반응형 행 정보 구조를 변경합니다.", reviewable: true, owner: "Frontend" },
      { id: "impact-qa-auto", kind: "QA", depth: 5, label: "24시간 경계 자동 검증", status: "AFFECTED", change_type: "VERIFY", source_path: "docs/apc-monitoring-mvp/roles/qa/qa-results", rationale: "23:59:59, 24:00:00, 24:00:01 경계를 검증합니다.", reviewable: true, owner: "QA" },
      { id: "impact-qa-manual", kind: "QA", depth: 5, label: "모바일 경고 식별", status: "UNKNOWN", change_type: "VERIFY", source_path: "docs/apc-monitoring-mvp/roles/qa/manual-checks.md", rationale: "390px에서 시간과 경고 상태의 식별 여부는 수동 확인이 필요합니다.", reviewable: true, owner: "QA" },
    ],
    edges: [
      { id: "edge-request-planning", from: "impact-request", to: "impact-role-planning", relation: "IMPACTS", rationale: "요청의 24시간 조건을 기획 기준으로 구체화합니다." },
      { id: "edge-request-publishing", from: "impact-request", to: "impact-role-publishing", relation: "IMPACTS", rationale: "새 시간 필드가 목록 정보 구조를 변경합니다." },
      { id: "edge-planning-document", from: "impact-role-planning", to: "impact-doc-requirements", relation: "IMPLEMENTS", rationale: "기획 판단을 수용 기준 문서에 고정합니다." },
      { id: "edge-publishing-document", from: "impact-role-publishing", to: "impact-doc-ui", relation: "IMPLEMENTS", rationale: "화면 판단을 퍼블리싱 기준에 기록합니다." },
      { id: "edge-requirements-contract", from: "impact-doc-requirements", to: "impact-contract-api", relation: "IMPACTS", rationale: "표시 수용 기준을 충족하려면 API 응답 계약이 확장되어야 합니다." },
      { id: "edge-ui-frontend", from: "impact-doc-ui", to: "impact-code-frontend", relation: "IMPLEMENTS", rationale: "화면 기준을 수신 상태 테이블이 구현합니다." },
      { id: "edge-contract-backend", from: "impact-contract-api", to: "impact-code-backend", relation: "IMPLEMENTS", rationale: "API 필드의 값을 backend 계산 로직이 제공합니다." },
      { id: "edge-contract-frontend", from: "impact-contract-api", to: "impact-code-frontend", relation: "IMPACTS", rationale: "Frontend가 추가된 응답 필드와 null 상태를 처리합니다." },
      { id: "edge-backend-qa", from: "impact-code-backend", to: "impact-qa-auto", relation: "VERIFIES", rationale: "경계 자동 검사가 계산 로직의 정확성을 증명합니다." },
      { id: "edge-frontend-qa", from: "impact-code-frontend", to: "impact-qa-auto", relation: "VERIFIES", rationale: "컴포넌트 상태와 경고 문구를 자동 검사합니다." },
      { id: "edge-frontend-manual", from: "impact-code-frontend", to: "impact-qa-manual", relation: "VERIFIES", rationale: "모바일 정보 위계는 사람의 시각 확인이 필요합니다." },
    ],
  };
}

export function createImpactGraphFixture(changeId = "CR-DEMO-001"): ImpactGraph {
  return parseImpactGraph(graphPayload(changeId));
}

export function createFixtureImpactRepository(): ImpactRepository {
  return {
    getImpactGraph(requestedProjectId, changeId) {
      if (requestedProjectId !== projectId || changeId === "missing") return Promise.resolve(domainSuccess(null));
      return Promise.resolve(domainSuccess(createImpactGraphFixture(changeId)));
    },
  };
}

export const fixtureImpactRepository = createFixtureImpactRepository();
