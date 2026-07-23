import { createApcDomainFixture } from "@entities/change-request";

describe("APC domain fixture", () => {
  it("is deterministic and follows the documented demo contract", () => {
    const first = createApcDomainFixture();
    const second = createApcDomainFixture();

    expect(first).toEqual(second);
    expect(first.project.id).toBe("apc-monitoring-mvp");
    expect(first.aggregate.request).toMatchObject({ id: "CR-DEMO-001", status: "ANALYZED" });
    expect(first.aggregate.request.rawRequest).toContain("최근 정상 수신 시간");
    expect(first.aggregate.proposals[0]?.impacts.map(({ kind }) => kind)).toEqual([
      "PLANNING",
      "PUBLISHING",
      "API_CONTRACT",
      "DATA",
      "CODE",
      "QA",
    ]);
    expect(first.aggregate.proposals[0]?.qaScenarios).toEqual(expect.arrayContaining([
      expect.objectContaining({ type: "AUTOMATED", required: true }),
      expect.objectContaining({ type: "MANUAL", required: true }),
    ]));
  });

  it("returns fresh collections so one session cannot mutate another", () => {
    const first = createApcDomainFixture();
    const second = createApcDomainFixture();
    expect(first.aggregate).not.toBe(second.aggregate);
    expect(first.documents).not.toBe(second.documents);
    expect(first.aggregate.proposals).not.toBe(second.aggregate.proposals);
  });
});
