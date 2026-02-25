# app/schemas/candidate.py
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from decimal import Decimal

class CandidateListItemBase(BaseModel):
    candidate_name: str = Field(..., max_length=255)
    list_order: int = 0
    notes: Optional[str] = None
    score: Optional[Decimal] = Field(None, ge=0, le=100)
    status: str = Field("pending", pattern="^(pending|shortlisted|rejected|hired)$")

class CandidateListItemCreate(CandidateListItemBase):
    job_session_id: int

class CandidateListItemUpdate(BaseModel):
    candidate_name: Optional[str] = Field(None, max_length=255)
    list_order: Optional[int] = None
    notes: Optional[str] = None
    score: Optional[Decimal] = Field(None, ge=0, le=100)
    status: Optional[str] = Field(None, pattern="^(pending|shortlisted|rejected|hired)$")

class CandidateListItem(CandidateListItemBase):
    id: int
    job_session_id: int
    added_at: datetime
    
    class Config:
        from_attributes = True