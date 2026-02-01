from fastapi import FastAPI, UploadFile, File
from app.core.pipeline import full_audio_evaluation
import uuid, os
from pydub import AudioSegment

app = FastAPI()
UPLOAD_DIR = "audios"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/analyze-audio")
async def analyze_audio(file: UploadFile = File(...)):
    temp = f"{UPLOAD_DIR}/{uuid.uuid4()}.webm"
    wav = temp.replace(".webm", ".wav")

    with open(temp, "wb") as f:
        f.write(await file.read())

    AudioSegment.from_file(temp).export(wav, format="wav")
    os.remove(temp)

    result = full_audio_evaluation(wav)
    return {"segments": result}
    