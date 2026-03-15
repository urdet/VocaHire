import { useState, useEffect } from 'react';
import { Trophy } from 'lucide-react';
import ScoreRow from './ScoreRow';

const API_BASE = 'http://localhost:5000/base-v1';

export default function ResultDisplay({ t, candidate, interview_id }) {
  const [analysisData, setAnalysisData] = useState(candidate?.results || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const resolvedInterviewId = interview_id || candidate?.interview_id;

  useEffect(() => {
    if (candidate?.results) {
      setAnalysisData(candidate.results);
      return;
    }

    if (resolvedInterviewId) {
      fetchAnalysisData();
    }
  }, [candidate, resolvedInterviewId]);

  const fetchAnalysisData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE}/analysis/interview/${resolvedInterviewId}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch analysis data');
      }

      const data = await response.json();

      if (data.status !== 'completed') {
        throw new Error('Analysis not completed yet');
      }

      setAnalysisData({
        content_relevance: data.content_relevance,
        vocal_confidence: data.vocal_confidence,
        clarity_of_speech: data.clarity_of_speech,
        fluency: data.fluency,
        final_score: data.final_score,
        short_feedback: data.feedback || 'No feedback available'
      });
    } catch (err) {
      console.error('Error fetching analysis:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!candidate) return null;

  const results = analysisData || candidate.results;

  if (!results) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 bg-gray-50 dark:bg-gray-900/30 text-gray-600 rounded-full flex items-center justify-center mb-4">
            <Trophy size={24} />
          </div>
          <h3 className="text-lg font-bold text-[var(--text-primary)]">{t.resultTitle}</h3>
          <p className="text-sm text-[var(--text-muted)] font-medium">{candidate.name}</p>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-[var(--text-muted)]">
            Loading analysis results...
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            Error loading results: {error}
          </div>
        ) : (
          <div className="text-center py-8 text-[var(--text-muted)]">
            No analysis results available
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col items-center text-center mb-6">
        <div className="w-12 h-12 bg-green-50 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mb-4">
          <Trophy size={24} />
        </div>
        <h3 className="text-lg font-bold text-[var(--text-primary)]">{t.resultTitle}</h3>
        <p className="text-sm text-[var(--text-muted)] font-medium">
          {candidate.name} —{' '}
          <span className="text-[var(--accent)] font-bold">
            {typeof results.final_score === 'number'
              ? `${results.final_score.toFixed(1)}/100`
              : 'Processing...'}
          </span>
        </p>
      </div>

      {isLoading && (
        <div className="text-center py-4 text-[var(--text-muted)]">
          Refreshing data...
        </div>
      )}

      <div className="space-y-4 bg-[var(--bg-secondary)] p-5 rounded border border-[var(--border-light)] mb-6">
        <ScoreRow label="Content Relevance" value={results.content_relevance} />
        <ScoreRow label="Vocal Confidence" value={results.vocal_confidence} />
        <ScoreRow label="Clarity of Speech" value={results.clarity_of_speech} />
        <ScoreRow label="Fluency" value={results.fluency} />
      </div>

      <div className="p-4 bg-[var(--card-bg)] rounded border border-[var(--border-light)]">
        <p className="text-sm text-[var(--text-secondary)] italic">
          "{results.short_feedback}"
        </p>
      </div>
    </div>
  );
}