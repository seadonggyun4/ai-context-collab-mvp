import { createFixtureActivationRepository } from "./fixture-activation-repository";

describe("fixture activation repository", () => {
  it("locks publication revisions and links evidence to the commit", async () => {
    const repository = createFixtureActivationRepository();
    const stale = await repository.publishGit({ projectId: "apc-monitoring-mvp", changeId: "CR-DEMO-001", actorId: "user-admin-01", expectedBaseCommitSha: "c".repeat(40), proposalRevision: 1, scopeFingerprint: "revision=1|scope=apc-monitoring-last-received-at-v1", implementationRevision: 1, idempotencyKey: "fixture-stale" });
    expect(stale.ok).toBe(false);
    const published = await repository.publishGit({ projectId: "apc-monitoring-mvp", changeId: "CR-DEMO-001", actorId: "user-admin-01", expectedBaseCommitSha: "a".repeat(40), proposalRevision: 1, scopeFingerprint: "revision=1|scope=apc-monitoring-last-received-at-v1", implementationRevision: 1, idempotencyKey: "fixture-publish" });
    expect(published.ok && published.value.evidence.every((item) => item.commitSha === "b".repeat(40))).toBe(true);
  });

  it("requires admin and publication before activation", async () => {
    const repository = createFixtureActivationRepository();
    const beforePublication = await repository.activate({ projectId: "apc-monitoring-mvp", changeId: "CR-DEMO-001", actorId: "user-admin-01", version: "context-v1.4", documentIds: ["DOC-APC-CONTEXT"], idempotencyKey: "fixture-before" });
    expect(beforePublication.ok).toBe(false);
    await repository.publishGit({ projectId: "apc-monitoring-mvp", changeId: "CR-DEMO-001", actorId: "user-admin-01", expectedBaseCommitSha: "a".repeat(40), proposalRevision: 1, scopeFingerprint: "revision=1|scope=apc-monitoring-last-received-at-v1", implementationRevision: 1, idempotencyKey: "fixture-publish-2" });
    const denied = await repository.activate({ projectId: "apc-monitoring-mvp", changeId: "CR-DEMO-001", actorId: "user-review-01", version: "context-v1.4", documentIds: ["DOC-APC-CONTEXT"], idempotencyKey: "fixture-denied" });
    expect(denied.ok).toBe(false);
  });
});
