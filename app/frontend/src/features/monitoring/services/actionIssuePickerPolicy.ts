import type { IssueSeverity, IssueStatus, QualityIssueItem } from "@shared/types/monitoring";

const ACTION_ENTRY_STATUSES = new Set<IssueStatus>(["OPEN", "IN_PROGRESS"]);

const ISSUE_SEVERITY_PRIORITY: Record<IssueSeverity, number> = {
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3
};

export function getActionIssuePickerItems(issues: QualityIssueItem[]) {
  return issues
    .filter((issue) => ACTION_ENTRY_STATUSES.has(issue.status))
    .sort(compareActionIssuePickerItems);
}

export function compareActionIssuePickerItems(
  left: QualityIssueItem,
  right: QualityIssueItem
) {
  const severityDiff =
    ISSUE_SEVERITY_PRIORITY[left.severity] - ISSUE_SEVERITY_PRIORITY[right.severity];

  if (severityDiff !== 0) {
    return severityDiff;
  }

  return right.lastOccurredAt.localeCompare(left.lastOccurredAt);
}

export function getActionIssuePickerPolicySummary() {
  return "미확인/확인중 이슈만 표시하며, 심각도 높은 순과 최근 발생 순으로 정렬합니다.";
}
