from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, AiInteraction
from app.schemas import AiPromptRequest, AiPromptResponse, AiInteractionOut
from app.dependencies import get_current_user
from app.services.ai_service import ai_service
from datetime import datetime

router = APIRouter(prefix="/api/ai", tags=["AI Integration"])

@router.post("/chat", response_model=AiPromptResponse)
def ask_ai(
    req: AiPromptRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    text, model_used, tokens = ai_service.generate_completion(
        prompt=req.prompt,
        system_prompt=req.system_prompt,
        model=req.model,
        temperature=req.temperature
    )

    interaction = AiInteraction(
        user_id=current_user.id,
        prompt=req.prompt,
        response=text,
        model_used=model_used,
        tokens_used=tokens,
        created_at=datetime.utcnow()
    )
    db.add(interaction)
    db.commit()
    db.refresh(interaction)

    return AiPromptResponse(
        id=interaction.id,
        prompt=interaction.prompt,
        response=interaction.response,
        model=interaction.model_used,
        tokens_used=interaction.tokens_used,
        created_at=interaction.created_at
    )

@router.get("/history", response_model=List[AiInteractionOut])
def get_user_ai_history(
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    records = db.query(AiInteraction)\
        .filter(AiInteraction.user_id == current_user.id)\
        .order_by(AiInteraction.created_at.desc())\
        .limit(limit)\
        .all()
    return records

@router.delete("/history")
def clear_user_ai_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db.query(AiInteraction).filter(AiInteraction.user_id == current_user.id).delete()
    db.commit()
    return {"message": "AI history cleared successfully"}
