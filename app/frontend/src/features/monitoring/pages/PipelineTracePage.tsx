import { useMemo, useState } from "react";
import { PipelineTracePanel } from "@features/monitoring/components/PipelineTracePanel";
import { ResourceState } from "@features/monitoring/components/ResourceState";
import { useAsyncResource } from "@features/monitoring/hooks/useAsyncResource";
import { monitoringApi } from "@shared/api/monitoringApi";
import { ShellPanel } from "@shared/components/AstryxPrimitives";
import {
  APC_LABELS,
  CROP_LABELS,
  SNP_SE_LABELS
} from "@shared/constants/monitoringLabels";

export function PipelineTracePage() {
  const ingestions = useAsyncResource(() => monitoringApi.getIngestions(), []);
  const traceOptions = ingestions.data?.items ?? [];
  const [selectedTraceId, setSelectedTraceId] = useState("trace-jungmun-citrus-clsfy");
  const trace = useAsyncResource(
    () => monitoringApi.getPipelineTrace(selectedTraceId),
    [selectedTraceId]
  );

  const selectedLabel = useMemo(() => {
    const selected = traceOptions.find((item) => item.traceId === selectedTraceId);
    if (!selected) {
      return selectedTraceId;
    }
    return `${APC_LABELS[selected.apc]} ${CROP_LABELS[selected.crop]} ${
      SNP_SE_LABELS[selected.snpSe]
    }`;
  }, [selectedTraceId, traceOptions]);

  return (
    <div className="detail-stack">
      <ShellPanel title="추적 대상 선택">
        <label className="light-field">
          <span>Trace</span>
          <select
            onChange={(event) => setSelectedTraceId(event.target.value)}
            value={selectedTraceId}
          >
            {traceOptions.map((item) => (
              <option key={item.traceId} value={item.traceId}>
                {APC_LABELS[item.apc]} {CROP_LABELS[item.crop]}{" "}
                {SNP_SE_LABELS[item.snpSe]} - {item.status}
              </option>
            ))}
          </select>
        </label>
        <p className="helper-text">현재 선택: {selectedLabel}</p>
      </ShellPanel>
      <ResourceState
        error={ingestions.error ?? trace.error}
        isLoading={ingestions.isLoading || trace.isLoading}
        onRetry={() => {
          ingestions.reload();
          trace.reload();
        }}
      />
      {trace.data ? (
        <PipelineTracePanel trace={trace.data} />
      ) : null}
    </div>
  );
}
