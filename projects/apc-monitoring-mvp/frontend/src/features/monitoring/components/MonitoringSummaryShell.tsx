import ReactECharts from "echarts-for-react";
import { MetricCard } from "@shared/components/MetricCard";
import { ShellPanel } from "@shared/components/AstryxPrimitives";
import { StatusBadge } from "@shared/components/StatusBadge";
import { STATUS_COLORS } from "@shared/constants/designTokens";
import {
  APC_LABELS,
  CROP_LABELS,
  ISSUE_SEVERITY_LABELS,
  SNP_SE_LABELS
} from "@shared/constants/monitoringLabels";
import type {
  MatrixCell,
  MonitoringKpis,
  RecentIssueItem,
  StatusDistributionItem
} from "@shared/types/monitoring";
import type {
  MatrixDrilldownCell,
  MatrixDrilldownContext
} from "@features/monitoring/types/shell";

interface MonitoringSummaryShellProps {
  kpis: MonitoringKpis;
  matrix: MatrixCell[];
  onMatrixCellSelect?: (cell: MatrixDrilldownCell) => void;
  recentIssues: RecentIssueItem[];
  selectedMatrixContext?: MatrixDrilldownContext | null;
  statusDistribution: StatusDistributionItem[];
}

export function MonitoringSummaryShell({
  kpis,
  matrix,
  onMatrixCellSelect,
  recentIssues,
  selectedMatrixContext,
  statusDistribution
}: MonitoringSummaryShellProps) {
  const statusChartOption = {
    color: statusDistribution.map((item) => STATUS_COLORS[item.status]),
    grid: { bottom: 0, left: 0, right: 0, top: 0 },
    series: [
      {
        avoidLabelOverlap: true,
        data: statusDistribution.map((item) => ({
          name: item.label,
          value: item.count
        })),
        emphasis: {
          label: {
            fontSize: 16,
            fontWeight: 700,
            show: true
          }
        },
        label: {
          color: "#222222",
          formatter: "{b} {c}",
          fontFamily: "Pretendard GOV",
          fontSize: 13
        },
        radius: ["48%", "70%"],
        type: "pie"
      }
    ],
    tooltip: {
      formatter: "{b}: {c}건",
      trigger: "item"
    }
  };

  return (
    <div className="monitoring-grid">
      <div className="metric-grid">
        <MetricCard
          description="fixture 기준 전체 APC"
          label="전체 APC"
          value={kpis.totalApcCount}
        />
        <MetricCard
          description="즉시 사용 가능한 데이터"
          label="정상"
          tone="normal"
          value={kpis.normalApcCount}
        />
        <MetricCard
          description="기준 대비 수신 지연"
          label="지연"
          tone="warning"
          value={kpis.delayedApcCount}
        />
        <MetricCard
          description="조치가 필요한 오류"
          label="오류"
          tone="danger"
          value={kpis.errorApcCount}
        />
        <MetricCard
          description="수신 기록 없음"
          label="미수신"
          tone="muted"
          value={kpis.missingApcCount}
        />
      </div>

      <ShellPanel
        actions={<span className="panel-meta">APC x 품목 x 입고/선별</span>}
        className="matrix-panel"
        title="APC 상태 Matrix"
      >
        <div className="status-matrix">
          {matrix.map((cell) => (
            <button
              aria-pressed={isSelectedMatrixCell(cell, selectedMatrixContext)}
              className="matrix-cell"
              key={`${cell.apc}-${cell.crop}-${cell.snpSe}`}
              onClick={() => onMatrixCellSelect?.(cell)}
              type="button"
            >
              <span>{cell.label}</span>
              <StatusBadge status={cell.status} />
              <small>
                {CROP_LABELS[cell.crop]} / {SNP_SE_LABELS[cell.snpSe]} / 이슈{" "}
                {cell.issueCount}
              </small>
            </button>
          ))}
        </div>
      </ShellPanel>

      <ShellPanel title="최근 이슈">
        <div className="table-wrap" data-astryx-component="Table">
          <table>
            <thead>
              <tr>
                <th>APC</th>
                <th>구분</th>
                <th>이슈</th>
                <th>심각도</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {recentIssues.map((issue) => (
                <tr key={issue.issueId}>
                  <td>{APC_LABELS[issue.apc]}</td>
                  <td>
                    {CROP_LABELS[issue.crop]} / {SNP_SE_LABELS[issue.snpSe]}
                  </td>
                  <td>{issue.issueTypeLabel}</td>
                  <td>{ISSUE_SEVERITY_LABELS[issue.severity]}</td>
                  <td>
                    <StatusBadge status={issue.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ShellPanel>

      <ShellPanel title="상태 분포">
        <div className="chart-frame" data-chart-library="echarts">
          <ReactECharts option={statusChartOption} style={{ height: 220 }} />
        </div>
        <div className="distribution-list">
          {statusDistribution.map((item) => (
            <div className="distribution-row" key={item.status}>
              <StatusBadge status={item.status} />
              <div>
                <span style={{ width: `${Math.max(item.count * 20, 18)}%` }} />
              </div>
              <strong>{item.count}</strong>
            </div>
          ))}
        </div>
      </ShellPanel>
    </div>
  );
}

function isSelectedMatrixCell(
  cell: MatrixCell,
  context?: MatrixDrilldownContext | null
) {
  return Boolean(
    context &&
      context.apc === cell.apc &&
      context.crop === cell.crop &&
      context.snpSe === cell.snpSe &&
      context.status === cell.status
  );
}
