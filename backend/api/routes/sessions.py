# api/routes/sessions.py

from fastapi import APIRouter
from app.db.session import create_session, get_all_sessions
from app.schemas.session import SessionCreate

router = APIRouter(prefix="/sessions", tags=["Sessions"])


@router.post("/")
def create_new_session(payload: SessionCreate):
    session_id = create_session(
        payload.session_code,
        payload.session_type,
        payload.candidats_list_id,
        payload.user_id
    )
    return {"session_id": session_id}


@router.get("/")
def list_sessions():
    return get_all_sessions()
