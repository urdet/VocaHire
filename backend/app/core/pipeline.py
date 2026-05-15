# app/core/pipeline.py
#
# audio -> diarization -> transcription -> alignment -> Gemini -> final score

from typing import Dict, List

from app.core.diarization import run_diarization
from app.core.transcription import transcribe_audio
from app.core.alignement import extract_candidate_speech
from app.core.gpt_analysis import analyze_candidate_with_gemini


def compute_final_score(
    content: float,
    confidence: float,
    clarity: float,
    fluency: float,
) -> float:
    """
    Weighted final score on a 0-100 scale.
    Weights from the functional document:
        0.4 * content + 0.3 * confidence + 0.2 * clarity + 0.1 * fluency
    """
    return round(
        0.4 * content
        + 0.3 * confidence
        + 0.2 * clarity
        + 0.1 * fluency,
        2,
    )


def _segments_to_text(segments: List[dict]) -> str:
    """Flatten aligned candidate segments into a single transcript string."""
    return " ".join(seg["text"] for seg in segments if seg.get("text"))


def full_audio_evaluation(
    audio_path: str,
    job_title: str,
    required_qualities: List[str],
) -> Dict:
    """
    Full evaluation pipeline:
      1. Speaker diarization (pyannote)
      2. Transcription (Whisper)
      3. Alignment + candidate-only extraction
      4. Gemini evaluation
      5. Final weighted score
    """
    print(f"Starting evaluation for audio: {audio_path}")

    # 1. Speaker diarization
    diarization_result = run_diarization(audio_path)
    print("Diarization completed. Starting transcription...")

    # 2. Transcription (returns list of {start, end, text, ...})
    transcription_segments = transcribe_audio(audio_path)
    print("Transcription completed. Starting alignment...")

    # 3. Extract candidate-only speech segments
    candidate_segments = extract_candidate_speech(
        diarization=diarization_result,
        segments=transcription_segments,
    )
    candidate_text = _segments_to_text(candidate_segments)
    print(f"Alignment completed. Candidate transcript length: {len(candidate_text)} chars")

    # 4. Gemini evaluation (scores are on 0-100 scale)
    gemini_scores = analyze_candidate_with_gemini(
        transcript=candidate_text,
        job_title=job_title,
        required_qualities=required_qualities,
    )

    # 5. Final score (also 0-100)
    final_score = compute_final_score(
        content=gemini_scores["content_relevance"],
        confidence=gemini_scores["vocal_confidence"],
        clarity=gemini_scores["clarity_of_speech"],
        fluency=gemini_scores["fluency"],
    )
    print("Final Score:", final_score, "\nScore details:", gemini_scores)

    return {
        "content_relevance": gemini_scores["content_relevance"],
        "vocal_confidence": gemini_scores["vocal_confidence"],
        "clarity_of_speech": gemini_scores["clarity_of_speech"],
        "fluency": gemini_scores["fluency"],
        "final_score": final_score,
        "feedback": gemini_scores["short_feedback"],
        "candidate_transcript": candidate_text,
        "candidate_segments": candidate_segments,
        "transcription_segments": transcription_segments,
    }