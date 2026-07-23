"""create document drafts

Revision ID: 20260722_0002
Revises: 20260722_0001
Create Date: 2026-07-22
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20260722_0002"
down_revision: str | None = "20260722_0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "document_drafts",
        sa.Column("client_draft_id", sa.String(length=100), nullable=False),
        sa.Column("document_id", sa.String(length=160), nullable=False),
        sa.Column("project_id", sa.String(length=100), nullable=False),
        sa.Column("base_revision", sa.String(length=64), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("saved_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["project_id"],
            ["projects.id"],
            name=op.f("fk_document_drafts_project_id_projects"),
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("client_draft_id", name=op.f("pk_document_drafts")),
    )
    op.create_index(
        "ix_document_drafts_document_id",
        "document_drafts",
        ["document_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("ix_document_drafts_document_id", table_name="document_drafts")
    op.drop_table("document_drafts")
