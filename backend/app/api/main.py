from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))
from app.api.routes import (auth, audio)
from app.api.routes.db import candidates, users, job_sessions, interviews, analysis, training
from app.config import settings

# Create uploads directory if it doesn't exist
os.makedirs(settings.AUDIO_UPLOAD_PATH, exist_ok=True)
os.makedirs(os.path.join(settings.AUDIO_UPLOAD_PATH, "training"), exist_ok=True)

# Create FastAPI app
app = FastAPI(
    title="VOCaHire API",
    description="API for VocaHire - Voice Analysis for Hiring",
    version=settings.VERSION
)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for audio access (optional)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include routers
api_prefix = settings.API_V1_STR

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
        "message": "Welcome to VOCaHire API",
        "version": settings.VERSION,
        "docs": "/docs",
        "endpoints": {
            "users": f"{api_prefix}/users",
            "job_sessions": f"{api_prefix}/job-sessions",
            "candidates": f"{api_prefix}/candidates",
            "interviews": f"{api_prefix}/interviews",
            "analysis": f"{api_prefix}/analysis",
            "training": f"{api_prefix}/training",
            "audio": f"{api_prefix}/audio"
        }
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "database": "connected"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)