import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AppRouter } from "@app/router/AppRouter";
import { renderWithProviders } from "@test/renderWithProviders";

const route = "/projects/apc-monitoring-mvp/changes/CR-DEMO-001/review";

describe("SCR-08 review and verification route", () => {
  it("renders semantic/raw diff from the same revision and records an approval", async () => {
    const user = userEvent.setup();
    const { container } = renderWithProviders(<AppRouter />, [route]);

    expect(await screen.findByRole("heading", { name: "최근 정상 수신 시간과 24시간 경고 추가", level: 1 })).toBeInTheDocument();
    expect(container.querySelectorAll(".semantic-diff-row")).toHaveLength(8);
    expect(screen.getByText("context-v1.3 → proposal-r1")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "원본" }));
    expect(screen.getByLabelText("변경 전 원본")).toHaveTextContent("APC 수신 상태와 지연 여부");
    expect(screen.getByLabelText("변경 후 원본")).toHaveTextContent("24시간 이상이면 경고");

    await user.click(screen.getByRole("button", { name: "승인" }));
    await user.type(screen.getByRole("textbox", { name: "검토 의견" }), "승인 범위와 필수 검증 계획을 확인했습니다.");
    await user.click(screen.getByRole("button", { name: "결정 기록" }));
    expect(await screen.findByText("Proposal r1 결정 완료")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "구현 시작" })).toBeEnabled();
  });

  it("separates automated/manual evidence and opens the gate only after both pass", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AppRouter />, [route]);
    await screen.findByRole("heading", { name: "검토 결정" });

    await user.click(screen.getByRole("button", { name: "승인" }));
    await user.type(screen.getByRole("textbox", { name: "검토 의견" }), "검증 조건을 포함해 승인합니다.");
    await user.click(screen.getByRole("button", { name: "결정 기록" }));
    await user.click(await screen.findByRole("button", { name: "구현 시작" }));
    await user.click(await screen.findByRole("button", { name: "검증 시작" }));

    expect(await screen.findByText("2개 조건 미충족")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "자동 결과 동기화" }));
    expect(await screen.findByText("1개 조건 미충족")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "확인 완료 기록" }));
    expect(await screen.findByText("활성화 준비 가능")).toBeInTheDocument();
    const ready = screen.getByRole("button", { name: "활성화 준비 완료" });
    expect(ready).toBeEnabled();
    await user.click(ready);
    await waitFor(() => expect(screen.getByText("8건")).toBeInTheDocument());
    expect(screen.queryByRole("button", { name: "활성화 준비 완료" })).not.toBeInTheDocument();
  });

  it("keeps diff modes and review decisions keyboard-selectable", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AppRouter />, [route]);
    await screen.findByRole("heading", { name: "변경안 비교" });
    const raw = screen.getByRole("button", { name: "원본" });
    raw.focus();
    await user.keyboard("{Enter}");
    expect(raw).toHaveAttribute("aria-pressed", "true");
    const requestChanges = screen.getByRole("button", { name: "수정 요청" });
    requestChanges.focus();
    await user.keyboard("{Enter}");
    expect(requestChanges).toHaveAttribute("aria-pressed", "true");
  });
});
