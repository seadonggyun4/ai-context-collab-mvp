"""Git-backed document domain read models."""

from dataclasses import dataclass
from datetime import datetime
from enum import StrEnum


class DocumentFormat(StrEnum):
    MARKDOWN = "MARKDOWN"
    YAML = "YAML"


@dataclass(frozen=True, slots=True)
class DocumentSummary:
    id: str
    project_id: str
    path: str
    title: str
    format: DocumentFormat
    revision: str
    size_bytes: int


@dataclass(frozen=True, slots=True)
class DocumentDetail:
    id: str
    project_id: str
    path: str
    title: str
    format: DocumentFormat
    revision: str
    size_bytes: int
    source: str


class DiagnosticSeverity(StrEnum):
    ERROR = "ERROR"
    WARNING = "WARNING"
    INFO = "INFO"


@dataclass(frozen=True, slots=True)
class DocumentPosition:
    line: int
    column: int


@dataclass(frozen=True, slots=True)
class DocumentDiagnostic:
    severity: DiagnosticSeverity
    code: str
    message: str
    start: DocumentPosition
    end: DocumentPosition | None = None


@dataclass(frozen=True, slots=True)
class DocumentDraft:
    client_draft_id: str
    document_id: str
    project_id: str
    base_revision: str
    content: str
    diagnostics: tuple[DocumentDiagnostic, ...]
    saved_at: datetime


@dataclass(frozen=True, slots=True)
class DocumentConflict:
    code: str
    title: str
    detail: str
    base_revision: str
    current_revision: str
    base_source: str
    current_source: str
    draft_source: str
