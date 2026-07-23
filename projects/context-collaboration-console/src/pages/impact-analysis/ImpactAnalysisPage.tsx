import { useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";

import { resolveImpactSelection, useImpactGraph } from "@entities/impact";
import { useProjectDashboard } from "@entities/project";
import { routes } from "@shared/config";
import { DataErrorState, DataState } from "@shared/ui/data-state";
import { ImpactExplorer } from "@widgets/impact-explorer";
import { OperationalShell } from "@widgets/operational-shell";

import "./impact-analysis.css";

import type { ImpactGraph } from "@entities/impact";
import type { Project } from "@entities/project";

export function ImpactAnalysisPage() {
  const { projectId = "", changeId = "" } = useParams();
  const projectState = useProjectDashboard(projectId);
  const impactState = useImpactGraph(projectId, changeId);

  if (projectState.status === "loading" || impactState.status === "loading") return <DataState kind="loading" title="영향 관계를 불러오고 있습니다" description="요청에서 QA까지 이어지는 근거 경로를 구성합니다." />;
  if (projectState.status === "error") return <DataErrorState error={projectState.error} />;
  if (impactState.status === "error") return <DataErrorState error={impactState.error} />;
  if (projectState.status === "not-found" || impactState.status === "not-found") return <DataState kind="empty" title="영향 분석을 찾을 수 없습니다" description="변경 요청의 분석 상태를 확인해 주세요." action={{ label: "프로젝트로 이동", href: routes.project(projectId) }} />;

  return <ImpactAnalysisReady project={projectState.dashboard.project} graph={impactState.graph} />;
}

function ImpactAnalysisReady({ project, graph }: { project: Project; graph: ImpactGraph }) {
  const [params, setParams] = useSearchParams();
  const selectedParam = params.get("selected");
  const selection = resolveImpactSelection(graph, selectedParam);

  useEffect(() => {
    if (selectedParam === selection.id) return;
    const next = new URLSearchParams(params);
    next.set("selected", selection.id);
    setParams(next, { replace: true });
  }, [params, selectedParam, selection.id, setParams]);

  function select(id: string) {
    const next = new URLSearchParams(params);
    next.set("selected", id);
    setParams(next, { replace: true });
  }

  return (
    <OperationalShell projectId={project.id} projectName={project.name} contextVersion={project.activeContextVersion}>
      <div className="impact-analysis-page"><ImpactExplorer graph={graph} selection={selection} onSelect={select} /></div>
    </OperationalShell>
  );
}
