from __future__ import annotations

from datetime import datetime
import os
import shutil

from fastapi import APIRouter, BackgroundTasks, Depends, File, HTTPException, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.config import settings
from app.core.analysis_worker import run_analysis_pipeline
from app.db.database import get_db
from app.db.models import AnalysisResult, Interview, SpeakerSegment, TrainingSession, TranscriptionSegment

router = APIRouter(prefix="/audio", tags=["audio"])

ALLOWED_AUDIO_EXTENSIONS = {".wav", ".mp3", ".m4a", ".webm", ".ogg", ".flac"}


def _validate_audio_file(file: UploadFile):
    extension = os.path.splitext(file.filename or "")[1].lower()
    if extension not in ALLOWED_AUDIO_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported audio format. Allowed: {', '.join(sorted(ALLOWED_AUDIO_EXTENSIONS))}",
        )
    return extension


@router.get("/training/{session_id}")
def get_training_audio(session_id: int, db: Session = Depends(get_db)):
    session = db.query(TrainingSession).filter(TrainingSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Training session not found")

    if not session.audio_path or not os.path.exists(session.audio_path):
        raise HTTPException(status_code=404, detail="Audio file not found")

    return FileResponse(session.audio_path, media_type="audio/mpeg")


@router.get("/interview/{interview_id}")
def get_interview_audio(interview_id: int, db: Session = Depends(get_db)):
    interview = db.query(Interview).filter(Interview.id == interview_id).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    if not interview.audio_path or not os.path.exists(interview.audio_path):
        raise HTTPException(status_code=404, detail="Audio file not found")

    return FileResponse(interview.audio_path, media_type="audio/mpeg")


@router.post("/upload/test")
async def upload_test_audio(file: UploadFile = File(...)):
    extension = _validate_audio_file(file)
    return {
        "filename": file.filename,
        "content_type": file.content_type,
        "extension": extension,
        "message": "File validated successfully (not saved)",
    }


@router.post("/interview/{interview_id}/upload")
async def upload_audio(
    interview_id: int,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    interview = db.query(Interview).filter(Interview.id == interview_id).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    extension = _validate_audio_file(file)

    interview_dir = os.path.join(settings.AUDIO_UPLOAD_PATH, "interviews")
    os.makedirs(interview_dir, exist_ok=True)

    safe_filename = f"interview_{interview_id}_{int(datetime.now().timestamp())}{extension}"
    file_path = os.path.join(interview_dir, safe_filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    if interview.audio_path and os.path.exists(interview.audio_path):
        try:
            os.remove(interview.audio_path)
        except OSError:
            pass

    db.query(AnalysisResult).filter(AnalysisResult.interview_id == interview_id).delete(synchronize_session=False)
    db.query(TranscriptionSegment).filter(TranscriptionSegment.interview_id == interview_id).delete(synchronize_session=False)
    db.query(SpeakerSegment).filter(SpeakerSegment.interview_id == interview_id).delete(synchronize_session=False)

    interview.audio_path = file_path
    interview.status = "uploaded"
    db.commit()

    background_tasks.add_task(run_analysis_pipeline, interview_id)

    return {
        "message": "Audio uploaded successfully. Analysis started.",
        "interview_id": interview_id,
        "audio_path": file_path,
        "status": "uploaded",
    }
