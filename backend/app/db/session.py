from sqlalchemy import text
from .connection import get_engine


def create_session(session_code, session_type, candidates_list_id, user_id, 
                   session_title=None, job_title=None, qualities=None, session_date=None):
    """Create a new session"""
    query = text("""
        INSERT INTO session
        (sessioncode, type, candidateslistid, userid, 
         sessiontitle, jobtitle, qualities, date)
        VALUES (:code, :type, :clid, :uid, 
                :title, :job, :qual, :sdate)
        RETURNING id
    """)
    with get_engine().begin() as conn:
        return conn.execute(query, {
            "code": session_code,
            "type": session_type,
            "clid": candidates_list_id,
            "uid": user_id,
            "title": session_title,
            "job": job_title,
            "qual": qualities,
            "sdate": session_date
        }).scalar()


def get_session_data(session_id):
    """Get session data by ID"""
    query = text("SELECT * FROM session WHERE id = :id")
    with get_engine().connect() as conn:
        return conn.execute(query, {"id": session_id}).mappings().first()


def get_session_data_by_userid(user_id):
    """Get all sessions for a specific user"""
    query = text("SELECT * FROM session WHERE userid = :uid")
    with get_engine().connect() as conn:
        return conn.execute(query, {"uid": user_id}).mappings().all()


def get_candidat_list(session_id):
    """Get candidate list for session"""
    query = text("""
        SELECT cl.*
        FROM session s
        JOIN candidatslist cl ON cl.id = s.candidateslistid
        WHERE s.id = :sid
    """)
    with get_engine().connect() as conn:
        return conn.execute(query, {"sid": session_id}).mappings().all()


def get_candidate_list_ranked_by_score(session_id):
    """Get candidate list ranked by score (highest first)"""
    query = text("""
        SELECT cl.*
        FROM session s
        JOIN candidatslist cl ON cl.id = s.candidateslistid
        WHERE s.id = :sid
        ORDER BY cl.score DESC NULLS LAST
    """)
    with get_engine().connect() as conn:
        return conn.execute(query, {"sid": session_id}).mappings().all()


def update_session(session_id, session_code=None, session_type=None, 
                   candidates_list_id=None, user_id=None, 
                   session_title=None, job_title=None, qualities=None, session_date=None):
    """Update session information"""
    update_fields = []
    params = {"id": session_id}
    
    if session_code is not None:
        update_fields.append("sessioncode = :code")
        params["code"] = session_code
    if session_type is not None:
        update_fields.append("type = :type")
        params["type"] = session_type
    if candidates_list_id is not None:
        update_fields.append("candidateslistid = :clid")
        params["clid"] = candidates_list_id
    if user_id is not None:
        update_fields.append("userid = :uid")
        params["uid"] = user_id
    if session_title is not None:
        update_fields.append("sessiontitle = :title")
        params["title"] = session_title
    if job_title is not None:
        update_fields.append("jobtitle = :job")
        params["job"] = job_title
    if qualities is not None:
        update_fields.append("qualities = :qual")
        params["qual"] = qualities
    if session_date is not None:
        update_fields.append("date = :sdate")
        params["sdate"] = session_date
    
    if not update_fields:
        return
    
    query = text(f"""
        UPDATE session
        SET {', '.join(update_fields)}
        WHERE id = :id
    """)
    
    with get_engine().begin() as conn:
        conn.execute(query, params)


def delete_session(session_id):
    """Delete a session by ID"""
    query = text("DELETE FROM session WHERE id = :id")
    with get_engine().begin() as conn:
        conn.execute(query, {"id": session_id})