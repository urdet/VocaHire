# backend/app/api/routes/db/analysis.py

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import AnalysisResult, Interview, SpeakerSegment, TranscriptionSegment
from app.core.analysis_progress import get_analysis_progress
from app.core.analysis_worker import run_analysis_pipeline

router = APIRouter(prefix="/analysis", tags=["analysis"])


def _reset_analysis_artifacts(db: Session, interview_id: int) -> None:
    db.query(AnalysisResult).filter(AnalysisResult.interview_id == interview_id).delete(synchronize_session=False)
    db.query(TranscriptionSegment).filter(TranscriptionSegment.interview_id == interview_id).delete(synchronize_session=False)
    db.query(SpeakerSegment).filter(SpeakerSegment.interview_id == interview_id).delete(synchronize_session=False)


@router.get("/interview/{interview_id}")
def get_analysis_results(
    interview_id: int,
    db: Session = Depends(get_db)
):
    """
    Retourne l'état et les résultats d'analyse d'un entretien.
    """

    interview = db.query(Interview).filter(
        Interview.id == interview_id
    ).first()

    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    progress = get_analysis_progress(interview_id)

    if interview.status in ["uploaded", "processing"]:
        return {
            "status": interview.status,
            "message": progress["message"] if progress else "Analysis is still running",
            "progress": progress,
        }

    if interview.status == "failed":
        return {
            "status": "failed",
            "message": progress["message"] if progress else "Analysis failed",
            "progress": progress,
        }

    analysis = db.query(AnalysisResult).filter(
        AnalysisResult.interview_id == interview_id
    ).first()

    if not analysis:
        return {
            "status": "processing",
            "message": progress["message"] if progress else "No analysis result yet",
            "progress": progress,
        }

    return {
        "status": "completed",
        "progress": progress or {
            "phase": "completed",
            "label": "Analysis complete",
            "message": "The report is ready.",
            "progress": 100,
        },
        "content_relevance": float(analysis.content_relevance or 0),
        "vocal_confidence": float(analysis.vocal_confidence or 0),
        "clarity_of_speech": float(analysis.clarity_of_speech or 0),
        "fluency": float(analysis.fluency or 0),
        "final_score": float(analysis.final_score or 0),
        "feedback": analysis.feedback or ""
    }


@router.post("/interview/{interview_id}/retry")
def retry_analysis(
    interview_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    interview = db.query(Interview).filter(Interview.id == interview_id).first()

    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    if not interview.audio_path:
        raise HTTPException(status_code=400, detail="Interview has no uploaded audio")

    _reset_analysis_artifacts(db, interview_id)
    interview.status = "uploaded"
    db.commit()

    background_tasks.add_task(run_analysis_pipeline, interview_id)

    return {
        "status": "uploaded",
        "message": "Analysis restarted.",
        "interview_id": interview_id,
    }
