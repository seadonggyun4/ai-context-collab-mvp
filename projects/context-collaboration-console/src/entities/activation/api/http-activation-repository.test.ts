import { createFixtureActivationRepository } from "./fixture-activation-repository";
import { createHttpActivationRepository } from "./http-activation-repository";

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

async function activationFixture() {
  const result = await createFixtureActivationRepository().getWorkspace("apc-monitoring-mvp", "CR-DEMO-001");
  if (!result.ok || result.value === null) throw new Error("activation fixture missing");
  return result.value;
}

describe("http activation repository", () => {
  it("keeps revision locks, actor identity, and idempotency behind the repository boundary", async () => {
    const workspace = await activationFixture();
    const fetcher: typeof fetch = vi.fn(() => Promise.resolve(response(workspace)));
    const repository = createHttpActivationRepository({ apiBaseUrl: "https://api.example.test/", fetcher });

    await repository.getWorkspace("apc project", "CR/1");
    await repository.publishGit({
      projectId: workspace.projectId,
      changeId: workspace.changeId,
      actorId: workspace.currentActor.id,
      expectedBaseCommitSha: workspace.baseCommitSha,
      proposalRevision: workspace.proposalRevision,
      scopeFingerprint: workspace.scopeFingerprint,
      implementationRevision: workspace.implementationRevision,
      idempotencyKey: "publish-http-001",
    });

    const calls = vi.mocked(fetcher).mock.calls;
    expect(calls[0]?.[0]).toBe("https://api.example.test/api/v1/projects/apc%20project/changes/CR%2F1/activation-workspace");
    expect(calls[1]?.[0]).toBe("https://api.example.test/api/v1/changes/CR-DEMO-001/git-publications");
    expect(new Headers(calls[1]?.[1]?.headers).get("X-Actor-Id")).toBe("user-admin-01");
    expect(new Headers(calls[1]?.[1]?.headers).get("Idempotency-Key")).toBe("publish-http-001");
    expect(calls[1]?.[1]?.body).toContain('"expectedBaseCommitSha":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"');
  });

  it("preserves policy errors and isolates missing or malformed responses", async () => {
    const denied = createHttpActivationRepository({ apiBaseUrl: "/", fetcher: vi.fn(() => Promise.resolve(response({ code: "ACTIVATION_PERMISSION_DENIED", title: "권한 없음", detail: "관리자 권한이 필요합니다." }, 403))) });
    const invalid = createHttpActivationRepository({ apiBaseUrl: "/", fetcher: vi.fn(() => Promise.resolve(response({ changeId: "broken" }))) });
    const missing = createHttpActivationRepository({ apiBaseUrl: "/", fetcher: vi.fn(() => Promise.resolve(response({ code: "CHANGE_REQUEST_NOT_FOUND", title: "없음", detail: "변경 요청 없음" }, 404))) });

    const deniedResult = await denied.activate({ projectId: "project", changeId: "change", actorId: "reviewer", version: "context-v2", documentIds: ["DOC-1"], idempotencyKey: "activate-denied" });
    await expect(Promise.resolve(deniedResult)).resolves.toMatchObject({ ok: false, error: { code: "ACTIVATION_PERMISSION_DENIED" } });
    await expect(invalid.getWorkspace("project", "change")).resolves.toMatchObject({ ok: false, error: { code: "ACTIVATION_RESPONSE_INVALID" } });
    await expect(missing.getWorkspace("project", "change")).resolves.toEqual({ ok: true, value: null });
  });
});
