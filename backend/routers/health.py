from fastapi import APIRouter
from datetime import datetime
from config import get_settings
from schemas.models import HealthResponse

router = APIRouter(prefix="/health", tags=["Health"])

@router.get("", response_model=HealthResponse)
def get_health():
    settings = get_settings()
    has_llama_key = bool(settings.LLAMA_API_KEY and settings.LLAMA_API_KEY.strip())
    return HealthResponse(
        status="healthy",
        timestamp=datetime.utcnow().isoformat() + "Z",
        environment=settings.ENVIRONMENT,
        ai_configured=has_llama_key,
        weather_provider=settings.WEATHER_API_PROVIDER,
        version="1.0.0"
    )
