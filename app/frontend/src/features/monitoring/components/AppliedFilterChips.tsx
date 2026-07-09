import { ShellButton } from "@shared/components/AstryxPrimitives";
import {
  APC_LABELS,
  CROP_LABELS,
  MONITORING_STATUS_LABELS,
  SNP_SE_LABELS
} from "@shared/constants/monitoringLabels";
import type { MatrixDrilldownContext } from "@features/monitoring/types/shell";

interface AppliedFilterChipsProps {
  context: MatrixDrilldownContext | null;
  onClear?: () => void;
}

export function AppliedFilterChips({ context, onClear }: AppliedFilterChipsProps) {
  if (!context) {
    return null;
  }

  return (
    <div className="applied-filter-bar" aria-label="적용된 matrix 선택 조건">
      <strong>Matrix 선택 조건</strong>
      <span>{APC_LABELS[context.apc]}</span>
      <span>{CROP_LABELS[context.crop]}</span>
      <span>{SNP_SE_LABELS[context.snpSe]}</span>
      {context.status ? <span>{MONITORING_STATUS_LABELS[context.status]}</span> : null}
      {context.traceId ? <span>{context.traceId}</span> : null}
      {onClear ? (
        <ShellButton onClick={onClear} variant="secondary">
          조건 초기화
        </ShellButton>
      ) : null}
    </div>
  );
}
