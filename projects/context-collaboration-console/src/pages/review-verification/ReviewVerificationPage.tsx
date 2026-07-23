import { Link, useParams } from "react-router-dom";

import { useProjectDashboard } from "@entities/project";
import { useReviewWorkspace } from "@entities/review-workspace";
import { routes } from "@shared/config";
import { DataErrorState, DataState } from "@shared/ui/data-state";
import { OperationalShell } from "@widgets/operational-shell";
import { ReviewWorkspace } from "@widgets/review-workspace";

import "./review-verification.css";

export function ReviewVerificationPage() {
  const { projectId = "", changeId = "" } = useParams();
  const projectState = useProjectDashboard(projectId);
  const review = useReviewWorkspace(projectId, changeId);

  if (projectState.status === "loading" || review.state.status === "loading") return <DataState kind="loading" title="검토 범위를 불러오고 있습니다" description="승인 revision과 현재 검증 근거를 확인합니다." />;
  if (projectState.status === "error") return <DataErrorState error={projectState.error} />;
  if (review.state.status === "error") return <DataErrorState error={review.state.error} action={{ label: "다시 시도", href: routes.review(projectId, changeId) }} />;
  if (projectState.status === "not-found" || review.state.status === "not-found") return <DataState kind="empty" title="검토 대상을 찾을 수 없습니다" description="변경 요청의 상태와 분석 결과를 확인해 주세요." action={{ label: "변경 요청으로 이동", href: routes.change(projectId, changeId) }} />;

  const project = projectState.dashboard.project;
  return <OperationalShell projectId={project.id} projectName={project.name} contextVersion={project.activeContextVersion}><div className="review-verification-page"><ReviewWorkspace workspace={review.state.workspace} onWorkspace={(workspace) => review.setState({ status: "ready", workspace })} />{review.state.workspace.status === "READY_TO_ACTIVATE" && <div className="review-activation-next"><div><strong>승인과 검증이 완료되었습니다</strong><p>Git publication과 새 Context version을 준비할 수 있습니다.</p></div><Link to={routes.activation(projectId, changeId)}>Git 반영으로 이동</Link></div>}</div></OperationalShell>;
}
