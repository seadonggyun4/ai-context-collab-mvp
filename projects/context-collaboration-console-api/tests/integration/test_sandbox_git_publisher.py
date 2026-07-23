"""Real Git E2E constrained to a temporary sandbox repository."""

import subprocess
from dataclasses import replace
from pathlib import Path

import pytest
from app.application.ports import GitPublishSpec
from app.domain import DomainError
from app.infrastructure.git import SandboxGitPublisher


def git(root: Path, *arguments: str) -> str:
    result = subprocess.run(
        ["git", "-C", str(root), *arguments],
        check=True,
        capture_output=True,
        text=True,
    )
    return result.stdout.strip()


async def test_sandbox_publisher_creates_idempotent_branch_and_commit(tmp_path: Path) -> None:
    root = tmp_path / "sandbox-repository"
    root.mkdir()
    git(root, "init", "-b", "main")
    (root / "README.md").write_text("# Sandbox\n", encoding="utf-8")
    git(root, "add", "README.md")
    git(root, "-c", "user.name=Test", "-c", "user.email=test@example.invalid", "commit", "-m", "initial")
    base_sha = git(root, "rev-parse", "HEAD")
    publisher = SandboxGitPublisher(root)
    spec = GitPublishSpec(
        project_id="apc-monitoring-mvp",
        change_id="CR-DEMO-001",
        branch="context/cr-demo-001-r1",
        base_commit_sha=base_sha,
        document_path="docs/apc-monitoring-mvp/changes/CR-DEMO-001.md",
        document_content="# 승인된 변경\n",
        commit_message="context(apc-monitoring-mvp): apply CR-DEMO-001",
    )

    first = await publisher.publish(spec)
    replay = await publisher.publish(spec)

    assert first == replay
    assert first.commit_sha == git(root, "rev-parse", "context/cr-demo-001-r1")
    assert git(root, "show", "--format=%s", "--no-patch", first.commit_sha) == spec.commit_message
    assert git(root, "show", f"{first.commit_sha}:{spec.document_path}") == "# 승인된 변경"
    assert first.pull_request_url == "sandbox://pull-requests/CR-DEMO-001"
    assert git(root, "branch", "--show-current") == "main"

    second_spec = replace(
        spec,
        change_id="CR-DEMO-002",
        branch="context/cr-demo-002-r1",
        document_path="docs/apc-monitoring-mvp/changes/CR-DEMO-002.md",
        document_content="# 두 번째 승인 변경\n",
        commit_message="context(apc-monitoring-mvp): apply CR-DEMO-002",
    )
    second = await publisher.publish(second_spec)
    assert git(root, "rev-parse", f"{second.commit_sha}^") == base_sha
    assert git(root, "branch", "--show-current") == "main"


async def test_sandbox_publisher_rejects_stale_base_and_path_escape(tmp_path: Path) -> None:
    root = tmp_path / "sandbox-repository"
    root.mkdir()
    git(root, "init", "-b", "main")
    (root / "README.md").write_text("# Sandbox\n", encoding="utf-8")
    git(root, "add", "README.md")
    git(root, "-c", "user.name=Test", "-c", "user.email=test@example.invalid", "commit", "-m", "initial")
    publisher = SandboxGitPublisher(root)
    valid = GitPublishSpec(
        project_id="apc-monitoring-mvp",
        change_id="CR-DEMO-001",
        branch="context/cr-demo-001-r1",
        base_commit_sha="f" * 40,
        document_path="docs/apc-monitoring-mvp/changes/CR-DEMO-001.md",
        document_content="# Change\n",
        commit_message="context(apc-monitoring-mvp): apply CR-DEMO-001",
    )
    with pytest.raises(DomainError) as stale:
        await publisher.publish(valid)
    assert stale.value.code == "GIT_BASE_REVISION_STALE"

    escaped = replace(valid, base_commit_sha=git(root, "rev-parse", "HEAD"), document_path="../outside.md")
    with pytest.raises(DomainError) as denied:
        await publisher.publish(escaped)
    assert denied.value.code == "GIT_PATH_NOT_ALLOWED"
