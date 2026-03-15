import traceback
from app.db.database import SessionLocal
from app.db.models import Interview, AnalysisResult
from app.core.pipeline import full_audio_evaluation

def run_analysis_pipeline(interview_id: int):
    db = SessionLocal()
    interview = None

    try:
        print(f"[WORKER] Starting analysis for interview_id={interview_id}")

        interview = db.query(Interview).filter(Interview.id == interview_id).first()
        if not interview:
            print(f"[WORKER] Interview {interview_id} not found")
            return

        interview.status = "processing"
        db.commit()
        db.refresh(interview)

        print(f"[WORKER] audio_path={interview.audio_path}")

        if not interview.job_session:
            print("[WORKER] No job_session linked")
            interview.status = "failed"
            db.commit()
            return

        job_title = getattr(interview.job_session, "job_title", "") or ""
        qualities_raw = getattr(interview.job_session, "qualities", "") or ""

        required_qualities = [
            q.strip() for q in qualities_raw.split(",") if q.strip()
        ] if isinstance(qualities_raw, str) else []

        print(f"[WORKER] job_title={job_title}")
        print(f"[WORKER] required_qualities={required_qualities}")

        result = full_audio_evaluation(
            audio_path=interview.audio_path,
            job_title=job_title,
            required_qualities=required_qualities
        )

        print(f"[WORKER] Pipeline result={result}")

        analysis = db.query(AnalysisResult).filter(
            AnalysisResult.interview_id == interview.id
        ).first()

        if not analysis:
            analysis = AnalysisResult(interview_id=interview.id)
            db.add(analysis)

        analysis.content_relevance = float(result["content_relevance"])
        analysis.vocal_confidence = float(result["vocal_confidence"])
        analysis.clarity_of_speech = float(result["clarity_of_speech"])
        analysis.fluency = float(result["fluency"])
        analysis.final_score = float(result["final_score"])
        analysis.feedback = result["feedback"]

        interview.status = "completed"
        db.commit()

        print(f"[WORKER] Completed interview_id={interview_id}")

    except Exception as exc:
        print(f"[WORKER ERROR] {exc}")
        traceback.print_exc()

        if interview:
            try:
                interview.status = "failed"
                db.commit()
            except Exception as db_exc:
                print(f"[WORKER DB ERROR] {db_exc}")

    finally:
        db.close()