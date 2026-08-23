/** PATH: frontend/VocaHire/src/components/SessionView.jsx */
import { useState, useRef, useMemo, useEffect } from 'react';
import {
  ArrowLeft,
  Users,
  Calendar,
  ChevronRight,
  Trash2,
  Upload,
  Play,
  RefreshCw,
  FileText,
  Loader,
  Loader2
} from 'lucide-react';

import { API_BASE } from '../config/api';

export default function SessionView({
  activeSession,
  setSessions,
  sessions,
  activeSessionId,
  setActiveSessionId,
  t,
  setIsProcessing,
  setCurrentCandidate
}) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [cin, setCin] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAnalyzingAll, setIsAnalyzingAll] = useState(false);

  const fileInputRefs = useRef({});

  useEffect(() => {
    if (activeSessionId) {
      fetchCandidates();
    }
  }, [activeSessionId]);

  // -------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------

  const isAnalysisReady = (data) =>
    data && data.final_score !== null && data.final_score !== undefined;

  /**
   * Build the candidate "results" object expected by the UI from the
   * analysis row coming from the backend.
   */
  const buildResults = (data) => ({
    content_relevance: data.content_relevance,
    vocal_confidence: data.vocal_confidence,
    clarity_of_speech: data.clarity_of_speech,
    fluency: data.fluency,
    final_score: data.final_score,
    short_feedback: data.feedback
  });

  const isCandidateProcessing = (candidate) =>
    ['uploading', 'queued', 'uploaded', 'pending', 'processing'].includes(candidate?.status);

  const progressFromBackend = (data, fallback) => {
    const progress = data?.progress;
    if (!progress) return fallback;

    const startedAt = progress.started_at ? Date.parse(progress.started_at) : null;

    return {
      phase: progress.phase || fallback?.phase || 'processing',
      label: progress.label || fallback?.label || 'Analysis running',
      message: progress.message || data?.message || fallback?.message || 'The backend is processing this interview.',
      detail: progress.detail || null,
      progress: Number(progress.progress ?? fallback?.progress ?? 24),
      startedAt: Number.isFinite(startedAt) ? startedAt : fallback?.startedAt,
      updatedAt: progress.updated_at || null,
      elapsedMs: Number.isFinite(startedAt) ? Math.max(0, Date.now() - startedAt) : fallback?.elapsedMs
    };
  };

  const stageForElapsed = (elapsedMs) => {
    if (elapsedMs < 12_000) {
      return {
        phase: 'queued',
        label: 'Preparing interview audio',
        message: 'The audio has been sent and the analysis job is being prepared.',
        progress: 28
      };
    }

    if (elapsedMs < 75_000) {
      return {
        phase: 'diarization',
        label: 'Detecting speakers',
        message: 'VocaHire is separating interviewer and candidate speech.',
        progress: Math.min(52, 32 + Math.floor(elapsedMs / 4500))
      };
    }

    if (elapsedMs < 210_000) {
      return {
        phase: 'transcription',
        label: 'Transcribing candidate speech',
        message: 'Whisper is converting the interview audio into text. Long files can take a while.',
        progress: Math.min(78, 52 + Math.floor((elapsedMs - 75_000) / 6000))
      };
    }

    if (elapsedMs < 420_000) {
      return {
        phase: 'evaluation',
        label: 'Evaluating answers',
        message: 'The AI is scoring clarity, confidence, fluency and job relevance.',
        progress: Math.min(91, 78 + Math.floor((elapsedMs - 210_000) / 16000))
      };
    }

    return {
      phase: 'finalizing',
      label: 'Finalizing report',
      message: 'The report is almost ready. Waiting for the backend to save the final score.',
      progress: 94
    };
  };

  const updateCandidateRuntime = (candidateId, patch) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (String(s.id) !== String(activeSessionId)) return s;
        return {
          ...s,
          candidates: (s.candidates || []).map((c) =>
            String(c.id) === String(candidateId) ? { ...c, ...patch } : c
          )
        };
      })
    );

    setCurrentCandidate((current) =>
      current && String(current.id) === String(candidateId)
        ? { ...current, ...patch }
        : current
    );
  };

  // -------------------------------------------------------------------
  // Data loading
  // -------------------------------------------------------------------

  const fetchCandidates = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [candidatesResponse, interviewsResponse] = await Promise.all([
        fetch(`${API_BASE}/candidates/?job_session_id=${activeSessionId}`),
        fetch(`${API_BASE}/interviews/?job_session_id=${activeSessionId}`)
      ]);

      if (!candidatesResponse.ok) throw new Error('Failed to fetch candidates');
      if (!interviewsResponse.ok) throw new Error('Failed to fetch interviews');

      const candidates = await candidatesResponse.json();
      const interviews = await interviewsResponse.json();

      const interviewsByCandidateItemId = {};
      interviews.forEach((interview) => {
        interviewsByCandidateItemId[String(interview.candidate_item_id)] = interview;
      });

      // For candidates that already have an analyzed interview, fetch the
      // saved analysis so we can rehydrate the results panel on reload.
      const analysisFetches = candidates
        .filter((c) => {
          const iv = interviewsByCandidateItemId[String(c.id)];
          return iv && iv.id;
        })
        .map(async (c) => {
          const iv = interviewsByCandidateItemId[String(c.id)];
          try {
            const r = await fetch(`${API_BASE}/analysis/interview/${iv.id}`);
            if (!r.ok) return [String(c.id), null];
            const data = await r.json();
            return [String(c.id), data];
          } catch {
            return [String(c.id), null];
          }
        });

      const analysisResults = Object.fromEntries(await Promise.all(analysisFetches));

      setSessions((prev) =>
        prev.map((s) => {
          if (String(s.id) !== String(activeSessionId)) return s;

          return {
            ...s,
            candidates: candidates.map((c) => {
              const candidateItemId = String(c.id);
              const linkedInterview = interviewsByCandidateItemId[candidateItemId];
              const analysisData = analysisResults[candidateItemId];
              const analysis = isAnalysisReady(analysisData) ? analysisData : null;
              const backendStatus = linkedInterview?.status;
              const visibleStatus = analysis
                ? 'analyzed'
                : ['uploaded', 'processing', 'failed'].includes(backendStatus)
                  ? backendStatus
                  : c.status || 'shortlisted';

              return {
                id: candidateItemId,
                first_name: c.candidate?.first_name || '',
                last_name: c.candidate?.last_name || '',
                cin: c.candidate?.cin || '',
                email: c.candidate?.email || '',
                phone: c.candidate?.phone || '',
                city: c.candidate?.city || '',
                name:
                  `${c.candidate?.first_name || ''} ${c.candidate?.last_name || ''}`.trim() ||
                  'Unnamed candidate',
                analyzed: !!analysis,
                audioFile: linkedInterview?.audio_path
                  ? linkedInterview.audio_path.split(/[\\/]/).pop()
                  : null,
                audioFileObj: null,
                results: analysis ? buildResults(analysis) : null,
                status: visibleStatus,
                notes: c.notes || '',
                totalScore: analysis ? analysis.final_score : c.score || 0,
                interview_id: linkedInterview?.id || null,
                processing: ['uploaded', 'processing'].includes(backendStatus)
                  ? progressFromBackend(analysisData, {
                    phase: 'processing',
                    label: 'Analysis running',
                    message: 'The backend is still processing this interview.',
                    progress: 50
                  })
                  : backendStatus === 'failed'
                    ? progressFromBackend(analysisData, {
                        phase: 'failed',
                        label: 'Analysis failed',
                        message: 'The backend marked this interview as failed.',
                        progress: 100
                      })
                    : null
              };
            })
          };
        })
      );
    } catch (err) {
      console.error('Error fetching candidates:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const sortedCandidates = useMemo(() => {
    if (!activeSession) return [];
    return [...(activeSession.candidates || [])].sort(
      (a, b) => (Number(b.totalScore) || 0) - (Number(a.totalScore) || 0)
    );
  }, [activeSession]);

  // -------------------------------------------------------------------
  // Candidate CRUD
  // -------------------------------------------------------------------

  const addCandidate = async () => {
    if (!firstName.trim() || !lastName.trim()) return;

    const data = {
      candidate: {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        cin: cin.trim(),
        email: email.trim(),
        phone: phone.trim(),
        city: city.trim(),
        infos: ''
      },
      job_session_id: parseInt(activeSessionId, 10),
      list_order: (activeSession?.candidates?.length || 0) + 1,
      notes: '',
      score: null,
      status: 'shortlisted'
    };

    try {
      const response = await fetch(`${API_BASE}/candidates/with-candidate/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) throw new Error(await response.text());

      const result = await response.json();

      setSessions((prev) =>
        prev.map((s) => {
          if (String(s.id) !== String(activeSessionId)) return s;

          const newCandidate = {
            id: String(result.id),
            first_name: result.candidate?.first_name || '',
            last_name: result.candidate?.last_name || '',
            cin: result.candidate?.cin || '',
            email: result.candidate?.email || '',
            phone: result.candidate?.phone || '',
            city: result.candidate?.city || '',
            name: `${result.candidate?.first_name || ''} ${result.candidate?.last_name || ''}`.trim(),
            analyzed: false,
            audioFile: null,
            audioFileObj: null,
            totalScore: 0,
            results: null,
            status: result.status || 'shortlisted',
            notes: result.notes || '',
            interview_id: null
          };

          return {
            ...s,
            candidates: [...(s.candidates || []), newCandidate]
          };
        })
      );

      setFirstName('');
      setLastName('');
      setCin('');
      setEmail('');
      setPhone('');
      setCity('');
    } catch (err) {
      console.error('Error adding candidate:', err);
      setError(err.message);
    }
  };

  const deleteCandidate = async (e, candidateId) => {
    e.stopPropagation();

    try {
      const response = await fetch(`${API_BASE}/candidates/${candidateId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error(await response.text());

      setSessions((prev) =>
        prev.map((s) => {
          if (String(s.id) !== String(activeSessionId)) return s;
          return {
            ...s,
            candidates: (s.candidates || []).filter((c) => String(c.id) !== String(candidateId))
          };
        })
      );
    } catch (err) {
      console.error('Error deleting candidate:', err);
      setError(err.message);
    }
  };

  const handleFileChange = (candidateId, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSessions((prev) =>
      prev.map((s) => {
        if (String(s.id) !== String(activeSessionId)) return s;
        return {
          ...s,
          candidates: (s.candidates || []).map((c) =>
            String(c.id) === String(candidateId)
              ? {
                  ...c,
                  audioFile: file.name,
                  audioFileObj: file,
                  analyzed: false,
                  totalScore: 0,
                  results: null,
                  status: 'audio-selected'
                }
              : c
          )
        };
      })
    );
  };

  // -------------------------------------------------------------------
  // Analysis pipeline
  // -------------------------------------------------------------------

  const updateCandidateAnalysis = async (candidateId, analysisResults) => {
    const payload = {
      score: analysisResults.final_score,
      notes: analysisResults.feedback,
      status: 'analyzed'
    };

    const response = await fetch(`${API_BASE}/candidates/${candidateId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error(await response.text());
    return response.json();
  };

  const ensureInterviewExists = async (candidate) => {
    if (candidate.interview_id) return candidate.interview_id;

    const existingResponse = await fetch(
      `${API_BASE}/interviews/?job_session_id=${activeSessionId}&candidate_id=${candidate.id}`
    );

    if (!existingResponse.ok) throw new Error('Failed to check existing interview');

    const existingInterviews = await existingResponse.json();

    if (existingInterviews.length > 0) {
      const existingInterviewId = existingInterviews[0].id;

      setSessions((prev) =>
        prev.map((s) => {
          if (String(s.id) !== String(activeSessionId)) return s;
          return {
            ...s,
            candidates: (s.candidates || []).map((c) =>
              String(c.id) === String(candidate.id)
                ? { ...c, interview_id: existingInterviewId }
                : c
            )
          };
        })
      );

      return existingInterviewId;
    }

    const createResponse = await fetch(`${API_BASE}/interviews/without-audio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        job_session_id: parseInt(activeSessionId, 10),
        candidate_item_id: parseInt(candidate.id, 10),
        audio_path: '',
        status: 'uploaded'
      })
    });

    if (!createResponse.ok) throw new Error(await createResponse.text());

    const createdInterview = await createResponse.json();

    setSessions((prev) =>
      prev.map((s) => {
        if (String(s.id) !== String(activeSessionId)) return s;
        return {
          ...s,
          candidates: (s.candidates || []).map((c) =>
            String(c.id) === String(candidate.id)
              ? { ...c, interview_id: createdInterview.id }
              : c
          )
        };
      })
    );

    return createdInterview.id;
  };

  const uploadAudioForCandidate = async (candidate, interviewId) => {
    if (!candidate.audioFileObj) throw new Error('Please select an audio file first');

    const formData = new FormData();
    formData.append('file', candidate.audioFileObj);

    const response = await fetch(`${API_BASE}/audio/interview/${interviewId}/upload`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) throw new Error(await response.text());
    return response.json();
  };

  const retryServerAnalysis = async (interviewId) => {
    const response = await fetch(`${API_BASE}/analysis/interview/${interviewId}/retry`, {
      method: 'POST'
    });

    if (!response.ok) throw new Error(await response.text());
    return response.json();
  };

  /**
   * Poll the analysis endpoint until the row contains a final_score.
   * The backend writes the row only when the pipeline (diarization +
   * whisper + gemini) is done, so the presence of final_score is the
   * "done" signal — no separate status field needed.
   *
   * Pipeline can take 3–10 minutes on CPU depending on audio length and
   * the Whisper model size (small / medium). The timeout below is generous.
   */
  const pollInterviewResult = async (candidate, interviewId) => {
    const POLL_INTERVAL_MS = 4000;        // 4 seconds between polls
    const MAX_DURATION_MS  = 15 * 60_000; // give up after 15 minutes
    const start = Date.now();

    while (Date.now() - start < MAX_DURATION_MS) {
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));

      const fallbackStage = stageForElapsed(Date.now() - start);
      updateCandidateRuntime(candidate.id, {
        status: 'processing',
        processing: {
          ...fallbackStage,
          startedAt: start,
          elapsedMs: Date.now() - start
        }
      });

      let data;
      try {
        const response = await fetch(`${API_BASE}/analysis/interview/${interviewId}`);
        if (!response.ok) {
          // 404 / 5xx — analysis row not written yet, keep waiting
          continue;
        }
        data = await response.json();
      } catch {
        continue;
      }

      if (data?.status === 'failed') {
        const failedProgress = progressFromBackend(data, {
          phase: 'failed',
          label: 'Analysis failed',
          message: data.message || 'Analysis failed while processing the interview.',
          progress: 100,
          startedAt: start,
          elapsedMs: Date.now() - start
        });
        updateCandidateRuntime(candidate.id, {
          status: 'failed',
          processing: failedProgress
        });
        throw new Error(data.message || 'Analysis failed while processing the interview.');
      }

      if (data?.status === 'uploaded' || data?.status === 'processing') {
        updateCandidateRuntime(candidate.id, {
          status: 'processing',
          processing: progressFromBackend(data, {
            ...fallbackStage,
            startedAt: start,
            elapsedMs: Date.now() - start
          })
        });
        continue;
      }

      if (!isAnalysisReady(data)) continue;

      // ----- Analysis is ready, propagate to UI + DB -----
      try {
        await updateCandidateAnalysis(candidate.id, data);
      } catch (err) {
        // Updating the candidate row is a "nice to have"; even if it
        // fails (e.g. validation), we still want to surface the scores.
        console.warn('Could not update candidate row:', err);
      }

      const updatedCandidate = {
        ...candidate,
        analyzed: true,
        status: 'analyzed',
        totalScore: data.final_score,
        results: buildResults(data),
        interview_id: interviewId,
        processing: {
          ...progressFromBackend(data, {
            phase: 'completed',
            label: 'Analysis complete',
            message: 'The report is ready.',
            progress: 100,
            startedAt: start,
            elapsedMs: Date.now() - start
          }),
          progress: 100
        }
      };

      setSessions((prev) =>
        prev.map((s) => {
          if (String(s.id) !== String(activeSessionId)) return s;
          return {
            ...s,
            candidates: (s.candidates || []).map((c) =>
              String(c.id) === String(candidate.id) ? updatedCandidate : c
            )
          };
        })
      );

      setCurrentCandidate(updatedCandidate);
      return;
    }

    throw new Error('Analysis is taking longer than expected. Please refresh in a few minutes.');
  };

  const triggerAnalysis = async (candidate) => {
    try {
      setError(null);

      if (candidate.analyzed && candidate.results) {
        setCurrentCandidate(candidate);
        setIsProcessing(true);
        return;
      }

      if (!candidate.audioFileObj && !candidate.audioFile) {
        setError('Please upload an audio file first.');
        return;
      }

      setSessions((prev) =>
        prev.map((s) => {
          if (String(s.id) !== String(activeSessionId)) return s;
          return {
            ...s,
            candidates: (s.candidates || []).map((c) =>
              String(c.id) === String(candidate.id)
                ? {
                    ...c,
                    status: 'queued',
                    processing: {
                      phase: 'queued',
                      label: 'Preparing analysis',
                      message: 'Creating the interview record and preparing the upload.',
                      progress: 8
                    }
                  }
                : c
            )
          };
        })
      );

      const interviewId = await ensureInterviewExists(candidate);

      const candidateForModal = {
        ...candidate,
        interview_id: interviewId,
        status: 'queued',
        processing: {
          phase: 'queued',
          label: 'Preparing analysis',
          message: 'Creating the interview record and preparing the upload.',
          progress: 8
        }
      };

      setCurrentCandidate(candidateForModal);
      setIsProcessing(true);

      // Only upload if the user picked a fresh file; if they're re-opening an
      // existing candidate the audio is already on the server.
      if (candidate.audioFileObj) {
        updateCandidateRuntime(candidate.id, {
          status: 'uploading',
          processing: {
            phase: 'uploading',
            label: 'Uploading audio',
            message: 'Sending the selected audio file to the backend and converting it to WAV.',
            progress: 16
          }
        });
        await uploadAudioForCandidate(candidate, interviewId);
      } else if (candidate.audioFile) {
        await retryServerAnalysis(interviewId);
      }

      updateCandidateRuntime(candidate.id, {
        status: 'processing',
        processing: {
          phase: 'processing',
          label: 'Analysis started',
          message: 'The backend is running diarization, transcription and AI evaluation.',
          progress: 24
        }
      });

      await pollInterviewResult(candidate, interviewId);
    } catch (err) {
      console.error('Error in analysis:', err);
      setError(err.message || 'Failed to analyze audio');

      setSessions((prev) =>
        prev.map((s) => {
          if (String(s.id) !== String(activeSessionId)) return s;
          return {
            ...s,
            candidates: (s.candidates || []).map((c) =>
              String(c.id) === String(candidate.id)
                ? {
                    ...c,
                    status: 'failed',
                    processing: {
                      phase: 'failed',
                      label: 'Analysis failed',
                      message: err.message || 'Failed to analyze audio',
                      progress: 100
                    }
                  }
                : c
            )
          };
        })
      );

      setCurrentCandidate((current) =>
        current && String(current.id) === String(candidate.id)
          ? {
              ...current,
              status: 'failed',
              processing: {
                phase: 'failed',
                label: 'Analysis failed',
                message: err.message || 'Failed to analyze audio',
                progress: 100
              }
            }
          : current
      );
    }
  };

  const analyzeAll = async () => {
    if (!activeSession) return;

    const candidatesToAnalyze = (activeSession.candidates || []).filter((c) => c.audioFileObj);

    if (candidatesToAnalyze.length === 0) {
      setError('No candidates with audio files to analyze.');
      return;
    }

    setIsAnalyzingAll(true);
    setError(null);

    try {
      for (const candidate of candidatesToAnalyze) {
        await triggerAnalysis(candidate);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzingAll(false);
    }
  };

  if (!activeSession) return null;

  // -------------------------------------------------------------------
  // Render (unchanged from your original)
  // -------------------------------------------------------------------

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      <button
        onClick={() => setActiveSessionId(null)}
        className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--accent)] mb-8 transition-colors"
      >
        <ArrowLeft size={14} /> {t.back}
      </button>

      <header className="mb-12 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)] mb-2">
            {activeSession.jobTitle}
          </h1>
          <div className="flex items-center gap-4 text-xs text-[var(--text-muted)] font-mono">
            <span className="flex items-center gap-1">
              <Calendar size={14} /> {activeSession.date}
            </span>
            <span className="flex items-center gap-1">
              <Users size={14} /> {activeSession.candidates?.length || 0} candidats
            </span>
          </div>
        </div>

        <button
          onClick={analyzeAll}
          disabled={isAnalyzingAll}
          className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-blue-600 to-indigo-700 text-white text-xs font-semibold rounded shadow-sm hover:shadow-md transition-all ${
            isAnalyzingAll ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isAnalyzingAll ? <Loader size={14} className="animate-spin" /> : <Play size={14} />}
          Analyser tout
        </button>
      </header>

      <section className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
          <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Prénom *"
            className="px-4 py-2 text-sm bg-[var(--bg-secondary)] border border-[var(--border-light)] rounded outline-none focus:border-[var(--accent)]" />
          <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Nom *"
            className="px-4 py-2 text-sm bg-[var(--bg-secondary)] border border-[var(--border-light)] rounded outline-none focus:border-[var(--accent)]" />
          <input value={cin} onChange={(e) => setCin(e.target.value)} placeholder="CIN"
            className="px-4 py-2 text-sm bg-[var(--bg-secondary)] border border-[var(--border-light)] rounded outline-none focus:border-[var(--accent)]" />
          <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Ville"
            className="px-4 py-2 text-sm bg-[var(--bg-secondary)] border border-[var(--border-light)] rounded outline-none focus:border-[var(--accent)]" />
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email"
            className="px-4 py-2 text-sm bg-[var(--bg-secondary)] border border-[var(--border-light)] rounded outline-none focus:border-[var(--accent)]" />
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Téléphone"
            className="px-4 py-2 text-sm bg-[var(--bg-secondary)] border border-[var(--border-light)] rounded outline-none focus:border-[var(--accent)]" />
        </div>

        <div className="flex justify-end">
          <button onClick={addCandidate}
            className="px-5 py-2 bg-[var(--text-primary)] text-[var(--bg-primary)] text-xs font-semibold rounded hover:opacity-90">
            {t.addCandidate}
          </button>
        </div>

        {isLoading && (
          <div className="text-center py-4 text-[var(--text-muted)]">Chargement des candidats...</div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <span className="block sm:inline">{error}</span>
            <button onClick={() => setError(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3">
              <span className="text-red-500">×</span>
            </button>
          </div>
        )}

        <div className="space-y-3">
          {sortedCandidates.map((c, idx) => (
            <div
              key={c.id}
              onClick={() => {
                if (c.analyzed || isCandidateProcessing(c) || c.status === 'failed') {
                  setCurrentCandidate(c);
                  setIsProcessing(true);
                }
              }}
              className={`flex items-center justify-between p-4 bg-[var(--card-bg)] border border-[var(--border-light)] rounded group transition-all relative ${
                c.analyzed || isCandidateProcessing(c) || c.status === 'failed'
                  ? 'hover:border-[var(--accent)] cursor-pointer shadow-sm'
                  : ''
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${
                  c.analyzed ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)]'
                }`}>
                  {idx + 1}
                </div>

                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[var(--text-primary)]">
                      {c.first_name} {c.last_name}
                    </span>

                    {c.analyzed && (
                      <span className="px-2 py-0.5 bg-[var(--accent-soft)] text-[var(--accent)] text-[10px] font-black rounded-full border border-[var(--accent-soft)]">
                        {parseFloat(c.totalScore || 0).toFixed(1)}
                      </span>
                    )}

                    {c.status && !c.analyzed && (
                      <span className={`px-2 py-0.5 text-[10px] font-black rounded-full ${
                        c.status === 'failed'
                          ? 'bg-red-100 text-red-700'
                          : isCandidateProcessing(c)
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {c.processing?.label || c.status}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 text-[10px] text-[var(--text-muted)] mt-1">
                    {c.cin && <span>CIN: {c.cin}</span>}
                    {c.email && <span>Email: {c.email}</span>}
                    {c.phone && <span>Tél: {c.phone}</span>}
                  </div>

                  {c.analyzed && (
                    <span className="text-[10px] text-[var(--accent)] font-bold uppercase tracking-wider mt-1">
                      {t.details}
                    </span>
                  )}

                  {c.audioFile && (
                    <span className="text-[9px] text-[var(--text-muted)] flex items-center gap-1 mt-0.5">
                      <FileText size={10} /> {c.audioFile}
                    </span>
                  )}

                  {c.notes && !c.analyzed && (
                    <span className="text-[9px] text-[var(--text-muted)] mt-0.5">{c.notes}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                <div
                  onClick={() => fileInputRefs.current[c.id]?.click()}
                  className={`flex items-center gap-2 px-3 py-1.5 border border-dashed rounded text-[10px] font-bold cursor-pointer transition-colors ${
                    c.audioFile
                      ? 'border-[var(--border-medium)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
                      : 'border-[var(--border-medium)] text-[var(--text-muted)] hover:bg-[var(--bg-secondary)]'
                  }`}
                  title={c.audioFile ? 'Changer le fichier audio' : 'Télécharger audio'}
                >
                  <input
                    type="file"
                    ref={(el) => (fileInputRefs.current[c.id] = el)}
                    className="hidden"
                    accept="audio/*"
                    onChange={(e) => handleFileChange(c.id, e)}
                  />
                  {c.audioFile ? <RefreshCw size={12} /> : <Upload size={12} />}
                  {c.audioFile ? (c.analyzed ? 'Réanalyser' : 'Changer') : 'Upload'}
                </div>

                {isCandidateProcessing(c) ? (
                  <div
                    className="flex min-w-[108px] flex-col gap-1 rounded bg-[var(--bg-tertiary)] px-3 py-1.5 text-[10px] font-semibold text-[var(--text-muted)]"
                    title={c.processing?.message || 'Analysis is running'}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2">
                        <Loader2 size={12} className="animate-spin" />
                        {c.processing?.phase === 'uploading' ? 'Upload' : 'Analyse'}
                      </span>
                      <span className="font-black text-[var(--accent)]">
                        {Math.floor(Number(c.processing?.progress) || 0)}%
                      </span>
                    </div>
                    <div className="h-1 w-full overflow-hidden rounded-full bg-[var(--border-light)]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-600 to-sky-400 transition-all duration-500"
                        style={{ width: `${Math.min(96, Math.max(8, Number(c.processing?.progress) || 8))}%` }}
                      />
                    </div>
                  </div>
                ) : !c.analyzed ? (
                  <button
                    onClick={() => triggerAnalysis(c)}
                    disabled={!c.audioFileObj && !c.audioFile}
                    className={`flex items-center gap-2 px-4 py-1.5 bg-gradient-to-br from-blue-600 to-indigo-700 text-white text-[10px] font-semibold rounded shadow-sm hover:shadow-md transition-all ${
                      !c.audioFileObj && !c.audioFile ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <Play size={12} /> {t.analyze}
                  </button>
                ) : null}

                <button
                  onClick={(e) => deleteCandidate(e, c.id)}
                  className="p-2 text-[var(--text-muted)] hover:text-red-500 transition-colors"
                  title={t.deleteCandidate}
                >
                  <Trash2 size={16} />
                </button>

                {c.analyzed && (
                  <div className="flex items-center text-[var(--text-muted)] ml-2">
                    <ChevronRight size={18} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
