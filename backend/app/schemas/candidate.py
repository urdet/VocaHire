# path: backend/app/schemas/candidate.py
from pydantic import BaseModel, Field
from typing import Optional

# ----- Schémas pour les données personnelles du candidat (table "candidates") -----
class CandidateBase(BaseModel):
    first_name: str = Field(..., max_length=255)
    last_name: str = Field(..., max_length=255)
    city: Optional[str] = Field(None, max_length=255)
    cin: Optional[str] = Field(None, max_length=20)
    email: Optional[str] = Field(None, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)
    infos: Optional[str] = None

class CandidateCreate(CandidateBase):
    pass

class CandidateUpdate(BaseModel):
    first_name: Optional[str] = Field(None, max_length=255)
    last_name: Optional[str] = Field(None, max_length=255)
    city: Optional[str] = Field(None, max_length=255)
    cin: Optional[str] = Field(None, max_length=20)
    email: Optional[str] = Field(None, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)
    infos: Optional[str] = None

class Candidate(CandidateBase):
    id: int

    class Config:
        from_attributes = True

# ----- Schémas pour les éléments de liste (table "candidate_list_items") -----
class CandidateListItemBase(BaseModel):
    job_session_id: int
    candidate_id: int
    list_order: Optional[int] = None
    notes: Optional[str] = None
    score: Optional[float] = Field(None, ge=0, le=100)
    status: Optional[str] = Field(None, max_length=50)

class CandidateListItemCreate(CandidateListItemBase):
    pass

class CandidateListItemUpdate(BaseModel):
    list_order: Optional[int] = None
    notes: Optional[str] = None
    score: Optional[float] = Field(None, ge=0, le=100)
    status: Optional[str] = Field(None, max_length=50)

class CandidateListItem(CandidateListItemBase):
    id: int
    candidate: Candidate   # inclusion des données du candidat

    class Config:
        from_attributes = True

# ----- Schéma combiné pour la création d'un candidat et de son entrée en une seule requête -----
class CandidateWithListItemCreate(BaseModel):
    candidate: CandidateCreate
    job_session_id: int
    list_order: Optional[int] = None
    notes: Optional[str] = None
    score: Optional[float] = None
    status: Optional[str] = None