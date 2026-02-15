# sessions.py
import os
import sys
from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Optional
from datetime import date
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), '../../..'))
from db.session import (
    create_session, 
    get_session_data, 
    get_candidat_list, 
    get_candidate_list_ranked_by_score,
    update_session, 
    delete_session, 
    get_session_data_by_userid,
)
router = APIRouter(tags=["Sessions"])

# Pydantic Models
class SessionCreate(BaseModel):
    sessionCode: str
    type: str
    candidatesListId: int
    userId: int
    sessionTitle: Optional[str] = None
    jobTitle: Optional[str] = None
    qualities: Optional[str] = None
    date: Optional[date] = None

class SessionUpdate(BaseModel):
    sessionCode: Optional[str] = None
    type: Optional[str] = None
    candidatesListId: Optional[int] = None
    userId: Optional[int] = None
    sessionTitle: Optional[str] = None
    jobTitle: Optional[str] = None
    qualities: Optional[str] = None
    date: Optional[date] = None

class SessionResponse(BaseModel):
    id: int
    sessionCode: str = Field(alias="sessioncode")
    type: str
    candidatesListId: int = Field(alias="candidateslistid")
    userId: int = Field(alias="userid")
    sessionTitle: Optional[str] = Field(alias="sessiontitle", default=None)
    jobTitle: Optional[str] = Field(alias="jobtitle", default=None)
    qualities: Optional[str] = None
    date: Optional[date] = None
    
    class Config:
        populate_by_name = True

class CandidateListItem(BaseModel):
    id: int
    candidatOrder: int = Field(alias="candidatorder")
    candidatFullName: str = Field(alias="candidatfullname")
    infos: Optional[str] = None
    score: Optional[float] = None
    date: Optional[date] = None

class SessionWithCandidatesResponse(SessionResponse):
    candidates: list[CandidateListItem] = []

class CreateSessionResponse(BaseModel):
    success: bool
    message: str
    session: Optional[SessionResponse] = None
    sessionId: Optional[int] = None

class GetSessionResponse(BaseModel):
    success: bool
    message: str
    session: Optional[SessionResponse] = None

class GetSessionWithCandidatesResponse(BaseModel):
    success: bool
    message: str
    session: Optional[SessionWithCandidatesResponse] = None

# Routes
@router.get("/")
async def root():
    return {"message": "Welcome to VocalHire Sessions API", "status": "running"}

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"message": "Welcome to VocalHire Sessions API", "status": "running"}

@router.post("/", response_model=CreateSessionResponse)
async def create_new_session(session_data: SessionCreate):
    """Create a new session"""
    try:
        session_id = create_session(
            session_code=session_data.sessionCode,
            session_type=session_data.type,
            candidates_list_id=session_data.candidatesListId,
            user_id=session_data.userId,
            session_title=session_data.sessionTitle,
            job_title=session_data.jobTitle,
            qualities=session_data.qualities,
            session_date=session_data.date
        )
        
        session_info = get_session_data(session_id)
        if session_info:
            return CreateSessionResponse(
                success=True,
                message="Session created successfully",
                session=SessionResponse(**session_info),
                sessionId=session_id
            )
        else:
            return CreateSessionResponse(
                success=False,
                message="Failed to retrieve created session"
            )
    except Exception as e:
        return CreateSessionResponse(
            success=False,
            message=str(e)
        )

@router.get("/{session_id}", response_model=GetSessionResponse)
async def get_session(session_id: int):
    """Get session by ID"""
    try:
        session_info = get_session_data(session_id)
        if session_info:
            return GetSessionResponse(
                success=True,
                message="Session found",
                session=SessionResponse(**session_info)
            )
        else:
            return GetSessionResponse(
                success=False,
                message="Session not found"
            )
    except Exception as e:
        return GetSessionResponse(
            success=False,
            message=str(e)
        )

@router.get("/{session_id}/candidates", response_model=GetSessionWithCandidatesResponse)
async def get_session_with_candidates(session_id: int):
    """Get session with its candidate list"""
    try:
        session_info = get_session_data(session_id)
        if session_info:
            candidates = get_candidat_list(session_id)
            
            session_with_candidates = {
                **session_info,
                "candidates": candidates
            }
            
            return GetSessionWithCandidatesResponse(
                success=True,
                message="Session with candidates found",
                session=SessionWithCandidatesResponse(**session_with_candidates)
            )
        else:
            return GetSessionWithCandidatesResponse(
                success=False,
                message="Session not found"
            )
    except Exception as e:
        return GetSessionWithCandidatesResponse(
            success=False,
            message=str(e)
        )

@router.get("/{session_id}/candidates/ranked")
async def get_session_candidates_ranked(session_id: int):
    """Get session candidates ranked by score"""
    try:
        session_info = get_session_data(session_id)
        if not session_info:
            return {
                "success": False,
                "message": "Session not found"
            }
        
        candidates = get_candidate_list_ranked_by_score(session_id)
        
        return {
            "success": True,
            "message": f"Found {len(candidates)} candidates ranked by score",
            "session": SessionResponse(**session_info),
            "candidates": [CandidateListItem(**candidate) for candidate in candidates]
        }
    except Exception as e:
        return {
            "success": False,
            "message": str(e)
        }

@router.get("/user/{user_id}")
async def get_user_sessions(user_id: int):
    """Get all sessions for a specific user"""
    try:
        sessions = get_session_data_by_userid(user_id)
        return {
            "success": True,
            "message": f"Found {len(sessions)} sessions for user {user_id}",
            "sessions": [SessionResponse(**session) for session in sessions]
        }
    except Exception as e:
        return {
            "success": False,
            "message": str(e)
        }

@router.put("/{session_id}")
async def update_session_endpoint(session_id: int, updates: SessionUpdate):
    """Update session information"""
    try:
        # Convert updates to dict and remove None values
        update_dict = updates.dict(exclude_unset=True)
        
        # Map field names from API to database
        field_mapping = {
            "sessionCode": "session_code",
            "candidatesListId": "candidates_list_id",
            "userId": "user_id",
            "sessionTitle": "session_title",
            "jobTitle": "job_title",
            "date": "session_date"
        }
        
        # Prepare parameters for update
        update_params = {}
        for key, value in update_dict.items():
            if value is not None:
                db_key = field_mapping.get(key, key)
                update_params[db_key] = value
        
        if update_params:
            update_session(session_id, **update_params)
        
        # Get updated session info
        session_info = get_session_data(session_id)
        
        return {
            "success": True,
            "message": "Session updated successfully",
            "session": SessionResponse(**session_info) if session_info else None
        }
    except Exception as e:
        return {
            "success": False,
            "message": str(e)
        }

@router.delete("/{session_id}")
async def delete_session_endpoint(session_id: int):
    """Delete a session"""
    try:
        delete_session(session_id)
        return {
            "success": True,
            "message": "Session deleted successfully"
        }
    except Exception as e:
        return {
            "success": False,
            "message": str(e)
        }