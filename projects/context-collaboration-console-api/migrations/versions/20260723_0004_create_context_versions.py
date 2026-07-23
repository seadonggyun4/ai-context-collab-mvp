"""create immutable context version records

Revision ID: 20260723_0004
Revises: 20260723_0003
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20260723_0004"
down_revision: str | None = "20260723_0003"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "context_versions",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("project_id", sa.String(length=100), nullable=False),
        sa.Column("version", sa.String(length=100), nullable=False),
        sa.Column("change_request_id", sa.String(length=100), nullable=False),
        sa.Column("document_ids", sa.JSON(), nullable=False),
        sa.Column("source_commit_sha", sa.String(length=40), nullable=False),
        sa.Column("activated_by", sa.String(length=100), nullable=False),
        sa.Column("activated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["change_request_id"], ["change_workflows.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["project_id"], ["projects.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("change_request_id", name="uq_context_versions_change_request"),
        sa.UniqueConstraint("project_id", "version", name="uq_context_versions_project_version"),
    )
    op.create_index(
        "ix_context_versions_project_activated",
        "context_versions",
        ["project_id", "activated_at"],
    )


def downgrade() -> None:
    op.drop_index("ix_context_versions_project_activated", table_name="context_versions")
    op.drop_table("context_versions")
