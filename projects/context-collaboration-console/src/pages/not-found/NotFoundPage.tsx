import { DataState } from "@shared/ui/data-state";

export function NotFoundPage() {
  return (
    <DataState
      kind="empty"
      title="요청한 화면을 찾을 수 없습니다"
      description="주소를 확인하거나 프로젝트 시작 화면으로 이동해 주세요."
      action={{ label: "시작 화면으로 이동", href: "/" }}
    />
  );
}
