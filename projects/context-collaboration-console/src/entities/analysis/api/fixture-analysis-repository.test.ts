import { createAnalysisIdempotencyKey, createFixtureAnalysisRepository } from "@entities/analysis";

const input = {
  projectId: "apc-monitoring-mvp",
  contextSnapshot: "2026.07.22",
  rawRequest: "모니터링 목록에 ‘최근 정상 수신 시간’을 추가하고, 24시간 이상 수신되지 않으면 경고로 보여주세요.",
};

async function runToTerminal(repository: ReturnType<typeof createFixtureAnalysisRepository>, jobId: string) {
  for (let count = 0; count < 8; count += 1) {
    const result = await repository.getAnalysisJob(jobId);
    if (result.ok && result.value !== null && (result.value.status === "COMPLETED" || result.value.status === "FAILED")) return result.value;
  }
  throw new Error("fixture analysis did not reach a terminal status");
}

describe("fixtureAnalysisRepository", () => {
  beforeEach(() => sessionStorage.clear());

  it("preserves raw input and suppresses duplicate starts with the same idempotency key", async () => {
    const repository = createFixtureAnalysisRepository();
    const key = createAnalysisIdempotencyKey(input);
    const first = await repository.startAnalysis(input, key);
    const duplicate = await repository.startAnalysis(input, key);

    expect(first).toEqual(duplicate);
    expect(first.ok && first.value.rawRequest).toBe(input.rawRequest);
  });

  it("completes four deterministic stages and exposes every proposal area", async () => {
    const repository = createFixtureAnalysisRepository();
    const started = await repository.startAnalysis(input, createAnalysisIdempotencyKey(input));
    if (!started.ok) throw new Error(started.error.detail);
    const completed = await runToTerminal(repository, started.value.id);
    expect(completed.status).toBe("COMPLETED");
    expect(completed.completedStages).toHaveLength(4);

    const outcome = await repository.getAnalysisOutcome(input.projectId, completed.changeId ?? "");
    if (!outcome.ok || outcome.value === null) throw new Error("missing outcome");
    expect(outcome.value.request.rawRequest).toBe(input.rawRequest);
    expect(outcome.value.proposal.acceptanceCriteria).toHaveLength(3);
    expect(new Set(outcome.value.proposal.impacts.map((impact) => impact.kind))).toEqual(new Set(["PLANNING", "PUBLISHING", "COMPONENT", "API_CONTRACT", "DATA", "CODE", "QA"]));
    expect(outcome.value.proposal.affectedFiles).toHaveLength(3);
    expect(outcome.value.proposal.qaScenarios).toHaveLength(3);
    expect(outcome.value.clarificationQuestions).toHaveLength(1);
    const restored = await createFixtureAnalysisRepository().getAnalysisOutcome(input.projectId, completed.changeId ?? "");
    expect(restored.ok && restored.value?.request.rawRequest).toBe(input.rawRequest);
  });

  it("keeps the request on failure and retries as a new attempt without duplicate retries", async () => {
    const repository = createFixtureAnalysisRepository();
    const failingInput = { ...input, rawRequest: `${input.rawRequest} [실패 재현]` };
    const started = await repository.startAnalysis(failingInput, createAnalysisIdempotencyKey(failingInput));
    if (!started.ok) throw new Error(started.error.detail);
    const failed = await runToTerminal(repository, started.value.id);
    expect(failed.status).toBe("FAILED");
    expect(failed.rawRequest).toBe(failingInput.rawRequest);

    const retried = await repository.retryAnalysis(failed.id, "retry-key-2");
    const duplicateRetry = await repository.retryAnalysis(failed.id, "retry-key-2");
    expect(retried).toEqual(duplicateRetry);
    expect(retried.ok && retried.value.attempt).toBe(2);
    expect((await runToTerminal(repository, failed.id)).status).toBe("COMPLETED");
  });
});
