from app.worker.tasks import process_audio_job


def enqueue_audio_processing(job_id: int, audio_path: str):

    process_audio_job.delay(job_id, audio_path)