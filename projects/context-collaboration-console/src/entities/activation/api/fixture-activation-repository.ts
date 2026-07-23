import { domainFailure, domainSuccess } from "@shared/lib/result";

import type { ActivationWorkspace } from "../model/activation";
import type { ActivationRepository } from "../model/activation-repository";

const projectId = "apc-monitoring-mvp";
const changeId = "CR-DEMO-001";
const commitSha = "b".repeat(40);
const occurredAt = "2026-07-23T14:30:00+09:00";

function initialWorkspace(): ActivationWorkspace {
  return {
    projectId,
    changeId,
    title: "최근 정상 수신 시간과 24시간 경고 추가",
    status: "READY_TO_ACTIVATE",
    currentActor: { id: "user-admin-01", displayName: "운영 관리자", role: "admin" },
    contextSnapshot: "context-v1.3",
    baseCommitSha: "a".repeat(40),
    proposalRevision: 1,
    scopeFingerprint: "revision=1|scope=apc-monitoring-last-received-at-v1",
    implementationRevision: 1,
    documentIds: ["DOC-APC-CONTEXT", "DOC-APC-QA"],
    evidence: [
      { id: "evidence-auto", testId: "QA-DEMO-AUTO-01", type: "AUTOMATED", result: "PASSED", commitSha: null, verifiedBy: "system-ci-01" },
      { id: "evidence-manual", testId: "QA-DEMO-MANUAL-01", type: "MANUAL", result: "PASSED", commitSha: null, verifiedBy: "user-review-01" },
    ],
    publication: null,
    contextVersion: null,
    publishCapability: { allowed: true, reason: null },
    activationCapability: { allowed: false, reason: "현재 Git publication이 필요합니다." },
    auditEvents: [],
  };
}

export function createFixtureActivationRepository(): ActivationRepository {
  let workspace = initialWorkspace();
  const receipts = new Map<string, ActivationWorkspace>();
  const targetMatches = (input: { projectId: string; changeId: string }) => input.projectId === projectId && input.changeId === changeId;
  return {
    getWorkspace(requestProjectId, requestChangeId) {
      return Promise.resolve(domainSuccess(requestProjectId === projectId && requestChangeId === changeId ? workspace : null));
    },
    publishGit(input) {
      if (!targetMatches(input)) return Promise.resolve(domainFailure("ACTIVATION_WORKSPACE_NOT_FOUND", "활성화 대상을 찾을 수 없습니다", "프로젝트와 변경 요청을 확인하세요."));
      const replay = receipts.get(input.idempotencyKey);
      if (replay !== undefined) return Promise.resolve(domainSuccess(replay));
      if (workspace.status !== "READY_TO_ACTIVATE" || !workspace.publishCapability.allowed) return Promise.resolve(domainFailure("GIT_PUBLICATION_STATE_INVALID", "Git 반영을 시작할 수 없습니다", workspace.publishCapability.reason ?? "현재 상태를 확인하세요."));
      if (input.expectedBaseCommitSha !== workspace.baseCommitSha || input.proposalRevision !== workspace.proposalRevision || input.scopeFingerprint !== workspace.scopeFingerprint || input.implementationRevision !== workspace.implementationRevision) return Promise.resolve(domainFailure("PUBLICATION_REVISION_STALE", "Git 반영 범위가 최신 구현과 다릅니다", "최신 revision을 다시 확인하세요."));
      workspace = {
        ...workspace,
        evidence: workspace.evidence.map((item) => ({ ...item, commitSha })),
        publication: { branch: "context/cr-demo-001-r1", commitSha, pullRequestUrl: "sandbox://pull-requests/CR-DEMO-001", pullRequestStatus: "OPEN", proposalRevision: 1, scopeFingerprint: workspace.scopeFingerprint, implementationRevision: 1, baseCommitSha: workspace.baseCommitSha, publishedBy: input.actorId, publishedAt: occurredAt },
        publishCapability: { allowed: false, reason: "Git publication이 이미 생성되었습니다." },
        activationCapability: { allowed: true, reason: null },
        auditEvents: [...workspace.auditEvents, { id: `${input.idempotencyKey}:git.publication_created`, actorId: input.actorId, action: "git.publication_created", targetType: "CHANGE_REQUEST", targetId: changeId, requestId: input.idempotencyKey, occurredAt }],
      };
      receipts.set(input.idempotencyKey, workspace);
      return Promise.resolve(domainSuccess(workspace));
    },
    activate(input) {
      if (!targetMatches(input)) return Promise.resolve(domainFailure("ACTIVATION_WORKSPACE_NOT_FOUND", "활성화 대상을 찾을 수 없습니다", "프로젝트와 변경 요청을 확인하세요."));
      const replay = receipts.get(input.idempotencyKey);
      if (replay !== undefined) return Promise.resolve(domainSuccess(replay));
      if (!workspace.activationCapability.allowed || workspace.publication === null) return Promise.resolve(domainFailure("GIT_PUBLICATION_REQUIRED", "Git 반영 결과가 없습니다", workspace.activationCapability.reason ?? "Git 반영을 먼저 완료하세요."));
      if (input.actorId !== "user-admin-01") return Promise.resolve(domainFailure("ACTIVATION_PERMISSION_DENIED", "Context 활성화 권한이 없습니다", "관리자 권한이 필요합니다."));
      const contextVersion = { version: input.version, projectId, changeRequestId: changeId, documentIds: [...input.documentIds], sourceCommitSha: workspace.publication.commitSha, activatedBy: input.actorId, activatedAt: occurredAt };
      workspace = {
        ...workspace,
        status: "ACTIVATED",
        contextVersion,
        activationCapability: { allowed: false, reason: "이미 활성화되었습니다." },
        auditEvents: [...workspace.auditEvents, { id: `${input.idempotencyKey}:context.activated`, actorId: input.actorId, action: "context.activated", targetType: "CONTEXT_VERSION", targetId: input.version, requestId: input.idempotencyKey, occurredAt }],
      };
      receipts.set(input.idempotencyKey, workspace);
      return Promise.resolve(domainSuccess(workspace));
    },
  };
}

export const fixtureActivationRepository = createFixtureActivationRepository();
