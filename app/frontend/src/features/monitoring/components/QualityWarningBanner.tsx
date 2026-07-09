import { ShellButton } from "@shared/components/AstryxPrimitives";
import {
  APC_LABELS,
  CROP_LABELS,
  ISSUE_SEVERITY_LABELS,
  SNP_SE_LABELS
} from "@shared/constants/monitoringLabels";
import type { QualityIssueItem } from "@shared/types/monitoring";

interface QualityWarningBannerProps {
  issues: QualityIssueItem[];
  isBlocking?: boolean;
  onPrimaryAction?: () => void;
  primaryActionLabel?: string;
}

export function QualityWarningBanner({
  issues,
  isBlocking = false,
  onPrimaryAction,
  primaryActionLabel = "이슈 상세 보기"
}: QualityWarningBannerProps) {
  const riskyIssues = issues.filter((issue) => issue.downloadRisk);
  const highestSeverity = getHighestSeverity(issues);
  const visibleIssue = riskyIssues[0] ?? issues[0];

  if (!issues.length) {
    return (
      <div className="quality-banner quality-banner--safe">
        <strong>현재 조건의 데이터 신뢰도 경고가 없습니다</strong>
        <p>모니터링 API 기준으로 다운로드/차트 해석을 막을 품질 이슈가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="quality-banner" data-blocking={isBlocking ? "true" : "false"}>
      <div>
        <strong>
          품질 이슈 {issues.length}건
          {riskyIssues.length ? `, 다운로드 위험 ${riskyIssues.length}건` : ""}
        </strong>
        <p>
          최고 심각도 {ISSUE_SEVERITY_LABELS[highestSeverity]} /{" "}
          {APC_LABELS[visibleIssue.apc]} {CROP_LABELS[visibleIssue.crop]}{" "}
          {SNP_SE_LABELS[visibleIssue.snpSe]} / {visibleIssue.issueTypeLabel}
        </p>
      </div>
      {onPrimaryAction ? (
        <ShellButton onClick={onPrimaryAction} variant="secondary">
          {primaryActionLabel}
        </ShellButton>
      ) : null}
    </div>
  );
}

function getHighestSeverity(issues: QualityIssueItem[]) {
  if (issues.some((issue) => issue.severity === "HIGH")) {
    return "HIGH";
  }
  if (issues.some((issue) => issue.severity === "MEDIUM")) {
    return "MEDIUM";
  }
  return "LOW";
}
