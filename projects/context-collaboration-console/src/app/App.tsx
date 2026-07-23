import { AppProviders } from "@app/providers/AppProviders";
import { AppRouter } from "@app/router/AppRouter";
import { AuthBoundary } from "@widgets/auth-boundary";

export function App() {
  return (
    <AppProviders>
      <AuthBoundary><AppRouter /></AuthBoundary>
    </AppProviders>
  );
}
