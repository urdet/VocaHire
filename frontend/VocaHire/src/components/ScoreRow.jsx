import React from 'react';

export default function ScoreRow({ label, value }) {
  const numericValue = Number(value) || 0;
  const clamped = Math.max(0, Math.min(100, numericValue));

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-tight">
        <span>{label.replace(/_/g, ' ')}</span>
        <span className="text-[var(--accent)]">{clamped.toFixed(1)}/100</span>
      </div>
      <div className="w-full h-1.5 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full transition-all duration-1000"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
