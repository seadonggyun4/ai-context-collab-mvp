import { ShellButton, ShellPanel } from "@shared/components/AstryxPrimitives";

interface ResourceStateProps {
  error?: Error | null;
  isEmpty?: boolean;
  isLoading: boolean;
  onRetry?: () => void;
}

export function ResourceState({
  error,
  isEmpty,
  isLoading,
  onRetry
}: ResourceStateProps) {
  if (isLoading) {
    return (
      <ShellPanel>
        <div className="resource-state">
          <strong>데이터를 불러오는 중입니다</strong>
          <p>APC 모니터링 API 응답을 기다리고 있습니다.</p>
        </div>
      </ShellPanel>
    );
  }

  if (error) {
    return (
      <ShellPanel>
        <div className="resource-state resource-state--error">
          <strong>API 응답을 불러오지 못했습니다</strong>
          <p>{error.message}</p>
          {onRetry ? <ShellButton onClick={onRetry}>다시 시도</ShellButton> : null}
        </div>
      </ShellPanel>
    );
  }

  if (isEmpty) {
    return (
      <ShellPanel>
        <div className="resource-state">
          <strong>조건에 맞는 데이터가 없습니다</strong>
          <p>필터 조건을 변경하거나 기준일을 확인해 주세요.</p>
        </div>
      </ShellPanel>
    );
  }

  return null;
}
