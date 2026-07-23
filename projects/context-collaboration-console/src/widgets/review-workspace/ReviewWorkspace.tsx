import { useState } from "react";

import { useReviewActions } from "@features/review-change";

import "./review-workspace.css";

import type { ReviewDecision } from "@entities/review";
import type { EvidenceScenarioState, ReviewWorkspace as ReviewWorkspaceModel } from "@entities/review-workspace";

interface ReviewWorkspaceProps {
  workspace: ReviewWorkspaceModel;
  onWorkspace: (workspace: ReviewWorkspaceModel) => void;
}

const statusLabels = {
  REQUESTED: "요청됨", ANALYZED: "분석 완료", IN_REVIEW: "검토 중", CHANGES_REQUESTED: "수정 요청", APPROVED: "승인됨",
  IMPLEMENTING: "구현 중", VERIFYING: "검증 중", READY_TO_ACTIVATE: "활성화 준비", ACTIVATED: "활성화됨", REJECTED: "반려됨",
} as const;
const riskLabels = { LOW: "낮음", MEDIUM: "보통", HIGH: "높음" } as const;
const decisionLabels = { APPROVED: "승인", CHANGES_REQUESTED: "수정 요청", REJECTED: "반려" } as const;
const resultLabels = { PASSED: "통과", FAILED: "실패", PARTIALLY_VERIFIED: "일부 확인", NOT_EXECUTED: "미실행", MANUAL_REQUIRED: "수동 확인 필요" } as const;
const sectionLabels = { SUMMARY: "요약", ACCEPTANCE: "수용 기준", IMPACT: "영향", FILE: "파일", QA: "QA" } as const;
const actionLabels: Record<string, string> = {
  "change.status_transitioned": "상태 변경",
  "review.recorded": "검토 결정 기록",
  "evidence.recorded": "검증 근거 기록",
};

function formatFingerprint(fingerprint: string): string {
  if (fingerprint.length <= 64) return fingerprint;
  return `${fingerprint.slice(0, 38)}…${fingerprint.slice(-12)}`;
}

export function ReviewWorkspace({ workspace, onWorkspace }: ReviewWorkspaceProps) {
  const [diffMode, setDiffMode] = useState<"SEMANTIC" | "RAW">("SEMANTIC");
  const [mobilePane, setMobilePane] = useState<"DIFF" | "CONTROL">("DIFF");
  const [decision, setDecision] = useState<ReviewDecision | null>(null);
  const [comment, setComment] = useState("");
  const actions = useReviewActions(workspace, (next) => {
    onWorkspace(next);
    setDecision(null);
    setComment("");
  });
  return (
    <div className="review-workspace">
      <header className="review-heading">
        <div><p>{workspace.changeId} · 승인과 검증</p><h1>{workspace.title}</h1><span>변경 범위, 결정 권한과 완료 근거를 같은 revision에서 확인합니다.</span></div>
        <dl>
          <div><dt>상태</dt><dd>{statusLabels[workspace.status]}</dd></div>
          <div><dt>위험도</dt><dd>{riskLabels[workspace.risk]}</dd></div>
          <div><dt>Proposal</dt><dd>r{workspace.proposalRevision}</dd></div>
          <div><dt>구현</dt><dd>r{workspace.implementationRevision}</dd></div>
        </dl>
      </header>

      <div className="review-mobile-switch" role="group" aria-label="모바일 검토 영역">
        <button type="button" aria-pressed={mobilePane === "DIFF"} onClick={() => setMobilePane("DIFF")}>변경안</button>
        <button type="button" aria-pressed={mobilePane === "CONTROL"} onClick={() => setMobilePane("CONTROL")}>결정·검증</button>
      </div>

      <div className={`review-layout mobile-${mobilePane.toLowerCase()}`}>
        <section className="review-diff-pane" aria-labelledby="review-diff-title">
          <header className="review-section-heading"><div><h2 id="review-diff-title">변경안 비교</h2><p>{workspace.diff.baseRevision} → {workspace.diff.targetRevision}</p></div><div className="review-mode-switch" role="group" aria-label="변경안 비교 방식"><button type="button" aria-pressed={diffMode === "SEMANTIC"} onClick={() => setDiffMode("SEMANTIC")}>의미 단위</button><button type="button" aria-pressed={diffMode === "RAW"} onClick={() => setDiffMode("RAW")}>원본</button></div></header>
          {diffMode === "SEMANTIC" ? <SemanticDiff workspace={workspace} /> : <RawDiff workspace={workspace} />}
        </section>

        <aside className="review-control-pane" aria-label="결정과 검증">
          <DecisionPanel workspace={workspace} decision={decision} comment={comment} pending={actions.pendingAction !== null} error={actions.error} onDecision={setDecision} onComment={setComment} onClearError={actions.clearError} onSubmit={() => { if (decision !== null) void actions.submitDecision(decision, comment); }} />
          {workspace.transitionAction !== null && <section className="review-transition" aria-labelledby="review-transition-title"><div><h2 id="review-transition-title">다음 단계</h2><p>{workspace.transitionAction.reason ?? "현재 단계의 정책 조건을 충족했습니다."}</p></div><button type="button" disabled={!workspace.transitionAction.allowed || actions.pendingAction !== null} onClick={() => { if (workspace.transitionAction !== null) void actions.transition(workspace.transitionAction); }}>{actions.pendingAction === `transition-${workspace.transitionAction.target}` ? "처리 중" : workspace.transitionAction.label}</button></section>}
          <EvidencePanel workspace={workspace} pendingAction={actions.pendingAction} onRecord={(testId, result) => void actions.recordVerification(testId, result)} />
          <GatePanel workspace={workspace} />
          <AuditTimeline workspace={workspace} />
        </aside>
      </div>
    </div>
  );
}

function SemanticDiff({ workspace }: { workspace: ReviewWorkspaceModel }) {
  return <div className="semantic-diff" aria-label="의미 단위 변경 목록">{workspace.diff.semantic.map((entry) => <article key={entry.id} className={`semantic-diff-row is-${entry.changeType.toLowerCase()}`}><header><span>{sectionLabels[entry.section]}</span><strong>{entry.label}</strong><small>{entry.changeType === "ADDED" ? "추가" : entry.changeType === "UPDATED" ? "수정" : entry.changeType === "REMOVED" ? "삭제" : "동일"}</small></header><div><section><h3>이전</h3><p>{entry.before ?? "해당 없음"}</p></section><section><h3>제안</h3><p>{entry.after ?? "해당 없음"}</p></section></div></article>)}</div>;
}

function RawDiff({ workspace }: { workspace: ReviewWorkspaceModel }) {
  return <div className="raw-diff"><section><h3>이전 · {workspace.diff.baseRevision}</h3><pre aria-label="변경 전 원본"><code>{workspace.diff.raw.before}</code></pre></section><section><h3>제안 · {workspace.diff.targetRevision}</h3><pre aria-label="변경 후 원본"><code>{workspace.diff.raw.after}</code></pre></section></div>;
}

function DecisionPanel({ workspace, decision, comment, pending, error, onDecision, onComment, onClearError, onSubmit }: {
  workspace: ReviewWorkspaceModel; decision: ReviewDecision | null; comment: string; pending: boolean; error: ReturnType<typeof useReviewActions>["error"];
  onDecision: (decision: ReviewDecision) => void; onComment: (comment: string) => void; onClearError: () => void; onSubmit: () => void;
}) {
  return <section className="review-decision" aria-labelledby="review-decision-title"><header><h2 id="review-decision-title">검토 결정</h2><p>{workspace.currentActor.displayName} · {workspace.currentActor.role}</p></header>{workspace.currentReview !== null && <div className="review-current-decision"><span>{decisionLabels[workspace.currentReview.decision]}</span><strong>Proposal r{workspace.currentReview.proposalRevision} 결정 완료</strong><p>{workspace.currentReview.comment}</p><small>{workspace.currentReview.reviewer.displayName} · {workspace.currentReview.decidedAt}</small></div>}<div className="decision-options" role="group" aria-label="검토 결정 선택">{(["APPROVED", "CHANGES_REQUESTED", "REJECTED"] as const).map((item) => { const capability = workspace.decisionCapabilities[item]; return <button key={item} type="button" className={`decision-${item.toLowerCase()}`} aria-pressed={decision === item} disabled={!capability.allowed || pending} title={capability.reason ?? undefined} onClick={() => { onClearError(); onDecision(item); }}>{decisionLabels[item]}</button>; })}</div><label><span>검토 의견</span><textarea value={comment} onChange={(event) => onComment(event.target.value)} placeholder="결정 근거와 필요한 후속 조치를 남겨주세요." rows={4} disabled={workspace.status !== "IN_REVIEW" || pending} /></label>{decision !== null && workspace.decisionCapabilities[decision].reason !== null && <p className="decision-helper">{workspace.decisionCapabilities[decision].reason}</p>}{error !== null && <div className="review-command-error" role="alert"><strong>{error.title}</strong><p>{error.detail}</p><button type="button" onClick={onClearError}>닫기</button></div>}<button type="button" className="decision-submit" disabled={decision === null || comment.trim() === "" || pending || workspace.status !== "IN_REVIEW" || workspace.decisionCapabilities[decision].allowed === false} onClick={onSubmit}>{pending ? "처리 중" : "결정 기록"}</button><dl className="review-scope"><div><dt>승인 revision</dt><dd>r{workspace.proposalRevision}</dd></div><div><dt>Context</dt><dd>{workspace.contextSnapshot}</dd></div><div><dt>Scope fingerprint</dt><dd><code title={workspace.scopeFingerprint}>{formatFingerprint(workspace.scopeFingerprint)}</code></dd></div></dl></section>;
}

function EvidencePanel({ workspace, pendingAction, onRecord }: { workspace: ReviewWorkspaceModel; pendingAction: string | null; onRecord: (testId: string, result: "PASSED") => void }) {
  const automated = workspace.evidence.filter(({ scenario }) => scenario.type === "AUTOMATED");
  const manual = workspace.evidence.filter(({ scenario }) => scenario.type === "MANUAL");
  return <section className="review-evidence" aria-labelledby="review-evidence-title"><header><h2 id="review-evidence-title">검증 근거</h2><p>현재 구현 revision r{workspace.implementationRevision}</p></header><EvidenceGroup title="자동 검증" items={automated} capability={workspace.evidenceCapabilities.automated} pendingAction={pendingAction} actionLabel="자동 결과 동기화" onRecord={onRecord} /><EvidenceGroup title="수동 확인" items={manual} capability={workspace.evidenceCapabilities.manual} pendingAction={pendingAction} actionLabel="확인 완료 기록" onRecord={onRecord} /></section>;
}

function EvidenceGroup({ title, items, capability, pendingAction, actionLabel, onRecord }: { title: string; items: readonly EvidenceScenarioState[]; capability: { allowed: boolean; reason: string | null }; pendingAction: string | null; actionLabel: string; onRecord: (testId: string, result: "PASSED") => void }) {
  return <section className="evidence-group"><h3>{title}<span>{items.length}</span></h3><ul>{items.map(({ scenario, evidence }) => <li key={scenario.id}><div><span>{scenario.required ? "필수" : "선택"}</span><strong>{scenario.title}</strong><small>{scenario.id}</small></div><div className="evidence-result"><strong className={evidence === null ? "is-empty" : `is-${evidence.result.toLowerCase()}`}>{evidence === null ? "미실행" : resultLabels[evidence.result]}</strong>{evidence !== null && <small>{evidence.verifiedBy} · r{evidence.implementationRevision}</small>}<button type="button" disabled={!capability.allowed || pendingAction !== null || evidence?.result === "PASSED"} title={capability.reason ?? undefined} onClick={() => onRecord(scenario.id, "PASSED")}>{pendingAction === `evidence-${scenario.id}` ? "처리 중" : actionLabel}</button></div></li>)}</ul></section>;
}

function GatePanel({ workspace }: { workspace: ReviewWorkspaceModel }) {
  const gate = workspace.verificationGate;
  return <section className={`verification-gate ${gate.ready ? "is-ready" : "is-blocked"}`} aria-labelledby="verification-gate-title"><header><div><span>{gate.ready ? "READY" : "BLOCKED"}</span><h2 id="verification-gate-title">완료 Gate</h2></div><strong>{gate.ready ? "활성화 준비 가능" : `${gate.blockers.length}개 조건 미충족`}</strong></header>{gate.ready ? <p>현재 구현 revision의 필수 검증과 승인 범위가 모두 일치합니다.</p> : <ul>{gate.blockers.map((blocker, index) => <li key={`${blocker.code}-${blocker.testId ?? index}`}><strong>{blocker.title}</strong><p>{blocker.detail}</p></li>)}</ul>}</section>;
}

function AuditTimeline({ workspace }: { workspace: ReviewWorkspaceModel }) {
  return <section className="review-audit" aria-labelledby="review-audit-title"><header><h2 id="review-audit-title">감사 이력</h2><p>{workspace.auditEvents.length}건</p></header><ol>{[...workspace.auditEvents].reverse().map((event) => <li key={event.id}><span>{actionLabels[event.action] ?? event.action}</span><strong>{event.actorId}</strong><small>{event.targetType} · {event.requestId}</small><time>{event.occurredAt}</time></li>)}</ol></section>;
}
