"""create projects read model

Revision ID: 20260722_0001
Revises:
Create Date: 2026-07-22
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20260722_0001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "projects",
        sa.Column("id", sa.String(length=100), nullable=False),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("repository_url", sa.String(length=500), nullable=False),
        sa.Column("default_branch", sa.String(length=200), nullable=False),
        sa.Column("document_root", sa.String(length=500), nullable=False),
        sa.Column("active_context_version", sa.String(length=100), nullable=False),
        sa.Column("effective_date", sa.Date(), nullable=False),
        sa.Column("health", sa.String(length=32), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_projects")),
    )


def downgrade() -> None:
    op.drop_table("projects")
