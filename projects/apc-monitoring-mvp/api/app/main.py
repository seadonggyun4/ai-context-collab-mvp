from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.monitoring.routers.health import router as health_router
from app.monitoring.routers.monitoring import router as monitoring_router


def create_app() -> FastAPI:
    app = FastAPI(
        title="JADX APC Monitoring MVP API",
        version="0.1.0",
        description=(
            "FastAPI API for the APC monitoring MVP. "
            "Endpoints use deterministic fixture data until real JADX adapters are added."
        ),
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health_router, prefix="/api")
    app.include_router(monitoring_router, prefix="/api")

    return app


app = create_app()
