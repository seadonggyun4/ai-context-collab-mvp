import { MonitoringSummaryShell } from "@features/monitoring/components/MonitoringSummaryShell";
import { ResourceState } from "@features/monitoring/components/ResourceState";
import { useAsyncResource } from "@features/monitoring/hooks/useAsyncResource";
import type {
  MatrixDrilldownCell,
  MatrixDrilldownContext
} from "@features/monitoring/types/shell";
import { monitoringApi } from "@shared/api/monitoringApi";

interface MonitoringHomePageProps {
  onMatrixCellSelect?: (cell: MatrixDrilldownCell) => void;
  selectedMatrixContext?: MatrixDrilldownContext | null;
}

export function MonitoringHomePage({
  onMatrixCellSelect,
  selectedMatrixContext
}: MonitoringHomePageProps) {
  const summary = useAsyncResource(() => monitoringApi.getSummary(), []);

  const state = (
    <ResourceState
      error={summary.error}
      isEmpty={summary.data?.matrix.length === 0}
      isLoading={summary.isLoading}
      onRetry={summary.reload}
    />
  );

  if (!summary.data) {
    return state;
  }

  return (
    <>
      {state}
      <MonitoringSummaryShell
        kpis={summary.data.kpis}
        matrix={summary.data.matrix}
        onMatrixCellSelect={onMatrixCellSelect}
        recentIssues={summary.data.recentIssues}
        selectedMatrixContext={selectedMatrixContext}
        statusDistribution={summary.data.statusDistribution}
      />
    </>
  );
}
