from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class InterviewBase(BaseModel):
    audio_path: str
    status: str = Field("processing", pattern="^(processing|ready|reviewed)$")

class InterviewCreate(InterviewBase):
    job_session_id: int
    candidate_item_id: int

class InterviewUpdate(BaseModel):
    status: Optional[str] = Field(None, pattern="^(processing|ready|reviewed)$")
    audio_path: Optional[str] = None

class Interview(InterviewBase):
    id: int
    job_session_id: int
    candidate_item_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True