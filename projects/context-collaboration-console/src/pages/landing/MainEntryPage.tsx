import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";

import { useProjectDashboard } from "@entities/project";
import { primaryProjectId, routes } from "@shared/config";
import { DataErrorState, DataState } from "@shared/ui/data-state";
import { PublicHeader } from "@widgets/public-header";

import "./landing.css";

const LandingMotion = lazy(async () => {
  const module = await import("@widgets/landing-motion");
  return { default: module.LandingMotion };
});

const workflow = [
  ["01", "요청", "자연어 원문과 요청자를 보존합니다."],
  ["02", "분석", "수용 기준과 영향, 불확실성을 분리합니다."],
  ["03", "검토", "변경 전후와 역할별 판단 기준을 비교합니다."],
  ["04", "승인", "정책과 위험도에 맞는 결정만 허용합니다."],
  ["05", "검증", "자동 검사와 수동 확인 근거를 연결합니다."],
  ["06", "활성화", "완료 조건을 통과한 문맥만 기준이 됩니다."],
] as const;

const roles = [
  ["기획", "요약 · 수용 기준 · 미확정 항목", "업무 의도가 구현 조건으로 온전히 이어졌는지 판단합니다."],
  ["퍼블리싱", "화면 · 컴포넌트 · 상태 표현", "변경되는 인터페이스와 접근성 영향을 먼저 확인합니다."],
  ["개발", "API · 데이터 · 예상 변경 파일", "승인된 계약과 구현 범위를 같은 문맥에서 이어받습니다."],
  ["QA", "자동 검사 · 수동 확인 · 회귀", "수용 기준에서 검증 시나리오와 증거를 추적합니다."],
] as const;

function MotionFallback() {
  return <div className="motion-fallback" aria-hidden="true" />;
}

function MotionSlot({ scene }: { scene: "hero" | "burst" | "globe" | "stream" }) {
  if (typeof WebGLRenderingContext === "undefined") return <MotionFallback />;
  return <Suspense fallback={<MotionFallback />}><LandingMotion scene={scene} /></Suspense>;
}

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
  const evidenceCount = dashboard.recentQa.reduce((sum, qa) => sum + qa.evidenceCount, 0);

  return (
    <div className="public-page">
      <PublicHeader />
      <main id="main-content" tabIndex={-1}>
        <section className="hero-section">
          <div className="hero-section__motion">
            <MotionSlot scene="hero" />
          </div>
          <div className="hero-section__content">
            <p className="section-intro">변경 문맥 운영</p>
            <h1>변경의 이유부터<br />검증 결과까지,<br />한 흐름으로 관리합니다.</h1>
            <p className="hero-section__description">
              기획·퍼블리싱·개발·QA가 같은 프로젝트 문맥을 이어받고, 승인된 범위와 확인 가능한 근거로 변경을 완료합니다.
            </p>
            <div className="hero-section__actions">
              <Link className="primary-link" to={projectRoute}><span>APC 프로젝트 열기</span></Link>
              <a className="text-link" href="#workflow">운영 방식 보기 <span aria-hidden="true">↓</span></a>
            </div>
            <dl className="hero-section__status">
              <div><dt>활성 Context</dt><dd>{dashboard.project.activeContextVersion}</dd></div>
              <div><dt>최근 검증</dt><dd>{dashboard.project.lastVerifiedAt}</dd></div>
              <div><dt>문서 정합성</dt><dd>{dashboard.alignment.score}%</dd></div>
            </dl>
          </div>
          <p className="hero-section__signal" aria-hidden="true">REQUEST · CONTEXT · EVIDENCE</p>
        </section>

        <section className="operating-proof" aria-label="현재 운영 상태">
          <div><strong>{dashboard.activeChanges.length}</strong><span>진행 중 변경</span></div>
          <div><strong>{dashboard.attentionQueue.length}</strong><span>확인이 필요한 항목</span></div>
          <div><strong>{evidenceCount}</strong><span>연결된 최근 증거</span></div>
          <p><span>상태에서 원인과 다음 판단 위치까지 이어집니다.</span></p>
        </section>

        <section className="landing-statement">
          <p className="section-intro">흩어진 산출물을 하나의 변경 단위로</p>
          <h2>문서는 남아 있는데<br />결정의 연결이 끊기는 문제를 해결합니다.</h2>
          <p>요청은 메신저에, 기준은 문서에, 구현은 코드에, 검증은 보고서에 따로 남지 않도록 변경 ID를 중심으로 연결합니다.</p>
        </section>

        <section className="feature-story" id="workflow">
          <div className="feature-story__copy">
            <span className="feature-number">01 / REQUEST</span>
            <p className="section-intro">자연어 요청에서 영향 범위까지</p>
            <h2>한 문장의 변경을<br />검토 가능한 제안으로.</h2>
            <p>요청 원문을 보존한 채 수용 기준, 역할, 화면, API, 데이터, 예상 파일과 QA 시나리오를 분리합니다. 확정된 사실과 AI 제안을 같은 값처럼 다루지 않습니다.</p>
            <ul>
              <li>요청 snapshot과 중복 방지 key</li>
              <li>수용 기준·위험도·미확정 항목</li>
              <li>역할별 영향과 검증 시나리오</li>
            </ul>
          </div>
          <div className="motion-stage">
            <div className="motion-stage__head"><span>IMPACT SPREAD</span><strong>영향 범위 탐색</strong><small>220 links</small></div>
            <MotionSlot scene="burst" />
            <div className="motion-label motion-label--top" aria-hidden="true"><span>요청</span><strong>최근 정상 수신 시간</strong></div>
            <div className="motion-label motion-label--right" aria-hidden="true"><span>영향</span><strong>화면 · API · QA</strong></div>
          </div>
        </section>

        <section className="feature-story feature-story--reverse">
          <div className="motion-stage">
            <div className="motion-stage__head"><span>CONTEXT NETWORK</span><strong>기준 관계 탐색</strong><small>2,200 nodes</small></div>
            <MotionSlot scene="globe" />
            <div className="motion-label motion-label--top" aria-hidden="true"><span>활성 기준</span><strong>{dashboard.project.activeContextVersion}</strong></div>
            <div className="motion-label motion-label--bottom" aria-hidden="true"><span>역할 문맥</span><strong>기획 → 개발 → QA</strong></div>
          </div>
          <div className="feature-story__copy">
            <span className="feature-number">02 / CONTEXT</span>
            <p className="section-intro">프로젝트 기준을 역할과 계약으로 연결</p>
            <h2>같은 변경을 보되,<br />필요한 문맥은 다르게.</h2>
            <p>기획 기준에서 UI 계약, API와 데이터 모델, 테스트 시나리오로 이어지는 파생 관계를 보여줍니다. 원본 Markdown과 YAML은 Git에서 계속 추적됩니다.</p>
            <ul>
              <li>상위 기준과 파생 문서 경로</li>
              <li>구조화 보기와 검증 가능한 원본</li>
              <li>그래프와 키보드 목록의 동일 관계</li>
            </ul>
          </div>
        </section>

        <section className="feature-story" id="governance">
          <div className="feature-story__copy">
            <span className="feature-number">03 / EVIDENCE</span>
            <p className="section-intro">적용보다 먼저 확인할 것</p>
            <h2>빠른 제안 위에<br />분명한 완료 기준을.</h2>
            <p>정책을 우회한 변경은 완료로 처리하지 않습니다. 변경 전후, 승인 범위, 자동 검사와 수동 확인이 모두 연결되어야 활성 Context가 바뀝니다.</p>
            <ul>
              <li>승인 전 write·activation 차단</li>
              <li>semantic/raw diff와 판단 근거</li>
              <li>검증 evidence와 commit SHA 연결</li>
            </ul>
          </div>
          <div className="motion-stage">
            <div className="motion-stage__head"><span>EVIDENCE STREAM</span><strong>검증 신호 관찰</strong><small>1,400 events</small></div>
            <MotionSlot scene="stream" />
            <div className="motion-label motion-label--top" aria-hidden="true"><span>자동 검사</span><strong>계약 · 접근성 · 회귀</strong></div>
            <div className="motion-label motion-label--right" aria-hidden="true"><span>Gate</span><strong>미검증 0건</strong></div>
          </div>
        </section>

        <section className="workflow-section">
          <div className="section-heading section-heading--split">
            <div><p className="section-intro">요청이 기준이 되는 과정</p><h2>제안에서 활성화까지,<br />하나의 운영 순서로.</h2></div>
            <p>각 단계는 다음 단계의 입력과 증거가 됩니다. 완료라는 선언보다 재현 가능한 이력을 남깁니다.</p>
          </div>
          <ol className="workflow-sequence">
            {workflow.map(([number, title, description]) => <li key={number}><span>{number}</span><strong>{title}</strong><p>{description}</p></li>)}
          </ol>
        </section>

        <section className="role-section">
          <div className="section-heading">
            <p className="section-intro">역할별 판단, 하나의 변경 이력</p>
            <h2>누가 무엇을 확인해야 하는지<br />산출물 안에서 바로 드러납니다.</h2>
          </div>
          <div className="role-list">
            {roles.map(([role, context, description]) => <article key={role}><strong>{role}</strong><span>{context}</span><p>{description}</p></article>)}
          </div>
        </section>

        <section className="closing-section" id="evidence">
          <div><p className="section-intro"><span>현재 프로젝트에서 확인하세요</span></p><h2><span>완료라는 말보다<br />확인 가능한 근거를 남깁니다.</span></h2></div>
          <div><p><span>{dashboard.project.name}의 활성 Context, 승인 대기, 정합성 근거와 최근 QA 결과가 같은 흐름에 연결되어 있습니다.</span></p><Link className="primary-link primary-link--inverse" to={projectRoute}><span>APC 프로젝트 열기</span></Link></div>
        </section>
      </main>
      <footer className="public-footer"><strong>Context Flow</strong><span>변경 문맥 운영</span><small>© 2026 서동균. All rights reserved.</small></footer>
    </div>
  );
}
