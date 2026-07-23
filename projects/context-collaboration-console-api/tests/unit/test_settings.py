"""Configuration normalization and security constraints."""

from pathlib import Path

import pytest
from app.settings import Settings
from pydantic import ValidationError


def test_normalizes_render_postgres_url() -> None:
    settings = Settings(_env_file=None, database_url="postgresql://user:secret@db.internal/app")
    assert settings.sqlalchemy_database_url == "postgresql+asyncpg://user:secret@db.internal/app"
    assert "secret" not in repr(settings.database_url)


def test_parses_explicit_cors_allowlist(tmp_path: Path) -> None:
    settings = Settings(
        _env_file=None,
        cors_allowed_origins="https://one.example.com, https://two.example.com:8443",
        document_repository=tmp_path,
    )
    assert settings.cors_origins == ("https://one.example.com", "https://two.example.com:8443")
    assert settings.resolved_document_repository == tmp_path.resolve()


@pytest.mark.parametrize(
    "origins",
    [
        "*",
        "http://console.example.com",
        "https://user:password@console.example.com",
        "https://console.example.com/path",
    ],
)
def test_rejects_unsafe_cors_origins(origins: str) -> None:
    with pytest.raises(ValidationError):
        Settings(_env_file=None, cors_allowed_origins=origins)


@pytest.mark.parametrize("branch", ["", "-main", "../main", "feature bad"])
def test_rejects_unsafe_git_refs(branch: str) -> None:
    with pytest.raises(ValidationError):
        Settings(_env_file=None, document_branch=branch)


def test_production_configuration_fails_closed_without_identity_and_shared_state() -> None:
    with pytest.raises(ValidationError, match="production security settings are required"):
        Settings(
            _env_file=None,
            app_env="production",
            database_url="postgresql://user:secret@db.internal/app",
            cors_allowed_origins="https://console.example.com",
            frontend_origins="https://console.example.com",
        )


def test_production_configuration_rejects_unknown_oidc_roles() -> None:
    with pytest.raises(ValidationError, match="unknown role"):
        Settings(
            _env_file=None,
            app_env="production",
            database_url="postgresql://user:secret@db.internal/app",
            cors_allowed_origins="https://console.example.com",
            frontend_origins="https://console.example.com",
            security_store_url="redis://security.internal:6379",
            oidc_issuer="https://identity.example.com",
            oidc_client_id="console-client",
            oidc_client_secret="console-secret",
            oidc_callback_url="https://api.example.com/api/v1/auth/callback",
            oidc_role_mapping='{"context-admins":"owner"}',
        )
