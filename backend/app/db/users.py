# app/db/users.py

from sqlalchemy import text
from datetime import datetime
from .connection import get_engine

def create_user(full_name, email, password, date_of_birth, user_type, infos=None):
    """Create a new user with current registration date"""
    current_date = datetime.now()
    query = text("""
        INSERT INTO users
        (fullName, email, password, dateofbirth, 
         dateofregistration, type, Infos)
        VALUES (:full_name, :email, :pw, :dob, 
                :reg_date, :type, :infos)
        RETURNING id
    """)
    with get_engine().begin() as conn:
        return conn.execute(query, {
            "full_name": full_name,
            "email": email,
            "pw": password,
            "dob": date_of_birth,
            "reg_date": current_date,
            "type": user_type,
            "infos": infos
        }).scalar()


def update_user(user_id, full_name=None, email=None, password=None, 
                date_of_birth=None, user_type=None, infos=None):
    """Update user information"""
    # Build dynamic query based on provided parameters
    update_fields = []
    params = {"id": user_id}
    
    if full_name is not None:
        update_fields.append("fullName = :full_name")
        params["full_name"] = full_name
    if email is not None:
        update_fields.append("email = :email")
        params["email"] = email
    if password is not None:
        update_fields.append("password = :password")
        params["password"] = password
    if date_of_birth is not None:
        update_fields.append("dateofbirth = :dob")
        params["dob"] = date_of_birth
    if user_type is not None:
        update_fields.append("type = :type")
        params["type"] = user_type
    if infos is not None:
        update_fields.append("Infos = :infos")
        params["infos"] = infos
    
    if not update_fields:
        return  # Nothing to update
    
    query = text(f"""
        UPDATE users
        SET {', '.join(update_fields)}
        WHERE id = :id
    """)
    
    with get_engine().begin() as conn:
        conn.execute(query, params)

def delete_user(user_id):
    """Delete a user by ID"""
    query = text("DELETE FROM users WHERE id = :id")
    with get_engine().begin() as conn:
        conn.execute(query, {"id": user_id})

def get_all_users():
    """Get all users"""
    query = text("SELECT * FROM users ORDER BY dateofregistration DESC")
    with get_engine().connect() as conn:
        return conn.execute(query).mappings().all()

# ====================== METHODS FROM CLASS DIAGRAM ======================
def get_user_data(user_id):
    """Get user data by ID (matching class diagram method)"""
    query = text("SELECT * FROM users WHERE id = :id")
    with get_engine().connect() as conn:
        return conn.execute(query, {"id": user_id}).mappings().first()

def get_user_data_if_exist(email, password):
    """Check if user exists with email and password (matching class diagram method)"""
    query = text("""
        SELECT * FROM users
        WHERE email = :email AND password = :password
    """)
    with get_engine().connect() as conn:
        return conn.execute(query, {
            "email": email,
            "password": password
        }).mappings().first()

# ====================== ADDITIONAL HELPER FUNCTIONS ======================
def get_user_by_email(email):
    """Get user by email address"""
    query = text("SELECT * FROM users WHERE email = :email")
    with get_engine().connect() as conn:
        return conn.execute(query, {"email": email}).mappings().first()

def get_users_by_type(user_type):
    """Get all users of a specific type"""
    query = text("SELECT * FROM users WHERE type = :type ORDER BY fullName")
    with get_engine().connect() as conn:
        return conn.execute(query, {"type": user_type}).mappings().all()

def update_registration_date(user_id, new_date):
    """Update registration date (if needed)"""
    query = text("UPDATE users SET dateofregistration = :date WHERE id = :id")
    with get_engine().begin() as conn:
        conn.execute(query, {"id": user_id, "date": new_date})