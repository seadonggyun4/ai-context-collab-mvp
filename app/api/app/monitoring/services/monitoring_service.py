from __future__ import annotations

from functools import lru_cache

from app.monitoring.repositories import MonitoringFixtureRepository
from app.monitoring.schemas.actions import OperationActionItem, OperationActionResponse
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


class MonitoringService:
    def __init__(self, repository: MonitoringFixtureRepository) -> None:
        self.repository = repository

    def get_summary(
        self,
        *,
        apc: ApcName | None = None,
        crop: CropType | None = None,
        snp_se: SnpSe | None = None,
        status: MonitoringStatus | None = None,
    ) -> MonitoringSummaryResponse:
        return self.repository.get_summary(
            apc=apc,
            crop=crop,
            snp_se=snp_se,
            status=status,
        )

    def get_ingestions(
        self,
        *,
        apc: ApcName | None = None,
        crop: CropType | None = None,
        snp_se: SnpSe | None = None,
        status: MonitoringStatus | None = None,
        user_role: UserRole = UserRole.ADMIN,
    ) -> IngestionStatusResponse:
        return self.repository.get_ingestions(
            apc=apc,
            crop=crop,
            snp_se=snp_se,
            status=status,
            user_role=user_role,
        )

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
        return self.repository.get_issues(
            apc=apc,
            crop=crop,
            snp_se=snp_se,
            issue_type=issue_type,
            issue_status=issue_status,
            severity=severity,
        )

    def get_pipeline_trace(self, trace_id: str) -> PipelineTraceResponse:
        return self.repository.get_pipeline_trace(trace_id)

    def get_actions(
        self,
        *,
        issue_id: str | None = None,
        apc: ApcName | None = None,
        status: IssueStatus | None = None,
        assignee: str | None = None,
    ) -> OperationActionResponse:
        return self.repository.get_actions(
            issue_id=issue_id,
            apc=apc,
            status=status,
            assignee=assignee,
        )

    def create_issue_action(
        self, issue_id: str, request: CreateIssueActionRequest
    ) -> OperationActionItem:
        return self.repository.create_issue_action(issue_id, request)

    def get_rules(
        self,
        *,
        apc: ApcName | None = None,
        crop: CropType | None = None,
        snp_se: SnpSe | None = None,
        user_role: UserRole = UserRole.ADMIN,
    ) -> MonitoringRuleResponse:
        return self.repository.get_rules(
            apc=apc,
            crop=crop,
            snp_se=snp_se,
            user_role=user_role,
        )

    def update_rule(
        self,
        rule_id: str,
        request: UpdateMonitoringRuleRequest,
        *,
        user_role: UserRole = UserRole.ADMIN,
    ) -> MonitoringRuleItem:
        return self.repository.update_rule(rule_id, request, user_role=user_role)


@lru_cache(maxsize=1)
def get_monitoring_service() -> MonitoringService:
    return MonitoringService(MonitoringFixtureRepository())
