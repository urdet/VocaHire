from fastapi import FastAPI, UploadFile, File
import uuid
import os

from pydub import AudioSegment
from app.services.job_service import enqueue_audio_processing
from app.db.database import SessionLocal
from app.db import crud

app = FastAPI()

UPLOAD_DIR = "audios"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@app.post("/analyze-audio")
async def analyze_audio(file: UploadFile = File(...)):

    # Generate filenames
    temp = f"{UPLOAD_DIR}/{uuid.uuid4()}.webm"
    wav = temp.replace(".webm", ".wav")

    # Save uploaded file
    with open(temp, "wb") as f:
        f.write(await file.read())

    # Convert to wav
    AudioSegment.from_file(temp).export(wav, format="wav")
    os.remove(temp)

    # Create DB session
    db = SessionLocal()

