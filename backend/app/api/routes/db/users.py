# users.py
import os
import sys
from fastapi import APIRouter
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime, date
sys.path.append(os.path.join(os.path.dirname(__file__), '../../..'))
from db.users import create_user, get_user_data, get_user_by_email, update_user
router = APIRouter(tags=["Users"])
# Pydantic Models
class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserSignup(BaseModel):
    fullName: str
    email: EmailStr
    password: str
    type: str  # e.g., "candidate", "recruiter"
    dateofbirth: Optional[date] = None

class UserResponse(BaseModel):
    id: int
    fullName: str = Field(alias="fullname")  # Map fullname → fullName
    email: str
    type: str
    Infos: Optional[dict] = Field(default=None, alias="infos")  # Map infos → Infos
    dateofbirth: Optional[date] = None
    dateofregistration: datetime
    

class LoginResponse(BaseModel):
    success: bool
    message: str
    user: Optional[UserResponse] = None
    token: Optional[str] = None

class SignupResponse(BaseModel):
    success: bool
    message: str
    user: Optional[UserResponse] = None
    token: Optional[str] = None

# Helper Functions
def create_jwt_token(user_id: int, email: str) -> str:
    """Create a simple JWT token (in production, use proper JWT library)"""
    import hashlib
    import time
    payload = f"{user_id}:{email}:{int(time.time())}"
    token = hashlib.sha256(payload.encode()).hexdigest()
    return token

# Routes
@router.get("/")
async def root():
    return {"message": "Welcome to VocalHire Users API", "status": "running"}

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"message": "Welcome to VocalHire Users API", "status": "running"}

@router.post("/login", response_model=LoginResponse)
async def login(user_data: UserLogin):
    """Login endpoint - Check user credentials"""
    try:
        # In production, implement proper password hashing and verification
        user_info = get_user_by_email(user_data.email)
        if user_info and user_info['password'] == user_data.password:
            token = create_jwt_token(user_info['id'], user_data.email)
            return LoginResponse(
                success=True,
                message="Login successful",
                user=UserResponse(**user_info),
                token=token
            )
        else:
            return LoginResponse(success=False, message="Invalid email or password")
    except Exception as e:
        return LoginResponse(success=False, message=str(e))


@router.post("/signup", response_model=SignupResponse)
async def signup(user_data: UserSignup):
    """Signup endpoint - Create new user"""
    try:
        user_id = create_user(
            full_name=user_data.fullName,
            email=user_data.email,
            password=user_data.password,
            date_of_birth=user_data.dateofbirth,
            user_type=user_data.type
        )
        user_info = get_user_data(user_id)
        token = create_jwt_token(user_id, user_data.email)
        return SignupResponse(
            success=True,
            message="User created successfully",
            user=UserResponse(**user_info),
            token=token
        )
    except Exception as e:
        return SignupResponse(
            success=False,
            message=str(e)
        )

    

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: int):
    """Get user by ID"""
    user_info = get_user_data(user_id)
    if user_info:
        return UserResponse(**user_info)
    else:
        return {"message": "User not found"}
    

@router.put("/{user_id}")
async def update_user(user_id: int, updates: dict):
    """Update user information"""
    try:
        update_user(user_id, **updates)
        return {"message": "User updated successfully"}
    except Exception as e:
        return {"message": str(e)}
    