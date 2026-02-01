# app/schemas/candidate.py

from pydantic import BaseModel
from typing import Optional

class CandidateCreate(BaseModel):
    order: int
    full_name: str
    description: Optional[str] = None

class CandidateResponse(BaseModel):
    id: int
    order: int
    full_name: str
    score: Optional[float]

    class Config:
        from_attributes = True
