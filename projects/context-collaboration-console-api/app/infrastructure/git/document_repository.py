"""Read-only document repository implemented with the Git object database."""

import asyncio
import hashlib
import re
import subprocess
from dataclasses import dataclass
from pathlib import Path, PurePosixPath

from app.domain import DocumentDetail, DocumentFormat, DocumentSummary, Project
from app.domain.errors import document_policy_violation, document_source_unavailable

_OBJECT_ID = re.compile(r"^[0-9a-f]{40,64}$")
_ALLOWED_SUFFIXES: dict[str, DocumentFormat] = {
    ".md": DocumentFormat.MARKDOWN,
    ".yaml": DocumentFormat.YAML,
    ".yml": DocumentFormat.YAML,
}


@dataclass(frozen=True, slots=True)
class _TreeEntry:
    object_id: str
    size_bytes: int
    path: str


class GitDocumentRepository:
    def __init__(
        self,
        repository_root: Path,
        *,
        allowed_refs: frozenset[str],
        max_document_bytes: int,
        timeout_seconds: float,
    ) -> None:
        self._repository_root = repository_root.resolve()
        self._allowed_refs = allowed_refs
        self._max_document_bytes = max_document_bytes
        self._timeout_seconds = timeout_seconds

    async def list_for_project(self, project: Project) -> tuple[DocumentSummary, ...]:
        return await asyncio.to_thread(self._list_for_project, project)

    async def get(self, project: Project, document_id: str) -> DocumentDetail | None:
        return await asyncio.to_thread(self._get, project, document_id)

    def _list_for_project(self, project: Project) -> tuple[DocumentSummary, ...]:
        entries = self._list_entries(project)
        return tuple(self._to_summary(project, entry) for entry in entries)

    def _get(self, project: Project, document_id: str) -> DocumentDetail | None:
        entry = next(
            (
                entry
                for entry in self._list_entries(project)
                if self._document_id(project.id, entry.path) == document_id
            ),
            None,
        )
        if entry is None:
            return None
        if entry.size_bytes > self._max_document_bytes:
            raise document_policy_violation(
                "DOCUMENT_TOO_LARGE",
                f"문서 크기가 허용 한도 {self._max_document_bytes} bytes를 초과합니다.",
            )
        raw = self._run_git("cat-file", "blob", entry.object_id)
        if b"\x00" in raw:
            raise document_policy_violation("DOCUMENT_BINARY_NOT_ALLOWED", "텍스트 Markdown/YAML만 읽을 수 있습니다.")
        try:
            source = raw.decode("utf-8")
        except UnicodeDecodeError as error:
            raise document_policy_violation("DOCUMENT_ENCODING_INVALID", "문서는 UTF-8이어야 합니다.") from error

        summary = self._to_summary(project, entry)
        return DocumentDetail(
            id=summary.id,
            project_id=summary.project_id,
            path=summary.path,
            title=self._title_from_source(source, fallback=summary.title),
            format=summary.format,
            revision=summary.revision,
            size_bytes=summary.size_bytes,
            source=source,
        )

    def _list_entries(self, project: Project) -> tuple[_TreeEntry, ...]:
        prefix = self._validated_document_root(project)
        raw = self._run_git("ls-tree", "-r", "-z", "-l", project.default_branch, "--", prefix)
        entries: list[_TreeEntry] = []
        for record in raw.split(b"\x00"):
            if not record:
                continue
            metadata, separator, encoded_path = record.partition(b"\t")
            if not separator:
                continue
            parts = metadata.split()
            if len(parts) != 4 or parts[1] != b"blob" or parts[3] == b"-":
                continue
            try:
                object_id = parts[2].decode("ascii")
                size_bytes = int(parts[3])
                path = encoded_path.decode("utf-8")
            except (UnicodeDecodeError, ValueError):
                continue
            if not _OBJECT_ID.fullmatch(object_id):
                continue
            if self._document_format(path) is None:
                continue
            self._validate_repo_relative_path(path)
            entries.append(_TreeEntry(object_id=object_id, size_bytes=size_bytes, path=path))
        return tuple(sorted(entries, key=lambda entry: entry.path))

    def _validated_document_root(self, project: Project) -> str:
        if project.default_branch not in self._allowed_refs:
            raise document_policy_violation("DOCUMENT_REF_NOT_ALLOWED", "설정에서 허용한 Git ref만 읽을 수 있습니다.")
        root = self._validate_repo_relative_path(project.document_root)
        expected_root = f"docs/{project.id}"
        if root != expected_root and not root.startswith(f"{expected_root}/"):
            raise document_policy_violation(
                "DOCUMENT_ROOT_NOT_ALLOWED", "프로젝트 문서는 해당 docs/project 경로 아래에 있어야 합니다."
            )
        return root

    @staticmethod
    def _validate_repo_relative_path(value: str) -> str:
        if "\x00" in value or "\\" in value or len(value) > 500:
            raise document_policy_violation("DOCUMENT_PATH_INVALID", "문서 경로 형식이 유효하지 않습니다.")
        path = PurePosixPath(value)
        if path.is_absolute() or not path.parts or any(part in {"", ".", ".."} for part in path.parts):
            raise document_policy_violation("DOCUMENT_PATH_TRAVERSAL", "저장소 상대 경로만 허용합니다.")
        return path.as_posix()

    def _run_git(self, *arguments: str) -> bytes:
        command = ["git", "-C", str(self._repository_root), *arguments]
        try:
            result = subprocess.run(
                command,
                check=False,
                capture_output=True,
                timeout=self._timeout_seconds,
            )
        except (FileNotFoundError, subprocess.TimeoutExpired) as error:
            raise document_source_unavailable("Git 문서 저장소에 연결할 수 없습니다.") from error
        if result.returncode != 0:
            raise document_source_unavailable("설정된 Git revision에서 문서를 읽을 수 없습니다.")
        return result.stdout

    @staticmethod
    def _document_id(project_id: str, path: str) -> str:
        digest = hashlib.sha256(f"{project_id}:{path}".encode()).hexdigest()[:20]
        return f"{project_id}:{digest}"

    @staticmethod
    def _document_format(path: str) -> DocumentFormat | None:
        return _ALLOWED_SUFFIXES.get(PurePosixPath(path).suffix.lower())

    def _to_summary(self, project: Project, entry: _TreeEntry) -> DocumentSummary:
        document_format = self._document_format(entry.path)
        if document_format is None:
            raise AssertionError("tree entry must have a supported document format")
        return DocumentSummary(
            id=self._document_id(project.id, entry.path),
            project_id=project.id,
            path=entry.path,
            title=self._title_from_path(entry.path),
            format=document_format,
            revision=entry.object_id,
            size_bytes=entry.size_bytes,
        )

    @staticmethod
    def _title_from_path(path: str) -> str:
        return PurePosixPath(path).stem.replace("_", " ").replace("-", " ").strip()

    @staticmethod
    def _title_from_source(source: str, *, fallback: str) -> str:
        for line in source.splitlines():
            if line.startswith("# "):
                title = line.removeprefix("# ").strip()
                return title or fallback
        return fallback
