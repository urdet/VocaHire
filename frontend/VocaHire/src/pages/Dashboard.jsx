import React, { useEffect, useState } from 'react';
import { useTheme } from '../hooks/useTheme';
import Navbar from '../components/Navbar';
import Dashboard from '../components/Dashboard';
import SessionView from '../components/SessionView';
import CreateSessionModal from '../components/CreateSessionModal';
import ProcessingModal from '../components/ProcessingModal';
import { translations } from '../constants/translations';
import CandidateManagement from './candidateManagement';
import Home from './Home';

export default function Main() {
  const { isDarkMode, toggleTheme } = useTheme();
  const [lang, setLang] = useState('en');
  const [sessions, setSessions] = useState([]);
  const [activePage, setActivePage] = useState('home');
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentCandidate, setCurrentCandidate] = useState(null);
  const [modify] = useState(false);

  const t = translations[lang];

  useEffect(() => {
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', lang);
  }, [lang]);

  const handleCreateSession = (createdSession) => {
    const normalizedSession = {
      id: createdSession.id,
      jobTitle: createdSession.job_title || createdSession.title || 'Untitled Session',
      date: createdSession.scheduled_date || createdSession.created_at,
      created_at: createdSession.created_at,
      session_type: createdSession.session_type,
      qualities: createdSession.qualities,
      candidates: [],
    };

    setSessions((prev) => {
      const exists = prev.some((session) => String(session.id) === String(normalizedSession.id));

      if (exists) {
        return prev.map((session) =>
          String(session.id) === String(normalizedSession.id) ? normalizedSession : session
        );
      }

      return [normalizedSession, ...prev];
    });

    setActiveSessionId(createdSession.id);
    setActivePage('session-management');
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <Navbar
        ActivePage={activePage}
        lang={lang}
        setLang={setLang}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        setActivePage={setActivePage}
        t={t}
      />

      <div>
        {activePage === 'candidate-management' ? (
          <CandidateManagement
            t={t}
            lang={lang}
            setActivePage={setActivePage}
            setActiveSessionId={setActiveSessionId}
          />
        ) : activePage === 'session-management' ? (
          <div className="max-w-4xl mx-auto px-6 py-12">
            {activeSessionId ? (
              <SessionView
                activeSession={sessions.find((s) => String(s.id) === String(activeSessionId))}
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
        ) : (
          <Home
            t={t}
            lang={lang}
            setActivePage={setActivePage}
            setIsModalOpen={setIsModalOpen}
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