import type { RiskLevel } from "@entities/proposal";

export const ACTOR_ROLES = ["viewer", "contributor", "reviewer", "admin"] as const;
export type ActorRole = (typeof ACTOR_ROLES)[number];

export const PERMISSIONS = [
  "project.read",
  "change.read",
  "context.read",
  "evidence.read",
  "change.create",
  "change.edit_own_draft",
  "review.request_changes",
  "manual_check.submit",
  "git.publish_approved_change",
  "review.approve_low_medium_risk",
  "review.reject",
  "evidence.accept_manual",
  "review.approve_high_risk",
  "context.activate",
  "policy.manage",
  "project.manage",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export interface Actor {
  id: string;
  displayName: string;
  role: ActorRole;
}

export interface RoleDefinition {
  inherits: ActorRole | null;
  can: readonly Permission[];
}

export const ROLE_DEFINITIONS: Readonly<Record<ActorRole, RoleDefinition>> = {
  viewer: {
    inherits: null,
    can: ["project.read", "change.read", "context.read", "evidence.read"],
  },
  contributor: {
    inherits: "viewer",
    can: ["change.create", "change.edit_own_draft", "review.request_changes", "manual_check.submit", "git.publish_approved_change"],
  },
  reviewer: {
    inherits: "contributor",
    can: ["review.approve_low_medium_risk", "review.reject", "evidence.accept_manual"],
  },
  admin: {
    inherits: "reviewer",
    can: ["review.approve_high_risk", "context.activate", "policy.manage", "project.manage"],
  },
};

export const PERMISSION_CONSTRAINTS = {
  selfApproval: { allowed: false, exception: "demo_fixture_only" },
  highRiskApproval: { requiredRole: "admin" },
  activation: { requiredRole: "admin", requiresState: "READY_TO_ACTIVATE" },
  gitPublication: {
    requiredRole: "contributor",
    requiresState: "READY_TO_ACTIVATE",
    requiresCurrentApproval: true,
    requiresRevisionLock: true,
  },
  rejectedChange: { mutable: false },
} as const;

export function getRolePermissions(role: ActorRole): ReadonlySet<Permission> {
  const permissions = new Set<Permission>();
  let currentRole: ActorRole | null = role;

  while (currentRole !== null) {
    const definition: RoleDefinition = ROLE_DEFINITIONS[currentRole];
    definition.can.forEach((permission) => permissions.add(permission));
    currentRole = definition.inherits;
  }

  return permissions;
}

export function hasPermission(actor: Actor, permission: Permission): boolean {
  return getRolePermissions(actor.role).has(permission);
}

export function canApproveRisk(actor: Actor, risk: RiskLevel): boolean {
  return risk === "HIGH"
    ? hasPermission(actor, "review.approve_high_risk")
    : hasPermission(actor, "review.approve_low_medium_risk");
}
