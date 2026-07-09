from datetime import datetime

from pydantic import BaseModel, Field

from app.monitoring.schemas.enums import (
    ApcName,
    CropType,
    MonitoringStatus,
    PipelineStepKey,
    PipelineStepStatus,
    SnpSe,
)


class PipelineStepItem(BaseModel):
    step_key: PipelineStepKey = Field(alias="stepKey")
    step_label: str = Field(alias="stepLabel")
    status: PipelineStepStatus
    checked_at: datetime | None = Field(default=None, alias="checkedAt")
    message: str
    dag_id: str | None = Field(default=None, alias="dagId")
    task_id: str | None = Field(default=None, alias="taskId")
    log_preview: str | None = Field(default=None, alias="logPreview")
    next_action: str | None = Field(default=None, alias="nextAction")


class PipelineTraceResponse(BaseModel):
    trace_id: str = Field(alias="traceId")
    apc: ApcName
    crop: CropType
    snp_se: SnpSe = Field(alias="snpSe")
    status: MonitoringStatus
    started_at: datetime | None = Field(default=None, alias="startedAt")
    ended_at: datetime | None = Field(default=None, alias="endedAt")
    steps: list[PipelineStepItem]
    related_issue_ids: list[str] = Field(default_factory=list, alias="relatedIssueIds")
    recommended_action: str | None = Field(default=None, alias="recommendedAction")
