from datetime import date as dt_date
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.monitoring.auth import get_current_user_role
from app.monitoring.repositories import FixtureNotFoundError, FixturePermissionError
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
from app.monitoring.services import MonitoringService, get_monitoring_service

router = APIRouter(prefix="/monitoring", tags=["monitoring"])

SnpSeQuery = Annotated[SnpSe | None, Query(alias="snpSe")]
StartDateQuery = Annotated[dt_date, Query(alias="startDate")]
EndDateQuery = Annotated[dt_date, Query(alias="endDate")]
IssueTypeQuery = Annotated[IssueType | None, Query(alias="issueType")]
IssueStatusQuery = Annotated[IssueStatus | None, Query(alias="issueStatus")]
IssueIdQuery = Annotated[str | None, Query(alias="issueId")]
CurrentUserRole = Annotated[UserRole, Depends(get_current_user_role)]


@router.get("/summary", response_model=MonitoringSummaryResponse)
def get_summary(
    service: Annotated[MonitoringService, Depends(get_monitoring_service)],
    date: dt_date | None = None,
    apc: ApcName | None = None,
    crop: CropType | None = None,
    snp_se: SnpSeQuery = None,
    status: MonitoringStatus | None = None,
) -> MonitoringSummaryResponse:
    return service.get_summary(apc=apc, crop=crop, snp_se=snp_se, status=status)


@router.get("/ingestions", response_model=IngestionStatusResponse)
def get_ingestions(
    service: Annotated[MonitoringService, Depends(get_monitoring_service)],
    current_user_role: CurrentUserRole,
    start_date: StartDateQuery,
    end_date: EndDateQuery,
    apc: ApcName | None = None,
    crop: CropType | None = None,
    snp_se: SnpSeQuery = None,
    status: MonitoringStatus | None = None,
) -> IngestionStatusResponse:
    return service.get_ingestions(
        apc=apc,
        crop=crop,
        snp_se=snp_se,
        status=status,
        user_role=current_user_role,
    )


@router.get("/issues", response_model=QualityIssueResponse)
def get_issues(
    service: Annotated[MonitoringService, Depends(get_monitoring_service)],
    start_date: StartDateQuery,
    end_date: EndDateQuery,
    apc: ApcName | None = None,
    crop: CropType | None = None,
    snp_se: SnpSeQuery = None,
    issue_type: IssueTypeQuery = None,
    issue_status: IssueStatusQuery = None,
    severity: IssueSeverity | None = None,
) -> QualityIssueResponse:
    return service.get_issues(
        apc=apc,
        crop=crop,
        snp_se=snp_se,
        issue_type=issue_type,
        issue_status=issue_status,
        severity=severity,
    )


@router.get("/pipeline/{trace_id}", response_model=PipelineTraceResponse)
def get_pipeline_trace(
    trace_id: str,
    service: Annotated[MonitoringService, Depends(get_monitoring_service)],
) -> PipelineTraceResponse:
    try:
        return service.get_pipeline_trace(trace_id)
    except FixtureNotFoundError as error:
        raise _not_found("PIPELINE_TRACE_NOT_FOUND", str(error.args[0])) from error


@router.get("/actions", response_model=OperationActionResponse)
def get_actions(
    service: Annotated[MonitoringService, Depends(get_monitoring_service)],
    issue_id: IssueIdQuery = None,
    apc: ApcName | None = None,
    status: IssueStatus | None = None,
    assignee: str | None = None,
) -> OperationActionResponse:
    return service.get_actions(
        issue_id=issue_id,
        apc=apc,
        status=status,
        assignee=assignee,
    )


@router.post(
    "/issues/{issue_id}/actions",
    response_model=OperationActionItem,
    status_code=status.HTTP_201_CREATED,
)
def create_issue_action(
    issue_id: str,
    request: CreateIssueActionRequest,
    service: Annotated[MonitoringService, Depends(get_monitoring_service)],
) -> OperationActionItem:
    try:
        return service.create_issue_action(issue_id, request)
    except FixtureNotFoundError as error:
        raise _not_found("ISSUE_NOT_FOUND", str(error.args[0])) from error


@router.get("/rules", response_model=MonitoringRuleResponse)
def get_rules(
    service: Annotated[MonitoringService, Depends(get_monitoring_service)],
    current_user_role: CurrentUserRole,
    apc: ApcName | None = None,
    crop: CropType | None = None,
    snp_se: SnpSeQuery = None,
) -> MonitoringRuleResponse:
    return service.get_rules(apc=apc, crop=crop, snp_se=snp_se, user_role=current_user_role)


@router.put("/rules/{rule_id}", response_model=MonitoringRuleItem)
def update_rule(
    rule_id: str,
    request: UpdateMonitoringRuleRequest,
    service: Annotated[MonitoringService, Depends(get_monitoring_service)],
    current_user_role: CurrentUserRole,
) -> MonitoringRuleItem:
    try:
        return service.update_rule(rule_id, request, user_role=current_user_role)
    except FixtureNotFoundError as error:
        raise _not_found("RULE_NOT_FOUND", str(error.args[0])) from error
    except FixturePermissionError as error:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "code": "RULE_NOT_EDITABLE",
                "message": "This monitoring rule cannot be edited by the current role.",
                "detail": str(error.args[0]),
            },
        ) from error


def _not_found(code: str, detail: str) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail={
            "code": code,
            "message": "Requested monitoring resource was not found.",
            "detail": detail,
        },
    )
