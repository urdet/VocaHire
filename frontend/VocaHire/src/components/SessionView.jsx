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

const API_BASE = 'http://localhost:5000/base-v1';

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

  const fetchCandidates = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [candidatesResponse, interviewsResponse] = await Promise.all([
        fetch(`${API_BASE}/candidates/?job_session_id=${activeSessionId}`),
        fetch(`${API_BASE}/interviews/?job_session_id=${activeSessionId}`)
      ]);

      if (!candidatesResponse.ok) {
        throw new Error('Failed to fetch candidates');
      }

      if (!interviewsResponse.ok) {
        throw new Error('Failed to fetch interviews');
      }

      const candidates = await candidatesResponse.json();
      const interviews = await interviewsResponse.json();

      const interviewsByCandidateItemId = {};
      interviews.forEach((interview) => {
        interviewsByCandidateItemId[String(interview.candidate_item_id)] = interview;
      });

      setSessions((prev) =>
        prev.map((s) => {
          if (String(s.id) !== String(activeSessionId)) return s;

          return {
            ...s,
            candidates: candidates.map((c) => {
              const candidateItemId = String(c.id);
              const linkedInterview = interviewsByCandidateItemId[candidateItemId];

              return {
                id: candidateItemId, // candidate_list_item.id
                first_name: c.candidate?.first_name || '',
                last_name: c.candidate?.last_name || '',
                cin: c.candidate?.cin || '',
                email: c.candidate?.email || '',
                phone: c.candidate?.phone || '',
                city: c.candidate?.city || '',
                name:
                  `${c.candidate?.first_name || ''} ${c.candidate?.last_name || ''}`.trim() ||
                  'Unnamed candidate',
                analyzed: c.status === 'analyzed',
                audioFile: null,
                audioFileObj: null,
                results: null,
                status: c.status || 'shortlisted',
                notes: c.notes || '',
                totalScore: c.score || 0,
                interview_id: linkedInterview?.id || null
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

      if (!response.ok) {
        throw new Error(await response.text());
      }

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

      if (!response.ok) {
        throw new Error(await response.text());
      }

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

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return response.json();
  };

  const ensureInterviewExists = async (candidate) => {
    if (candidate.interview_id) {
      return candidate.interview_id;
    }

    const existingResponse = await fetch(
      `${API_BASE}/interviews/?job_session_id=${activeSessionId}&candidate_id=${candidate.id}`
    );

    if (!existingResponse.ok) {
      throw new Error('Failed to check existing interview');
    }

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

    if (!createResponse.ok) {
      throw new Error(await createResponse.text());
    }

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
    if (!candidate.audioFileObj) {
      throw new Error('Please select an audio file first');
    }

    const formData = new FormData();
    formData.append('file', candidate.audioFileObj);

    const response = await fetch(`${API_BASE}/audio/interview/${interviewId}/upload`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return response.json();
  };

  const pollInterviewResult = async (candidate, interviewId) => {
    const maxAttempts = 60;

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const response = await fetch(`${API_BASE}/analysis/interview/${interviewId}`);

      if (!response.ok) {
        continue;
      }

      const data = await response.json();

      if (data.status === 'completed') {
        await updateCandidateAnalysis(candidate.id, data);

        const updatedCandidate = {
          ...candidate,
          analyzed: true,
          status: 'analyzed',
          totalScore: data.final_score,
          results: {
            content_relevance: data.content_relevance,
            vocal_confidence: data.vocal_confidence,
            clarity_of_speech: data.clarity_of_speech,
            fluency: data.fluency,
            final_score: data.final_score,
            short_feedback: data.feedback
          },
          interview_id: interviewId
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

      if (data.status === 'failed') {
        throw new Error(data.message || 'Analysis failed');
      }
    }

    throw new Error('Analysis timeout');
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
                ? { ...c, status: 'pending' }
                : c
            )
          };
        })
      );

      const interviewId = await ensureInterviewExists(candidate);

      const candidateForModal = {
        ...candidate,
        interview_id: interviewId,
        status: 'pending'
      };

      setCurrentCandidate(candidateForModal);
      setIsProcessing(true);

      await uploadAudioForCandidate(candidate, interviewId);
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
                ? { ...c, status: 'failed' }
                : c
            )
          };
        })
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
          <input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Prénom *"
            className="px-4 py-2 text-sm bg-[var(--bg-secondary)] border border-[var(--border-light)] rounded outline-none focus:border-[var(--accent)]"
          />
          <input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Nom *"
            className="px-4 py-2 text-sm bg-[var(--bg-secondary)] border border-[var(--border-light)] rounded outline-none focus:border-[var(--accent)]"
          />
          <input
            value={cin}
            onChange={(e) => setCin(e.target.value)}
            placeholder="CIN"
            className="px-4 py-2 text-sm bg-[var(--bg-secondary)] border border-[var(--border-light)] rounded outline-none focus:border-[var(--accent)]"
          />
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Ville"
            className="px-4 py-2 text-sm bg-[var(--bg-secondary)] border border-[var(--border-light)] rounded outline-none focus:border-[var(--accent)]"
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
            className="px-4 py-2 text-sm bg-[var(--bg-secondary)] border border-[var(--border-light)] rounded outline-none focus:border-[var(--accent)]"
          />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Téléphone"
            className="px-4 py-2 text-sm bg-[var(--bg-secondary)] border border-[var(--border-light)] rounded outline-none focus:border-[var(--accent)]"
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={addCandidate}
            className="px-5 py-2 bg-[var(--text-primary)] text-[var(--bg-primary)] text-xs font-semibold rounded hover:opacity-90"
          >
            {t.addCandidate}
          </button>
        </div>

        {isLoading && (
          <div className="text-center py-4 text-[var(--text-muted)]">
            Chargement des candidats...
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <span className="block sm:inline">{error}</span>
            <button
              onClick={() => setError(null)}
              className="absolute top-0 bottom-0 right-0 px-4 py-3"
            >
              <span className="text-red-500">×</span>
            </button>
          </div>
        )}

        <div className="space-y-3">
          {sortedCandidates.map((c, idx) => (
            <div
              key={c.id}
              onClick={() => {
                if (c.analyzed) {
                  setCurrentCandidate(c);
                  setIsProcessing(true);
                }
              }}
              className={`flex items-center justify-between p-4 bg-[var(--card-bg)] border border-[var(--border-light)] rounded group transition-all relative ${
                c.analyzed ? 'hover:border-[var(--accent)] cursor-pointer shadow-sm' : ''
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${
                    c.analyzed
                      ? 'bg-[var(--accent)] text-white'
                      : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)]'
                  }`}
                >
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
                      <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] font-black rounded-full">
                        {c.status}
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
                    <span className="text-[9px] text-[var(--text-muted)] mt-0.5">
                      {c.notes}
                    </span>
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

                {c.status === 'pending' || c.status === 'processing' || c.status === 'uploaded' ? (
                  <div className="flex items-center justify-center w-8 h-8">
                    <Loader2 size={12} className="animate-spin" />
                  </div>
                ) : !c.analyzed ? (
                  <button
                    onClick={() => triggerAnalysis(c)}
                    disabled={!c.audioFileObj}
                    className={`flex items-center gap-2 px-4 py-1.5 bg-gradient-to-br from-blue-600 to-indigo-700 text-white text-[10px] font-semibold rounded shadow-sm hover:shadow-md transition-all ${
                      !c.audioFileObj ? 'opacity-50 cursor-not-allowed' : ''
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