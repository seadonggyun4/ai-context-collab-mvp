"""Versioned route composition."""

from fastapi import APIRouter

from app.api.v1.routes.documents import router as documents_router
from app.api.v1.routes.projects import router as projects_router
from app.api.v1.routes.reviews import router as reviews_router

router = APIRouter(prefix="/api/v1")
router.include_router(projects_router)
router.include_router(documents_router)
router.include_router(reviews_router)
