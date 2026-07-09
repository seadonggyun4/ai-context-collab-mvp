from datetime import date, datetime

from pydantic import BaseModel, Field

from app.monitoring.schemas.enums import (
    ApcName,
    CropType,
    IssueSeverity,
    IssueStatus,
    MonitoringStatus,
    SnpSe,
)


class DateRangeQuery(BaseModel):
    start_date: date = Field(alias="startDate")
    end_date: date = Field(alias="endDate")


class MonitoringFilterQuery(BaseModel):
    apc: ApcName | None = None
    crop: CropType | None = None
    snp_se: SnpSe | None = Field(default=None, alias="snpSe")
    status: MonitoringStatus | None = None


class IssueFilterQuery(DateRangeQuery, MonitoringFilterQuery):
    severity: IssueSeverity | None = None
    issue_type: str | None = Field(default=None, alias="issueType")
    issue_status: IssueStatus | None = Field(default=None, alias="issueStatus")


class StatusDistributionItem(BaseModel):
    status: MonitoringStatus
    label: str
    count: int = Field(ge=0)


class RecentIssueItem(BaseModel):
    issue_id: str = Field(alias="issueId")
    trace_id: str | None = Field(default=None, alias="traceId")
    occurred_at: datetime = Field(alias="occurredAt")
    apc: ApcName
    crop: CropType
    snp_se: SnpSe = Field(alias="snpSe")
    status: MonitoringStatus
    severity: IssueSeverity
    issue_type_label: str = Field(alias="issueTypeLabel")
    action_required: bool = Field(alias="actionRequired")


class ErrorResponse(BaseModel):
    code: str
    message: str
    detail: str | None = None
