import { useEffect, useMemo, useState } from "react";
import { AppliedFilterChips } from "@features/monitoring/components/AppliedFilterChips";
import { PipelineTracePanel } from "@features/monitoring/components/PipelineTracePanel";
import { ResourceState } from "@features/monitoring/components/ResourceState";
import { useAsyncResource } from "@features/monitoring/hooks/useAsyncResource";
import type { MatrixDrilldownContext } from "@features/monitoring/types/shell";
import { monitoringApi } from "@shared/api/monitoringApi";
import { useUserRole } from "@shared/auth/UserRoleContext";
import { ShellPanel } from "@shared/components/AstryxPrimitives";
import { PermissionBadge, RestrictedValue } from "@shared/components/PermissionState";
import { StatusBadge } from "@shared/components/StatusBadge";
import {
  APC_LABELS,
  CROP_LABELS,
  SNP_SE_LABELS
} from "@shared/constants/monitoringLabels";

interface IngestionStatusPageProps {
  drilldownContext?: MatrixDrilldownContext | null;
}

export function IngestionStatusPage({ drilldownContext }: IngestionStatusPageProps) {
  const { canViewRestrictedPaths, role } = useUserRole();
  const ingestionFilter = useMemo(
    () => ({
      apc: drilldownContext?.apc,
      crop: drilldownContext?.crop,
      snpSe: drilldownContext?.snpSe,
      status:
        drilldownContext?.status && drilldownContext.status !== "ERROR"
          ? drilldownContext.status
          : undefined
    }),
    [
      drilldownContext?.apc,
      drilldownContext?.crop,
      drilldownContext?.snpSe,
      drilldownContext?.status
    ]
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
        <AppliedFilterChips context={drilldownContext ?? null} />
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
}

function formatDateTime(value?: string | null) {
  return value ? value.replace("T", " ").slice(5, 16) : "미수신";
}
