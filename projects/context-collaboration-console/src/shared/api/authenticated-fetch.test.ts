import { authenticatedFetch, SESSION_EXPIRED_EVENT, setSessionCsrfToken } from "./authenticated-fetch";

describe("authenticated fetch", () => {
  afterEach(() => {
    setSessionCsrfToken(null);
    vi.unstubAllGlobals();
  });

  it("adds credentials to reads and CSRF only to unsafe methods", async () => {
    const calls: RequestInit[] = [];
    const fetcher: typeof fetch = (_input, init) => {
      calls.push(init ?? {});
      return Promise.resolve(new Response(null, { status: 204 }));
    };
    vi.stubGlobal("fetch", fetcher);
    setSessionCsrfToken("csrf-token-01");

    await authenticatedFetch("https://api.example.test/api/v1/projects/apc");
    await authenticatedFetch("https://api.example.test/api/v1/changes/CR-1", { method: "PATCH" });

    const read = calls[0] ?? {};
    const mutation = calls[1] ?? {};
    expect(read.credentials).toBe("include");
    expect(new Headers(read.headers).has("X-CSRF-Token")).toBe(false);
    expect(new Headers(mutation.headers).get("X-CSRF-Token")).toBe("csrf-token-01");
  });

  it("broadcasts protected API session expiry but ignores the session probe", async () => {
    const fetcher = vi.fn(() => Promise.resolve(new Response(null, { status: 401 })));
    vi.stubGlobal("fetch", fetcher);
    const expired = vi.fn();
    window.addEventListener(SESSION_EXPIRED_EVENT, expired);

    await authenticatedFetch("https://api.example.test/api/v1/projects/apc");
    await authenticatedFetch("https://api.example.test/api/v1/auth/me");

    expect(expired).toHaveBeenCalledTimes(1);
    window.removeEventListener(SESSION_EXPIRED_EVENT, expired);
  });
});
