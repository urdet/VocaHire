# app/core/gpt_analysis.py

import os
import json
from typing import Dict, List

from openai import OpenAI


client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def analyze_candidate_with_gpt(
    transcript: str,
    job_title: str,
    required_qualities: List[str],
) -> Dict:
    """
    Uses GPT to evaluate a candidate's interview answers.

    Returns a structured scoring object.
    """

    system_prompt = (
        "You are an HR evaluation assistant. "
        "You objectively evaluate interview answers based on job requirements."
    )

    user_prompt = f"""
Job title:
{job_title}

Required qualities:
{", ".join(required_qualities)}

Candidate answers (transcript):
\"\"\"
{transcript}
\"\"\"

Evaluate the candidate and return a JSON object with:
- content_relevance (0-100)
- vocal_confidence (0-100)
- clarity_of_speech (0-100)
- fluency (0-100)
- short_feedback (string)

Return ONLY valid JSON.
"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.2,
    )

    raw_output = response.choices[0].message.content

    try:
        scores = json.loads(raw_output)
    except json.JSONDecodeError:
        raise ValueError("GPT returned invalid JSON")

    return scores
