import { APC_FIXTURE_ACTORS } from "@entities/change-request";

import { createFixtureReviewWorkspaceRepository } from "./fixture-review-workspace-repository";

function reviewInput(comment = "승인 범위와 검증 계획을 확인했습니다.") {
  return {
    projectId: "apc-monitoring-mvp",
    changeId: "CR-DEMO-001",
    actorId: APC_FIXTURE_ACTORS.reviewer.id,
    decision: "APPROVED" as const,
    proposalRevision: 1,
    scopeFingerprint: "",
    comment,
    idempotencyKey: "review-fixture-approved",
  };
}

describe("fixture review workspace repository", () => {
  it("runs approval, implementation, verification, evidence and completion gate as one aggregate", async () => {
    const repository = createFixtureReviewWorkspaceRepository();
    const loaded = await repository.getWorkspace("apc-monitoring-mvp", "CR-DEMO-001");
    if (!loaded.ok || loaded.value === null) throw new Error("workspace missing");

    const approved = await repository.recordReview({ ...reviewInput(), scopeFingerprint: loaded.value.scopeFingerprint });
    expect(approved).toMatchObject({ ok: true, value: { status: "APPROVED", currentReview: { decision: "APPROVED", proposalRevision: 1 } } });
    const implementing = await repository.transition({ projectId: "apc-monitoring-mvp", changeId: "CR-DEMO-001", actorId: APC_FIXTURE_ACTORS.reviewer.id, target: "IMPLEMENTING", idempotencyKey: "transition-implementing" });
    expect(implementing).toMatchObject({ ok: true, value: { status: "IMPLEMENTING", implementationRevision: 1 } });
    const verifying = await repository.transition({ projectId: "apc-monitoring-mvp", changeId: "CR-DEMO-001", actorId: APC_FIXTURE_ACTORS.reviewer.id, target: "VERIFYING", idempotencyKey: "transition-verifying" });
    expect(verifying).toMatchObject({ ok: true, value: { status: "VERIFYING", verificationGate: { ready: false } } });

    await repository.recordVerification({ projectId: "apc-monitoring-mvp", changeId: "CR-DEMO-001", actorId: APC_FIXTURE_ACTORS.reviewer.id, testId: "QA-DEMO-AUTO-01", result: "PASSED", idempotencyKey: "evidence-auto" });
    const manual = await repository.recordVerification({ projectId: "apc-monitoring-mvp", changeId: "CR-DEMO-001", actorId: APC_FIXTURE_ACTORS.reviewer.id, testId: "QA-DEMO-MANUAL-01", result: "PASSED", idempotencyKey: "evidence-manual" });
    expect(manual).toMatchObject({ ok: true, value: { verificationGate: { ready: true, blockers: [] } } });

    const ready = await repository.transition({ projectId: "apc-monitoring-mvp", changeId: "CR-DEMO-001", actorId: APC_FIXTURE_ACTORS.reviewer.id, target: "READY_TO_ACTIVATE", idempotencyKey: "transition-ready" });
    expect(ready).toMatchObject({ ok: true, value: { status: "READY_TO_ACTIVATE", transitionAction: null } });
    if (ready.ok) expect(ready.value.auditEvents.map((event) => event.action)).toEqual(expect.arrayContaining(["review.recorded", "evidence.recorded", "change.status_transitioned"]));
  });

  it("blocks self approval, blank comments and stale proposal scope", async () => {
    const selfRepository = createFixtureReviewWorkspaceRepository({ actorId: APC_FIXTURE_ACTORS.requester.id });
    const selfWorkspace = await selfRepository.getWorkspace("apc-monitoring-mvp", "CR-DEMO-001");
    if (!selfWorkspace.ok || selfWorkspace.value === null) throw new Error("workspace missing");
    expect(selfWorkspace.value.decisionCapabilities.APPROVED).toMatchObject({ allowed: false, reason: "다른 승인권자의 검토가 필요합니다." });
    await expect(selfRepository.recordReview({ ...reviewInput(), actorId: APC_FIXTURE_ACTORS.requester.id, scopeFingerprint: selfWorkspace.value.scopeFingerprint })).resolves.toMatchObject({ ok: false, error: { code: "SELF_APPROVAL_FORBIDDEN" } });

    const repository = createFixtureReviewWorkspaceRepository();
    await expect(repository.recordReview({ ...reviewInput(" "), scopeFingerprint: "stale" })).resolves.toMatchObject({ ok: false, error: { code: "REVIEW_COMMENT_REQUIRED" } });
    await expect(repository.recordReview({ ...reviewInput(), scopeFingerprint: "stale", idempotencyKey: "review-stale" })).resolves.toMatchObject({ ok: false, error: { code: "REVIEW_SCOPE_STALE" } });
  });

  it("replays the same idempotent command and rejects key reuse with another payload", async () => {
    const repository = createFixtureReviewWorkspaceRepository();
    const loaded = await repository.getWorkspace("apc-monitoring-mvp", "CR-DEMO-001");
    if (!loaded.ok || loaded.value === null) throw new Error("workspace missing");
    const input = { ...reviewInput(), scopeFingerprint: loaded.value.scopeFingerprint };
    const first = await repository.recordReview(input);
    const replay = await repository.recordReview(input);
    expect(replay).toEqual(first);
    await expect(repository.recordReview({ ...input, comment: "다른 요청" })).resolves.toMatchObject({ ok: false, error: { code: "IDEMPOTENCY_KEY_REUSED" } });
  });
});
