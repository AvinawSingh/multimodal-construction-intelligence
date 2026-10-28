from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from typing import Optional
from config import get_settings
from schemas.models import SafetyAnalysisResponse
from services.ai_service import ai_service

router = APIRouter(prefix="/safety", tags=["Safety Monitor"])

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/jpg"}

@router.post("/analyze", response_model=SafetyAnalysisResponse)
async def analyze_safety(
    file: UploadFile = File(..., description="Construction site photograph"),
    observation: Optional[str] = Form(None, description="Optional supervisor observation or notes"),
    document: Optional[UploadFile] = File(None, description="Optional supporting document/checklist")
):
    settings = get_settings()

    # Validate image mime type
    content_type = file.content_type or ""
    if content_type.lower() not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type '{content_type}'. Please upload a valid JPG, PNG, or WebP image."
        )

    # Read image content
    image_bytes = await file.read()
    if not image_bytes or len(image_bytes) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded image file is empty. Please select a valid photo."
        )

    if len(image_bytes) > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Image file size exceeds maximum permitted limit ({settings.MAX_UPLOAD_SIZE // (1024*1024)} MB)."
        )

    # Safe handling of optional document
    doc_notes = ""
    if document and document.filename:
        doc_bytes = await document.read()
        if len(doc_bytes) > 5 * 1024 * 1024:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="Supporting document exceeds maximum limit of 5 MB."
            )
        doc_notes = f" [Attached Document: {document.filename}]"

    combined_notes = (observation or "") + doc_notes

    # Call AI service
    result = await ai_service.analyze_safety_image(
        image_bytes=image_bytes,
        mime_type=content_type,
        site_observation=combined_notes.strip() or None
    )

    return result
