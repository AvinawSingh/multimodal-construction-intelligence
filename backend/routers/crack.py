from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from typing import Optional
from config import get_settings
from schemas.models import CrackAnalysisResponse
from services.ai_service import ai_service

router = APIRouter(prefix="/crack", tags=["Crack Detection"])

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/jpg"}

@router.post("/analyze", response_model=CrackAnalysisResponse)
async def analyze_crack(
    file: UploadFile = File(..., description="Photograph of structural crack or fissure"),
    description: Optional[str] = Form(None, description="Optional description of location, surface, or history")
):
    settings = get_settings()

    content_type = file.content_type or ""
    if content_type.lower() not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type '{content_type}'. Please upload a valid JPG, PNG, or WebP crack photograph."
        )

    image_bytes = await file.read()
    if not image_bytes or len(image_bytes) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded crack image is empty. Please select a valid photo."
        )

    if len(image_bytes) > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Image file size exceeds maximum permitted limit ({settings.MAX_UPLOAD_SIZE // (1024*1024)} MB)."
        )

    result = await ai_service.analyze_crack_image(
        image_bytes=image_bytes,
        mime_type=content_type,
        user_notes=description
    )

    return result
