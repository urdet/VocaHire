# app/schemas/session.py

from pydantic import BaseModel

class SessionCreate(BaseModel):
    session_code: str
    session_type: str
    candidats_list_id: int
    user_id: int
