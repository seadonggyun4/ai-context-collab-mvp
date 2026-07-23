"""Machine-readable checks for the console-only ownership boundary."""

import json
import tomllib
from pathlib import Path

import yaml

WORKSPACE_ROOT = Path(__file__).resolve().parents[4]
FRONTEND_ROOT = WORKSPACE_ROOT / "projects/context-collaboration-console"
API_ROOT = WORKSPACE_ROOT / "projects/context-collaboration-console-api"
DOCS_ROOT = WORKSPACE_ROOT / "docs/context-collaboration-console"


def test_console_packages_reserve_donggyun_seos_rights() -> None:
    expected_notice = "Copyright © 2026 서동균 (DongGyun Seo). All Rights Reserved."
    for package_root in (FRONTEND_ROOT, API_ROOT):
        assert expected_notice in (package_root / "LICENSE").read_text(encoding="utf-8")
        assert expected_notice in (package_root / "NOTICE").read_text(encoding="utf-8")

    frontend_metadata = json.loads((FRONTEND_ROOT / "package.json").read_text(encoding="utf-8"))
    assert frontend_metadata["private"] is True
    assert frontend_metadata["author"] == "서동균 (DongGyun Seo)"
    assert frontend_metadata["license"] == "UNLICENSED"

    with (API_ROOT / "pyproject.toml").open("rb") as pyproject_file:
        backend_metadata = tomllib.load(pyproject_file)["project"]
    assert backend_metadata["authors"] == [{"name": "서동균 (DongGyun Seo)"}]
    assert backend_metadata["license"] == {"file": "LICENSE"}


def test_ownership_policy_is_scoped_and_does_not_claim_the_repository() -> None:
    policy = yaml.safe_load((DOCS_ROOT / "governance/intellectual-property.yaml").read_text(encoding="utf-8"))
    assert policy["owner"] == {"name_ko": "서동균", "name_en": "DongGyun Seo"}
    assert policy["scope"]["included"] == [
        "render.yaml",
        "projects/context-collaboration-console/**",
        "projects/context-collaboration-console-api/**",
        "docs/context-collaboration-console/**",
    ]
    assert "docs/apc-monitoring-mvp/**" in policy["scope"]["excluded"]
    assert "docs/organization-standards/**" in policy["scope"]["excluded"]
    assert not (WORKSPACE_ROOT / "LICENSE").exists()
    assert not (WORKSPACE_ROOT / "docs/apc-monitoring-mvp/LICENSE").exists()
