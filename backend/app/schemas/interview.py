# backend/app/schemas/interview.py

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


INTERVIEW_STATUS_PATTERN = "^(uploaded|processing|completed|failed|ready|reviewed)$"


class InterviewBase(BaseModel):
    audio_path: str
    status: str = Field("uploaded", pattern=INTERVIEW_STATUS_PATTERN)


class InterviewCreate(InterviewBase):
    job_session_id: int
    candidate_item_id: int


class InterviewUpdate(BaseModel):
    status: Optional[str] = Field(None, pattern=INTERVIEW_STATUS_PATTERN)
    audio_path: Optional[str] = None


class Interview(InterviewBase):
    id: int
    job_session_id: int
    candidate_item_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True