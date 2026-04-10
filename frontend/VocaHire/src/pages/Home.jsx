import {
  Mic,
  Users,
  Clock,
  CheckCircle2,
  FileText,
  RefreshCw,
  Calendar,
  ChevronRight,
  BarChart3,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const API_BASE = 'http://localhost:5000/base-v1';

function formatDate(dateString, lang = 'en') {
  if (!dateString) return '-';

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '-';

  const locale =
    lang === 'fr' ? 'fr-FR' : lang === 'ar' ? 'ar-MA' : 'en-US';

  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getUserData() {
  try {
    const raw = localStorage.getItem('userData');
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error('Failed to parse userData:', error);
    return null;
  }
}

export default function Home({ t, lang, setActivePage, setIsModalOpen }) {
  const [userName, setUserName] = useState('Examiner');
  const [ownerId, setOwnerId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const [homeData, setHomeData] = useState({
    sessions: [],
    recentSessions: [],
    topCandidates: [],
    totalSessions: 0,
    totalCandidates: 0,
    analyzedCount: 0,
    processingCount: 0,
  });

  useEffect(() => {
    const userData = getUserData();

    if (userData) {
      const fullName =
        `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || 'Examiner';
      setUserName(fullName);
      setOwnerId(userData.id || null);
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', lang);
  }, [lang]);

  const labels = useMemo(
    () => ({
      recentSessions: t.history || 'Recent Sessions',
      topCandidates: t.top_candidates || 'Top Candidates',
      noSessions: t.no_sessions || 'No sessions found.',
      noCandidates: t.no_candidates || 'No analyzed candidates yet.',
      retry: t.retry || 'Retry',
      refresh: t.refresh || 'Refresh',
      loading: t.loading || 'Loading...',
      openSessions: t.open_sessions || 'Open sessions',
      createSessionNow: t.createSession || 'Create Session',
      candidateManagement: t.GestionDesCandidats || 'Candidate Management',
      sessionManagement: t.GestionDesSessions || 'Session Management',
      avgPerSession: t.avg_per_session || 'Avg candidates / session',
      scoreLabel: t.score || 'Score',
      analyzed: t.files_analysed || 'Files Analysed',
      processing: t.analysing || 'Analysing',
      totalSessions: t.total_sessions || 'Total Sessions',
      totalCandidates: t.total_candidates || 'Total Candidates',
      quickActions: t.quick_actions || 'Quick Actions',
      overview: t.overview || 'Overview',
      goodMorning: t.good_morning || 'Good morning',
      homeDescription:
        t.home_description ||
        "Ready to analyze today's interviews? Your vocal AI engine is primed and waiting.",
      viewProfiles: t.view_profiles || 'View profiles',
      recordNew: t.record_new || 'Record new',
      details: t.details || 'View Details',
    }),
    [t]
  );

  const fetchHomeData = async ({ silent = false } = {}) => {
    if (!ownerId) {
      setLoading(false);
      return;
    }

    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError('');

    try {
      const sessionsResponse = await fetch(
        `${API_BASE}/job-sessions/?owner_id=${ownerId}`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
        }
      );

      if (!sessionsResponse.ok) {
        throw new Error('Failed to fetch job sessions');
      }

      const sessions = await sessionsResponse.json();

      const sessionBundles = await Promise.all(
        sessions.map(async (session) => {
          const [candidatesResponse, interviewsResponse] = await Promise.all([
            fetch(`${API_BASE}/candidates/?job_session_id=${session.id}`, {
              method: 'GET',
              headers: { Accept: 'application/json' },
            }),
            fetch(`${API_BASE}/interviews/?job_session_id=${session.id}`, {
              method: 'GET',
              headers: { Accept: 'application/json' },
            }),
          ]);

          const candidates = candidatesResponse.ok
            ? await candidatesResponse.json()
            : [];

          const interviews = interviewsResponse.ok
            ? await interviewsResponse.json()
            : [];

          return { session, candidates, interviews };
        })
      );

      let totalCandidates = 0;
      let analyzedCount = 0;
      let processingCount = 0;

      const topCandidates = [];

      for (const bundle of sessionBundles) {
        const interviewsByCandidateItemId = new Map();

        for (const interview of bundle.interviews) {
          interviewsByCandidateItemId.set(
            String(interview.candidate_item_id),
            interview
          );
        }

        for (const item of bundle.candidates) {
          totalCandidates += 1;

          const interview = interviewsByCandidateItemId.get(String(item.id));
          const candidateName =
            `${item.candidate?.first_name || ''} ${item.candidate?.last_name || ''}`.trim() ||
            'Unnamed candidate';

          const scoreValue =
            item.score !== null && item.score !== undefined
              ? Number(item.score)
              : null;

          const interviewStatus = interview?.status || '';
          const itemStatus = item.status || '';

          const isAnalyzed =
            itemStatus === 'analyzed' ||
            interviewStatus === 'completed' ||
            scoreValue !== null;

          const isProcessing =
            interviewStatus === 'uploaded' ||
            interviewStatus === 'processing' ||
            itemStatus === 'pending';

          if (isAnalyzed) analyzedCount += 1;
          if (isProcessing) processingCount += 1;

          if (scoreValue !== null && !Number.isNaN(scoreValue)) {
            topCandidates.push({
              id: item.id,
              name: candidateName,
              score: scoreValue,
              status: itemStatus,
              sessionTitle:
                bundle.session.job_title ||
                bundle.session.title ||
                'Untitled Session',
            });
          }
        }
      }

      const recentSessions = [...sessionBundles]
        .sort((a, b) => {
          const dateA = new Date(
            a.session.scheduled_date || a.session.created_at || 0
          ).getTime();
          const dateB = new Date(
            b.session.scheduled_date || b.session.created_at || 0
          ).getTime();
          return dateB - dateA;
        })
        .slice(0, 5)
        .map((bundle) => ({
          id: bundle.session.id,
          jobTitle:
            bundle.session.job_title ||
            bundle.session.title ||
            'Untitled Session',
          date: bundle.session.scheduled_date || bundle.session.created_at,
          candidateCount: bundle.candidates.length,
          analyzedCount: bundle.candidates.filter(
            (c) => c.status === 'analyzed' || c.score !== null
          ).length,
          session_type: bundle.session.session_type || 'standard',
        }));

      const sortedTopCandidates = [...topCandidates]
        .sort((a, b) => Number(b.score || 0) - Number(a.score || 0))
        .slice(0, 5);

      setHomeData({
        sessions,
        recentSessions,
        topCandidates: sortedTopCandidates,
        totalSessions: sessions.length,
        totalCandidates,
        analyzedCount,
        processingCount,
      });
    } catch (err) {
      console.error('Error fetching home data:', err);
      setError(err.message || 'Failed to load home data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHomeData();
  }, [ownerId]);

  const stats = [
    {
      label: labels.totalSessions,
      value: homeData.totalSessions,
      icon: <FileText className="w-4 h-4 text-blue-600" />,
    },
    {
      label: labels.totalCandidates,
      value: homeData.totalCandidates,
      icon: <Users className="w-4 h-4 text-blue-600" />,
    },
    {
      label: labels.analyzed,
      value: homeData.analyzedCount,
      icon: <CheckCircle2 className="w-4 h-4 text-blue-600" />,
    },
    {
      label: labels.processing,
      value: homeData.processingCount,
      icon: <Clock className="w-4 h-4 text-blue-600" />,
    },
  ];

  const averageCandidatesPerSession =
    homeData.totalSessions > 0
      ? (homeData.totalCandidates / homeData.totalSessions).toFixed(1)
      : '0.0';

  const openSessionManagement = () => {
    if (typeof setActivePage === 'function') {
      setActivePage('session-management');
    }
  };

  const openCreateSessionModal = () => {
    if (typeof setActivePage === 'function') {
      setActivePage('session-management');
    }
    if (typeof setIsModalOpen === 'function') {
      setIsModalOpen(true);
    }
  };

  const openCandidateManagement = () => {
    if (typeof setActivePage === 'function') {
      setActivePage('candidate-management');
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans">
        <main className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-[60vh]">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
              <p className="text-sm text-[var(--text-muted)]">{labels.loading}</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans selection:bg-blue-100 selection:text-blue-900 dark:selection:bg-blue-900 dark:selection:text-blue-100">
      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        <header className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)] mb-1">
              {labels.goodMorning},{' '}
              <span className="text-blue-600">{userName}</span>
            </h1>
            <p className="text-sm md:text-base text-[var(--text-muted)] max-w-2xl leading-relaxed">
              {labels.homeDescription}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchHomeData({ silent: true })}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--border-light)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] transition disabled:opacity-60"
            >
              <RefreshCw
                className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`}
              />
              <span className="text-sm font-medium">{labels.refresh}</span>
            </button>

            <button
              onClick={openCreateSessionModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition"
            >
              <Mic className="w-4 h-4" />
              <span className="text-sm font-medium">{labels.createSessionNow}</span>
            </button>
          </div>
        </header>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm">{error}</span>
              <button
                onClick={() => fetchHomeData()}
                className="px-3 py-1.5 text-xs font-semibold rounded bg-red-600 text-white hover:bg-red-700"
              >
                {labels.retry}
              </button>
            </div>
          </div>
        )}

        <section className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-[var(--text-primary)]">
              {labels.quickActions}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={openCreateSessionModal}
              className="flex items-center gap-4 p-4 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition text-left"
            >
              <Mic className="w-5 h-5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-sm">{labels.sessionManagement}</h3>
                <p className="text-xs text-blue-100 mt-1">{labels.recordNew}</p>
              </div>
            </button>

            <button
              onClick={openSessionManagement}
              className="flex items-center gap-4 p-4 rounded-xl border border-[var(--border-light)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] transition text-left"
            >
              <FileText className="w-5 h-5 flex-shrink-0 text-blue-600" />
              <div>
                <h3 className="font-semibold text-sm">{labels.openSessions}</h3>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  {labels.recentSessions}
                </p>
              </div>
            </button>

            <button
              onClick={openCandidateManagement}
              className="flex items-center gap-4 p-4 rounded-xl border border-[var(--border-light)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] transition text-left"
            >
              <Users className="w-5 h-5 flex-shrink-0 text-blue-600" />
              <div>
                <h3 className="font-semibold text-sm">{labels.candidateManagement}</h3>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  {labels.viewProfiles}
                </p>
              </div>
            </button>
          </div>
        </section>

        <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-3">
            {labels.overview}
          </h2>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-[var(--border-light)] bg-[var(--bg-secondary)] shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="p-1 rounded-md bg-transparent">{stat.icon}</div>
                </div>
                <div>
                  <h4 className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1">
                    {stat.label}
                  </h4>
                  <span className="text-2xl font-bold text-[var(--text-primary)] leading-none">
                    {stat.value}
                  </span>
                </div>
              </div>
            ))}

            <div className="p-4 rounded-xl border border-[var(--border-light)] bg-[var(--bg-secondary)] shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex justify-between items-start mb-2">
                <div className="p-1 rounded-md bg-transparent">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                </div>
              </div>
              <div>
                <h4 className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1">
                  {labels.avgPerSession}
                </h4>
                <span className="text-2xl font-bold text-[var(--text-primary)] leading-none">
                  {averageCandidatesPerSession}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
          <div className="rounded-2xl border border-[var(--border-light)] bg-[var(--bg-secondary)] shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-light)]">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-semibold">{labels.recentSessions}</h2>
              </div>

              <button
                onClick={openSessionManagement}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                {labels.details}
              </button>
            </div>

            <div className="divide-y divide-[var(--border-light)]">
              {homeData.recentSessions.length === 0 ? (
                <div className="px-5 py-8 text-sm text-[var(--text-muted)]">
                  {labels.noSessions}
                </div>
              ) : (
                homeData.recentSessions.map((session) => (
                  <button
                    key={session.id}
                    onClick={openSessionManagement}
                    className="w-full px-5 py-4 text-left hover:bg-[var(--bg-tertiary)] transition"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-[var(--text-primary)]">
                          {session.jobTitle}
                        </p>
                        <p className="text-xs text-[var(--text-muted)] mt-1">
                          {formatDate(session.date, lang)}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-xs text-[var(--text-muted)]">
                          {session.candidateCount} candidats
                        </p>
                        <p className="text-xs text-blue-600 font-semibold mt-1">
                          {session.analyzedCount} analysés
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border-light)] bg-[var(--bg-secondary)] shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-light)]">
              <div className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-semibold">{labels.topCandidates}</h2>
              </div>

              <button
                onClick={openCandidateManagement}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                {labels.details}
              </button>
            </div>

            <div className="divide-y divide-[var(--border-light)]">
              {homeData.topCandidates.length === 0 ? (
                <div className="px-5 py-8 text-sm text-[var(--text-muted)]">
                  {labels.noCandidates}
                </div>
              ) : (
                homeData.topCandidates.map((candidate, index) => (
                  <div key={`${candidate.id}-${index}`} className="px-5 py-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[var(--text-primary)]">
                            {candidate.name}
                          </p>
                          <p className="text-xs text-[var(--text-muted)] mt-1">
                            {candidate.sessionTitle}
                          </p>
                        </div>
                      </div>

                      <div className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
                        {labels.scoreLabel}: {Number(candidate.score).toFixed(1)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}