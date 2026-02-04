import os
import json
from typing import Dict, List
from google import genai
from google.genai import types
from dotenv import load_dotenv
load_dotenv()
# Initialize the client (automatically picks up GEMINI_API_KEY from env)
def get_gemini_client():
    return genai.Client(
        api_key=os.getenv("GOOGLE_API_KEY")
    )
model="gemini-2.5-flash"
def analyze_candidate_with_gemini(
    transcript: str,
    job_title: str,
    required_qualities: List[str],
) -> Dict:
    """
    Uses Gemini to evaluate a candidate's interview answers with native JSON mode.
    """

    system_instruction = (
        "You are an HR evaluation assistant. "
        "You objectively evaluate interview answers based on job requirements."
        "Provide scores from 0 to 1 (percentage) and concise feedback."
    )

    user_prompt = f"""
    Job title: {job_title}
    Required qualities: {", ".join(required_qualities)}
    Candidate answers (transcript):
    \"\"\"
    {transcript}
    \"\"\"

    Evaluate the candidate and return a structured assessment.
    """

    # Call Gemini with a specified response_mime_type for strict JSON
    response = get_gemini_client().models.generate_content(
        model=model,
        contents=user_prompt,
        config=types.GenerateContentConfig(
            system_instruction=system_instruction,
            temperature=0.2,
            response_mime_type="application/json",
            # Optional: Define the schema for even higher reliability
            response_schema={
                "type": "object",
                "properties": {
                    "content_relevance": {"type": "float"},
                    "vocal_confidence": {"type": "float"},
                    "clarity_of_speech": {"type": "float"},
                    "fluency": {"type": "float"},
                    "short_feedback": {"type": "string"},
                },
                "required": ["content_relevance", "vocal_confidence", "clarity_of_speech", "fluency", "short_feedback"]
            }
        )
    )

    try:
        # Gemini's response.text will contain the pure JSON string
        return json.loads(response.text)
    except json.JSONDecodeError:
        raise ValueError("Gemini returned invalid JSON")