import { createFixtureProjectRepository } from "@entities/project";

describe("fixtureProjectRepository", () => {
  it("keeps deterministic dashboard access behind the async repository contract", async () => {
    const repository = createFixtureProjectRepository();
    const first = await repository.getProjectDashboard("apc-monitoring-mvp");
    const second = await repository.getProjectDashboard("apc-monitoring-mvp");

    expect(first).toEqual(second);
    expect(first.ok && first.value?.activeChanges.map((change) => change.id)).toEqual([
      "CR-APC-014",
      "CR-APC-013",
      "CR-DEMO-001",
    ]);
  });

  it("returns an explicit null for an unknown project", async () => {
    const result = await createFixtureProjectRepository().getProjectDashboard("missing");
    expect(result).toEqual({ ok: true, value: null });
  });
});
