import type { UserRole } from "@shared/types/monitoring";

const ISSUE_ACTION_ENTRY_ROLES = new Set<UserRole>(["ADMIN", "OPERATOR"]);

export interface CtaPermissionState {
  ctaTitle: string;
  helperDescription?: string;
  helperTitle?: string;
  isEnabled: boolean;
  state: "enabled" | "disabled";
}

export function canCreateIssueAction(role: UserRole) {
  return ISSUE_ACTION_ENTRY_ROLES.has(role);
}

export function getIssueActionEntryCtaState(role: UserRole): CtaPermissionState {
  if (canCreateIssueAction(role)) {
    return {
      ctaTitle: "조치 작성 대상 품질 이슈를 선택합니다.",
      isEnabled: true,
      state: "enabled"
    };
  }

  return {
    ctaTitle: "조회자는 운영 조치를 작성할 수 없습니다.",
    helperDescription:
      "운영자 또는 관리자로 전환하면 미확인/확인중 품질 이슈를 선택할 수 있습니다.",
    helperTitle: "조회자 권한에서는 조치 작성이 제한됩니다.",
    isEnabled: false,
    state: "disabled"
  };
}
