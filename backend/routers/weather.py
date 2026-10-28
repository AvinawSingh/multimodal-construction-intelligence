from fastapi import APIRouter, HTTPException, status
from schemas.models import WeatherAdvisorRequest, WeatherAdvisorResponse
from services.weather_service import weather_service

router = APIRouter(prefix="/weather", tags=["Weather Advisor"])

@router.post("/advisory", response_model=WeatherAdvisorResponse)
async def get_weather_advisory(request: WeatherAdvisorRequest):
    if not request.location.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Location cannot be empty."
        )

    if not request.planned_activity.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Planned activity cannot be empty."
        )

    try:
        result = await weather_service.get_forecast_and_advisory(
            location=request.location.strip(),
            planned_activity=request.planned_activity.strip()
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unable to retrieve meteorological advisory: {str(e)}"
        )
