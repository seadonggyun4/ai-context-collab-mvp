import type { AuthSession } from "./auth-session";
import type { DomainResult } from "@shared/lib/result";

export interface AuthRepository {
  getSession(signal?: AbortSignal): Promise<DomainResult<AuthSession | null>>;
  logout(signal?: AbortSignal): Promise<DomainResult<true>>;
  loginUrl(returnTo: string): string;
}
