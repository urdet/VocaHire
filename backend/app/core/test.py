from gpt_analysis import analyze_candidate_with_gemini
from diarization import run_diarization
from transcription import transcribe_audio
from alignement import extract_candidate_speech
audio_path="E:/Projects/VocaHire/audios/small-talk_sm.wav"
diarization_result = run_diarization(audio_path)

    # 2. Transcription
transcription_result = transcribe_audio(audio_path)

    # 3. Extract candidate-only speech
candidate_text = extract_candidate_speech(
    diarization=diarization_result,
    segments=transcription_result,
)
print("Candidate Text:", candidate_text)
res = analyze_candidate_with_gemini(job_title="Software Engineer", required_qualities=["Problem Solving", "Communication"], transcript=candidate_text)
print(res)