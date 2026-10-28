from fastapi import APIRouter, HTTPException, status
from schemas.models import DailySiteRequest, DailySiteResponse
from services.ai_service import ai_service

router = APIRouter(prefix="/daily-site", tags=["Daily Site Assistant"])

@router.post("/plan", response_model=DailySiteResponse)
async def generate_daily_site_plan(request: DailySiteRequest):
    if not request.planned_activity.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Planned activity cannot be empty."
        )

    result = await ai_service.plan_daily_site(
        planned_activity=request.planned_activity.strip(),
        workforce_count=request.workforce_count,
        site_condition=request.site_condition,
        weather_context=request.weather_context,
        notes=request.notes
    )
    return result
