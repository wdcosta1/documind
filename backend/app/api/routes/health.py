"""Health routes used for quick service readiness checks."""

from fastapi import APIRouter

from app.core.config import settings


router = APIRouter()


@router.get("")
async def health_check() -> dict[str, str]:
    """Returns a minimal status payload and the active environment name."""
    return {"status": "ok", "environment": settings.app_env}
