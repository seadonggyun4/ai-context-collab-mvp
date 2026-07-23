"""Keep application readiness and Alembic's single head synchronized."""

from pathlib import Path

from alembic.config import Config
from alembic.script import ScriptDirectory
from app.infrastructure.database.migration import EXPECTED_MIGRATION_REVISION


def test_expected_migration_revision_is_the_single_alembic_head() -> None:
    api_root = Path(__file__).resolve().parents[2]
    script = ScriptDirectory.from_config(Config(str(api_root / "alembic.ini")))
    assert script.get_heads() == [EXPECTED_MIGRATION_REVISION]
