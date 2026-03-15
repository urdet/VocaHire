# backend/app/api/routes/audio.py

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import os
import shutil
from datetime import datetime

from app.db.database import get_db
from app.db.models import Interview, TrainingSession, AnalysisResult
from app.core.analysis_worker import run_analysis_pipeline

router = APIRouter(prefix="/audio", tags=["audio"])


@router.get("/training/{session_id}")
def get_training_audio(
    session_id: int,
    db: Session = Depends(get_db)
):
    session = db.query(TrainingSession).filter(
        TrainingSession.id == session_id
    ).first()

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
async def upload_test_audio(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("audio/"):
        raise HTTPException(status_code=400, detail="File must be an audio file")

    return {
        "filename": file.filename,
        "content_type": file.content_type,
        "message": "File uploaded successfully (not saved)"
    }


@router.post("/interview/{interview_id}/upload")
async def upload_audio(
    interview_id: int,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Upload audio file, update interview path, reset previous result if needed,
    and launch background analysis.
    """

    interview = db.query(Interview).filter(
        Interview.id == interview_id
    ).first()

    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    if not file.content_type or not file.content_type.startswith("audio/"):
        raise HTTPException(status_code=400, detail="File must be audio")

    audio_dir = "audios"
    os.makedirs(audio_dir, exist_ok=True)

    original_ext = os.path.splitext(file.filename)[1].lower()
    if not original_ext:
        original_ext = ".wav"

    safe_filename = f"interview_{interview_id}_{int(datetime.now().timestamp())}{original_ext}"
    file_path = os.path.join(audio_dir, safe_filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # reset old analysis if re-upload
    old_analysis = db.query(AnalysisResult).filter(
        AnalysisResult.interview_id == interview_id
    ).first()
    if old_analysis:
        db.delete(old_analysis)

    interview.audio_path = file_path
    interview.status = "uploaded"
    db.commit()

    background_tasks.add_task(run_analysis_pipeline, interview_id)

    return {
        "message": "Audio uploaded successfully. Analysis started.",
        "interview_id": interview_id,
        "audio_path": file_path,
        "status": "uploaded"
    }