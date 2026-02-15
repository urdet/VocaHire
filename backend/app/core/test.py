from gpt_analysis import analyze_candidate_with_gemini
from diarization import run_diarization
from transcription import transcribe_audio
from alignement import extract_candidate_speech
audio_path="E:/Projects/VocaHire/audios/small-talk_sm.wav"
#diarization_result = run_diarization(audio_path)

    # 2. Transcription
#transcription_result = transcribe_audio(audio_path)

    # 3. Extract candidate-only speech
#candidate_text = extract_candidate_speech(
#    diarization=diarization_result,
#    segments=transcription_result,
#)
candidate_text = [
    {
      "start": 0,
      "end": 5,
      "speaker": "SPEAKER_01",
      "text": "Her grumpy mister, is that why that woman left you on the bench?"
    },
    {
      "start": 5,
      "end": 8,
      "speaker": "SPEAKER_01",
      "text": "Was she your girlfriend?"
    },
    {
      "start": 5,
      "end": 8,
      "speaker": "SPEAKER_00",
      "text": "Was she your girlfriend?"
    },
    {
      "start": 8,
      "end": 12,
      "speaker": "SPEAKER_00",
      "text": "No. No, she wasn't."
    },
    {
      "start": 12,
      "end": 15,
      "speaker": "SPEAKER_00",
      "text": "Listen, I have a girlfriend, mister."
    },
    {
      "start": 12,
      "end": 15,
      "speaker": "SPEAKER_01",
      "text": "Listen, I have a girlfriend, mister."
    },
    {
      "start": 15,
      "end": 18,
      "speaker": "SPEAKER_01",
      "text": "I'm only in this second grade."
    },
    {
      "start": 15,
      "end": 18,
      "speaker": "SPEAKER_00",
      "text": "I'm only in this second grade."
    },
    {
      "start": 18,
      "end": 22,
      "speaker": "SPEAKER_01",
      "text": "Where's your girlfriend?"
    },
    {
      "start": 22,
      "end": 29,
      "speaker": "SPEAKER_00",
      "text": "My wife, Elizabeth, is gone."
    },
    {
      "start": 30,
      "end": 33,
      "speaker": "SPEAKER_01",
      "text": "Well, where has she gone, too?"
    },
    {
      "start": 33,
      "end": 38,
      "speaker": "SPEAKER_00",
      "text": "She's gone. Gone."
    },
    {
      "start": 38,
      "end": 40,
      "speaker": "SPEAKER_00",
      "text": "Dead."
    },
    {
      "start": 38,
      "end": 40,
      "speaker": "SPEAKER_01",
      "text": "Dead."
    },
    {
      "start": 40,
      "end": 43,
      "speaker": "SPEAKER_01",
      "text": "Oh, that's sad."
    },
    {
      "start": 43,
      "end": 48,
      "speaker": "SPEAKER_01",
      "text": "Well, my girlfriend, Katie, she's still really young."
    },
    {
      "start": 48,
      "end": 52,
      "speaker": "SPEAKER_01",
      "text": "Was she a good girlfriend?"
    },
    {
      "start": 52,
      "end": 55,
      "speaker": "SPEAKER_01",
      "text": "Katie's the best I've had."
    },
    {
      "start": 55,
      "end": 59,
      "speaker": "SPEAKER_00",
      "text": "Yes. Elizabeth was one of a kind."
    },
    {
      "start": 59,
      "end": 65,
      "speaker": "SPEAKER_01",
      "text": "Why? Have you ever had any other girlfriends?"
    },
    {
      "start": 65,
      "end": 68,
      "speaker": "SPEAKER_01",
      "text": "Yesterday, I bought Katie a flower,"
    },
    {
      "start": 68,
      "end": 73,
      "speaker": "SPEAKER_01",
      "text": "and she gave me a kiss on the cheek."
    },
    {
      "start": 73,
      "end": 76,
      "speaker": "SPEAKER_01",
      "text": "Have you ever bought a girl flower?"
    },
    {
      "start": 73,
      "end": 76,
      "speaker": "SPEAKER_00",
      "text": "Have you ever bought a girl flower?"
    },
    {
      "start": 76,
      "end": 80,
      "speaker": "SPEAKER_00",
      "text": "Kid, you've got a lot to learn about relationships."
    },
    {
      "start": 80,
      "end": 83,
      "speaker": "SPEAKER_00",
      "text": "Have you ever looked into someone's eyes"
    },
    {
      "start": 83,
      "end": 88,
      "speaker": "SPEAKER_00",
      "text": "and had a whole conversation in an instant?"
    },
    {
      "start": 88,
      "end": 90,
      "speaker": "SPEAKER_00",
      "text": "Left with someone."
    },
    {
      "start": 90,
      "end": 95,
      "speaker": "SPEAKER_00",
      "text": "Kept laughing until you even forgot why you were left."
    },
    {
      "start": 95,
      "end": 97,
      "speaker": "SPEAKER_00",
      "text": "Have you ever cried when..."
    },
    {
      "start": 95,
      "end": 97,
      "speaker": "SPEAKER_01",
      "text": "Have you ever cried when..."
    },
    {
      "start": 97,
      "end": 101,
      "speaker": "SPEAKER_01",
      "text": "I cried last night when I said goodbye to Katie."
    },
    {
      "start": 101,
      "end": 107,
      "speaker": "SPEAKER_01",
      "text": "But that was because I had scraped my knees."
    },
    {
      "start": 107,
      "end": 109,
      "speaker": "SPEAKER_01",
      "text": "Mister?"
    },
    {
      "start": 107,
      "end": 109,
      "speaker": "SPEAKER_00",
      "text": "Mister?"
    },
    {
      "start": 109,
      "end": 112,
      "speaker": "SPEAKER_00",
      "text": "Yes."
    },
    {
      "start": 109,
      "end": 112,
      "speaker": "SPEAKER_01",
      "text": "Yes."
    },
    {
      "start": 112,
      "end": 116,
      "speaker": "SPEAKER_01",
      "text": "Are you going to get a new girlfriend for all those things?"
    },
    {
      "start": 116,
      "end": 120,
      "speaker": "SPEAKER_00",
      "text": "No. No, I'm happy just by myself."
    },
    {
      "start": 120,
      "end": 123,
      "speaker": "SPEAKER_01",
      "text": "I think you're grumpy."
    }
  ]

print("Candidate Text:", candidate_text)
res = analyze_candidate_with_gemini(job_title="Software Engineer", required_qualities=["Problem Solving", "Communication"], transcript=candidate_text)
print(res)