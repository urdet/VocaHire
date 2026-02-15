import React from "react";

export default function ScoreRow({ label, value }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[11px] font-bold text-slate-500 uppercase tracking-tight">
        <span>{label.replace(/_/g, " ")}</span>
        <span className="text-blue-600">{(value * 10).toFixed(1)}/10</span>
      </div>
      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full transition-all duration-1000"
          style={{ width: `${value * 100}%` }}
        />
      </div>
    </div>
  );
}