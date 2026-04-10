import React, { useState } from 'react';
import { X } from 'lucide-react';
import { DIPLOMAS } from '../constants/diplomas';

const API_URL = 'http://localhost:5000/base-v1';

export const createJobSession = async (sessionData, userId) => {
  const payload = {
    job_title: sessionData.jobTitle,
    title: sessionData.jobTitle,
    scheduled_date: sessionData.date || null,
    qualities: (sessionData.qualities || []).join(', '),
    session_type: localStorage.getItem('userData')
      ? JSON.parse(localStorage.getItem('userData')).role
      : 'recruiter',
    owner_user_id: Number(userId)
  };

  const response = await fetch(`${API_URL}/job-sessions/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || 'Failed to create session');
  }

  return data;
};

export default function CreateSessionModal({ isOpen, onClose, t, onConfirm, modify }) {
  const [newSessionData, setNewSessionData] = useState({
    jobTitle: '',
    date: '',
    count: 1,
    qualities: ['Leadership'],
    diploma: 'Master',
    experience: 0
  });
  const [tagInput, setTagInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const addTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!newSessionData.qualities.includes(tagInput.trim())) {
        setNewSessionData({
          ...newSessionData,
          qualities: [...newSessionData.qualities, tagInput.trim()]
        });
      }
      setTagInput('');
    }
  };

  const handleSubmit = async () => {
    if (modify || !newSessionData.jobTitle.trim()) return;

    const userData = localStorage.getItem('userData')
      ? JSON.parse(localStorage.getItem('userData'))
      : null;

    const userId = userData?.id;
    if (!userId) {
      alert('User not authenticated');
      return;
    }

    try {
      setSubmitting(true);
      const createdSession = await createJobSession(newSessionData, userId);
      onConfirm(createdSession);
      onClose();
    } catch (error) {
      console.error(error);
      alert(error.message || 'Failed to create session');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[var(--modal-overlay)] backdrop-blur-[1px]"
        onClick={onClose}
      />

      <div className="relative bg-[var(--card-bg)] w-full max-w-xl rounded border border-[var(--border-light)] shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-[var(--border-light)] flex items-center justify-between sticky top-0 bg-inherit z-10">
          <h3 className="text-sm font-bold uppercase tracking-tight text-[var(--accent)]">
            {t.importTitle}
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[var(--bg-secondary)] rounded transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                {t.jobTitle}
              </label>
              <input
                value={newSessionData.jobTitle}
                onChange={(e) => setNewSessionData({ ...newSessionData, jobTitle: e.target.value })}
                type="text"
                placeholder="e.g. UX Designer"
                className="w-full px-3 py-1.5 text-sm bg-[var(--bg-secondary)] border border-[var(--border-light)] rounded outline-none focus:border-[var(--accent)]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                {t.candidateCount}
              </label>
              <input
                type="number"
                onChange={(e) =>
                  setNewSessionData({
                    ...newSessionData,
                    count: parseInt(e.target.value, 10) || 1
                  })
                }
                defaultValue={1}
                className="w-full px-3 py-1.5 text-sm bg-[var(--bg-secondary)] border border-[var(--border-light)] rounded outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                {t.diploma}
              </label>
              <select
                value={newSessionData.diploma}
                onChange={(e) => setNewSessionData({ ...newSessionData, diploma: e.target.value })}
                className="w-full px-3 py-1.5 text-sm bg-[var(--bg-secondary)] border border-[var(--border-light)] rounded outline-none focus:border-[var(--accent)]"
              >
                {DIPLOMAS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                {t.experience}
              </label>
              <input
                type="number"
                placeholder="0"
                onChange={(e) =>
                  setNewSessionData({
                    ...newSessionData,
                    experience: parseInt(e.target.value, 10) || 0
                  })
                }
                className="w-full px-3 py-1.5 text-sm bg-[var(--bg-secondary)] border border-[var(--border-light)] rounded outline-none focus:border-[var(--accent)]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
              {t.date}
            </label>
            <input
              value={newSessionData.date}
              onChange={(e) => setNewSessionData({ ...newSessionData, date: e.target.value })}
              type="date"
              className="w-full px-3 py-1.5 text-sm bg-[var(--bg-secondary)] border border-[var(--border-light)] rounded outline-none focus:border-[var(--accent)]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
              {t.qualities}
            </label>
            <div className="flex flex-wrap gap-1.5 p-2 bg-[var(--bg-secondary)] border border-[var(--border-light)] rounded min-h-[42px]">
              {newSessionData.qualities.map((tag, idx) => (
                <span
                  key={idx}
                  className="flex items-center gap-1 px-1.5 py-0.5 bg-[var(--accent-soft)] text-[var(--accent)] text-[10px] font-bold rounded uppercase"
                >
                  {tag}
                  <X
                    size={10}
                    className="cursor-pointer"
                    onClick={() =>
                      setNewSessionData({
                        ...newSessionData,
                        qualities: newSessionData.qualities.filter((_, i) => i !== idx)
                      })
                    }
                  />
                </span>
              ))}
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={addTag}
                placeholder="..."
                className="bg-transparent text-sm outline-none flex-1 min-w-[50px]"
              />
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-[var(--card-bg)] border-t border-[var(--border-light)] flex justify-end gap-3 sticky bottom-0">
          <button
            onClick={onClose}
            className="text-[11px] font-bold uppercase text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
          >
            {t.cancel}
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !newSessionData.jobTitle.trim()}
            className={`px-6 py-1.5 bg-gradient-to-br from-blue-600 to-indigo-700 text-white text-[11px] font-semibold rounded shadow-md ${
              submitting || !newSessionData.jobTitle.trim() ? 'opacity-60 cursor-not-allowed' : ''
            }`}
          >
            {submitting ? 'Creating...' : t.confirm}
          </button>
        </div>
      </div>
    </div>
  );
}
