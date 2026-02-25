import { Plus, ChevronRight, FileText, Users, Calendar, MoreVertical, Trash } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Dashboard({ sessions, setSessions, setActiveSessionId, setIsModalOpen, t }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const first_name = localStorage.getItem('userData') 
    ? JSON.parse(localStorage.getItem('userData')).first_name 
    : 'User';
  const last_name = localStorage.getItem('userData') 
    ? JSON.parse(localStorage.getItem('userData')).last_name 
    : '';
  const user_id = localStorage.getItem('userData') 
    ? JSON.parse(localStorage.getItem('userData')).id 
    : null;
  const name = `${first_name} ${last_name}`;

  // Fetch sessions from API
  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    if (!user_id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:5000/base-v1/job-sessions/?owner_id=${user_id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add auth token if needed
          // 'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch sessions');
      }

      const data = await response.json();
      
      // Transform the data to match your component's expected format
      const transformedSessions = data.map(session => ({
        id: session.id,
        jobTitle: session.job_title || session.title || 'Untitled Session',
        candidates: [],
        date: session.scheduled_date || formatDate(session.created_at),
        created_at: session.created_at,
        session_type: session.session_type,
        qualities: session.qualities,
      }));
      
      // Update sessions in parent component
      // You'll need to pass a setSessions prop from parent
      if (typeof setSessions === 'function') {
        setSessions(transformedSessions);
      }
      
    } catch (err) {
      setError(err.message);
      console.error('Error fetching sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId, e) => {
    e.stopPropagation(); // Prevent triggering the parent onClick
    
    if (!confirm('Are you sure you want to delete this session?')) return;
    
    try {
      const response = await fetch(`http://localhost:5000/base-v1/job-sessions/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete session');
      }

      // Refresh the sessions list
      fetchSessions();
      
    } catch (err) {
      console.error('Error deleting session:', err);
      alert('Failed to delete session');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Helper to safely parse qualities
  const getCandidatesCount = (session) => {
    try {
      if (session.qualities) {
        const qualities = typeof session.qualities === 'string' 
          ? JSON.parse(session.qualities) 
          : session.qualities;
        return qualities.length || 0;
      }
      return 0;
    } catch {
      return 0;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-8">
        <p>Error loading sessions: {error}</p>
        <button 
          onClick={fetchSessions}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="animate-in slide-in-from-left-4 duration-500">
          <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)] mb-1">
            {t.welcome} <span className="text-blue-600">{name}</span>
          </h1>
          <p className="text-[var(--text-muted)] text-sm">{t.welcome_description}</p>
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
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">
            {t.history}
          </h2>
        </div>

        <div className="border-t border-[var(--border-light)]">
          {sessions.length === 0 ? (
            <div className="text-center py-12 text-[var(--text-muted)]">
              <p>No sessions yet. Create your first session!</p>
            </div>
          ) : (
            sessions.map(session => (
              <div
                key={session.id}
                onClick={() => setActiveSessionId(session.id)}
                className="group flex items-center justify-between px-4 py-4 border-b border-[var(--border-light)] hover:bg-[var(--accent-soft)]/30 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="p-2 rounded bg-[var(--bg-secondary)] group-hover:bg-[var(--accent-soft)] transition-colors">
                    <FileText size={18} className="text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 w-full">
                    <span className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                      {session.jobTitle}
                    </span>
                    <span className="text-xs text-[var(--text-muted)] flex items-center gap-2">
                      <Users size={12} className="inline opacity-50" /> 
                      {getCandidatesCount(session)} candidates
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="hidden sm:flex items-center gap-4 text-[10px] font-mono text-[var(--text-muted)]">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} /> {session.date}
                    </span>
                  </div>
                  <button 
                    className="p-1 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 hover:text-[var(--accent)] transition-all"
                    onClick={(e) => handleDeleteSession(session.id, e)}
                  >
                    <Trash size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </>
  );
}