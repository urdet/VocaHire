# users.py
from fastapi import APIRouter
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime, date

router = APIRouter(tags=["Users"])
# Pydantic Models
class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserSignup(BaseModel):
    fullName: str
    email: EmailStr
    password: str
    dateofbirth: Optional[date] = None

class UserResponse(BaseModel):
    id: int
    fullName: str
    email: str
    type: str
    Infos: Optional[dict] = None
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
    

@router.post("/signup", response_model=SignupResponse)
async def signup(user_data: UserSignup):
    """Signup endpoint - Create new user"""
    

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: int):
    """Get user by ID"""
    

@router.put("/{user_id}")
async def update_user(user_id: int, updates: dict):
    """Update user information"""
    