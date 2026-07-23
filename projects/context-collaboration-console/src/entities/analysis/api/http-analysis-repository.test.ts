import { createFixtureAnalysisRepository, createHttpAnalysisRepository } from "@entities/analysis";

import { toAnalysisJobWire, toAnalysisOutcomeWire } from "./fixture-analysis-repository";

import type { AnalysisJob } from "@entities/analysis";

const input = { projectId: "apc-monitoring-mvp", contextSnapshot: "2026.07.22", rawRequest: "최근 정상 수신 시간과 24시간 경고를 추가해 주세요." };

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

async function createWireFixtures() {
  const fixture = createFixtureAnalysisRepository();
  const started = await fixture.startAnalysis(input, "fixture-key");
  if (!started.ok) throw new Error(started.error.detail);
  let job: AnalysisJob = started.value;
  for (let count = 0; count < 8 && job.status !== "COMPLETED"; count += 1) {
    const polled = await fixture.getAnalysisJob(job.id);
    if (!polled.ok || polled.value === null) throw new Error("fixture poll failed");
    job = polled.value;
  }
  const outcome = await fixture.getAnalysisOutcome(input.projectId, job.changeId ?? "");
  if (!outcome.ok || outcome.value === null) throw new Error("fixture outcome missing");
  return { job: toAnalysisJobWire(job), outcome: toAnalysisOutcomeWire(outcome.value) };
}

describe("httpAnalysisRepository", () => {
  it("keeps start, poll, retry and detail paths behind one API contract", async () => {
    const wire = await createWireFixtures();
    const fetcher: typeof fetch = vi.fn((url) => Promise.resolve(response(String(url).includes("change-analyses/CR-") ? wire.outcome : wire.job)));
    const repository = createHttpAnalysisRepository({ apiBaseUrl: "https://api.example.test/", fetcher });

    const started = await repository.startAnalysis(input, "start-key");
    await repository.getAnalysisJob("JOB-123");
    await repository.retryAnalysis("JOB-123", "retry-key");
    await repository.getAnalysisOutcome(input.projectId, "CR-123");

    expect(started.ok).toBe(true);
    const calls = vi.mocked(fetcher).mock.calls;
    expect(calls[0]?.[0]).toBe("https://api.example.test/api/v1/projects/apc-monitoring-mvp/change-analyses");
    expect(calls[0]?.[1]?.method).toBe("POST");
    expect(new Headers(calls[0]?.[1]?.headers).get("Idempotency-Key")).toBe("start-key");
    expect(calls[0]?.[1]?.body).toBe(JSON.stringify({ raw_request: input.rawRequest, context_snapshot: input.contextSnapshot }));
    expect(calls[1]?.[0]).toBe("https://api.example.test/api/v1/analysis-jobs/JOB-123");
    expect(calls[2]?.[0]).toBe("https://api.example.test/api/v1/analysis-jobs/JOB-123/retry");
    expect(new Headers(calls[2]?.[1]?.headers).get("Idempotency-Key")).toBe("retry-key");
    expect(calls[3]?.[0]).toBe("https://api.example.test/api/v1/projects/apc-monitoring-mvp/change-analyses/CR-123");
  });

  it("distinguishes not-found, invalid schema and network failures", async () => {
    const notFound = createHttpAnalysisRepository({ apiBaseUrl: "/", fetcher: vi.fn(() => Promise.resolve(response({}, 404))) });
    const invalid = createHttpAnalysisRepository({ apiBaseUrl: "/", fetcher: vi.fn(() => Promise.resolve(response({ id: "broken" }))) });
    const network = createHttpAnalysisRepository({ apiBaseUrl: "/", fetcher: vi.fn(() => Promise.reject(new TypeError("offline"))) });

    await expect(notFound.getAnalysisJob("missing")).resolves.toEqual({ ok: true, value: null });
    await expect(invalid.startAnalysis(input, "key")).resolves.toMatchObject({ ok: false, error: { code: "ANALYSIS_INVALID_RESPONSE" } });
    await expect(network.getAnalysisJob("job")).resolves.toMatchObject({ ok: false, error: { code: "ANALYSIS_NETWORK_ERROR" } });
  });
});
