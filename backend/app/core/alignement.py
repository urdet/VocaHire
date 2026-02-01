# app/core/alignement.py

def align_diarization_transcription(diarization, segments):
    annotation = diarization.speaker_diarization
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

    # Remove duplicates
    seen = set()
    unique = []
    for item in aligned:
        key = (item["start"], item["end"], item["speaker"], item["text"])
        if key not in seen:
            seen.add(key)
            unique.append(item)

    # Sort by time
    unique.sort(key=lambda x: x["start"])
    return unique
