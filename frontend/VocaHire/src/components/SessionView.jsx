/** PATH: frontend/VocaHire/src/components/SessionView.jsx */
import { useState, useRef, useMemo, useEffect } from 'react';
import { ArrowLeft, Users, Calendar, ChevronRight, Trash2, Upload, Play, RefreshCw, FileText, Loader, Loader2 } from 'lucide-react';

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
  // Champs du formulaire pour un nouveau candidat
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

  // Fetch candidates when session changes
  useEffect(() => {
    if (activeSessionId) {
      fetchCandidates();
    }
  }, [activeSessionId]);

  const fetchCandidates = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:5000/base-v1/candidates/?job_session_id=${activeSessionId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch candidates: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const candidates = await response.json();
      const response_results = await fetch(`http://localhost:5000/base-v1/candidates/?job_session_id=${activeSessionId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch candidates: ${response.status} ${response.statusText} - ${errorText}`);
      }
      const results = await response_results.json();
      
      // Mise à jour de la session avec les candidats récupérés
      setSessions(prev => prev.map(s => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            candidates: candidates.map(c => ({
              id: c.id.toString(),
              first_name: c.candidate.first_name || '',      // Nouveaux champs
              last_name: c.candidate.last_name || '',
              cin: c.candidate.cin || '',
              email: c.candidate.email || '',
              phone: c.candidate.phone || '',
              city: c.candidate.city || '',
              name: `${c.candidate.first_name || ''} ${c.candidate.last_name || ''}`.trim() || c.candidate_name,
              analyzed: c.score !== null,
              audioFile: null,
              results: results,
              status: c.status,
              
            }))
          };
        }
        return s;
      }));
    } catch (error) {
      console.error('Error fetching candidates:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const sortedCandidates = useMemo(() => {
    if (!activeSession) return [];
    return [...activeSession.candidates].sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));
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
      city: city.trim(), // optionnel
      infos: "" // optionnel
    },
    job_session_id: parseInt(activeSessionId),
    list_order: (activeSession.candidates?.length || 0) + 1,
    notes: "",
    score: null,
    status: "shortlisted"
  };

  try {
    const response = await fetch("http://localhost:5000/base-v1/candidates/with-candidate/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      mode: 'cors',
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create candidate: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    setSessions(prev => prev.map(s => {
      if (s.id === activeSessionId) {
        const newCandidate = {
          id: result.candidate.id.toString(),
          first_name: result.candidate.first_name,
          last_name: result.candidate.last_name,
          cin: result.candidate.cin,
          email: result.candidate.email,
          phone: result.candidate.phone,
          name: `${result.candidate.first_name} ${result.candidate.last_name}`.trim(),
          analyzed: false,
          audioFile: null,
          totalScore: 0,
          results: null,
          status: result.status,
          notes: result.notes,
          list_order: result.list_order,
          candidate: result.candidate
        };
        return {
          ...s,
          candidates: [...s.candidates, newCandidate]
        };
      }
      return s;
    }));

    // Clear form fields
    setFirstName('');
    setLastName('');
    setCin('');
    setEmail('');
    setPhone('');
    setCity('');
    // result contient l'élément de liste avec l'objet candidate imbriqué
    // Mettre à jour l'état local avec les données reçues
    // ...
  } catch (error) {
    console.error("Error adding candidate:", error);
    setError(error.message);
  }
};

  const deleteCandidate = async (e, candidateId) => {
    e.stopPropagation();
    
    try {
      const response = await fetch(`http://localhost:5000/base-v1/candidates/${candidateId}`, {
        method: "DELETE",
        mode: 'cors',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete candidate: ${response.status} - ${errorText}`);
      }

      setSessions(prev => prev.map(s => {
        if (s.id === activeSessionId) {
          return { ...s, candidates: s.candidates.filter(c => c.id !== candidateId) };
        }
        return s;
      }));
    } catch (error) {
      console.error("Error deleting candidate:", error);
      setError(error.message);
    }
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

  const updateCandidateAnalysis = async (candidateId, analysisResults) => {
    try {
      const response = await fetch(`http://localhost:5000/base-v1/candidates/${candidateId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        mode: 'cors',
        body: JSON.stringify({
          score: analysisResults.totalScore,
          notes: analysisResults.short_feedback,
          status: "analyzed"
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update candidate: ${response.status} - ${errorText}`);
      }

      const updatedCandidate = await response.json();
      return updatedCandidate;
    } catch (error) {
      console.error("Error updating candidate:", error);
      throw error;
    }
  };

  // Fonction d'analyse asynchrone pour un candidat (retourne une promesse)
  const performAnalysis = async (candidate) => {
    return new Promise((resolve, reject) => {
      // Simulation de l'analyse (remplacer par un vrai appel API)
      setTimeout(async () => {
        const results = {
          content_relevance: Math.random() * 0.4 + 0.6,
          vocal_confidence: Math.random() * 0.4 + 0.6,
          clarity_of_speech: Math.random() * 0.4 + 0.6,
          fluency: Math.random() * 0.4 + 0.6,
          short_feedback: "Demonstrated strong professional aptitude during the simulation."
        };
        const avg = (results.content_relevance + results.vocal_confidence + results.clarity_of_speech + results.fluency) / 4;
        const totalScore = Math.round(avg * 10 * 10) / 10;

        try {
          

          // Mise à jour locale
          setSessions(prev => prev.map(s => {
            if (s.id === activeSessionId) {
              return {
                ...s,
                candidates: s.candidates.map(c =>
                  c.id === candidate.id
                    ? { ...c, analyzed: true, results, totalScore, status: 'analyzed' }
                    : c
                )
              };
            }
            return s;
          }));

          resolve({ candidate, results, totalScore });
        } catch (error) {
          reject(error);
        }
      }, 5000); // 5 secondes pour la simulation
    });
  };

  const triggerAnalysis = (candidate) => {
    if (candidate.analyzed) {
      setCurrentCandidate(candidate);
      
      return;
    }
    setSessions(prev => prev.map(s => {
      if (s.id === activeSessionId) {
        return {
          ...s,
          candidates: s.candidates.map(c =>
            c.id === candidate.id ? { ...c, status: 'pending' } : c
          )
        };
      }
      return s;
    }));

    setCurrentCandidate(candidate);
    
    performAnalysis(candidate).catch(error => {
      console.error("Error in analysis:", error);
      setError("Failed to save analysis results");
      
    });
  };

  // Analyse de tous les candidats (ceux qui ont un fichier audio)
  const analyzeAll = async () => {
    if (!activeSession) return;
    
    const candidatesToAnalyze = activeSession.candidates.filter(c => c.audioFile);
    if (candidatesToAnalyze.length === 0) {
      setError("No candidates with audio files to analyze.");
      return;
    }

    setIsAnalyzingAll(true);
    setError(null);

    for (const candidate of candidatesToAnalyze) {
      try {
        triggerAnalysis(candidate);
      } catch (error) {
        console.error(`Analysis failed for ${candidate.name}:`, error);
        setError(`Analysis failed for ${candidate.name}. Stopping.`);
        break;
      }
    }

    setIsAnalyzingAll(false);
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
        {/* Bouton Analyser tout */}
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
        {/* Formulaire d'ajout de candidat avec plusieurs champs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
          <input
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            placeholder="Prénom *"
            className="px-4 py-2 text-sm bg-[var(--bg-secondary)] border border-[var(--border-light)] rounded outline-none focus:border-[var(--accent)]"
          />
          <input
            value={lastName}
            onChange={e => setLastName(e.target.value)}
            placeholder="Nom *"
            className="px-4 py-2 text-sm bg-[var(--bg-secondary)] border border-[var(--border-light)] rounded outline-none focus:border-[var(--accent)]"
          />
          <input
            value={cin}
            onChange={e => setCin(e.target.value)}
            placeholder="CIN"
            className="px-4 py-2 text-sm bg-[var(--bg-secondary)] border border-[var(--border-light)] rounded outline-none focus:border-[var(--accent)]"
          />
          <input
            value={city}
            onChange={e => setCity(e.target.value)}
            placeholder="Ville"
            className="px-4 py-2 text-sm bg-[var(--bg-secondary)] border border-[var(--border-light)] rounded outline-none focus:border-[var(--accent)]"
          />
          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
            className="px-4 py-2 text-sm bg-[var(--bg-secondary)] border border-[var(--border-light)] rounded outline-none focus:border-[var(--accent)]"
          />
          <input
            value={phone}
            onChange={e => setPhone(e.target.value)}
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
                    {/* Affichage du nom complet */}
                    <span className="text-sm font-bold text-[var(--text-primary)]">
                      {c.first_name} {c.last_name}
                    </span>
                    {c.analyzed && (
                      <span className="px-2 py-0.5 bg-[var(--accent-soft)] text-[var(--accent)] text-[10px] font-black rounded-full border border-[var(--accent-soft)]">
                        {parseFloat(c.totalScore).toFixed(1)}
                      </span>
                    )}
                    {c.status && !c.analyzed && (
                      <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] font-black rounded-full">
                        {c.status}
                      </span>
                    )}
                  </div>
                  {/* Affichage des informations supplémentaires */}
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
                    ref={el => (fileInputRefs.current[c.id] = el)}
                    className="hidden"
                    accept="audio/*,video/*"
                    onChange={(e) => handleFileChange(c.id, e)}
                  />
                  {c.audioFile ? <RefreshCw size={12} /> : <Upload size={12} />}
                  {c.audioFile ? (c.analyzed ? 'Réanalyser' : 'Changer') : 'Upload'}
                </div>

                {
  c.status === 'pending' ? (
    <div className="flex items-center justify-center w-8 h-8">
      <Loader2 size={12} className="animate-spin" />
    </div>
  ) : !c.analyzed && (
    <button
      onClick={() => triggerAnalysis(c)}
      disabled={!c.audioFile}
      className={`flex items-center gap-2 px-4 py-1.5 bg-gradient-to-br from-blue-600 to-indigo-700 text-white text-[10px] font-semibold rounded shadow-sm hover:shadow-md transition-all ${
        !c.audioFile ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      <Play size={12} /> {t.analyze}
    </button>
  )
}

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