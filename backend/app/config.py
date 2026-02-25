from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "VocaHire API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/base-v1"
    
    # Database
    DATABASE_URL: str = "postgresql://postgres:rida%40123.@localhost/VocaHire"
    
    # Security
    SECRET_KEY: str = "rida_is_the_best"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # File upload
    MAX_UPLOAD_SIZE: int = 50 * 1024 * 1024  # 50MB
    AUDIO_UPLOAD_PATH: str = "uploads/audio/"
    
    class Config:
        env_file = ".env"
        extra = "ignore"  # This ignores extra fields from .env file

settings = Settings()