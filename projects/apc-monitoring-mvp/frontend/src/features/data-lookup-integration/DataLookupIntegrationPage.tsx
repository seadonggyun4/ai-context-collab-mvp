import { useMemo, useState } from "react";
import { QualityWarningBanner } from "@features/monitoring/components/QualityWarningBanner";
import { ResourceState } from "@features/monitoring/components/ResourceState";
import { useAsyncResource } from "@features/monitoring/hooks/useAsyncResource";
import { monitoringApi } from "@shared/api/monitoringApi";
import { ShellButton, ShellPanel } from "@shared/components/AstryxPrimitives";
import type { QualityIssueItem } from "@shared/types/monitoring";
import { getKstDateParam } from "@shared/utils/kstDate";

function getLookupRows(today: string) {
  return [
    {
      id: "lookup-jungmun-001",
      apc: "중문",
      crop: "감귤",
      snpSe: "선별",
      farm: "농가 A-014",
      receivedAt: `${today} 09:15`,
      weight: "1,240kg",
      status: "정제 확인 필요"
    },
    {
      id: "lookup-wimi-001",
      apc: "위미",
      crop: "감귤",
      snpSe: "선별",
      farm: "농가 W-021",
      receivedAt: `${today} 07:55`,
      weight: "860kg",
      status: "정제 제한"
    },
    {
      id: "lookup-namwon-001",
      apc: "남원",
      crop: "감귤",
      snpSe: "선별",
      farm: "농가 N-033",
      receivedAt: `${today} 09:05`,
      weight: "1,530kg",
      status: "정상"
    }
  ];
}

export function DataLookupIntegrationPage({
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
  const [confirmState, setConfirmState] = useState<
    "idle" | "confirming" | "continued" | "cancelled"
  >("idle");
  const lookupRows = useMemo(() => getLookupRows(getKstDateParam()), []);

  const riskyIssues = useMemo(
    () => issues.data?.items.filter((issue) => issue.downloadRisk) ?? [],
    [issues.data]
  );
  const scenarioSummary = useMemo(() => {
    if (!issues.data) {
      return null;
    }

    return {
      issueCount: issues.data.items.length,
      riskyIssueCount: riskyIssues.length
    };
  }, [issues.data, riskyIssues.length]);

  function requestDownload() {
    if (riskyIssues.length) {
      setConfirmState("confirming");
      return;
    }
    setConfirmState("continued");
  }

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
          isBlocking={riskyIssues.length > 0}
          onPrimaryAction={onOpenIssues}
        />
      ) : null}

      {scenarioSummary ? (
        <ShellPanel title="JADX 데이터 조회 연계 시나리오">
          <div className="scenario-summary">
            <div>
              <span>시연 범위</span>
              <strong>독립 MVP에서 기존 JADX 데이터 조회 메뉴 흐름 재현</strong>
              <p>
                실제 운영 JADX 메뉴에 코드를 삽입하지 않고, 동일한 사용자 행동 흐름에서
                품질 경고와 다운로드 확인 단계를 시연합니다.
              </p>
            </div>
            <dl>
              <div>
                <dt>조회 조건 이슈</dt>
                <dd>{scenarioSummary.issueCount}건</dd>
              </div>
              <div>
                <dt>Excel 위험</dt>
                <dd>{scenarioSummary.riskyIssueCount}건</dd>
              </div>
            </dl>
          </div>
        </ShellPanel>
      ) : null}

      {confirmState === "confirming" ? (
        <DownloadConfirm
          issues={riskyIssues}
          onCancel={() => setConfirmState("cancelled")}
          onContinue={() => setConfirmState("continued")}
          onOpenIssues={onOpenIssues}
        />
      ) : null}

      {confirmState === "continued" ? (
        <div className="quality-banner quality-banner--safe">
          <strong>다운로드 흐름 유지</strong>
          <p>사용자가 품질 경고를 확인하고 기존 Excel 다운로드를 계속 진행했습니다.</p>
        </div>
      ) : null}

      {confirmState === "cancelled" ? (
        <div className="quality-banner quality-banner--neutral">
          <strong>다운로드 취소</strong>
          <p>품질 이슈 확인을 위해 다운로드를 중단했습니다.</p>
        </div>
      ) : null}

      <ShellPanel
        actions={<ShellButton onClick={requestDownload}>Excel 다운로드</ShellButton>}
        title="데이터 조회"
      >
        <div className="legacy-filter-summary">
          <span>품목: 감귤</span>
          <span>입고/선별: 선별</span>
          <span>APC: 전체</span>
          <span>농가명: 전체</span>
          <span>연계: 품질 warning 활성</span>
        </div>
        <div className="table-wrap" data-astryx-component="Table">
          <table>
            <thead>
              <tr>
                <th>APC</th>
                <th>품목/구분</th>
                <th>농가명</th>
                <th>수신 시각</th>
                <th>중량</th>
                <th>품질 상태</th>
              </tr>
            </thead>
            <tbody>
              {lookupRows.map((row) => (
                <tr key={row.id}>
                  <td>{row.apc}</td>
                  <td>
                    {row.crop} / {row.snpSe}
                  </td>
                  <td>{row.farm}</td>
                  <td>{row.receivedAt}</td>
                  <td>{row.weight}</td>
                  <td>{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ShellPanel>
    </div>
  );
}

function DownloadConfirm({
  issues,
  onCancel,
  onContinue,
  onOpenIssues
}: {
  issues: QualityIssueItem[];
  onCancel: () => void;
  onContinue: () => void;
  onOpenIssues: () => void;
}) {
  return (
    <ShellPanel title="Excel 다운로드 전 품질 경고">
      <div className="confirm-box">
        <strong>현재 조회 조건에 다운로드 위험 이슈 {issues.length}건이 있습니다.</strong>
        <p>
          이 데이터는 정제 실패 또는 미수신 상태를 포함할 수 있습니다. 계속 다운로드하거나
          이슈 상세로 이동해 원인을 먼저 확인할 수 있습니다.
        </p>
        <div className="confirm-actions">
          <ShellButton onClick={onContinue}>계속 다운로드</ShellButton>
          <ShellButton onClick={onOpenIssues} variant="secondary">
            이슈 상세 보기
          </ShellButton>
          <ShellButton onClick={onCancel} variant="ghost">
            취소
          </ShellButton>
        </div>
      </div>
    </ShellPanel>
  );
}
