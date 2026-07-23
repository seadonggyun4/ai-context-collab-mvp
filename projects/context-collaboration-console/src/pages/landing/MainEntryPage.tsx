import { Link } from "react-router-dom";

import { useProjectDashboard } from "@entities/project";
import { primaryProjectId, routes } from "@shared/config";
import { DataErrorState, DataState } from "@shared/ui/data-state";
import { ProductWorkspacePreview } from "@widgets/product-workspace-preview";
import { PublicHeader } from "@widgets/public-header";

import "./landing.css";

const workflow = [
  ["01", "요청", "자연어 원문과 요청자를 그대로 보존합니다."],
  ["02", "분석", "수용 기준과 영향 범위, 불확실성을 분리합니다."],
  ["03", "검토", "변경 전후와 역할별 판단 기준을 비교합니다."],
  ["04", "승인", "위험도와 권한에 맞는 사람만 결정합니다."],
  ["05", "검증", "자동 검사와 수동 확인 근거를 연결합니다."],
  ["06", "활성화", "완료 조건을 통과한 문맥만 새 기준이 됩니다."],
] as const;

const roles = [
  ["기획", "요청에서 빠진 수용 기준과 영향을 확인합니다.", "요약 · 수용 기준 · 미확정 항목"],
  ["퍼블리싱", "바뀌는 화면과 표현 기준을 먼저 확인합니다.", "화면 · 컴포넌트 · 상태 표현"],
  ["개발", "승인된 계약과 구현 범위를 바로 이어받습니다.", "API · 데이터 · 예상 변경 파일"],
  ["QA", "수용 기준에서 검증 시나리오와 증거를 추적합니다.", "자동 검사 · 수동 확인 · 회귀"],
] as const;

export function MainEntryPage() {
  const state = useProjectDashboard(primaryProjectId);

  if (state.status === "loading") {
    return <DataState kind="loading" title="프로젝트 문맥을 확인하고 있습니다" description="활성 기준과 최근 검증 결과를 불러옵니다." />;
  }
  if (state.status === "not-found") {
    return <DataState kind="empty" title="기본 프로젝트를 찾을 수 없습니다" description="프로젝트 설정을 확인해 주세요." />;
  }
  if (state.status === "error") {
    return <DataErrorState error={state.error} />;
  }

  const { dashboard } = state;
  const projectRoute = routes.project(dashboard.project.id);

  return (
    <div className="public-page">
      <PublicHeader />
      <main id="main-content" tabIndex={-1}>
        <section className="hero-section">
          <div className="hero-section__content">
            <p className="section-intro">팀의 변경 운영 기준을 한곳에서</p>
            <h1>변경의 이유부터<br />검증 결과까지,<br />한 흐름으로 관리합니다.</h1>
            <p className="hero-section__description">
              기획·퍼블리싱·개발·QA가 같은 프로젝트 문맥을 이어받고, 승인된 범위와 확인 가능한 근거로 변경을 완료합니다.
            </p>
            <div className="hero-section__actions">
              <Link className="primary-link" to={projectRoute}>APC 프로젝트 열기</Link>
              <a className="text-link" href="#workflow">운영 방식 보기 <span aria-hidden="true">↓</span></a>
            </div>
          </div>
          <div className="hero-section__proof">
            <ProductWorkspacePreview dashboard={dashboard} />
            <p><strong>{dashboard.alignment.score}% 정합성</strong><span>최근 검증 {dashboard.project.lastVerifiedAt}</span></p>
          </div>
        </section>

        <section className="operating-proof" aria-label="현재 운영 상태">
          <div><strong>{dashboard.activeChanges.length}</strong><span>진행 중 변경</span></div>
          <div><strong>{dashboard.attentionQueue.length}</strong><span>확인이 필요한 항목</span></div>
          <div><strong>{dashboard.recentQa.reduce((sum, qa) => sum + qa.evidenceCount, 0)}</strong><span>연결된 최근 증거</span></div>
          <p>숫자만 보여주지 않습니다. 원인과 다음 판단 위치까지 연결합니다.</p>
        </section>

        <section className="shift-section" id="product">
          <div className="section-heading">
            <p className="section-intro">흩어진 산출물을 하나의 변경 단위로</p>
            <h2>문서는 남아 있는데<br />결정의 연결이 끊기는 문제</h2>
          </div>
          <div className="shift-comparison">
            <div><span>흩어진 업무</span><p>요청은 메신저에, 기준은 문서에, 구현은 코드에, 검증 결과는 보고서에 남습니다.</p></div>
            <span aria-hidden="true">→</span>
            <div><span>연결된 변경</span><p>요청 ID를 중심으로 기준·영향·승인·구현·증거가 같은 이력에서 이어집니다.</p></div>
          </div>
        </section>

        <section className="workflow-section" id="workflow">
          <div className="section-heading section-heading--split">
            <div><p className="section-intro">요청이 기준이 되는 과정</p><h2>빠르게 제안하고,<br />근거로 통제합니다.</h2></div>
            <p>AI는 요청을 해석하고 영향 범위를 제안합니다. 사람은 위험과 권한에 따라 결정하며, 검증되지 않은 변경은 활성 기준이 될 수 없습니다.</p>
          </div>
          <ol className="workflow-sequence">
            {workflow.map(([number, title, description]) => <li key={number}><span>{number}</span><strong>{title}</strong><p>{description}</p></li>)}
          </ol>
        </section>

        <section className="role-section" id="roles">
          <div className="section-heading">
            <p className="section-intro">같은 변경, 역할마다 다른 판단</p>
            <h2>필요한 문맥만 다르게 보고,<br />결정은 하나로 연결합니다.</h2>
          </div>
          <div className="role-view">
            <div className="role-view__tabs" aria-hidden="true"><strong>기획</strong><span>퍼블리싱</span><span>개발</span><span>QA</span></div>
            <div className="role-view__preview">
              <span>CR-APC-014 · 운영 조치 이력 필터 개선</span>
              <h3>변경 요약과 수용 기준</h3>
              <p>필터 조건과 관리자 권한 범위를 승인 전에 확정해야 합니다.</p>
              <dl><div><dt>영향 화면</dt><dd>운영 조치 이력</dd></div><div><dt>확정 기준</dt><dd>3 / 4</dd></div><div><dt>위험도</dt><dd>높음</dd></div></dl>
            </div>
          </div>
          <div className="role-list">
            {roles.map(([role, description, context]) => <article key={role}><strong>{role}</strong><p>{description}</p><span>{context}</span></article>)}
          </div>
        </section>

        <section className="governance-section" id="governance">
          <div><p className="section-intro">적용보다 먼저 확인할 것</p><h2>AI의 제안은 빠르게,<br />적용 권한은 명확하게.</h2></div>
          <div className="governance-copy">
            <p>정책을 우회한 변경은 완료로 처리하지 않습니다. 제안의 근거, 승인 범위, 검증 결과가 모두 연결되어야 활성 Context가 바뀝니다.</p>
            <ol>
              <li><span>01</span><div><strong>승인 전 적용 차단</strong><small>위험도와 역할에 맞는 결정권을 서버 정책으로 강제합니다.</small></div></li>
              <li><span>02</span><div><strong>변경 전후와 근거 비교</strong><small>문장 차이뿐 아니라 의미와 영향 범위를 함께 봅니다.</small></div></li>
              <li><span>03</span><div><strong>Git과 검증 이력 보존</strong><small>누가, 왜, 무엇을 확인했는지 다시 찾을 수 있습니다.</small></div></li>
            </ol>
          </div>
        </section>

        <section className="closing-section" id="evidence">
          <div><p className="section-intro">현재 프로젝트에서 바로 확인하세요</p><h2>완료라는 말보다<br />확인 가능한 근거를 남깁니다.</h2></div>
          <div><p>{dashboard.project.name}의 활성 Context, 승인 대기, 정합성 근거와 최근 QA 결과를 확인할 수 있습니다.</p><Link className="primary-link primary-link--light" to={projectRoute}>APC 프로젝트 열기</Link></div>
        </section>
      </main>
      <footer className="public-footer"><strong>Context Flow</strong><span>변경 문맥 운영</span><small>© 2026 Context Flow</small></footer>
    </div>
  );
}
