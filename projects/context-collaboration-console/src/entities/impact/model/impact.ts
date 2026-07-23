export const IMPACT_KINDS = [
  "REQUEST",
  "PLANNING",
  "PUBLISHING",
  "DOCUMENT",
  "API_CONTRACT",
  "DATA",
  "COMPONENT",
  "CODE",
  "QA",
] as const;

export type ImpactKind = (typeof IMPACT_KINDS)[number];
export type ImpactStatus = "AFFECTED" | "UNCHANGED" | "UNKNOWN";

export interface ImpactNode {
  id: string;
  kind: ImpactKind;
  label: string;
  status: ImpactStatus;
  sourcePath: string | null;
  rationale: string;
  reviewable: boolean;
}

export interface ImpactEdge {
  id: string;
  from: string;
  to: string;
  relation: "DERIVES" | "IMPACTS" | "IMPLEMENTS" | "VERIFIES";
  rationale: string;
}

export type ImpactDepth = 0 | 1 | 2 | 3 | 4 | 5;
export type ImpactChangeType = "ADD" | "UPDATE" | "VERIFY" | "NONE" | "UNKNOWN";

export interface ImpactGraphNode extends ImpactNode {
  depth: ImpactDepth;
  changeType: ImpactChangeType;
  owner: string;
}

export interface ImpactGraph {
  projectId: string;
  changeId: string;
  revision: number;
  generatedAt: string;
  entryNodeId: string;
  nodes: readonly ImpactGraphNode[];
  edges: readonly ImpactEdge[];
}

export type ImpactSelection =
  | { type: "NODE"; id: string }
  | { type: "EDGE"; id: string };

export interface ImpactEvidencePath {
  nodeIds: readonly string[];
  edgeIds: readonly string[];
}
