from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from decimal import Decimal

class SpeakerSegmentBase(BaseModel):
    speaker_label: Optional[str] = Field(None, max_length=100)
    start_seconds: Decimal = Field(..., ge=0)
    end_seconds: Optional[Decimal] = Field(None, gt=0)
    text: Optional[str] = None

class SpeakerSegmentCreate(SpeakerSegmentBase):
    interview_id: int

class SpeakerSegment(SpeakerSegmentBase):
    id: int
    interview_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True