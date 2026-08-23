import { AlertCircle, CheckCircle2, Clock, FileAudio, Loader2, Mic, Sparkles, UserRound } from 'lucide-react';
import ResultDisplay from './ResultDisplay';

const pipelineSteps = [
  {
    key: 'queued',
    title: 'Job preparation',
    detail: 'Load interview, audio and session context',
    icon: <Clock size={16} />
  },
  {
    key: 'uploading',
    title: 'Audio upload',
    detail: 'Store and normalize the interview file',
    icon: <FileAudio size={16} />
  },
  {
    key: 'diarization',
    title: 'Speaker separation',
    detail: 'Detect interviewer and candidate turns',
    icon: <UserRound size={16} />
  },
  {
    key: 'transcription',
    title: 'Whisper transcription',
    detail: 'Convert speech into candidate transcript',
    icon: <Mic size={16} />
  },
  {
    key: 'alignment',
    title: 'Candidate extraction',
    detail: 'Match transcript text with candidate turns',
    icon: <UserRound size={16} />
  },
  {
    key: 'evaluation',
    title: 'AI evaluation',
    detail: 'Score clarity, confidence, fluency and relevance',
    icon: <Sparkles size={16} />
  },
  {
    key: 'saving',
    title: 'Saving results',
    detail: 'Persist scores, transcript and feedback',
    icon: <CheckCircle2 size={16} />
  },
  {
    key: 'finalizing',
    title: 'Report finalization',
    detail: 'Save scores and prepare the result view',
    icon: <CheckCircle2 size={16} />
  }
];

export default function ProcessingModal({ isOpen, onClose, t, candidate }) {
  if (!isOpen) return null;

  const isFinished = !!candidate?.analyzed;
  const isFailed = candidate?.status === 'failed' || candidate?.processing?.phase === 'failed';
  const isRunning = !isFinished && !isFailed;
  const processing = candidate?.processing || {};
  const progress = isFinished || isFailed ? 100 : Math.min(96, Math.max(8, Number(processing.progress) || 18));
  const elapsedSeconds = Math.max(0, Math.floor((processing.elapsedMs || 0) / 1000));
  const lastUpdate = processing.updatedAt
    ? new Date(processing.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : null;

  const activeStepIndex = isFinished
    ? pipelineSteps.length
    : isFailed
      ? Math.max(0, pipelineSteps.findIndex((step) => step.key === processing.phase))
      : Math.max(0, pipelineSteps.findIndex((step) => step.key === processing.phase));

  const closeModal = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4">
      <div
        className="absolute inset-0 bg-[var(--modal-overlay)] backdrop-blur-[3px]"
        onClick={closeModal}
      />
      <div className="relative flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-[var(--border-light)] bg-[var(--card-bg)] shadow-2xl">
        <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
          {!isFinished ? (
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className={`relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${
                  isFailed ? 'bg-red-100 text-red-600' : 'bg-[var(--accent-soft)] text-[var(--accent)]'
                }`}>
                  {isFailed ? <AlertCircle size={28} /> : <Loader2 className="animate-spin" size={28} />}
                  {!isFailed && (
                    <span className="absolute inset-0 rounded-2xl border border-[var(--accent)] opacity-30 animate-ping" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-xl font-bold text-[var(--text-primary)]">
                      {isFailed ? 'Analysis failed' : t.processing}
                    </h3>
                    <span className="rounded-full bg-[var(--bg-secondary)] px-3 py-1 text-[10px] font-black text-[var(--accent)]">
                      {Math.floor(progress)}%
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-medium text-[var(--text-secondary)]">
                    {candidate?.name || 'Candidate'}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
                    {processing.message ||
                      'VocaHire is processing the interview. This can take several minutes on CPU.'}
                  </p>
                  {processing.detail && (
                    <p className="mt-2 rounded-lg bg-[var(--bg-secondary)] px-3 py-2 text-[11px] leading-5 text-[var(--text-secondary)]">
                      {processing.detail}
                    </p>
                  )}
                </div>
              </div>

              <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--bg-tertiary)]">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    isFailed
                      ? 'bg-red-500'
                      : 'bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-400'
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="max-h-[38vh] space-y-2 overflow-y-auto pr-1">
                {pipelineSteps.map((step, index) => {
                  const isDone = index < activeStepIndex || isFinished;
                  const isActive = index === activeStepIndex && isRunning;

                  return (
                  <div
                    key={step.key}
                    className={`rounded-xl border p-2.5 transition ${
                      isActive
                        ? 'border-[var(--accent)] bg-[var(--accent-soft)]/40'
                        : isDone
                          ? 'border-emerald-200 bg-emerald-50/70'
                          : 'border-[var(--border-light)] bg-[var(--bg-secondary)]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                        isDone
                          ? 'bg-emerald-500 text-white'
                          : isActive
                            ? 'bg-[var(--accent)] text-white'
                            : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)]'
                      }`}>
                        {isDone ? <CheckCircle2 size={16} /> : isActive ? <Loader2 className="animate-spin" size={16} /> : step.icon}
                      </div>
                      <div className="min-w-0">
                        <div className={`text-xs font-black ${
                          isActive ? 'text-[var(--accent)]' : 'text-[var(--text-primary)]'
                        }`}>
                          {step.title}
                        </div>
                        <div className="mt-0.5 text-[11px] text-[var(--text-muted)]">
                          {step.detail}
                        </div>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>

              <div className="flex items-start gap-2 rounded-xl bg-[var(--bg-secondary)] px-4 py-3 text-xs text-[var(--text-muted)]">
                <Clock className="mt-0.5 shrink-0" size={14} />
                <span>
                  {isFailed
                    ? 'The backend marked this analysis as failed. Upload again or retry after checking the logs.'
                    : `Running in backend${elapsedSeconds > 0 ? ` for ${elapsedSeconds}s` : ''}${lastUpdate ? ` · last update ${lastUpdate}` : ''}. You can hide this window; the candidate card will keep showing progress.`}
                </span>
              </div>
            </div>
          ) : (
            <ResultDisplay
              t={t}
              candidate={candidate}
              interview_id={candidate?.interview_id}
            />
          )}
        </div>

        <div className="flex shrink-0 items-center justify-between gap-4 border-t border-[var(--border-light)] bg-[var(--bg-secondary)] p-4">
          <p className="text-[11px] text-[var(--text-muted)]">
            {isRunning ? 'The analysis continues in the background after closing.' : ''}
          </p>
          <button
            onClick={closeModal}
            className={`px-4 py-1.5 rounded text-xs font-semibold ${
              isRunning
                ? 'bg-[var(--accent)] text-white hover:opacity-90'
                : 'bg-[var(--text-primary)] text-[var(--bg-primary)]'
            }`}
          >
            {isRunning ? 'Hide modal' : t.close}
          </button>
        </div>
      </div>
    </div>
  );
}
