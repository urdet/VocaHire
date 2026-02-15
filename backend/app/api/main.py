# main.py
from fastapi import FastAPI
import sys
import os

# Get the parent directory (backend)
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
# Change from relative to absolute imports
from api.routes.audio import router as audio_router
from api.routes.candidates import router as candidates_router
from api.routes.db.users import router as users_router
from api.routes.db.sessions import router as db_sessions_router
from api.routes.db.candidatesList import router as candidats_list_router
from fastapi.middleware.cors import CORSMiddleware
# Load environment variables
from dotenv import load_dotenv
load_dotenv()

app = FastAPI(title="My FastAPI App")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Your Vite frontend URL
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)
# Register routes
app.include_router(candidates_router, prefix="/candidates", tags=["Candidates"])
app.include_router(audio_router, prefix="/audio", tags=["Audio"])
app.include_router(db_sessions_router, prefix="/sessions", tags=["Sessions"])
app.include_router(users_router, prefix="/users", tags=["Users"])
app.include_router(candidats_list_router, prefix="/candidates", tags=["Candidates List"])

@app.get("/")
async def root():
    return {"message": "Welcome to My FastAPI App", "status": "running"}