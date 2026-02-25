from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class TrainingSessionBase(BaseModel):
    audio_path: Optional[str] = None
    difficulty_level: Optional[str] = Field(None, max_length=50)

class TrainingSessionCreate(TrainingSessionBase):
    user_id: int

class TrainingSession(TrainingSessionBase):
    id: int
    user_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True