import { domainSuccess } from "@shared/lib/result";

import type { AuthRepository } from "../model/auth-repository";

export const fixtureAuthRepository: AuthRepository = {
  getSession: () => Promise.resolve(domainSuccess({
    authenticated: true,
    principal: { actorId: "user-admin-01", displayName: "운영 관리자", role: "admin" },
    csrfToken: "fixture-csrf-token",
    expiresAt: "2026-07-24T00:00:00+09:00",
  })),
  logout: () => Promise.resolve(domainSuccess(true)),
  loginUrl: (returnTo) => `/fixture-login?returnTo=${encodeURIComponent(returnTo)}`,
};
