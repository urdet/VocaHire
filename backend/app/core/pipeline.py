# app/core/pipeline.py

#audio → diarization → transcription → alignment → GPT → final score


from typing import Dict, List

from app.core.diarization import run_diarization
from app.core.transcription import transcribe_audio
from app.core.alignment import extract_candidate_speech
from app.core.gpt_analysis import analyze_candidate_with_gpt


def compute_final_score(
    content: float,
    confidence: float,
    clarity: float,
    fluency: float,
) -> float:
    """
    Final score formula from the functional document.
    """
    return round(
        0.4 * content
        + 0.3 * confidence
        + 0.2 * clarity
        + 0.1 * fluency,
        2,
    )


def full_audio_evaluation(
    audio_path: str,
    job_title: str,
    required_qualities: List[str],
) -> Dict:
    """
    Full evaluation pipeline:
    - diarization
    - transcription
    - speaker alignment
    - GPT analysis
    - final score computation
    """

    # 1. Speaker diarization
    diarization_result = run_diarization(audio_path)

    # 2. Transcription
    transcription_result = transcribe_audio(audio_path)

    # 3. Extract candidate-only speech
    candidate_text = extract_candidate_speech(
        diarization=diarization_result,
        transcription=transcription_result,
    )

    if not candidate_text.strip():
        raise ValueError("No candidate speech detected")

    # 4. GPT evaluation
    gpt_scores = analyze_candidate_with_gpt(
        transcript=candidate_text,
        job_title=job_title,
        required_qualities=required_qualities,
    )

    # 5. Final score
    final_score = compute_final_score(
        content=gpt_scores["content_relevance"],
        confidence=gpt_scores["vocal_confidence"],
        clarity=gpt_scores["clarity_of_speech"],
        fluency=gpt_scores["fluency"],
    )

    return {
        "content_relevance": gpt_scores["content_relevance"],
        "vocal_confidence": gpt_scores["vocal_confidence"],
        "clarity_of_speech": gpt_scores["clarity_of_speech"],
        "fluency": gpt_scores["fluency"],
        "final_score": final_score,
        "feedback": gpt_scores["short_feedback"],
        "candidate_transcript": candidate_text,
    }
