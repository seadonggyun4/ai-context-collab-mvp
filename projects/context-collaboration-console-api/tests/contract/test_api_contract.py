"""HTTP, OpenAPI, CORS, request ID, and error contracts."""

from app.api.middleware import REQUEST_ID_HEADER
from app.application.container import ApplicationContainer
from app.application.health import ReadinessReport
from app.main import create_app
from app.settings import Settings
from httpx import ASGITransport, AsyncClient, Response
from tests.fakes import FakeReadinessProbe


async def test_health_contract(client: AsyncClient) -> None:
    assert (await client.get("/health/live")).json() == {"status": "live"}
    ready = await client.get("/health/ready")
    assert ready.status_code == 200
    assert ready.json() == {
        "status": "ready",
        "checks": {"database": "available", "migration": "current", "securityStore": "not_required"},
    }


async def test_readiness_returns_503_when_database_is_not_ready(
    settings: Settings,
    container: ApplicationContainer,
) -> None:
    not_ready = ApplicationContainer(
        projects=container.projects,
        documents=container.documents,
        document_commands=container.document_commands,
        readiness=FakeReadinessProbe(ReadinessReport(ready=False, database="unavailable", migration="unknown")),
        review_workflow=container.review_workflow,
    )
    application = create_app(settings, container=not_ready)
    async with (
        application.router.lifespan_context(application),
        AsyncClient(
            transport=ASGITransport(app=application),
            base_url="https://test.example.com",
        ) as not_ready_client,
    ):
        response = await not_ready_client.get("/health/ready")
    assert response.status_code == 503
    assert response.json()["status"] == "not_ready"


async def test_project_and_document_read_contract(client: AsyncClient) -> None:
    project = await client.get("/api/v1/projects/apc-monitoring-mvp")
    assert project.status_code == 200
    assert project.json()["activeContextVersion"] == "context-v1.3"
    assert project.json()["documentRoot"] == "docs/apc-monitoring-mvp"

    listing = await client.get("/api/v1/projects/apc-monitoring-mvp/documents")
    assert listing.status_code == 200
    assert listing.json()["total"] == 1
    document_id = listing.json()["items"][0]["id"]

    detail = await client.get(f"/api/v1/documents/{document_id}")
    assert detail.status_code == 200
    assert detail.json()["source"] == "# Project Context\n"


async def test_document_draft_validation_and_conflict_contract(client: AsyncClient) -> None:
    document_id = "apc-monitoring-mvp:0123456789abcdefabcd"
    current_revision = "a" * 40
    request = {
        "content": "Project Context without heading\n",
        "baseRevision": current_revision,
        "clientDraftId": "draft-contract-001",
    }
    headers = {"Idempotency-Key": "draft-contract-001"}

    saved = await client.post(f"/api/v1/documents/{document_id}/drafts", json=request, headers=headers)
    assert saved.status_code == 200
    assert saved.json()["valid"] is True
    assert saved.json()["diagnostics"][0]["code"] == "MARKDOWN_H1_MISSING"
    assert saved.json()["diagnostics"][0]["from"] == {"line": 1, "column": 1}

    validated = await client.post(
        f"/api/v1/documents/{document_id}/validate",
        json={"content": "# Valid\n", "baseRevision": current_revision},
        headers={"Idempotency-Key": "validation-contract-001"},
    )
    assert validated.status_code == 200
    assert validated.json()["valid"] is True
    assert validated.json()["diagnostics"] == []

    conflicted = await client.post(
        f"/api/v1/documents/{document_id}/drafts",
        json={**request, "baseRevision": "b" * 40},
        headers=headers,
    )
    assert conflicted.status_code == 409
    assert conflicted.json()["code"] == "DOCUMENT_REVISION_CONFLICT"
    assert conflicted.json()["currentRevision"] == current_revision
    assert conflicted.json()["currentSource"] == "# Project Context\n"
    assert conflicted.json()["draftSource"] == request["content"]


async def test_structured_error_and_request_id_contract(client: AsyncClient) -> None:
    response = await client.get(
        "/api/v1/projects/missing-project",
        headers={REQUEST_ID_HEADER: "request-contract-001"},
    )
    assert response.status_code == 404
    assert response.headers[REQUEST_ID_HEADER] == "request-contract-001"
    assert response.json() == {
        "code": "PROJECT_NOT_FOUND",
        "title": "프로젝트를 찾을 수 없습니다",
        "detail": "프로젝트 'missing-project'이(가) 등록되어 있지 않습니다.",
        "traceId": "request-contract-001",
    }

    generated = await client.get("/health/live", headers={REQUEST_ID_HEADER: "unsafe request id"})
    assert generated.headers[REQUEST_ID_HEADER] != "unsafe request id"


async def test_cors_allows_only_configured_origin(client: AsyncClient) -> None:
    allowed = await client.options(
        "/api/v1/projects/apc-monitoring-mvp",
        headers={
            "Origin": "https://console.example.com",
            "Access-Control-Request-Method": "GET",
            "Access-Control-Request-Headers": REQUEST_ID_HEADER,
        },
    )
    assert allowed.status_code == 200
    assert allowed.headers["access-control-allow-origin"] == "https://console.example.com"
    assert allowed.headers.get("access-control-allow-credentials") is None

    denied = await client.options(
        "/api/v1/projects/apc-monitoring-mvp",
        headers={"Origin": "https://attacker.example.com", "Access-Control-Request-Method": "GET"},
    )
    assert denied.status_code == 400
    assert "access-control-allow-origin" not in denied.headers


async def test_openapi_exposes_versioned_document_workflow(client: AsyncClient) -> None:
    schema = (await client.get("/api/openapi.json")).json()
    assert set(schema["paths"]) == {
        "/health/live",
        "/health/ready",
        "/api/v1/projects/{project_id}",
        "/api/v1/projects/{project_id}/documents",
        "/api/v1/documents/{document_id}",
        "/api/v1/documents/{document_id}/drafts",
        "/api/v1/documents/{document_id}/validate",
        "/api/v1/projects/{project_id}/changes/{change_id}/review-workspace",
        "/api/v1/changes/{change_id}/reviews",
        "/api/v1/changes/{change_id}/verifications",
        "/api/v1/changes/{change_id}/transitions",
        "/api/v1/projects/{project_id}/changes/{change_id}/activation-workspace",
        "/api/v1/changes/{change_id}/git-publications",
        "/api/v1/changes/{change_id}/activations",
    }
    assert all(not path.startswith("/api/v1/auth/") for path in schema["paths"])
    assert set(schema["paths"]["/api/v1/projects/{project_id}"].keys()) == {"get"}
    assert set(schema["paths"]["/api/v1/documents/{document_id}/drafts"].keys()) == {"post"}
    assert schema["info"]["version"] == "0.1.0"


async def test_review_verification_and_ready_gate_contract(client: AsyncClient) -> None:
    workspace_path = "/api/v1/projects/apc-monitoring-mvp/changes/CR-DEMO-001/review-workspace"
    initial = await client.get(workspace_path)
    assert initial.status_code == 200
    assert initial.json()["decisionCapabilities"]["APPROVED"]["allowed"] is True
    assert initial.json()["verificationGate"]["ready"] is False
    assert len(initial.json()["diff"]["semantic"]) == 8

    review_payload = {
        "projectId": "apc-monitoring-mvp",
        "decision": "APPROVED",
        "proposalRevision": 1,
        "scopeFingerprint": "revision=1|scope=apc-monitoring-last-received-at-v1",
        "comment": "범위와 수용 기준을 확인했습니다.",
    }
    approved = await client.post(
        "/api/v1/changes/CR-DEMO-001/reviews",
        json=review_payload,
        headers={"X-Actor-Id": "user-review-01", "Idempotency-Key": "review-contract-001"},
    )
    assert approved.status_code == 200
    assert approved.json()["status"] == "APPROVED"

    # The same command is replay-safe and does not append a second audit event.
    replayed = await client.post(
        "/api/v1/changes/CR-DEMO-001/reviews",
        json=review_payload,
        headers={"X-Actor-Id": "user-review-01", "Idempotency-Key": "review-contract-001"},
    )
    assert replayed.status_code == 200
    assert len(replayed.json()["auditEvents"]) == len(approved.json()["auditEvents"])

    reused = await client.post(
        "/api/v1/changes/CR-DEMO-001/reviews",
        json={**review_payload, "decision": "REJECTED"},
        headers={"X-Actor-Id": "user-review-01", "Idempotency-Key": "review-contract-001"},
    )
    assert reused.status_code == 409
    assert reused.json()["code"] == "IDEMPOTENCY_KEY_REUSED"

    async def transition(target: str, key: str) -> Response:
        return await client.post(
            "/api/v1/changes/CR-DEMO-001/transitions",
            json={"projectId": "apc-monitoring-mvp", "target": target},
            headers={"X-Actor-Id": "user-review-01", "Idempotency-Key": key},
        )

    assert (await transition("IMPLEMENTING", "transition-contract-001")).json()["implementationRevision"] == 1
    assert (await transition("VERIFYING", "transition-contract-002")).json()["status"] == "VERIFYING"
    blocked = await transition("READY_TO_ACTIVATE", "transition-contract-blocked")
    assert blocked.status_code == 409
    assert blocked.json()["code"] == "REQUIRED_EVIDENCE_NOT_EXECUTED"

    for test_id, actor_id, key in (
        ("QA-DEMO-AUTO-01", "system-ci-01", "evidence-contract-auto"),
        ("QA-DEMO-MANUAL-01", "user-review-01", "evidence-contract-manual"),
    ):
        evidence = await client.post(
            "/api/v1/changes/CR-DEMO-001/verifications",
            json={"projectId": "apc-monitoring-mvp", "testId": test_id, "result": "PASSED"},
            headers={"X-Actor-Id": actor_id, "Idempotency-Key": key},
        )
        assert evidence.status_code == 200

    ready = await transition("READY_TO_ACTIVATE", "transition-contract-ready")
    assert ready.status_code == 200
    assert ready.json()["status"] == "READY_TO_ACTIVATE"
    assert ready.json()["verificationGate"] == {
        "ready": True,
        "blockers": [],
        "currentEvidence": ready.json()["verificationGate"]["currentEvidence"],
    }


async def test_server_rbac_self_approval_and_stale_scope_contract(client: AsyncClient) -> None:
    request = {
        "projectId": "apc-monitoring-mvp",
        "decision": "APPROVED",
        "proposalRevision": 1,
        "scopeFingerprint": "revision=1|scope=apc-monitoring-last-received-at-v1",
        "comment": "승인합니다.",
    }
    self_approval = await client.post(
        "/api/v1/changes/CR-DEMO-001/reviews",
        json=request,
        headers={"X-Actor-Id": "user-planning-01", "Idempotency-Key": "review-self-approval"},
    )
    assert self_approval.status_code == 403
    assert self_approval.json()["code"] == "SELF_APPROVAL_FORBIDDEN"
    audited = await client.get("/api/v1/projects/apc-monitoring-mvp/changes/CR-DEMO-001/review-workspace")
    denied_event = audited.json()["auditEvents"][-1]
    assert denied_event["action"] == "command.denied"
    assert denied_event["actorId"] == "user-planning-01"
    assert denied_event["after"]["errorCode"] == "SELF_APPROVAL_FORBIDDEN"

    stale = await client.post(
        "/api/v1/changes/CR-DEMO-001/reviews",
        json={**request, "proposalRevision": 2},
        headers={"X-Actor-Id": "user-review-01", "Idempotency-Key": "review-stale-scope"},
    )
    assert stale.status_code == 409
    assert stale.json()["code"] == "REVIEW_SCOPE_STALE"

    reused = await client.post(
        "/api/v1/changes/CR-DEMO-001/reviews",
        json={**request, "decision": "REJECTED"},
        headers={"X-Actor-Id": "user-review-01", "Idempotency-Key": "review-stale-scope"},
    )
    # Failed commands do not reserve the idempotency key, so the valid later command is evaluated normally.
    assert reused.status_code == 200
    assert reused.json()["status"] == "REJECTED"


async def test_git_publication_and_context_activation_contract(client: AsyncClient) -> None:
    review = {
        "projectId": "apc-monitoring-mvp",
        "decision": "APPROVED",
        "proposalRevision": 1,
        "scopeFingerprint": "revision=1|scope=apc-monitoring-last-received-at-v1",
        "comment": "활성화 범위를 승인합니다.",
    }
    headers = {"X-Actor-Id": "user-review-01"}
    await client.post(
        "/api/v1/changes/CR-DEMO-001/reviews",
        json=review,
        headers={**headers, "Idempotency-Key": "activation-review-001"},
    )
    for target, key in (("IMPLEMENTING", "activation-implement"), ("VERIFYING", "activation-verify")):
        await client.post(
            "/api/v1/changes/CR-DEMO-001/transitions",
            json={"projectId": "apc-monitoring-mvp", "target": target},
            headers={**headers, "Idempotency-Key": key},
        )
    for test_id, actor, key in (
        ("QA-DEMO-AUTO-01", "system-ci-01", "activation-auto"),
        ("QA-DEMO-MANUAL-01", "user-review-01", "activation-manual"),
    ):
        await client.post(
            "/api/v1/changes/CR-DEMO-001/verifications",
            json={"projectId": "apc-monitoring-mvp", "testId": test_id, "result": "PASSED"},
            headers={"X-Actor-Id": actor, "Idempotency-Key": key},
        )
    await client.post(
        "/api/v1/changes/CR-DEMO-001/transitions",
        json={"projectId": "apc-monitoring-mvp", "target": "READY_TO_ACTIVATE"},
        headers={**headers, "Idempotency-Key": "activation-ready"},
    )

    publication_payload = {
        "projectId": "apc-monitoring-mvp",
        "expectedBaseCommitSha": "a" * 40,
        "proposalRevision": 1,
        "scopeFingerprint": "revision=1|scope=apc-monitoring-last-received-at-v1",
        "implementationRevision": 1,
    }
    published = await client.post(
        "/api/v1/changes/CR-DEMO-001/git-publications",
        json=publication_payload,
        headers={**headers, "Idempotency-Key": "activation-publish"},
    )
    assert published.status_code == 200
    assert published.json()["publication"]["branch"] == "context/cr-demo-001-r1"
    assert {item["commitSha"] for item in published.json()["evidence"]} == {"b" * 40}

    denied = await client.post(
        "/api/v1/changes/CR-DEMO-001/activations",
        json={"projectId": "apc-monitoring-mvp", "version": "context-v1.4", "documentIds": ["DOC-APC-CONTEXT"]},
        headers={**headers, "Idempotency-Key": "activation-denied"},
    )
    assert denied.status_code == 403
    assert denied.json()["code"] == "ACTIVATION_PERMISSION_DENIED"

    activated = await client.post(
        "/api/v1/changes/CR-DEMO-001/activations",
        json={
            "projectId": "apc-monitoring-mvp",
            "version": "context-v1.4",
            "documentIds": ["DOC-APC-CONTEXT", "DOC-APC-QA"],
        },
        headers={"X-Actor-Id": "user-admin-01", "Idempotency-Key": "activation-complete"},
    )
    assert activated.status_code == 200
    assert activated.json()["status"] == "ACTIVATED"
    assert activated.json()["contextVersion"]["sourceCommitSha"] == "b" * 40
