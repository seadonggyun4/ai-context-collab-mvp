import type { ChangeStatus } from "./change-request";

export const WORKFLOW_POLICY_VERSION = 2;

export const WORKFLOW_GUARD_REQUIREMENTS = {
  IN_REVIEW: [
    "proposal.acceptance_criteria_not_empty",
    "proposal.context_snapshot_locked",
    "proposal.impacts_reviewable",
  ],
  APPROVED: [
    "review.authorized_reviewer",
    "review.scope_matches_revision",
    "review.decision_recorded",
  ],
  READY_TO_ACTIVATE: [
    "evidence.no_required_failures",
    "evidence.no_required_not_executed",
    "evidence.manual_checks_resolved",
    "implementation.matches_approved_scope",
  ],
  ACTIVATED: [
    "git.publication_matches_approved_revision",
    "evidence.linked_to_publication_commit",
    "context.new_version_created",
    "context.source_commit_recorded",
    "audit.activation_actor_recorded",
  ],
} as const;

export const WORKFLOW_FORBIDDEN_RULES = [
  "transition_without_guard_check",
  "reuse_evidence_after_implementation_change",
  "expand_approval_scope_without_new_review",
  "git_write_before_ready",
  "activate_without_current_publication",
] as const;

export const WORKFLOW_TRANSITIONS: Readonly<Record<ChangeStatus, readonly ChangeStatus[]>> = {
  REQUESTED: ["ANALYZED", "REJECTED"],
  ANALYZED: ["IN_REVIEW", "REQUESTED", "REJECTED"],
  IN_REVIEW: ["APPROVED", "CHANGES_REQUESTED", "REJECTED"],
  CHANGES_REQUESTED: ["ANALYZED", "REJECTED"],
  APPROVED: ["IMPLEMENTING"],
  IMPLEMENTING: ["VERIFYING"],
  VERIFYING: ["IMPLEMENTING", "READY_TO_ACTIVATE"],
  READY_TO_ACTIVATE: ["ACTIVATED", "VERIFYING"],
  ACTIVATED: [],
  REJECTED: [],
};

export const TERMINAL_CHANGE_STATUSES: readonly ChangeStatus[] = ["ACTIVATED", "REJECTED"];

export function isTransitionAllowed(from: ChangeStatus, to: ChangeStatus): boolean {
  return WORKFLOW_TRANSITIONS[from].includes(to);
}

export function isTerminalChangeStatus(status: ChangeStatus): boolean {
  return TERMINAL_CHANGE_STATUSES.includes(status);
}
