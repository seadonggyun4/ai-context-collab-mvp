import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.monitoring.services import get_monitoring_service


@pytest.fixture(autouse=True)
def reset_monitoring_service() -> None:
    get_monitoring_service.cache_clear()
    yield
    get_monitoring_service.cache_clear()


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


def test_get_monitoring_summary(client: TestClient) -> None:
    response = client.get("/api/monitoring/summary", params={"status": "ERROR"})

    assert response.status_code == 200
    body = response.json()
    assert body["generatedAt"] == "2026-07-09T09:30:00+09:00"
    assert body["matrix"][0]["traceId"] == "trace-jungmun-citrus-clsfy"
    assert body["matrix"][0]["status"] == "ERROR"


def test_get_ingestions_with_required_date_range(client: TestClient) -> None:
    response = client.get(
        "/api/monitoring/ingestions",
        params={
            "startDate": "2026-07-09",
            "endDate": "2026-07-09",
            "apc": "JUNGMUN",
            "snpSe": "CLSFY",
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert len(body["items"]) == 1
    assert body["items"][0]["status"] == "ERROR"
    assert body["items"][0]["refinedSaved"] is False


def test_viewer_ingestions_mask_restricted_paths(client: TestClient) -> None:
    response = client.get(
        "/api/monitoring/ingestions",
        headers={"X-User-Role": "VIEWER"},
        params={
            "startDate": "2026-07-09",
            "endDate": "2026-07-09",
            "apc": "NAMWON",
        },
    )

    assert response.status_code == 200
    item = response.json()["items"][0]
    assert item["originPath"] == "••••/restricted"
    assert item["refinedPath"] == "••••/restricted"


def test_operator_can_view_ingestion_paths(client: TestClient) -> None:
    response = client.get(
        "/api/monitoring/ingestions",
        headers={"X-User-Role": "OPERATOR"},
        params={
            "startDate": "2026-07-09",
            "endDate": "2026-07-09",
            "apc": "NAMWON",
        },
    )

    assert response.status_code == 200
    item = response.json()["items"][0]
    assert item["originPath"].startswith("origin/")
    assert item["refinedPath"].startswith("refined/")


def test_get_quality_issues_with_filters(client: TestClient) -> None:
    response = client.get(
        "/api/monitoring/issues",
        params={
            "startDate": "2026-07-09",
            "endDate": "2026-07-09",
            "issueType": "REFINED_FAILED",
            "issueStatus": "OPEN",
            "severity": "HIGH",
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert len(body["items"]) == 1
    assert body["items"][0]["issueId"] == "issue-jungmun-refined-failed"


def test_get_quality_issues_covers_all_mvp_issue_types(client: TestClient) -> None:
    response = client.get(
        "/api/monitoring/issues",
        params={
            "startDate": "2026-07-09",
            "endDate": "2026-07-09",
        },
    )

    assert response.status_code == 200
    issue_types = {item["issueType"] for item in response.json()["items"]}
    assert issue_types == {
        "REQUIRED_FIELD_MISSING",
        "INVALID_FORMAT",
        "DUPLICATE_SUSPECTED",
        "OUTLIER_QUANTITY_WEIGHT",
        "UNSUPPORTED_APC_CROP",
        "REFINED_FAILED",
    }


def test_get_pipeline_trace_and_missing_trace(client: TestClient) -> None:
    response = client.get("/api/monitoring/pipeline/trace-jungmun-citrus-clsfy")

    assert response.status_code == 200
    assert response.json()["relatedIssueIds"] == ["issue-jungmun-refined-failed"]

    missing_response = client.get("/api/monitoring/pipeline/missing-trace")

    assert missing_response.status_code == 404
    assert missing_response.json()["detail"]["code"] == "PIPELINE_TRACE_NOT_FOUND"


def test_create_issue_action_updates_memory_state(client: TestClient) -> None:
    response = client.post(
        "/api/monitoring/issues/issue-jungmun-refined-failed/actions",
        json={
            "nextStatus": "IN_PROGRESS",
            "assignee": "운영 담당자",
            "memo": "중문 선별 정제 실패 확인 중",
        },
    )

    assert response.status_code == 201
    body = response.json()
    assert body["issueId"] == "issue-jungmun-refined-failed"
    assert body["previousStatus"] == "OPEN"
    assert body["nextStatus"] == "IN_PROGRESS"

    actions_response = client.get(
        "/api/monitoring/actions",
        params={"issueId": "issue-jungmun-refined-failed", "status": "IN_PROGRESS"},
    )

    assert actions_response.status_code == 200
    assert actions_response.json()["items"][-1]["memo"] == "중문 선별 정제 실패 확인 중"


def test_update_monitoring_rule(client: TestClient) -> None:
    response = client.put(
        "/api/monitoring/rules/rule-jungmun-citrus-clsfy",
        json={
            "expectedIntervalMinutes": 45,
            "allowedDelayMinutes": 20,
            "requiredFields": ["apc", "crop", "snpSe", "quantity", "weight"],
            "duplicateKeys": ["apc", "crop", "snpSe", "receivedAt"],
            "reason": "중문 선별 데이터 수신 주기 조정",
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert body["expectedIntervalMinutes"] == 45
    assert body["allowedDelayMinutes"] == 20
    assert body["lastUpdatedBy"] == "MVP 관리자"
    assert body["changeHistory"][0]["reason"] == "중문 선별 데이터 수신 주기 조정"


def test_non_admin_rules_are_readonly(client: TestClient) -> None:
    response = client.get(
        "/api/monitoring/rules",
        headers={"X-User-Role": "OPERATOR"},
    )

    assert response.status_code == 200
    assert {item["isEditable"] for item in response.json()["items"]} == {False}


def test_non_admin_cannot_update_monitoring_rule(client: TestClient) -> None:
    response = client.put(
        "/api/monitoring/rules/rule-jungmun-citrus-clsfy",
        headers={"X-User-Role": "OPERATOR"},
        json={
            "expectedIntervalMinutes": 45,
            "allowedDelayMinutes": 20,
            "requiredFields": ["apc", "crop", "snpSe", "quantity", "weight"],
            "duplicateKeys": ["apc", "crop", "snpSe", "receivedAt"],
            "reason": "권한 없는 기준 변경 시도",
        },
    )

    assert response.status_code == 403
    assert response.json()["detail"]["code"] == "RULE_NOT_EDITABLE"
