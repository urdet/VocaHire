# app/db/candidats_list.py

from sqlalchemy import text
from .connection import get_engine
from typing import Optional, List, Dict, Any


def create_candidate(list_id: int, candidate_order: int, candidate_full_name: str, 
                    infos: Optional[str] = None, score: Optional[float] = None, 
                    candidate_date: Optional[str] = None, status: Optional[str] = None) -> int:
    """Create a new candidate in a specific list"""
    query = text("""
        INSERT INTO candidatslist
        (listid, candidatorder, candidatfullname, infos, score, date, status)
        VALUES (:listid, :order, :name, :info, :score, :cdate, :status)
        RETURNING id
    """)
    with get_engine().begin() as conn:
        return conn.execute(query, {
            "listid": list_id,
            "order": candidate_order,
            "name": candidate_full_name,
            "info": infos,
            "score": score,
            "cdate": candidate_date,
            "status": status
        }).scalar()

def get_max_listid() -> int:
    """Get the maximum list ID from the database"""
    query = text("SELECT COALESCE(MAX(listid), 0) FROM candidatslist")
    with get_engine().connect() as conn:
        return conn.execute(query).scalar()
def check_candidate_id_not_exist(candidate_id: int) -> bool:
    """Check if a candidate ID does not exist in the database"""
    query = text("SELECT id FROM candidatslist WHERE id = :id")
    with get_engine().connect() as conn:
        result = conn.execute(query, {"id": candidate_id}).fetchone()
        return result is None


def get_candidates_score_ranking_by_list_id(list_id: int) -> List[Dict[str, Any]]:
    """Get candidates ranked by score for a specific list"""
    query = text("""
        SELECT * FROM candidatslist 
        WHERE listid = :listid 
        ORDER BY score DESC NULLS LAST, candidatorder ASC
    """)
    with get_engine().connect() as conn:
        results = conn.execute(query, {"listid": list_id}).mappings().all()
        return [dict(row) for row in results]


def set_candidate_status(candidate_id: int, status: str) -> None:
    """Set/update candidate status"""
    query = text("UPDATE candidatslist SET status = :status WHERE id = :id")
    with get_engine().begin() as conn:
        conn.execute(query, {"id": candidate_id, "status": status})


def set_candidate_infos(candidate_id: int, infos: str) -> None:
    """Set/update candidate information"""
    query = text("UPDATE candidatslist SET infos = :infos WHERE id = :id")
    with get_engine().begin() as conn:
        conn.execute(query, {"id": candidate_id, "infos": infos})


def update_candidate_score(candidate_id: int, score: float) -> None:
    """Update candidate score"""
    query = text("UPDATE candidatslist SET score = :score WHERE id = :id")
    with get_engine().begin() as conn:
        conn.execute(query, {"id": candidate_id, "score": score})


def delete_candidate(candidate_id: int) -> None:
    """Delete a candidate by ID"""
    query = text("DELETE FROM candidatslist WHERE id = :id")
    with get_engine().begin() as conn:
        conn.execute(query, {"id": candidate_id})


def get_candidate_by_id(candidate_id: int) -> Optional[Dict[str, Any]]:
    """Get candidate by ID"""
    query = text("SELECT * FROM candidatslist WHERE id = :id")
    with get_engine().connect() as conn:
        result = conn.execute(query, {"id": candidate_id}).mappings().first()
        return dict(result) if result else None


def get_candidate_by_order(list_id: int, candidate_order: int) -> Optional[Dict[str, Any]]:
    """Get candidate by order within a specific list"""
    query = text("""
        SELECT * FROM candidatslist 
        WHERE listid = :listid AND candidatorder = :order
    """)
    with get_engine().connect() as conn:
        result = conn.execute(query, {"listid": list_id, "order": candidate_order}).mappings().first()
        return dict(result) if result else None


def get_all_candidates_by_list_id(list_id: int) -> List[Dict[str, Any]]:
    """Get all candidates for a specific list"""
    query = text("""
        SELECT * FROM candidatslist 
        WHERE listid = :listid 
        ORDER BY candidatorder ASC
    """)
    with get_engine().connect() as conn:
        results = conn.execute(query, {"listid": list_id}).mappings().all()
        return [dict(row) for row in results]


def update_candidate(candidate_id: int, candidate_order: Optional[int] = None, 
                    candidate_full_name: Optional[str] = None, 
                    infos: Optional[str] = None, score: Optional[float] = None,
                    candidate_date: Optional[str] = None, status: Optional[str] = None) -> None:
    """Update candidate information"""
    update_fields = []
    params = {"id": candidate_id}
    
    if candidate_order is not None:
        update_fields.append("candidatorder = :order")
        params["order"] = candidate_order
    if candidate_full_name is not None:
        update_fields.append("candidatfullname = :name")
        params["name"] = candidate_full_name
    if infos is not None:
        update_fields.append("infos = :info")
        params["info"] = infos
    if score is not None:
        update_fields.append("score = :score")
        params["score"] = score
    if candidate_date is not None:
        update_fields.append("date = :cdate")
        params["cdate"] = candidate_date
    if status is not None:
        update_fields.append("status = :status")
        params["status"] = status
    
    if not update_fields:
        return
    
    query = text(f"""
        UPDATE candidatslist
        SET {', '.join(update_fields)}
        WHERE id = :id
    """)
    
    with get_engine().begin() as conn:
        conn.execute(query, params)


def get_candidate_statistics_by_list_id(list_id: int) -> Dict[str, Any]:
    """Get statistics for candidates in a specific list"""
    query = text("""
        SELECT 
            COUNT(*) as total_candidates,
            COUNT(score) as scored_candidates,
            AVG(score) as average_score,
            MIN(score) as min_score,
            MAX(score) as max_score,
            COUNT(DISTINCT status) as distinct_statuses
        FROM candidatslist
        WHERE listid = :listid
    """)
    with get_engine().connect() as conn:
        result = conn.execute(query, {"listid": list_id}).mappings().first()
        return dict(result) if result else {}


def get_candidates_by_status(list_id: int, status: str) -> List[Dict[str, Any]]:
    """Get candidates by status within a list"""
    query = text("""
        SELECT * FROM candidatslist 
        WHERE listid = :listid AND status = :status
        ORDER BY candidatorder ASC
    """)
    with get_engine().connect() as conn:
        results = conn.execute(query, {"listid": list_id, "status": status}).mappings().all()
        return [dict(row) for row in results]


def bulk_create_candidates(list_id: int, candidates_data: List[Dict[str, Any]]) -> List[int]:
    """Create multiple candidates at once for a list"""
    if not candidates_data:
        return []
    
    values_list = []
    params = {"listid": list_id}
    
    for i, candidate in enumerate(candidates_data):
        values_list.append(f"(:listid, :order{i}, :name{i}, :info{i}, :score{i}, :date{i}, :status{i})")
        params[f"order{i}"] = candidate.get("candidate_order")
        params[f"name{i}"] = candidate.get("candidate_full_name")
        params[f"info{i}"] = candidate.get("infos")
        params[f"score{i}"] = candidate.get("score")
        params[f"date{i}"] = candidate.get("date")
        params[f"status{i}"] = candidate.get("status")
    
    query = text(f"""
        INSERT INTO candidatslist
        (listid, candidatorder, candidatfullname, infos, score, date, status)
        VALUES {', '.join(values_list)}
        RETURNING id
    """)
    
    with get_engine().begin() as conn:
        result = conn.execute(query, params)
        return [row[0] for row in result]


def get_top_candidates_by_list_id(list_id: int, limit: int = 5) -> List[Dict[str, Any]]:
    """Get top scoring candidates from a list"""
    query = text("""
        SELECT * FROM candidatslist 
        WHERE listid = :listid AND score IS NOT NULL
        ORDER BY score DESC
        LIMIT :limit
    """)
    with get_engine().connect() as conn:
        results = conn.execute(query, {"listid": list_id, "limit": limit}).mappings().all()
        return [dict(row) for row in results]


def search_candidates_in_list(list_id: int, search_term: str) -> List[Dict[str, Any]]:
    """Search candidates by name within a list"""
    query = text("""
        SELECT * FROM candidatslist 
        WHERE listid = :listid AND candidatfullname ILIKE :search
        ORDER BY candidatorder ASC
    """)
    with get_engine().connect() as conn:
        results = conn.execute(query, {
            "listid": list_id, 
            "search": f"%{search_term}%"
        }).mappings().all()
        return [dict(row) for row in results]
    
# ====================== BACKWARD COMPATIBILITY FUNCTIONS ======================

def get_candidat_list_by_id(candidate_id: int) -> Optional[Dict[str, Any]]:
    """Backward compatibility: Get candidate by ID (old function name)"""
    return get_candidate_by_id(candidate_id)


def update_candidat_score(candidate_id: int, score: float) -> None:
    """Backward compatibility: Update candidate score (old function name)"""
    return update_candidate_score(candidate_id, score)


def create_candidat_list(order: int, full_name: str, description: Optional[str] = None, 
                        score: Optional[float] = None) -> int:
    """Backward compatibility: Create candidate (old function name)"""
    return create_candidate(
        list_id=0,  # Default list ID - you might want to make this a parameter
        candidate_order=order,
        candidate_full_name=full_name,
        infos=description,  # Map description to infos
        score=score
    )


def delete_candidat(candidate_id: int) -> None:
    """Backward compatibility: Delete candidate (old function name)"""
    return delete_candidate(candidate_id)


def get_candidat_by_order(order: int) -> Optional[Dict[str, Any]]:
    """Backward compatibility: Get candidate by order (old function name)
       Note: This won't work properly without list_id, use with caution"""
    # This is problematic without list_id - consider deprecating
    query = text("SELECT * FROM candidatslist WHERE candidatorder = :order LIMIT 1")
    with get_engine().connect() as conn:
        result = conn.execute(query, {"order": order}).mappings().first()
        return dict(result) if result else None


def get_all_candidat_results() -> List[Dict[str, Any]]:
    """Backward compatibility: Get all candidate results (old function name)"""
    query = text("SELECT * FROM candidatslist ORDER BY score DESC NULLS LAST")
    with get_engine().connect() as conn:
        results = conn.execute(query).mappings().all()
        return [dict(row) for row in results]