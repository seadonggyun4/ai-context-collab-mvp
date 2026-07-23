import { render, screen } from "@testing-library/react";

import { classifyDataState, type DataStateKind } from "./data-state-model";
import { DataErrorState, DataState } from "./DataState";

import type { DomainError } from "@shared/lib/result";

describe("DataState", () => {
  it.each<DataStateKind>(["loading", "empty", "error", "permission", "stale", "offline", "conflict"])(
    "%s 상태를 접근 가능한 live region으로 표시한다",
    (kind) => {
      render(<DataState kind={kind} title={`${kind} 제목`} description="상태 설명" />);

      const region = screen.getByText(`${kind} 제목`).closest("main");
      expect(region).toHaveAttribute("data-state", kind);
      expect(region).toHaveAttribute("role", ["error", "permission", "conflict"].includes(kind) ? "alert" : "status");
      if (kind === "loading") expect(region).toHaveAttribute("aria-busy", "true");
      else expect(region).not.toHaveAttribute("aria-busy");
    },
  );

  it.each<[string, DataStateKind]>([
    ["DOCUMENT_REVISION_CONFLICT", "conflict"],
    ["PROPOSAL_REVISION_LOCKED", "conflict"],
    ["ACTIVATION_PERMISSION_DENIED", "permission"],
    ["AUTH_SESSION_FAILED", "permission"],
    ["PUBLICATION_REVISION_STALE", "stale"],
    ["PROJECT_DASHBOARD_NETWORK_ERROR", "offline"],
    ["API_UNAVAILABLE", "offline"],
    ["INVALID_RESPONSE", "error"],
  ])("%s를 %s 상태로 분류한다", (code, kind) => {
    expect(classifyDataState(error(code))).toBe(kind);
  });

  it("DomainError의 원문과 분류를 손실 없이 표시한다", () => {
    render(<DataErrorState error={error("DOCUMENT_REVISION_CONFLICT")} />);
    expect(screen.getByRole("alert")).toHaveAttribute("data-state", "conflict");
    expect(screen.getByText("오류 제목")).toBeInTheDocument();
  });
});

function error(code: string): DomainError {
  return { code, title: "오류 제목", detail: "오류 상세" };
}
