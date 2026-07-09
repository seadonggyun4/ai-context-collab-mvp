import { useEffect, useMemo, useState } from "react";
import { PipelineTracePanel } from "@features/monitoring/components/PipelineTracePanel";
import { ResourceState } from "@features/monitoring/components/ResourceState";
import { useAsyncResource } from "@features/monitoring/hooks/useAsyncResource";
import type { MatrixDrilldownContext } from "@features/monitoring/types/shell";
import { monitoringApi } from "@shared/api/monitoringApi";
import { useUserRole } from "@shared/auth/UserRoleContext";
import { ShellButton, ShellPanel, ShellSelect } from "@shared/components/AstryxPrimitives";
import { PermissionBadge, RestrictedValue } from "@shared/components/PermissionState";
import { StatusBadge } from "@shared/components/StatusBadge";
import {
  APC_LABELS,
  CROP_LABELS,
  MONITORING_STATUS_LABELS,
  SNP_SE_LABELS
} from "@shared/constants/monitoringLabels";
import type {
  ApcName,
  CropType,
  MonitoringStatus,
  SnpSe
} from "@shared/types/monitoring";

interface IngestionStatusPageProps {
  drilldownContext?: MatrixDrilldownContext | null;
}

type FilterValue = "ALL";

interface IngestionFilterState {
  apc: ApcName | FilterValue;
  crop: CropType | FilterValue;
  snpSe: SnpSe | FilterValue;
  status: MonitoringStatus | FilterValue;
}

const ALL_VALUE: FilterValue = "ALL";

const DEFAULT_FILTERS: IngestionFilterState = {
  apc: ALL_VALUE,
  crop: ALL_VALUE,
  snpSe: ALL_VALUE,
  status: ALL_VALUE
};

const ALL_OPTION = { label: "전체", value: ALL_VALUE };
const APC_OPTIONS = [ALL_OPTION, ...createOptions(APC_LABELS)];
const CROP_OPTIONS = [ALL_OPTION, ...createOptions(CROP_LABELS)];
const SNP_SE_OPTIONS = [ALL_OPTION, ...createOptions(SNP_SE_LABELS)];
const STATUS_OPTIONS = [ALL_OPTION, ...createOptions(MONITORING_STATUS_LABELS)];

export function IngestionStatusPage({ drilldownContext }: IngestionStatusPageProps) {
  const { canViewRestrictedPaths, role } = useUserRole();
  const [filters, setFilters] = useState<IngestionFilterState>(DEFAULT_FILTERS);
  const ingestionFilter = useMemo(
    () => ({
      apc: toOptionalFilter(filters.apc),
      crop: toOptionalFilter(filters.crop),
      snpSe: toOptionalFilter(filters.snpSe),
      status: toOptionalFilter(filters.status)
    }),
    [filters.apc, filters.crop, filters.snpSe, filters.status]
  );
  const ingestions = useAsyncResource(
    () => monitoringApi.getIngestions(ingestionFilter),
    [
      role,
      ingestionFilter.apc,
      ingestionFilter.crop,
      ingestionFilter.snpSe,
      ingestionFilter.status
    ]
  );
  const [selectedTraceId, setSelectedTraceId] = useState("trace-jungmun-citrus-clsfy");
  const trace = useAsyncResource(
    () => monitoringApi.getPipelineTrace(selectedTraceId),
    [selectedTraceId, role]
  );

  const selectedIngestion = useMemo(
    () => ingestions.data?.items.find((item) => item.traceId === selectedTraceId),
    [ingestions.data, selectedTraceId]
  );

  useEffect(() => {
    if (!drilldownContext) {
      return;
    }

    setFilters({
      apc: drilldownContext.apc,
      crop: drilldownContext.crop,
      snpSe: drilldownContext.snpSe,
      status: drilldownContext.status ?? ALL_VALUE
    });
  }, [
    drilldownContext?.apc,
    drilldownContext?.crop,
    drilldownContext?.snpSe,
    drilldownContext?.status,
    drilldownContext
  ]);

  useEffect(() => {
    if (!ingestions.data?.items.length) {
      return;
    }

    const preferredTraceId = drilldownContext?.traceId;
    const hasPreferredTrace = ingestions.data.items.some(
      (item) => item.traceId === preferredTraceId
    );
    const hasSelectedTrace = ingestions.data.items.some(
      (item) => item.traceId === selectedTraceId
    );

    if (preferredTraceId && hasPreferredTrace) {
      setSelectedTraceId(preferredTraceId);
      return;
    }

    if (!hasSelectedTrace) {
      setSelectedTraceId(ingestions.data.items[0].traceId);
    }
  }, [drilldownContext?.traceId, ingestions.data, selectedTraceId]);

  const state = (
    <ResourceState
      error={ingestions.error}
      isEmpty={ingestions.data?.items.length === 0}
      isLoading={ingestions.isLoading}
      onRetry={ingestions.reload}
    />
  );

  if (!ingestions.data) {
    return state;
  }

  return (
    <div className="ops-grid">
      <ShellPanel title="수신 현황">
        <div
          aria-label="수신 현황 matrix 선택 조건"
          className="ingestion-filter-controls"
        >
          <div className="ingestion-filter-controls__header">
            <strong>수신 조건</strong>
            {drilldownContext?.traceId ? (
              <span>Matrix 선택 trace: {drilldownContext.traceId}</span>
            ) : (
              <span>APC, 품목, 입고/선별, 상태 조건으로 수신 목록을 조회합니다.</span>
            )}
          </div>
          <div className="ingestion-filter-controls__grid">
            <ShellSelect
              label="APC"
              onChange={(value) => updateFilter("apc", value as IngestionFilterState["apc"])}
              options={APC_OPTIONS}
              value={filters.apc}
            />
            <ShellSelect
              label="품목"
              onChange={(value) => updateFilter("crop", value as IngestionFilterState["crop"])}
              options={CROP_OPTIONS}
              value={filters.crop}
            />
            <ShellSelect
              label="입고/선별"
              onChange={(value) => updateFilter("snpSe", value as IngestionFilterState["snpSe"])}
              options={SNP_SE_OPTIONS}
              value={filters.snpSe}
            />
            <ShellSelect
              label="상태"
              onChange={(value) => updateFilter("status", value as IngestionFilterState["status"])}
              options={STATUS_OPTIONS}
              value={filters.status}
            />
            <ShellButton onClick={() => setFilters(DEFAULT_FILTERS)} variant="secondary">
              조건 초기화
            </ShellButton>
          </div>
        </div>
        <div className="table-wrap" data-astryx-component="Table">
          <table>
            <thead>
              <tr>
                <th>APC</th>
                <th>품목/구분</th>
                <th>최근 수신</th>
                <th>기대 주기</th>
                <th>지연</th>
                <th>저장</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {ingestions.data.items.map((item) => (
                <tr
                  className={item.traceId === selectedTraceId ? "is-selected" : ""}
                  key={item.ingestionId}
                  onClick={() => setSelectedTraceId(item.traceId)}
                >
                  <td>{APC_LABELS[item.apc]}</td>
                  <td>
                    {CROP_LABELS[item.crop]} / {SNP_SE_LABELS[item.snpSe]}
                  </td>
                  <td>{formatDateTime(item.lastReceivedAt)}</td>
                  <td>{item.expectedIntervalMinutes ?? "기준 미정"}분</td>
                  <td>{item.delayMinutes}분</td>
                  <td>
                    <span className="save-state">
                      origin {item.originSaved ? "Y" : "N"} / refined{" "}
                      {item.refinedSaved ? "Y" : "N"}
                      {!canViewRestrictedPaths ? <PermissionBadge /> : null}
                    </span>
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

      <div className="detail-stack">
        {selectedIngestion ? (
          <ShellPanel title="선택 수신 상세">
            <dl className="detail-list">
              <div>
                <dt>Trace ID</dt>
                <dd>{selectedIngestion.traceId}</dd>
              </div>
              <div>
                <dt>Origin</dt>
                <dd>
                  {canViewRestrictedPaths ? (
                    selectedIngestion.originPath ?? "없음"
                  ) : (
                    <RestrictedValue value={selectedIngestion.originPath} />
                  )}
                </dd>
              </div>
              <div>
                <dt>Refined</dt>
                <dd>
                  {canViewRestrictedPaths ? (
                    selectedIngestion.refinedPath ?? "없음"
                  ) : (
                    <RestrictedValue value={selectedIngestion.refinedPath} />
                  )}
                </dd>
              </div>
            </dl>
          </ShellPanel>
        ) : null}
        <ResourceState
          error={trace.error}
          isLoading={trace.isLoading}
          onRetry={trace.reload}
        />
        {trace.data ? <PipelineTracePanel trace={trace.data} /> : null}
      </div>
    </div>
  );

  function updateFilter<TKey extends keyof IngestionFilterState>(
    key: TKey,
    value: IngestionFilterState[TKey]
  ) {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [key]: value
    }));
  }
}

function formatDateTime(value?: string | null) {
  return value ? value.replace("T", " ").slice(5, 16) : "미수신";
}

function createOptions<TValue extends string>(labels: Record<TValue, string>) {
  return (Object.entries(labels) as Array<[TValue, string]>).map(([value, label]) => ({
    label,
    value
  }));
}

function toOptionalFilter<TValue extends string>(value: TValue | FilterValue) {
  return value === ALL_VALUE ? undefined : value;
}
