import { useEffect, useMemo, useState } from "react";
import { ResourceState } from "@features/monitoring/components/ResourceState";
import { useAsyncResource } from "@features/monitoring/hooks/useAsyncResource";
import type { MatrixDrilldownContext } from "@features/monitoring/types/shell";
import { monitoringApi } from "@shared/api/monitoringApi";
import { ShellPanel } from "@shared/components/AstryxPrimitives";
import {
  APC_LABELS,
  CROP_LABELS,
  ISSUE_SEVERITY_LABELS,
  ISSUE_TYPE_LABELS,
  ISSUE_STATUS_LABELS,
  SNP_SE_LABELS
} from "@shared/constants/monitoringLabels";
import type { IssueType, QualityIssueItem } from "@shared/types/monitoring";

const ALL_ISSUE_TYPES = "ALL";

const ISSUE_TYPE_OPTIONS: Array<IssueType | typeof ALL_ISSUE_TYPES> = [
  ALL_ISSUE_TYPES,
  "REQUIRED_FIELD_MISSING",
  "INVALID_FORMAT",
  "DUPLICATE_SUSPECTED",
  "OUTLIER_QUANTITY_WEIGHT",
  "UNSUPPORTED_APC_CROP",
  "REFINED_FAILED"
];

const SENSITIVE_FIELD_PATTERNS = [
  "farm",
  "farmhouse",
  "name",
  "phone",
  "address",
  "sender"
];

function getIssueTypeLabel(issueType: IssueType | typeof ALL_ISSUE_TYPES) {
  return issueType === ALL_ISSUE_TYPES ? "전체" : ISSUE_TYPE_LABELS[issueType];
}

function getIssueTypeCount(items: QualityIssueItem[], issueType: IssueType) {
  return items.filter((issue) => issue.issueType === issueType).length;
}

function getSampleColumns(issue: QualityIssueItem) {
  return Array.from(
    issue.sampleRows.reduce((columns, row) => {
      Object.keys(row.values).forEach((key) => columns.add(key));
      return columns;
    }, new Set<string>())
  );
}

function isSensitiveField(fieldName: string) {
  const normalizedFieldName = fieldName.toLowerCase();
  return SENSITIVE_FIELD_PATTERNS.some((pattern) =>
    normalizedFieldName.includes(pattern)
  );
}

function maskSensitiveValue(fieldName: string, value: string | number | null) {
  if (value === null || typeof value === "undefined" || value === "") {
    return "-";
  }

  if (!isSensitiveField(fieldName)) {
    return String(value);
  }

  const stringValue = String(value);
  if (stringValue.length <= 2) {
    return "***";
  }

  return `${stringValue.slice(0, 2)}***`;
}

interface QualityIssuesPageProps {
  drilldownContext?: MatrixDrilldownContext | null;
}

export function QualityIssuesPage({
  drilldownContext
}: QualityIssuesPageProps) {
  const [selectedIssueType, setSelectedIssueType] = useState<
    IssueType | typeof ALL_ISSUE_TYPES
  >(ALL_ISSUE_TYPES);
  const baseIssueFilter = useMemo(
    () => ({
      apc: drilldownContext?.apc,
      crop: drilldownContext?.crop,
      snpSe: drilldownContext?.snpSe
    }),
    [
      drilldownContext?.apc,
      drilldownContext?.crop,
      drilldownContext?.snpSe
    ]
  );
  const allIssues = useAsyncResource(
    () => monitoringApi.getIssues(baseIssueFilter),
    [baseIssueFilter.apc, baseIssueFilter.crop, baseIssueFilter.snpSe]
  );
  const issues = useAsyncResource(
    () =>
      monitoringApi.getIssues(
        selectedIssueType === ALL_ISSUE_TYPES
          ? baseIssueFilter
          : { ...baseIssueFilter, issueType: selectedIssueType }
      ),
    [
      baseIssueFilter.apc,
      baseIssueFilter.crop,
      baseIssueFilter.snpSe,
      selectedIssueType
    ]
  );
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);

  const selectedIssue = useMemo(() => {
    if (!issues.data?.items.length) {
      return null;
    }
    return (
      issues.data.items.find((item) => item.issueId === selectedIssueId) ??
      issues.data.items[0]
    );
  }, [issues.data, selectedIssueId]);

  const issueTypeCounts = useMemo(() => {
    const sourceIssues = allIssues.data?.items ?? [];
    return ISSUE_TYPE_OPTIONS.reduce<Record<string, number>>((counts, issueType) => {
      counts[issueType] =
        issueType === ALL_ISSUE_TYPES
          ? sourceIssues.length
          : getIssueTypeCount(sourceIssues, issueType);
      return counts;
    }, {});
  }, [allIssues.data]);

  const sampleColumns = useMemo(() => {
    return selectedIssue ? getSampleColumns(selectedIssue) : [];
  }, [selectedIssue]);

  const state = (
    <ResourceState
      error={issues.error}
      isEmpty={issues.data?.items.length === 0}
      isLoading={issues.isLoading}
      onRetry={issues.reload}
    />
  );

  if (!issues.data) {
    return state;
  }

  return (
    <div className="ops-grid">
      <ShellPanel title="데이터 품질 이슈">
        <div
          aria-label="이슈 유형 필터"
          className="issue-type-filter"
          data-astryx-component="SegmentedControl"
          role="tablist"
        >
          {ISSUE_TYPE_OPTIONS.map((issueType) => (
            <button
              aria-selected={selectedIssueType === issueType}
              className="issue-type-filter__item"
              key={issueType}
              onClick={() => {
                setSelectedIssueType(issueType);
                setSelectedIssueId(null);
              }}
              role="tab"
              type="button"
            >
              <span>{getIssueTypeLabel(issueType)}</span>
              <strong>{issueTypeCounts[issueType] ?? 0}</strong>
            </button>
          ))}
        </div>
        <div className="table-wrap" data-astryx-component="Table">
          <table>
            <thead>
              <tr>
                <th>상태</th>
                <th>심각도</th>
                <th>APC</th>
                <th>품목/구분</th>
                <th>유형</th>
                <th>건수</th>
              </tr>
            </thead>
            <tbody>
              {issues.data.items.map((issue) => (
                <tr
                  className={issue.issueId === selectedIssue?.issueId ? "is-selected" : ""}
                  key={issue.issueId}
                  onClick={() => setSelectedIssueId(issue.issueId)}
                >
                  <td>
                    <span className="quality-badge" data-status={issue.status}>
                      {ISSUE_STATUS_LABELS[issue.status]}
                    </span>
                  </td>
                  <td>
                    <span className="quality-badge" data-severity={issue.severity}>
                      {ISSUE_SEVERITY_LABELS[issue.severity]}
                    </span>
                  </td>
                  <td>{APC_LABELS[issue.apc]}</td>
                  <td>
                    {CROP_LABELS[issue.crop]} / {SNP_SE_LABELS[issue.snpSe]}
                  </td>
                  <td>{issue.issueTypeLabel}</td>
                  <td>{issue.affectedCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ShellPanel>

      {selectedIssue ? (
        <ShellPanel title="이슈 상세">
          <div className="issue-detail">
            <strong>{selectedIssue.summary}</strong>
            <dl className="detail-list">
              <div>
                <dt>이슈 유형</dt>
                <dd>{selectedIssue.issueTypeLabel}</dd>
              </div>
              <div>
                <dt>영향 범위</dt>
                <dd>{selectedIssue.impactRange}</dd>
              </div>
              <div>
                <dt>권장 조치</dt>
                <dd>{selectedIssue.recommendedAction}</dd>
              </div>
              <div>
                <dt>발생 시간</dt>
                <dd>
                  {selectedIssue.firstOccurredAt.slice(0, 16)} ~{" "}
                  {selectedIssue.lastOccurredAt.slice(0, 16)}
                </dd>
              </div>
              <div>
                <dt>담당자</dt>
                <dd>{selectedIssue.assignee ?? "미지정"}</dd>
              </div>
            </dl>
            <section className="sample-row-section" aria-label="영향 샘플 row">
              <header>
                <h3>영향 샘플 row</h3>
                <span>{selectedIssue.sampleRows.length}건 표시</span>
              </header>
              {selectedIssue.sampleRows.length > 0 ? (
                <div className="table-wrap sample-row-table" data-astryx-component="Table">
                  <table>
                    <thead>
                      <tr>
                        <th>rowId</th>
                        {sampleColumns.map((column) => (
                          <th key={column}>{column}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {selectedIssue.sampleRows.map((row) => (
                        <tr key={row.rowId}>
                          <td>{row.rowId}</td>
                          {sampleColumns.map((column) => (
                            <td key={column}>
                              {maskSensitiveValue(column, row.values[column] ?? null)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="empty-inline">
                  미수신 또는 집계형 이슈라 표시할 샘플 row가 없습니다.
                </p>
              )}
              <p className="helper-text">
                농가명, 담당자명 등 식별 가능 정보는 화면 표시 단계에서 마스킹합니다.
              </p>
            </section>
          </div>
        </ShellPanel>
      ) : null}
    </div>
  );
}
