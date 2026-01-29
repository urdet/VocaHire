import whisper
import soundfile as sf
import numpy as np
import torch
import os
from dotenv import load_dotenv
from pyannote.audio import Pipeline
import pyannote
from pyannote.audio.core.task import Specifications
from pyannote.audio.core.model import Model
import warnings

warnings.filterwarnings(
    "ignore",
    message="std\\(\\): degrees of freedom is <= 0.*"
)
torch.serialization.add_safe_globals([Specifications, Model])

torch.serialization.add_safe_globals([torch.torch_version.TorchVersion])
torch.serialization.add_safe_globals([pyannote.audio.core.task.Problem])
torch.serialization.add_safe_globals([pyannote.audio.core.task.Resolution])

print("----------------  Starting diarization + whisper  ----------------\n")
# ---------- Load audio WITHOUT pydub ----------
def load_audio(path):
    audio, sr = sf.read(path)

    # Convert to mono
    if audio.ndim > 1:
        audio = audio.mean(axis=1)

    # Resample if needed
    if sr != 16000:
        import librosa
        audio = librosa.resample(audio, orig_sr=sr, target_sr=16000)

    audio = audio.astype(np.float32)
    waveform = torch.from_numpy(audio).unsqueeze(0)

    return {"waveform": waveform, "sample_rate": 16000}

# ---------- Models ----------
load_dotenv()  # loads .env
whisper_model = whisper.load_model("base")

pipeline = Pipeline.from_pretrained(
    "pyannote/speaker-diarization-3.1",
    token=os.getenv("HF_TOKEN")
)
print("-----------------  Models loaded successfully  -----------------\n")
# ---------- Process ----------
audio_file = "fr_audio.wav"

# Diarization
audio_dict = load_audio(audio_file)
diarization = pipeline(audio_dict)

# Transcription
whisper_result = whisper_model.transcribe(
    audio_file,
    fp16=False
)



print("-----------------  Audio Loaded Successfully  -----------------")

# ---------- Align ----------
segments = whisper_result["segments"]


annotation = diarization.speaker_diarization


# ---------- Collect ALL aligned segments ----------
aligned = []


for turn, _, speaker in annotation.itertracks(yield_label=True):
    for seg in segments:
        if seg["end"] > turn.start and seg["start"] < turn.end:
            aligned.append({
            "start": round(seg["start"], 2),
            "end": round(seg["end"], 2),
            "speaker": speaker,
            "text": seg["text"].strip()
            })


# ---------- Remove duplicates ----------
seen = set()
unique = []


for item in aligned:
    key = (item["start"], item["end"], item["speaker"], item["text"])
    if key not in seen:
        seen.add(key)
        unique.append(item)


# ---------- Sort by time ----------
unique.sort(key=lambda x: x["start"])


# ---------- Final output ----------
for u in unique:
    print(f"[{u['start']}s → {u['end']}s] {u['speaker']}: {u['text']}")