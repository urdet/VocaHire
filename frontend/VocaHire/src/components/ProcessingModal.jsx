import React, { useEffect, useState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import ResultDisplay from "./ResultDisplay";

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
        () => setStepIndex((p) => Math.min(p + 1, t.steps.length - 1)),
        2000
      );
      const progInt = setInterval(() => {
        setProgress((p) => {
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
        className="absolute inset-0 bg-slate-900/40 dark:bg-black/80 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className="relative bg-white dark:bg-[#1f1f1f] w-full max-w-md rounded border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        <div className="p-8">
          {!isFinished ? (
            <div className="space-y-6">
              <div className="flex flex-col items-center text-center">
                <Loader2 className="mb-4 text-blue-600 animate-spin" size={32} />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {t.processing}
                </h3>
                <p className="text-sm text-slate-500 mb-2">{candidate?.name}</p>
                <p className="text-[10px] text-blue-600 font-mono uppercase tracking-widest font-bold">
                  {Math.floor(progress)}%
                </p>
              </div>
              <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
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
                      i <= stepIndex ? "opacity-100" : "opacity-20"
                    }`}
                  >
                    {i < stepIndex ? (
                      <CheckCircle2 size={12} className="text-blue-600" />
                    ) : (
                      <div className="w-1 h-1 rounded-full bg-blue-400" />
                    )}
                    <span
                      className={
                        i === stepIndex
                          ? "text-blue-600 font-bold"
                          : "text-slate-400"
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
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded text-xs font-semibold"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
}