# app/schemas/session.py
from pydantic import BaseModel, Field
from datetime import datetime, date
from typing import Optional

class JobSessionBase(BaseModel):
    session_type: Optional[str] = Field(None, max_length=50)
    title: Optional[str] = Field(None, max_length=255)
    job_title: Optional[str] = Field(None, max_length=255)
    qualities: Optional[str] = None
    scheduled_date: Optional[date] = None

class JobSessionCreate(JobSessionBase):
    owner_user_id: int

class JobSessionUpdate(JobSessionBase):
    pass

class JobSession(JobSessionBase):
    id: int
    owner_user_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True