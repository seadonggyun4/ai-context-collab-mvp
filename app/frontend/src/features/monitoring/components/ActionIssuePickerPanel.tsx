import { ShellButton } from "@shared/components/AstryxPrimitives";
import {
  APC_LABELS,
  CROP_LABELS,
  ISSUE_SEVERITY_LABELS,
  ISSUE_STATUS_LABELS,
  SNP_SE_LABELS
} from "@shared/constants/monitoringLabels";
import type { QualityIssueItem } from "@shared/types/monitoring";
import { getActionIssuePickerPolicySummary } from "@features/monitoring/services/actionIssuePickerPolicy";

interface ActionIssuePickerPanelProps {
  isLoading: boolean;
  issues: QualityIssueItem[];
  onClose: () => void;
  onSelect: (issueId: string) => void;
}

export function ActionIssuePickerPanel({
  isLoading,
  issues,
  onClose,
  onSelect
}: ActionIssuePickerPanelProps) {
  if (isLoading) {
    return (
      <div className="issue-picker-panel" role="status">
        <strong>작성 가능한 품질 이슈를 불러오는 중입니다.</strong>
      </div>
    );
  }

  return (
    <section
      aria-label="조치 작성 대상 품질 이슈 선택"
      className="issue-picker-panel"
      data-astryx-component="Dialog"
    >
      <header className="issue-picker-panel__header">
        <div>
          <span>조치 작성 대상 선택</span>
          <strong>미확인/확인중 품질 이슈</strong>
          <p>선택하면 데이터 품질 이슈 상세로 이동하고 조치 등록 영역에 focus됩니다.</p>
        </div>
        <ShellButton onClick={onClose} variant="ghost">
          닫기
        </ShellButton>
      </header>

      <div className="issue-picker-summary" role="note">
        <span>{getActionIssuePickerPolicySummary()}</span>
        <strong>{issues.length}건</strong>
      </div>

      {issues.length > 0 ? (
        <div className="issue-picker-list">
          {issues.map((issue) => (
            <button
              className="issue-picker-item"
              key={issue.issueId}
              onClick={() => onSelect(issue.issueId)}
              type="button"
            >
              <header>
                <strong>{issue.summary}</strong>
                <span className="quality-badge" data-severity={issue.severity}>
                  {ISSUE_SEVERITY_LABELS[issue.severity]}
                </span>
              </header>
              <div className="issue-picker-meta">
                <span>{APC_LABELS[issue.apc]}</span>
                <span>{CROP_LABELS[issue.crop]}</span>
                <span>{SNP_SE_LABELS[issue.snpSe]}</span>
                <span>{issue.issueTypeLabel}</span>
                <span>{ISSUE_STATUS_LABELS[issue.status]}</span>
                <span>{issue.lastOccurredAt.replace("T", " ").slice(0, 16)}</span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <p className="empty-inline">현재 작성 가능한 품질 이슈가 없습니다.</p>
      )}
    </section>
  );
}
