import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Radio, Terminal, Cpu, ShieldCheck } from 'lucide-react';

export const SplashScreen: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  const [phase, setPhase] = useState<0 | 1 | 2 | 3>(0);

  useEffect(() => {
    // Phase 0 → 1: cyan radar pulse appears (200ms)
    const t1 = setTimeout(() => setPhase(1), 200);
    // Phase 1 → 2: commander logo & telemetry fade in (600ms)
    const t2 = setTimeout(() => setPhase(2), 600);
    // Phase 2 → 3: status caption appears (1000ms)
    const t3 = setTimeout(() => setPhase(3), 1000);
    // Done: splash exits cleanly after 2.6 seconds (2600ms)
    const t4 = setTimeout(() => onDone(), 2600);
    return () => { 
      clearTimeout(t1); 
      clearTimeout(t2); 
      clearTimeout(t3); 
      clearTimeout(t4); 
    };
  }, [onDone]);

  return (
    <motion.div
      key="splash"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, filter: 'blur(16px)' }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#020305] text-slate-100 font-sans select-none overflow-hidden"
    >
      {/* Aurora Ambient Glow */}
      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={phase >= 1 ? { opacity: 0.4, scale: 1.3 } : {}}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        className="absolute w-[800px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, rgba(0,217,255,0.4) 0%, rgba(99,102,241,0.25) 45%, rgba(168,85,247,0.15) 65%, transparent 80%)',
          filter: 'blur(80px)',
        }}
      />

      {/* Coordinate Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 217, 255, 0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 217, 255, 0.25) 1px, transparent 1px)`,
          backgroundSize: '36px 36px'
        }}
      />

      {/* Center Radar Expanding Rings */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={phase >= 1 ? { opacity: [0, 0.7, 0], scale: [0.2, 1.8, 2.8] } : {}}
        transition={{ duration: 0.9, ease: 'easeOut' }}
        className="absolute w-44 h-44 rounded-full border border-cyan-400/60 pointer-events-none"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={phase >= 1 ? { opacity: [0, 0.5, 0], scale: [0.4, 2.2, 3.4] } : {}}
        transition={{ duration: 1.1, ease: 'easeOut', delay: 0.15 }}
        className="absolute w-44 h-44 rounded-full border border-purple-400/40 pointer-events-none"
      />

      {/* Commander Brand & Core Telemetry */}
      <motion.div
        initial={{ opacity: 0, y: 14, filter: 'blur(8px)' }}
        animate={phase >= 2 ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center gap-4 relative z-10"
      >
        {/* Commander Icon Badge */}
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 via-blue-600/30 to-indigo-600/20 border border-cyan-400/50 flex items-center justify-center shadow-[0_0_50px_rgba(0,217,255,0.45)] backdrop-blur-2xl">
            <Radio className="w-8 h-8 text-cyan-300 animate-pulse" />
          </div>
          <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#040711] border border-emerald-400/60 flex items-center justify-center">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
          </div>
        </div>

        {/* Wordmark */}
        <div className="text-center flex flex-col items-center">
          <div className="flex items-center gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-sans">
              EchoAid <span className="text-cyan-400">X</span>
            </span>
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
              COMMANDER v2.5
            </span>
          </div>
          <div className="text-[10px] font-mono text-cyan-300/90 tracking-[0.25em] uppercase mt-1 flex items-center gap-1.5">
            <Terminal className="w-3 h-3 text-cyan-400" />
            <span>Real-Time AI Incident Commander</span>
          </div>
        </div>
      </motion.div>

      {/* Live Initializing Pipeline Caption */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={phase >= 3 ? { opacity: 1 } : {}}
        transition={{ duration: 0.4 }}
        className="absolute bottom-12 text-[10.5px] font-mono text-slate-400 tracking-[0.08em] flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
        </span>
        <span>Initializing Real-Time Incident War Room Engine…</span>
        <span className="text-slate-600">&bull;</span>
        <span className="text-cyan-300 font-bold flex items-center gap-1">
          <Cpu className="w-3 h-3 text-cyan-400" /> 48kHz PCM
        </span>
      </motion.div>
    </motion.div>
  );
};
