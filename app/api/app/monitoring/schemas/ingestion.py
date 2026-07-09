from datetime import datetime

from pydantic import BaseModel, Field

from app.monitoring.schemas.common import DateRangeQuery, MonitoringFilterQuery
from app.monitoring.schemas.enums import ApcName, CropType, MonitoringStatus, SnpSe


class IngestionStatusQuery(DateRangeQuery, MonitoringFilterQuery):
    pass


class IngestionStatusItem(BaseModel):
    ingestion_id: str = Field(alias="ingestionId")
    trace_id: str = Field(alias="traceId")
    apc: ApcName
    crop: CropType
    snp_se: SnpSe = Field(alias="snpSe")
    last_received_at: datetime | None = Field(default=None, alias="lastReceivedAt")
    expected_interval_minutes: int | None = Field(
        default=None, alias="expectedIntervalMinutes", ge=0
    )
    base_time: datetime = Field(alias="baseTime")
    delay_minutes: int = Field(default=0, alias="delayMinutes", ge=0)
    origin_saved: bool = Field(alias="originSaved")
    refined_saved: bool = Field(alias="refinedSaved")
    status: MonitoringStatus
    origin_path: str | None = Field(default=None, alias="originPath")
    refined_path: str | None = Field(default=None, alias="refinedPath")


class IngestionStatusResponse(BaseModel):
    generated_at: datetime = Field(alias="generatedAt")
    items: list[IngestionStatusItem]
