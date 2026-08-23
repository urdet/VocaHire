from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import shutil
import traceback
from datetime import datetime

from app.db.database import get_db, SessionLocal
from app.db.models import (
    Interview,
    JobSession,
    CandidateListItem,
    TranscriptionSegment,
    SpeakerSegment,
    AnalysisResult,
)
from app.schemas.interview import Interview as InterviewSchema, InterviewCreate, InterviewUpdate
from app.config import settings
from app.core.analysis_progress import set_analysis_progress
from app.core.pipeline import full_audio_evaluation

router = APIRouter(prefix="/interviews", tags=["interviews"])


# -------------------------------------------------------------------
# Background task: run the full pipeline and persist results
# -------------------------------------------------------------------

def _parse_qualities(raw: Optional[str]) -> List[str]:
    """JobSession.qualities is stored as Text (comma-separated). Be defensive."""
    if not raw:
        return []
    return [q.strip() for q in raw.split(",") if q.strip()]


def _process_interview_audio(interview_id: int) -> None:
    """
    Runs in a BackgroundTask AFTER the upload response has been sent.
    Opens its own DB session because the request-scoped one is already closed.
    """
    db = SessionLocal()
    try:
        interview = db.query(Interview).filter(Interview.id == interview_id).first()
        if not interview:
            print(f"[pipeline] Interview {interview_id} not found")
            return

        set_analysis_progress(
            interview_id,
            phase="processing",
            label="Preparing interview",
            message="The backend is preparing this interview for analysis.",
            progress=24,
            detail=f"Audio path: {interview.audio_path}",
        )

        job_session = db.query(JobSession).filter(
            JobSession.id == interview.job_session_id
        ).first()
        if not job_session:
            interview.status = "failed"
            db.commit()
            set_analysis_progress(
                interview_id,
                phase="failed",
                label="Analysis failed",
                message="The job session linked to this interview was not found.",
                progress=100,
            )
            return

        job_title = job_session.job_title or job_session.title or "Unknown role"
        required_qualities = _parse_qualities(job_session.qualities)

        # --- Run the heavy pipeline (diarization + Whisper + Gemini) ---
        result = full_audio_evaluation(
            audio_path=interview.audio_path,
            job_title=job_title,
            required_qualities=required_qualities,
            progress_callback=lambda **progress: set_analysis_progress(interview_id, **progress),
        )

        # --- Persist transcription segments ---
        set_analysis_progress(
            interview_id,
            phase="saving",
            label="Saving analysis artifacts",
            message="The backend is saving transcript segments, speaker turns and scores.",
            progress=97,
        )

        for seg in result.get("transcription_segments", []):
            db.add(TranscriptionSegment(
                interview_id=interview.id,
                start_seconds=seg["start"],
                end_seconds=seg["end"],
                transcript=seg.get("text", "").strip(),
            ))

        # --- Persist speaker (candidate-only) segments ---
        for seg in result.get("candidate_segments", []):
            db.add(SpeakerSegment(
                interview_id=interview.id,
                speaker_label=seg["speaker"],
                start_seconds=seg["start"],
                end_seconds=seg["end"],
                text=seg["text"],
            ))

        # --- Persist analysis result ---
        db.add(AnalysisResult(
            interview_id=interview.id,
            content_relevance=result["content_relevance"],
            vocal_confidence=result["vocal_confidence"],
            clarity_of_speech=result["clarity_of_speech"],
            fluency=result["fluency"],
            feedback=result["feedback"],
            final_score=result["final_score"],
        ))

        # --- Update the candidate-list-item score for the dashboard ---
        candidate_item = db.query(CandidateListItem).filter(
            CandidateListItem.id == interview.candidate_item_id
        ).first()
        if candidate_item:
            candidate_item.score = result["final_score"]

        interview.status = "ready"
        db.commit()
        set_analysis_progress(
            interview_id,
            phase="completed",
            label="Analysis complete",
            message="The report is ready.",
            progress=100,
            detail="Scores, transcript and speaker segments were saved successfully.",
        )
        print(f"[pipeline] Interview {interview_id} processed successfully")

    except Exception as exc:
        print(f"[pipeline] Error processing interview {interview_id}: {exc}")
        traceback.print_exc()
        db.rollback()
        # Mark the interview as failed so the UI can surface this
        failed = db.query(Interview).filter(Interview.id == interview_id).first()
        if failed:
            failed.status = "failed"
            db.commit()
        set_analysis_progress(
            interview_id,
            phase="failed",
            label="Analysis failed",
            message=str(exc),
            progress=100,
            detail="Check backend logs for the full traceback.",
        )
    finally:
        db.close()


# -------------------------------------------------------------------
# Routes
# -------------------------------------------------------------------

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
    background_tasks: BackgroundTasks,
    job_session_id: int = Form(...),
    candidate_item_id: int = Form(...),
    audio_file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """Upload an interview audio file and start the analysis pipeline in the background."""
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

    # Kick off the pipeline AFTER the response is sent so the client doesn't wait
    background_tasks.add_task(_process_interview_audio, db_interview.id)

    return db_interview


@router.post("/without-audio", response_model=InterviewSchema, status_code=status.HTTP_201_CREATED)
def create_interview_without_audio(
    interview: InterviewCreate,
    db: Session = Depends(get_db)
):
    """Create a new interview without audio file (for testing or external storage)"""
    job_session = db.query(JobSession).filter(JobSession.id == interview.job_session_id).first()
    if not job_session:
        raise HTTPException(status_code=404, detail="Job session not found")

    candidate = db.query(CandidateListItem).filter(
        CandidateListItem.id == interview.candidate_item_id,
        CandidateListItem.job_session_id == interview.job_session_id
    ).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found in this job session")

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
            pass

    db.delete(interview)
    db.commit()
    return None
