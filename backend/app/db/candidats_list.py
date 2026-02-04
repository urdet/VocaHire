# app/db/candidats_list.py

from sqlalchemy import text
from .connection import get_engine

def create_candidat_list(order, full_name, description, score):
    query = text("""
        INSERT INTO candidatslist
        (candidatorder, candidatfullname, description, score)
        VALUES (:ord, :name, :desc, :score)
        RETURNING id
    """)
    with get_engine().begin() as conn:
        return conn.execute(query, {
            "ord": order,
            "name": full_name,
            "desc": description,
            "score": score
        }).scalar()


def update_candidat_score(candidat_id, score):
    query = text("""
        UPDATE candidatslist
        SET score = :score
        WHERE id = :id
    """)
    with get_engine().begin() as conn:
        conn.execute(query, {"id": candidat_id, "score": score})


def delete_candidat(candidat_id):
    query = text("DELETE FROM candidatslist WHERE id = :id")
    with get_engine().begin() as conn:
        conn.execute(query, {"id": candidat_id})


def get_candidat_by_order(order):
    query = text("""
        SELECT * FROM candidatslist
        WHERE candidatorder = :ord
    """)
    with get_engine().connect() as conn:
        return conn.execute(query, {"ord": order}).mappings().first()

def get_candidat_list_by_id(candidat_id):
    query = text("SELECT * FROM candidatslist WHERE id = :id")
    with get_engine().connect() as conn:
        return conn.execute(query, {"id": candidat_id}).mappings().first()


def get_all_candidat_results():
    query = text("SELECT * FROM candidatslist ORDER BY score DESC")
    with get_engine().connect() as conn:
        return conn.execute(query).mappings().all()