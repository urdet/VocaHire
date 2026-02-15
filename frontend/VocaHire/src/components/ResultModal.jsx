import { CheckCircle2, BarChart3, MessageSquare } from 'lucide-react';

export default function ResultDisplay({ t, isDarkMode }) {
  // Mocking the required format data
  const result = {
    "content_relevance": 0.85,
    "vocal_confidence": 0.92,
    "clarity_of_speech": 0.88,
    "fluency": 0.79,
    "short_feedback": "The candidate demonstrated high technical proficiency and clear articulation, though some responses lacked specific architectural examples."
  };

  const ScoreRow = ({ label, value }) => {
    const textColor = isDarkMode ? '#cbd5e1' : '#475569';
    const bgColor = isDarkMode ? '#1e293b' : '#f1f5f9';
    
    return (
      <div className="space-y-1">
        <div className="flex justify-between text-[11px] font-bold uppercase tracking-tight">
          <span style={{ color: textColor }}>{label.replace(/_/g, ' ')}</span>
          <span className="text-blue-600" style={{ color: '#2563eb' }}>{(value * 10).toFixed(1)}/10</span>
        </div>
        <div 
          className="w-full h-1.5 rounded-full overflow-hidden"
          style={{ backgroundColor: bgColor }}
        >
          <div 
            className="h-full bg-blue-500 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${value * 100}%` }}
          />
        </div>
      </div>
    );
  };

  const textColor = isDarkMode ? '#f1f5f9' : '#0f172a';
  const textSecondaryColor = isDarkMode ? '#cbd5e1' : '#64748b';
  const bgSecondaryColor = isDarkMode ? 'rgba(15, 23, 42, 0.4)' : '#f8fafc';
  const borderColor = isDarkMode ? '#334155' : '#e2e8f0';
  const bgBlueColor = isDarkMode ? 'rgba(30, 58, 138, 0.1)' : 'rgba(219, 234, 254, 0.5)';
  const borderBlueColor = isDarkMode ? 'rgba(30, 64, 175, 0.3)' : 'rgba(191, 219, 254, 0.5)';
  const emeraldBgColor = isDarkMode ? 'rgba(6, 78, 59, 0.2)' : 'rgba(209, 250, 229, 1)';

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col items-center text-center mb-6">
        <div 
          className="w-16 h-16 text-emerald-500 rounded-full flex items-center justify-center mb-4"
          style={{ backgroundColor: emeraldBgColor }}
        >
          <CheckCircle2 size={32} />
        </div>
        <h3 
          className="text-xl font-bold"
          style={{ color: textColor }}
        >
          {t.resultTitle}
        </h3>
        <p 
          className="text-xs mt-1 px-4"
          style={{ color: textSecondaryColor }}
        >
          {t.resultDesc}
        </p>
      </div>

      <div 
        className="space-y-4 p-5 rounded-xl border mb-6"
        style={{ 
          backgroundColor: bgSecondaryColor,
          borderColor: borderColor
        }}
      >
        <div className="flex items-center gap-2 mb-2 font-bold text-sm">
          <BarChart3 size={16} style={{ color: '#3b82f6' }} />
          <span style={{ color: textColor }}>Metrics Summary</span>
        </div>
        <ScoreRow label="content_relevance" value={result.content_relevance} isDarkMode={isDarkMode} />
        <ScoreRow label="vocal_confidence" value={result.vocal_confidence} isDarkMode={isDarkMode} />
        <ScoreRow label="clarity_of_speech" value={result.clarity_of_speech} isDarkMode={isDarkMode} />
        <ScoreRow label="fluency" value={result.fluency} isDarkMode={isDarkMode} />
      </div>

      <div 
        className="p-5 rounded-xl border"
        style={{ 
          backgroundColor: bgBlueColor,
          borderColor: borderBlueColor
        }}
      >
        <div className="flex items-center gap-2 mb-2 font-bold text-sm">
          <MessageSquare size={16} style={{ color: isDarkMode ? '#60a5fa' : '#1d4ed8' }} />
          <span style={{ color: isDarkMode ? '#60a5fa' : '#1d4ed8' }}>AI Feedback</span>
        </div>
        <p 
          className="text-sm italic leading-relaxed"
          style={{ color: textSecondaryColor }}
        >
          "{result.short_feedback}"
        </p>
      </div>
    </div>
  );
}