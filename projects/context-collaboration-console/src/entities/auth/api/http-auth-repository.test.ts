import { createHttpAuthRepository } from "./http-auth-repository";

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

describe("http auth repository", () => {
  it("parses a trusted session and keeps cookies on the transport boundary", async () => {
    const fetcher: typeof fetch = vi.fn(() => Promise.resolve(response({
      authenticated: true,
      principal: { actorId: "oidc-actor-01", displayName: "운영 관리자", role: "admin" },
      csrfToken: "csrf-token-01",
      expiresAt: "2026-07-24T00:00:00Z",
    })));
    const repository = createHttpAuthRepository({ apiBaseUrl: "https://api.example.test/", fetcher });

    await expect(repository.getSession()).resolves.toMatchObject({
      ok: true,
      value: { principal: { actorId: "oidc-actor-01", role: "admin" } },
    });
    expect(fetcher).toHaveBeenCalledWith(
      "https://api.example.test/api/v1/auth/me",
      expect.objectContaining({ credentials: "include" }),
    );
  });

  it("maps anonymous and malformed responses without exposing transport details", async () => {
    const anonymous = createHttpAuthRepository({ apiBaseUrl: "/", fetcher: vi.fn(() => Promise.resolve(response({}, 401))) });
    const malformed = createHttpAuthRepository({ apiBaseUrl: "/", fetcher: vi.fn(() => Promise.resolve(response({ authenticated: true }))) });

    await expect(anonymous.getSession()).resolves.toEqual({ ok: true, value: null });
    await expect(malformed.getSession()).resolves.toMatchObject({ ok: false, error: { code: "AUTH_SESSION_INVALID" } });
  });

  it("encodes the exact return location and uses a credentialed logout request", async () => {
    const fetcher: typeof fetch = vi.fn(() => Promise.resolve(new Response(null, { status: 204 })));
    const repository = createHttpAuthRepository({ apiBaseUrl: "https://api.example.test", fetcher });

    expect(repository.loginUrl("https://console.example.test/projects/apc?tab=qa")).toBe(
      "https://api.example.test/api/v1/auth/login?returnTo=https%3A%2F%2Fconsole.example.test%2Fprojects%2Fapc%3Ftab%3Dqa",
    );
    await expect(repository.logout()).resolves.toEqual({ ok: true, value: true });
    expect(fetcher).toHaveBeenCalledWith(
      "https://api.example.test/api/v1/auth/logout",
      expect.objectContaining({ method: "POST", credentials: "include" }),
    );
  });
});
