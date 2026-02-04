# app/api/routes/audio.py

import sys
import os

# Get the parent directory (backend)
sys.path.append(os.path.join(os.path.dirname(__file__), '../..'))
import shutil
from fastapi import APIRouter, UploadFile, File, HTTPException, Query

from app.core.pipeline import full_audio_evaluation
from app.db.candidats_list import (
    get_candidat_list_by_id,
    update_candidat_score,
)

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
