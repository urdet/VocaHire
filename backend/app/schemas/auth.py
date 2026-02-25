from pydantic import BaseModel, EmailStr
from typing import Optional

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    user_id: int
    email: EmailStr
    full_name: str
    role: str
    is_active: bool
    message: str

class ChangePasswordRequest(BaseModel):
    user_id: int
    current_password: str
    new_password: str

class ChangePasswordResponse(BaseModel):
    message: str
    success: bool