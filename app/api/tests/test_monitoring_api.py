from datetime import datetime, timedelta, timezone

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.monitoring.services import get_monitoring_service

KST = timezone(timedelta(hours=9))


def today_kst() -> str:
    return datetime.now(KST).date().isoformat()


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
    assert body["generatedAt"].startswith(today_kst())
    assert body["matrix"][0]["traceId"] == "trace-jungmun-citrus-clsfy"
    assert body["matrix"][0]["status"] == "ERROR"


def test_get_ingestions_with_required_date_range(client: TestClient) -> None:
    response = client.get(
        "/api/monitoring/ingestions",
        params={
            "startDate": today_kst(),
            "endDate": today_kst(),
            "apc": "JUNGMUN",
            "snpSe": "CLSFY",
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert len(body["items"]) == 1
    assert body["items"][0]["status"] == "ERROR"
    assert body["items"][0]["refinedSaved"] is False
    assert body["items"][0]["lastReceivedAt"].startswith(today_kst())


def test_viewer_ingestions_mask_restricted_paths(client: TestClient) -> None:
    response = client.get(
        "/api/monitoring/ingestions",
        headers={"X-User-Role": "VIEWER"},
        params={
            "startDate": today_kst(),
            "endDate": today_kst(),
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
            "startDate": today_kst(),
            "endDate": today_kst(),
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
            "startDate": today_kst(),
            "endDate": today_kst(),
            "issueType": "REFINED_FAILED",
            "issueStatus": "OPEN",
            "severity": "HIGH",
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert len(body["items"]) == 1
    assert body["items"][0]["issueId"] == "issue-jungmun-refined-failed"
    assert body["items"][0]["lastOccurredAt"].startswith(today_kst())


def test_get_quality_issues_covers_all_mvp_issue_types(client: TestClient) -> None:
    response = client.get(
        "/api/monitoring/issues",
        params={
            "startDate": today_kst(),
            "endDate": today_kst(),
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
    body = response.json()
    assert body["relatedIssueIds"] == ["issue-jungmun-refined-failed"]
    assert body["startedAt"].startswith(today_kst())

    missing_response = client.get("/api/monitoring/pipeline/missing-trace")

    assert missing_response.status_code == 404
    assert missing_response.json()["detail"]["code"] == "PIPELINE_TRACE_NOT_FOUND"


def test_mock_write_endpoints_are_not_exposed(client: TestClient) -> None:
    action_response = client.post(
        "/api/monitoring/issues/issue-jungmun-refined-failed/actions",
        json={
            "nextStatus": "IN_PROGRESS",
            "assignee": "운영 담당자",
            "memo": "중문 선별 정제 실패 확인 중",
        },
    )
    rules_response = client.get("/api/monitoring/rules")

    assert action_response.status_code == 404
    assert rules_response.status_code == 404
