"""Readiness contract kept outside infrastructure and delivery layers."""

from dataclasses import dataclass
from typing import Protocol


@dataclass(frozen=True, slots=True)
class ReadinessReport:
    ready: bool
    database: str
    migration: str
    security_store: str = "not_required"


class ReadinessProbe(Protocol):
    async def check(self) -> ReadinessReport: ...
