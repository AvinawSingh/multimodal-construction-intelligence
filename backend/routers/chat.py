from fastapi import APIRouter, HTTPException, status
from schemas.models import ChatRequest, ChatResponse
from services.ai_service import ai_service

router = APIRouter(prefix="/chat", tags=["Construction Chatbot"])

@router.post("/message", response_model=ChatResponse)
async def chat_message(request: ChatRequest):
    if not request.message.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Chat message cannot be empty."
        )

    result = await ai_service.chat_completion(
        message=request.message.strip(),
        history=request.history
    )
    return result
