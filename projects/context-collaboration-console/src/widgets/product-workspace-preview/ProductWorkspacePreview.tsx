import type { ProjectDashboard } from "@entities/project";

import "./product-workspace-preview.css";

export function ProductWorkspacePreview({ dashboard }: { dashboard: ProjectDashboard }) {
  const primaryChange = dashboard.activeChanges[0];
  const firstAttention = dashboard.attentionQueue[0];

  if (primaryChange === undefined || firstAttention === undefined) return null;

  return (
    <div className="workspace-preview" aria-label="실제 변경 검토 화면 예시">
      <header><div><span>APC 운영 문맥</span><strong>{dashboard.project.name}</strong></div><span>Context v{dashboard.project.activeContextVersion}</span></header>
      <div className="workspace-preview__body">
        <nav aria-label="화면 예시 메뉴"><strong>개요</strong><span>변경 요청</span><span>프로젝트 문맥</span><span>검증 증거</span></nav>
        <main>
          <div className="workspace-preview__title"><div><span>{primaryChange.id}</span><h3>{primaryChange.title}</h3></div><strong>{primaryChange.statusLabel}</strong></div>
          <dl>
            <div><dt>활성 문맥</dt><dd>v{dashboard.project.activeContextVersion}</dd></div>
            <div><dt>승인 대기</dt><dd>{dashboard.project.metrics.find((metric) => metric.id === "pendingApprovals")?.value}건</dd></div>
            <div><dt>정합성</dt><dd>{dashboard.alignment.score}%</dd></div>
          </dl>
          <section><span>지금 확인할 항목</span><strong>{firstAttention.title}</strong><p>{firstAttention.reason}</p></section>
          <footer><span>판단 근거 {dashboard.recentQa.reduce((sum, qa) => sum + qa.evidenceCount, 0)}건 연결</span><strong>검토 범위 확인 →</strong></footer>
        </main>
      </div>
    </div>
  );
}
