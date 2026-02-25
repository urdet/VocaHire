from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import shutil
from datetime import datetime
from app.db.database import get_db
from app.db.models import TrainingSession, User
from app.schemas.training import TrainingSession as TrainingSchema, TrainingSessionCreate
from app.config import settings

router = APIRouter(prefix="/training", tags=["training"])

@router.get("/", response_model=List[TrainingSchema])
def read_training_sessions(
    skip: int = 0,
    limit: int = 100,
    user_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Get all training sessions, optionally filtered by user"""
    query = db.query(TrainingSession)
    if user_id:
        query = query.filter(TrainingSession.user_id == user_id)
    
    sessions = query.offset(skip).limit(limit).all()
    return sessions

@router.post("/", response_model=TrainingSchema, status_code=status.HTTP_201_CREATED)
async def create_training_session(
    user_id: int = Form(...),
    difficulty_level: Optional[str] = Form(None),
    audio_file: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    """Create a new training session with optional audio file"""
    # Verify user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    audio_path = None
    if audio_file:
        # Save audio file
        file_extension = os.path.splitext(audio_file.filename)[1]
        file_name = f"training_{user_id}_{datetime.now().timestamp()}{file_extension}"
        file_path = os.path.join(settings.AUDIO_UPLOAD_PATH, "training", file_name)
        
        # Ensure directory exists
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(audio_file.file, buffer)
        
        audio_path = file_path
    
    session_data = TrainingSessionCreate(
        user_id=user_id,
        audio_path=audio_path,
        difficulty_level=difficulty_level
    )
    
    db_session = TrainingSession(**session_data.model_dump())
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session

@router.post("/without-audio", response_model=TrainingSchema, status_code=status.HTTP_201_CREATED)
def create_training_session_without_audio(
    session: TrainingSessionCreate,
    db: Session = Depends(get_db)
):
    """Create a new training session without audio file"""
    # Verify user exists
    user = db.query(User).filter(User.id == session.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db_session = TrainingSession(**session.model_dump())
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session

@router.get("/{session_id}", response_model=TrainingSchema)
def read_training_session(
    session_id: int,
    db: Session = Depends(get_db)
):
    """Get training session by ID"""
    session = db.query(TrainingSession).filter(TrainingSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Training session not found")
    return session

@router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_training_session(
    session_id: int,
    db: Session = Depends(get_db)
):
    """Delete training session by ID"""
    session = db.query(TrainingSession).filter(TrainingSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Training session not found")
    
    # Delete audio file if it exists
    if session.audio_path and os.path.exists(session.audio_path):
        try:
            os.remove(session.audio_path)
        except OSError:
            # Log error but continue with database deletion
            pass
    
    db.delete(session)
    db.commit()
    return None