from __future__ import annotations

import json
from copy import deepcopy
from functools import cached_property
from pathlib import Path
from typing import Any

from app.monitoring.schemas.actions import OperationActionResponse
from app.monitoring.schemas.actions import OperationActionItem
from app.monitoring.schemas.enums import (
    ApcName,
    CropType,
    IssueSeverity,
    IssueStatus,
    IssueType,
    MonitoringStatus,
    SnpSe,
    UserRole,
)
from app.monitoring.schemas.ingestion import IngestionStatusResponse
from app.monitoring.schemas.issues import CreateIssueActionRequest, QualityIssueResponse
from app.monitoring.schemas.pipeline import PipelineTraceResponse
from app.monitoring.schemas.rules import (
    MonitoringRuleItem,
    MonitoringRuleResponse,
    UpdateMonitoringRuleRequest,
)
from app.monitoring.schemas.summary import MonitoringSummaryResponse

STATUS_PRIORITY: dict[MonitoringStatus, int] = {
    MonitoringStatus.ERROR: 1,
    MonitoringStatus.MISSING: 2,
    MonitoringStatus.DELAYED: 3,
    MonitoringStatus.UNDEFINED_RULE: 4,
    MonitoringStatus.NORMAL: 5,
}


class FixtureNotFoundError(KeyError):
    pass


class FixturePermissionError(PermissionError):
    pass


class MonitoringFixtureRepository:
    def __init__(self, fixture_path: Path | None = None) -> None:
        self.fixture_path = fixture_path or self._default_fixture_path()

    @cached_property
    def data(self) -> dict[str, Any]:
        with self.fixture_path.open(encoding="utf-8") as file:
            return json.load(file)

    def get_summary(
        self,
        *,
        apc: ApcName | None = None,
        crop: CropType | None = None,
        snp_se: SnpSe | None = None,
        status: MonitoringStatus | None = None,
    ) -> MonitoringSummaryResponse:
        payload = deepcopy(self.data["summary"])
        payload["matrix"] = [
            item
            for item in payload["matrix"]
            if self._matches_monitoring_filter(item, apc, crop, snp_se, status)
        ]
        payload["recentIssues"] = [
            item
            for item in payload["recentIssues"]
            if self._matches_monitoring_filter(item, apc, crop, snp_se, status)
        ]
        return MonitoringSummaryResponse(**payload)

    def get_ingestions(
        self,
        *,
        apc: ApcName | None = None,
        crop: CropType | None = None,
        snp_se: SnpSe | None = None,
        status: MonitoringStatus | None = None,
        user_role: UserRole = UserRole.ADMIN,
    ) -> IngestionStatusResponse:
        payload = deepcopy(self.data["ingestions"])
        payload["items"] = sorted(
            [
                item
                for item in payload["items"]
                if self._matches_monitoring_filter(item, apc, crop, snp_se, status)
            ],
            key=lambda item: (
                STATUS_PRIORITY[MonitoringStatus(item["status"])],
                -int(item.get("delayMinutes") or 0),
            ),
        )
        if user_role == UserRole.VIEWER:
            payload["items"] = [
                self._mask_restricted_ingestion_paths(item) for item in payload["items"]
            ]
        return IngestionStatusResponse(**payload)

    def get_issues(
        self,
        *,
        apc: ApcName | None = None,
        crop: CropType | None = None,
        snp_se: SnpSe | None = None,
        issue_type: IssueType | None = None,
        issue_status: IssueStatus | None = None,
        severity: IssueSeverity | None = None,
    ) -> QualityIssueResponse:
        payload = deepcopy(self.data["issues"])
        payload["items"] = [
            item
            for item in payload["items"]
            if self._matches_issue_filter(
                item, apc, crop, snp_se, issue_type, issue_status, severity
            )
        ]
        return QualityIssueResponse(**payload)

    def get_pipeline_trace(self, trace_id: str) -> PipelineTraceResponse:
        for item in self.data["pipelineTraces"]:
            if item["traceId"] == trace_id:
                return PipelineTraceResponse(**deepcopy(item))
        raise FixtureNotFoundError(trace_id)

    def get_actions(
        self,
        *,
        issue_id: str | None = None,
        apc: ApcName | None = None,
        status: IssueStatus | None = None,
        assignee: str | None = None,
    ) -> OperationActionResponse:
        payload = deepcopy(self.data["actions"])
        issues_by_id = {item["issueId"]: item for item in self.data["issues"]["items"]}

        def matches(item: dict[str, Any]) -> bool:
            issue = issues_by_id.get(item["issueId"])
            return (
                (issue_id is None or item["issueId"] == issue_id)
                and (status is None or item["nextStatus"] == status)
                and (assignee is None or assignee in item.get("author", ""))
                and (apc is None or (issue is not None and issue["apc"] == apc))
            )

        payload["items"] = [item for item in payload["items"] if matches(item)]
        return OperationActionResponse(**payload)

    def create_issue_action(
        self, issue_id: str, request: CreateIssueActionRequest
    ) -> OperationActionItem:
        issue = self._find_issue(issue_id)
        action_payload = {
            "actionId": f"action-mvp-{len(self.data['actions']['items']) + 1:03d}",
            "issueId": issue_id,
            "createdAt": self.data["metadata"]["generatedAt"],
            "author": request.assignee,
            "previousStatus": issue["status"],
            "nextStatus": request.next_status,
            "memo": request.memo,
            "recurrenceCount": self._count_issue_actions(issue_id),
        }

        self.data["actions"]["items"].append(action_payload)
        issue["status"] = request.next_status

        return OperationActionItem(**deepcopy(action_payload))

    def get_rules(
        self,
        *,
        apc: ApcName | None = None,
        crop: CropType | None = None,
        snp_se: SnpSe | None = None,
        user_role: UserRole = UserRole.ADMIN,
    ) -> MonitoringRuleResponse:
        payload = deepcopy(self.data["rules"])
        payload["items"] = [
            item
            for item in payload["items"]
            if self._matches_monitoring_filter(item, apc, crop, snp_se, None)
        ]
        if user_role != UserRole.ADMIN:
            payload["items"] = [self._mark_rule_readonly(item) for item in payload["items"]]
        return MonitoringRuleResponse(**payload)

    def update_rule(
        self,
        rule_id: str,
        request: UpdateMonitoringRuleRequest,
        *,
        user_role: UserRole = UserRole.ADMIN,
    ) -> MonitoringRuleItem:
        rule = self._find_rule(rule_id)
        if user_role != UserRole.ADMIN:
            raise FixturePermissionError(f"{rule_id}: role {user_role} cannot edit rules")
        if not rule["isEditable"]:
            raise FixturePermissionError(rule_id)

        before = {
            "expectedIntervalMinutes": rule.get("expectedIntervalMinutes"),
            "allowedDelayMinutes": rule.get("allowedDelayMinutes"),
            "requiredFields": deepcopy(rule.get("requiredFields", [])),
            "duplicateKeys": deepcopy(rule.get("duplicateKeys", [])),
        }
        after = request.model_dump(by_alias=True, exclude={"reason"})

        rule.update(after)
        rule["lastUpdatedBy"] = "MVP 관리자"
        rule["lastUpdatedAt"] = self.data["metadata"]["generatedAt"]
        rule.setdefault("changeHistory", []).insert(
            0,
            {
                "changedAt": self.data["metadata"]["generatedAt"],
                "changedBy": "MVP 관리자",
                "reason": request.reason,
                "before": before,
                "after": after,
            },
        )

        return MonitoringRuleItem(**deepcopy(rule))

    @staticmethod
    def _mask_restricted_ingestion_paths(item: dict[str, Any]) -> dict[str, Any]:
        masked = deepcopy(item)
        if masked.get("originPath"):
            masked["originPath"] = "••••/restricted"
        if masked.get("refinedPath"):
            masked["refinedPath"] = "••••/restricted"
        return masked

    @staticmethod
    def _mark_rule_readonly(item: dict[str, Any]) -> dict[str, Any]:
        readonly = deepcopy(item)
        readonly["isEditable"] = False
        return readonly

    def validate_all(self) -> None:
        self.get_summary()
        self.get_ingestions()
        self.get_issues()
        for item in self.data["pipelineTraces"]:
            self.get_pipeline_trace(item["traceId"])
        self.get_actions()
        self.get_rules()

    def _find_issue(self, issue_id: str) -> dict[str, Any]:
        for item in self.data["issues"]["items"]:
            if item["issueId"] == issue_id:
                return item
        raise FixtureNotFoundError(issue_id)

    def _find_rule(self, rule_id: str) -> dict[str, Any]:
        for item in self.data["rules"]["items"]:
            if item["ruleId"] == rule_id:
                return item
        raise FixtureNotFoundError(rule_id)

    def _count_issue_actions(self, issue_id: str) -> int:
        return sum(1 for item in self.data["actions"]["items"] if item["issueId"] == issue_id)

    @staticmethod
    def _matches_monitoring_filter(
        item: dict[str, Any],
        apc: ApcName | None,
        crop: CropType | None,
        snp_se: SnpSe | None,
        status: MonitoringStatus | None,
    ) -> bool:
        return (
            (apc is None or item.get("apc") == apc)
            and (crop is None or item.get("crop") == crop)
            and (snp_se is None or item.get("snpSe") == snp_se)
            and (status is None or item.get("status") == status)
        )

    @classmethod
    def _matches_issue_filter(
        cls,
        item: dict[str, Any],
        apc: ApcName | None,
        crop: CropType | None,
        snp_se: SnpSe | None,
        issue_type: IssueType | None,
        issue_status: IssueStatus | None,
        severity: IssueSeverity | None,
    ) -> bool:
        return (
            cls._matches_monitoring_filter(item, apc, crop, snp_se, None)
            and (issue_type is None or item.get("issueType") == issue_type)
            and (issue_status is None or item.get("status") == issue_status)
            and (severity is None or item.get("severity") == severity)
        )

    @staticmethod
    def _default_fixture_path() -> Path:
        return (
            Path(__file__).resolve().parents[4]
            / "shared"
            / "fixtures"
            / "monitoring_fixture.json"
        )
