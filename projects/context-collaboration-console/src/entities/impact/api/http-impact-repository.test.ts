import { createImpactGraphFixture } from "./fixture-impact-repository";
import { createHttpImpactRepository } from "./http-impact-repository";

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

describe("http impact repository", () => {
  it("loads and parses the project change impact endpoint", async () => {
    const graph = createImpactGraphFixture("CR-2026-010");
    const fetcher: typeof fetch = vi.fn(() => Promise.resolve(response(graph)));
    const repository = createHttpImpactRepository({ apiBaseUrl: "https://api.example.test/", fetcher });

    const result = await repository.getImpactGraph("apc monitoring", "CR/010");

    expect(result).toMatchObject({ ok: true, value: { changeId: "CR-2026-010", entryNodeId: "impact-request" } });
    expect(vi.mocked(fetcher).mock.calls[0]?.[0]).toBe("https://api.example.test/api/v1/projects/apc%20monitoring/changes/CR%2F010/impact");
  });

  it("distinguishes not-found, invalid graph and network failures", async () => {
    const notFound = createHttpImpactRepository({ apiBaseUrl: "/", fetcher: vi.fn(() => Promise.resolve(response({}, 404))) });
    const invalid = createHttpImpactRepository({ apiBaseUrl: "/", fetcher: vi.fn(() => Promise.resolve(response({ nodes: [], edges: [] }))) });
    const network = createHttpImpactRepository({ apiBaseUrl: "/", fetcher: vi.fn(() => Promise.reject(new TypeError("offline"))) });

    await expect(notFound.getImpactGraph("project", "missing")).resolves.toEqual({ ok: true, value: null });
    await expect(invalid.getImpactGraph("project", "change")).resolves.toMatchObject({ ok: false, error: { code: "IMPACT_INVALID_RESPONSE" } });
    await expect(network.getImpactGraph("project", "change")).resolves.toMatchObject({ ok: false, error: { code: "IMPACT_NETWORK_ERROR" } });
  });
});
