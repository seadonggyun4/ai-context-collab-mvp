import { createFixtureReviewWorkspaceRepository } from "./fixture-review-workspace-repository";
import { createHttpReviewWorkspaceRepository } from "./http-review-workspace-repository";

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

async function workspaceFixture() {
  const result = await createFixtureReviewWorkspaceRepository().getWorkspace("apc-monitoring-mvp", "CR-DEMO-001");
  if (!result.ok || result.value === null) throw new Error("fixture missing");
  return result.value;
}

describe("http review workspace repository", () => {
  it("keeps read and mutation identity/idempotency contracts behind one repository", async () => {
    const workspace = await workspaceFixture();
    const fetcher: typeof fetch = vi.fn(() => Promise.resolve(response(workspace)));
    const repository = createHttpReviewWorkspaceRepository({ apiBaseUrl: "https://api.example.test/", fetcher });

    await repository.getWorkspace("apc project", "CR/1");
    await repository.recordReview({ projectId: "apc-monitoring-mvp", changeId: "CR-DEMO-001", actorId: "user-review-01", decision: "APPROVED", proposalRevision: 1, scopeFingerprint: workspace.scopeFingerprint, comment: "승인", idempotencyKey: "review-http-001" });

    const calls = vi.mocked(fetcher).mock.calls;
    expect(calls[0]?.[0]).toBe("https://api.example.test/api/v1/projects/apc%20project/changes/CR%2F1/review-workspace");
    expect(calls[1]?.[0]).toBe("https://api.example.test/api/v1/changes/CR-DEMO-001/reviews");
    expect(new Headers(calls[1]?.[1]?.headers).get("X-Actor-Id")).toBe("user-review-01");
    expect(new Headers(calls[1]?.[1]?.headers).get("Idempotency-Key")).toBe("review-http-001");
    expect(calls[1]?.[1]?.body).toContain('"proposalRevision":1');
  });

  it("preserves backend policy errors and distinguishes invalid/network/not-found", async () => {
    const denied = createHttpReviewWorkspaceRepository({ apiBaseUrl: "/", fetcher: vi.fn(() => Promise.resolve(response({ code: "SELF_APPROVAL_FORBIDDEN", title: "본인 승인 금지", detail: "다른 검토자가 필요합니다." }, 403))) });
    const invalid = createHttpReviewWorkspaceRepository({ apiBaseUrl: "/", fetcher: vi.fn(() => Promise.resolve(response({ changeId: "broken" }))) });
    const network = createHttpReviewWorkspaceRepository({ apiBaseUrl: "/", fetcher: vi.fn(() => Promise.reject(new TypeError("offline"))) });
    const missing = createHttpReviewWorkspaceRepository({ apiBaseUrl: "/", fetcher: vi.fn(() => Promise.resolve(response({}, 404))) });
    const input = { projectId: "project", changeId: "change", actorId: "actor", decision: "APPROVED" as const, proposalRevision: 1, scopeFingerprint: "scope", comment: "comment", idempotencyKey: "key" };

    await expect(denied.recordReview(input)).resolves.toMatchObject({ ok: false, error: { code: "SELF_APPROVAL_FORBIDDEN" } });
    await expect(invalid.getWorkspace("project", "change")).resolves.toMatchObject({ ok: false, error: { code: "REVIEW_INVALID_RESPONSE" } });
    await expect(network.getWorkspace("project", "change")).resolves.toMatchObject({ ok: false, error: { code: "REVIEW_NETWORK_ERROR" } });
    await expect(missing.getWorkspace("project", "change")).resolves.toEqual({ ok: true, value: null });
  });
});
