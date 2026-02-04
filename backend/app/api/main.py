# main.py
from fastapi import FastAPI
import sys
import os

# Get the parent directory (backend)
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
# Change from relative to absolute imports
from api.routes.audio import router as audio_router
from api.routes.candidates import router as candidates_router
from api.routes.sessions import router as sessions_router
from backend.api.routes.db.users import router as users_router
# Load environment variables
from dotenv import load_dotenv
load_dotenv()
app = FastAPI(title="My FastAPI App")

# Register routes
app.include_router(candidates_router, prefix="/candidates", tags=["Candidates"])
app.include_router(audio_router, prefix="/audio", tags=["Audio"])
app.include_router(sessions_router, prefix="/sessions", tags=["Sessions"])
app.include_router(users_router, prefix="/users", tags=["Users"])

@app.get("/")
async def root():
    return {"message": "Welcome to My FastAPI App", "status": "running"}