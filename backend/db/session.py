# db/session.py
from sqlalchemy import text
from db.connection import engine


def create_session(session_code, session_type, candidats_list_id, user_id):
    query = text("""
        INSERT INTO session
        (sessioncode, type, candidatslistid, userid)
        VALUES (:code, :type, :clid, :uid)
        RETURNING id
    """)
    with engine.begin() as conn:
        return conn.execute(query, {
            "code": session_code,
            "type": session_type,
            "clid": candidats_list_id,
            "uid": user_id
        }).scalar()


def get_session_data(session_id):
    query = text("SELECT * FROM session WHERE id = :id")
    with engine.connect() as conn:
        return conn.execute(query, {"id": session_id}).mappings().first()


def get_all_sessions():
    query = text("SELECT * FROM session")
    with engine.connect() as conn:
        return conn.execute(query).mappings().all()

def update_session_type(session_id, session_type):
    query = text("""
        UPDATE session
        SET type = :type
        WHERE id = :id
    """)
    with engine.begin() as conn:
        conn.execute(query, {
            "id": session_id,
            "type": session_type
        })


def delete_session(session_id):
    query = text("DELETE FROM session WHERE id = :id")
    with engine.begin() as conn:
        conn.execute(query, {"id": session_id})


def get_candidat_list(session_id):
    query = text("""
        SELECT cl.*
        FROM session s
        JOIN candidatslist cl
          ON cl.id = s.candidatslistid
        WHERE s.id = :sid
    """)
    with engine.connect() as conn:
        return conn.execute(query, {"sid": session_id}).mappings().all()
