import { useState, useEffect } from 'react'; 
import { 
  X, 
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import ResultDisplay from './ResultModal';
export default function ProcessingModal({ isOpen, onClose, t, isDarkMode }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsFinished(false);
      setStepIndex(0);
      setProgress(0);

      const stepInterval = setInterval(() => {
        setStepIndex((prev) => (prev < t.steps.length - 1 ? prev + 1 : prev));
      }, 3000);

      const progressInterval = setInterval(() => {
        setProgress((prev) => {
            if (prev >= 100) {
              clearInterval(progressInterval);
              clearInterval(stepInterval);
              setTimeout(() => setIsFinished(true), 800);
              return 100;
            }
            // Faster progress initially, slower at the end
            const increment = prev < 80 ? Math.random() * 4 : Math.random() * 1.5;
            return Math.min(prev + increment, 100);
        });
      }, 300);

      return () => {
        clearInterval(stepInterval);
        clearInterval(progressInterval);
      };
    }
  }, [isOpen, t.steps.length]);

  if (!isOpen) return null;

  const bgColor = isDarkMode ? '#1f1f1f' : 'white';
  const borderColor = isDarkMode ? '#334155' : '#e2e8f0';
  const textColor = isDarkMode ? '#f1f5f9' : '#0f172a';
  const textSecondaryColor = isDarkMode ? '#cbd5e1' : '#64748b';
  const bgSecondaryColor = isDarkMode ? '#0f172a' : '#f8fafc';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div 
        className={`relative w-full max-w-md rounded-2xl shadow-2xl border overflow-hidden transition-all duration-500 ${isFinished ? 'max-h-[85vh]' : 'max-h-[500px]'}`}
        style={{ 
          backgroundColor: bgColor,
          borderColor: borderColor
        }}
      >
        
        {/* Header Controls */}
        <div className="p-1 flex justify-end">
          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
            style={{ 
              color: isDarkMode ? '#94a3b8' : '#94a3b8',
              '&:hover': {
                color: isDarkMode ? '#e2e8f0' : '#475569'
              }
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-8 pb-8">
          {!isFinished ? (
            <>
              <div className="flex flex-col items-center text-center mb-8">
                <div className="relative mb-6">
                    <div 
                      className="w-20 h-20 rounded-full border-4 flex items-center justify-center"
                      style={{ borderColor: isDarkMode ? '#1e293b' : '#f1f5f9' }}
                    >
                        <Loader2 size={32} className="text-blue-600 animate-spin" />
                    </div>
                    <div 
                      className="absolute -bottom-1 -right-1 p-1 rounded-full shadow-sm border"
                      style={{ 
                        backgroundColor: bgColor,
                        borderColor: borderColor
                      }}
                    >
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-[10px] font-bold text-white tabular-nums">{Math.floor(progress)}%</span>
                        </div>
                    </div>
                </div>
                
                <h3 
                  className="text-xl font-bold mb-2"
                  style={{ color: textColor }}
                >
                    {t.processing}
                </h3>
                <p 
                  className="text-sm max-w-[280px]"
                  style={{ color: textSecondaryColor }}
                >
                    {t.processingDesc}
                </p>
              </div>

              <div className="space-y-4">
                <div 
                  className="w-full h-2 rounded-full overflow-hidden"
                  style={{ backgroundColor: isDarkMode ? '#1e293b' : '#f1f5f9' }}
                >
                    <div 
                        className="h-full bg-blue-600 transition-all duration-300 ease-out shadow-[0_0_8px_rgba(37,99,235,0.4)]"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                <div className="pt-4 space-y-3">
                    {t.steps.map((step, idx) => {
                        const isDone = idx < stepIndex;
                        const isCurrent = idx === stepIndex;
                        const stepTextColor = isCurrent ? '#2563eb' : isDarkMode ? '#cbd5e1' : '#475569';
                        
                        return (
                            <div key={idx} className={`flex items-center gap-3 transition-all duration-500 ${isDone || isCurrent ? 'opacity-100' : 'opacity-30'}`}>
                                {isDone ? (
                                    <CheckCircle2 size={16} className="text-emerald-500" />
                                ) : isCurrent ? (
                                    <div className="w-4 h-4 flex items-center justify-center relative">
                                        <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-25" />
                                        <div className="w-2 h-2 bg-blue-600 rounded-full" />
                                    </div>
                                ) : (
                                    <div 
                                      className="w-4 h-4 rounded-full border-2"
                                      style={{ borderColor: isDarkMode ? '#475569' : '#cbd5e1' }}
                                    />
                                )}
                                <span 
                                  className="text-xs font-medium"
                                  style={{ color: stepTextColor }}
                                >
                                    {step.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
              </div>
            </>
          ) : (
            <ResultDisplay t={t} isDarkMode={isDarkMode} />
          )}
        </div>

        {/* Footer info or action */}
        {!isFinished ? (
          <div 
            className="px-8 py-4 flex justify-center border-t"
            style={{ 
              backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.5)' : '#f8fafc',
              borderColor: borderColor
            }}
          >
              <div className="flex items-center gap-2 text-[10px] font-medium tracking-wider uppercase">
                  <AlertCircle size={12} style={{ color: '#94a3b8' }} />
                  <span style={{ color: '#94a3b8' }}>Do not refresh this page</span>
              </div>
          </div>
        ) : (
          <div 
            className="px-8 py-4 flex justify-end border-t"
            style={{ 
              backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.5)' : '#f8fafc',
              borderColor: borderColor
            }}
          >
            <button 
              onClick={onClose}
              className="px-6 py-2 text-sm font-bold rounded-lg hover:opacity-90 transition-opacity"
              style={{ 
                backgroundColor: isDarkMode ? '#f1f5f9' : '#0f172a',
                color: isDarkMode ? '#0f172a' : '#f1f5f9'
              }}
            >
              {t.close}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}