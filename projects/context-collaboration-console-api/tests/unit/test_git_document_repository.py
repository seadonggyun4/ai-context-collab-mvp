"""Git object adapter behavior and path-policy negative cases."""

import subprocess
from pathlib import Path

import pytest
from app.domain import DomainError
from app.infrastructure.git import GitDocumentRepository
from tests.fakes import sample_project


def run_git(repository: Path, *arguments: str) -> None:
    subprocess.run(["git", "-C", str(repository), *arguments], check=True, capture_output=True)


@pytest.fixture
def git_repository(tmp_path: Path) -> Path:
    run_git(tmp_path, "init", "-b", "main")
    run_git(tmp_path, "config", "user.email", "fixture@example.com")
    run_git(tmp_path, "config", "user.name", "Fixture")
    document_root = tmp_path / "docs" / "apc-monitoring-mvp"
    document_root.mkdir(parents=True)
    (document_root / "Project_Context.md").write_text("# APC Project Context\n\nActive context.\n", encoding="utf-8")
    (document_root / "policy.yaml").write_text("status: ACTIVE\n", encoding="utf-8")
    (document_root / "ignored.txt").write_text("ignored", encoding="utf-8")
    run_git(tmp_path, "add", "docs")
    run_git(tmp_path, "commit", "-m", "fixture documents")
    return tmp_path


def repository(path: Path, *, max_bytes: int = 1_048_576) -> GitDocumentRepository:
    return GitDocumentRepository(
        path,
        allowed_refs=frozenset({"main"}),
        max_document_bytes=max_bytes,
        timeout_seconds=2,
    )


async def test_lists_supported_documents_and_reads_blob_without_worktree_access(git_repository: Path) -> None:
    adapter = repository(git_repository)
    project = sample_project()
    documents = await adapter.list_for_project(project)

    assert [document.path for document in documents] == [
        "docs/apc-monitoring-mvp/Project_Context.md",
        "docs/apc-monitoring-mvp/policy.yaml",
    ]
    detail = await adapter.get(project, documents[0].id)
    assert detail is not None
    assert detail.title == "APC Project Context"
    assert detail.source.startswith("# APC Project Context")
    assert detail.revision == documents[0].revision

    (git_repository / "docs" / "apc-monitoring-mvp" / "Project_Context.md").write_text(
        "# Uncommitted Worktree Value\n",
        encoding="utf-8",
    )
    unchanged = await adapter.get(project, documents[0].id)
    assert unchanged is not None
    assert unchanged.source.startswith("# APC Project Context")


@pytest.mark.parametrize(
    ("project_overrides", "expected_code"),
    [
        ({"document_root": "docs/../private"}, "DOCUMENT_PATH_TRAVERSAL"),
        ({"document_root": "docs/another-project"}, "DOCUMENT_ROOT_NOT_ALLOWED"),
        ({"default_branch": "unapproved"}, "DOCUMENT_REF_NOT_ALLOWED"),
    ],
)
async def test_rejects_untrusted_project_path_and_ref(
    git_repository: Path,
    project_overrides: dict[str, str],
    expected_code: str,
) -> None:
    with pytest.raises(DomainError) as captured:
        await repository(git_repository).list_for_project(sample_project(**project_overrides))
    assert captured.value.code == expected_code


async def test_blocks_oversized_document_before_reading_blob(git_repository: Path) -> None:
    adapter = repository(git_repository, max_bytes=20)
    project = sample_project()
    document = (await adapter.list_for_project(project))[0]
    with pytest.raises(DomainError) as captured:
        await adapter.get(project, document.id)
    assert captured.value.code == "DOCUMENT_TOO_LARGE"


async def test_returns_none_for_unknown_document_id(git_repository: Path) -> None:
    assert await repository(git_repository).get(sample_project(), "apc-monitoring-mvp:00000000000000000000") is None
