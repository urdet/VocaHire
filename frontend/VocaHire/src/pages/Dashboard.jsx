import React, { useState, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';
import Navbar from '../components/Navbar';
import Dashboard from '../components/Dashboard';
import SessionView from '../components/SessionView';
import CreateSessionModal from '../components/CreateSessionModal';
import ProcessingModal from '../components/ProcessingModal';
import { translations } from '../constants/translations';

export default function Main() {
  const { isDarkMode, toggleTheme } = useTheme();
  const [lang, setLang] = useState('en');
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentCandidate, setCurrentCandidate] = useState(null);
  const [modify, setModify] = useState(false);
  const t = translations[lang];
  
  // Set document direction based on language
  useEffect(() => {
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', lang);
  }, [lang]);

  const handleCreateSession = (sessionData) => {
    const newSession = {
      id: Date.now().toString(),
      jobTitle: sessionData.jobTitle,
      date: sessionData.date || new Date().toISOString().split('T')[0],
      candidates: []
    };
    setSessions([newSession, ...sessions]);
    setIsModalOpen(false);
    setActiveSessionId(newSession.id);
  };

  // ... other handlers (addCandidate, deleteCandidate, handleFileChange, triggerAnalysis)

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <Navbar
        lang={lang}
        setLang={setLang}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        t={t}
      />
      <div className="max-w-4xl mx-auto px-6 py-12">
        {activeSessionId ? (
          <SessionView
            activeSession={sessions.find(s => s.id === activeSessionId)}
            setSessions={setSessions}
            sessions={sessions}
            activeSessionId={activeSessionId}
            setActiveSessionId={setActiveSessionId}
            t={t}
            setIsProcessing={setIsProcessing}
            setCurrentCandidate={setCurrentCandidate}
            lang={lang}
          />
        ) : (
          <Dashboard
            sessions={sessions}
            setSessions={setSessions}
            setActiveSessionId={setActiveSessionId}
            setIsModalOpen={setIsModalOpen}
            t={t}
            lang={lang}
          />
        )}
      </div>

      <CreateSessionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        t={t}
        onConfirm={handleCreateSession}
        modify={modify}
        lang={lang}
      />

      <ProcessingModal
        isOpen={isProcessing}
        onClose={() => setIsProcessing(false)}
        t={t}
        candidate={currentCandidate}
        lang={lang}
      />
    </div>
  );
}