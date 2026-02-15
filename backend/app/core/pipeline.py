# app/core/pipeline.py

#audio → diarization → transcription → alignment → GPT → final score


from typing import Dict, List

from core.diarization import run_diarization
from core.transcription import transcribe_audio
from core.alignement import extract_candidate_speech
from core.gpt_analysis import analyze_candidate_with_gemini


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
    print(f"Starting evaluation for audio: {audio_path}")
    # 1. Speaker diarization
    diarization_result = run_diarization(audio_path)
    print("Diarization completed. started transcription...")
    # 2. Transcription
    transcription_result = transcribe_audio(audio_path)
    print("Transcription completed. started alignment...")
    # 3. Extract candidate-only speech
    candidate_text = extract_candidate_speech(
        diarization=diarization_result,
        segments=transcription_result,
    )
    print("Alignment completed. started Gemini analysis...")

    # 4. GPT evaluation
    gemini_scores = analyze_candidate_with_gemini(
        transcript=candidate_text,
        job_title=job_title,
        required_qualities=required_qualities,
    )

    # 5. Final score
    final_score = compute_final_score(
        content=gemini_scores["content_relevance"],
        confidence=gemini_scores["vocal_confidence"],
        clarity=gemini_scores["clarity_of_speech"],
        fluency=gemini_scores["fluency"],
    )
    print("Final Score:", final_score,"\nscore details:", gemini_scores)
    return {
        "content_relevance": gemini_scores["content_relevance"],
        "vocal_confidence": gemini_scores["vocal_confidence"],
        "clarity_of_speech": gemini_scores["clarity_of_speech"],
        "fluency": gemini_scores["fluency"],
        "final_score": final_score,
        "feedback": gemini_scores["short_feedback"],
        "candidate_transcript": candidate_text,
    }
