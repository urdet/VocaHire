import { useState, useEffect } from 'react';
import { Trophy } from 'lucide-react';
import ScoreRow from './ScoreRow';

export default function ResultDisplay({ t, candidate, interview_id }) {
  const [analysisData, setAnalysisData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (candidate?.analyzed && interview_id) {
      fetchAnalysisData();
    } else if (candidate?.results) {
      // Use the results passed from parent if available
      setAnalysisData(candidate.results);
    }
  }, [candidate, interview_id]);

  const fetchAnalysisData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Try to fetch by interview_id first
      let response = await fetch(`http://localhost:5000/base-v1/analysis/interview/${interview_id}`);
      
      if (!response.ok) {
        // If that fails, try the general endpoint with filter
        response = await fetch(`http://localhost:5000/base-v1/analysis/?interview_id=${interview_id}`);
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch analysis data');
      }
      
      const data = await response.json();
      // Handle both single object and array responses
      const analysis = Array.isArray(data) ? data[0] : data;
      
      if (analysis) {
        setAnalysisData({
          content_relevance: analysis.content_relevance,
          vocal_confidence: analysis.vocal_confidence,
          clarity_of_speech: analysis.clarity_of_speech,
          fluency: analysis.fluency,
          short_feedback: analysis.feedback || "No feedback available"
        });
      }
    } catch (error) {
      console.error('Error fetching analysis:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!candidate) return null;
  
  // Use either fetched analysis data or candidate results
  const results = analysisData || candidate.results;
  
  if (!results) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 bg-gray-50 dark:bg-gray-900/30 text-gray-600 rounded-full flex items-center justify-center mb-4">
            <Trophy size={24} />
          </div>
          <h3 className="text-lg font-bold text-[var(--text-primary)]">{t.resultTitle}</h3>
          <p className="text-sm text-[var(--text-muted)] font-medium">
            {candidate.name}
          </p>
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
          {candidate.name} — <span className="text-[var(--accent)] font-bold">{parseFloat(candidate.totalScore)?.toFixed(1) || '0.0'}/10</span>
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
        <p className="text-sm text-[var(--text-secondary)] italic">"{results.short_feedback}"</p>
      </div>
    </div>
  );
}