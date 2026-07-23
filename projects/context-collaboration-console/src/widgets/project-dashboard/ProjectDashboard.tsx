import type { ProjectDashboard as ProjectDashboardModel } from "@entities/project";

import "./project-dashboard.css";

interface ProjectDashboardProps {
  dashboard: ProjectDashboardModel;
}

const attentionLabels = {
  APPROVAL: "승인",
  VERIFICATION: "검증",
  ALIGNMENT: "정합성",
} as const;

export function ProjectDashboard({ dashboard }: ProjectDashboardProps) {
  const { activeChanges, alignment, attentionQueue, latestArtifacts, project, recentQa } = dashboard;

  return (
    <>
      <nav className="metric-strip" aria-label="프로젝트 핵심 지표">
        {project.metrics.map((metric) => (
          <a
            key={metric.id}
            href={metric.id === "activeChanges" ? "#active-changes" : metric.id === "alignment" ? "#alignment-status" : "#attention-queue"}
            data-tone={metric.tone}
          >
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            <small>{metric.detail}</small>
          </a>
        ))}
      </nav>

      <div className="dashboard-primary-grid">
        <section className="dashboard-section active-changes" id="active-changes" aria-labelledby="active-changes-title">
          <SectionHeading
            id="active-changes-title"
            title="진행 중 변경"
            description="주의가 필요한 순서로 현재 단계와 담당 범위를 보여줍니다."
            action="전체 변경 보기"
          />
          <div className="change-table-wrap">
            <table className="change-table">
              <thead>
                <tr><th>변경 요청 · 담당</th><th>위험</th><th>상태</th><th>최근 갱신</th></tr>
              </thead>
              <tbody>
                {activeChanges.map((change) => (
                  <tr key={change.id}>
                    <th scope="row"><span>{change.id}</span>{change.title}<small>{change.ownerLabel}</small></th>
                    <td data-label="위험"><StatusText tone={change.risk === "HIGH" ? "danger" : change.risk === "MEDIUM" ? "warning" : "neutral"} label={change.riskLabel} /></td>
                    <td data-label="상태"><StatusText tone={change.status === "IN_REVIEW" || change.status === "VERIFYING" ? "warning" : "info"} label={change.statusLabel} /></td>
                    <td data-label="최근 갱신"><time dateTime={change.updatedAt}>{change.updatedLabel}</time></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="dashboard-section attention-queue" id="attention-queue" aria-labelledby="attention-title">
          <SectionHeading id="attention-title" title="확인이 필요한 항목" description="완료를 막는 원인과 다음 확인 위치입니다." />
          <ol>
            {attentionQueue.map((item) => (
              <li key={item.id} data-priority={item.priority}>
                <div><span>{attentionLabels[item.kind]}</span><strong>{item.title}</strong></div>
                <p>{item.reason}</p>
                <a href={item.target}>{item.actionLabel} <span aria-hidden="true">→</span></a>
              </li>
            ))}
          </ol>
        </aside>
      </div>

      <div className="dashboard-secondary-grid">
        <section className="dashboard-section artifact-section" aria-labelledby="artifact-title">
          <SectionHeading id="artifact-title" title="역할별 최신 산출물" description="활성 Context에서 역할별로 참조하는 최신 기준입니다." action="문맥 구성 보기" />
          <ul className="artifact-list">
            {latestArtifacts.map((artifact) => (
              <li key={artifact.id}>
                <span className="artifact-role">{artifact.roleLabel}</span>
                <div><strong>{artifact.title}</strong><small>{artifact.id} · {artifact.version}</small></div>
                <StatusText tone={artifact.status === "ACTIVE" ? "success" : "warning"} label={artifact.statusLabel} />
                <time dateTime={artifact.updatedAt}>{artifact.updatedLabel}</time>
              </li>
            ))}
          </ul>
        </section>

        <section className="dashboard-section alignment-section" id="alignment-status" aria-labelledby="alignment-title">
          <SectionHeading id="alignment-title" title="문서·구현 정합성" description={`마지막 검사 ${alignment.lastCheckedLabel}`} />
          <div className="alignment-score">
            <strong>{alignment.score}<span>%</span></strong>
            <div><StatusText tone={alignment.status === "ALIGNED" ? "success" : "warning"} label={alignment.statusLabel} /><p>활성 기준과 구현 revision의 연결 상태입니다.</p></div>
          </div>
          <div className="alignment-meter" role="progressbar" aria-label="문서와 구현 정합성" aria-valuemin={0} aria-valuemax={100} aria-valuenow={alignment.score}>
            <span style={{ width: `${alignment.score}%` }} />
          </div>
          <ul className="alignment-issues">
            {alignment.issues.map((issue) => <li key={issue.id}><strong>{issue.title}</strong><span>{issue.detail}</span><small>{issue.source}</small></li>)}
          </ul>
        </section>
      </div>

      <section className="dashboard-section qa-section" id="recent-qa" aria-labelledby="recent-qa-title">
        <SectionHeading id="recent-qa-title" title="최근 QA와 평가" description="자동 검사와 사람의 확인을 같은 변경 증거로 추적합니다." action="검증 증거 보기" />
        <ol className="qa-timeline">
          {recentQa.map((qa) => (
            <li key={qa.id}>
              <div className="qa-timeline__marker" data-result={qa.result} aria-hidden="true" />
              <div className="qa-timeline__body">
                <div><span>{qa.kindLabel}</span><time dateTime={qa.runAt}>{qa.runLabel}</time></div>
                <strong>{qa.title}</strong>
                <p>{qa.summary}</p>
              </div>
              <div className="qa-timeline__result"><StatusText tone={qa.result === "PASSED" ? "success" : qa.result === "PENDING" ? "neutral" : "warning"} label={qa.resultLabel} /><small>증거 {qa.evidenceCount}건</small></div>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}

interface SectionHeadingProps {
  id: string;
  title: string;
  description: string;
  action?: string;
}

function SectionHeading({ action, description, id, title }: SectionHeadingProps) {
  return (
    <header className="dashboard-section__heading">
      <div><h2 id={id}>{title}</h2><p>{description}</p></div>
      {action ? <span className="dashboard-section__next">{action} <span aria-hidden="true">→</span></span> : null}
    </header>
  );
}

function StatusText({ label, tone }: { label: string; tone: "neutral" | "info" | "success" | "warning" | "danger" }) {
  return <span className="status-text" data-tone={tone}><span aria-hidden="true" />{label}</span>;
}
