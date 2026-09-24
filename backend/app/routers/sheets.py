from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, AiInteraction, SheetSyncLog
from app.schemas import SheetSyncRequest, SheetSyncResponse
from app.dependencies import get_current_user
from app.services.sheets_service import sheets_service
from app.config import settings

router = APIRouter(prefix="/api/sheets", tags=["Google Sheets"])

@router.get("/config")
def get_sheets_config(current_user: User = Depends(get_current_user)):
    return {
        "configured_sheet_id": settings.GOOGLE_SHEET_ID or "",
        "service_ready": True,
        "default_url": f"https://docs.google.com/spreadsheets/d/{settings.GOOGLE_SHEET_ID}" if settings.GOOGLE_SHEET_ID else ""
    }

@router.post("/sync", response_model=SheetSyncResponse)
def sync_data(
    req: SheetSyncRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    target_sheet_id = req.sheet_id or settings.GOOGLE_SHEET_ID or "1DemoNexusAI-SheetId-Sync"

    user_records = []
    if req.include_users:
        users = db.query(User).all()
        user_records = [
            {"id": u.id, "email": u.email, "role": u.role, "is_active": u.is_active, "created_at": u.created_at}
            for u in users
        ]

    ai_records = []
    if req.include_ai_history:
        interactions = db.query(AiInteraction).order_by(AiInteraction.created_at.desc()).limit(100).all()
        ai_records = [
            {"id": a.id, "prompt": a.prompt, "response": a.response, "model_used": a.model_used, "created_at": a.created_at}
            for a in interactions
        ]

    result = sheets_service.sync_data_to_sheet(
        sheet_id=target_sheet_id,
        user_records=user_records,
        ai_records=ai_records,
        access_token=req.google_access_token
    )

    # Save log to database
    log = SheetSyncLog(
        user_id=current_user.id,
        sheet_id=target_sheet_id,
        records_count=result["synced_records_count"],
        status=result["status"],
        synced_at=result["synced_at"]
    )
    db.add(log)
    db.commit()

    return SheetSyncResponse(
        status=result["status"],
        message=f"Synchronized {result['synced_records_count']} records with Google Sheets.",
        sheet_id=result["sheet_id"],
        sheet_url=result["sheet_url"],
        synced_records_count=result["synced_records_count"],
        synced_at=result["synced_at"]
    )

@router.get("/logs")
def get_sync_logs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    logs = db.query(SheetSyncLog).order_by(SheetSyncLog.synced_at.desc()).limit(20).all()
    return logs
