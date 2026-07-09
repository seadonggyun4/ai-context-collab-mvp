from datetime import datetime

from pydantic import BaseModel, Field

from app.monitoring.schemas.common import IssueFilterQuery
from app.monitoring.schemas.enums import (
    ApcName,
    CropType,
    IssueSeverity,
    IssueStatus,
    IssueType,
    SnpSe,
)


class QualityIssueQuery(IssueFilterQuery):
    pass


class SampleRow(BaseModel):
    row_id: str = Field(alias="rowId")
    values: dict[str, str | int | float | None]


class QualityIssueItem(BaseModel):
    issue_id: str = Field(alias="issueId")
    trace_id: str | None = Field(default=None, alias="traceId")
    status: IssueStatus
    severity: IssueSeverity
    apc: ApcName
    crop: CropType
    snp_se: SnpSe = Field(alias="snpSe")
    issue_type: IssueType = Field(alias="issueType")
    issue_type_label: str = Field(alias="issueTypeLabel")
    affected_count: int = Field(alias="affectedCount", ge=0)
    first_occurred_at: datetime = Field(alias="firstOccurredAt")
    last_occurred_at: datetime = Field(alias="lastOccurredAt")
    assignee: str | None = None
    download_risk: bool = Field(alias="downloadRisk")
    summary: str
    impact_range: str = Field(alias="impactRange")
    recommended_action: str = Field(alias="recommendedAction")
    sample_rows: list[SampleRow] = Field(default_factory=list, alias="sampleRows")


class QualityIssueResponse(BaseModel):
    generated_at: datetime = Field(alias="generatedAt")
    items: list[QualityIssueItem]


class CreateIssueActionRequest(BaseModel):
    next_status: IssueStatus = Field(alias="nextStatus")
    assignee: str
    memo: str = Field(min_length=1)
