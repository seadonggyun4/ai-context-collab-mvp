import { useMemo, useState } from "react";
import {
  ShellButton,
  ShellPanel,
  ShellSelect,
  ShellTabs
} from "@shared/components/AstryxPrimitives";
import { AppliedFilterChips } from "@features/monitoring/components/AppliedFilterChips";
import { DataLookupIntegrationPage } from "@features/data-lookup-integration/DataLookupIntegrationPage";
import { IngestionStatusPage } from "@features/monitoring/pages/IngestionStatusPage";
import { MonitoringHomePage } from "@features/monitoring/pages/MonitoringHomePage";
import { MonitoringRulesPage } from "@features/monitoring/pages/MonitoringRulesPage";
import { OperationActionsPage } from "@features/monitoring/pages/OperationActionsPage";
import { PipelineTracePage } from "@features/monitoring/pages/PipelineTracePage";
import { QualityIssuesPage } from "@features/monitoring/pages/QualityIssuesPage";
import { VisualizationIntegrationPage } from "@features/visualization-integration/VisualizationIntegrationPage";
import type {
  ActionEntryContext,
  ApcManagementTab,
  MatrixDrilldownCell,
  MatrixDrilldownContext
} from "@features/monitoring/types/shell";
import {
  createOperationActionEntry,
  createPipelineActionEntry
} from "@features/monitoring/services/actionEntryContext";
import { shellGeneratedAt } from "@features/monitoring/services/shellPreviewData";
import { USER_ROLE_LABELS, useUserRole } from "@shared/auth/UserRoleContext";
import type { UserRole } from "@shared/types/monitoring";

const tabs: Array<{ value: ApcManagementTab; label: string; count?: number }> = [
  { value: "monitoring", label: "모니터링", count: 3 },
  { value: "ingestions", label: "수신 현황", count: 6 },
  { value: "issues", label: "데이터 품질 이슈", count: 3 },
  { value: "pipeline", label: "파이프라인 추적" },
  { value: "actions", label: "운영 조치 내역" },
  { value: "rules", label: "모니터링 기준 설정" },
  { value: "lookup", label: "데이터 조회" },
  { value: "visualization", label: "시각화" }
];

const scenarioSteps: Array<{
  tab: ApcManagementTab;
  label: string;
  description: string;
}> = [
  {
    tab: "monitoring",
    label: "1. 상태 확인",
    description: "APC matrix와 최근 이슈에서 오늘 데이터 신뢰도를 판단"
  },
  {
    tab: "issues",
    label: "2. 원인 확인",
    description: "품질 이슈 상세, sample row, 권장 조치 확인"
  },
  {
    tab: "lookup",
    label: "3. 조회/다운로드",
    description: "기존 데이터 조회 흐름에 품질 warning과 Excel confirm 연계"
  },
  {
    tab: "visualization",
    label: "4. 시각화 해석",
    description: "차트 해석 전 데이터 신뢰도 warning 확인"
  }
];

export function ApcDataManagementShell() {
  const { role, roleLabel, setRole } = useUserRole();
  const [activeTab, setActiveTab] = useState<ApcManagementTab>("monitoring");
  const [matrixContext, setMatrixContext] = useState<MatrixDrilldownContext | null>(
    null
  );
  const [actionEntryContext, setActionEntryContext] =
    useState<ActionEntryContext | null>(null);
  const [actionTimelineRefreshKey, setActionTimelineRefreshKey] = useState(0);
  const activeLabel = useMemo(
    () => tabs.find((tab) => tab.value === activeTab)?.label ?? "모니터링",
    [activeTab]
  );

  function selectMatrixCell(cell: MatrixDrilldownCell) {
    const nextContext: MatrixDrilldownContext = {
      apc: cell.apc,
      crop: cell.crop,
      snpSe: cell.snpSe,
      status: cell.status,
      traceId: cell.traceId ?? null,
      source: "matrix"
    };

    setMatrixContext(nextContext);
    setActionEntryContext(null);
    setActiveTab(getMatrixTargetTab(cell));
  }

  function openActionEntry(context: ActionEntryContext) {
    setMatrixContext(null);
    setActionEntryContext(context);
    setActiveTab("issues");
  }

  function clearContext() {
    setMatrixContext(null);
    setActionEntryContext(null);
  }

  return (
    <main className="apc-shell">
      <aside className="apc-sidebar" aria-label="JADX 메뉴">
        <div className="apc-sidebar__brand">JADX</div>
        <nav>
          <a>대시보드</a>
          <a className="is-active">APC 데이터 관리</a>
          <a>리포트</a>
          <a>설정</a>
        </nav>
      </aside>

      <section className="apc-workspace">
        <header className="apc-header">
          <div>
            <span className="app-eyebrow">APC(농산물산지유통센터) 모니터링 서비스</span>
            <h1>APC 데이터 관리</h1>
            <p>마지막 갱신 {shellGeneratedAt.replace("T", " ").slice(0, 16)}</p>
          </div>
          <div className="apc-header__actions">
            <label className="role-switcher">
              <span>현재 역할</span>
              <select
                aria-label="현재 사용자 역할"
                onChange={(event) => setRole(event.target.value as UserRole)}
                value={role}
              >
                {Object.entries(USER_ROLE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <span className="role-chip">{roleLabel}</span>
            <ShellButton
              onClick={() => {
                clearContext();
                setActiveTab("issues");
              }}
              variant="secondary"
            >
              품질 이슈
            </ShellButton>
            <ShellButton
              onClick={() => {
                clearContext();
                setActiveTab("lookup");
              }}
            >
              Excel 다운로드
            </ShellButton>
          </div>
        </header>

        <ShellPanel className="filter-panel" tone="dark">
          <div className="filter-grid">
            <ShellSelect label="기준일" options={["2026-07-09"]} value="2026-07-09" />
            <ShellSelect label="APC" options={["전체", "남원", "위미", "서귀", "중문", "구좌"]} value="전체" />
            <ShellSelect label="품목" options={["전체", "감귤", "당근"]} value="전체" />
            <ShellSelect label="입고/선별" options={["전체", "입고", "선별"]} value="전체" />
            <ShellSelect label="상태" options={["전체", "정상", "지연", "오류", "미수신", "기준 미정"]} value="전체" />
          </div>
        </ShellPanel>

        <ShellTabs onChange={setActiveTab} tabs={tabs} value={activeTab} />

        <AppliedFilterChips
          context={matrixContext}
          onClear={clearContext}
        />

        <section className="jadx-flow-rail" aria-label="JADX 메뉴 연계 시나리오">
          <header>
            <strong>JADX 메뉴 흐름 시나리오</strong>
            <p>운영 JADX 직접 수정이 아니라, 독립 MVP에서 기존 APC 데이터 관리 흐름을 재현합니다.</p>
          </header>
          <div className="jadx-flow-steps">
            {scenarioSteps.map((step) => (
              <button
                aria-current={activeTab === step.tab ? "step" : undefined}
                className="jadx-flow-step"
                key={step.tab}
                onClick={() => {
                  clearContext();
                  setActiveTab(step.tab);
                }}
                type="button"
              >
                <span>{step.label}</span>
                <strong>{tabs.find((tab) => tab.value === step.tab)?.label}</strong>
                <small>{step.description}</small>
              </button>
            ))}
          </div>
        </section>

        <section className="tab-stage" aria-label={`${activeLabel} 화면`}>
          {activeTab === "monitoring" ? (
            <MonitoringHomePage
              onMatrixCellSelect={selectMatrixCell}
              selectedMatrixContext={matrixContext}
            />
          ) : activeTab === "ingestions" ? (
            <IngestionStatusPage drilldownContext={matrixContext} />
          ) : activeTab === "issues" ? (
            <QualityIssuesPage
              actionEntryContext={actionEntryContext}
              drilldownContext={matrixContext}
              onClearActionEntryContext={() => setActionEntryContext(null)}
              onIssueActionCreated={() =>
                setActionTimelineRefreshKey((currentKey) => currentKey + 1)
              }
            />
          ) : activeTab === "pipeline" ? (
            <PipelineTracePage
              onOpenRelatedIssue={(issueId, traceId) =>
                openActionEntry(createPipelineActionEntry({
                  focusActionForm: false,
                  issueId,
                  traceId
                }))
              }
              onOpenRelatedIssueAction={(issueId, traceId) =>
                openActionEntry(createPipelineActionEntry({
                  focusActionForm: true,
                  issueId,
                  traceId
                }))
              }
            />
          ) : activeTab === "actions" ? (
            <OperationActionsPage
              actionRefreshKey={actionTimelineRefreshKey}
              onStartAction={(issueId) =>
                openActionEntry(createOperationActionEntry(issueId))
              }
            />
          ) : activeTab === "rules" ? (
            <MonitoringRulesPage drilldownContext={matrixContext} />
          ) : activeTab === "lookup" ? (
            <DataLookupIntegrationPage
              onOpenIssues={() => {
                clearContext();
                setActiveTab("issues");
              }}
            />
          ) : activeTab === "visualization" ? (
            <VisualizationIntegrationPage
              onOpenIssues={() => {
                clearContext();
                setActiveTab("issues");
              }}
            />
          ) : (
            <ShellPanel title={activeLabel}>
              <div className="placeholder-state">
                <strong>{activeLabel}</strong>
                <p>
                  기존 JADX 메뉴와 모니터링 품질 경고를 연결하는 영역입니다. Phase 7에서
                  기존 데이터 조회/시각화 기능과 API 연계를 확장합니다.
                </p>
              </div>
            </ShellPanel>
          )}
        </section>
      </section>
    </main>
  );
}

function getMatrixTargetTab(cell: MatrixDrilldownCell): ApcManagementTab {
  if (cell.status === "ERROR") {
    return "issues";
  }

  if (cell.status === "UNDEFINED_RULE") {
    return "rules";
  }

  return "ingestions";
}
