import { findImpactEvidencePath } from "../model/impact-selectors";

import { createFixtureImpactRepository, createImpactGraphFixture } from "./fixture-impact-repository";

describe("fixture impact repository", () => {
  it("provides every semantic layer and a request-to-QA evidence path", () => {
    const graph = createImpactGraphFixture();
    const kinds = new Set(graph.nodes.map((node) => node.kind));

    expect([...kinds]).toEqual(expect.arrayContaining([
      "REQUEST", "PLANNING", "PUBLISHING", "DOCUMENT", "API_CONTRACT", "CODE", "COMPONENT", "QA",
    ]));
    expect(graph.edges.every((edge) => graph.nodes.some((node) => node.id === edge.from) && graph.nodes.some((node) => node.id === edge.to))).toBe(true);
    for (const qa of graph.nodes.filter((node) => node.kind === "QA")) {
      expect(findImpactEvidencePath(graph, qa.id)).not.toBeNull();
    }
  });

  it("keeps not-found behavior behind the repository boundary", async () => {
    const repository = createFixtureImpactRepository();
    await expect(repository.getImpactGraph("unknown", "CR-1")).resolves.toEqual({ ok: true, value: null });
    await expect(repository.getImpactGraph("apc-monitoring-mvp", "missing")).resolves.toEqual({ ok: true, value: null });
  });
});
