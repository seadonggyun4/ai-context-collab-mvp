import { useMemo, useState } from "react";
import {
  ShellPanel,
  ShellTabs
} from "@shared/components/AstryxPrimitives";
import { DataLookupIntegrationPage } from "@features/data-lookup-integration/DataLookupIntegrationPage";
import { IngestionStatusPage } from "@features/monitoring/pages/IngestionStatusPage";
import { MonitoringHomePage } from "@features/monitoring/pages/MonitoringHomePage";
import { PipelineTracePage } from "@features/monitoring/pages/PipelineTracePage";
import { QualityIssuesPage } from "@features/monitoring/pages/QualityIssuesPage";
import { VisualizationIntegrationPage } from "@features/visualization-integration/VisualizationIntegrationPage";
import type {
  ApcManagementTab,
  MatrixDrilldownCell,
  MatrixDrilldownContext
} from "@features/monitoring/types/shell";
import { getKstDateTimeDisplay } from "@shared/utils/kstDate";

const tabs: Array<{ value: ApcManagementTab; label: string; count?: number }> = [
  { value: "monitoring", label: "모니터링", count: 3 },
  { value: "ingestions", label: "수신 현황", count: 6 },
  { value: "issues", label: "데이터 품질 이슈", count: 3 },
  { value: "pipeline", label: "파이프라인 추적" },
  { value: "lookup", label: "데이터 조회" },
  { value: "visualization", label: "시각화" }
];

export function ApcDataManagementShell() {
  const [activeTab, setActiveTab] = useState<ApcManagementTab>("monitoring");
  const [matrixContext, setMatrixContext] = useState<MatrixDrilldownContext | null>(
    null
  );
  const activeLabel = useMemo(
    () => tabs.find((tab) => tab.value === activeTab)?.label ?? "모니터링",
    [activeTab]
  );
  const displayedRefreshAt = useMemo(() => getKstDateTimeDisplay(), []);

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
    setActiveTab(getMatrixTargetTab(cell));
  }

  function clearContext() {
    setMatrixContext(null);
  }

  return (
    <main className="apc-shell">
      <section className="apc-workspace">
        <header className="apc-header">
          <div>
            <span className="app-eyebrow">APC(농산물산지유통센터) 모니터링 서비스</span>
            <h1>APC 데이터 관리</h1>
            <p>마지막 갱신 {displayedRefreshAt}</p>
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
              drilldownContext={matrixContext}
            />
          ) : activeTab === "pipeline" ? (
            <PipelineTracePage />
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

  return "ingestions";
}
