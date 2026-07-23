import type { ChangeRequestAggregate } from "../model/change-request";
import type { Document, DocumentRelation } from "@entities/document";
import type { Evidence, EvidenceResult } from "@entities/evidence";
import type { ImpactEdge, ImpactNode } from "@entities/impact";
import type { Project } from "@entities/project";
import type { Proposal } from "@entities/proposal";
import type { Actor } from "@entities/review";


const FIXTURE_TIME = "2026-07-22T09:00:00+09:00";

export const APC_FIXTURE_ACTORS: Readonly<Record<"requester" | "reviewer" | "admin" | "viewer", Actor>> = {
  requester: Object.freeze({ id: "user-planning-01", displayName: "기획 담당자", role: "contributor" }),
  reviewer: Object.freeze({ id: "user-review-01", displayName: "검토 담당자", role: "reviewer" }),
  admin: Object.freeze({ id: "user-admin-01", displayName: "운영 관리자", role: "admin" }),
  viewer: Object.freeze({ id: "user-viewer-01", displayName: "조회 담당자", role: "viewer" }),
};

const impactNodes: readonly ImpactNode[] = [
  {
    id: "impact-planning",
    kind: "PLANNING",
    label: "수신 지연 경고 수용 기준",
    status: "AFFECTED",
    sourcePath: "docs/apc-monitoring-mvp/roles/planning",
    rationale: "24시간 경고 조건을 기획 기준에 고정해야 합니다.",
    reviewable: true,
  },
  {
    id: "impact-publishing",
    kind: "PUBLISHING",
    label: "최근 정상 수신 시간 표시",
    status: "AFFECTED",
    sourcePath: "docs/apc-monitoring-mvp/roles/publishing",
    rationale: "목록 열과 경고 상태 표현이 추가됩니다.",
    reviewable: true,
  },
  {
    id: "impact-api",
    kind: "API_CONTRACT",
    label: "최근 정상 수신 API 계약",
    status: "AFFECTED",
    sourcePath: "projects/apc-monitoring-mvp/backend",
    rationale: "정상 수신 시각 필드가 응답 계약에 필요합니다.",
    reviewable: true,
  },
  {
    id: "impact-data",
    kind: "DATA",
    label: "수신 이력 데이터",
    status: "AFFECTED",
    sourcePath: "projects/apc-monitoring-mvp/backend",
    rationale: "마지막 정상 이벤트를 결정할 수 있어야 합니다.",
    reviewable: true,
  },
  {
    id: "impact-fixture",
    kind: "CODE",
    label: "APC 목록 Fixture 필드",
    status: "AFFECTED",
    sourcePath: "projects/apc-monitoring-mvp/frontend",
    rationale: "경계값과 지연 사례를 재현하는 데이터가 필요합니다.",
    reviewable: true,
  },
  {
    id: "impact-qa",
    kind: "QA",
    label: "24시간 경계 검증",
    status: "AFFECTED",
    sourcePath: "docs/apc-monitoring-mvp/roles/qa",
    rationale: "24시간 전후 표시와 경고를 검증해야 합니다.",
    reviewable: true,
  },
];

const proposal: Proposal = {
  revision: 1,
  summary: "APC 모니터링 목록에 최근 정상 수신 시간을 표시하고 24시간 이상 미수신 시 경고합니다.",
  acceptanceCriteria: [
    { id: "AC-DEMO-01", statement: "각 APC의 최근 정상 수신 시간이 목록에 표시된다.", priority: "P0" },
    { id: "AC-DEMO-02", statement: "마지막 정상 수신 후 24시간 이상이면 경고 상태가 표시된다.", priority: "P0" },
  ],
  impacts: impactNodes,
  affectedFiles: [
    { path: "frontend/src/features/monitoring", changeType: "UPDATE", reason: "목록 열과 경고 표현 추가" },
    { path: "backend/app/api/monitoring.py", changeType: "UPDATE", reason: "최근 정상 수신 필드 제공" },
    { path: "docs/apc-monitoring-mvp/roles/qa", changeType: "UPDATE", reason: "24시간 경계 시나리오 추가" },
  ],
  risk: "MEDIUM",
  confidence: "HIGH",
  unknowns: [],
  qaScenarios: [
    { id: "QA-DEMO-AUTO-01", title: "24시간 경계 상태 계산", type: "AUTOMATED", required: true },
    { id: "QA-DEMO-MANUAL-01", title: "목록 시각 위계와 경고 식별", type: "MANUAL", required: true },
  ],
  contextSnapshotLocked: true,
  createdAt: FIXTURE_TIME,
};

const documents: readonly Document[] = [
  {
    id: "DOC-APC-CONTEXT",
    path: "docs/apc-monitoring-mvp/Project_Context.md",
    role: "ORGANIZATION",
    status: "ACTIVE",
    version: "1.0.0",
    metadata: {
      id: "DOC-APC-CONTEXT",
      title: "APC Monitoring Project Context",
      projectId: "apc-monitoring-mvp",
      documentType: "project_context",
      status: "ACTIVE",
      version: "1.0.0",
      sourcePath: "docs/apc-monitoring-mvp/Project_Context.md",
      approvedBy: "user-admin-01",
      effectiveAt: FIXTURE_TIME,
    },
    source: "# APC Monitoring Project Context",
    revision: "fixture-context-r1",
  },
  {
    id: "DOC-APC-QA",
    path: "docs/apc-monitoring-mvp/roles/qa/QA.md",
    role: "QA",
    status: "ACTIVE",
    version: "1.0.0",
    metadata: {
      id: "DOC-APC-QA",
      title: "APC Monitoring QA",
      projectId: "apc-monitoring-mvp",
      documentType: "qa",
      status: "ACTIVE",
      version: "1.0.0",
      sourcePath: "docs/apc-monitoring-mvp/roles/qa/QA.md",
      approvedBy: "user-admin-01",
      effectiveAt: FIXTURE_TIME,
    },
    source: "# APC Monitoring QA",
    revision: "fixture-qa-r1",
  },
];

const documentRelations: readonly DocumentRelation[] = [
  {
    fromDocumentId: "DOC-APC-QA",
    toDocumentId: "DOC-APC-CONTEXT",
    relationType: "derives_from",
    reason: "QA 기준은 활성 프로젝트 Context에서 파생됩니다.",
  },
];

const impactEdges: readonly ImpactEdge[] = [
  { id: "edge-1", from: "impact-planning", to: "impact-api", relation: "IMPACTS", rationale: "수용 기준이 API 계약을 변경합니다." },
  { id: "edge-2", from: "impact-publishing", to: "impact-fixture", relation: "IMPLEMENTS", rationale: "표시 기준을 화면 Fixture에서 재현합니다." },
  { id: "edge-3", from: "impact-api", to: "impact-qa", relation: "VERIFIES", rationale: "API 응답과 경계 조건을 QA에서 검증합니다." },
  { id: "edge-4", from: "impact-data", to: "impact-api", relation: "DERIVES", rationale: "저장된 수신 이력에서 API 필드가 파생됩니다." },
];

export interface ApcDomainFixture {
  project: Project;
  documents: readonly Document[];
  documentRelations: readonly DocumentRelation[];
  impactEdges: readonly ImpactEdge[];
  aggregate: ChangeRequestAggregate;
}

export function createApcDomainFixture(): ApcDomainFixture {
  const project: Project = {
    id: "apc-monitoring-mvp",
    name: "APC 데이터 운영 모니터링",
    description: "산지유통센터의 데이터 수신과 품질 상태를 추적합니다.",
    repository: "projects/apc-monitoring-mvp",
    activeContextVersion: "context-v1.3",
    effectiveDate: "2026-07-21",
    health: "NEEDS_ATTENTION",
  };

  return {
    project,
    documents: documents.map((document) => ({ ...document, metadata: { ...document.metadata } })),
    documentRelations: documentRelations.map((relation) => ({ ...relation })),
    impactEdges: impactEdges.map((edge) => ({ ...edge })),
    aggregate: {
      request: {
        id: "CR-DEMO-001",
        projectId: project.id,
        title: "최근 정상 수신 시간과 24시간 경고 추가",
        rawRequest: "모니터링 목록에 ‘최근 정상 수신 시간’을 추가하고, 24시간 이상 수신되지 않으면 경고로 보여주세요.",
        status: "ANALYZED",
        risk: proposal.risk,
        requester: { ...APC_FIXTURE_ACTORS.requester },
        contextSnapshot: project.activeContextVersion,
        createdAt: FIXTURE_TIME,
        updatedAt: FIXTURE_TIME,
      },
      proposals: [{
        ...proposal,
        acceptanceCriteria: proposal.acceptanceCriteria.map((criterion) => ({ ...criterion })),
        impacts: proposal.impacts.map((impact) => ({ ...impact })),
        affectedFiles: proposal.affectedFiles.map((file) => ({ ...file })),
        unknowns: [...proposal.unknowns],
        qaScenarios: proposal.qaScenarios.map((scenario) => ({ ...scenario })),
      }],
      reviews: [],
      evidence: [],
      contextVersions: [],
      auditEvents: [],
      implementation: {
        revision: 0,
        approvedProposalRevision: null,
        approvedScopeFingerprint: null,
      },
    },
  };
}

export function createApcEvidence(
  aggregate: ChangeRequestAggregate,
  testId: "QA-DEMO-AUTO-01" | "QA-DEMO-MANUAL-01",
  result: EvidenceResult,
  verifiedBy: string,
  verifiedAt: string,
): Evidence {
  const type = testId === "QA-DEMO-AUTO-01" ? "AUTOMATED" : "MANUAL";
  return {
    id: `evidence-${testId}-${aggregate.implementation.revision}-${verifiedAt}`,
    changeRequestId: aggregate.request.id,
    testId,
    type,
    result,
    required: true,
    command: type === "AUTOMATED" ? "npm test -- workflow" : null,
    artifact: type === "MANUAL" ? "fixture://manual-review" : "fixture://test-report",
    implementationRevision: aggregate.implementation.revision,
    verifiedBy,
    verifiedAt,
  };
}
