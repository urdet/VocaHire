import { useState, useRef } from "react";

export default function AudioRecorder() {
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    mediaRecorderRef.current = new MediaRecorder(stream, {
      mimeType: "audio/webm" // on convertira en wav côté backend
    });

    audioChunksRef.current = [];

    mediaRecorderRef.current.ondataavailable = (event) => {
      audioChunksRef.current.push(event.data);
    };

    mediaRecorderRef.current.start();
    setRecording(true);
  };

  const stopRecording = async () => {
    mediaRecorderRef.current.stop();
    setRecording(false);

    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, {
        type: "audio/webm"
      });

      sendAudioToServer(audioBlob);
    };
  };

  const sendAudioToServer = async (audioBlob) => {
    const formData = new FormData();
    formData.append("file", audioBlob, "recording.webm");

    const res = await fetch("http://localhost:8000/upload-audio", {
      method: "POST",
      body: formData
    });
    alert(await res.text());
    alert("Audio envoyé !");
  };

  return (
    <div>
      {!recording ? (
        <button onClick={startRecording}>🎙️ Start</button>
      ) : (
        <button onClick={stopRecording}>⏹ Stop</button>
      )}
    </div>
  );
}
