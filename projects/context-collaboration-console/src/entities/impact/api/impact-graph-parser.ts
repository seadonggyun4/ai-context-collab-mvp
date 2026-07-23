import { IMPACT_KINDS } from "../model/impact";

import type {
  ImpactDepth,
  ImpactEdge,
  ImpactGraph,
  ImpactGraphNode,
} from "../model/impact";

function record(value: unknown, label: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null) throw new Error(`${label} must be an object`);
  return value as Record<string, unknown>;
}

function field(source: Record<string, unknown>, camel: string, snake: string = camel): unknown {
  return Object.prototype.hasOwnProperty.call(source, camel) ? source[camel] : source[snake];
}

function string(value: unknown, label: string): string {
  if (typeof value !== "string" || value.trim() === "") throw new Error(`${label} must be a non-empty string`);
  return value;
}

function nullableString(value: unknown, label: string): string | null {
  return value === null ? null : string(value, label);
}

function enumeration<T extends string>(value: unknown, values: readonly T[], label: string): T {
  if (typeof value !== "string" || !values.includes(value as T)) throw new Error(`${label} is invalid`);
  return value as T;
}

function parseNode(value: unknown): ImpactGraphNode {
  const item = record(value, "impact node");
  const depthValue = field(item, "depth");
  if (typeof depthValue !== "number" || !Number.isInteger(depthValue) || depthValue < 0 || depthValue > 5) {
    throw new Error("impact node depth is invalid");
  }
  return {
    id: string(field(item, "id"), "impact node id"),
    kind: enumeration(field(item, "kind"), IMPACT_KINDS, "impact node kind"),
    depth: depthValue as ImpactDepth,
    label: string(field(item, "label"), "impact node label"),
    status: enumeration(field(item, "status"), ["AFFECTED", "UNCHANGED", "UNKNOWN"], "impact node status"),
    changeType: enumeration(field(item, "changeType", "change_type"), ["ADD", "UPDATE", "VERIFY", "NONE", "UNKNOWN"], "impact change type"),
    sourcePath: nullableString(field(item, "sourcePath", "source_path"), "impact source path"),
    rationale: string(field(item, "rationale"), "impact rationale"),
    reviewable: field(item, "reviewable") === true,
    owner: string(field(item, "owner"), "impact owner"),
  };
}

function parseEdge(value: unknown): ImpactEdge {
  const item = record(value, "impact edge");
  return {
    id: string(field(item, "id"), "impact edge id"),
    from: string(field(item, "from"), "impact edge from"),
    to: string(field(item, "to"), "impact edge to"),
    relation: enumeration(field(item, "relation"), ["DERIVES", "IMPACTS", "IMPLEMENTS", "VERIFIES"], "impact relation"),
    rationale: string(field(item, "rationale"), "impact edge rationale"),
  };
}

export function parseImpactGraph(value: unknown): ImpactGraph {
  const item = record(value, "impact graph");
  const nodeValues = field(item, "nodes");
  const edgeValues = field(item, "edges");
  if (!Array.isArray(nodeValues) || !Array.isArray(edgeValues)) throw new Error("impact graph collections are invalid");
  const nodes = nodeValues.map(parseNode);
  const edges = edgeValues.map(parseEdge);
  const nodeIds = new Set(nodes.map((node) => node.id));
  const entryNodeId = string(field(item, "entryNodeId", "entry_node_id"), "impact entry node");
  const entry = nodes.find((node) => node.id === entryNodeId);
  if (entry?.kind !== "REQUEST" || entry.depth !== 0) throw new Error("impact entry node must be a depth-zero request");
  if (edges.some((edge) => !nodeIds.has(edge.from) || !nodeIds.has(edge.to))) throw new Error("impact edge endpoint is missing");
  if (new Set(nodes.map((node) => node.id)).size !== nodes.length) throw new Error("impact node ids must be unique");
  if (new Set(edges.map((edge) => edge.id)).size !== edges.length) throw new Error("impact edge ids must be unique");

  const revision = field(item, "revision");
  if (typeof revision !== "number" || !Number.isInteger(revision) || revision < 1) throw new Error("impact revision is invalid");
  return {
    projectId: string(field(item, "projectId", "project_id"), "impact project id"),
    changeId: string(field(item, "changeId", "change_id"), "impact change id"),
    revision,
    generatedAt: string(field(item, "generatedAt", "generated_at"), "impact generated at"),
    entryNodeId,
    nodes,
    edges,
  };
}
