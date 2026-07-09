import { ShellButton, ShellPanel } from "@shared/components/AstryxPrimitives";
import { StatusBadge } from "@shared/components/StatusBadge";
import { PIPELINE_STEP_STATUS_LABELS } from "@shared/constants/monitoringLabels";
import type { PipelineTraceResponse } from "@shared/types/monitoring";

interface PipelineTracePanelProps {
  trace: PipelineTraceResponse;
  onOpenRelatedIssue?: (issueId: string, traceId: string) => void;
  onOpenRelatedIssueAction?: (issueId: string, traceId: string) => void;
}

export function PipelineTracePanel({
  trace,
  onOpenRelatedIssue,
  onOpenRelatedIssueAction
}: PipelineTracePanelProps) {
  const primaryIssueId = trace.relatedIssueIds[0] ?? null;
  const hasFailedStep = trace.steps.some((step) => step.status === "FAILED");

  return (
    <ShellPanel
      actions={<StatusBadge status={trace.status} />}
      className="pipeline-panel"
      title="파이프라인 추적"
    >
      <div className="trace-summary">
        <span>{trace.traceId}</span>
        <strong>{trace.recommendedAction ?? "추가 조치 없음"}</strong>
      </div>
      <div className="pipeline-cta-box" aria-label="파이프라인 관련 조치">
        {primaryIssueId ? (
          <>
            <div>
              <span>관련 이슈</span>
              <strong>{trace.relatedIssueIds.join(", ")}</strong>
              <p>
                실패 trace를 품질 이슈 상세와 운영 조치 작성 흐름으로 연결합니다.
              </p>
            </div>
            <div className="pipeline-cta-actions">
              <ShellButton
                onClick={() => onOpenRelatedIssue?.(primaryIssueId, trace.traceId)}
                variant="secondary"
              >
                관련 이슈 보기
              </ShellButton>
              <ShellButton
                onClick={() => onOpenRelatedIssueAction?.(primaryIssueId, trace.traceId)}
              >
                운영 조치 작성
              </ShellButton>
            </div>
          </>
        ) : (
          <div>
            <span>관련 이슈 없음</span>
            <strong>{hasFailedStep ? "이슈 연결 대기" : "추가 조치 없음"}</strong>
            <p>
              이 trace에는 연결된 품질 이슈가 없습니다. Airflow 원문 로그 연결은 후속
              운영 연동 범위입니다.
            </p>
          </div>
        )}
      </div>
      <ol className="timeline-list">
        {trace.steps.map((step) => (
          <li className="timeline-item" data-step-status={step.status} key={step.stepKey}>
            <div className="timeline-item__marker" />
            <div className="timeline-item__body">
              <header>
                <strong>{step.stepLabel}</strong>
                <span>{PIPELINE_STEP_STATUS_LABELS[step.status]}</span>
              </header>
              <p>{step.message}</p>
              {step.logPreview ? <code>{step.logPreview}</code> : null}
              {step.nextAction ? <small>{step.nextAction}</small> : null}
            </div>
          </li>
        ))}
      </ol>
    </ShellPanel>
  );
}
