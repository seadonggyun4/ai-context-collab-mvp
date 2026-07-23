import { useParams } from "react-router-dom";

import { useActivationWorkspace } from "@entities/activation";
import { useProjectDashboard } from "@entities/project";
import { routes } from "@shared/config";
import { DataErrorState, DataState } from "@shared/ui/data-state";
import { ContextActivation } from "@widgets/context-activation";
import { OperationalShell } from "@widgets/operational-shell";

import "./context-activation-page.css";

export function ContextActivationPage() {
  const { projectId = "", changeId = "" } = useParams();
  const projectState = useProjectDashboard(projectId);
  const activation = useActivationWorkspace(projectId, changeId);
  if (projectState.status === "loading" || activation.state.status === "loading") return <DataState kind="loading" title="활성화 기준을 확인하고 있습니다" description="Git revision과 검증 근거를 함께 조회합니다." />;
  if (projectState.status === "error") return <DataErrorState error={projectState.error} />;
  if (activation.state.status === "error") return <DataErrorState error={activation.state.error} action={{ label: "다시 시도", href: routes.activation(projectId, changeId) }} />;
  if (projectState.status === "not-found" || activation.state.status === "not-found") return <DataState kind="empty" title="활성화 대상을 찾을 수 없습니다" description="변경 요청과 승인 상태를 확인해 주세요." action={{ label: "변경 요청으로 이동", href: routes.change(projectId, changeId) }} />;
  const project = projectState.dashboard.project;
  return <OperationalShell projectId={project.id} projectName={project.name} contextVersion={activation.state.workspace.contextVersion?.version ?? project.activeContextVersion}><div className="context-activation-page"><ContextActivation workspace={activation.state.workspace} onWorkspace={(workspace) => activation.setState({ status: "ready", workspace })} /></div></OperationalShell>;
}
