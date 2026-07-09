import { useMemo, useState } from "react";
import { ActionIssuePickerPanel } from "@features/monitoring/components/ActionIssuePickerPanel";
import { ResourceState } from "@features/monitoring/components/ResourceState";
import { useAsyncResource } from "@features/monitoring/hooks/useAsyncResource";
import { getActionIssuePickerItems } from "@features/monitoring/services/actionIssuePickerPolicy";
import { useUserRole } from "@shared/auth/UserRoleContext";
import { getIssueActionEntryCtaState } from "@shared/auth/rolePermissions";
import { monitoringApi } from "@shared/api/monitoringApi";
import { ShellButton, ShellPanel } from "@shared/components/AstryxPrimitives";
import { ISSUE_STATUS_LABELS } from "@shared/constants/monitoringLabels";

interface OperationActionsPageProps {
  actionRefreshKey?: number;
  onStartAction?: (issueId: string) => void;
}

export function OperationActionsPage({
  actionRefreshKey = 0,
  onStartAction
}: OperationActionsPageProps) {
  const { canCreateIssueAction, role, roleLabel } = useUserRole();
  const [isIssuePickerOpen, setIsIssuePickerOpen] = useState(false);
  const actions = useAsyncResource(() => monitoringApi.getActions(), [
    actionRefreshKey
  ]);
  const issues = useAsyncResource(() => monitoringApi.getIssues(), []);
  const actionEntryCtaState = getIssueActionEntryCtaState(role);
  const actionEntryIssues = useMemo(() => {
    return getActionIssuePickerItems(issues.data?.items ?? []);
  }, [issues.data]);

  const state = (
    <ResourceState
      error={actions.error}
      isEmpty={actions.data?.items.length === 0}
      isLoading={actions.isLoading}
      onRetry={actions.reload}
    />
  );

  if (!actions.data) {
    return state;
  }

  return (
    <ShellPanel
      actions={
        <ShellButton
          className={`permission-cta permission-cta--${actionEntryCtaState.state}`}
          disabled={!canCreateIssueAction}
          onClick={() => setIsIssuePickerOpen((isOpen) => !isOpen)}
          title={actionEntryCtaState.ctaTitle}
        >
          조치 작성
        </ShellButton>
      }
      title="운영 조치 내역"
    >
      <div className="action-entry-header">
        <div>
          <strong>운영 조치 기록과 작성 진입점을 분리합니다.</strong>
          <p>
            이 화면은 조치 이력 확인을 기본으로 하며, 작성은 품질 이슈 상세의 canonical
            action form으로 이동해 진행합니다.
          </p>
        </div>
        <span className="role-chip">{roleLabel}</span>
      </div>

      {!actionEntryCtaState.isEnabled ? (
        <div className="permission-callout" role="note">
          <strong>{actionEntryCtaState.helperTitle}</strong>
          <p>{actionEntryCtaState.helperDescription}</p>
        </div>
      ) : null}

      {isIssuePickerOpen && actionEntryCtaState.isEnabled ? (
        <ActionIssuePickerPanel
          isLoading={issues.isLoading}
          issues={actionEntryIssues}
          onClose={() => setIsIssuePickerOpen(false)}
          onSelect={(issueId) => {
            setIsIssuePickerOpen(false);
            onStartAction?.(issueId);
          }}
        />
      ) : null}

      <div className="action-timeline">
        {actions.data.items.map((action) => (
          <article className="action-item" key={action.actionId}>
            <time>{action.createdAt.replace("T", " ").slice(0, 16)}</time>
            <strong>{action.memo}</strong>
            <p>
              {action.author} / {action.previousStatus ? ISSUE_STATUS_LABELS[action.previousStatus] : "최초"} →{" "}
              {ISSUE_STATUS_LABELS[action.nextStatus]}
            </p>
            <small>재발 {action.recurrenceCount}회</small>
          </article>
        ))}
      </div>
    </ShellPanel>
  );
}
