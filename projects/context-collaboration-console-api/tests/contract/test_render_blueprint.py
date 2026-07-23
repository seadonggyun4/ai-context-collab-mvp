"""Local contract checks for the root Render Blueprint."""

from pathlib import Path

import yaml

WORKSPACE_ROOT = Path(__file__).resolve().parents[4]
BLUEPRINT_PATH = WORKSPACE_ROOT / "render.yaml"


def load_blueprint() -> dict[str, object]:
    loaded = yaml.safe_load(BLUEPRINT_PATH.read_text(encoding="utf-8"))
    assert isinstance(loaded, dict)
    return loaded


def test_blueprint_defines_zero_cost_initial_deployment() -> None:
    blueprint = load_blueprint()
    services = {service["name"]: service for service in blueprint["services"]}  # type: ignore[index]
    databases = {database["name"]: database for database in blueprint["databases"]}  # type: ignore[index]

    web = services["context-console-web"]
    assert web["runtime"] == "static"
    assert web["rootDir"] == "projects/context-collaboration-console"
    assert web["staticPublishPath"] == "./dist"
    assert {route["source"]: route["destination"] for route in web["routes"]}["/*"] == "/index.html"

    assert web["autoDeployTrigger"] == "checksPass"
    assert next(item for item in web["envVars"] if item["key"] == "VITE_DATA_SOURCE")["value"] == "fixture"
    assert next(item for item in web["envVars"] if item["key"] == "VITE_AUTH_REQUIRED")["value"] == "false"

    api = services["context-console-api"]
    assert api["runtime"] == "python"
    assert api["rootDir"] == "."
    assert api["healthCheckPath"] == "/health/ready"
    assert api["plan"] == "free"
    assert "preDeployCommand" not in api
    assert "alembic upgrade head" in api["startCommand"]
    assert "app.scripts.seed" in api["startCommand"]
    assert api["startCommand"].index("alembic upgrade head") < api["startCommand"].index("app.scripts.seed")
    assert api["startCommand"].index("app.scripts.seed") < api["startCommand"].index("uvicorn")
    assert "docs/apc-monitoring-mvp/**" in api["buildFilter"]["paths"]
    assert api["autoDeployTrigger"] == "checksPass"

    key_value = services["context-console-security"]
    assert key_value["type"] == "keyvalue"
    assert key_value["plan"] == "free"
    assert key_value["maxmemoryPolicy"] == "noeviction"
    assert key_value["persistenceMode"] == "off"
    assert key_value["ipAllowList"] == []

    database = databases["context-console-db"]
    assert database["plan"] == "free"
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
    assert next(item for item in api["envVars"] if item["key"] == "APP_ENV")["value"] == "preview"
    assert not {"OIDC_ISSUER", "OIDC_CLIENT_ID", "OIDC_CLIENT_SECRET", "OIDC_ROLE_MAPPING"}.intersection(
        item["key"] for item in api["envVars"]
    )


def test_paid_preview_resources_are_disabled() -> None:
    blueprint = load_blueprint()
    assert blueprint["previews"] == {"generation": "off"}
    services = {service["name"]: service for service in blueprint["services"]}  # type: ignore[index]
    databases = {database["name"]: database for database in blueprint["databases"]}  # type: ignore[index]
    assert all("previews" not in service and "previewPlan" not in service for service in services.values())
    assert all("previewValue" not in env_var for service in services.values() for env_var in service.get("envVars", []))
    assert all("previewPlan" not in database for database in databases.values())
