import React, { useState, useRef, useMemo } from 'react';
import { ArrowLeft, Users, Calendar, ChevronRight, Trash2, Upload, Play, RefreshCw, FileText } from 'lucide-react';

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
  const [candidateInput, setCandidateInput] = useState('');
  const fileInputRefs = useRef({});

  const sortedCandidates = useMemo(() => {
    if (!activeSession) return [];
    return [...activeSession.candidates].sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));
  }, [activeSession]);

  const addCandidate = () => {
    if (!candidateInput.trim()) return;
    setSessions(prev => prev.map(s => {
      if (s.id === activeSessionId) {
        return {
          ...s,
          candidates: [
            ...s.candidates,
            {
              id: Math.random().toString(36).substr(2, 9),
              name: candidateInput.trim(),
              analyzed: false,
              audioFile: null,
              totalScore: 0
            }
          ]
        };
      }
      return s;
    }));
    setCandidateInput('');
  };

  const deleteCandidate = (e, candidateId) => {
    e.stopPropagation();
    setSessions(prev => prev.map(s => {
      if (s.id === activeSessionId) {
        return { ...s, candidates: s.candidates.filter(c => c.id !== candidateId) };
      }
      return s;
    }));
  };

  const handleFileChange = (candidateId, e) => {
    const file = e.target.files[0];
    if (file) {
      setSessions(prev => prev.map(s => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            candidates: s.candidates.map(c =>
              c.id === candidateId ? { ...c, audioFile: file.name, analyzed: false, totalScore: 0 } : c
            )
          };
        }
        return s;
      }));
    }
  };

  const triggerAnalysis = (candidate) => {
    if (candidate.analyzed) {
      setCurrentCandidate(candidate);
      setIsProcessing(true);
      return;
    }

    setCurrentCandidate(candidate);
    setIsProcessing(true);

    // Simulate analysis completion (replace with real API call)
    setTimeout(() => {
      setSessions(prev => prev.map(s => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            candidates: s.candidates.map(c => {
              if (c.id === candidate.id) {
                const results = {
                  content_relevance: Math.random() * 0.4 + 0.6,
                  vocal_confidence: Math.random() * 0.4 + 0.6,
                  clarity_of_speech: Math.random() * 0.4 + 0.6,
                  fluency: Math.random() * 0.4 + 0.6,
                  short_feedback: "Demonstrated strong professional aptitude during the simulation."
                };
                const avg = (results.content_relevance + results.vocal_confidence + results.clarity_of_speech + results.fluency) / 4;
                return { ...c, analyzed: true, results, totalScore: avg * 10 };
              }
              return c;
            })
          };
        }
        return s;
      }));
    }, 10000);
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

      <header className="mb-12">
        <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)] mb-2">
          {activeSession.jobTitle}
        </h1>
        <div className="flex items-center gap-4 text-xs text-[var(--text-muted)] font-mono">
          <span className="flex items-center gap-1">
            <Calendar size={14} /> {activeSession.date}
          </span>
          <span className="flex items-center gap-1">
            <Users size={14} /> {activeSession.candidates.length} candidates
          </span>
        </div>
      </header>

      <section className="space-y-6">
        <div className="flex gap-2">
          <input
            value={candidateInput}
            onChange={e => setCandidateInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addCandidate()}
            placeholder={t.candidatePlaceholder}
            className="flex-1 px-4 py-2 text-sm bg-[var(--bg-secondary)] border border-[var(--border-light)] rounded outline-none focus:border-[var(--accent)]"
          />
          <button
            onClick={addCandidate}
            className="px-5 py-2 bg-[var(--text-primary)] text-[var(--bg-primary)] text-xs font-semibold rounded hover:opacity-90"
          >
            {t.addCandidate}
          </button>
        </div>

        <div className="space-y-3">
          {sortedCandidates.map((c, idx) => (
            <div
              key={c.id}
              onClick={() => c.analyzed && triggerAnalysis(c)}
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
                    <span className="text-sm font-bold text-[var(--text-primary)]">{c.name}</span>
                    {c.analyzed && (
                      <span className="px-2 py-0.5 bg-[var(--accent-soft)] text-[var(--accent)] text-[10px] font-black rounded-full border border-[var(--accent-soft)]">
                        {c.totalScore.toFixed(1)}
                      </span>
                    )}
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
                  title={c.audioFile ? 'Change audio file' : 'Upload audio'}
                >
                  <input
                    type="file"
                    ref={el => (fileInputRefs.current[c.id] = el)}
                    className="hidden"
                    accept="audio/*,video/*"
                    onChange={(e) => handleFileChange(c.id, e)}
                  />
                  {c.audioFile ? <RefreshCw size={12} /> : <Upload size={12} />}
                  {c.audioFile ? (c.analyzed ? t.reanalyze : 'Change') : t.uploadAudio}
                </div>

                {!c.analyzed && (
                  <button
                    onClick={() => triggerAnalysis(c)}
                    disabled={!c.audioFile}
                    className={`flex items-center gap-2 px-4 py-1.5 bg-gradient-to-br from-blue-600 to-indigo-700 text-white text-[10px] font-semibold rounded shadow-sm hover:shadow-md transition-all ${
                      !c.audioFile ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <Play size={12} /> {t.analyze}
                  </button>
                )}

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