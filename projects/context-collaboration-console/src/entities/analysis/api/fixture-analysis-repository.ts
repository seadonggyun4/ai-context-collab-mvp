import { domainFailure, domainSuccess } from "@shared/lib/result";

import { ANALYSIS_STAGES, createAnalysisIdempotencyKey } from "../model/analysis";

import { parseAnalysisJob, parseAnalysisOutcome } from "./analysis-parser";

import type { AnalysisJob, AnalysisOutcome, AnalysisStage, StartAnalysisInput } from "../model/analysis";
import type { AnalysisRepository } from "../model/analysis-repository";

interface StoredAnalysis {
  job: AnalysisJob;
  outcome: AnalysisOutcome | null;
}

function outcomeStorageKey(projectId: string, changeId: string) {
  return `context-flow:analysis-outcome:v1:${projectId}:${changeId}`;
}

function persistOutcome(projectId: string, changeId: string, outcome: AnalysisOutcome) {
  try { sessionStorage.setItem(outcomeStorageKey(projectId, changeId), JSON.stringify(toAnalysisOutcomeWire(outcome))); }
  catch { /* fixture session persistence is optional */ }
}

function restoreOutcome(projectId: string, changeId: string): AnalysisOutcome | null {
  try {
    const stored = sessionStorage.getItem(outcomeStorageKey(projectId, changeId));
    return stored === null ? null : parseAnalysisOutcome(JSON.parse(stored) as unknown);
  } catch { return null; }
}

export function toAnalysisJobWire(job: AnalysisJob): unknown {
  return {
    id: job.id, project_id: job.projectId, context_snapshot: job.contextSnapshot, raw_request: job.rawRequest,
    status: job.status, stage: job.stage, completed_stages: job.completedStages, attempt: job.attempt,
    change_id: job.changeId, error: job.error, created_at: job.createdAt, updated_at: job.updatedAt,
  };
}

export function toAnalysisOutcomeWire(outcome: AnalysisOutcome): unknown {
  const { proposal, request } = outcome;
  return {
    request: {
      id: request.id, project_id: request.projectId, title: request.title, raw_request: request.rawRequest,
      status: request.status, risk: request.risk,
      requester: { id: request.requester.id, display_name: request.requester.displayName, role: request.requester.role },
      context_snapshot: request.contextSnapshot, created_at: request.createdAt, updated_at: request.updatedAt,
    },
    proposal: {
      revision: proposal.revision, summary: proposal.summary,
      acceptance_criteria: proposal.acceptanceCriteria.map((item) => ({ id: item.id, statement: item.statement, priority: item.priority })),
      impacts: proposal.impacts.map((item) => ({ id: item.id, kind: item.kind, label: item.label, status: item.status, source_path: item.sourcePath, rationale: item.rationale, reviewable: item.reviewable })),
      affected_files: proposal.affectedFiles.map((item) => ({ path: item.path, change_type: item.changeType, reason: item.reason })),
      risk: proposal.risk, confidence: proposal.confidence, unknowns: proposal.unknowns,
      qa_scenarios: proposal.qaScenarios.map((item) => ({ id: item.id, title: item.title, type: item.type, required: item.required })),
      context_snapshot_locked: proposal.contextSnapshotLocked, created_at: proposal.createdAt,
    },
    clarification_questions: outcome.clarificationQuestions,
  };
}

function createOutcome(input: StartAnalysisInput, changeId: string, createdAt: string): AnalysisOutcome {
  const requestTitle = input.rawRequest.includes("최근 정상 수신")
    ? "최근 정상 수신 시간과 24시간 경고 추가"
    : input.rawRequest.replace(/\s+/g, " ").trim().slice(0, 42);
  return {
    request: {
      id: changeId, projectId: input.projectId, title: requestTitle, rawRequest: input.rawRequest,
      status: "ANALYZED", risk: "MEDIUM",
      requester: { id: "user-planning-01", displayName: "기획 담당자", role: "contributor" },
      contextSnapshot: input.contextSnapshot, createdAt, updatedAt: createdAt,
    },
    proposal: {
      revision: 1,
      summary: "APC 모니터링 목록에 최근 정상 수신 시간을 표시하고, 마지막 정상 수신 후 24시간 이상이면 경고 상태를 제공합니다.",
      acceptanceCriteria: [
        { id: "AC-01", statement: "각 APC의 최근 정상 수신 시각을 목록에서 확인할 수 있다.", priority: "P0" },
        { id: "AC-02", statement: "마지막 정상 수신 후 24시간 이상이면 경고 문구와 상태가 함께 표시된다.", priority: "P0" },
        { id: "AC-03", statement: "24시간 경계 전후와 데이터가 없는 경우를 자동 검증한다.", priority: "P1" },
      ],
      impacts: [
        { id: "impact-planning", kind: "PLANNING", label: "수신 지연 수용 기준", status: "AFFECTED", sourcePath: "docs/apc-monitoring-mvp/roles/planning", rationale: "24시간 경고 조건과 예외를 기준에 고정해야 합니다.", reviewable: true },
        { id: "impact-publishing", kind: "PUBLISHING", label: "모니터링 목록", status: "AFFECTED", sourcePath: "projects/apc-monitoring-mvp/frontend", rationale: "최근 정상 수신 열과 경고 표현이 추가됩니다.", reviewable: true },
        { id: "impact-component", kind: "COMPONENT", label: "수신 상태 테이블", status: "AFFECTED", sourcePath: "projects/apc-monitoring-mvp/frontend/src/features/monitoring", rationale: "desktop/mobile 행 정보 구조가 바뀝니다.", reviewable: true },
        { id: "impact-api", kind: "API_CONTRACT", label: "모니터링 현황 API", status: "AFFECTED", sourcePath: "projects/apc-monitoring-mvp/backend", rationale: "last_successful_received_at 필드가 필요합니다.", reviewable: true },
        { id: "impact-data", kind: "DATA", label: "수신 이벤트 이력", status: "AFFECTED", sourcePath: "projects/apc-monitoring-mvp/backend", rationale: "마지막 정상 이벤트를 결정할 수 있어야 합니다.", reviewable: true },
        { id: "impact-code", kind: "CODE", label: "상태 계산 selector", status: "AFFECTED", sourcePath: "projects/apc-monitoring-mvp/frontend", rationale: "24시간 경계 계산과 표시 상태를 연결합니다.", reviewable: true },
        { id: "impact-qa", kind: "QA", label: "24시간 경계 검증", status: "AFFECTED", sourcePath: "docs/apc-monitoring-mvp/roles/qa", rationale: "경계값과 모바일 식별을 검증해야 합니다.", reviewable: true },
      ],
      affectedFiles: [
        { path: "projects/apc-monitoring-mvp/frontend/src/features/monitoring", changeType: "UPDATE", reason: "목록 열과 경고 상태 추가" },
        { path: "projects/apc-monitoring-mvp/backend/app/api/monitoring.py", changeType: "UPDATE", reason: "최근 정상 수신 필드 제공" },
        { path: "docs/apc-monitoring-mvp/roles/qa", changeType: "UPDATE", reason: "경계·모바일 시나리오 추가" },
      ],
      risk: "MEDIUM", confidence: "HIGH",
      unknowns: ["경고 해제 시점을 새 정상 수신 직후로 볼지 운영 확인이 필요합니다."],
      qaScenarios: [
        { id: "QA-AUTO-01", title: "24시간 경계 상태 계산", type: "AUTOMATED", required: true },
        { id: "QA-AUTO-02", title: "API 응답 계약", type: "AUTOMATED", required: true },
        { id: "QA-MANUAL-01", title: "모바일 경고 상태 식별", type: "MANUAL", required: true },
      ],
      contextSnapshotLocked: true, createdAt,
    },
    clarificationQuestions: ["정상 수신이 다시 발생하면 경고를 즉시 해제해도 될까요?"],
  };
}

export function createFixtureAnalysisRepository(): AnalysisRepository {
  const analyses = new Map<string, StoredAnalysis>();
  const idempotencyIndex = new Map<string, string>();
  const retryIndex = new Map<string, number>();

  return {
    startAnalysis(input, idempotencyKey) {
      const existingJobId = idempotencyIndex.get(idempotencyKey);
      if (existingJobId !== undefined) {
        const existing = analyses.get(existingJobId);
        if (existing !== undefined) return Promise.resolve(domainSuccess(parseAnalysisJob(toAnalysisJobWire(existing.job))));
      }
      if (input.rawRequest.trim().length < 10) return Promise.resolve(domainFailure("ANALYSIS_REQUEST_TOO_SHORT", "요청을 조금 더 구체적으로 작성해 주세요", "변경 대상과 기대 결과를 함께 작성하면 영향 범위를 분석할 수 있습니다."));

      const identity = createAnalysisIdempotencyKey(input).replace("analysis-", "").toUpperCase();
      const now = new Date().toISOString();
      const job: AnalysisJob = {
        id: `JOB-${identity}`, projectId: input.projectId, contextSnapshot: input.contextSnapshot,
        rawRequest: input.rawRequest, status: "QUEUED", stage: "CHECKING_CONTEXT", completedStages: [],
        attempt: 1, changeId: `CR-${identity}`, error: null, createdAt: now, updatedAt: now,
      };
      analyses.set(job.id, { job, outcome: null });
      idempotencyIndex.set(idempotencyKey, job.id);
      return Promise.resolve(domainSuccess(parseAnalysisJob(toAnalysisJobWire(job))));
    },

    getAnalysisJob(jobId) {
      const stored = analyses.get(jobId);
      if (stored === undefined) return Promise.resolve(domainSuccess(null));
      let { job } = stored;
      const stageIndex = ANALYSIS_STAGES.indexOf(job.stage);
      const shouldFail = job.rawRequest.includes("[실패 재현]") && job.attempt === 1 && job.stage === "DISCOVERING_IMPACTS";

      if (job.status === "QUEUED") {
        job = { ...job, status: "RUNNING", updatedAt: new Date().toISOString() };
      } else if (job.status === "RUNNING" && shouldFail) {
        job = { ...job, status: "FAILED", error: { code: "ANALYSIS_FIXTURE_FAILURE", title: "영향 분석을 완료하지 못했습니다", detail: "일시적인 분석 작업 오류입니다. 원문을 유지한 채 다시 시도할 수 있습니다." }, updatedAt: new Date().toISOString() };
      } else if (job.status === "RUNNING" && stageIndex < ANALYSIS_STAGES.length - 1) {
        const nextStage = ANALYSIS_STAGES[stageIndex + 1] as AnalysisStage;
        job = { ...job, stage: nextStage, completedStages: [...job.completedStages, job.stage], updatedAt: new Date().toISOString() };
      } else if (job.status === "RUNNING") {
        const outcome = createOutcome({ projectId: job.projectId, contextSnapshot: job.contextSnapshot, rawRequest: job.rawRequest }, job.changeId ?? "", job.createdAt);
        job = { ...job, status: "COMPLETED", completedStages: [...ANALYSIS_STAGES], updatedAt: new Date().toISOString() };
        const parsedOutcome = parseAnalysisOutcome(toAnalysisOutcomeWire(outcome));
        analyses.set(jobId, { job, outcome: parsedOutcome });
        if (job.changeId !== null) persistOutcome(job.projectId, job.changeId, parsedOutcome);
        return Promise.resolve(domainSuccess(parseAnalysisJob(toAnalysisJobWire(job))));
      }
      analyses.set(jobId, { ...stored, job });
      return Promise.resolve(domainSuccess(parseAnalysisJob(toAnalysisJobWire(job))));
    },

    retryAnalysis(jobId, idempotencyKey) {
      const stored = analyses.get(jobId);
      if (stored === undefined) return Promise.resolve(domainFailure("ANALYSIS_JOB_NOT_FOUND", "분석 작업을 찾을 수 없습니다", "프로젝트에서 요청을 다시 시작해 주세요."));
      const previousAttempt = retryIndex.get(idempotencyKey);
      if (previousAttempt !== undefined) return Promise.resolve(domainSuccess(parseAnalysisJob(toAnalysisJobWire(stored.job))));
      if (stored.job.status !== "FAILED") return Promise.resolve(domainFailure("ANALYSIS_RETRY_NOT_ALLOWED", "현재 작업은 다시 시도할 수 없습니다", "실패한 분석 작업만 다시 시도할 수 있습니다."));
      const job: AnalysisJob = { ...stored.job, status: "RUNNING", stage: "CHECKING_CONTEXT", completedStages: [], attempt: stored.job.attempt + 1, error: null, updatedAt: new Date().toISOString() };
      analyses.set(jobId, { job, outcome: null });
      retryIndex.set(idempotencyKey, job.attempt);
      return Promise.resolve(domainSuccess(parseAnalysisJob(toAnalysisJobWire(job))));
    },

    getAnalysisOutcome(projectId, changeId) {
      const stored = [...analyses.values()].find((item) => item.job.projectId === projectId && item.job.changeId === changeId);
      if (stored?.outcome !== null && stored !== undefined) return Promise.resolve(domainSuccess(parseAnalysisOutcome(toAnalysisOutcomeWire(stored.outcome))));
      return Promise.resolve(domainSuccess(restoreOutcome(projectId, changeId)));
    },
  };
}

export const fixtureAnalysisRepository = createFixtureAnalysisRepository();
