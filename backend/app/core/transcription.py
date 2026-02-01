# app/core/transcription.py

import whisper

def run_transcription(audio_path: str, model_size="base"):
    model = whisper.load_model(model_size)

    result = model.transcribe(
        audio_path,
        fp16=False
    )

    return result["segments"]
