"""Safe Markdown, YAML, and path-scoped schema validation."""

import re

from jsonschema import Draft202012Validator
from markdown_it import MarkdownIt
from ruamel.yaml import YAML
from ruamel.yaml.error import MarkedYAMLError

from app.domain import DiagnosticSeverity, DocumentDiagnostic, DocumentFormat, DocumentPosition

WORKFLOW_POLICY_SCHEMA: dict[str, object] = {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "type": "object",
    "required": ["version", "project", "approval", "validation"],
    "properties": {
        "version": {"type": "string", "minLength": 1},
        "project": {"type": "string", "minLength": 1},
        "approval": {
            "type": "object",
            "required": ["high_risk"],
            "properties": {
                "high_risk": {
                    "type": "object",
                    "required": ["required_roles"],
                    "properties": {
                        "required_roles": {
                            "type": "array",
                            "minItems": 1,
                            "items": {"type": "string", "minLength": 1},
                        }
                    },
                }
            },
        },
        "validation": {
            "type": "object",
            "required": ["require_evidence"],
            "properties": {"require_evidence": {"type": "boolean"}},
        },
    },
}


class SafeDocumentValidator:
    def __init__(self, max_bytes: int = 1_048_576) -> None:
        self._max_bytes = max_bytes
        self._markdown = MarkdownIt("commonmark", {"html": False})
        self._yaml = YAML(typ="safe")

    def validate(
        self,
        content: str,
        document_format: DocumentFormat,
        document_path: str | None = None,
    ) -> tuple[DocumentDiagnostic, ...]:
        if len(content.encode("utf-8")) > self._max_bytes:
            return (self._diagnostic("ERROR", "DOCUMENT_TOO_LARGE", "문서가 허용 크기를 초과했습니다.", 1, 1),)
        if not content.strip():
            return (self._diagnostic("ERROR", "DOCUMENT_EMPTY", "문서 내용을 입력해 주세요.", 1, 1),)
        if document_format is DocumentFormat.MARKDOWN:
            return self._validate_markdown(content)
        return self._validate_yaml(content, document_path)

    def _validate_markdown(self, content: str) -> tuple[DocumentDiagnostic, ...]:
        try:
            tokens = self._markdown.parse(content)
        except ValueError as error:
            return (self._diagnostic("ERROR", "MARKDOWN_PARSE_ERROR", str(error), 1, 1),)
        if not any(token.type == "heading_open" and token.tag == "h1" for token in tokens):
            return (
                self._diagnostic("WARNING", "MARKDOWN_H1_MISSING", "문서의 최상위 제목(H1)을 확인해 주세요.", 1, 1),
            )
        return ()

    def _validate_yaml(self, content: str, document_path: str | None) -> tuple[DocumentDiagnostic, ...]:
        try:
            result = self._yaml.load(content)
        except MarkedYAMLError as error:
            mark = error.problem_mark
            line = 1 if mark is None else mark.line + 1
            column = 1 if mark is None else mark.column + 1
            return (
                self._diagnostic(
                    "ERROR", "YAML_PARSE_ERROR", error.problem or "YAML 문법을 확인해 주세요.", line, column
                ),
            )
        if not isinstance(result, dict):
            return (
                self._diagnostic("ERROR", "YAML_ROOT_MAPPING_REQUIRED", "YAML 최상위 값은 mapping이어야 합니다.", 1, 1),
            )
        if document_path is not None and document_path.endswith("/workflow-policy.yaml"):
            return self._validate_schema(content, result)
        return ()

    def _validate_schema(self, content: str, value: dict[object, object]) -> tuple[DocumentDiagnostic, ...]:
        errors = sorted(
            Draft202012Validator(WORKFLOW_POLICY_SCHEMA).iter_errors(value), key=lambda item: list(item.path)
        )
        diagnostics: list[DocumentDiagnostic] = []
        for error in errors:
            key = str(error.path[-1]) if error.path else None
            if error.validator == "required":
                missing = str(error.message).split("'")[1] if "'" in error.message else "unknown"
                key = str(error.path[-1]) if error.path else missing
                message = f"필수 필드가 누락되었습니다: {missing}"
                code = "SCHEMA_REQUIRED"
            else:
                message = f"필드 값이 정책 schema와 맞지 않습니다: {error.message}"
                code = f"SCHEMA_{str(error.validator).upper()}"
            line, column = self._find_key_position(content, key)
            diagnostics.append(self._diagnostic("ERROR", code, message, line, column))
        return tuple(diagnostics)

    @staticmethod
    def _find_key_position(content: str, key: str | None) -> tuple[int, int]:
        if key is None:
            return (1, 1)
        pattern = re.compile(rf"^(\s*){re.escape(key)}\s*:")
        for line_number, line in enumerate(content.splitlines(), start=1):
            match = pattern.match(line)
            if match is not None:
                return (line_number, len(match.group(1)) + 1)
        return (1, 1)

    @staticmethod
    def _diagnostic(severity: str, code: str, message: str, line: int, column: int) -> DocumentDiagnostic:
        return DocumentDiagnostic(
            severity=DiagnosticSeverity(severity),
            code=code,
            message=message,
            start=DocumentPosition(line=line, column=column),
        )
