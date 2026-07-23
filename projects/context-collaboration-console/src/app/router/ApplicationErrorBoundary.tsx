import { Component, type ErrorInfo, type PropsWithChildren, type ReactNode } from "react";

import { DataState } from "@shared/ui/data-state";

interface ApplicationErrorBoundaryState {
  hasError: boolean;
}

export class ApplicationErrorBoundary extends Component<PropsWithChildren, ApplicationErrorBoundaryState> {
  public override state: ApplicationErrorBoundaryState = { hasError: false };

  public static getDerivedStateFromError(): ApplicationErrorBoundaryState {
    return { hasError: true };
  }

  public override componentDidCatch(error: Error, info: ErrorInfo): void {
    if (import.meta.env.DEV) {
      console.error("Application render failed", error, info.componentStack);
    }
  }

  public override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <DataState
          kind="error"
          title="화면을 불러오지 못했습니다"
          description="잠시 후 다시 시도하거나 프로젝트 시작 화면으로 이동해 주세요."
          action={{ label: "시작 화면으로 이동", href: "/" }}
        />
      );
    }

    return this.props.children;
  }
}
