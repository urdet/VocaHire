import os
import torch
import soundfile as sf
import numpy as np
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

torch.serialization.add_safe_globals([
    Specifications,
    Model,
    pyannote.audio.core.task.Problem,
    pyannote.audio.core.task.Resolution,
    torch.torch_version.TorchVersion
])

load_dotenv()

def load_audio(path: str):
    audio, sr = sf.read(path)

    if audio.ndim > 1:
        audio = audio.mean(axis=1)

    if sr != 16000:
        import librosa
        audio = librosa.resample(audio, orig_sr=sr, target_sr=16000)

    audio = audio.astype(np.float32)
    waveform = torch.from_numpy(audio).unsqueeze(0)

    return {"waveform": waveform, "sample_rate": 16000}


def run_diarization(audio_path: str):
    pipeline = Pipeline.from_pretrained(
        "pyannote/speaker-diarization-3.1",
        token=os.getenv("HF_TOKEN")
    )

    audio_dict = load_audio(audio_path)
    diarization = pipeline(audio_dict)

    return diarization
