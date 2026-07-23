import { useMemo, useState } from "react";

import { findImpactEvidencePath, selectImpactNode } from "@entities/impact";

import type { ImpactGraph, ImpactSelection } from "@entities/impact";

export type ImpactViewMode = "GRAPH" | "LIST";

const compactImpactQuery = "(max-width: 768px)";

export function getInitialImpactViewMode(compact: boolean): ImpactViewMode {
  return compact ? "LIST" : "GRAPH";
}

export function useImpactExplorer(graph: ImpactGraph, selection: ImpactSelection) {
  const [viewMode, setViewMode] = useState<ImpactViewMode>(() => getInitialImpactViewMode(window.matchMedia(compactImpactQuery).matches));
  const selectedNode = selection.type === "NODE" ? selectImpactNode(graph, selection.id) : null;
  const selectedEdge = selection.type === "EDGE" ? graph.edges.find((edge) => edge.id === selection.id) ?? null : null;
  const pathTargetId = selectedNode?.id ?? selectedEdge?.to ?? graph.entryNodeId;
  const evidencePath = useMemo(
    () => findImpactEvidencePath(graph, pathTargetId),
    [graph, pathTargetId],
  );

  return { viewMode, setViewMode, selectedNode, selectedEdge, evidencePath };
}
