import { createFixtureDocumentRepository } from "./fixture-document-repository";

describe("fixtureDocumentRepository", () => {
  it("applies path-scoped workflow policy schema diagnostics", async () => {
    const repository = createFixtureDocumentRepository();
    const listing = await repository.list("apc-monitoring-mvp");
    expect(listing.ok).toBe(true);
    if (!listing.ok) return;
    const policy = listing.value.find((item) => item.path.endsWith("/workflow-policy.yaml"));
    expect(policy).toBeDefined();
    if (policy === undefined) return;

    const result = await repository.validateDraft({
      documentId: policy.id,
      content: 'version: "1.4"\nproject: apc-monitoring-mvp\napproval: {}\nvalidation:\n  require_evidence: true\n',
      baseRevision: policy.revision,
      clientDraftId: "fixture-schema-001",
    });

    expect(result.ok && "diagnostics" in result.value && result.value.diagnostics[0]?.code).toBe("SCHEMA_REQUIRED");
    expect(result.ok && "diagnostics" in result.value && result.value.diagnostics[0]?.from.line).toBe(3);
  });
});
