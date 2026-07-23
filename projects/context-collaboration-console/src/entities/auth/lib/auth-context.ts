import { createContext } from "react";

import type { AuthRepository } from "../model/auth-repository";
import type { AuthState } from "../model/auth-session";

export interface AuthContextValue {
  state: AuthState;
  loginUrl: string;
  logout: () => Promise<void>;
  reload: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
export const AuthRepositoryContext = createContext<AuthRepository | null>(null);
