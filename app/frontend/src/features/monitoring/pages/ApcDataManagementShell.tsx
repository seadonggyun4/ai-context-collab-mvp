import { useMemo, useState } from "react";
import {
  ShellPanel,
  ShellTabs
} from "@shared/components/AstryxPrimitives";
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

export function ApcDataManagementShell() {
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
      <section className="apc-workspace">
        <header className="apc-header">
          <div>
            <span className="app-eyebrow">APC(농산물산지유통센터) 모니터링 서비스</span>
            <h1>APC 데이터 관리</h1>
            <p>마지막 갱신 {shellGeneratedAt.replace("T", " ").slice(0, 16)}</p>
          </div>
        </header>

        <ShellTabs onChange={setActiveTab} tabs={tabs} value={activeTab} />

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
