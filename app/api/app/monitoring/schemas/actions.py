from datetime import datetime

from pydantic import BaseModel, Field

from app.monitoring.schemas.enums import ApcName, IssueStatus


class OperationActionQuery(BaseModel):
    issue_id: str | None = Field(default=None, alias="issueId")
    apc: ApcName | None = None
    status: IssueStatus | None = None
    assignee: str | None = None


class OperationActionItem(BaseModel):
    action_id: str = Field(alias="actionId")
    issue_id: str = Field(alias="issueId")
    created_at: datetime = Field(alias="createdAt")
    author: str
    previous_status: IssueStatus | None = Field(default=None, alias="previousStatus")
    next_status: IssueStatus = Field(alias="nextStatus")
    memo: str
    recurrence_count: int = Field(default=0, alias="recurrenceCount", ge=0)


class OperationActionResponse(BaseModel):
    generated_at: datetime = Field(alias="generatedAt")
    items: list[OperationActionItem]
