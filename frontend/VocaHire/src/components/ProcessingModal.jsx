import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';
import ResultDisplay from './ResultDisplay';

export default function ProcessingModal({ isOpen, onClose, t, candidate }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (isOpen && !candidate?.analyzed) {
      setIsFinished(false);
      setStepIndex(0);
      setProgress(0);
      const stepInt = setInterval(
        () => setStepIndex(p => Math.min(p + 1, t.steps.length - 1)),
        2000
      );
      const progInt = setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
            clearInterval(progInt);
            setTimeout(() => setIsFinished(true), 500);
            return 100;
          }
          return Math.min(p + 4, 100);
        });
      }, 150);
      return () => {
        clearInterval(stepInt);
        clearInterval(progInt);
      };
    } else if (isOpen && candidate?.analyzed) {
      setIsFinished(true);
    }
  }, [isOpen, t.steps, candidate?.analyzed]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[var(--modal-overlay)] backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className="relative bg-[var(--card-bg)] w-full max-w-md rounded border border-[var(--border-light)] shadow-2xl overflow-hidden">
        <div className="p-8">
          {!isFinished ? (
            <div className="space-y-6">
              <div className="flex flex-col items-center text-center">
                <Loader2 className="mb-4 text-[var(--accent)] animate-spin" size={32} />
                <h3 className="text-lg font-bold text-[var(--text-primary)]">
                  {t.processing}
                </h3>
                <p className="text-sm text-[var(--text-muted)] mb-2">{candidate?.name}</p>
                <p className="text-[10px] text-[var(--accent)] font-mono uppercase tracking-widest font-bold">
                  {Math.floor(progress)}%
                </p>
              </div>
              <div className="w-full h-1 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="space-y-2">
                {t.steps.map((s, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 text-xs ${
                      i <= stepIndex ? 'opacity-100' : 'opacity-20'
                    }`}
                  >
                    {i < stepIndex ? (
                      <CheckCircle2 size={12} className="text-[var(--accent)]" />
                    ) : (
                      <div className="w-1 h-1 rounded-full bg-[var(--accent)]" />
                    )}
                    <span
                      className={
                        i === stepIndex
                          ? 'text-[var(--accent)] font-bold'
                          : 'text-[var(--text-muted)]'
                      }
                    >
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <ResultDisplay t={t} candidate={candidate} />
          )}
        </div>
        <div className="p-4 bg-[var(--bg-secondary)] border-t border-[var(--border-light)] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded text-xs font-semibold"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
}