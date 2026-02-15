import os
import json
import threading
from typing import Dict, List

from dotenv import load_dotenv
from google import genai
from google.genai import types

# -------------------------------------------------------------------
# Configuration
# -------------------------------------------------------------------

load_dotenv()

MODEL_NAME = "gemini-2.5-flash"


DEFAULT_RESULT = {
    "content_relevance": 0,
    "vocal_confidence": 0,
    "clarity_of_speech": 0,
    "fluency": 0,
    "short_feedback": "No valid analysis could be generated."
}

RESPONSE_SCHEMA = {
    "type": "object",
    "properties": {
        "content_relevance": {"type": "number", "minimum": 0, "maximum": 1},
        "vocal_confidence": {"type": "number", "minimum": 0, "maximum": 1},
        "clarity_of_speech": {"type": "number", "minimum": 0, "maximum": 1},
        "fluency": {"type": "number", "minimum": 0, "maximum": 1},
        "short_feedback": {"type": "string", "minLength": 10}
    },
    "required": [
        "content_relevance",
        "vocal_confidence",
        "clarity_of_speech",
        "fluency",
        "short_feedback"
    ]
}

SYSTEM_INSTRUCTION = (
    "You are an HR evaluation assistant. "
    "You objectively evaluate interview answers based on job requirements. "
    "Provide float scores between 0 and 100 and concise, constructive feedback."
)

# -------------------------------------------------------------------
# Gemini Client Singleton
# -------------------------------------------------------------------

_gemini_client = None
_client_lock = threading.Lock()


def get_gemini_client() -> genai.Client:
    global _gemini_client

    if _gemini_client is None:
        with _client_lock:
            if _gemini_client is None:
                api_key = os.getenv("GOOGLE_API_KEY")
                if not api_key:
                    raise RuntimeError("GOOGLE_API_KEY environment variable is missing")

                _gemini_client = genai.Client(api_key=api_key)

    return _gemini_client


# -------------------------------------------------------------------
# Main Analysis Function
# -------------------------------------------------------------------

def analyze_candidate_with_gemini(
    transcript: str,
    job_title: str,
    required_qualities: List[str],
) -> Dict[str, float | str]:

    if isinstance(transcript, list):
        transcript = " ".join(
            item.get("text", "") if isinstance(item, dict) else str(item)
            for item in transcript
        )

    if not isinstance(transcript, str) or not transcript.strip():
        return DEFAULT_RESULT

    transcript = transcript.strip()

    user_prompt = f"""
Job Title:
{job_title}

Required Qualities:
{", ".join(required_qualities)}

Candidate Transcript:
\"\"\"
{transcript}
\"\"\"

Evaluate the candidate and return a JSON object with:
- content_relevance (0-100)
- vocal_confidence (0-100)
- clarity_of_speech (0-100)
- fluency (0-100)
- short_feedback (2–3 sentences)
"""

    try:
        client = get_gemini_client()

        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=user_prompt,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_INSTRUCTION,
                temperature=0.2,
                response_mime_type="application/json",
                response_schema=RESPONSE_SCHEMA,
            )
        )

        # Robust extraction (SDK-safe)
        raw_text = getattr(response, "text", None)
        if not raw_text and response.candidates:
            raw_text = response.candidates[0].content.parts[0].text

        result = json.loads(raw_text)

        # Clamp numeric values defensively
        for key in ("content_relevance", "vocal_confidence", "clarity_of_speech", "fluency"):
            result[key] = float(max(0.0, min(1.0, result[key])))

        return result

    except Exception as exc:
        print(f"[Gemini Analysis Error] {exc}")
        return {
            **DEFAULT_RESULT,
            "short_feedback": f"Analysis failed due to an internal error."
        }
