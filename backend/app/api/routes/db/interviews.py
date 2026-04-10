from __future__ import annotations

from datetime import datetime
import os
import shutil
from typing import List, Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.config import settings
from app.db.database import get_db
from app.db.models import CandidateListItem, Interview, JobSession
from app.schemas.interview import Interview as InterviewSchema
from app.schemas.interview import InterviewCreate, InterviewUpdate

router = APIRouter(prefix="/interviews", tags=["interviews"])


@router.get("/", response_model=List[InterviewSchema])
def read_interviews(
    skip: int = 0,
    limit: int = 100,
    job_session_id: Optional[int] = None,
    candidate_id: Optional[int] = None,
    candidate_item_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Interview)

    if job_session_id is not None:
        query = query.filter(Interview.job_session_id == job_session_id)

    resolved_candidate_item_id = candidate_item_id if candidate_item_id is not None else candidate_id
    if resolved_candidate_item_id is not None:
        query = query.filter(Interview.candidate_item_id == resolved_candidate_item_id)

    return query.offset(skip).limit(limit).all()


@router.post("/", response_model=InterviewSchema, status_code=status.HTTP_201_CREATED)
async def create_interview(
    job_session_id: int = Form(...),
    candidate_item_id: int = Form(...),
    audio_file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    job_session = db.query(JobSession).filter(JobSession.id == job_session_id).first()
    if not job_session:
        raise HTTPException(status_code=404, detail="Job session not found")

    candidate = db.query(CandidateListItem).filter(
        CandidateListItem.id == candidate_item_id,
        CandidateListItem.job_session_id == job_session_id,
    ).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found in this job session")

    existing_interview = db.query(Interview).filter(
        Interview.job_session_id == job_session_id,
        Interview.candidate_item_id == candidate_item_id,
    ).first()
    if existing_interview:
        raise HTTPException(status_code=400, detail="Interview already exists for this candidate")

    file_extension = os.path.splitext(audio_file.filename or "")[1] or ".wav"
    file_name = f"interview_{job_session_id}_{candidate_item_id}_{int(datetime.now().timestamp())}{file_extension}"
    interview_dir = os.path.join(settings.AUDIO_UPLOAD_PATH, "interviews")
    os.makedirs(interview_dir, exist_ok=True)
    file_path = os.path.join(interview_dir, file_name)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(audio_file.file, buffer)

    interview_data = InterviewCreate(
        job_session_id=job_session_id,
        candidate_item_id=candidate_item_id,
        audio_path=file_path,
        status="uploaded",
    )

    db_interview = Interview(**interview_data.model_dump())
    db.add(db_interview)
    db.commit()
    db.refresh(db_interview)
    return db_interview


@router.post("/without-audio", response_model=InterviewSchema, status_code=status.HTTP_201_CREATED)
def create_interview_without_audio(interview: InterviewCreate, db: Session = Depends(get_db)):
    job_session = db.query(JobSession).filter(JobSession.id == interview.job_session_id).first()
    if not job_session:
        raise HTTPException(status_code=404, detail="Job session not found")

    candidate = db.query(CandidateListItem).filter(
        CandidateListItem.id == interview.candidate_item_id,
        CandidateListItem.job_session_id == interview.job_session_id,
    ).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found in this job session")

    existing_interview = db.query(Interview).filter(
        Interview.job_session_id == interview.job_session_id,
        Interview.candidate_item_id == interview.candidate_item_id,
    ).first()
    if existing_interview:
        return existing_interview

    payload = interview.model_dump()
    payload["audio_path"] = payload.get("audio_path") or "pending-upload"
    payload["status"] = payload.get("status") or "uploaded"

    db_interview = Interview(**payload)
    db.add(db_interview)
    db.commit()
    db.refresh(db_interview)
    return db_interview


@router.get("/{interview_id}", response_model=InterviewSchema)
def read_interview(interview_id: int, db: Session = Depends(get_db)):
    interview = db.query(Interview).filter(Interview.id == interview_id).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    return interview


@router.put("/{interview_id}", response_model=InterviewSchema)
def update_interview(interview_id: int, interview_update: InterviewUpdate, db: Session = Depends(get_db)):
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
def delete_interview(interview_id: int, db: Session = Depends(get_db)):
    interview = db.query(Interview).filter(Interview.id == interview_id).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    if interview.audio_path and os.path.exists(interview.audio_path):
        try:
            os.remove(interview.audio_path)
        except OSError:
            pass

    db.delete(interview)
    db.commit()
    return None
