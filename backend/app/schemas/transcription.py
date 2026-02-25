from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from decimal import Decimal

class TranscriptionSegmentBase(BaseModel):
    start_seconds: Decimal = Field(..., ge=0)
    end_seconds: Optional[Decimal] = Field(None, gt=0)
    transcript: Optional[str] = None

class TranscriptionSegmentCreate(TranscriptionSegmentBase):
    interview_id: int

class TranscriptionSegment(TranscriptionSegmentBase):
    id: int
    interview_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True