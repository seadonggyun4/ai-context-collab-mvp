import type { ReactNode } from "react";

interface PermissionBadgeProps {
  children?: ReactNode;
}

export function PermissionBadge({ children = "권한 필요" }: PermissionBadgeProps) {
  return (
    <span className="permission-badge" title="현재 역할에서는 제한된 정보입니다.">
      {children}
    </span>
  );
}

export function RestrictedValue({ value }: { value?: string | null }) {
  if (!value) {
    return <span>없음</span>;
  }

  return (
    <span className="restricted-value">
      <span aria-hidden="true">••••/restricted</span>
      <PermissionBadge />
    </span>
  );
}
