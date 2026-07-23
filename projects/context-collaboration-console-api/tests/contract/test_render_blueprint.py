"""Local contract checks for the root Render Blueprint."""

from pathlib import Path

import yaml

WORKSPACE_ROOT = Path(__file__).resolve().parents[4]
BLUEPRINT_PATH = WORKSPACE_ROOT / "render.yaml"


def load_blueprint() -> dict[str, object]:
    loaded = yaml.safe_load(BLUEPRINT_PATH.read_text(encoding="utf-8"))
    assert isinstance(loaded, dict)
    return loaded


def test_blueprint_defines_production_web_api_security_store_and_private_postgres() -> None:
    blueprint = load_blueprint()
    services = {service["name"]: service for service in blueprint["services"]}  # type: ignore[index]
    databases = {database["name"]: database for database in blueprint["databases"]}  # type: ignore[index]

    web = services["context-console-web"]
    assert web["runtime"] == "static"
    assert web["rootDir"] == "projects/context-collaboration-console"
    assert web["staticPublishPath"] == "./dist"
    assert {route["source"]: route["destination"] for route in web["routes"]}["/*"] == "/index.html"

    assert web["autoDeployTrigger"] == "checksPass"
    assert next(item for item in web["envVars"] if item["key"] == "VITE_AUTH_REQUIRED")["value"] == "true"

    api = services["context-console-api"]
    assert api["runtime"] == "python"
    assert api["rootDir"] == "."
    assert api["healthCheckPath"] == "/health/ready"
    assert "alembic upgrade head" in api["preDeployCommand"]
    assert "app.scripts.seed" not in api["preDeployCommand"]
    assert "docs/apc-monitoring-mvp/**" in api["buildFilter"]["paths"]
    assert api["autoDeployTrigger"] == "checksPass"

    key_value = services["context-console-security"]
    assert key_value["type"] == "keyvalue"
    assert key_value["maxmemoryPolicy"] == "noeviction"
    assert key_value["persistenceMode"] == "journal-snapshot"
    assert key_value["ipAllowList"] == []

    database = databases["context-console-db"]
    assert database["plan"] != "free"
    assert database["ipAllowList"] == []
    database_url = next(variable for variable in api["envVars"] if variable["key"] == "DATABASE_URL")
    assert database_url["fromDatabase"] == {
        "name": "context-console-db",
        "property": "connectionString",
    }
    security_url = next(variable for variable in api["envVars"] if variable["key"] == "SECURITY_STORE_URL")
    assert security_url["fromService"] == {
        "type": "keyvalue",
        "name": "context-console-security",
        "property": "connectionString",
    }
    secrets = {"OIDC_ISSUER", "OIDC_CLIENT_ID", "OIDC_CLIENT_SECRET", "OIDC_ROLE_MAPPING"}
    assert all(next(item for item in api["envVars"] if item["key"] == key)["sync"] is False for key in secrets)


def test_preview_resources_expire_and_use_nonproduction_overrides() -> None:
    blueprint = load_blueprint()
    assert blueprint["previews"] == {"generation": "automatic", "expireAfterDays": 3}
    services = {service["name"]: service for service in blueprint["services"]}  # type: ignore[index]
    databases = {database["name"]: database for database in blueprint["databases"]}  # type: ignore[index]
    assert services["context-console-api"]["previews"] == {"generation": "automatic", "plan": "starter"}
    assert services["context-console-security"]["previewPlan"] == "starter"
    assert databases["context-console-db"]["previewPlan"] == "basic-256mb"
    assert (
        next(item for item in services["context-console-api"]["envVars"] if item["key"] == "APP_ENV")["previewValue"]
        == "preview"
    )
    assert (
        next(item for item in services["context-console-web"]["envVars"] if item["key"] == "VITE_DATA_SOURCE")[
            "previewValue"
        ]
        == "fixture"
    )
