import { MONITORING_STATUS_LABELS } from "@shared/constants/monitoringLabels";
import { STATUS_COLORS } from "@shared/constants/designTokens";
import type { MonitoringStatus } from "@shared/types/monitoring";

export function StatusBadge({ status }: { status: MonitoringStatus }) {
  return (
    <span className="status-badge" data-status={status}>
      <span
        aria-hidden="true"
        className="status-badge__dot"
        style={{ backgroundColor: STATUS_COLORS[status] }}
      />
      {MONITORING_STATUS_LABELS[status]}
    </span>
  );
}
