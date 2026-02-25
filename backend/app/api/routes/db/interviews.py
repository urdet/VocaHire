from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import shutil
from datetime import datetime
from app.db.database import get_db
from app.db.models import Interview, JobSession, CandidateListItem
from app.schemas.interview import Interview as InterviewSchema, InterviewCreate, InterviewUpdate
from app.config import settings

router = APIRouter(prefix="/interviews", tags=["interviews"])

@router.get("/", response_model=List[InterviewSchema])
def read_interviews(
    skip: int = 0,
    limit: int = 100,
    job_session_id: Optional[int] = None,
    candidate_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Get all interviews, optionally filtered by job session or candidate"""
    query = db.query(Interview)
    
    if job_session_id:
        query = query.filter(Interview.job_session_id == job_session_id)
    
    if candidate_id:
        query = query.filter(Interview.candidate_item_id == candidate_id)
    
    interviews = query.offset(skip).limit(limit).all()
    return interviews

@router.post("/", response_model=InterviewSchema, status_code=status.HTTP_201_CREATED)
async def create_interview(
    job_session_id: int = Form(...),
    candidate_item_id: int = Form(...),
    audio_file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Create a new interview with audio file upload"""
    # Verify job session exists
    job_session = db.query(JobSession).filter(JobSession.id == job_session_id).first()
    if not job_session:
        raise HTTPException(status_code=404, detail="Job session not found")
    
    # Verify candidate exists and belongs to this job session
    candidate = db.query(CandidateListItem).filter(
        CandidateListItem.id == candidate_item_id,
        CandidateListItem.job_session_id == job_session_id
    ).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found in this job session")
    
    # Check if interview already exists for this candidate
    existing_interview = db.query(Interview).filter(
        Interview.job_session_id == job_session_id,
        Interview.candidate_item_id == candidate_item_id
    ).first()
    if existing_interview:
        raise HTTPException(status_code=400, detail="Interview already exists for this candidate")
    
    # Save audio file
    file_extension = os.path.splitext(audio_file.filename)[1]
    file_name = f"interview_{job_session_id}_{candidate_item_id}_{datetime.now().timestamp()}{file_extension}"
    file_path = os.path.join(settings.AUDIO_UPLOAD_PATH, file_name)
    
    # Ensure directory exists
    os.makedirs(settings.AUDIO_UPLOAD_PATH, exist_ok=True)
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(audio_file.file, buffer)
    
    # Create interview record
    interview_data = InterviewCreate(
        job_session_id=job_session_id,
        candidate_item_id=candidate_item_id,
        audio_path=file_path,
        status="processing"
    )
    
    db_interview = Interview(**interview_data.model_dump())
    db.add(db_interview)
    db.commit()
    db.refresh(db_interview)
    
    return db_interview

@router.post("/without-audio", response_model=InterviewSchema, status_code=status.HTTP_201_CREATED)
def create_interview_without_audio(
    interview: InterviewCreate,
    db: Session = Depends(get_db)
):
    """Create a new interview without audio file (for testing or external storage)"""
    # Verify job session exists
    job_session = db.query(JobSession).filter(JobSession.id == interview.job_session_id).first()
    if not job_session:
        raise HTTPException(status_code=404, detail="Job session not found")
    
    # Verify candidate exists and belongs to this job session
    candidate = db.query(CandidateListItem).filter(
        CandidateListItem.id == interview.candidate_item_id,
        CandidateListItem.job_session_id == interview.job_session_id
    ).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found in this job session")
    
    # Check if interview already exists
    existing_interview = db.query(Interview).filter(
        Interview.job_session_id == interview.job_session_id,
        Interview.candidate_item_id == interview.candidate_item_id
    ).first()
    if existing_interview:
        raise HTTPException(status_code=400, detail="Interview already exists for this candidate")
    
    db_interview = Interview(**interview.model_dump())
    db.add(db_interview)
    db.commit()
    db.refresh(db_interview)
    return db_interview

@router.get("/{interview_id}", response_model=InterviewSchema)
def read_interview(
    interview_id: int,
    db: Session = Depends(get_db)
):
    """Get interview by ID"""
    interview = db.query(Interview).filter(Interview.id == interview_id).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    return interview

@router.put("/{interview_id}", response_model=InterviewSchema)
def update_interview(
    interview_id: int,
    interview_update: InterviewUpdate,
    db: Session = Depends(get_db)
):
    """Update interview by ID"""
    interview = db.query(Interview).filter(Interview.id == interview_id).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    
    for field, value in interview_update.model_dump(exclude_unset=True).items():
        setattr(interview, field, value)
    
    interview.updated_at = datetime.now()
    db.commit()
    db.refresh(interview)
    return interview

@router.delete("/{interview_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_interview(
    interview_id: int,
    db: Session = Depends(get_db)
):
    """Delete interview by ID"""
    interview = db.query(Interview).filter(Interview.id == interview_id).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    
    # Delete audio file if it exists
    if interview.audio_path and os.path.exists(interview.audio_path):
        try:
            os.remove(interview.audio_path)
        except OSError:
            # Log error but continue with database deletion
            pass
    
    db.delete(interview)
    db.commit()
    return None