import { useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useProjectDashboard } from "@entities/project";
import { ChangeAnalysisForm } from "@features/submit-change-analysis";
import { routes } from "@shared/config";
import { DataErrorState, DataState } from "@shared/ui/data-state";
import { OperationalShell } from "@widgets/operational-shell";

export function NewChangeRequestPage() {
  const { projectId = "" } = useParams();
  const navigate = useNavigate();
  const projectState = useProjectDashboard(projectId);
  const handleComplete = useCallback((changeId: string) => { void navigate(routes.change(projectId, changeId)); }, [navigate, projectId]);

  if (projectState.status === "loading") return <DataState kind="loading" title="프로젝트 문맥을 확인하고 있습니다" description="요청을 분석할 활성 Context를 불러옵니다." />;
  if (projectState.status === "not-found") return <DataState kind="empty" title="프로젝트를 찾을 수 없습니다" description="프로젝트 주소를 확인해 주세요." action={{ label: "시작 화면으로 이동", href: "/" }} />;
  if (projectState.status === "error") return <DataErrorState error={projectState.error} />;

  const { project } = projectState.dashboard;
  return <OperationalShell projectId={project.id} projectName={project.name} contextVersion={project.activeContextVersion}><ChangeAnalysisForm projectId={project.id} projectName={project.name} contextSnapshot={project.activeContextVersion} onComplete={handleComplete} /></OperationalShell>;
}
