"""Project domain read model."""

from dataclasses import dataclass
from datetime import date, datetime
from enum import StrEnum


class ProjectHealth(StrEnum):
    ALIGNED = "ALIGNED"
    NEEDS_ATTENTION = "NEEDS_ATTENTION"
    UNVERIFIED = "UNVERIFIED"


@dataclass(frozen=True, slots=True)
class Project:
    id: str
    name: str
    description: str
    repository_url: str
    default_branch: str
    document_root: str
    active_context_version: str
    effective_date: date
    health: ProjectHealth
    created_at: datetime
    updated_at: datetime
