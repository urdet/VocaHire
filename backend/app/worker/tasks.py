from app.worker.celery_app import celery_app
from app.core.pipeline import full_audio_evaluation
from app.db.database import SessionLocal
from app.db import crud


@celery_app.task
def process_audio_job(job_id: int, audio_path: str):

    db = SessionLocal()

    try:
        crud.update_job_status(db, job_id, "processing")

        result = full_audio_evaluation(audio_path)

        crud.save_job_result(db, job_id, result)

        crud.update_job_status(db, job_id, "completed")

    except Exception as e:

        crud.update_job_status(db, job_id, "failed")

    finally:
        db.close()