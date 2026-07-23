"""Git write adapter restricted to an explicitly configured sandbox repository."""

import asyncio
import re
import subprocess
from pathlib import Path, PurePosixPath

from app.application.ports import GitPublishResult, GitPublishSpec
from app.domain import DomainError

_SHA = re.compile(r"^[0-9a-f]{40}$")
_BRANCH = re.compile(r"^context/[a-z0-9_-]+-r[1-9][0-9]*$")


class SandboxGitPublisher:
    def __init__(self, repository_root: Path, *, timeout_seconds: float = 10) -> None:
        self._root = repository_root.expanduser().resolve()
        self._timeout_seconds = timeout_seconds
        if not (self._root / ".git").exists():
            raise ValueError("sandbox Git publisher requires an initialized repository")

    async def publish(self, spec: GitPublishSpec) -> GitPublishResult:
        return await asyncio.to_thread(self._publish, spec)

    def _publish(self, spec: GitPublishSpec) -> GitPublishResult:
        self._validate(spec)
        existing = self._branch_sha(spec.branch)
        if existing is not None:
            existing_base = self._git("rev-parse", f"{existing}^").decode().strip()
            if existing_base != spec.base_commit_sha:
                raise self._error("GIT_BRANCH_CONFLICT", "동일한 branch의 기준 commit이 다릅니다")
            committed = self._git("show", f"{existing}:{spec.document_path}").decode()
            if committed != spec.document_content:
                raise self._error("GIT_BRANCH_CONFLICT", "동일한 branch에 다른 변경이 존재합니다")
            return self._result(spec.branch, existing, spec.change_id)

        if self._git("status", "--porcelain").strip():
            raise self._error("GIT_WORKTREE_DIRTY", "sandbox 저장소에 반영되지 않은 변경이 있습니다")
        current_base = self._git("rev-parse", "HEAD").decode().strip()
        if current_base != spec.base_commit_sha:
            raise self._error("GIT_BASE_REVISION_STALE", "sandbox 저장소의 base commit이 변경되었습니다")
        original_ref = self._git("symbolic-ref", "--quiet", "--short", "HEAD").decode().strip()
        self._git("switch", "-c", spec.branch, spec.base_commit_sha)
        target = (self._root / spec.document_path).resolve()
        try:
            target.relative_to(self._root)
        except ValueError as error:
            raise self._error("GIT_PATH_NOT_ALLOWED", "sandbox 밖의 경로에는 쓸 수 없습니다") from error
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(spec.document_content, encoding="utf-8")
        self._git("add", "--", spec.document_path)
        self._git(
            "-c",
            "user.name=Context Console",
            "-c",
            "user.email=context-console@example.invalid",
            "commit",
            "-m",
            spec.commit_message,
        )
        commit_sha = self._git("rev-parse", "HEAD").decode().strip()
        self._git("switch", original_ref)
        return self._result(spec.branch, commit_sha, spec.change_id)

    def _validate(self, spec: GitPublishSpec) -> None:
        if not _SHA.fullmatch(spec.base_commit_sha):
            raise self._error("GIT_BASE_REVISION_INVALID", "base commit SHA 형식이 유효하지 않습니다", 422)
        if not _BRANCH.fullmatch(spec.branch):
            raise self._error("GIT_BRANCH_NOT_ALLOWED", "서버 정책에 맞지 않는 branch입니다", 422)
        path = PurePosixPath(spec.document_path)
        expected = PurePosixPath("docs") / spec.project_id / "changes"
        if path.is_absolute() or ".." in path.parts or path.parent != expected or path.suffix != ".md":
            raise self._error("GIT_PATH_NOT_ALLOWED", "프로젝트 changes 문서 경로만 쓸 수 있습니다", 422)
        if not spec.document_content.strip() or len(spec.document_content.encode()) > 1_048_576:
            raise self._error("GIT_CONTENT_INVALID", "반영할 문서 내용이 비어 있거나 허용 크기를 초과합니다", 422)

    def _branch_sha(self, branch: str) -> str | None:
        result = self._run("rev-parse", "--verify", f"refs/heads/{branch}")
        return result.stdout.decode().strip() if result.returncode == 0 else None

    def _git(self, *arguments: str) -> bytes:
        result = self._run(*arguments)
        if result.returncode != 0:
            raise self._error("GIT_PUBLICATION_FAILED", "sandbox Git 명령을 완료하지 못했습니다", 503)
        return result.stdout

    def _run(self, *arguments: str) -> subprocess.CompletedProcess[bytes]:
        try:
            return subprocess.run(
                ["git", "-C", str(self._root), *arguments],
                check=False,
                capture_output=True,
                timeout=self._timeout_seconds,
            )
        except (FileNotFoundError, subprocess.TimeoutExpired) as error:
            raise self._error("GIT_PUBLISHER_UNAVAILABLE", "sandbox Git publisher를 사용할 수 없습니다", 503) from error

    @staticmethod
    def _result(branch: str, commit_sha: str, change_id: str) -> GitPublishResult:
        return GitPublishResult(
            branch=branch,
            commit_sha=commit_sha,
            pull_request_url=f"sandbox://pull-requests/{change_id}",
            pull_request_status="OPEN",
        )

    @staticmethod
    def _error(code: str, title: str, status_code: int = 409) -> DomainError:
        return DomainError(
            code=code, title=title, detail="Git 반영 기준과 sandbox 상태를 확인하세요.", status_code=status_code
        )
