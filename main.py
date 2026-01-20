
import torch
import os
import torchaudio
import soundfile as sf
from tqdm import tqdm
import time
# --- 1. Fix PyTorch 2.6+ Security Blocks ---
# We allowlist the specific internal classes pyannote uses to store model metadata
import pyannote
from pyannote.audio.core.task import Specifications
from pyannote.audio.core.model import Model
torch.serialization.add_safe_globals([Specifications, Model])

torch.serialization.add_safe_globals([torch.torch_version.TorchVersion])
torch.serialization.add_safe_globals([pyannote.audio.core.task.Problem])
torch.serialization.add_safe_globals([pyannote.audio.core.task.Resolution])

# --- 2. Handle FFmpeg DLLs (Optional Warning Fix) ---
# If you downloaded FFmpeg Shared to C:\ffmpeg, this line silences the torchcodec warning
if os.path.exists(r"C:\ffmpeg\bin"):
    os.add_dll_directory(r"C:\ffmpeg\bin")

from pyannote.audio import Pipeline
from dotenv import load_dotenv
from pydub import AudioSegment
import numpy as np

def CleaningAudio(audio_segment: AudioSegment):
    # 1. Ensure the audio is in the right format (16kHz, Mono)
    audio = audio_segment.set_frame_rate(16000).set_channels(1)
    # 2. Extract raw samples as a numpy array
    # pydub stores data as integers; we need to convert to float32 for ML
    samples = np.array(audio.get_array_of_samples()).astype(np.float32)
    # 3. Normalize to [-1.0, 1.0] range
    # 16-bit PCM has a max value of 2^15
    samples /= (2**15)
    # 4. Convert to Torch Tensor
    # Pyannote expects shape (channels, samples), so we add a dimension
    waveform = torch.from_numpy(samples).unsqueeze(0)
    # 5. Create the dictionary format Pyannote expects
    return {"waveform": waveform, "sample_rate": 16000}


load_dotenv()  # loads .env

def main():
    # Replace with your actual token
    token = os.getenv("HF_TOKEN")
    
    print("Loading pretrained speaker diarization pipeline...")
    
    pipeline = Pipeline.from_pretrained("pyannote/speaker-diarization-3.1",
                                        token=token)
    
    # GPU si disponible
    if torch.cuda.is_available():
        pipeline.to("cuda")
        print("🚀 GPU enabled")
    else:
        print("⚠️ CPU only")

    # Liste des fichiers à traiter
    audio_files = ["Small_Talk.wav"]
    for file in audio_files:
        print(f"Processing {file}...")
        audio_segment = AudioSegment.from_file(file)
        cleaned_audio = CleaningAudio(audio_segment)
        diarization = pipeline(cleaned_audio)        # Sauvegarde des résultats au format RTTM
        print("Diarization results:\n", diarization.speaker_diarization)

if __name__ == "__main__":
    main()