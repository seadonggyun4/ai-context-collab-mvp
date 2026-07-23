import { ACTOR_ROLES } from "@entities/review";
import { domainFailure, domainSuccess } from "@shared/lib/result";

import type { AuthRepository } from "../model/auth-repository";
import type { AuthSession } from "../model/auth-session";

interface Options { apiBaseUrl: string; fetcher?: typeof fetch }

function parseSession(value: unknown): AuthSession {
  if (typeof value !== "object" || value === null) throw new Error("session object required");
  const item = value as Record<string, unknown>;
  const principalValue = item.principal;
  if (item.authenticated !== true || typeof principalValue !== "object" || principalValue === null) throw new Error("authenticated session required");
  const principal = principalValue as Record<string, unknown>;
  const actorId = principal.actorId;
  const displayName = principal.displayName;
  const role = principal.role;
  const csrfToken = item.csrfToken;
  const expiresAt = item.expiresAt;
  if (typeof actorId !== "string" || typeof displayName !== "string" || typeof role !== "string" || !ACTOR_ROLES.includes(role as never) || typeof csrfToken !== "string" || typeof expiresAt !== "string") throw new Error("invalid session fields");
  return { authenticated: true, principal: { actorId, displayName, role: role as AuthSession["principal"]["role"] }, csrfToken, expiresAt };
}

export function createHttpAuthRepository({ apiBaseUrl, fetcher = fetch }: Options): AuthRepository {
  const base = apiBaseUrl.replace(/\/$/, "");
  return {
    async getSession(signal) {
      try {
        const response = await fetcher(`${base}/api/v1/auth/me`, { credentials: "include", ...(signal === undefined ? {} : { signal }) });
        if (response.status === 401) return domainSuccess(null);
        if (!response.ok) return domainFailure("AUTH_SESSION_FAILED", "세션을 확인할 수 없습니다", "잠시 후 다시 시도하세요.");
        return domainSuccess(parseSession(await response.json()));
      } catch {
        return domainFailure("AUTH_SESSION_INVALID", "세션 응답을 확인할 수 없습니다", "API 연결과 인증 설정을 확인하세요.");
      }
    },
    async logout(signal) {
      try {
        const response = await fetcher(`${base}/api/v1/auth/logout`, { method: "POST", credentials: "include", ...(signal === undefined ? {} : { signal }) });
        return response.ok ? domainSuccess(true) : domainFailure("AUTH_LOGOUT_FAILED", "로그아웃하지 못했습니다", "세션을 새로고침한 뒤 다시 시도하세요.");
      } catch {
        return domainFailure("AUTH_LOGOUT_FAILED", "로그아웃하지 못했습니다", "API 연결을 확인하세요.");
      }
    },
    loginUrl(returnTo) { return `${base}/api/v1/auth/login?returnTo=${encodeURIComponent(returnTo)}`; },
  };
}
