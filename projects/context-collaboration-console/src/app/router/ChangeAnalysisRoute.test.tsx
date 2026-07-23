import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AppRouter } from "@app/router/AppRouter";
import { renderWithProviders } from "@test/renderWithProviders";

const exampleRequest = "모니터링 목록에 ‘최근 정상 수신 시간’을 추가하고, 24시간 이상 수신되지 않으면 경고로 보여주세요.";

describe("change analysis routes", () => {
  beforeEach(() => sessionStorage.clear());

  it("preserves the raw request and renders all SCR-04 proposal areas", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AppRouter />, ["/projects/apc-monitoring-mvp/changes/new"]);
    const textarea = await screen.findByRole("textbox", { name: "변경 요청 원문" });
    await user.click(screen.getByRole("button", { name: "이 예시 사용" }));
    expect(textarea).toHaveValue(exampleRequest);
    await user.click(screen.getByRole("button", { name: "영향 분석 요청" }));

    expect(await screen.findByRole("heading", { name: "최근 정상 수신 시간과 24시간 경고 추가" }, { timeout: 6000 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "변경 요약" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "수용 기준" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "변경 영향" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "예상 변경 파일" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "QA 시나리오" })).toBeInTheDocument();
    expect(screen.getByText("신뢰도 높음")).toBeInTheDocument();
    expect(screen.getByText("정상 수신이 다시 발생하면 경고를 즉시 해제해도 될까요?")).toBeInTheDocument();
    expect(screen.getByText(exampleRequest)).toBeInTheDocument();
  }, 10000);

  it("keeps the draft through remount and recovers from a failed analysis attempt", async () => {
    const user = userEvent.setup();
    const failingRequest = `${exampleRequest} [실패 재현]`;
    const first = renderWithProviders(<AppRouter />, ["/projects/apc-monitoring-mvp/changes/new"]);
    const textarea = await screen.findByRole("textbox", { name: "변경 요청 원문" });
    fireEvent.change(textarea, { target: { value: failingRequest } });
    first.unmount();

    renderWithProviders(<AppRouter />, ["/projects/apc-monitoring-mvp/changes/new"]);
    const restored = await screen.findByRole("textbox", { name: "변경 요청 원문" });
    expect(restored).toHaveValue(failingRequest);
    await user.click(screen.getByRole("button", { name: "영향 분석 요청" }));
    expect(await screen.findByText("영향 분석을 완료하지 못했습니다", {}, { timeout: 5000 })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "변경 요청 원문" })).toHaveValue(failingRequest);
    await user.click(screen.getByRole("button", { name: "분석 다시 시도" }));
    expect(await screen.findByRole("heading", { name: /최근 정상 수신 시간과 24시간 경고 추가/ }, { timeout: 6000 })).toBeInTheDocument();
  }, 12000);
});
