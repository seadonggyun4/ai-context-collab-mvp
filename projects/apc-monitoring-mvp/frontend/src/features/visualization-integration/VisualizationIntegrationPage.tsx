import ReactECharts from "echarts-for-react";
import { useMemo } from "react";
import { QualityWarningBanner } from "@features/monitoring/components/QualityWarningBanner";
import { ResourceState } from "@features/monitoring/components/ResourceState";
import { useAsyncResource } from "@features/monitoring/hooks/useAsyncResource";
import { monitoringApi } from "@shared/api/monitoringApi";
import { ShellPanel } from "@shared/components/AstryxPrimitives";
import { DESIGN_TOKENS } from "@shared/constants/designTokens";

export function VisualizationIntegrationPage({
  onOpenIssues
}: {
  onOpenIssues: () => void;
}) {
  const issues = useAsyncResource(
    () =>
      monitoringApi.getIssues({
        crop: "CITRUS",
        snpSe: "CLSFY"
      }),
    []
  );
  const chartRiskSummary = useMemo(() => {
    const issueItems = issues.data?.items ?? [];
    return {
      affectedCharts: issueItems.length ? ["APC별 당산도", "등급 분포", "총 선별 중량"] : [],
      issueCount: issueItems.length,
      highSeverityCount: issueItems.filter((issue) => issue.severity === "HIGH").length
    };
  }, [issues.data]);

  return (
    <div className="detail-stack">
      <ResourceState
        error={issues.error}
        isLoading={issues.isLoading}
        onRetry={issues.reload}
      />
      {issues.data ? (
        <QualityWarningBanner
          issues={issues.data.items}
          onPrimaryAction={onOpenIssues}
          primaryActionLabel="품질 이슈 확인"
        />
      ) : null}

      <ShellPanel title="JADX 시각화 연계 시나리오">
        <div className="scenario-summary">
          <div>
            <span>시연 범위</span>
            <strong>차트는 유지하고, 해석 전에 데이터 신뢰도 경고를 연결</strong>
            <p>
              기존 시각화 메뉴의 차트 구성을 모니터링 상태와 직접 섞지 않고, 같은 조회
              조건의 품질 이슈를 상단 warning으로 분리해 제공합니다.
            </p>
          </div>
          <dl>
            <div>
              <dt>품질 이슈</dt>
              <dd>{chartRiskSummary.issueCount}건</dd>
            </div>
            <div>
              <dt>높은 심각도</dt>
              <dd>{chartRiskSummary.highSeverityCount}건</dd>
            </div>
            <div>
              <dt>영향 차트</dt>
              <dd>
                {chartRiskSummary.affectedCharts.length
                  ? chartRiskSummary.affectedCharts.join(", ")
                  : "없음"}
              </dd>
            </div>
          </dl>
        </div>
      </ShellPanel>

      <div className="visualization-grid">
        <ShellPanel title="APC별 당산도">
          <div className="chart-frame chart-frame--large">
            <ReactECharts option={brixChartOption} style={{ height: 280 }} />
          </div>
        </ShellPanel>
        <ShellPanel title="등급 분포">
          <div className="chart-frame chart-frame--large">
            <ReactECharts option={gradeChartOption} style={{ height: 280 }} />
          </div>
        </ShellPanel>
        <ShellPanel title="총 선별 중량">
          <div className="chart-frame chart-frame--large">
            <ReactECharts option={weightChartOption} style={{ height: 280 }} />
          </div>
        </ShellPanel>
      </div>
    </div>
  );
}

const sharedTextStyle = {
  color: DESIGN_TOKENS.colors.body,
  fontFamily: "Pretendard GOV"
};

const brixChartOption = {
  color: [DESIGN_TOKENS.colors.segmented, DESIGN_TOKENS.colors.accent],
  grid: { bottom: 32, left: 40, right: 20, top: 20 },
  textStyle: sharedTextStyle,
  tooltip: { trigger: "axis" },
  xAxis: { data: ["남원", "위미", "중문", "서귀", "구좌"], type: "category" },
  yAxis: { type: "value" },
  series: [
    {
      data: [11.8, 10.9, 12.3, 0, 9.8],
      name: "당산도",
      smooth: true,
      type: "line"
    }
  ]
};

const gradeChartOption = {
  color: [
    DESIGN_TOKENS.colors.primaryPanel,
    DESIGN_TOKENS.colors.accent,
    DESIGN_TOKENS.colors.statusError
  ],
  textStyle: sharedTextStyle,
  tooltip: { trigger: "item" },
  series: [
    {
      data: [
        { name: "상", value: 42 },
        { name: "중", value: 31 },
        { name: "하", value: 14 }
      ],
      radius: ["45%", "70%"],
      type: "pie"
    }
  ]
};

const weightChartOption = {
  color: [DESIGN_TOKENS.colors.primaryPanel],
  grid: { bottom: 32, left: 52, right: 20, top: 20 },
  textStyle: sharedTextStyle,
  tooltip: { trigger: "axis" },
  xAxis: { data: ["남원", "위미", "중문", "서귀", "구좌"], type: "category" },
  yAxis: { type: "value" },
  series: [
    {
      data: [1530, 860, 1240, 0, 690],
      name: "선별 중량",
      type: "bar"
    }
  ]
};
