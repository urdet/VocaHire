from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.db.models import CandidateListItem, JobSession
from app.schemas.candidate import CandidateListItem as CandidateSchema, CandidateListItemCreate, CandidateListItemUpdate

router = APIRouter(prefix="/candidates", tags=["candidates"])

@router.get("/", response_model=List[CandidateSchema])
def read_candidates(
    skip: int = 0,
    limit: int = 100,
    job_session_id: int = None,
    db: Session = Depends(get_db)
):
    """Get all candidates, optionally filtered by job session"""
    query = db.query(CandidateListItem)
    if job_session_id:
        query = query.filter(CandidateListItem.job_session_id == job_session_id)
    
    candidates = query.offset(skip).limit(limit).all()
    return candidates

@router.get("/job-session/{job_session_id}", response_model=List[CandidateSchema])
def read_candidates_by_session(
    job_session_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all candidates for a specific job session"""
    # Verify job session exists
    job_session = db.query(JobSession).filter(JobSession.id == job_session_id).first()
    if not job_session:
        raise HTTPException(status_code=404, detail="Job session not found")
    
    candidates = db.query(CandidateListItem).filter(
        CandidateListItem.job_session_id == job_session_id
    ).offset(skip).limit(limit).all()
    return candidates

@router.post("/", response_model=CandidateSchema, status_code=status.HTTP_201_CREATED)
def create_candidate(
    candidate: CandidateListItemCreate,
    db: Session = Depends(get_db)
):
    """Create a new candidate"""
    # Verify job session exists
    job_session = db.query(JobSession).filter(JobSession.id == candidate.job_session_id).first()
    if not job_session:
        raise HTTPException(status_code=404, detail="Job session not found")
    
    db_candidate = CandidateListItem(**candidate.model_dump())
    db.add(db_candidate)
    db.commit()
    db.refresh(db_candidate)
    return db_candidate

@router.get("/{candidate_id}", response_model=CandidateSchema)
def read_candidate(
    candidate_id: int,
    db: Session = Depends(get_db)
):
    """Get candidate by ID"""
    candidate = db.query(CandidateListItem).filter(CandidateListItem.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return candidate

@router.put("/{candidate_id}", response_model=CandidateSchema)
def update_candidate(
    candidate_id: int,
    candidate_update: CandidateListItemUpdate,
    db: Session = Depends(get_db)
):
    """Update candidate by ID"""
    candidate = db.query(CandidateListItem).filter(CandidateListItem.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    for field, value in candidate_update.model_dump(exclude_unset=True).items():
        setattr(candidate, field, value)
    
    db.commit()
    db.refresh(candidate)
    return candidate

@router.delete("/{candidate_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_candidate(
    candidate_id: int,
    db: Session = Depends(get_db)
):
    """Delete candidate by ID"""
    candidate = db.query(CandidateListItem).filter(CandidateListItem.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    db.delete(candidate)
    db.commit()
    return None