import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Plus,
  Bell,
  Moon,
  Sun,
  Languages,
  MoreVertical,
  Calendar,
  Clock,
  ChevronRight,
  FileText,
  X,
  Loader2,
  CheckCircle2,
  Users,
  ArrowLeft,
  Mic,
  Trash2,
  Play,
  Upload,
  Trophy,
  ChevronDown,
  Info,
  RefreshCw,
  Edit3,
} from "lucide-react";
import { translations, initialSessions } from "../constants";
import CreateSessionModal from "../components/CreateSessionModal";
import ProcessingModal from "../components/ProcessingModal";

export default function Dashboard() {
  const [lang, setLang] = useState("en");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [sessions, setSessions] = useState(initialSessions);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentCandidate, setCurrentCandidate] = useState(null);
  const [candidateInput, setCandidateInput] = useState("");

  const fileInputRefs = useRef({});
  const t = translations[lang];

  // Dark mode toggle effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const activeSession = useMemo(
    () => sessions.find((s) => s.id === activeSessionId),
    [sessions, activeSessionId]
  );

  const sortedCandidates = useMemo(() => {
    if (!activeSession) return [];
    return [...activeSession.candidates].sort(
      (a, b) => (b.totalScore || 0) - (a.totalScore || 0)
    );
  }, [activeSession]);

  const handleCreateSession = (sessionData) => {
    const newSession = {
      id: Date.now().toString(),
      jobTitle: sessionData.jobTitle,
      date: sessionData.date || new Date().toISOString().split("T")[0],
      candidates: [],
    };
    setSessions([newSession, ...sessions]);
    setIsModalOpen(false);
    setActiveSessionId(newSession.id);
  };

  const addCandidate = () => {
    if (!candidateInput.trim()) return;
    setSessions((prev) =>
      prev.map((s) => {
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
                totalScore: 0,
              },
            ],
          };
        }
        return s;
      })
    );
    setCandidateInput("");
  };

  const deleteCandidate = (e, candidateId) => {
    e.stopPropagation();
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            candidates: s.candidates.filter((c) => c.id !== candidateId),
          };
        }
        return s;
      })
    );
  };

  const handleFileChange = (candidateId, e) => {
    const file = e.target.files[0];
    if (file) {
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === activeSessionId) {
            return {
              ...s,
              candidates: s.candidates.map((c) =>
                c.id === candidateId
                  ? { ...c, audioFile: file.name, analyzed: false, totalScore: 0 }
                  : c
              ),
            };
          }
          return s;
        })
      );
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

    // Simulate analysis finish
    setTimeout(() => {
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === activeSessionId) {
            return {
              ...s,
              candidates: s.candidates.map((c) => {
                if (c.id === candidate.id) {
                  const results = {
                    content_relevance: Math.random() * 0.4 + 0.6,
                    vocal_confidence: Math.random() * 0.4 + 0.6,
                    clarity_of_speech: Math.random() * 0.4 + 0.6,
                    fluency: Math.random() * 0.4 + 0.6,
                    short_feedback:
                      "Demonstrated strong professional aptitude during the simulation.",
                  };
                  const avg =
                    (results.content_relevance +
                      results.vocal_confidence +
                      results.clarity_of_speech +
                      results.fluency) /
                    4;
                  const finalCandidate = {
                    ...c,
                    analyzed: true,
                    results,
                    totalScore: avg * 10,
                  };
                  setCurrentCandidate(finalCandidate);
                  return finalCandidate;
                }
                return c;
              }),
            };
          }
          return s;
        })
      );
    }, 10000);
  };

  return (
    <div className={`min-h-screen font-sans ${isDarkMode ? "dark bg-[#0f172a]" : "bg-white"}`}>
      {/* Navigation */}
      <nav className="flex items-center justify-between px-4 py-2 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-inherit z-10 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div
            onClick={() => setActiveSessionId(null)}
            className="flex items-center gap-2 text-sm font-bold cursor-pointer"
          >
            <div className="w-5 h-5 rounded bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-[10px] text-white font-black">
              VH
            </div>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
              {t.brand}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() =>
              setLang((l) => (l === "en" ? "fr" : l === "fr" ? "ar" : "en"))
            }
            className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-1"
          >
            <Languages size={18} />
            <span className="text-[10px] font-bold uppercase">{lang}</span>
          </button>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors">
            <Bell size={18} />
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {activeSessionId ? (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <button
              onClick={() => setActiveSessionId(null)}
              className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-blue-600 mb-8 transition-colors"
            >
              <ArrowLeft size={14} /> {t.back}
            </button>

            <header className="mb-12">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 mb-2">
                {activeSession.jobTitle}
              </h1>
              <div className="flex items-center gap-4 text-xs text-slate-500 font-mono">
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
                  onChange={(e) => setCandidateInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addCandidate()}
                  placeholder={t.candidatePlaceholder}
                  className="flex-1 px-4 py-2 text-sm bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded outline-none focus:border-blue-400"
                />
                <button
                  onClick={addCandidate}
                  className="px-5 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold rounded hover:opacity-90"
                >
                  {t.addCandidate}
                </button>
              </div>

              <div className="space-y-3">
                {sortedCandidates.map((c, idx) => (
                  <div
                    key={c.id}
                    onClick={() => c.analyzed && triggerAnalysis(c)}
                    className={`flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded group transition-all relative ${
                      c.analyzed
                        ? "hover:border-blue-400 cursor-pointer shadow-sm"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${
                          c.analyzed
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                            {c.name}
                          </span>
                          {c.analyzed && (
                            <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 text-[10px] font-black rounded-full border border-blue-200 dark:border-blue-800">
                              {c.totalScore.toFixed(1)}
                            </span>
                          )}
                        </div>
                        {c.analyzed && (
                          <span className="text-[10px] text-blue-500 font-bold uppercase tracking-wider mt-1">
                            {t.details}
                          </span>
                        )}
                        {c.audioFile && (
                          <span className="text-[9px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <FileText size={10} /> {c.audioFile}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                      <div
                        onClick={() => fileInputRefs.current[c.id].click()}
                        className={`flex items-center gap-2 px-3 py-1.5 border border-dashed rounded text-[10px] font-bold cursor-pointer transition-colors ${
                          c.audioFile
                            ? "border-slate-300 dark:border-slate-700 text-slate-500 hover:bg-slate-50"
                            : "border-slate-300 dark:border-slate-700 text-slate-400 hover:bg-slate-50"
                        }`}
                        title={c.audioFile ? "Change audio file" : "Upload audio"}
                      >
                        <input
                          type="file"
                          ref={(el) => (fileInputRefs.current[c.id] = el)}
                          className="hidden"
                          accept="audio/*,video/*"
                          onChange={(e) => handleFileChange(c.id, e)}
                        />
                        {c.audioFile ? <RefreshCw size={12} /> : <Upload size={12} />}
                        {c.audioFile ? (c.analyzed ? t.reanalyze : "Change") : t.uploadAudio}
                      </div>

                      {!c.analyzed && (
                        <button
                          onClick={() => triggerAnalysis(c)}
                          disabled={!c.audioFile}
                          className={`flex items-center gap-2 px-4 py-1.5 bg-gradient-to-br from-blue-600 to-indigo-700 text-white text-[10px] font-semibold rounded shadow-sm hover:shadow-md transition-all ${
                            !c.audioFile ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                        >
                          <Play size={12} /> {t.analyze}
                        </button>
                      )}

                      <button
                        onClick={(e) => deleteCandidate(e, c.id)}
                        className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                        title={t.deleteCandidate}
                      >
                        <Trash2 size={16} />
                      </button>

                      {c.analyzed && (
                        <div className="flex items-center text-slate-300 ml-2">
                          <ChevronRight size={18} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        ) : (
          <>
            <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="animate-in slide-in-from-left-4 duration-500">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 mb-1">
                  {t.welcome} <span className="text-blue-600 dark:text-blue-400">{t.name}</span>
                </h1>
                <p className="text-slate-500 text-sm">
                  Review your pipeline or launch a new evaluation.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-6 py-2.5 rounded bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white text-xs font-semibold shadow-lg shadow-blue-500/20 transition-all active:scale-95"
              >
                <Plus size={16} />
                {t.createSession}
              </button>
            </header>

            <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
              <div className="flex items-center gap-2 mb-4">
                <ChevronRight size={16} className="text-blue-300" />
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  {t.history}
                </h2>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => setActiveSessionId(session.id)}
                    className="group flex items-center justify-between py-4 border-b border-slate-100 dark:border-slate-800 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="p-2 rounded bg-slate-50 dark:bg-slate-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-colors">
                        <FileText
                          size={18}
                          className="text-slate-400 group-hover:text-blue-600 transition-colors"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 w-full">
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                          {session.jobTitle}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-2">
                          <Users size={12} className="inline opacity-50" />{" "}
                          {session.candidates.length} candidates
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="hidden sm:flex items-center gap-4 text-[10px] font-mono text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} /> {session.date}
                        </span>
                      </div>
                      <button className="p-1 text-slate-300 opacity-0 group-hover:opacity-100 hover:text-blue-600 transition-all">
                        <MoreVertical size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>

      <CreateSessionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        t={t}
        onConfirm={handleCreateSession}
      />

      <ProcessingModal
        isOpen={isProcessing}
        onClose={() => setIsProcessing(false)}
        t={t}
        candidate={currentCandidate}
      />
    </div>
  );
}