import { screen } from "@testing-library/react";

import { AppRouter } from "@app/router/AppRouter";
import { renderWithProviders } from "@test/renderWithProviders";

describe("AppRouter", () => {
  it("renders the complete public entry narrative", async () => {
    renderWithProviders(<AppRouter />);
    expect(await screen.findByRole("heading", { name: /변경의 이유부터.*검증 결과까지/ })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /빠르게 제안하고/ })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /필요한 문맥만 다르게/ })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "APC 프로젝트 열기" })).toHaveLength(2);
  });

  it("renders SCR-02 in the operational project shell", async () => {
    renderWithProviders(<AppRouter />, ["/projects/apc-monitoring-mvp"]);
    expect(await screen.findByRole("heading", { name: "APC 데이터 운영 모니터링" })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "프로젝트 메뉴" })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "프로젝트 핵심 지표" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "확인이 필요한 항목" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "역할별 최신 산출물" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "최근 QA와 평가" })).toBeInTheDocument();
  });

  it("shows an explicit state for an unknown project", async () => {
    renderWithProviders(<AppRouter />, ["/projects/unknown"]);
    expect(await screen.findByRole("heading", { name: "프로젝트를 찾을 수 없습니다" })).toBeInTheDocument();
  });
});
