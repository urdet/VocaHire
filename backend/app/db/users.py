# app/db/users.py

from sqlalchemy import text
from .connection import get_engine

def create_user(first_name, last_name, username, password,
                date_of_birth, user_type, attribute1=None):
    query = text("""
        INSERT INTO users
        (firstname, lastname, username, password,
         dateofbirth, type, attribute1)
        VALUES (:fn, :ln, :un, :pw, :dob, :type, :attr)
        RETURNING id
    """)
    with get_engine().begin() as conn:
        return conn.execute(query, {
            "fn": first_name,
            "ln": last_name,
            "un": username,
            "pw": password,
            "dob": date_of_birth,
            "type": user_type,
            "attr": attribute1
        }).scalar()


def update_user(user_id, first_name, last_name, user_type, attribute1):
    query = text("""
        UPDATE users
        SET firstname = :fn,
            lastname = :ln,
            type = :type,
            attribute1 = :attr
        WHERE id = :id
    """)
    with get_engine().begin() as conn:
        conn.execute(query, {
            "id": user_id,
            "fn": first_name,
            "ln": last_name,
            "type": user_type,
            "attr": attribute1
        })

def delete_user(user_id):
    query = text("DELETE FROM users WHERE id = :id")
    with get_engine().begin() as conn:
        conn.execute(query, {"id": user_id})

def get_all_users():
    query = text("SELECT * FROM users")
    with get_engine().connect() as conn:
        return conn.execute(query).mappings().all()

# ====================== PROCEDURES ======================
def get_user_data(user_id):
    query = text("SELECT * FROM users WHERE id = :id")
    with get_engine().connect() as conn:
        return conn.execute(query, {"id": user_id}).mappings().first()

def get_user_data_if_exist(username, password):
    query = text("""
        SELECT * FROM users
        WHERE username = :un AND password = :pw
    """)
    with get_engine().connect() as conn:
        return conn.execute(query, {
            "un": username,
            "pw": password
        }).mappings().first()
