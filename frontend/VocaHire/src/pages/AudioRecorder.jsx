import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from "react-router-dom";
import { useParams } from "react-router-dom";
import { 
  Square, 
  RotateCcw, 
  ChevronRight, 
  Trophy, 
  XCircle, 
  GripVertical,
  Play,
  RotateCw
} from 'lucide-react';

const AudioRecorder = () => {
  const { id } = useParams();
  const location = useLocation();
  const { candidates_list } = location.state;

  const [view, setView] = useState('setup'); // setup, recording, summary
const [candidates, setCandidates] = useState(
    candidates_list
        ? candidates_list.map(c => ({
                id: c.id_candidate,
                name: c.name
            }))
        : [
                { id: '1', name: 'ALEX RIVERA' },
                { id: '2', name: 'SARAH CHEN' },
                { id: '3', name: 'MARCUS VANCE' },
                { id: '4', name: 'ELARA VOSS' }
            ]
);
  const [currentCandidateIndex, setCurrentCandidateIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [time, setTime] = useState(0);
  const timerRef = useRef(null);

  // Drag and Drop Logic (Simple State Swap)
  const [draggedItemIndex, setDraggedItemIndex] = useState(null);

  const onDragStart = (e, index) => {
    setDraggedItemIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = (e, index) => {
    e.preventDefault();
    if (draggedItemIndex === null || draggedItemIndex === index) return;
    
    const newItems = [...candidates];
    const item = newItems[draggedItemIndex];
    newItems.splice(draggedItemIndex, 1);
    newItems.splice(index, 0, item);
    
    setDraggedItemIndex(index);
    setCandidates(newItems);
  };

  // Timer Logic
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startSession = () => {
    if (candidates.length > 0) {
      setView('recording');
      setCurrentCandidateIndex(0);
      setTime(0);
      setIsRecording(false);
    }
  };

  const nextCandidate = () => {
    setIsRecording(false);
    if (currentCandidateIndex < candidates.length - 1) {
      setCurrentCandidateIndex(prev => prev + 1);
      setTime(0);
    } else {
      setView('summary');
    }
  };

  // --- UI Components ---
  const TacticalButton = ({ children, onClick, variant = 'primary', className = '' }) => {
    const variants = {
      primary: 'bg-blue-600 hover:bg-blue-500 text-white border-b-2 border-blue-800 active:border-b-0 active:translate-y-[2px]',
      danger: 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-b-2 border-slate-950 active:border-b-0 active:translate-y-[2px]',
      record: isRecording 
        ? 'bg-red-600 hover:bg-red-500 text-white border-b-2 border-red-900 animate-pulse' 
        : 'bg-blue-600 hover:bg-blue-500 text-white border-b-2 border-blue-900'
    };
    return (
      <button 
        onClick={onClick}
        className={`px-4 py-1.5 rounded-sm font-bold transition-all flex items-center justify-center gap-2 uppercase tracking-tighter text-[10px] ${variants[variant]} ${className}`}
      >
        {children}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-blue-100 font-mono selection:bg-blue-500/30 overflow-hidden flex flex-col">
      
      {/* BACKGROUND GRID */}
      <div className="fixed inset-0 pointer-events-none opacity-10" 
           style={{ backgroundImage: 'linear-gradient(#1e3a8a 1px, transparent 1px), linear-gradient(90deg, #1e3a8a 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <main className="relative z-10 flex-1 flex flex-col p-6 max-w-2xl mx-auto w-full">
        
        {/* SETUP VIEW */}
        {view === 'setup' && (
          <section className="flex-1 flex flex-col animate-in fade-in duration-300">
            <div className="mb-6">
              <h2 className="text-xs font-bold text-blue-500 tracking-[0.3em] uppercase mb-1">Queue Configuration for session id: #{id}</h2>
              <p className="text-[10px] text-blue-900 uppercase">Rearrange manifest priority via drag-drop</p>
            </div>

            <div className="flex-1 space-y-[2px] overflow-y-auto mb-6">
              {candidates.map((c, idx) => (
                <div 
                  key={c.id} 
                  draggable
                  onDragStart={(e) => onDragStart(e, idx)}
                  onDragOver={(e) => onDragOver(e, idx)}
                  onDragEnd={() => setDraggedItemIndex(null)}
                  className={`flex items-center justify-between p-4 bg-blue-950/20 border-l-2 border-blue-900/50 hover:bg-blue-900/20 transition-colors cursor-grab active:cursor-grabbing ${draggedItemIndex === idx ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <GripVertical size={14} className="text-blue-900" />
                    <span className="text-blue-900 text-[10px]">{(idx + 1).toString().padStart(2, '0')}</span>
                    <span className="font-bold tracking-tight text-blue-100">{c.name}</span>
                  </div>
                  <div className="w-2 h-2 bg-blue-900/20" />
                </div>
              ))}
            </div>

            <TacticalButton onClick={startSession} className="w-full py-4 text-sm">
              Launch Session <ChevronRight size={16} />
            </TacticalButton>
          </section>
        )}

        {/* RECORDING VIEW */}
        {view === 'recording' && (
          <section className="flex-1 flex flex-col animate-in fade-in duration-300">
            {/* NAME TOP */}
            <div className="text-center pt-4">
              <span className="text-[10px] text-blue-500 tracking-[0.4em] uppercase">Target Identification</span>
              <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter mt-2 leading-none">
                {candidates[currentCandidateIndex]?.name}
              </h2>
            </div>

            {/* CENTER CONTROLS */}
            <div className="flex-1 flex flex-col items-center justify-center gap-12">
              <div className="text-center">
                <div className="text-[10px] text-blue-900 uppercase mb-4 tracking-widest">Elapsed Time</div>
                <div className={`text-8xl md:text-9xl font-black tracking-tighter tabular-nums leading-none ${isRecording ? 'text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.3)]' : 'text-blue-500'}`}>
                  {formatTime(time)}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <TacticalButton 
                  onClick={() => setIsRecording(!isRecording)} 
                  variant="record"
                  className="w-48 py-4 text-xs"
                >
                  {isRecording ? <><Square size={14} fill="currentColor"/> STOP</> : <><Play size={14} fill="currentColor"/> RECORD</>}
                </TacticalButton>

                <TacticalButton 
                  onClick={() => { setIsRecording(false); setTime(0); }} 
                  variant="danger"
                  className="px-6 py-4"
                >
                  <RotateCw size={14} /> CLEAR
                </TacticalButton>
              </div>
            </div>

            {/* NEXT BOTTOM */}
            <div className="pb-4">
              <TacticalButton onClick={nextCandidate} className="w-full py-6 text-sm">
                {currentCandidateIndex === candidates.length - 1 ? 'COMPLETE LOG' : 'NEXT CANDIDATE'} 
                <ChevronRight size={18} />
              </TacticalButton>
            </div>
          </section>
        )}

        {/* SUMMARY VIEW */}
        {view === 'summary' && (
          <section className="flex-1 flex flex-col items-center justify-center text-center space-y-8 animate-in zoom-in duration-300">
            <div className="border border-blue-900 p-12 w-full max-w-sm">
              <Trophy size={48} className="mx-auto text-blue-500 mb-6" />
              <h2 className="text-2xl font-black uppercase tracking-tighter mb-2">Manifest Finalized</h2>
              <p className="text-[10px] text-blue-900 uppercase tracking-widest leading-relaxed mb-8">
                All audio streams have been indexed and synchronized to the central core.
              </p>
              
              <div className="space-y-3">
                <TacticalButton onClick={() => setView('setup')} variant="primary" className="w-full py-4">
                  New Sequence
                </TacticalButton>
                <TacticalButton onClick={() => window.location.reload()} variant="danger" className="w-full py-4">
                  <XCircle size={14} /> Exit System
                </TacticalButton>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* FOOTER STRIPE */}
      <footer className="h-1 bg-blue-900/30 w-full relative">
        <div className={`h-full bg-blue-600 transition-all duration-500 ease-out`} 
             style={{ width: `${((currentCandidateIndex + (view === 'summary' ? 1 : 0)) / candidates.length) * 100}%` }} />
      </footer>
    </div>
  );
};

export default AudioRecorder;