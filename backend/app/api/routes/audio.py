# app/api/routes/audio.py

import sys
import os

# Get the parent directory (backend)
sys.path.append(os.path.join(os.path.dirname(__file__), '../..'))
import shutil
from fastapi import APIRouter, UploadFile, File, HTTPException, Query

from core.pipeline import full_audio_evaluation
import subprocess
from db.candidats_list import (
    get_candidat_list_by_id,
    update_candidat_score,
)
from core.pipeline import full_audio_evaluation

router = APIRouter(tags=["Audio"])

AUDIO_DIR = "audios"


@router.post("/upload/{candidate_id}")
def upload_and_analyze_audio(
    candidate_id: int,
    job_title: str = Query(..., description="Job title"),
    required_qualities: str = Query(
        ..., description="Comma-separated qualities"
    ),
    file: UploadFile = File(...),
):
    """
    Upload interview audio, run full AI evaluation,
    and store final score in PostgreSQL.
    """

    # 1️⃣ Check candidate exists
    candidate = get_candidat_list_by_id(candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    # 2️⃣ Save audio file
    os.makedirs(AUDIO_DIR, exist_ok=True)
    audio_path = os.path.join(AUDIO_DIR, f"candidate_{candidate_id}.wav")

    try:
        with open(audio_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to save audio file")

    # 3️⃣ Parse qualities
    qualities_list = [q.strip() for q in required_qualities.split(",") if q.strip()]
    if not qualities_list:
        raise HTTPException(status_code=400, detail="No qualities provided")

    # 4️⃣ Run AI pipeline
    try:
        evaluation = full_audio_evaluation(
            audio_path=audio_path,
            job_title=job_title,
            required_qualities=qualities_list,
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Audio analysis failed: {str(e)}",
        )

    # 5️⃣ Save final score to PostgreSQL
    try:
        update_candidat_score(
            candidat_id=candidate_id,
            score=evaluation["final_score"],
        )
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Failed to update candidate score",
        )

    # 6️⃣ Return response
    return {
        "candidate_id": candidate_id,
        "job_title": job_title,
        "final_score": evaluation["final_score"],
        "details": {
            "content_relevance": evaluation["content_relevance"],
            "vocal_confidence": evaluation["vocal_confidence"],
            "clarity_of_speech": evaluation["clarity_of_speech"],
            "fluency": evaluation["fluency"],
            "feedback": evaluation["feedback"],
        },
    }

import traceback
@router.post("/upload")
def upload_audio(
    job_title: str = Query(..., description="Job title"),
    qualities: str = Query(
        ..., description="Comma-separated qualities"
    ),
    file: UploadFile = File(...),
):
    """
    Upload interview audio and save to storage without analysis.
    """
    print("Received audio upload request for job:", job_title)
    # 1️⃣ Save audio file
    os.makedirs(AUDIO_DIR, exist_ok=True)
    # Validate and convert audio format to WAV if needed
    if not file.filename.lower().endswith('.wav'):
        temp_path = os.path.join(AUDIO_DIR, file.filename)
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        audio_path = os.path.join(AUDIO_DIR, f"audio_{os.path.splitext(file.filename)[0]}.wav")
        try:
            subprocess.run(
                ["ffmpeg", "-i", temp_path, "-acodec", "pcm_s16le", "-ar", "16000", audio_path],
                check=True,
                capture_output=True
            )
            os.remove(temp_path)

        except Exception:
            raise HTTPException(status_code=500, detail="Failed to convert audio to WAV format")
        try:
            with open(audio_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
        except Exception:
            raise HTTPException(status_code=500, detail="Failed to save audio file")
    else:
        audio_path = os.path.join(AUDIO_DIR, file.filename)
        try:
            with open(audio_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
        except Exception:
            raise HTTPException(status_code=500, detail="Failed to save audio file")
        
    print("Audio file saved at:", audio_path)
    # 2️⃣ Parse qualities
    qualities_list = [q.strip() for q in qualities.split(",") if q.strip()]
    if not qualities_list:
        raise HTTPException(status_code=400, detail="No qualities provided")
    print("Parsed qualities:", qualities_list)
    # 3️⃣ Analyse responses
    print("Starting full audio evaluation...")
    try:
        evaluation = full_audio_evaluation(
            audio_path=audio_path,
            job_title=job_title,
            required_qualities=qualities_list,
        )
    except Exception as e:
        traceback.print_exc()
        print("Error during audio evaluation:", str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Audio analysis failed: {str(e)}", 
        )

    return evaluation