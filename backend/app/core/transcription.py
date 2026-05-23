# app/core/transcription.py

import whisper

def transcribe_audio(audio_path: str, model_size="small"):
    model = whisper.load_model(model_size)
    result = model.transcribe(
        audio_path,
        fp16=False,
        # Auto-detect language (works for FR, EN, AR, ES, etc.)
        # If you want faster but less accurate, use "base"
        # If you want even better but slower, use "medium"
    )
    return result["segments"]
