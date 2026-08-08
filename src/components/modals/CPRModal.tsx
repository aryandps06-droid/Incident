import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useEmergency } from '../../context/EmergencyContext';
import { HeartPulse, X, Volume2, VolumeX } from 'lucide-react';

export const CPRModal: React.FC = () => {
  const { activeModal, setActiveModal } = useEmergency();
  const [cprCount, setCprCount] = useState(0);
  const [isPulse, setIsPulse] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const audioCtxRef = useRef<AudioContext | null>(null);

  const playBeatSound = () => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 1000;
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (activeModal !== 'cpr') return;
    const interval = setInterval(() => {
      setIsPulse(true);
      playBeatSound();
      setCprCount((c) => c + 1);
      setTimeout(() => setIsPulse(false), 150);
    }, 545); // 110 BPM

    return () => clearInterval(interval);
  }, [activeModal, soundEnabled]);

  if (activeModal !== 'cpr') return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-2xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-command-card border border-cyber-red/50 rounded-2xl p-6 space-y-6 shadow-glow-red"
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyber-red/20 border border-cyber-red/40 text-cyber-red">
              <HeartPulse className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-sans">AHA CPR 110 BPM Audio Guide</h3>
              <div className="text-xs font-mono text-cyber-red">American Heart Association 2026 Spec</div>
            </div>
          </div>
          <button
            onClick={() => setActiveModal('none')}
            className="p-2 rounded-xl bg-command-surface text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CPR Metronome Visualizer Ring */}
        <div className="py-8 flex flex-col items-center justify-center space-y-6">
          <motion.div
            animate={{ scale: isPulse ? 1.3 : 1 }}
            transition={{ duration: 0.1 }}
            className={`w-36 h-36 rounded-full flex flex-col items-center justify-center border-4 ${
              isPulse 
                ? 'bg-cyber-red border-white shadow-[0_0_50px_rgba(255,59,48,0.9)] text-white' 
                : 'bg-command-surface border-cyber-red/40 text-cyber-red'
            }`}
          >
            <span className="text-4xl font-extrabold font-mono">{cprCount}</span>
            <span className="text-[10px] font-mono uppercase tracking-widest font-bold">PRESS HARD</span>
          </motion.div>

          <div className="text-center space-y-1 font-mono text-xs">
            <div className="text-white font-bold">Pace: 110 Compressions Per Minute</div>
            <div className="text-slate-400">Target Depth: 2.0 to 2.4 inches into chest center</div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="px-4 py-2 rounded-xl bg-command-surface border border-slate-700 text-xs font-mono text-slate-300 flex items-center gap-2"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-cyber-cyan" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            <span>{soundEnabled ? 'Metronome Audio ON' : 'Muted'}</span>
          </button>

          <button
            onClick={() => setActiveModal('none')}
            className="px-6 py-2.5 rounded-xl bg-cyber-red text-white font-bold text-xs shadow-glow-red"
          >
            Close Guide
          </button>
        </div>

      </motion.div>
    </div>
  );
};
