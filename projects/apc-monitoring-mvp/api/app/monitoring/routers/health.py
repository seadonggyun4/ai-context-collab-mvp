from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/health")
def health_check() -> dict[str, str]:
    return {
        "status": "ok",
        "service": "jadx-apc-monitoring-mvp",
        "phase": "phase-1-scaffold",
    }
