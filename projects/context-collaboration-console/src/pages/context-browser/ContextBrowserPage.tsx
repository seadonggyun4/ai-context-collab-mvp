import { useParams } from "react-router-dom";

import { useDocumentList } from "@entities/document";
import { useProjectDashboard } from "@entities/project";
import { DataErrorState, DataState } from "@shared/ui/data-state";
import { DocumentBrowser } from "@widgets/document-browser";
import { OperationalShell } from "@widgets/operational-shell";

import "./context-browser.css";

export function ContextBrowserPage() {
  const { projectId = "" } = useParams();
  const projectState = useProjectDashboard(projectId);
  const documentState = useDocumentList(projectId);

  if (projectState.status === "loading" || documentState.status === "loading") {
    return <DataState kind="loading" title="프로젝트 문서를 불러오고 있습니다" description="역할별 기준과 Git revision을 확인합니다." />;
  }
  if (projectState.status === "not-found") return <DataState kind="empty" title="프로젝트를 찾을 수 없습니다" description="프로젝트 주소를 확인해 주세요." action={{ label: "시작 화면으로 이동", href: "/" }} />;
  if (projectState.status === "error") return <DataErrorState error={projectState.error} />;
  if (documentState.status === "error") return <DataErrorState error={documentState.error} />;

  const project = projectState.dashboard.project;
  return (
    <OperationalShell projectId={project.id} projectName={project.name} contextVersion={project.activeContextVersion}>
      <div className="context-browser-page"><DocumentBrowser projectId={project.id} documents={documentState.documents} /></div>
    </OperationalShell>
  );
}
