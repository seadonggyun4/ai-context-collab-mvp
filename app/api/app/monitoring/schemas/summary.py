from datetime import date as dt_date, datetime

from pydantic import BaseModel, Field

from app.monitoring.schemas.common import RecentIssueItem, StatusDistributionItem
from app.monitoring.schemas.enums import ApcName, CropType, MonitoringStatus, SnpSe


class MonitoringSummaryQuery(BaseModel):
    date: dt_date | None = None
    apc: ApcName | None = None
    crop: CropType | None = None
    snp_se: SnpSe | None = Field(default=None, alias="snpSe")
    status: MonitoringStatus | None = None


class MonitoringKpis(BaseModel):
    total_apc_count: int = Field(alias="totalApcCount", ge=0)
    normal_apc_count: int = Field(alias="normalApcCount", ge=0)
    delayed_apc_count: int = Field(alias="delayedApcCount", ge=0)
    error_apc_count: int = Field(alias="errorApcCount", ge=0)
    missing_apc_count: int = Field(alias="missingApcCount", ge=0)


class MatrixCell(BaseModel):
    apc: ApcName
    crop: CropType
    snp_se: SnpSe = Field(alias="snpSe")
    status: MonitoringStatus
    label: str
    trace_id: str | None = Field(default=None, alias="traceId")
    issue_count: int = Field(default=0, alias="issueCount", ge=0)


class MonitoringSummaryResponse(BaseModel):
    generated_at: datetime = Field(alias="generatedAt")
    kpis: MonitoringKpis
    matrix: list[MatrixCell]
    recent_issues: list[RecentIssueItem] = Field(alias="recentIssues")
    status_distribution: list[StatusDistributionItem] = Field(alias="statusDistribution")
