import type {
  ActionEntryContext,
  ActionEntrySource
} from "@features/monitoring/types/shell";

interface ActionEntrySourceMeta {
  label: string;
  description: string;
  requiresTraceId: boolean;
}

export const ACTION_ENTRY_SOURCE_META: Record<ActionEntrySource, ActionEntrySourceMeta> = {
  pipeline: {
    description: "파이프라인 실패 단계에서 관련 품질 이슈로 이동합니다.",
    label: "Pipeline trace에서 이동",
    requiresTraceId: true
  },
  "operation-actions": {
    description: "운영 조치 내역에서 작성 대상 품질 이슈로 이동합니다.",
    label: "운영 조치 내역에서 이동",
    requiresTraceId: false
  }
};

export function createPipelineActionEntry(params: {
  focusActionForm: boolean;
  issueId: string;
  traceId: string;
}): ActionEntryContext {
  return {
    focusActionForm: params.focusActionForm,
    issueId: params.issueId,
    source: "pipeline",
    traceId: params.traceId
  };
}

export function createOperationActionEntry(issueId: string): ActionEntryContext {
  return {
    focusActionForm: true,
    issueId,
    source: "operation-actions"
  };
}

export function getActionEntrySourceLabel(context: ActionEntryContext) {
  return ACTION_ENTRY_SOURCE_META[context.source].label;
}

export function getActionEntryPrimaryValue(context: ActionEntryContext) {
  return context.traceId ?? context.issueId;
}

export function getActionEntryKey(context: ActionEntryContext) {
  return [context.source, context.issueId, context.traceId ?? "no-trace"].join(":");
}

export function shouldFocusActionForm(
  context: ActionEntryContext | null | undefined,
  selectedIssueId: string | null | undefined
) {
  return Boolean(
    context?.focusActionForm &&
      selectedIssueId &&
      selectedIssueId === context.issueId
  );
}

export function getActionEntryCalloutMessage(context: ActionEntryContext) {
  return `관련 이슈 ${context.issueId}${
    context.focusActionForm
      ? "의 운영 조치 작성 영역으로 진입했습니다."
      : "의 상세 내용을 확인합니다."
  }`;
}
