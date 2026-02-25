from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import User
from app.schemas.auth import LoginRequest, LoginResponse, ChangePasswordRequest, ChangePasswordResponse
from app.core.security import verify_password

router = APIRouter(prefix="/auth", tags=["authentication"])

@router.post("/login", response_model=LoginResponse)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Login endpoint for OAuth2 compatible form data
    Returns user info if credentials are valid
    """
    user = db.query(User).filter(User.email == form_data.username).first()
    
    # Check if user exists and password is correct
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    
    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    # Return user info (no token since we're not using JWT)
    return {
        "user_id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role,
        "is_active": user.is_active,
        "message": "Login successful"
    }

@router.post("/login/json", response_model=LoginResponse)
def login_json(
    login_data: LoginRequest,
    db: Session = Depends(get_db)
):
    """
    Login endpoint for JSON data
    Returns user info if credentials are valid
    """
    user = db.query(User).filter(User.email == login_data.email).first()
    
    # Check if user exists and password is correct
    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    
    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    # Return user info (no token since we're not using JWT)
    return {
        "user_id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role,
        "is_active": user.is_active,
        "message": "Login successful"
    }

@router.post("/verify-credentials")
def verify_credentials(
    email: str,
    password: str,
    db: Session = Depends(get_db)
):
    """
    Simple endpoint to verify credentials (useful for testing)
    """
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        return {"valid": False, "reason": "User not found"}
    
    if not verify_password(password, user.password_hash):
        return {"valid": False, "reason": "Invalid password"}
    
    if not user.is_active:
        return {"valid": False, "reason": "User inactive"}
    
    return {
        "valid": True,
        "user_id": user.id,
        "role": user.role
    }

@router.post("/change-password", response_model=ChangePasswordResponse)
def change_password(
    request: ChangePasswordRequest,
    db: Session = Depends(get_db)
):
    """
    Change user password
    """
    from app.core.security import get_password_hash
    
    user = db.query(User).filter(User.id == request.user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Verify current password
    if not verify_password(request.current_password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Current password is incorrect"
        )
    
    # Update password
    user.password_hash = get_password_hash(request.new_password)
    db.commit()
    
    return {
        "message": "Password changed successfully",
        "success": True
    }