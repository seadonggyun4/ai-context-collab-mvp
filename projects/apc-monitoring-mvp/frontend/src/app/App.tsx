import { ApcDataManagementShell } from "@features/monitoring/pages/ApcDataManagementShell";
import { UserRoleProvider } from "@shared/auth/UserRoleContext";

export function App() {
  return (
    <UserRoleProvider>
      <ApcDataManagementShell />
    </UserRoleProvider>
  );
}
