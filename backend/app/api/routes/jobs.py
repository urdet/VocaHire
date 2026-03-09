from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db import crud

router = APIRouter()


@router.get("/{job_id}")

def get_job_status(job_id: int, db: Session = Depends(get_db)):

    job = crud.get_job(db, job_id)

    return {
        "job_id": job.id,
        "status": job.status,
        "result": job.result
    }