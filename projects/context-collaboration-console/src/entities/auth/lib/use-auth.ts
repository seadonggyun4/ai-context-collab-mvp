import { useContext } from "react";

import { AuthContext } from "./auth-context";

export function useAuth() {
  const value = useContext(AuthContext);
  if (value === null) throw new Error("AuthProvider is missing");
  return value;
}

export function useOptionalAuth() {
  return useContext(AuthContext);
}
