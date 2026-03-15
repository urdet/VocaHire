import {
  Mic,
  Users,
  Clock,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Home({ t, lang }) {
  const [userName, setUserName] = useState('Examiner');

  // Load user name from localStorage
  useEffect(() => {
    try {
      const userData = localStorage.getItem('userData');
      if (userData) {
        const { first_name, last_name } = JSON.parse(userData);
        if (first_name || last_name) {
          setUserName(`${first_name || ''} ${last_name || ''}`.trim());
        }
      }
    } catch (e) {
      console.error('Failed to parse userData', e);
    }
  }, []);

  // Set document direction based on language
  useEffect(() => {
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', lang);
  }, [lang]);

  // Mock statistics – labels use translation keys
  const stats = [
    { label: t.total_sessions, value: '142', icon: <FileText className="w-4 h-4 text-blue-600" /> },
    { label: t.total_candidates, value: '89', icon: <Users className="w-4 h-4 text-blue-600" /> },
    { label: t.files_analysed, value: '312', icon: <CheckCircle2 className="w-4 h-4 text-blue-600" /> },
    { label: t.analysing, value: '8', icon: <Clock className="w-4 h-4 text-blue-600" /> },
  ];

  // Quick actions – translated titles and descriptions
  const shortcuts = [
    {
      title: t.session,
      description: t.record_new,
      icon: <Mic className="w-5 h-5" />,
      color: 'bg-blue-600 text-white',
      hover: 'hover:bg-blue-700',
    },
    {
      title: t.candidate,
      description: t.view_profiles,
      icon: <Users className="w-5 h-5 text-blue-600" />,
      color: 'bg-blue-50 dark:bg-blue-900/20',
      hover: 'hover:bg-blue-100 dark:hover:bg-blue-900/30',
    },
  ];

  return (
    <div className="h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans selection:bg-blue-100 selection:text-blue-900 dark:selection:bg-blue-900 dark:selection:text-blue-100 overflow-hidden">
      <main className="max-w-4xl mx-auto px-6 py-6 flex flex-col">
        {/* Header Section */}
        <header className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)] mb-1">
            {t.good_morning}, <span className="text-blue-600">{userName}</span>
          </h1>
          <p className="text-sm md:text-base text-[var(--text-muted)] max-w-xl leading-relaxed">
            {t.home_description}
          </p>
        </header>

        {/* Shortcuts Section */}
        <section className="mb-8 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-[var(--text-primary)]">{t.quick_actions}</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {shortcuts.map((shortcut, idx) => (
              <button
                key={idx}
                className={`flex flex-row items-center gap-4 p-4 rounded-xl transition-all duration-200 text-left border border-transparent ${shortcut.color} ${shortcut.hover} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)]`}
              >
                <div className="flex-shrink-0">{shortcut.icon}</div>
                <div>
                  <h3 className="font-semibold text-sm leading-none">{shortcut.title}</h3>
                  <p
                    className={`text-[11px] mt-1 ${
                      shortcut.color.includes('text-white')
                        ? 'text-blue-100'
                        : 'text-[var(--text-muted)]'
                    }`}
                  >
                    {shortcut.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Statistics Section */}
        <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-3">{t.overview}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-[var(--border-light)] bg-[var(--bg-secondary)] shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="p-1 rounded-md bg-transparent">
                    {stat.icon}
                  </div>
                  {/* Trend badge removed */}
                </div>
                <div>
                  <h4 className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider mb-0.5">
                    {stat.label}
                  </h4>
                  <span className="text-xl font-bold text-[var(--text-primary)] leading-none">
                    {stat.value}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}