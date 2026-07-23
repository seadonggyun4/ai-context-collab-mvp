import { screen, within } from "@testing-library/react";

import { AppRouter } from "@app/router/AppRouter";
import { renderWithProviders } from "@test/renderWithProviders";

describe("ProjectOverviewPage requirements", () => {
  beforeEach(async () => {
    renderWithProviders(<AppRouter />, ["/projects/apc-monitoring-mvp"]);
    await screen.findByRole("heading", { name: "APC 데이터 운영 모니터링" });
  });

  it("covers REQ-DASH-001 and REQ-DASH-005 context and alignment evidence", () => {
    expect(screen.getByText(/v2026\.07\.22 · 2026-07-22 시행/)).toBeInTheDocument();
    const alignment = document.querySelector("#alignment-status");
    expect(alignment).not.toBeNull();
    expect(within(alignment as HTMLElement).getByRole("progressbar")).toHaveAttribute("aria-valuenow", "92");
    expect(within(alignment as HTMLElement).getByText("API 계약 revision 차이")).toBeInTheDocument();
    expect(within(alignment as HTMLElement).getByText("문서 v1.3 · 구현 fixture v1.4")).toBeInTheDocument();
  });

  it("covers REQ-DASH-002 and REQ-DASH-003 priority, ownership, risk and drill-down", () => {
    const changes = document.querySelector("#active-changes");
    const attention = document.querySelector("#attention-queue");
    expect(changes).not.toBeNull();
    expect(attention).not.toBeNull();
    expect(within(changes as HTMLElement).getByText("CR-APC-014")).toBeInTheDocument();
    expect(within(changes as HTMLElement).getByText("기획 · 퍼블리싱")).toBeInTheDocument();
    expect(within(changes as HTMLElement).getByText("높음")).toBeInTheDocument();
    expect(within(attention as HTMLElement).getByRole("link", { name: /불일치 근거 확인/ })).toHaveAttribute("href", "#alignment-status");
  });

  it("covers REQ-DASH-004 role artifacts and recent QA evidence", () => {
    expect(screen.getByText("수신 지연 경고 수용 기준")).toBeInTheDocument();
    expect(screen.getAllByText("최근 정상 수신 API 계약")).toHaveLength(2);
    expect(screen.getByText("24시간 전후 경계값 8건을 확인했습니다.")).toBeInTheDocument();
    expect(screen.getByText("증거 8건")).toBeInTheDocument();
  });
});
