import { ShellPanel } from "@shared/components/AstryxPrimitives";
import { StatusBadge } from "@shared/components/StatusBadge";
import {
  APC_LABELS,
  CROP_LABELS,
  ISSUE_SEVERITY_LABELS,
  ISSUE_STATUS_LABELS,
  SNP_SE_LABELS
} from "@shared/constants/monitoringLabels";
import type { IngestionStatusItem, QualityIssueItem } from "@shared/types/monitoring";

interface OperationalTablesShellProps {
  ingestions: IngestionStatusItem[];
  issues: QualityIssueItem[];
}

export function OperationalTablesShell({
  ingestions,
  issues
}: OperationalTablesShellProps) {
  return (
    <div className="ops-grid">
      <ShellPanel title="수신 현황 우선순위">
        <div className="table-wrap" data-astryx-component="Table">
          <table>
            <thead>
              <tr>
                <th>APC</th>
                <th>품목/구분</th>
                <th>최근 수신</th>
                <th>지연</th>
                <th>저장</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {ingestions.map((item) => (
                <tr key={item.ingestionId}>
                  <td>{APC_LABELS[item.apc]}</td>
                  <td>
                    {CROP_LABELS[item.crop]} / {SNP_SE_LABELS[item.snpSe]}
                  </td>
                  <td>{formatDateTime(item.lastReceivedAt)}</td>
                  <td>{item.delayMinutes}분</td>
                  <td>
                    origin {item.originSaved ? "Y" : "N"} / refined{" "}
                    {item.refinedSaved ? "Y" : "N"}
                  </td>
                  <td>
                    <StatusBadge status={item.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ShellPanel>

      <ShellPanel title="품질 이슈 Preview">
        <div className="issue-preview-list">
          {issues.map((issue) => (
            <article className="issue-preview-card" key={issue.issueId}>
              <div>
                <strong>{issue.issueTypeLabel}</strong>
                <span>
                  {APC_LABELS[issue.apc]} / {CROP_LABELS[issue.crop]} /{" "}
                  {SNP_SE_LABELS[issue.snpSe]}
                </span>
              </div>
              <p>{issue.summary}</p>
              <footer>
                <span>{ISSUE_SEVERITY_LABELS[issue.severity]}</span>
                <span>{ISSUE_STATUS_LABELS[issue.status]}</span>
                <span>{issue.affectedCount}건</span>
              </footer>
            </article>
          ))}
        </div>
      </ShellPanel>
    </div>
  );
}

function formatDateTime(value?: string | null) {
  if (!value) {
    return "미수신";
  }

  return value.replace("T", " ").slice(5, 16);
}
