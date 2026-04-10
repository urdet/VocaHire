import React, { useEffect, useMemo, useState } from 'react';
import {
  Search,
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  RefreshCw,
  Plus,
  FolderPlus,
  Users,
  CheckCircle2,
  Clock3,
  BarChart3,
  X,
  Briefcase,
  ChevronRight,
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/base-v1';

function getUserData() {
  try {
    const raw = localStorage.getItem('userData');
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error('Failed to parse userData:', error);
    return null;
  }
}

function formatSessionTitle(session) {
  return session?.job_title || session?.title || `Session #${session?.id ?? ''}`;
}

function formatScore(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '-';
  return Number(value).toFixed(1);
}

function statusBadgeClass(status) {
  const value = String(status || '').toLowerCase();

  if (value === 'analyzed') {
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  }

  if (value === 'processing' || value === 'uploaded' || value === 'pending') {
    return 'bg-amber-50 text-amber-700 border-amber-200';
  }

  if (value === 'shortlisted' || value === 'new') {
    return 'bg-blue-50 text-blue-700 border-blue-200';
  }

  return 'bg-slate-50 text-slate-700 border-slate-200';
}

export default function CandidateManagement({
  t = {},
  lang = 'en',
  setActivePage,
  setActiveSessionId,
}) {
  const isRtl = lang === 'ar';

  const [ownerId, setOwnerId] = useState(null);
  const [userName, setUserName] = useState('Recruiter');

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [savingCandidate, setSavingCandidate] = useState(false);
  const [assigningSessions, setAssigningSessions] = useState(false);

  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [sessions, setSessions] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [sessionCandidateCounts, setSessionCandidateCounts] = useState({});

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedSessionIds, setSelectedSessionIds] = useState([]);

  const [assignTarget, setAssignTarget] = useState(null);
  const [assignSessionIds, setAssignSessionIds] = useState([]);

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    cin: '',
    email: '',
    phone: '',
    city: '',
    infos: '',
  });

  useEffect(() => {
    document.documentElement.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', lang);
  }, [lang, isRtl]);

  useEffect(() => {
    const userData = getUserData();

    if (userData) {
      const name =
        `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || 'Recruiter';
      setUserName(name);
      setOwnerId(userData.id || null);
    } else {
      setLoading(false);
    }
  }, []);

  const labels = useMemo(
    () => ({
      title: t.candidateManagement || 'Candidate Management',
      subtitle:
        t.candidate_management_subtitle ||
        'Manage real candidates, assign them to one or more sessions, and keep all session lists synchronized.',
      totalCandidates: t.totalCandidates || 'Total Candidates',
      totalAssignments: t.total_assignments || 'Total Assignments',
      analyzed: t.files_analysed || 'Analysed',
      averageScore: t.average_score || 'Average Score',
      searchPlaceholder: t.searchCandidates || 'Search by name, email, CIN, city, or session...',
      refresh: t.refresh || 'Refresh',
      addCandidate: t.add_candidate || 'Add Candidate',
      addToSessions: t.add_to_sessions || 'Add to sessions',
      noCandidates: t.noCandidatesFound || 'No candidates found.',
      sessions: t.sessions || 'Sessions',
      contact: t.contact || 'Contact',
      city: t.city || 'City',
      infos: t.infos || 'Infos',
      score: t.score || 'Score',
      status: t.status || 'Status',
      actions: t.actions || 'Actions',
      firstName: t.firstName || 'First Name',
      lastName: t.lastName || 'Last Name',
      cin: t.cin || 'CIN',
      email: t.email || 'Email',
      phone: t.phone || 'Phone',
      candidateInfo: t.candidate_info || 'Candidate Info',
      selectSessions: t.select_sessions || 'Select Sessions',
      cancel: t.cancel || 'Cancel',
      save: t.save || 'Save',
      createCandidate: t.create_candidate || 'Create candidate',
      assignSessions: t.assign_sessions || 'Assign sessions',
      noSessions: t.no_sessions || 'No sessions available.',
      openSession: t.open_session || 'Open session',
      loading: t.loading || 'Loading...',
      retry: t.retry || 'Retry',
      alreadyInSession: t.already_in_session || 'Already in this session',
      selectedSessionsRequired:
        t.selected_sessions_required || 'Please choose at least one session.',
      nameRequired: t.name_required || 'First name and last name are required.',
      candidateCreated: t.candidate_created || 'Candidate created successfully.',
    }),
    [t]
  );

  const resetCreateForm = () => {
    setForm({
      first_name: '',
      last_name: '',
      cin: '',
      email: '',
      phone: '',
      city: '',
      infos: '',
    });
    setSelectedSessionIds([]);
  };

  const fetchCandidateManagementData = async ({ silent = false } = {}) => {
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
      const sessionsResponse = await fetch(`${API_BASE}/job-sessions/?owner_id=${ownerId}`, {
        headers: { Accept: 'application/json' },
      });

      if (!sessionsResponse.ok) {
        throw new Error('Failed to fetch sessions');
      }

      const sessionsData = await sessionsResponse.json();
      setSessions(sessionsData);

      const sessionMap = new Map(
        sessionsData.map((session) => [String(session.id), session])
      );

      const listResponses = await Promise.all(
        sessionsData.map(async (session) => {
          const response = await fetch(
            `${API_BASE}/candidates/?job_session_id=${session.id}`,
            {
              headers: { Accept: 'application/json' },
            }
          );

          if (!response.ok) {
            throw new Error(`Failed to fetch candidates for session ${session.id}`);
          }

          const items = await response.json();
          return {
            sessionId: session.id,
            items,
          };
        })
      );

      const counts = {};
      const candidateMap = new Map();

      for (const result of listResponses) {
        counts[String(result.sessionId)] = result.items.length;

        for (const item of result.items) {
          const person = item.candidate;
          if (!person) continue;

          const personId = String(person.id);

          if (!candidateMap.has(personId)) {
            candidateMap.set(personId, {
              id: person.id,
              first_name: person.first_name || '',
              last_name: person.last_name || '',
              cin: person.cin || '',
              email: person.email || '',
              phone: person.phone || '',
              city: person.city || '',
              infos: person.infos || '',
              assignments: [],
            });
          }

          candidateMap.get(personId).assignments.push({
            candidate_list_item_id: item.id,
            job_session_id: item.job_session_id,
            session_title: formatSessionTitle(sessionMap.get(String(item.job_session_id))),
            score: item.score,
            status: item.status || 'shortlisted',
            notes: item.notes || '',
          });
        }
      }

      const mergedCandidates = Array.from(candidateMap.values())
        .map((candidate) => ({
          ...candidate,
          assignments: [...candidate.assignments].sort(
            (a, b) => Number(b.score || 0) - Number(a.score || 0)
          ),
          bestScore:
            candidate.assignments.length > 0
              ? Math.max(
                  ...candidate.assignments.map((assignment) =>
                    assignment.score === null || assignment.score === undefined
                      ? -1
                      : Number(assignment.score)
                  )
                )
              : null,
          analyzedCount: candidate.assignments.filter(
            (assignment) => String(assignment.status).toLowerCase() === 'analyzed'
          ).length,
        }))
        .sort((a, b) => {
          const nameA = `${a.first_name} ${a.last_name}`.trim().toLowerCase();
          const nameB = `${b.first_name} ${b.last_name}`.trim().toLowerCase();
          return nameA.localeCompare(nameB);
        });

      setCandidates(mergedCandidates);
      setSessionCandidateCounts(counts);
    } catch (err) {
      console.error('Error loading candidate management data:', err);
      setError(err.message || 'Failed to load candidate data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCandidateManagementData();
  }, [ownerId]);

  const filteredCandidates = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return candidates;

    return candidates.filter((candidate) => {
      const haystack = [
        candidate.first_name,
        candidate.last_name,
        `${candidate.first_name} ${candidate.last_name}`,
        candidate.email,
        candidate.phone,
        candidate.cin,
        candidate.city,
        candidate.infos,
        ...candidate.assignments.map((assignment) => assignment.session_title),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [candidates, searchQuery]);

  const stats = useMemo(() => {
    const totalAssignments = candidates.reduce(
      (sum, candidate) => sum + candidate.assignments.length,
      0
    );

    const analyzedAssignments = candidates.reduce(
      (sum, candidate) =>
        sum +
        candidate.assignments.filter(
          (assignment) => String(assignment.status).toLowerCase() === 'analyzed'
        ).length,
      0
    );

    const scoredAssignments = candidates.flatMap((candidate) =>
      candidate.assignments.filter(
        (assignment) => assignment.score !== null && assignment.score !== undefined
      )
    );

    const averageScore =
      scoredAssignments.length > 0
        ? (
            scoredAssignments.reduce((sum, assignment) => sum + Number(assignment.score), 0) /
            scoredAssignments.length
          ).toFixed(1)
        : '0.0';

    return {
      totalCandidates: candidates.length,
      totalAssignments,
      analyzedAssignments,
      averageScore,
    };
  }, [candidates]);

  const toggleCreateSessionSelection = (sessionId) => {
    const value = String(sessionId);

    setSelectedSessionIds((prev) =>
      prev.includes(value) ? prev.filter((id) => id !== value) : [...prev, value]
    );
  };

  const toggleAssignSessionSelection = (sessionId) => {
    const value = String(sessionId);

    setAssignSessionIds((prev) =>
      prev.includes(value) ? prev.filter((id) => id !== value) : [...prev, value]
    );
  };

  const openSession = (sessionId) => {
    if (typeof setActiveSessionId === 'function') {
      setActiveSessionId(sessionId);
    }
    if (typeof setActivePage === 'function') {
      setActivePage('session-management');
    }
  };

  const handleCreateCandidate = async () => {
    if (!form.first_name.trim() || !form.last_name.trim()) {
      setError(labels.nameRequired);
      return;
    }

    if (selectedSessionIds.length === 0) {
      setError(labels.selectedSessionsRequired);
      return;
    }

    setSavingCandidate(true);
    setError('');

    try {
      const personResponse = await fetch(`${API_BASE}/candidates/persons/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          cin: form.cin.trim() || null,
          email: form.email.trim() || null,
          phone: form.phone.trim() || null,
          city: form.city.trim() || null,
          infos: form.infos.trim() || null,
        }),
      });

      if (!personResponse.ok) {
        const errorBody = await personResponse.text();
        throw new Error(errorBody || 'Failed to create candidate');
      }

      const person = await personResponse.json();

      const assignmentResults = await Promise.allSettled(
        selectedSessionIds.map((sessionId, index) =>
          fetch(`${API_BASE}/candidates/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify({
              job_session_id: Number(sessionId),
              candidate_id: Number(person.id),
              list_order: Number(sessionCandidateCounts[String(sessionId)] || 0) + index + 1,
              notes: '',
              score: null,
              status: 'shortlisted',
            }),
          })
        )
      );

      const failed = [];
      for (const result of assignmentResults) {
        if (result.status === 'fulfilled') {
          if (!result.value.ok) {
            failed.push(await result.value.text());
          }
        } else {
          failed.push(result.reason?.message || 'Assignment failed');
        }
      }

      if (failed.length > 0) {
        throw new Error(failed.join(' | '));
      }

      resetCreateForm();
      setIsCreateModalOpen(false);
      await fetchCandidateManagementData({ silent: true });
    } catch (err) {
      console.error('Error creating candidate:', err);
      setError(err.message || 'Failed to create candidate');
    } finally {
      setSavingCandidate(false);
    }
  };

  const openAssignModal = (candidate) => {
    setAssignTarget(candidate);
    setAssignSessionIds([]);
  };

  const handleAssignExistingCandidate = async () => {
    if (!assignTarget) return;

    if (assignSessionIds.length === 0) {
      setError(labels.selectedSessionsRequired);
      return;
    }

    setAssigningSessions(true);
    setError('');

    try {
      const existingSessionIds = new Set(
        assignTarget.assignments.map((assignment) => String(assignment.job_session_id))
      );

      const sessionIdsToCreate = assignSessionIds.filter(
        (sessionId) => !existingSessionIds.has(String(sessionId))
      );

      if (sessionIdsToCreate.length === 0) {
        setAssignTarget(null);
        setAssignSessionIds([]);
        return;
      }

      const results = await Promise.allSettled(
        sessionIdsToCreate.map((sessionId, index) =>
          fetch(`${API_BASE}/candidates/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify({
              job_session_id: Number(sessionId),
              candidate_id: Number(assignTarget.id),
              list_order: Number(sessionCandidateCounts[String(sessionId)] || 0) + index + 1,
              notes: '',
              score: null,
              status: 'shortlisted',
            }),
          })
        )
      );

      const failed = [];
      for (const result of results) {
        if (result.status === 'fulfilled') {
          if (!result.value.ok) {
            failed.push(await result.value.text());
          }
        } else {
          failed.push(result.reason?.message || 'Assignment failed');
        }
      }

      if (failed.length > 0) {
        throw new Error(failed.join(' | '));
      }

      setAssignTarget(null);
      setAssignSessionIds([]);
      await fetchCandidateManagementData({ silent: true });
    } catch (err) {
      console.error('Error assigning sessions:', err);
      setError(err.message || 'Failed to assign candidate');
    } finally {
      setAssigningSessions(false);
    }
  };

  if (loading) {
    return (
      <div
        dir={isRtl ? 'rtl' : 'ltr'}
        className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] p-6 md:p-8"
      >
        <div className="flex items-center justify-center h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            <p className="text-sm text-[var(--text-muted)]">{labels.loading}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] p-4 md:p-8"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">
              {labels.title}
            </h1>
            <p className="mt-2 text-sm text-[var(--text-muted)] max-w-3xl">
              {labels.subtitle}
            </p>
            <p className="mt-2 text-xs text-[var(--text-muted)]">
              {userName}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => fetchCandidateManagementData({ silent: true })}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--border-light)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] transition disabled:opacity-60"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="text-sm font-medium">{labels.refresh}</span>
            </button>

            <button
              onClick={() => {
                resetCreateForm();
                setIsCreateModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">{labels.addCandidate}</span>
            </button>
          </div>
        </header>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm">{error}</span>
              <button
                onClick={() => setError('')}
                className="text-xs font-semibold px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
              >
                OK
              </button>
            </div>
          </div>
        )}

        <section className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-[var(--border-light)] bg-[var(--bg-secondary)] shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-semibold">
              {labels.totalCandidates}
            </p>
            <p className="text-2xl font-bold mt-1">{stats.totalCandidates}</p>
          </div>

          <div className="p-4 rounded-xl border border-[var(--border-light)] bg-[var(--bg-secondary)] shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <FolderPlus className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-semibold">
              {labels.totalAssignments}
            </p>
            <p className="text-2xl font-bold mt-1">{stats.totalAssignments}</p>
          </div>

          <div className="p-4 rounded-xl border border-[var(--border-light)] bg-[var(--bg-secondary)] shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-semibold">
              {labels.analyzed}
            </p>
            <p className="text-2xl font-bold mt-1">{stats.analyzedAssignments}</p>
          </div>

          <div className="p-4 rounded-xl border border-[var(--border-light)] bg-[var(--bg-secondary)] shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-semibold">
              {labels.averageScore}
            </p>
            <p className="text-2xl font-bold mt-1">{stats.averageScore}</p>
          </div>
        </section>

        <section className="rounded-2xl border border-[var(--border-light)] bg-[var(--bg-secondary)] shadow-sm overflow-hidden">
          <div className="p-4 border-b border-[var(--border-light)] flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div className="relative w-full lg:max-w-lg">
              <div className={`absolute inset-y-0 ${isRtl ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
                <Search size={16} className="text-[var(--text-muted)]" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={labels.searchPlaceholder}
                className={`w-full ${isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 text-sm bg-[var(--bg-primary)] border border-[var(--border-light)] rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-[var(--text-primary)] placeholder-[var(--text-muted)] transition-all`}
              />
            </div>

            <div className="text-xs text-[var(--text-muted)]">
              {filteredCandidates.length} / {candidates.length}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-[var(--bg-primary)] border-b border-[var(--border-light)] text-[10px] uppercase tracking-widest font-bold text-[var(--text-muted)]">
                  <th className="px-6 py-4">Candidate</th>
                  <th className="px-6 py-4">{labels.contact}</th>
                  <th className="px-6 py-4">{labels.city}</th>
                  <th className="px-6 py-4">{labels.infos}</th>
                  <th className="px-6 py-4">{labels.sessions}</th>
                  <th className="px-6 py-4">{labels.score}</th>
                  <th className="px-6 py-4">{labels.status}</th>
                  <th className="px-6 py-4 text-right">{labels.actions}</th>
                </tr>
              </thead>

              <tbody className="text-sm divide-y divide-[var(--border-light)]">
                {filteredCandidates.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <User size={24} className="text-[var(--text-muted)]" />
                        <p className="text-[var(--text-muted)] text-sm">{labels.noCandidates}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredCandidates.map((candidate) => {
                    const fullName =
                      `${candidate.first_name || ''} ${candidate.last_name || ''}`.trim() ||
                      'Unnamed candidate';

                    const bestAssignment =
                      candidate.assignments.find(
                        (assignment) =>
                          assignment.score !== null && assignment.score !== undefined
                      ) || null;

                    const latestStatus =
                      bestAssignment?.status ||
                      candidate.assignments[0]?.status ||
                      'shortlisted';

                    return (
                      <tr
                        key={candidate.id}
                        className="hover:bg-[var(--bg-primary)] transition-colors align-top"
                      >
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <span className="font-semibold text-[var(--text-primary)]">
                              {fullName}
                            </span>
                            <div className="flex flex-wrap items-center gap-3 text-[11px] text-[var(--text-muted)]">
                              <span className="inline-flex items-center gap-1">
                                <CreditCard size={12} />
                                {candidate.cin || '-'}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <FolderPlus size={12} />
                                {candidate.assignments.length} session(s)
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1 min-w-[220px]">
                            <span className="inline-flex items-center gap-2 text-[13px] text-[var(--text-primary)]">
                              <Mail size={12} className="text-[var(--text-muted)]" />
                              {candidate.email || '-'}
                            </span>
                            <span className="inline-flex items-center gap-2 text-[12px] text-[var(--text-muted)]">
                              <Phone size={12} />
                              {candidate.phone || '-'}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-[var(--text-secondary)] text-xs">
                          <span className="inline-flex items-center gap-2">
                            <MapPin size={12} className="text-[var(--text-muted)]" />
                            {candidate.city || '-'}
                          </span>
                        </td>

                        <td className="px-6 py-4 max-w-[240px]">
                          <p className="text-[12px] text-[var(--text-muted)] whitespace-normal break-words">
                            {candidate.infos || '-'}
                          </p>
                        </td>

                        <td className="px-6 py-4 min-w-[280px]">
                          <div className="flex flex-wrap gap-2">
                            {candidate.assignments.map((assignment) => (
                              <button
                                key={`${candidate.id}-${assignment.candidate_list_item_id}`}
                                onClick={() => openSession(assignment.job_session_id)}
                                className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full border border-blue-200 bg-blue-50 text-blue-700 text-[11px] font-semibold hover:bg-blue-100 transition"
                              >
                                <Briefcase size={12} />
                                <span>{assignment.session_title}</span>
                                <ChevronRight size={12} />
                              </button>
                            ))}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-bold">
                            {bestAssignment ? formatScore(bestAssignment.score) : '-'}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full border text-[11px] font-semibold ${statusBadgeClass(
                              latestStatus
                            )}`}
                          >
                            {latestStatus}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => openAssignModal(candidate)}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--border-light)] bg-[var(--bg-primary)] hover:bg-[var(--bg-tertiary)] transition text-xs font-semibold"
                          >
                            <FolderPlus size={14} />
                            {labels.addToSessions}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-[var(--modal-overlay)] backdrop-blur-[1px]"
            onClick={() => setIsCreateModalOpen(false)}
          />

          <div className="relative w-full max-w-3xl bg-[var(--card-bg)] rounded-2xl border border-[var(--border-light)] shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--border-light)] flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  {labels.createCandidate}
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  {labels.selectSessions}
                </p>
              </div>

              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2 hover:bg-[var(--bg-secondary)] rounded-lg transition"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                    {labels.firstName}
                  </label>
                  <input
                    value={form.first_name}
                    onChange={(e) => setForm((prev) => ({ ...prev, first_name: e.target.value }))}
                    type="text"
                    className="w-full px-3 py-2 text-sm bg-[var(--bg-secondary)] border border-[var(--border-light)] rounded-lg outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                    {labels.lastName}
                  </label>
                  <input
                    value={form.last_name}
                    onChange={(e) => setForm((prev) => ({ ...prev, last_name: e.target.value }))}
                    type="text"
                    className="w-full px-3 py-2 text-sm bg-[var(--bg-secondary)] border border-[var(--border-light)] rounded-lg outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                    {labels.cin}
                  </label>
                  <input
                    value={form.cin}
                    onChange={(e) => setForm((prev) => ({ ...prev, cin: e.target.value }))}
                    type="text"
                    className="w-full px-3 py-2 text-sm bg-[var(--bg-secondary)] border border-[var(--border-light)] rounded-lg outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                    {labels.city}
                  </label>
                  <input
                    value={form.city}
                    onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
                    type="text"
                    className="w-full px-3 py-2 text-sm bg-[var(--bg-secondary)] border border-[var(--border-light)] rounded-lg outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                    {labels.email}
                  </label>
                  <input
                    value={form.email}
                    onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                    type="email"
                    className="w-full px-3 py-2 text-sm bg-[var(--bg-secondary)] border border-[var(--border-light)] rounded-lg outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                    {labels.phone}
                  </label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                    type="text"
                    className="w-full px-3 py-2 text-sm bg-[var(--bg-secondary)] border border-[var(--border-light)] rounded-lg outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  {labels.candidateInfo}
                </label>
                <textarea
                  rows={3}
                  value={form.infos}
                  onChange={(e) => setForm((prev) => ({ ...prev, infos: e.target.value }))}
                  className="w-full px-3 py-2 text-sm bg-[var(--bg-secondary)] border border-[var(--border-light)] rounded-lg outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-[var(--text-primary)]">
                  {labels.selectSessions}
                </h4>

                {sessions.length === 0 ? (
                  <div className="rounded-lg border border-[var(--border-light)] bg-[var(--bg-secondary)] p-4 text-sm text-[var(--text-muted)]">
                    {labels.noSessions}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {sessions.map((session) => {
                      const sessionId = String(session.id);
                      const checked = selectedSessionIds.includes(sessionId);

                      return (
                        <label
                          key={session.id}
                          className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition ${
                            checked
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-[var(--border-light)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-primary)]'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleCreateSessionSelection(session.id)}
                            className="mt-1"
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-[var(--text-primary)]">
                              {formatSessionTitle(session)}
                            </p>
                            <p className="text-xs text-[var(--text-muted)] mt-1">
                              {session.qualities || session.session_type || '-'}
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-[var(--border-light)] flex justify-end gap-3">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 text-sm font-semibold rounded-lg border border-[var(--border-light)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] transition"
              >
                {labels.cancel}
              </button>

              <button
                onClick={handleCreateCandidate}
                disabled={savingCandidate}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition disabled:opacity-60"
              >
                {savingCandidate ? 'Saving...' : labels.save}
              </button>
            </div>
          </div>
        </div>
      )}

      {assignTarget && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-[var(--modal-overlay)] backdrop-blur-[1px]"
            onClick={() => setAssignTarget(null)}
          />

          <div className="relative w-full max-w-2xl bg-[var(--card-bg)] rounded-2xl border border-[var(--border-light)] shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--border-light)] flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  {labels.assignSessions}
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  {`${assignTarget.first_name || ''} ${assignTarget.last_name || ''}`.trim()}
                </p>
              </div>

              <button
                onClick={() => setAssignTarget(null)}
                className="p-2 hover:bg-[var(--bg-secondary)] rounded-lg transition"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-3 max-h-[65vh] overflow-y-auto">
              {sessions.length === 0 ? (
                <div className="rounded-lg border border-[var(--border-light)] bg-[var(--bg-secondary)] p-4 text-sm text-[var(--text-muted)]">
                  {labels.noSessions}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {sessions.map((session) => {
                    const sessionId = String(session.id);
                    const alreadyAssigned = assignTarget.assignments.some(
                      (assignment) => String(assignment.job_session_id) === sessionId
                    );
                    const checked = alreadyAssigned || assignSessionIds.includes(sessionId);

                    return (
                      <label
                        key={session.id}
                        className={`flex items-start gap-3 p-4 rounded-xl border transition ${
                          checked
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-[var(--border-light)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-primary)]'
                        } ${alreadyAssigned ? 'opacity-80' : 'cursor-pointer'}`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={alreadyAssigned}
                          onChange={() => toggleAssignSessionSelection(session.id)}
                          className="mt-1"
                        />

                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-[var(--text-primary)]">
                            {formatSessionTitle(session)}
                          </p>
                          <p className="text-xs text-[var(--text-muted)] mt-1">
                            {session.qualities || session.session_type || '-'}
                          </p>

                          {alreadyAssigned && (
                            <p className="text-[11px] text-blue-700 font-semibold mt-2">
                              {labels.alreadyInSession}
                            </p>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-[var(--border-light)] flex justify-end gap-3">
              <button
                onClick={() => setAssignTarget(null)}
                className="px-4 py-2 text-sm font-semibold rounded-lg border border-[var(--border-light)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] transition"
              >
                {labels.cancel}
              </button>

              <button
                onClick={handleAssignExistingCandidate}
                disabled={assigningSessions}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition disabled:opacity-60"
              >
                {assigningSessions ? 'Saving...' : labels.save}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}