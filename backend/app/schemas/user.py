from pydantic import BaseModel, EmailStr, Field
from datetime import datetime, date
from typing import Optional

class UserBase(BaseModel):
    first_name: str = Field(..., max_length=255)          # new
    last_name: str = Field(..., max_length=255)
    email: EmailStr = Field(..., max_length=255)
    role: str = Field(..., pattern="^(candidate|recruiter|admin)$")
    date_of_birth: Optional[date] = None
    bio: Optional[str] = None
class Userlogin(BaseModel):
    email: EmailStr = Field(..., max_length=255)
    password: str = Field(..., min_length=8)

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class UserUpdate(BaseModel):
    first_name: str = Field(..., max_length=255)          # new
    last_name: str = Field(..., max_length=255)
    email: Optional[EmailStr] = Field(None, max_length=255)
    date_of_birth: Optional[date] = None
    bio: Optional[str] = None
    is_active: Optional[bool] = None

class UserInDB(UserBase):
    id: int
    registered_at: datetime
    is_active: bool
    
    class Config:
        from_attributes = True

class User(UserInDB):
    pass