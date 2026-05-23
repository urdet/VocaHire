from __future__ import annotations

from datetime import datetime
import os
import shutil
import tempfile

from fastapi import APIRouter, BackgroundTasks, Depends, File, HTTPException, UploadFile
from fastapi.responses import FileResponse
from pydub import AudioSegment
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


def _save_upload_as_wav(file: UploadFile, dest_dir: str, base_name: str) -> str:
    """
    Save an uploaded audio file as a normalized WAV (mono, 16 kHz, 16-bit PCM).
    Returns the absolute-ish path where the WAV was written.

    pyannote and soundfile only reliably read WAV/FLAC/OGG, so we always
    re-encode to WAV regardless of the source format (m4a, mp3, webm, ...).
    """
    extension = os.path.splitext(file.filename or "")[1].lower() or ".tmp"

    # 1) Dump the incoming bytes to a temp file (pydub needs a path on disk)
    with tempfile.NamedTemporaryFile(delete=False, suffix=extension) as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name

    # 2) Convert to WAV using pydub (which uses ffmpeg under the hood)
    wav_path = os.path.join(dest_dir, base_name + ".wav")
    try:
        audio = AudioSegment.from_file(tmp_path)
        # Normalize: mono 16 kHz 16-bit PCM — what Whisper / pyannote expect
        audio = audio.set_channels(1).set_frame_rate(16000).set_sample_width(2)
        audio.export(wav_path, format="wav")
    finally:
        try:
            os.remove(tmp_path)
        except OSError:
            pass

    return wav_path


@router.get("/training/{session_id}")
def get_training_audio(session_id: int, db: Session = Depends(get_db)):
    session = db.query(TrainingSession).filter(TrainingSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Training session not found")

    if not session.audio_path or not os.path.exists(session.audio_path):
        raise HTTPException(status_code=404, detail="Audio file not found")

    return FileResponse(session.audio_path, media_type="audio/wav")


@router.get("/interview/{interview_id}")
def get_interview_audio(interview_id: int, db: Session = Depends(get_db)):
    interview = db.query(Interview).filter(Interview.id == interview_id).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    if not interview.audio_path or not os.path.exists(interview.audio_path):
        raise HTTPException(status_code=404, detail="Audio file not found")

    return FileResponse(interview.audio_path, media_type="audio/wav")


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

    # Validate the file extension (gives a clean 400 if user uploads junk)
    _validate_audio_file(file)

    # Where to put it
    interview_dir = os.path.join(settings.AUDIO_UPLOAD_PATH, "interviews")
    os.makedirs(interview_dir, exist_ok=True)

    base_name = f"interview_{interview_id}_{int(datetime.now().timestamp())}"

    # Convert to WAV regardless of source format (m4a, mp3, webm, ...)
    try:
        file_path = _save_upload_as_wav(file, interview_dir, base_name)
    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail=(
                "Could not decode the uploaded audio. "
                "Make sure FFmpeg is installed and the file is a valid audio file. "
                f"Details: {exc}"
            ),
        )

    # Clean up any previous audio for this interview
    if interview.audio_path and os.path.exists(interview.audio_path) and interview.audio_path != file_path:
        try:
            os.remove(interview.audio_path)
        except OSError:
            pass

    # Wipe previous analysis artifacts for this interview before reanalyzing
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