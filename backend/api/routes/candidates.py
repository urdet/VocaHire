# api/routes/candidates.py
import sys
import os

# Get the parent directory (backend)
sys.path.append(os.path.join(os.path.dirname(__file__), '../..'))
from fastapi import APIRouter
from app.db.candidats_list import (
    create_candidat_list,
    get_all_candidat_results
)
from app.schemas.candidate import CandidateCreate

router = APIRouter(tags=["Candidates"])


@router.post("/")
def add_candidate(payload: CandidateCreate):
    candidate_id = create_candidat_list(
        order=payload.order,
        full_name=payload.full_name,
        description=payload.description,
        score=None
    )
    return {"id": candidate_id}


@router.get("/ranking")
def get_ranking():
    return get_all_candidat_results()
