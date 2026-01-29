from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import os
from pydub import AudioSegment
import uuid
# Create a FastAPI instance
app = FastAPI()

# Define a path operation decorator for a GET request to the root path
@app.get("/")
def read_root():
    # The function below the decorator handles the request
    return {"message": "Hello, World!"}

@app.get("/test")
def read_test():
    # The function below the decorator handles the request
    return {"message": "this is test!"}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "audios"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/upload-audio")    
async def upload_audio(file: UploadFile = File(...)):
    temp_path = f"{UPLOAD_DIR}/{uuid.uuid4()}.webm"
    wav_path = temp_path.replace(".webm", ".wav")

    # sauvegarde temporaire
    with open(temp_path, "wb") as f:
        f.write(await file.read())

    # conversion en WAV
    audio = AudioSegment.from_file(temp_path, format="webm")
    audio.export(wav_path, format="wav")

    os.remove(temp_path)
    print(f"Fichier WAV sauvegardé à : {wav_path}")
    return {
        "status": "success",
        "wav_file": wav_path
    }