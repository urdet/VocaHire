from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text
import os

from app.api.routes import auth, audio
from app.api.routes.db import candidates, users, job_sessions, interviews, analysis, training
from app.config import settings
from app.db.database import Base, engine


# Ensure storage directories exist
os.makedirs(settings.AUDIO_UPLOAD_PATH, exist_ok=True)
os.makedirs(os.path.join(settings.AUDIO_UPLOAD_PATH, "training"), exist_ok=True)
os.makedirs(os.path.join(settings.AUDIO_UPLOAD_PATH, "interviews"), exist_ok=True)

# Create tables for MVP/demo usage
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="VocaHire API",
    description="API for VocaHire - Voice Analysis for Hiring",
    version=settings.VERSION,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory=settings.AUDIO_UPLOAD_PATH), name="uploads")

api_prefix = settings.API_V1_STR
app.include_router(auth.router, prefix=api_prefix)
app.include_router(users.router, prefix=api_prefix)
app.include_router(job_sessions.router, prefix=api_prefix)
app.include_router(candidates.router, prefix=api_prefix)
app.include_router(interviews.router, prefix=api_prefix)
app.include_router(analysis.router, prefix=api_prefix)
app.include_router(training.router, prefix=api_prefix)
app.include_router(audio.router, prefix=api_prefix)


@app.get("/")
def root():
    return {
        "message": "Welcome to VocaHire API",
        "version": settings.VERSION,
        "docs": "/docs",
        "endpoints": {
            "auth": f"{api_prefix}/auth",
            "users": f"{api_prefix}/users",
            "job_sessions": f"{api_prefix}/job-sessions",
            "candidates": f"{api_prefix}/candidates",
            "interviews": f"{api_prefix}/interviews",
            "analysis": f"{api_prefix}/analysis",
            "training": f"{api_prefix}/training",
            "audio": f"{api_prefix}/audio",
        },
    }


@app.get("/health")
def health_check():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as exc:  # pragma: no cover - defensive runtime path
        db_status = f"error: {exc}"

    return {
        "status": "healthy",
        "database": db_status,
        "audio_upload_path": settings.AUDIO_UPLOAD_PATH,
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.api.main:app", host="0.0.0.0", port=5000, reload=True)
