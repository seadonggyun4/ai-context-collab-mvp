import { canApproveRisk, hasPermission } from "./permissions";

import type { Actor } from "./permissions";
import type { ReviewDecision } from "./review";
import type { RiskLevel } from "@entities/proposal";

export interface ReviewSubject {
  requesterId: string;
  risk: RiskLevel;
  fixtureSelfApprovalAllowed?: boolean;
}

export type ReviewDecisionCapability =
  | { allowed: true; code: null; title: null; detail: null }
  | { allowed: false; code: string; title: string; detail: string };

const allowed: ReviewDecisionCapability = { allowed: true, code: null, title: null, detail: null };

export function getReviewDecisionCapability(
  actor: Actor,
  decision: ReviewDecision,
  subject: ReviewSubject,
): ReviewDecisionCapability {
  if (decision === "APPROVED") {
    if (actor.id === subject.requesterId && subject.fixtureSelfApprovalAllowed !== true) {
      return { allowed: false, code: "SELF_APPROVAL_FORBIDDEN", title: "본인 요청은 승인할 수 없습니다", detail: "다른 승인권자의 검토가 필요합니다." };
    }
    if (!canApproveRisk(actor, subject.risk)) {
      return {
        allowed: false,
        code: "REVIEW_PERMISSION_DENIED",
        title: "승인 권한이 없습니다",
        detail: subject.risk === "HIGH" ? "고위험 변경은 관리자만 승인할 수 있습니다." : "승인 권한이 있는 검토자가 필요합니다.",
      };
    }
    return allowed;
  }

  if (decision === "CHANGES_REQUESTED" && !hasPermission(actor, "review.request_changes")) {
    return { allowed: false, code: "REVIEW_PERMISSION_DENIED", title: "수정 요청 권한이 없습니다", detail: "기여자 이상의 역할이 필요합니다." };
  }
  if (decision === "REJECTED" && !hasPermission(actor, "review.reject")) {
    return { allowed: false, code: "REVIEW_PERMISSION_DENIED", title: "반려 권한이 없습니다", detail: "검토자 이상의 역할이 필요합니다." };
  }
  return allowed;
}
