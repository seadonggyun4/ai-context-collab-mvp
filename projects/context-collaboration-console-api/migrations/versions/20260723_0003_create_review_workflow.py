"""create review workflow, audit, and idempotency tables

Revision ID: 20260723_0003
Revises: 20260722_0002
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20260723_0003"
down_revision: str | None = "20260722_0002"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "change_workflows",
        sa.Column("id", sa.String(length=100), nullable=False),
        sa.Column("project_id", sa.String(length=100), nullable=False),
        sa.Column("storage_revision", sa.Integer(), nullable=False),
        sa.Column("payload", sa.JSON(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["project_id"], ["projects.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_change_workflows_project_id", "change_workflows", ["project_id"])
    op.create_table(
        "workflow_audit_events",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("event_id", sa.String(length=200), nullable=False),
        sa.Column("change_request_id", sa.String(length=100), nullable=False),
        sa.Column("actor_id", sa.String(length=100), nullable=False),
        sa.Column("action", sa.String(length=100), nullable=False),
        sa.Column("target_type", sa.String(length=64), nullable=False),
        sa.Column("target_id", sa.String(length=200), nullable=False),
        sa.Column("before", sa.JSON(), nullable=False),
        sa.Column("after", sa.JSON(), nullable=False),
        sa.Column("request_id", sa.String(length=100), nullable=False),
        sa.Column("occurred_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["change_request_id"], ["change_workflows.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("change_request_id", "event_id", name="uq_workflow_audit_event"),
    )
    op.create_index(
        "ix_workflow_audit_events_change_occurred",
        "workflow_audit_events",
        ["change_request_id", "occurred_at"],
    )
    op.create_table(
        "change_command_receipts",
        sa.Column("idempotency_key", sa.String(length=100), nullable=False),
        sa.Column("change_request_id", sa.String(length=100), nullable=False),
        sa.Column("input_fingerprint", sa.String(length=64), nullable=False),
        sa.Column("resulting_revision", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["change_request_id"], ["change_workflows.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("idempotency_key"),
    )


def downgrade() -> None:
    op.drop_table("change_command_receipts")
    op.drop_index("ix_workflow_audit_events_change_occurred", table_name="workflow_audit_events")
    op.drop_table("workflow_audit_events")
    op.drop_index("ix_change_workflows_project_id", table_name="change_workflows")
    op.drop_table("change_workflows")
