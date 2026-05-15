# app/core/alignement.py

from collections import defaultdict


def _identify_candidate_speaker(annotation) -> str:
    """
    Pick the speaker with the most total talk time as the candidate.
    In a 1-on-1 interview the candidate usually speaks more than the interviewer.
    Returns the speaker label (e.g. "SPEAKER_00").
    """
    durations = defaultdict(float)
    for turn, _, speaker in annotation.itertracks(yield_label=True):
        durations[speaker] += turn.end - turn.start

    if not durations:
        return None

    return max(durations, key=durations.get)


def extract_candidate_speech(diarization, segments):
    """
    Align Whisper transcription segments with diarization turns,
    keep ONLY the segments that belong to the candidate (most-talking speaker),
    deduplicate, and sort by time.

    Returns a list of dicts: {start, end, speaker, text}
    """
    annotation = diarization.speaker_diarization

    # 1. Identify which speaker is the candidate
    candidate_speaker = _identify_candidate_speaker(annotation)
    if candidate_speaker is None:
        return []

    # 2. Walk diarization turns; for each candidate turn, attach overlapping
    #    transcription segments
    aligned = []
    for turn, _, speaker in annotation.itertracks(yield_label=True):
        if speaker != candidate_speaker:
            continue

        for seg in segments:
            # overlap check between [seg.start, seg.end] and [turn.start, turn.end]
            if seg["end"] > turn.start and seg["start"] < turn.end:
                aligned.append({
                    "start": round(seg["start"], 2),
                    "end": round(seg["end"], 2),
                    "speaker": speaker,
                    "text": seg["text"].strip()
                })

    # 3. Deduplicate (a segment may overlap multiple turns of the same speaker)
    seen = set()
    unique = []
    for item in aligned:
        key = (item["start"], item["end"], item["speaker"], item["text"])
        if key not in seen:
            seen.add(key)
            unique.append(item)

    # 4. Sort by time
    unique.sort(key=lambda x: x["start"])
    return unique