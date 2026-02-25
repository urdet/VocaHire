from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from decimal import Decimal

class AnalysisResultBase(BaseModel):
    content_relevance: Optional[Decimal] = Field(None, ge=0, le=100)
    vocal_confidence: Optional[Decimal] = Field(None, ge=0, le=100)
    clarity_of_speech: Optional[Decimal] = Field(None, ge=0, le=100)
    fluency: Optional[Decimal] = Field(None, ge=0, le=100)
    feedback: Optional[str] = None
    final_score: Optional[Decimal] = Field(None, ge=0, le=100)

class AnalysisResultCreate(AnalysisResultBase):
    interview_id: int

class AnalysisResultUpdate(AnalysisResultBase):
    pass

class AnalysisResult(AnalysisResultBase):
    id: int
    interview_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True