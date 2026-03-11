import React, { useState, useMemo, useEffect } from 'react';
import { Search, Calendar, Briefcase, Hash, Clock, Tag, Loader2 } from 'lucide-react';

export default function SessionManagement({ t = {}, lang = 'en' }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get user_id from localStorage (same as Dashboard)
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const user_id = userData.id;

  useEffect(() => {
    if (!user_id) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }
    fetchSessions();
  }, [user_id]);

  const fetchSessions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:5000/base-v1/job-sessions/?owner_id=${user_id}`, {
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to fetch sessions');
      const data = await response.json();
      // The API returns data that already matches our expected fields:
      // id, session_type, title, job_title, qualities, scheduled_date, created_at, etc.
      setSessions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredSessions = useMemo(() => {
    return sessions.filter(session => 
      session.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.job_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.session_type?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, sessions]);

  const isRtl = lang === 'ar';

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 size={32} className="animate-spin text-[var(--accent)]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-8">
        <p>Error loading sessions: {error}</p>
        <button 
          onClick={fetchSessions}
          className="mt-4 px-4 py-2 bg-[var(--accent)] text-white rounded hover:opacity-90"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div 
      dir={isRtl ? 'rtl' : 'ltr'}
      className="animate-in fade-in slide-in-from-right-4 duration-500 bg-[var(--bg-primary)] min-h-screen p-4 md:p-8"
    >
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)] mb-2">
          {t.sessionManagement || 'Session Management'}
        </h1>
        <div className="flex items-center gap-4 text-xs text-[var(--text-muted)] font-mono">
          <span className="flex items-center gap-1">
            <Briefcase size={14} /> {sessions.length} {t.totalSessions || 'Total Sessions'}
          </span>
        </div>
      </header>

      <section className="space-y-6">
        {/* Search Bar */}
        <div className="flex gap-2 w-full max-w-lg relative">
          <div className={`absolute inset-y-0 ${isRtl ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
            <Search size={16} className="text-[var(--text-muted)]" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t.searchSessions || 'Search sessions by title, role, or type...'}
            className={`w-full ${isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 text-sm bg-[var(--bg-secondary)] border border-[var(--border-light)] rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-[var(--text-primary)] placeholder-[var(--text-muted)] transition-all`}
          />
        </div>

        {/* Sessions Table */}
        <div className="w-full overflow-hidden bg-[var(--card-bg)] border border-[var(--border-light)] rounded-xl shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-light)] text-[var(--text-muted)] text-[10px] uppercase tracking-widest font-bold">
                  <th className="px-6 py-4"><div className="flex items-center gap-1.5"><Hash size={12} /> ID</div></th>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4"><div className="flex items-center gap-1.5"><Briefcase size={12} /> Job Title</div></th>
                  <th className="px-6 py-4"><div className="flex items-center gap-1.5"><Tag size={12} /> Qualities</div></th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4"><div className="flex items-center gap-1.5"><Calendar size={12} /> Scheduled</div></th>
                  <th className="px-6 py-4 text-right"><div className="flex items-center justify-end gap-1.5"><Clock size={12} /> Created</div></th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-[var(--border-light)]">
                {filteredSessions.length > 0 ? (
                  filteredSessions.map((session) => (
                    <tr 
                      key={session.id} 
                      className="group hover:bg-[var(--bg-secondary)] transition-colors"
                    >
                      <td className="px-6 py-4 font-mono text-[9px] text-[var(--text-muted)] uppercase tracking-tighter">
                        {session.id}
                      </td>
                      
                      <td className="px-6 py-4">
                        <span className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                          {session.title}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 text-[var(--text-secondary)]">
                        {session.job_title}
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex gap-1.5 flex-wrap">
                            {session.qualities
                            ? session.qualities.split(',').map((quality, idx) => (
                                <span
                                    key={idx}
                                    className="px-2 py-0.5 bg-[var(--accent-soft)] text-[var(--accent)] text-[10px] font-bold rounded border border-[var(--accent-soft)]"
                                >
                                    {quality.trim()}
                                </span>
                                ))
                            : null}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] rounded text-[10px] font-medium border border-[var(--border-light)]">
                          {session.session_type}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4">
                        <span className="text-[11px] font-mono font-medium text-[var(--text-primary)]">
                          {session.scheduled_date
                            ? new Date(session.scheduled_date).toLocaleDateString(isRtl ? 'ar-EG' : 'en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })
                            : '—'}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 text-right text-[10px] font-mono text-[var(--text-muted)]">
                        {session.created_at
                          ? new Date(session.created_at).toLocaleDateString(isRtl ? 'ar-EG' : 'en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })
                          : '—'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Search size={24} className="text-[var(--text-muted)]" />
                        <p className="text-[var(--text-muted)] text-sm">
                          {t.noSessionsFound || 'No sessions found matching your search.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}