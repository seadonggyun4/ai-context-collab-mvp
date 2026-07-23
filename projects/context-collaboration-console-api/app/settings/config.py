"""Environment configuration and normalization."""

import json
from functools import lru_cache
from pathlib import Path
from typing import Literal
from urllib.parse import urlsplit

from pydantic import Field, SecretStr, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    app_name: str = "Context Collaboration Console API"
    app_env: Literal["local", "test", "preview", "production"] = "local"
    log_level: Literal["DEBUG", "INFO", "WARNING", "ERROR"] = "INFO"
    database_url: SecretStr = SecretStr("postgresql://context_console:context_console@127.0.0.1:5432/context_console")
    cors_allowed_origins: str = "http://localhost:5173"
    document_repository: Path = Field(default=Path("../.."))
    document_branch: str = "HEAD"
    document_max_bytes: int = Field(default=1_048_576, ge=1_024, le=10_485_760)
    git_command_timeout_seconds: float = Field(default=5.0, gt=0, le=30)
    source_repository_url: str = "https://github.com/seadonggyun4/ai-context-collab-mvp.git"
    git_write_sandbox: Path | None = None
    security_store_url: SecretStr | None = None
    session_cookie_name: str = "context_console_session"
    session_cookie_secure: bool = True
    session_cookie_samesite: Literal["lax", "strict", "none"] = "lax"
    session_ttl_seconds: int = Field(default=28_800, ge=900, le=86_400)
    oidc_issuer: str | None = None
    oidc_client_id: str | None = None
    oidc_client_secret: SecretStr | None = None
    oidc_callback_url: str | None = None
    oidc_role_claim: str = "groups"
    oidc_role_mapping: str = (
        '{"context-viewers":"viewer","context-contributors":"contributor",'
        '"context-reviewers":"reviewer","context-admins":"admin"}'
    )
    frontend_origins: str = "http://localhost:5173"
    rate_limit_read_per_minute: int = Field(default=120, ge=10, le=10_000)
    rate_limit_mutation_per_minute: int = Field(default=30, ge=5, le=1_000)

    @field_validator("cors_allowed_origins")
    @classmethod
    def validate_cors_origins(cls, value: str) -> str:
        origins = [origin.strip() for origin in value.split(",") if origin.strip()]
        if not origins:
            raise ValueError("at least one CORS origin is required")
        for origin in origins:
            parsed = urlsplit(origin)
            is_local_http = parsed.scheme == "http" and parsed.hostname in {"localhost", "127.0.0.1"}
            if parsed.scheme != "https" and not is_local_http:
                raise ValueError("CORS origins must use HTTPS except localhost")
            if parsed.path not in {"", "/"} or parsed.query or parsed.fragment or parsed.username or parsed.password:
                raise ValueError("CORS origins must contain only scheme, host, and optional port")
        return ",".join(origins)

    @field_validator("document_branch")
    @classmethod
    def validate_document_branch(cls, value: str) -> str:
        if not value or value.startswith("-") or ".." in value or any(character.isspace() for character in value):
            raise ValueError("document branch is not a safe Git ref")
        return value

    @field_validator("oidc_issuer", "oidc_callback_url")
    @classmethod
    def validate_optional_https_url(cls, value: str | None) -> str | None:
        if value is None:
            return None
        parsed = urlsplit(value)
        if parsed.scheme != "https" or not parsed.netloc or parsed.username or parsed.password or parsed.fragment:
            raise ValueError("OIDC URLs must be absolute HTTPS URLs without credentials or fragments")
        return value.rstrip("/") if parsed.path in {"", "/"} else value

    @field_validator("frontend_origins")
    @classmethod
    def validate_frontend_origins(cls, value: str) -> str:
        origins = [origin.strip().rstrip("/") for origin in value.split(",") if origin.strip()]
        if not origins:
            raise ValueError("at least one frontend origin is required")
        for origin in origins:
            parsed = urlsplit(origin)
            is_local = parsed.scheme == "http" and parsed.hostname in {"localhost", "127.0.0.1"}
            if (parsed.scheme != "https" and not is_local) or parsed.path not in {"", "/"}:
                raise ValueError("frontend origins must contain only an HTTPS origin except localhost")
        return ",".join(origins)

    @model_validator(mode="after")
    def validate_production_security(self) -> "Settings":
        if self.app_env != "production":
            return self
        missing = [
            name
            for name, value in (
                ("SECURITY_STORE_URL", self.security_store_url),
                ("OIDC_ISSUER", self.oidc_issuer),
                ("OIDC_CLIENT_ID", self.oidc_client_id),
                ("OIDC_CLIENT_SECRET", self.oidc_client_secret),
                ("OIDC_CALLBACK_URL", self.oidc_callback_url),
            )
            if value is None
        ]
        if missing:
            raise ValueError(f"production security settings are required: {', '.join(missing)}")
        if not self.session_cookie_secure:
            raise ValueError("production session cookies must be Secure")
        if any(not origin.startswith("https://") for origin in self.frontend_origin_values):
            raise ValueError("production frontend origins must use HTTPS")
        _ = self.parsed_oidc_role_mapping
        return self

    @property
    def sqlalchemy_database_url(self) -> str:
        value = self.database_url.get_secret_value()
        if value.startswith("postgres://"):
            return value.replace("postgres://", "postgresql+asyncpg://", 1)
        if value.startswith("postgresql://"):
            return value.replace("postgresql://", "postgresql+asyncpg://", 1)
        return value

    @property
    def cors_origins(self) -> tuple[str, ...]:
        return tuple(self.cors_allowed_origins.split(","))

    @property
    def resolved_document_repository(self) -> Path:
        return self.document_repository.expanduser().resolve()

    @property
    def resolved_git_write_sandbox(self) -> Path | None:
        return self.git_write_sandbox.expanduser().resolve() if self.git_write_sandbox is not None else None

    @property
    def frontend_origin_values(self) -> tuple[str, ...]:
        return tuple(self.frontend_origins.split(","))

    @property
    def parsed_oidc_role_mapping(self) -> dict[str, str]:
        value = json.loads(self.oidc_role_mapping)
        valid_items = isinstance(value, dict) and all(
            isinstance(key, str) and isinstance(role, str) for key, role in value.items()
        )
        if not valid_items:
            raise ValueError("OIDC_ROLE_MAPPING must be a JSON object of group to role")
        allowed = {"viewer", "contributor", "reviewer", "admin"}
        if not set(value.values()).issubset(allowed):
            raise ValueError("OIDC_ROLE_MAPPING contains an unknown role")
        return {str(key): str(role) for key, role in value.items()}


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
