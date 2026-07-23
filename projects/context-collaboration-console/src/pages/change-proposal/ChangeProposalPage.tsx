import { useParams } from "react-router-dom";

import { useAnalysisOutcome } from "@entities/analysis";
import { useProjectDashboard } from "@entities/project";
import { routes } from "@shared/config";
import { DataErrorState, DataState } from "@shared/ui/data-state";
import { ChangeProposal } from "@widgets/change-proposal";
import { OperationalShell } from "@widgets/operational-shell";

export function ChangeProposalPage() {
  const { changeId = "", projectId = "" } = useParams();
  const projectState = useProjectDashboard(projectId);
  const analysisState = useAnalysisOutcome(projectId, changeId);

  if (projectState.status === "loading" || analysisState.status === "loading") return <DataState kind="loading" title="분석 제안을 불러오고 있습니다" description="요청 원문과 영향 범위를 확인합니다." />;
  if (projectState.status === "error") return <DataErrorState error={projectState.error} />;
  if (analysisState.status === "error") return <DataErrorState error={analysisState.error} />;
  if (projectState.status === "not-found" || analysisState.status === "not-found") return <DataState kind="empty" title="분석 제안을 찾을 수 없습니다" description="프로젝트의 변경 요청에서 다시 확인해 주세요." action={{ label: "프로젝트로 이동", href: `/projects/${projectId}` }} />;

  const { project } = projectState.dashboard;
  return <OperationalShell projectId={project.id} projectName={project.name} contextVersion={project.activeContextVersion}><ChangeProposal editHref={routes.newChange(project.id)} impactHref={routes.impact(project.id, changeId)} reviewHref={routes.review(project.id, changeId)} outcome={analysisState.outcome} /></OperationalShell>;
}
