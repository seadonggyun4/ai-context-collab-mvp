import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderWithProviders } from "@test/renderWithProviders";

import { AppRouter } from "./AppRouter";

describe("SCR-09 context activation route", () => {
  it("publishes the approved scope and links evidence to one commit", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AppRouter />, ["/projects/apc-monitoring-mvp/changes/CR-DEMO-001/activation"]);
    await user.click(await screen.findByRole("button", { name: "Git publication 생성" }));
    expect(await screen.findByText("context/cr-demo-001-r1")).toBeInTheDocument();
    expect(screen.getAllByText("bbbbbbbbbbbb")).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Context 활성화" })).toBeEnabled();
  });

  it("activates a new Context version and renders the operational result", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AppRouter />, ["/projects/apc-monitoring-mvp/changes/CR-DEMO-001/activation"]);
    await user.click(await screen.findByRole("button", { name: "Git publication 생성" }));
    await user.click(screen.getByRole("button", { name: "Context 활성화" }));
    expect(await screen.findByRole("heading", { name: "context-v1.4" })).toBeInTheDocument();
    expect(screen.getAllByText("context-v1.4")).toHaveLength(2);
    expect(screen.queryByText("Context context-v1.4")).not.toBeInTheDocument();
    expect(screen.queryByText("Context vcontext-v1.4")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "프로젝트로 돌아가기" })).toHaveAttribute("href", "/projects/apc-monitoring-mvp");
    expect(screen.getByText("2건 통과")).toBeInTheDocument();
  });

  it("keeps the primary workflow keyboard reachable", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AppRouter />, ["/projects/apc-monitoring-mvp/changes/CR-DEMO-001/activation"]);
    const publish = await screen.findByRole("button", { name: "Git publication 생성" });
    publish.focus();
    await user.keyboard("{Enter}");
    expect(await screen.findByRole("button", { name: "Context 활성화" })).toBeEnabled();
  });
});
