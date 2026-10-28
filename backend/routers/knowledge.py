from fastapi import APIRouter, HTTPException, status
from schemas.models import KnowledgeRequest, KnowledgeResponse
from services.ai_service import ai_service

router = APIRouter(prefix="/knowledge", tags=["Knowledge Assistant"])

@router.post("/ask", response_model=KnowledgeResponse)
async def ask_knowledge(request: KnowledgeRequest):
    if not request.question.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Question string cannot be empty."
        )

    result = await ai_service.ask_knowledge(
        category=request.category,
        question=request.question.strip()
    )
    return result
