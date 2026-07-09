from datetime import datetime

from pydantic import BaseModel, Field

from app.monitoring.schemas.enums import ApcName, CropType, SnpSe


class SeverityPolicy(BaseModel):
    high: str
    medium: str
    low: str


class RuleChangeHistoryItem(BaseModel):
    changed_at: datetime = Field(alias="changedAt")
    changed_by: str = Field(alias="changedBy")
    reason: str
    before: dict[str, str | int | bool | list[str] | None]
    after: dict[str, str | int | bool | list[str] | None]


class MonitoringRuleItem(BaseModel):
    rule_id: str = Field(alias="ruleId")
    apc: ApcName
    crop: CropType
    snp_se: SnpSe = Field(alias="snpSe")
    expected_interval_minutes: int | None = Field(
        default=None, alias="expectedIntervalMinutes", ge=0
    )
    allowed_delay_minutes: int | None = Field(
        default=None, alias="allowedDelayMinutes", ge=0
    )
    required_fields: list[str] = Field(default_factory=list, alias="requiredFields")
    duplicate_keys: list[str] = Field(default_factory=list, alias="duplicateKeys")
    severity_policy: SeverityPolicy = Field(alias="severityPolicy")
    is_editable: bool = Field(alias="isEditable")
    last_updated_by: str | None = Field(default=None, alias="lastUpdatedBy")
    last_updated_at: datetime | None = Field(default=None, alias="lastUpdatedAt")
    change_history: list[RuleChangeHistoryItem] = Field(
        default_factory=list, alias="changeHistory"
    )


class MonitoringRuleResponse(BaseModel):
    generated_at: datetime = Field(alias="generatedAt")
    items: list[MonitoringRuleItem]


class UpdateMonitoringRuleRequest(BaseModel):
    expected_interval_minutes: int | None = Field(
        default=None, alias="expectedIntervalMinutes", ge=0
    )
    allowed_delay_minutes: int | None = Field(
        default=None, alias="allowedDelayMinutes", ge=0
    )
    required_fields: list[str] = Field(default_factory=list, alias="requiredFields")
    duplicate_keys: list[str] = Field(default_factory=list, alias="duplicateKeys")
    reason: str = Field(min_length=1)
