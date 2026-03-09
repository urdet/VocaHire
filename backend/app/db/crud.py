from app.db.models import Job


def create_job(db, audio_path):

    job = Job(audio_path=audio_path, status="pending")

    db.add(job)
    db.commit()
    db.refresh(job)

    return job


def update_job_status(db, job_id, status):

    job = db.query(Job).filter(Job.id == job_id).first()

    job.status = status

    db.commit()


def save_job_result(db, job_id, result):

    job = db.query(Job).filter(Job.id == job_id).first()

    job.result = result

    db.commit()


def get_job(db, job_id):

    return db.query(Job).filter(Job.id == job_id).first()