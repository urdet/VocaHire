from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import os
from typing import Optional
from app.db.database import get_db
from app.db.models import Interview, TrainingSession
from app.config import settings

router = APIRouter(prefix="/audio", tags=["audio"])

@router.get("/interview/{interview_id}")
def get_interview_audio(
    interview_id: int,
    db: Session = Depends(get_db)
):
    """Get audio file for an interview"""
    interview = db.query(Interview).filter(Interview.id == interview_id).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    
    if not interview.audio_path or not os.path.exists(interview.audio_path):
        raise HTTPException(status_code=404, detail="Audio file not found")
    
    return FileResponse(
        interview.audio_path,
        media_type="audio/mpeg",
        filename=f"interview_{interview_id}.mp3"
    )

@router.get("/training/{session_id}")
def get_training_audio(
    session_id: int,
    db: Session = Depends(get_db)
):
    """Get audio file for a training session"""
    session = db.query(TrainingSession).filter(TrainingSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Training session not found")
    
    if not session.audio_path or not os.path.exists(session.audio_path):
        raise HTTPException(status_code=404, detail="Audio file not found")
    
    return FileResponse(
        session.audio_path,
        media_type="audio/mpeg",
        filename=f"training_{session_id}.mp3"
    )

@router.post("/upload/test")
async def upload_test_audio(
    file: UploadFile = File(...)
):
    """Test endpoint for audio upload"""
    # Validate file type
    if not file.content_type.startswith('audio/'):
        raise HTTPException(status_code=400, detail="File must be an audio file")
    
    # Validate file size (check content-length header if available)
    # Note: This is a simple check, for production use more robust validation
    
    return {
        "filename": file.filename,
        "content_type": file.content_type,
        "size": "Check headers for size",
        "message": "File uploaded successfully (not saved)"
    }