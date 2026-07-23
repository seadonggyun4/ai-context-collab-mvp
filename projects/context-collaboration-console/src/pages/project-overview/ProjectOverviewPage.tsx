import { Link, useParams } from "react-router-dom";

import { useProjectDashboard } from "@entities/project";
import { routes } from "@shared/config";
import { DataErrorState, DataState } from "@shared/ui/data-state";
import { OperationalShell } from "@widgets/operational-shell";
import { ProjectDashboard } from "@widgets/project-dashboard";

import "./project-overview.css";

export function ProjectOverviewPage() {
  const { projectId = "" } = useParams();
  const state = useProjectDashboard(projectId);

  if (state.status === "loading") {
    return <DataState kind="loading" title="프로젝트 현황을 불러오고 있습니다" description="활성 Context와 최근 검증 결과를 확인합니다." />;
  }
  if (state.status === "not-found") {
    return <DataState kind="empty" title="프로젝트를 찾을 수 없습니다" description="프로젝트 주소를 확인해 주세요." action={{ label: "시작 화면으로 이동", href: "/" }} />;
  }
  if (state.status === "error") {
    return <DataErrorState error={state.error} action={{ label: "시작 화면으로 이동", href: "/" }} />;
  }

  const { dashboard } = state;
  const { project } = dashboard;

  return (
    <OperationalShell projectId={project.id} projectName={project.name} contextVersion={project.activeContextVersion}>
      <div className="overview-page">
        <header className="overview-heading">
          <div>
            <p>프로젝트 개요</p>
            <h1>{project.name}</h1>
            <dl>
              <div><dt>Repository</dt><dd>{project.repository}</dd></div>
              <div><dt>활성 Context</dt><dd>v{project.activeContextVersion} · {project.effectiveDate} 시행</dd></div>
              <div><dt>마지막 검증</dt><dd>{project.lastVerifiedAt}</dd></div>
            </dl>
          </div>
          <Link className="primary-action" to={routes.newChange(project.id)}><span>변경 요청 등록</span></Link>
        </header>

        <ProjectDashboard dashboard={dashboard} />
      </div>
    </OperationalShell>
  );
}
