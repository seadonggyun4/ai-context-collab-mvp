import { type PropsWithChildren, useCallback, useEffect, useMemo, useState } from "react";

import { SESSION_EXPIRED_EVENT, setSessionCsrfToken } from "@shared/api";

import { AuthContext, AuthRepositoryContext } from "./auth-context";

import type { AuthRepository } from "../model/auth-repository";
import type { AuthState } from "../model/auth-session";

export function AuthProvider({ children, repository, required }: PropsWithChildren<{ repository: AuthRepository; required: boolean }>) {
  const [state, setState] = useState<AuthState>(required
    ? { status: "loading" }
    : {
        status: "authenticated",
        session: {
          authenticated: true,
          principal: { actorId: "user-admin-01", displayName: "운영 관리자", role: "admin" },
          csrfToken: "fixture-csrf-token",
          expiresAt: "2099-01-01T00:00:00Z",
        },
      });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!required) return;
    const controller = new AbortController();
    void repository.getSession(controller.signal).then((result) => {
      if (!result.ok) {
        setState({ status: "error", title: result.error.title, detail: result.error.detail });
        return;
      }
      if (result.value === null) {
        setSessionCsrfToken(null);
        setState({ status: "unauthenticated" });
        return;
      }
      setSessionCsrfToken(result.value.csrfToken);
      setState({ status: "authenticated", session: result.value });
    });
    return () => controller.abort();
  }, [reloadKey, repository, required]);

  useEffect(() => {
    if (!required || typeof window === "undefined") return;
    const expire = () => {
      setSessionCsrfToken(null);
      setState({ status: "unauthenticated" });
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, expire);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, expire);
  }, [required]);

  const reload = useCallback(() => {
    setState({ status: "loading" });
    setReloadKey((value) => value + 1);
  }, []);
  const logout = useCallback(async () => {
    await repository.logout();
    setSessionCsrfToken(null);
    setState({ status: "unauthenticated" });
  }, [repository]);
  const loginUrl = repository.loginUrl(typeof window === "undefined" ? "/" : window.location.href);
  const value = useMemo(() => ({ state, loginUrl, logout, reload }), [state, loginUrl, logout, reload]);
  return (
    <AuthRepositoryContext.Provider value={repository}>
      <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    </AuthRepositoryContext.Provider>
  );
}
