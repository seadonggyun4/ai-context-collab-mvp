import { createHttpDocumentRepository } from "./http-document-repository";

const documentId = "apc-monitoring-mvp:0123456789abcdefabcd";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

describe("httpDocumentRepository", () => {
  it("maps list and detail reads through the document boundary", async () => {
    const fetcher = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(json({ items: [{ id: documentId, projectId: "apc-monitoring-mvp", path: "docs/apc-monitoring-mvp/Project_Context.md", title: "Project Context", format: "MARKDOWN", revision: "a".repeat(40), sizeBytes: 18 }], total: 1 }))
      .mockResolvedValueOnce(json({ id: documentId, projectId: "apc-monitoring-mvp", path: "docs/apc-monitoring-mvp/Project_Context.md", title: "Project Context", format: "MARKDOWN", revision: "a".repeat(40), sizeBytes: 18, source: "# Project Context\n" }));
    const repository = createHttpDocumentRepository({ apiBaseUrl: "https://api.example.com/", fetcher });

    const listing = await repository.list("apc-monitoring-mvp");
    const detail = await repository.get(documentId);

    expect(listing.ok && listing.value[0]?.role).toBe("ORGANIZATION");
    expect(detail.ok && detail.value?.source).toBe("# Project Context\n");
    expect(fetcher).toHaveBeenLastCalledWith(`https://api.example.com/api/v1/documents/${encodeURIComponent(documentId)}`, expect.any(Object));
  });

  it("sends idempotency and preserves the structured 409 recovery payload", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(json({
      code: "DOCUMENT_REVISION_CONFLICT",
      title: "문서 원본이 변경되었습니다",
      detail: "최신 원본을 확인해 주세요.",
      baseRevision: "b".repeat(40),
      currentRevision: "a".repeat(40),
      baseSource: "# 이전",
      currentSource: "# 최신",
      draftSource: "# 초안",
    }, 409));
    const repository = createHttpDocumentRepository({ apiBaseUrl: "https://api.example.com", fetcher });

    const result = await repository.saveDraft({ documentId, content: "# 초안", baseRevision: "b".repeat(40), clientDraftId: "draft-http-001" });

    expect(result.ok && "code" in result.value && result.value.code).toBe("DOCUMENT_REVISION_CONFLICT");
    const request = fetcher.mock.calls[0];
    expect(request?.[0]).toBe(`https://api.example.com/api/v1/documents/${encodeURIComponent(documentId)}/drafts`);
    expect(request?.[1]?.method).toBe("POST");
    expect(new Headers(request?.[1]?.headers).get("Idempotency-Key")).toBe("draft-http-001");
  });

  it("maps line-addressable diagnostics from validation", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(json({
      documentId,
      baseRevision: "a".repeat(40),
      currentRevision: "a".repeat(40),
      valid: false,
      diagnostics: [{ severity: "ERROR", code: "YAML_PARSE_ERROR", message: "mapping을 확인해 주세요", from: { line: 3, column: 7 }, to: null }],
    }));
    const repository = createHttpDocumentRepository({ apiBaseUrl: "https://api.example.com", fetcher });

    const result = await repository.validateDraft({ documentId, content: "policy: [", baseRevision: "a".repeat(40), clientDraftId: "validate-http-001" });

    expect(result.ok && "diagnostics" in result.value && result.value.diagnostics[0]?.from).toEqual({ line: 3, column: 7 });
  });
});
