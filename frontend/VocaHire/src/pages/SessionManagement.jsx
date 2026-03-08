import React, { useState, useMemo } from 'react';
import { Search, Calendar, Briefcase, Hash, Clock, Tag } from 'lucide-react';

export default function SessionManagement({ t = {}, lang = 'en' }) {
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data strictly following the job_session table schema from the class diagram
  const [sessions] = useState([
    {
      id: 'js_8f72a1',
      session_type: 'Technical',
      owner_user_id: 'usr_101',
      title: 'Q1 Frontend Engineering Intake',
      job_title: 'Senior React Developer',
      qualities: ['React', 'System Design', 'Leadership'],
      scheduled_date: '2026-03-15',
      created_at: '2026-03-01',
      updated_at: '2026-03-02'
    },
    {
      id: 'js_3b90c4',
      session_type: 'Screening',
      owner_user_id: 'usr_102',
      title: 'Marketing Manager Pre-screen',
      job_title: 'Marketing Manager',
      qualities: ['Communication', 'SEO', 'Strategy'],
      scheduled_date: '2026-03-18',
      created_at: '2026-03-05',
      updated_at: '2026-03-05'
    },
    {
      id: 'js_5e21d8',
      session_type: 'Behavioral',
      owner_user_id: 'usr_101',
      title: 'DevOps Culture Fit',
      job_title: 'DevOps Engineer',
      qualities: ['CI/CD', 'Problem Solving', 'Teamwork'],
      scheduled_date: '2026-03-20',
      created_at: '2026-03-06',
      updated_at: '2026-03-07'
    }
  ]);

  const filteredSessions = useMemo(() => {
    return sessions.filter(session => 
      session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.job_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.session_type.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, sessions]);

  const isRtl = lang === 'ar';

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500 bg-white dark:bg-slate-950 min-h-screen p-4 md:p-8">
      
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 mb-2">
          {t.sessionManagement || 'Session Management'}
        </h1>
        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 font-mono">
          <span className="flex items-center gap-1">
            <Briefcase size={14} /> {sessions.length} {t.totalSessions || 'Total Sessions'}
          </span>
        </div>
      </header>

      <section className="space-y-6">
        {/* Search Bar using pure Tailwind classes */}
        <div className="flex gap-2 w-full max-w-lg relative">
          <div className={`absolute inset-y-0 ${isRtl ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
            <Search size={16} className="text-slate-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t.searchSessions || 'Search sessions by title, role, or type...'}
            className={`w-full ${isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-slate-100 transition-all placeholder:text-slate-400`}
          />
        </div>

        {/* Sessions Table */}
        <div className="w-full overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-widest font-bold">
                  <th className="px-6 py-4"><div className="flex items-center gap-1.5"><Hash size={12} /> ID</div></th>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4"><div className="flex items-center gap-1.5"><Briefcase size={12} /> Job Title</div></th>
                  <th className="px-6 py-4"><div className="flex items-center gap-1.5"><Tag size={12} /> Qualities</div></th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4"><div className="flex items-center gap-1.5"><Calendar size={12} /> Scheduled</div></th>
                  <th className="px-6 py-4 text-right"><div className="flex items-center justify-end gap-1.5"><Clock size={12} /> Created</div></th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-800">
                {filteredSessions.length > 0 ? (
                  filteredSessions.map((session) => (
                    <tr 
                      key={session.id} 
                      className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="px-6 py-4 font-mono text-[9px] text-slate-400 uppercase tracking-tighter">
                        {session.id}
                      </td>
                      
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {session.title}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                        {session.job_title}
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex gap-1.5 flex-wrap">
                          {session.qualities.map((quality, idx) => (
                            <span 
                              key={idx} 
                              className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold rounded border border-blue-100 dark:border-blue-800"
                            >
                              {quality}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-[10px] font-medium border border-slate-200 dark:border-slate-700">
                          {session.session_type}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4">
                        <span className="text-[11px] font-mono font-medium text-slate-900 dark:text-slate-200">
                          {new Date(session.scheduled_date).toLocaleDateString(isRtl ? 'ar-EG' : 'en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 text-right text-[10px] font-mono text-slate-400">
                        {session.created_at}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Search size={24} className="text-slate-300" />
                        <p className="text-slate-500 dark:text-slate-400 text-sm">
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