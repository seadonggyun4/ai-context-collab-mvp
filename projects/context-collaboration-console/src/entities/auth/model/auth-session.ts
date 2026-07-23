import type { ActorRole } from "@entities/review";

export interface AuthPrincipal {
  actorId: string;
  displayName: string;
  role: ActorRole;
}

export interface AuthSession {
  authenticated: true;
  principal: AuthPrincipal;
  csrfToken: string;
  expiresAt: string;
}

export type AuthState =
  | { status: "loading" }
  | { status: "authenticated"; session: AuthSession }
  | { status: "unauthenticated" }
  | { status: "error"; title: string; detail: string };
