import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AppRouter } from "@app/router/AppRouter";
import { renderWithProviders } from "@test/renderWithProviders";

const route = "/projects/apc-monitoring-mvp/changes/CR-DEMO-001/impact";

describe("SCR-07 impact analysis route", () => {
  it("synchronizes graph, detail, relation list and the URL-backed selection", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AppRouter />, [route]);

    expect(await screen.findByRole("heading", { name: "최근 정상 수신 시간과 24시간 경고 추가", level: 1 })).toBeInTheDocument();
    const qaNode = document.getElementById("impact-graph-node-impact-qa-auto");
    expect(qaNode).toBeInstanceOf(HTMLButtonElement);
    await user.click(qaNode as HTMLButtonElement);
    expect(qaNode).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("heading", { name: "24시간 경계 자동 검증" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "영향 근거 경로" })).toBeInTheDocument();
    expect(screen.getByText("경계 자동 검사가 계산 로직의 정확성을 증명합니다.")).toBeInTheDocument();

    const relationSection = screen.getByRole("heading", { name: "접근 가능한 관계 목록" }).closest("section");
    expect(relationSection).not.toBeNull();
    const relation = within(relationSection as HTMLElement).getByRole("button", { name: /수용 기준을 충족하려면 API 응답 계약/ });
    await user.click(relation);
    expect(relation).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("heading", { name: "표시 수용 기준을 충족하려면 API 응답 계약이 확장되어야 합니다." })).toBeInTheDocument();
  });

  it("offers the same nodes and relationships without the graph", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AppRouter />, [route]);

    await screen.findByRole("heading", { name: "영향 관계 그래프" });
    await user.click(screen.getByRole("button", { name: "목록 집중" }));

    expect(screen.queryByRole("heading", { name: "영향 관계 그래프" })).not.toBeInTheDocument();
    const nodeSection = screen.getByRole("heading", { name: "영향 노드 목록" }).closest("section");
    expect(nodeSection).not.toBeNull();
    const qaNode = within(nodeSection as HTMLElement).getByRole("button", { name: /24시간 경계 자동 검증/ });
    await user.click(qaNode);
    expect(qaNode).toHaveAttribute("aria-pressed", "true");
    expect(within(nodeSection as HTMLElement).getAllByRole("button")).toHaveLength(10);
    const relationSection = screen.getByRole("heading", { name: "접근 가능한 관계 목록" }).closest("section");
    expect(within(relationSection as HTMLElement).getAllByRole("button")).toHaveLength(11);
  });

  it("supports directional keyboard traversal and repairs stale selections", async () => {
    renderWithProviders(<AppRouter />, [`${route}?selected=stale-node`]);

    await waitFor(() => expect(document.getElementById("impact-graph-node-impact-request")).toHaveAttribute("aria-pressed", "true"));
    const requestNode = document.getElementById("impact-graph-node-impact-request");
    fireEvent.keyDown(requestNode as HTMLButtonElement, { key: "ArrowRight" });
    await waitFor(() => expect(document.getElementById("impact-graph-node-impact-role-planning")).toHaveAttribute("aria-pressed", "true"));
    fireEvent.keyDown(document.getElementById("impact-graph-node-impact-role-planning") as HTMLButtonElement, { key: "ArrowDown" });
    await waitFor(() => expect(document.getElementById("impact-graph-node-impact-role-publishing")).toHaveAttribute("aria-pressed", "true"));
  });

  it("starts with the accessible list at the compact breakpoint", async () => {
    const originalMatchMedia = window.matchMedia.bind(window);
    window.matchMedia = (query: string) => ({
      matches: query === "(max-width: 768px)",
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    });
    try {
      renderWithProviders(<AppRouter />, [route]);
      expect(await screen.findByRole("heading", { name: "영향 노드 목록" })).toBeInTheDocument();
      expect(screen.queryByRole("heading", { name: "영향 관계 그래프" })).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "목록 집중" })).toHaveAttribute("aria-pressed", "true");
    } finally {
      window.matchMedia = originalMatchMedia;
    }
  });
});
