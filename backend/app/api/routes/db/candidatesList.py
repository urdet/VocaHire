# app/routers/candidates_list.py

import os
import sys
from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), '../../..'))
from db.candidats_list import (
    create_candidate,
    check_candidate_id_not_exist,
    get_candidates_score_ranking_by_list_id,
    set_candidate_status,
    set_candidate_infos,
    update_candidate_score,
    delete_candidate,
    get_candidate_by_id,  # ✅ This is the correct function name
    get_candidate_by_order,
    get_all_candidates_by_list_id,
    update_candidate,
    get_candidate_statistics_by_list_id,
    get_candidates_by_status,
    bulk_create_candidates,
    get_top_candidates_by_list_id,
    search_candidates_in_list, 
    get_max_listid
)
router = APIRouter(tags=["Candidates List"])

# Pydantic Models
class CandidateCreate(BaseModel):
    listId: int
    candidateOrder: int
    candidateFullName: str
    infos: Optional[str] = None
    score: Optional[float] = Field(None, ge=0, le=100)
    date: Optional[date] = None
    status: Optional[str] = None

class CandidateUpdate(BaseModel):
    candidateOrder: Optional[int] = None
    candidateFullName: Optional[str] = None
    infos: Optional[str] = None
    score: Optional[float] = Field(None, ge=0, le=100)
    date: Optional[date] = None
    status: Optional[str] = None

class CandidateResponse(BaseModel):
    id: int
    listId: int = Field(alias="listid")
    candidateOrder: int = Field(alias="candidatorder")
    candidateFullName: str = Field(alias="candidatfullname")
    infos: Optional[str] = None
    score: Optional[float] = None
    date: Optional[date] = None
    status: Optional[str] = None
    
    class Config:
        populate_by_name = True

class BulkCandidateCreate(BaseModel):
    listId: int
    candidates: List[CandidateCreate]

class StatusUpdate(BaseModel):
    status: str

class InfosUpdate(BaseModel):
    infos: str

class ScoreUpdate(BaseModel):
    score: float = Field(..., ge=0, le=100)

class CreateCandidateResponse(BaseModel):
    success: bool
    message: str
    candidate: Optional[CandidateResponse] = None
    candidateId: Optional[int] = None

class GetCandidateResponse(BaseModel):
    success: bool
    message: str
    candidate: Optional[CandidateResponse] = None

class CandidatesListResponse(BaseModel):
    success: bool
    message: str
    candidates: List[CandidateResponse]
    count: int

class RankingResponse(BaseModel):
    success: bool
    message: str
    listId: int
    candidates: List[CandidateResponse]
    count: int

class StatisticsResponse(BaseModel):
    success: bool
    message: str
    listId: int
    statistics: dict

# Routes

@router.get("/")
async def root():
    return {"message": "Welcome to Candidates List API", "status": "running"}

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"message": "Welcome to Candidates List API", "status": "running"}

@router.get("/list/max-id")
async def get_max_list_id():
    """Get the maximum list ID"""
    try:
        max_id = get_max_listid()
        return {
                "success": True,
            "message": "Maximum list ID retrieved successfully",
            "maxListId": max_id
        }
    except Exception as e:
        return {
                "success": False,
            "message": str(e)
        }
@router.post("/", response_model=CreateCandidateResponse)
async def create_new_candidate(candidate_data: CandidateCreate):
    """Create a new candidate"""
    try:
        candidate_id = create_candidate(
            list_id=candidate_data.listId,
            candidate_order=candidate_data.candidateOrder,
            candidate_full_name=candidate_data.candidateFullName,
            infos=candidate_data.infos,
            score=candidate_data.score,
            candidate_date=candidate_data.date,
            status=candidate_data.status
        )
        
        candidate_info = get_candidate_by_id(candidate_id)
        if candidate_info:
            return CreateCandidateResponse(
                success=True,
                message="Candidate created successfully",
                candidate=CandidateResponse(**candidate_info),
                candidateId=candidate_id
            )
        else:
            return CreateCandidateResponse(
                success=False,
                message="Failed to retrieve created candidate"
            )
    except Exception as e:
        return CreateCandidateResponse(
            success=False,
            message=str(e)
        )

@router.post("/bulk")
async def bulk_create_candidates_endpoint(bulk_data: BulkCandidateCreate):
    """Create multiple candidates at once"""
    try:
        candidates_data = []
        for candidate in bulk_data.candidates:
            candidates_data.append({
                "candidate_order": candidate.candidateOrder,
                "candidate_full_name": candidate.candidateFullName,
                "infos": candidate.infos,
                "score": candidate.score,
                "date": candidate.date,
                "status": candidate.status
            })
        
        candidate_ids = bulk_create_candidates(bulk_data.listId, candidates_data)
        
        return {
            "success": True,
            "message": f"Successfully created {len(candidate_ids)} candidates",
            "candidateIds": candidate_ids,
            "count": len(candidate_ids)
        }
    except Exception as e:
        return {
            "success": False,
            "message": str(e)
        }

@router.get("/{candidate_id}", response_model=GetCandidateResponse)
async def get_candidate(candidate_id: int):
    """Get candidate by ID"""
    try:
        candidate_info = get_candidate_by_id(candidate_id)
        if candidate_info:
            return GetCandidateResponse(
                success=True,
                message="Candidate found",
                candidate=CandidateResponse(**candidate_info)
            )
        else:
            return GetCandidateResponse(
                success=False,
                message="Candidate not found"
            )
    except Exception as e:
        return GetCandidateResponse(
            success=False,
            message=str(e)
        )

@router.get("/check/{candidate_id}")
async def check_candidate_exists(candidate_id: int):
    """Check if candidate ID does not exist"""
    try:
        does_not_exist = check_candidate_id_not_exist(candidate_id)
        return {
            "success": True,
            "message": f"Candidate ID {candidate_id} does {'not ' if does_not_exist else ''}exist",
            "doesNotExist": does_not_exist
        }
    except Exception as e:
        return {
            "success": False,
            "message": str(e)
        }

@router.get("/list/{list_id}")
async def get_candidates_by_list(list_id: int):
    """Get all candidates for a specific list"""
    try:
        candidates = get_all_candidates_by_list_id(list_id)
        return CandidatesListResponse(
            success=True,
            message=f"Found {len(candidates)} candidates for list {list_id}",
            candidates=[CandidateResponse(**candidate) for candidate in candidates],
            count=len(candidates)
        )
    except Exception as e:
        return CandidatesListResponse(
            success=False,
            message=str(e),
            candidates=[],
            count=0
        )

@router.get("/list/{list_id}/ranking")
async def get_candidates_ranking(list_id: int):
    """Get candidates ranked by score for a specific list"""
    try:
        candidates = get_candidates_score_ranking_by_list_id(list_id)
        return RankingResponse(
            success=True,
            message=f"Found {len(candidates)} candidates ranked by score",
            listId=list_id,
            candidates=[CandidateResponse(**candidate) for candidate in candidates],
            count=len(candidates)
        )
    except Exception as e:
        return RankingResponse(
            success=False,
            message=str(e),
            listId=list_id,
            candidates=[],
            count=0
        )

@router.get("/list/{list_id}/top/{limit}")
async def get_top_candidates(list_id: int, limit: int = 5):
    """Get top scoring candidates from a list"""
    try:
        if limit <= 0 or limit > 100:
            return {
                "success": False,
                "message": "Limit must be between 1 and 100"
            }
        
        candidates = get_top_candidates_by_list_id(list_id, limit)
        return RankingResponse(
            success=True,
            message=f"Top {len(candidates)} candidates",
            listId=list_id,
            candidates=[CandidateResponse(**candidate) for candidate in candidates],
            count=len(candidates)
        )
    except Exception as e:
        return RankingResponse(
            success=False,
            message=str(e),
            listId=list_id,
            candidates=[],
            count=0
        )

@router.get("/list/{list_id}/status/{status}")
async def get_candidates_by_status(list_id: int, status: str):
    """Get candidates by status within a list"""
    try:
        candidates = get_candidates_by_status(list_id, status)
        return CandidatesListResponse(
            success=True,
            message=f"Found {len(candidates)} candidates with status '{status}'",
            candidates=[CandidateResponse(**candidate) for candidate in candidates],
            count=len(candidates)
        )
    except Exception as e:
        return CandidatesListResponse(
            success=False,
            message=str(e),
            candidates=[],
            count=0
        )

@router.get("/list/{list_id}/search/{search_term}")
async def search_candidates(list_id: int, search_term: str):
    """Search candidates by name within a list"""
    try:
        if len(search_term) < 2:
            return {
                "success": False,
                "message": "Search term must be at least 2 characters"
            }
        
        candidates = search_candidates_in_list(list_id, search_term)
        return CandidatesListResponse(
            success=True,
            message=f"Found {len(candidates)} candidates matching '{search_term}'",
            candidates=[CandidateResponse(**candidate) for candidate in candidates],
            count=len(candidates)
        )
    except Exception as e:
        return CandidatesListResponse(
            success=False,
            message=str(e),
            candidates=[],
            count=0
        )

@router.get("/list/{list_id}/statistics")
async def get_list_statistics(list_id: int):
    """Get statistics for candidates in a list"""
    try:
        statistics = get_candidate_statistics_by_list_id(list_id)
        return StatisticsResponse(
            success=True,
            message="Statistics retrieved successfully",
            listId=list_id,
            statistics=statistics
        )
    except Exception as e:
        return StatisticsResponse(
            success=False,
            message=str(e),
            listId=list_id,
            statistics={}
        )

@router.get("/list/{list_id}/order/{order}")
async def get_candidate_by_order(list_id: int, order: int):
    """Get candidate by order within a list"""
    try:
        candidate_info = get_candidate_by_order(list_id, order)
        if candidate_info:
            return GetCandidateResponse(
                success=True,
                message=f"Candidate found at order {order}",
                candidate=CandidateResponse(**candidate_info)
            )
        else:
            return GetCandidateResponse(
                success=False,
                message=f"No candidate found at order {order} in list {list_id}"
            )
    except Exception as e:
        return GetCandidateResponse(
            success=False,
            message=str(e)
        )

@router.put("/{candidate_id}")
async def update_candidate_endpoint(candidate_id: int, updates: CandidateUpdate):
    """Update candidate information"""
    try:
        # Convert updates to dict and remove None values
        update_dict = updates.dict(exclude_unset=True)
        
        # Map field names from API to database
        field_mapping = {
            "candidateOrder": "candidate_order",
            "candidateFullName": "candidate_full_name",
            "date": "candidate_date"
        }
        
        # Prepare parameters for update
        update_params = {}
        for key, value in update_dict.items():
            if value is not None:
                db_key = field_mapping.get(key, key)
                update_params[db_key] = value
        
        if update_params:
            update_candidate(candidate_id, **update_params)
        
        # Get updated candidate info
        candidate_info = get_candidate_by_id(candidate_id)
        
        return {
            "success": True,
            "message": "Candidate updated successfully",
            "candidate": CandidateResponse(**candidate_info) if candidate_info else None
        }
    except Exception as e:
        return {
            "success": False,
            "message": str(e)
        }

@router.patch("/{candidate_id}/status")
async def update_candidate_status(candidate_id: int, status_update: StatusUpdate):
    """Update only the status of a candidate"""
    try:
        set_candidate_status(candidate_id, status_update.status)
        candidate_info = get_candidate_by_id(candidate_id)
        
        return {
            "success": True,
            "message": "Candidate status updated successfully",
            "candidate": CandidateResponse(**candidate_info) if candidate_info else None
        }
    except Exception as e:
        return {
            "success": False,
            "message": str(e)
        }

@router.patch("/{candidate_id}/infos")
async def update_candidate_infos(candidate_id: int, infos_update: InfosUpdate):
    """Update only the information of a candidate"""
    try:
        set_candidate_infos(candidate_id, infos_update.infos)
        candidate_info = get_candidate_by_id(candidate_id)
        
        return {
            "success": True,
            "message": "Candidate information updated successfully",
            "candidate": CandidateResponse(**candidate_info) if candidate_info else None
        }
    except Exception as e:
        return {
            "success": False,
            "message": str(e)
        }

@router.patch("/{candidate_id}/score")
async def update_candidate_score_endpoint(candidate_id: int, score_update: ScoreUpdate):
    """Update only the score of a candidate"""
    try:
        update_candidate_score(candidate_id, score_update.score)
        candidate_info = get_candidate_by_id(candidate_id)
        
        return {
            "success": True,
            "message": "Candidate score updated successfully",
            "candidate": CandidateResponse(**candidate_info) if candidate_info else None
        }
    except Exception as e:
        return {
            "success": False,
            "message": str(e)
        }

@router.delete("/{candidate_id}")
async def delete_candidate_endpoint(candidate_id: int):
    """Delete a candidate"""
    try:
        delete_candidate(candidate_id)
        return {
            "success": True,
            "message": "Candidate deleted successfully"
        }
    except Exception as e:
        return {
            "success": False,
            "message": str(e)
        }