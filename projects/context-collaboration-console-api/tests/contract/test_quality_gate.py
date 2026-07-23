"""Render checksPass is backed by a repository-level CI quality gate."""

from pathlib import Path

WORKSPACE_ROOT = Path(__file__).resolve().parents[4]
WORKFLOW = WORKSPACE_ROOT / ".github" / "workflows" / "quality-gate.yml"


def test_quality_gate_covers_build_policy_postgres_and_blueprint() -> None:
    source = WORKFLOW.read_text(encoding="utf-8")
    required_commands = (
        "npm run lint",
        "npm run typecheck",
        "npm test -- --run",
        "npm run build",
        "uv run ruff check app tests",
        "uv run ruff format --check app tests",
        "uv run mypy app",
        "uv run pytest",
        "TEST_DATABASE_URL",
        "render.com/schema/render.yaml.json",
    )
    assert all(command in source for command in required_commands)
    assert "permissions:\n  contents: read" in source
    assert "uses: actions/checkout@v" not in source
