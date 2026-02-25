from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.db.models import JobSession
from app.schemas.job_session import JobSession as JobSessionSchema, JobSessionCreate, JobSessionUpdate

router = APIRouter(prefix="/job-sessions", tags=["job-sessions"])

@router.get("/", response_model=List[JobSessionSchema])
def read_job_sessions(
    skip: int = 0,
    limit: int = 100,
    owner_id: int = None,
    db: Session = Depends(get_db)
):
    """Get all job sessions, optionally filtered by owner"""
    query = db.query(JobSession)
    if owner_id:
        query = query.filter(JobSession.owner_user_id == owner_id)
    
    sessions = query.offset(skip).limit(limit).all()
    return sessions

@router.post("/", response_model=JobSessionSchema, status_code=status.HTTP_201_CREATED)
def create_job_session(
    session: JobSessionCreate,
    db: Session = Depends(get_db)
):
    """Create a new job session"""
    db_session = JobSession(**session.model_dump())
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session

@router.get("/{session_id}", response_model=JobSessionSchema)
def read_job_session(
    session_id: int,
    db: Session = Depends(get_db)
):
    """Get job session by ID"""
    session = db.query(JobSession).filter(JobSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Job session not found")
    return session

@router.put("/{session_id}", response_model=JobSessionSchema)
def update_job_session(
    session_id: int,
    session_update: JobSessionUpdate,
    db: Session = Depends(get_db)
):
    """Update job session by ID"""
    session = db.query(JobSession).filter(JobSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Job session not found")
    
    for field, value in session_update.model_dump(exclude_unset=True).items():
        setattr(session, field, value)
    
    db.commit()
    db.refresh(session)
    return session

@router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_job_session(
    session_id: int,
    db: Session = Depends(get_db)
):
    """Delete job session by ID"""
    session = db.query(JobSession).filter(JobSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Job session not found")
    
    db.delete(session)
    db.commit()
    return None