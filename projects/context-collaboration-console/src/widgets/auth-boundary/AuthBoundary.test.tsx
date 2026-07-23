import { render, screen } from "@testing-library/react";

import { AuthProvider } from "@entities/auth";
import { domainFailure, domainSuccess } from "@shared/lib/result";

import { AuthBoundary } from "./AuthBoundary";

import type { AuthRepository } from "@entities/auth";

function repository(session: "anonymous" | "error"): AuthRepository {
  return {
    getSession: () => Promise.resolve(session === "anonymous"
      ? domainSuccess(null)
      : domainFailure("AUTH_UNAVAILABLE", "인증 서비스 오류", "연결을 확인하세요.")),
    logout: () => Promise.resolve(domainSuccess(true)),
    loginUrl: (returnTo) => `/login?returnTo=${encodeURIComponent(returnTo)}`,
  };
}

describe("AuthBoundary", () => {
  it("keeps protected content behind the organization login boundary", async () => {
    render(<AuthProvider repository={repository("anonymous")} required><AuthBoundary><p>보호된 운영 화면</p></AuthBoundary></AuthProvider>);

    expect(await screen.findByRole("heading", { name: "조직 계정으로 로그인" })).toBeInTheDocument();
    expect(screen.queryByText("보호된 운영 화면")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "로그인 계속하기" })).toHaveAttribute("href", expect.stringContaining("/login?returnTo="));
  });

  it("offers a deterministic recovery action when session lookup fails", async () => {
    render(<AuthProvider repository={repository("error")} required><AuthBoundary><p>보호된 운영 화면</p></AuthBoundary></AuthProvider>);

    expect(await screen.findByRole("heading", { name: "인증 서비스를 확인해 주세요" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "다시 확인" })).toBeInTheDocument();
  });
});
