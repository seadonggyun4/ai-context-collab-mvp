import type { ImpactEvidencePath, ImpactGraph, ImpactGraphNode, ImpactSelection } from "./impact";

export function resolveImpactSelection(graph: ImpactGraph, id: string | null | undefined): ImpactSelection {
  if (id !== null && id !== undefined) {
    if (graph.nodes.some((node) => node.id === id)) return { type: "NODE", id };
    if (graph.edges.some((edge) => edge.id === id)) return { type: "EDGE", id };
  }
  return { type: "NODE", id: graph.entryNodeId };
}

export function findImpactEvidencePath(graph: ImpactGraph, targetNodeId: string): ImpactEvidencePath | null {
  if (!graph.nodes.some((node) => node.id === targetNodeId)) return null;
  if (targetNodeId === graph.entryNodeId) return { nodeIds: [graph.entryNodeId], edgeIds: [] };

  const queue: Array<{ nodeIds: string[]; edgeIds: string[] }> = [{ nodeIds: [graph.entryNodeId], edgeIds: [] }];
  const visited = new Set([graph.entryNodeId]);
  while (queue.length > 0) {
    const current = queue.shift();
    if (current === undefined) break;
    const from = current.nodeIds[current.nodeIds.length - 1];
    const outgoing = graph.edges.filter((edge) => edge.from === from);
    for (const edge of outgoing) {
      if (visited.has(edge.to)) continue;
      const next = { nodeIds: [...current.nodeIds, edge.to], edgeIds: [...current.edgeIds, edge.id] };
      if (edge.to === targetNodeId) return next;
      visited.add(edge.to);
      queue.push(next);
    }
  }
  return null;
}

export function selectImpactNode(graph: ImpactGraph, nodeId: string): ImpactGraphNode | null {
  return graph.nodes.find((node) => node.id === nodeId) ?? null;
}

export function selectDirectionalImpactNode(
  graph: ImpactGraph,
  currentNodeId: string,
  direction: "UP" | "DOWN" | "LEFT" | "RIGHT",
): ImpactGraphNode | null {
  const current = selectImpactNode(graph, currentNodeId);
  if (current === null) return null;
  if (direction === "RIGHT") {
    const outgoing = graph.edges.find((edge) => edge.from === current.id);
    return outgoing === undefined ? null : selectImpactNode(graph, outgoing.to);
  }
  if (direction === "LEFT") {
    const incoming = graph.edges.find((edge) => edge.to === current.id);
    return incoming === undefined ? null : selectImpactNode(graph, incoming.from);
  }

  const siblings = graph.nodes.filter((node) => node.depth === current.depth);
  const index = siblings.findIndex((node) => node.id === current.id);
  const sibling = direction === "UP" ? siblings[index - 1] : siblings[index + 1];
  return sibling ?? null;
}
