import { useEffect, useMemo, useState } from "react";
import { ResourceState } from "@features/monitoring/components/ResourceState";
import { useAsyncResource } from "@features/monitoring/hooks/useAsyncResource";
import type { MatrixDrilldownContext } from "@features/monitoring/types/shell";
import { monitoringApi } from "@shared/api/monitoringApi";
import { useUserRole } from "@shared/auth/UserRoleContext";
import { ShellButton, ShellPanel } from "@shared/components/AstryxPrimitives";
import { PermissionBadge } from "@shared/components/PermissionState";
import {
  APC_LABELS,
  CROP_LABELS,
  SNP_SE_LABELS
} from "@shared/constants/monitoringLabels";
import type {
  MonitoringRuleItem,
  UpdateMonitoringRuleRequest
} from "@shared/types/monitoring";

interface RuleDraft {
  allowedDelayMinutes: string;
  duplicateKeys: string;
  expectedIntervalMinutes: string;
  requiredFields: string;
}

interface RuleDiffItem {
  key: keyof RuleDraft;
  label: string;
  before: string;
  after: string;
  changed: boolean;
}

const EMPTY_RULE_DRAFT: RuleDraft = {
  allowedDelayMinutes: "",
  duplicateKeys: "",
  expectedIntervalMinutes: "",
  requiredFields: ""
};

function minutesToDraftValue(value?: number | null) {
  return typeof value === "number" ? String(value) : "";
}

function formatMinuteValue(value: string | number | null | undefined) {
  if (value === "" || value === null || typeof value === "undefined") {
    return "기준 미정";
  }
  return `${value}분`;
}

function listToDraftValue(values: string[]) {
  return values.join(", ");
}

function parseListDraft(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatListValue(values: string[]) {
  return values.length ? values.join(", ") : "없음";
}

function parseMinuteDraft(value: string) {
  const trimmedValue = value.trim();
  if (!trimmedValue) {
    return null;
  }

  const parsedValue = Number(trimmedValue);
  return Number.isFinite(parsedValue) ? parsedValue : null;
}

function createRuleDraft(rule: MonitoringRuleItem): RuleDraft {
  return {
    allowedDelayMinutes: minutesToDraftValue(rule.allowedDelayMinutes),
    duplicateKeys: listToDraftValue(rule.duplicateKeys),
    expectedIntervalMinutes: minutesToDraftValue(rule.expectedIntervalMinutes),
    requiredFields: listToDraftValue(rule.requiredFields)
  };
}

function createRuleUpdateRequest(
  draft: RuleDraft,
  reason: string
): UpdateMonitoringRuleRequest {
  return {
    allowedDelayMinutes: parseMinuteDraft(draft.allowedDelayMinutes),
    duplicateKeys: parseListDraft(draft.duplicateKeys),
    expectedIntervalMinutes: parseMinuteDraft(draft.expectedIntervalMinutes),
    reason: reason.trim(),
    requiredFields: parseListDraft(draft.requiredFields)
  };
}

function createRuleDiff(rule: MonitoringRuleItem, draft: RuleDraft): RuleDiffItem[] {
  const beforeDraft = createRuleDraft(rule);

  return [
    {
      after: formatMinuteValue(draft.expectedIntervalMinutes),
      before: formatMinuteValue(beforeDraft.expectedIntervalMinutes),
      changed:
        parseMinuteDraft(beforeDraft.expectedIntervalMinutes) !==
        parseMinuteDraft(draft.expectedIntervalMinutes),
      key: "expectedIntervalMinutes",
      label: "기대 수신 주기"
    },
    {
      after: formatMinuteValue(draft.allowedDelayMinutes),
      before: formatMinuteValue(beforeDraft.allowedDelayMinutes),
      changed:
        parseMinuteDraft(beforeDraft.allowedDelayMinutes) !==
        parseMinuteDraft(draft.allowedDelayMinutes),
      key: "allowedDelayMinutes",
      label: "허용 지연 시간"
    },
    {
      after: formatListValue(parseListDraft(draft.requiredFields)),
      before: formatListValue(rule.requiredFields),
      changed:
        formatListValue(parseListDraft(beforeDraft.requiredFields)) !==
        formatListValue(parseListDraft(draft.requiredFields)),
      key: "requiredFields",
      label: "필수값 기준"
    },
    {
      after: formatListValue(parseListDraft(draft.duplicateKeys)),
      before: formatListValue(rule.duplicateKeys),
      changed:
        formatListValue(parseListDraft(beforeDraft.duplicateKeys)) !==
        formatListValue(parseListDraft(draft.duplicateKeys)),
      key: "duplicateKeys",
      label: "중복 판단 기준"
    }
  ];
}

interface MonitoringRulesPageProps {
  drilldownContext?: MatrixDrilldownContext | null;
}

export function MonitoringRulesPage({ drilldownContext }: MonitoringRulesPageProps) {
  const { canEditRules, role, roleLabel } = useUserRole();
  const ruleFilter = useMemo(
    () => ({
      apc: drilldownContext?.apc,
      crop: drilldownContext?.crop,
      snpSe: drilldownContext?.snpSe
    }),
    [drilldownContext?.apc, drilldownContext?.crop, drilldownContext?.snpSe]
  );
  const rules = useAsyncResource(
    () => monitoringApi.getRules(ruleFilter),
    [role, ruleFilter.apc, ruleFilter.crop, ruleFilter.snpSe]
  );
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);
  const [draft, setDraft] = useState<RuleDraft>(EMPTY_RULE_DRAFT);
  const [reason, setReason] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const selectedRule = useMemo(() => {
    if (!rules.data?.items.length) {
      return null;
    }
    return (
      rules.data.items.find((item) => item.ruleId === selectedRuleId) ??
      rules.data.items[0]
    );
  }, [rules.data, selectedRuleId]);

  useEffect(() => {
    if (!selectedRule) {
      setDraft(EMPTY_RULE_DRAFT);
      setReason("");
      return;
    }

    setDraft(createRuleDraft(selectedRule));
    setReason("");
  }, [selectedRule]);

  const diffItems = useMemo(() => {
    if (!selectedRule) {
      return [];
    }

    return createRuleDiff(selectedRule, draft);
  }, [draft, selectedRule]);

  const hasDraftChanges = diffItems.some((item) => item.changed);
  const hasReason = reason.trim().length > 0;
  const canSubmitRule = Boolean(
    selectedRule?.isEditable && canEditRules && hasReason && hasDraftChanges
  );
  const latestChangeHistory = selectedRule?.changeHistory[0] ?? null;

  const state = (
    <ResourceState
      error={rules.error}
      isEmpty={rules.data?.items.length === 0}
      isLoading={rules.isLoading}
      onRetry={rules.reload}
    />
  );

  if (!rules.data) {
    return state;
  }

  async function submitRuleUpdate() {
    if (!selectedRule || !canEditRules || !selectedRule.isEditable) {
      return;
    }

    setIsSaving(true);
    try {
      await monitoringApi.updateRule(
        selectedRule.ruleId,
        createRuleUpdateRequest(draft, reason)
      );
      rules.reload();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="ops-grid">
      <ShellPanel title="모니터링 기준 목록">
        <div className="table-wrap" data-astryx-component="Table">
          <table>
            <thead>
              <tr>
                <th>APC</th>
                <th>품목/구분</th>
                <th>기대 주기</th>
                <th>허용 지연</th>
                <th>수정 가능</th>
              </tr>
            </thead>
            <tbody>
              {rules.data.items.map((rule) => (
                <tr
                  className={rule.ruleId === selectedRule?.ruleId ? "is-selected" : ""}
                  key={rule.ruleId}
                  onClick={() => setSelectedRuleId(rule.ruleId)}
                >
                  <td>{APC_LABELS[rule.apc]}</td>
                  <td>
                    {CROP_LABELS[rule.crop]} / {SNP_SE_LABELS[rule.snpSe]}
                  </td>
                  <td>{rule.expectedIntervalMinutes ?? "기준 미정"}분</td>
                  <td>{rule.allowedDelayMinutes ?? "기준 미정"}분</td>
                  <td>{rule.isEditable ? "Y" : <PermissionBadge />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ShellPanel>

      {selectedRule ? (
        <ShellPanel title="기준 변경">
          <div
            aria-label="모니터링 기준 변경"
            className="rule-editor"
            role="dialog"
          >
            {!canEditRules || !selectedRule.isEditable ? (
              <div className="permission-callout" role="note">
                <strong>수정 권한 필요</strong>
                <p>
                  현재 {roleLabel} 역할은 모니터링 기준을 수정할 수 없습니다.
                  관리자 역할에서만 저장할 수 있습니다.
                </p>
              </div>
            ) : null}
            <dl className="detail-list">
              <div>
                <dt>적용 범위</dt>
                <dd>
                  {APC_LABELS[selectedRule.apc]} / {CROP_LABELS[selectedRule.crop]} /{" "}
                  {SNP_SE_LABELS[selectedRule.snpSe]}
                </dd>
              </div>
              <div>
                <dt>최근 변경</dt>
                <dd>{selectedRule.lastUpdatedAt?.slice(0, 16) ?? "변경 이력 없음"}</dd>
              </div>
              <div>
                <dt>최근 변경자</dt>
                <dd>{selectedRule.lastUpdatedBy ?? "기록 없음"}</dd>
              </div>
            </dl>
            <div className="rule-draft-grid">
              <label className="light-field">
                <span>기대 수신 주기(분)</span>
                <input
                  disabled={!canEditRules || !selectedRule.isEditable}
                  min={0}
                  onChange={(event) =>
                    setDraft((currentDraft) => ({
                      ...currentDraft,
                      expectedIntervalMinutes: event.target.value
                    }))
                  }
                  type="number"
                  value={draft.expectedIntervalMinutes}
                />
              </label>
              <label className="light-field">
                <span>허용 지연 시간(분)</span>
                <input
                  disabled={!canEditRules || !selectedRule.isEditable}
                  min={0}
                  onChange={(event) =>
                    setDraft((currentDraft) => ({
                      ...currentDraft,
                      allowedDelayMinutes: event.target.value
                    }))
                  }
                  type="number"
                  value={draft.allowedDelayMinutes}
                />
              </label>
              <label className="light-field">
                <span>필수값 기준</span>
                <input
                  disabled={!canEditRules || !selectedRule.isEditable}
                  onChange={(event) =>
                    setDraft((currentDraft) => ({
                      ...currentDraft,
                      requiredFields: event.target.value
                    }))
                  }
                  value={draft.requiredFields}
                />
              </label>
              <label className="light-field">
                <span>중복 판단 기준</span>
                <input
                  disabled={!canEditRules || !selectedRule.isEditable}
                  onChange={(event) =>
                    setDraft((currentDraft) => ({
                      ...currentDraft,
                      duplicateKeys: event.target.value
                    }))
                  }
                  value={draft.duplicateKeys}
                />
              </label>
            </div>
            <div aria-label="기준 변경 전후 비교" className="rule-diff">
              <section className="rule-diff-card">
                <h3>변경 전</h3>
                {diffItems.map((item) => (
                  <div className="rule-diff-row" key={item.key}>
                    <span>{item.label}</span>
                    <strong>{item.before}</strong>
                  </div>
                ))}
              </section>
              <section className="rule-diff-card rule-diff-card--after">
                <h3>변경 후</h3>
                {diffItems.map((item) => (
                  <div
                    className={item.changed ? "rule-diff-row is-changed" : "rule-diff-row"}
                    key={item.key}
                  >
                    <span>{item.label}</span>
                    <strong>{item.after}</strong>
                  </div>
                ))}
              </section>
            </div>
            <p className="helper-text">
              영향 범위: {APC_LABELS[selectedRule.apc]}의 {CROP_LABELS[selectedRule.crop]}{" "}
              {SNP_SE_LABELS[selectedRule.snpSe]} 수신 지연, 품질 이슈 판정, 데이터 신뢰도
              경고에 적용됩니다.
            </p>
            <label className="light-field">
              <span>변경 사유</span>
              <textarea
                aria-invalid={canEditRules && selectedRule.isEditable && !hasReason}
                disabled={!canEditRules || !selectedRule.isEditable}
                onChange={(event) => setReason(event.target.value)}
                placeholder="예: 운영 기준 검토에 따른 허용 지연 시간 조정"
                value={reason}
              />
            </label>
            {canEditRules && selectedRule.isEditable && !hasReason ? (
              <p className="field-error">변경 사유를 입력해야 기준을 저장할 수 있습니다.</p>
            ) : null}
            {canEditRules && selectedRule.isEditable && !hasDraftChanges ? (
              <p className="helper-text">변경된 기준이 있어야 저장할 수 있습니다.</p>
            ) : null}
            {latestChangeHistory ? (
              <section className="change-history" aria-label="최근 변경 이력">
                <h3>최근 변경 이력</h3>
                <p>
                  {latestChangeHistory.changedAt.slice(0, 16)} ·{" "}
                  {latestChangeHistory.changedBy} · {latestChangeHistory.reason}
                </p>
              </section>
            ) : null}
            <ShellButton
              disabled={isSaving || !canSubmitRule}
              onClick={submitRuleUpdate}
              title={
                !canEditRules || !selectedRule.isEditable
                  ? "관리자 권한이 필요합니다."
                  : undefined
              }
            >
              {isSaving ? "저장 중" : "기준 저장"}
            </ShellButton>
          </div>
        </ShellPanel>
      ) : null}
    </div>
  );
}
