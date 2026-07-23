let csrfToken: string | null = null;

export const SESSION_EXPIRED_EVENT = "context-session-expired";

export function setSessionCsrfToken(token: string | null) {
  csrfToken = token;
}

export const authenticatedFetch: typeof fetch = async (input, init = {}) => {
  const method = (init.method ?? "GET").toUpperCase();
  const headers = new Headers(init.headers);
  if (!["GET", "HEAD", "OPTIONS"].includes(method) && csrfToken !== null) {
    headers.set("X-CSRF-Token", csrfToken);
  }
  const response = await fetch(input, { ...init, credentials: "include", headers });
  const requestUrl = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
  if (response.status === 401 && !requestUrl.includes("/api/v1/auth/me")) {
    csrfToken = null;
    if (typeof window !== "undefined") window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
  }
  return response;
};
