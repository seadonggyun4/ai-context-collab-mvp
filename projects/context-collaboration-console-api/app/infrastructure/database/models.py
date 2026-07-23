"""Persistence-only SQLAlchemy rows."""

from datetime import date, datetime
from typing import Any

from sqlalchemy import JSON, Date, DateTime, ForeignKey, Index, Integer, String, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column

from app.infrastructure.database.base import Base


class ProjectRow(Base):
    __tablename__ = "projects"

    id: Mapped[str] = mapped_column(String(100), primary_key=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    repository_url: Mapped[str] = mapped_column(String(500), nullable=False)
    default_branch: Mapped[str] = mapped_column(String(200), nullable=False)
    document_root: Mapped[str] = mapped_column(String(500), nullable=False)
    active_context_version: Mapped[str] = mapped_column(String(100), nullable=False)
    effective_date: Mapped[date] = mapped_column(Date, nullable=False)
    health: Mapped[str] = mapped_column(String(32), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )


class DocumentDraftRow(Base):
    __tablename__ = "document_drafts"
    __table_args__ = (Index("ix_document_drafts_document_id", "document_id"),)

    client_draft_id: Mapped[str] = mapped_column(String(100), primary_key=True)
    document_id: Mapped[str] = mapped_column(String(160), nullable=False)
    project_id: Mapped[str] = mapped_column(
        String(100),
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
    )
    base_revision: Mapped[str] = mapped_column(String(64), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    saved_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class ChangeWorkflowRow(Base):
    __tablename__ = "change_workflows"
    __table_args__ = (Index("ix_change_workflows_project_id", "project_id"),)

    id: Mapped[str] = mapped_column(String(100), primary_key=True)
    project_id: Mapped[str] = mapped_column(
        String(100),
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
    )
    storage_revision: Mapped[int] = mapped_column(Integer, nullable=False)
    payload: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )


class WorkflowAuditEventRow(Base):
    __tablename__ = "workflow_audit_events"
    __table_args__ = (
        UniqueConstraint("change_request_id", "event_id", name="uq_workflow_audit_event"),
        Index("ix_workflow_audit_events_change_occurred", "change_request_id", "occurred_at"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    event_id: Mapped[str] = mapped_column(String(200), nullable=False)
    change_request_id: Mapped[str] = mapped_column(
        String(100),
        ForeignKey("change_workflows.id", ondelete="CASCADE"),
        nullable=False,
    )
    actor_id: Mapped[str] = mapped_column(String(100), nullable=False)
    action: Mapped[str] = mapped_column(String(100), nullable=False)
    target_type: Mapped[str] = mapped_column(String(64), nullable=False)
    target_id: Mapped[str] = mapped_column(String(200), nullable=False)
    before: Mapped[dict[str, object]] = mapped_column(JSON, nullable=False)
    after: Mapped[dict[str, object]] = mapped_column(JSON, nullable=False)
    request_id: Mapped[str] = mapped_column(String(100), nullable=False)
    occurred_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class ChangeCommandReceiptRow(Base):
    __tablename__ = "change_command_receipts"

    idempotency_key: Mapped[str] = mapped_column(String(100), primary_key=True)
    change_request_id: Mapped[str] = mapped_column(
        String(100),
        ForeignKey("change_workflows.id", ondelete="CASCADE"),
        nullable=False,
    )
    input_fingerprint: Mapped[str] = mapped_column(String(64), nullable=False)
    resulting_revision: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )


class ContextVersionRow(Base):
    """Immutable, queryable record of an activated project Context."""

    __tablename__ = "context_versions"
    __table_args__ = (
        UniqueConstraint("project_id", "version", name="uq_context_versions_project_version"),
        UniqueConstraint("change_request_id", name="uq_context_versions_change_request"),
        Index("ix_context_versions_project_activated", "project_id", "activated_at"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    project_id: Mapped[str] = mapped_column(
        String(100),
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
    )
    version: Mapped[str] = mapped_column(String(100), nullable=False)
    change_request_id: Mapped[str] = mapped_column(
        String(100),
        ForeignKey("change_workflows.id", ondelete="RESTRICT"),
        nullable=False,
    )
    document_ids: Mapped[list[str]] = mapped_column(JSON, nullable=False)
    source_commit_sha: Mapped[str] = mapped_column(String(40), nullable=False)
    activated_by: Mapped[str] = mapped_column(String(100), nullable=False)
    activated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
