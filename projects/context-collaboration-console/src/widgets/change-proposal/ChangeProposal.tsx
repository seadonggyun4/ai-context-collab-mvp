import { Link } from "react-router-dom";

import type { AnalysisOutcome } from "@entities/analysis";
import type { ImpactKind, ImpactNode } from "@entities/impact";

import "./change-proposal.css";

const riskLabels = { LOW: "낮음", MEDIUM: "보통", HIGH: "높음" } as const;
const confidenceLabels = { LOW: "낮음", MEDIUM: "보통", HIGH: "높음" } as const;

export function ChangeProposal({ editHref, impactHref, reviewHref, outcome }: { editHref: string; impactHref: string; reviewHref: string; outcome: AnalysisOutcome }) {
  const { proposal, request } = outcome;
  const roles = selectImpacts(proposal.impacts, ["PLANNING", "PUBLISHING", "CODE", "QA"]);
  const screens = selectImpacts(proposal.impacts, ["PUBLISHING", "COMPONENT"]);
  const api = selectImpacts(proposal.impacts, ["API_CONTRACT"]);
  const data = selectImpacts(proposal.impacts, ["DATA"]);

  return (
    <div className="proposal-workspace">
      <header className="proposal-header">
        <div>
          <p>{request.id} · 분석 제안</p>
          <h1>{request.title}</h1>
          <dl>
            <div><dt>상태</dt><dd>분석 완료</dd></div><div><dt>위험도</dt><dd>{riskLabels[proposal.risk]}</dd></div>
            <div><dt>요청자</dt><dd>{request.requester.displayName}</dd></div><div><dt>Context</dt><dd>v{request.contextSnapshot}</dd></div>
          </dl>
        </div>
        <div className="proposal-header__actions"><Link to={editHref}>요청 수정</Link><Link to={impactHref}>영향 경로</Link><Link className="proposal-primary-action" to={reviewHref}>검토 시작</Link></div>
      </header>

      <div className="proposal-summary-grid">
        <section className="proposal-section proposal-summary" aria-labelledby="proposal-summary-title">
          <SectionTitle id="proposal-summary-title" title="변경 요약" description="요청 원문과 활성 Context를 기준으로 구조화한 제안입니다." />
          <p>{proposal.summary}</p>
          <details><summary>요청 원문 보기</summary><blockquote>{request.rawRequest}</blockquote></details>
        </section>
        <aside className="proposal-section proposal-confidence" aria-labelledby="proposal-confidence-title">
          <SectionTitle id="proposal-confidence-title" title="분석 신뢰도와 확인 사항" description={`신뢰도 ${confidenceLabels[proposal.confidence]}`} />
          <ul>{proposal.unknowns.map((unknown) => <li key={unknown}>{unknown}</li>)}</ul>
          {outcome.clarificationQuestions.map((question) => <div key={question}><span>확인 질문</span><p>{question}</p></div>)}
        </aside>
      </div>

      <section className="proposal-section criteria-section" aria-labelledby="criteria-title">
        <SectionTitle id="criteria-title" title="수용 기준" description="검토와 완료 판단에 사용하는 관찰 가능한 조건입니다." />
        <ol>{proposal.acceptanceCriteria.map((criterion) => <li key={criterion.id}><span>{criterion.priority}</span><strong>{criterion.statement}</strong><small>{criterion.id}</small></li>)}</ol>
      </section>

      <section className="proposal-section impact-section" aria-labelledby="impact-title">
        <SectionTitle id="impact-title" title="변경 영향" description="파일 목록이 아니라 역할과 제품 관계별로 먼저 확인합니다." />
        <div className="impact-groups">
          <ImpactGroup title="역할" impacts={roles} />
          <ImpactGroup title="화면·컴포넌트" impacts={screens} />
          <ImpactGroup title="API" impacts={api} />
          <ImpactGroup title="데이터" impacts={data} />
        </div>
      </section>

      <div className="proposal-detail-grid">
        <section className="proposal-section files-section" aria-labelledby="files-title">
          <SectionTitle id="files-title" title="예상 변경 파일" description="승인 전 구현 범위를 검토하기 위한 예상 경로입니다." />
          <ul>{proposal.affectedFiles.map((file) => <li key={file.path}><span>{file.changeType}</span><div><code>{file.path}</code><p>{file.reason}</p></div></li>)}</ul>
        </section>
        <section className="proposal-section qa-proposal-section" aria-labelledby="qa-proposal-title">
          <SectionTitle id="qa-proposal-title" title="QA 시나리오" description="자동 검사와 사람의 판단이 필요한 항목을 분리합니다." />
          <ul>{proposal.qaScenarios.map((scenario) => <li key={scenario.id}><span>{scenario.type === "AUTOMATED" ? "자동" : "수동"}</span><div><strong>{scenario.title}</strong><small>{scenario.id} · {scenario.required ? "필수" : "선택"}</small></div></li>)}</ul>
        </section>
      </div>
    </div>
  );
}

function selectImpacts(impacts: readonly ImpactNode[], kinds: readonly ImpactKind[]) {
  return impacts.filter((impact) => kinds.includes(impact.kind));
}

function SectionTitle({ description, id, title }: { description: string; id: string; title: string }) {
  return <header className="proposal-section__title"><h2 id={id}>{title}</h2><p>{description}</p></header>;
}

function ImpactGroup({ impacts, title }: { impacts: readonly ImpactNode[]; title: string }) {
  return <div className="impact-group"><h3>{title}</h3><ul>{impacts.map((impact) => <li key={impact.id}><strong>{impact.label}</strong><p>{impact.rationale}</p><code>{impact.sourcePath ?? "경로 확인 필요"}</code></li>)}</ul></div>;
}
