import { Link, useParams, useSearchParams } from "react-router-dom";

import { useDocumentDetail } from "@entities/document";
import { useProjectDashboard } from "@entities/project";
import { routes } from "@shared/config";
import { DataErrorState, DataState } from "@shared/ui/data-state";
import { DocumentWorkspace, RawDocumentView, StructuredDocumentView } from "@widgets/document-workspace";
import { OperationalShell } from "@widgets/operational-shell";

import "./document-detail.css";

type ViewMode = "structured" | "raw" | "edit";

function readView(value: string | null): ViewMode {
  return value === "raw" || value === "edit" ? value : "structured";
}

export function DocumentDetailPage() {
  const { projectId = "", documentId = "" } = useParams();
  const [params, setParams] = useSearchParams();
  const projectState = useProjectDashboard(projectId);
  const documentState = useDocumentDetail(documentId);
  const view = readView(params.get("view"));

  if (projectState.status === "loading" || documentState.status === "loading") return <DataState kind="loading" title="문서를 불러오고 있습니다" description="메타데이터와 원본 revision을 확인합니다." />;
  if (projectState.status === "not-found" || documentState.status === "not-found") return <DataState kind="empty" title="문서를 찾을 수 없습니다" description="문서 주소 또는 프로젝트 범위를 확인해 주세요." action={{ label: "문서 목록으로 이동", href: routes.context(projectId) }} />;
  if (projectState.status === "error") return <DataErrorState error={projectState.error} />;
  if (documentState.status === "error") return <DataErrorState error={documentState.error} />;

  const project = projectState.dashboard.project;
  const { document } = documentState;
  function selectView(next: ViewMode) {
    const nextParams = new URLSearchParams(params);
    if (next === "structured") nextParams.delete("view");
    else nextParams.set("view", next);
    setParams(nextParams, { replace: true });
  }

  return (
    <OperationalShell projectId={project.id} projectName={project.name} contextVersion={project.activeContextVersion}>
      <article className="document-detail-page">
        <Link className="document-back" to={routes.context(project.id)}>← 프로젝트 문서</Link>
        <header className="document-detail-heading">
          <div>
            <p>{document.role} · {document.format}</p>
            <h1>{document.title}</h1>
            <span>{document.path}</span>
          </div>
          <dl>
            <div><dt>상태</dt><dd>{document.status}</dd></div>
            <div><dt>버전</dt><dd>v{document.version}</dd></div>
            <div><dt>Revision</dt><dd>{document.revision.slice(0, 8)}</dd></div>
          </dl>
        </header>

        <nav className="document-view-tabs" aria-label="문서 보기 방식">
          <button type="button" aria-current={view === "structured" ? "page" : undefined} onClick={() => selectView("structured")}>구조화 보기</button>
          <button type="button" aria-current={view === "raw" ? "page" : undefined} onClick={() => selectView("raw")}>원본 보기</button>
          <button type="button" aria-current={view === "edit" ? "page" : undefined} onClick={() => selectView("edit")}>편집</button>
        </nav>

        <div className="document-view-content">
          {view === "structured" && <StructuredDocumentView document={document} />}
          {view === "raw" && <RawDocumentView document={document} />}
          {view === "edit" && <DocumentWorkspace document={document} />}
        </div>
      </article>
    </OperationalShell>
  );
}
