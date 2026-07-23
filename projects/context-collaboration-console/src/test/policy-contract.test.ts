import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { parse } from "yaml";

import {
  CHANGE_STATUSES,
  TERMINAL_CHANGE_STATUSES,
  WORKFLOW_FORBIDDEN_RULES,
  WORKFLOW_GUARD_REQUIREMENTS,
  WORKFLOW_POLICY_VERSION,
  WORKFLOW_TRANSITIONS,
} from "@entities/change-request";
import {
  DOCUMENT_METADATA_REQUIRED_FIELDS,
  DOCUMENT_RELATION_REQUIRED_FIELDS,
  DOCUMENT_RELATION_TYPES,
  DOCUMENT_STATUSES,
  DOCUMENT_TYPES,
} from "@entities/document";
import {
  PERMISSION_CONSTRAINTS,
  ROLE_DEFINITIONS,
  type ActorRole,
  type Permission,
} from "@entities/review";

const workspaceRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..");
const governanceRoot = resolve(workspaceRoot, "docs/context-collaboration-console/governance");

function readYaml<T>(filename: string): T {
  return parse(readFileSync(resolve(governanceRoot, filename), "utf8")) as T;
}

interface WorkflowPolicyYaml {
  policy_version: number;
  states: string[];
  transitions: Record<string, string[]>;
  guards: Record<string, { require: string[] }>;
  terminal_states: string[];
  forbidden: string[];
}

interface PermissionPolicyYaml {
  roles: Record<string, { inherits?: string; can: string[] }>;
  constraints: {
    self_approval: { allowed: boolean; exception: string };
    high_risk_approval: { required_role: string };
    activation: { required_role: string; requires_state: string };
    git_publication: {
      required_role: string;
      requires_state: string;
      requires_current_approval: boolean;
      requires_revision_lock: boolean;
    };
    rejected_change: { mutable: boolean };
  };
}

interface DocumentSchemaYaml {
  document_metadata: {
    required: string[];
    enums: {
      document_type: string[];
      status: string[];
    };
  };
  relations: { allowed_types: string[]; required_fields: string[] };
}

describe("governance YAML contracts", () => {
  it("keeps workflow states and transitions synchronized with TypeScript", () => {
    const policy = readYaml<WorkflowPolicyYaml>("workflow-policy.yaml");
    expect(policy.policy_version).toBe(WORKFLOW_POLICY_VERSION);
    expect(policy.states).toEqual(CHANGE_STATUSES);
    expect(policy.transitions).toEqual(WORKFLOW_TRANSITIONS);
    expect(Object.fromEntries(
      Object.entries(policy.guards).map(([state, guard]) => [state, guard.require]),
    )).toEqual(WORKFLOW_GUARD_REQUIREMENTS);
    expect(policy.terminal_states).toEqual(TERMINAL_CHANGE_STATUSES);
    expect(policy.forbidden).toEqual(WORKFLOW_FORBIDDEN_RULES);
  });

  it("keeps role inheritance and direct permissions synchronized", () => {
    const policy = readYaml<PermissionPolicyYaml>("permissions.yaml");
    const roles = Object.fromEntries(
      Object.entries(ROLE_DEFINITIONS).map(([role, definition]) => [
        role,
        {
          ...(definition.inherits === null ? {} : { inherits: definition.inherits }),
          can: [...definition.can],
        },
      ]),
    ) as Record<ActorRole, { inherits?: ActorRole; can: Permission[] }>;
    expect(policy.roles).toEqual(roles);
    expect(policy.constraints).toEqual({
      self_approval: {
        allowed: PERMISSION_CONSTRAINTS.selfApproval.allowed,
        exception: PERMISSION_CONSTRAINTS.selfApproval.exception,
      },
      high_risk_approval: { required_role: PERMISSION_CONSTRAINTS.highRiskApproval.requiredRole },
      activation: {
        required_role: PERMISSION_CONSTRAINTS.activation.requiredRole,
        requires_state: PERMISSION_CONSTRAINTS.activation.requiresState,
      },
      git_publication: {
        required_role: PERMISSION_CONSTRAINTS.gitPublication.requiredRole,
        requires_state: PERMISSION_CONSTRAINTS.gitPublication.requiresState,
        requires_current_approval: PERMISSION_CONSTRAINTS.gitPublication.requiresCurrentApproval,
        requires_revision_lock: PERMISSION_CONSTRAINTS.gitPublication.requiresRevisionLock,
      },
      rejected_change: { mutable: PERMISSION_CONSTRAINTS.rejectedChange.mutable },
    });
  });

  it("keeps document enums and relation types synchronized", () => {
    const schema = readYaml<DocumentSchemaYaml>("document-schema.yaml");
    expect(schema.document_metadata.required).toEqual(DOCUMENT_METADATA_REQUIRED_FIELDS);
    expect(schema.document_metadata.enums.document_type).toEqual(DOCUMENT_TYPES);
    expect(schema.document_metadata.enums.status).toEqual(DOCUMENT_STATUSES);
    expect(schema.relations.allowed_types).toEqual(DOCUMENT_RELATION_TYPES);
    expect(schema.relations.required_fields).toEqual(DOCUMENT_RELATION_REQUIRED_FIELDS);
  });
});
