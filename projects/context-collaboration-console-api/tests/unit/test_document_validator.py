"""Document diagnostics stay deterministic and source-addressable."""

from app.domain import DocumentFormat
from app.infrastructure.document_validator import SafeDocumentValidator


def test_yaml_parser_reports_source_position_without_executing_tags() -> None:
    diagnostics = SafeDocumentValidator().validate("policy:\n  roles: [planner\n", DocumentFormat.YAML)

    assert len(diagnostics) == 1
    assert diagnostics[0].code == "YAML_PARSE_ERROR"
    assert diagnostics[0].start.line >= 1
    assert diagnostics[0].start.column >= 1


def test_yaml_requires_mapping_root() -> None:
    diagnostics = SafeDocumentValidator().validate("- planner\n- developer\n", DocumentFormat.YAML)

    assert diagnostics[0].code == "YAML_ROOT_MAPPING_REQUIRED"


def test_markdown_missing_h1_is_warning_not_error() -> None:
    diagnostics = SafeDocumentValidator().validate("## Context\n", DocumentFormat.MARKDOWN)

    assert diagnostics[0].severity == "WARNING"
    assert diagnostics[0].code == "MARKDOWN_H1_MISSING"


def test_workflow_policy_reports_schema_required_fields() -> None:
    diagnostics = SafeDocumentValidator().validate(
        'version: "1.4"\nproject: apc-monitoring-mvp\napproval: {}\nvalidation:\n  require_evidence: true\n',
        DocumentFormat.YAML,
        "docs/apc-monitoring-mvp/workflow-policy.yaml",
    )

    assert diagnostics[0].code == "SCHEMA_REQUIRED"
    assert "high_risk" in diagnostics[0].message
    assert diagnostics[0].start.line == 3
