import { createHttpProjectRepository } from "@entities/project";

import { createProjectDashboardFixturePayload } from "./fixture-project-repository";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

function fetchResponse(response: Response): typeof fetch {
  return vi.fn(() => Promise.resolve(response));
}

describe("httpProjectRepository", () => {
  it("maps the dashboard endpoint through the same runtime parser", async () => {
    const fetcher = fetchResponse(jsonResponse(createProjectDashboardFixturePayload()));
    const repository = createHttpProjectRepository({ apiBaseUrl: "https://api.example.test/", fetcher });

    const result = await repository.getProjectDashboard("apc monitoring");

    expect(fetcher).toHaveBeenCalledWith(
      "https://api.example.test/api/v1/projects/apc%20monitoring/dashboard",
      expect.objectContaining({ headers: { Accept: "application/json" } }),
    );
    expect(result.ok && result.value?.project.id).toBe("apc-monitoring-mvp");
  });

  it("keeps not-found distinct from server and schema failures", async () => {
    const notFound = createHttpProjectRepository({ apiBaseUrl: "/", fetcher: fetchResponse(jsonResponse({}, 404)) });
    const serverError = createHttpProjectRepository({ apiBaseUrl: "/", fetcher: fetchResponse(jsonResponse({}, 503)) });
    const invalid = createHttpProjectRepository({ apiBaseUrl: "/", fetcher: fetchResponse(jsonResponse({ project: {} })) });

    await expect(notFound.getProjectDashboard("missing")).resolves.toEqual({ ok: true, value: null });
    await expect(serverError.getProjectDashboard("apc")).resolves.toMatchObject({ ok: false, error: { code: "PROJECT_DASHBOARD_HTTP_ERROR" } });
    await expect(invalid.getProjectDashboard("apc")).resolves.toMatchObject({ ok: false, error: { code: "PROJECT_DASHBOARD_INVALID_RESPONSE" } });
  });

  it("reports network failures without falling back to fixture data", async () => {
    const repository = createHttpProjectRepository({
      apiBaseUrl: "/",
      fetcher: vi.fn(() => Promise.reject(new TypeError("offline"))),
    });

    await expect(repository.getProjectDashboard("apc")).resolves.toMatchObject({
      ok: false,
      error: { code: "PROJECT_DASHBOARD_NETWORK_ERROR" },
    });
  });
});
