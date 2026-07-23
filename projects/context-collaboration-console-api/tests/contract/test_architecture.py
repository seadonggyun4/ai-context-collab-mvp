"""Import-level enforcement of the backend dependency direction."""

import ast
from pathlib import Path

SOURCE_ROOT = Path(__file__).resolve().parents[2] / "app"

FORBIDDEN_PREFIXES = {
    "domain": ("app.application", "app.api", "app.infrastructure", "app.settings"),
    "application": ("app.api", "app.infrastructure", "app.settings"),
    "infrastructure": ("app.api",),
    "api": ("app.infrastructure",),
}


def imported_modules(path: Path) -> tuple[str, ...]:
    tree = ast.parse(path.read_text(encoding="utf-8"), filename=str(path))
    modules: list[str] = []
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            modules.extend(alias.name for alias in node.names)
        elif isinstance(node, ast.ImportFrom) and node.module is not None:
            modules.append(node.module)
    return tuple(modules)


def test_backend_layers_depend_only_inward() -> None:
    violations: list[str] = []
    for layer, forbidden in FORBIDDEN_PREFIXES.items():
        for path in (SOURCE_ROOT / layer).rglob("*.py"):
            for module in imported_modules(path):
                if module.startswith(forbidden):
                    violations.append(f"{path.relative_to(SOURCE_ROOT)} -> {module}")
    assert violations == []
