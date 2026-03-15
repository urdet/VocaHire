# backend/app/api/routes/db/analysis.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import Interview, AnalysisResult

router = APIRouter(prefix="/analysis", tags=["analysis"])


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

    if interview.status in ["uploaded", "processing"]:
        return {
            "status": interview.status,
            "message": "Analysis is still running"
        }

    if interview.status == "failed":
        return {
            "status": "failed",
            "message": "Analysis failed"
        }

    analysis = db.query(AnalysisResult).filter(
        AnalysisResult.interview_id == interview_id
    ).first()

    if not analysis:
        return {
            "status": "processing",
            "message": "No analysis result yet"
        }

    return {
        "status": "completed",
        "content_relevance": float(analysis.content_relevance or 0),
        "vocal_confidence": float(analysis.vocal_confidence or 0),
        "clarity_of_speech": float(analysis.clarity_of_speech or 0),
        "fluency": float(analysis.fluency or 0),
        "final_score": float(analysis.final_score or 0),
        "feedback": analysis.feedback or ""
    }