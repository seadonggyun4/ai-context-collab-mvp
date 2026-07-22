import {
  createContext,
  type ReactNode,
  useContext,
  useMemo,
  useState
} from "react";
import {
  getCurrentUserRole,
  setCurrentUserRole as setGlobalCurrentUserRole
} from "@shared/auth/currentUserRole";
import type { UserRole } from "@shared/types/monitoring";

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "관리자",
  OPERATOR: "운영자",
  VIEWER: "조회자"
};

interface UserRoleContextValue {
  canViewRestrictedPaths: boolean;
  role: UserRole;
  setRole: (role: UserRole) => void;
}

const UserRoleContext = createContext<UserRoleContextValue | null>(null);

export function UserRoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<UserRole>(getCurrentUserRole());

  const value = useMemo<UserRoleContextValue>(() => {
    return {
      canViewRestrictedPaths: role !== "VIEWER",
      role,
      setRole(nextRole) {
        setGlobalCurrentUserRole(nextRole);
        setRoleState(nextRole);
      }
    };
  }, [role]);

  return <UserRoleContext.Provider value={value}>{children}</UserRoleContext.Provider>;
}

export function useUserRole() {
  const value = useContext(UserRoleContext);

  if (!value) {
    throw new Error("useUserRole must be used inside UserRoleProvider");
  }

  return value;
}
