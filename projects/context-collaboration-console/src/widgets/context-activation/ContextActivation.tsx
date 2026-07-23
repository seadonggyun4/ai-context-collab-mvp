import { useState } from "react";
import { Link } from "react-router-dom";

import { useActivationActions } from "@features/activate-context";
import { routes } from "@shared/config";

import "./context-activation.css";

import type { ActivationWorkspace } from "@entities/activation";

interface Props { workspace: ActivationWorkspace; onWorkspace: (workspace: ActivationWorkspace) => void }

function shortSha(sha: string) { return sha.slice(0, 12); }

export function ContextActivation({ workspace, onWorkspace }: Props) {
  const [version, setVersion] = useState("context-v1.4");
  const actions = useActivationActions(workspace, onWorkspace);
  const published = workspace.publication !== null;
  const activated = workspace.contextVersion !== null;

  return (
    <div className="activation-workspace">
      <header className="activation-heading">
        <p>{workspace.changeId} · Git 반영과 Context 활성화</p>
        <h1>{activated ? "새 Context 기준이 활성화되었습니다" : "승인된 변경을 운영 기준으로 전환합니다"}</h1>
        <span>{workspace.title}</span>
        <dl>
          <div><dt>현재 Context</dt><dd>{workspace.contextSnapshot}</dd></div>
          <div><dt>Proposal</dt><dd>r{workspace.proposalRevision}</dd></div>
          <div><dt>구현</dt><dd>r{workspace.implementationRevision}</dd></div>
          <div><dt>실행자</dt><dd>{workspace.currentActor.displayName}</dd></div>
        </dl>
      </header>

      <ol className="activation-stages" aria-label="활성화 진행 상태">
        <li className="is-complete"><span>1</span><strong>승인·검증</strong><small>완료</small></li>
        <li className={published ? "is-complete" : "is-current"}><span>2</span><strong>Git publication</strong><small>{published ? "완료" : "대기"}</small></li>
        <li className={activated ? "is-complete" : published ? "is-current" : ""}><span>3</span><strong>Context 활성화</strong><small>{activated ? "완료" : "대기"}</small></li>
      </ol>

      {activated && workspace.contextVersion !== null ? (
        <ActivationResult workspace={workspace} />
      ) : (
        <div className="activation-layout">
          <main>
            <section className="publication-section" aria-labelledby="publication-title">
              <header><div><p>STEP 01</p><h2 id="publication-title">Git publication</h2></div><span>{published ? "PUBLISHED" : "READY"}</span></header>
              {workspace.publication === null ? (
                <>
                  <p className="section-description">승인된 proposal를 서버 정책으로 생성한 branch와 commit에 고정합니다. 원격 저장소에는 직접 push하지 않습니다.</p>
                  <dl className="revision-lock">
                    <div><dt>Base commit</dt><dd><code>{shortSha(workspace.baseCommitSha)}</code></dd></div>
                    <div><dt>Scope</dt><dd>proposal r{workspace.proposalRevision} · implementation r{workspace.implementationRevision}</dd></div>
                  </dl>
                  <button className="publication-action" type="button" disabled={!workspace.publishCapability.allowed || actions.pending !== null} title={workspace.publishCapability.reason ?? undefined} onClick={() => void actions.publish()}>{actions.pending === "publish" ? "반영 중" : "Git publication 생성"}</button>
                </>
              ) : (
                <dl className="publication-result">
                  <div><dt>Branch</dt><dd><code>{workspace.publication.branch}</code></dd></div>
                  <div><dt>Commit</dt><dd><code>{workspace.publication.commitSha}</code></dd></div>
                  <div><dt>Pull request</dt><dd>{workspace.publication.pullRequestStatus} · {workspace.publication.pullRequestUrl}</dd></div>
                  <div><dt>Published by</dt><dd>{workspace.publication.publishedBy} · {workspace.publication.publishedAt}</dd></div>
                </dl>
              )}
            </section>

            <section className="activation-evidence" aria-labelledby="activation-evidence-title">
              <header><h2 id="activation-evidence-title">Commit-linked evidence</h2><p>{workspace.evidence.length}건</p></header>
              <ul>{workspace.evidence.map((item) => <li key={item.id}><div><span>{item.type === "AUTOMATED" ? "자동" : "수동"}</span><strong>{item.testId}</strong><small>{item.verifiedBy}</small></div><div><strong>{item.result === "PASSED" ? "통과" : item.result}</strong><code>{item.commitSha === null ? "commit 연결 대기" : shortSha(item.commitSha)}</code></div></li>)}</ul>
            </section>
          </main>

          <aside>
            <section className="activate-section" aria-labelledby="activate-title">
              <header><p>STEP 02</p><h2 id="activate-title">Context 활성화</h2></header>
              <p>Project의 활성 기준을 새 version으로 전환합니다. 관리자만 실행할 수 있습니다.</p>
              <label><span>새 Context version</span><input value={version} onChange={(event) => setVersion(event.target.value)} disabled={!published || actions.pending !== null} /></label>
              <div className="activation-documents"><span>포함 문서</span><ul>{workspace.documentIds.map((id) => <li key={id}>{id}</li>)}</ul></div>
              <button type="button" disabled={!workspace.activationCapability.allowed || version.trim() === "" || actions.pending !== null} title={workspace.activationCapability.reason ?? undefined} onClick={() => void actions.activate(version)}>{actions.pending === "activate" ? "활성화 중" : "Context 활성화"}</button>
              {!workspace.activationCapability.allowed && <small>{workspace.activationCapability.reason}</small>}
            </section>
            <AuditSummary workspace={workspace} />
          </aside>
        </div>
      )}

      {actions.error !== null && <div className="activation-error" role="alert"><strong>{actions.error.title}</strong><p>{actions.error.detail}</p><button type="button" onClick={actions.clearError}>닫기</button></div>}
    </div>
  );
}

function ActivationResult({ workspace }: { workspace: ActivationWorkspace }) {
  const context = workspace.contextVersion;
  if (context === null) return null;
  return <section className="activation-result" aria-labelledby="activation-result-title"><div className="result-status"><span>ACTIVE</span><h2 id="activation-result-title">{context.version}</h2><p>승인 범위와 검증 근거가 commit <code>{shortSha(context.sourceCommitSha)}</code>에 고정되었습니다.</p></div><dl><div><dt>활성화한 사람</dt><dd>{context.activatedBy}</dd></div><div><dt>활성화 시각</dt><dd>{context.activatedAt}</dd></div><div><dt>Source commit</dt><dd><code>{context.sourceCommitSha}</code></dd></div><div><dt>포함 문서</dt><dd>{context.documentIds.length}건</dd></div><div><dt>검증 근거</dt><dd>{workspace.evidence.filter((item) => item.result === "PASSED").length}건 통과</dd></div></dl><div className="result-documents"><h3>포함된 기준 문서</h3><ul>{context.documentIds.map((id) => <li key={id}>{id}</li>)}</ul></div><div className="result-actions"><Link className="result-primary" to={routes.project(workspace.projectId)}>프로젝트로 돌아가기</Link><Link to={routes.context(workspace.projectId)}>변경 이력 보기</Link></div></section>;
}

function AuditSummary({ workspace }: { workspace: ActivationWorkspace }) {
  return <section className="activation-audit" aria-labelledby="activation-audit-title"><header><h2 id="activation-audit-title">최근 감사 이력</h2><p>{workspace.auditEvents.length}건</p></header><ol>{[...workspace.auditEvents].reverse().slice(0, 4).map((event) => <li key={event.id}><strong>{event.action}</strong><span>{event.actorId}</span><small>{event.requestId}</small></li>)}</ol></section>;
}
