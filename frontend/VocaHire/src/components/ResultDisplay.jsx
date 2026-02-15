import React from "react";
import { Trophy } from "lucide-react";
import ScoreRow from "./ScoreRow";

export default function ResultDisplay({ t, candidate }) {
  if (!candidate || !candidate.results) return null;
  const { results } = candidate;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col items-center text-center mb-6">
        <div className="w-12 h-12 bg-green-50 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mb-4">
          <Trophy size={24} />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          {t.resultTitle}
        </h3>
        <p className="text-sm text-slate-500 font-medium">
          {candidate.name} —{" "}
          <span className="text-blue-600 font-bold">
            {candidate.totalScore.toFixed(1)}/10
          </span>
        </p>
      </div>
      <div className="space-y-4 bg-slate-50 dark:bg-slate-800/50 p-5 rounded border border-slate-200 dark:border-slate-800 mb-6">
        <ScoreRow label="Content Relevance" value={results.content_relevance} />
        <ScoreRow label="Vocal Confidence" value={results.vocal_confidence} />
        <ScoreRow label="Clarity of Speech" value={results.clarity_of_speech} />
        <ScoreRow label="Fluency" value={results.fluency} />
      </div>
      <div className="p-4 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">
        <p className="text-sm text-slate-600 dark:text-slate-400 italic">
          "{results.short_feedback}"
        </p>
      </div>
    </div>
  );
}