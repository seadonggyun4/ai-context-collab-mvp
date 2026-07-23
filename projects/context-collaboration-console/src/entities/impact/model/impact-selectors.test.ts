import { createImpactGraphFixture } from "../api/fixture-impact-repository";

import {
  findImpactEvidencePath,
  resolveImpactSelection,
  selectDirectionalImpactNode,
} from "./impact-selectors";

describe("impact graph selectors", () => {
  const graph = createImpactGraphFixture();

  it("resolves node and edge selection and recovers invalid URLs to the request", () => {
    expect(resolveImpactSelection(graph, "impact-qa-auto")).toEqual({ type: "NODE", id: "impact-qa-auto" });
    expect(resolveImpactSelection(graph, "edge-backend-qa")).toEqual({ type: "EDGE", id: "edge-backend-qa" });
    expect(resolveImpactSelection(graph, "stale-id")).toEqual({ type: "NODE", id: graph.entryNodeId });
  });

  it("returns the shortest deterministic evidence path from request to QA", () => {
    expect(findImpactEvidencePath(graph, "impact-qa-auto")).toEqual({
      nodeIds: [
        "impact-request",
        "impact-role-publishing",
        "impact-doc-ui",
        "impact-code-frontend",
        "impact-qa-auto",
      ],
      edgeIds: [
        "edge-request-publishing",
        "edge-publishing-document",
        "edge-ui-frontend",
        "edge-frontend-qa",
      ],
    });
  });

  it("handles cycles and missing targets without revisiting nodes", () => {
    const cyclic = {
      ...graph,
      edges: [
        ...graph.edges,
        { id: "edge-cycle", from: "impact-code-backend", to: "impact-role-planning", relation: "IMPACTS" as const, rationale: "회귀 영향" },
      ],
    };
    expect(findImpactEvidencePath(cyclic, "impact-qa-auto")?.nodeIds.at(-1)).toBe("impact-qa-auto");
    expect(findImpactEvidencePath(cyclic, "missing")).toBeNull();
  });

  it("maps horizontal keys to graph relations and vertical keys to siblings", () => {
    expect(selectDirectionalImpactNode(graph, "impact-request", "RIGHT")?.id).toBe("impact-role-planning");
    expect(selectDirectionalImpactNode(graph, "impact-role-planning", "LEFT")?.id).toBe("impact-request");
    expect(selectDirectionalImpactNode(graph, "impact-role-planning", "DOWN")?.id).toBe("impact-role-publishing");
    expect(selectDirectionalImpactNode(graph, "impact-role-publishing", "UP")?.id).toBe("impact-role-planning");
  });
});
