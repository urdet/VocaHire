import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../../')))
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.database import get_db
from app.db.models import AnalysisResult, Interview
from app.schemas.analysis import AnalysisResult as AnalysisSchema, AnalysisResultCreate, AnalysisResultUpdate

router = APIRouter(prefix="/analysis", tags=["analysis"])

@router.get("/", response_model=List[AnalysisSchema])
def read_analysis_results(
    skip: int = 0,
    limit: int = 100,
    interview_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Get all analysis results, optionally filtered by interview"""
    query = db.query(AnalysisResult)
    if interview_id:
        query = query.filter(AnalysisResult.interview_id == interview_id)
    
    results = query.offset(skip).limit(limit).all()
    return results

@router.post("/", response_model=AnalysisSchema, status_code=status.HTTP_201_CREATED)
def create_analysis_result(
    analysis: AnalysisResultCreate,
    db: Session = Depends(get_db)
):
    """Create a new analysis result"""
    # Verify interview exists
    interview = db.query(Interview).filter(Interview.id == analysis.interview_id).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    
    # Check if analysis already exists for this interview
    existing_analysis = db.query(AnalysisResult).filter(
        AnalysisResult.interview_id == analysis.interview_id
    ).first()
    if existing_analysis:
        raise HTTPException(status_code=400, detail="Analysis already exists for this interview")
    
    db_analysis = AnalysisResult(**analysis.model_dump())
    db.add(db_analysis)
    db.commit()
    db.refresh(db_analysis)
    return db_analysis

@router.get("/interview/{interview_id}", response_model=AnalysisSchema)
def read_analysis_by_interview(
    interview_id: int,
    db: Session = Depends(get_db)
):
    """Get analysis result by interview ID"""
    analysis = db.query(AnalysisResult).filter(AnalysisResult.interview_id == interview_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found for this interview")
    return analysis

@router.get("/{analysis_id}", response_model=AnalysisSchema)
def read_analysis_result(
    analysis_id: int,
    db: Session = Depends(get_db)
):
    """Get analysis result by ID"""
    analysis = db.query(AnalysisResult).filter(AnalysisResult.id == analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis result not found")
    return analysis

@router.put("/{analysis_id}", response_model=AnalysisSchema)
def update_analysis_result(
    analysis_id: int,
    analysis_update: AnalysisResultUpdate,
    db: Session = Depends(get_db)
):
    """Update analysis result by ID"""
    analysis = db.query(AnalysisResult).filter(AnalysisResult.id == analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis result not found")
    
    for field, value in analysis_update.model_dump(exclude_unset=True).items():
        setattr(analysis, field, value)
    
    db.commit()
    db.refresh(analysis)
    return analysis

@router.delete("/{analysis_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_analysis_result(
    analysis_id: int,
    db: Session = Depends(get_db)
):
    """Delete analysis result by ID"""
    analysis = db.query(AnalysisResult).filter(AnalysisResult.id == analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis result not found")
    
    db.delete(analysis)
    db.commit()
    return None