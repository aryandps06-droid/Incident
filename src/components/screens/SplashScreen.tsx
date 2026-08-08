import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield } from 'lucide-react';

export const SplashScreen: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  const [phase, setPhase] = useState<0 | 1 | 2 | 3>(0);

  useEffect(() => {
    // Phase 0 → 1: cyan pulse appears (200ms)
    const t1 = setTimeout(() => setPhase(1), 200);
    // Phase 1 → 2: logo fades in (600ms)
    const t2 = setTimeout(() => setPhase(2), 600);
    // Phase 2 → 3: caption appears (900ms)
    const t3 = setTimeout(() => setPhase(3), 900);
    // Done: splash exits (1400ms)
    const t4 = setTimeout(() => onDone(), 1500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [onDone]);

  return (
    <motion.div
      key="splash"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, filter: 'blur(12px)' }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#020617] overflow-hidden"
    >
      {/* Aurora bloom behind */}
      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={phase >= 1 ? { opacity: 0.35, scale: 1.4 } : {}}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="absolute top-0 left-0 w-[700px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 30% 0%, rgba(0,229,255,0.5) 0%, rgba(168,85,247,0.3) 50%, transparent 80%)',
          filter: 'blur(60px)',
        }}
      />

      {/* Center cyan pulse ring */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={phase >= 1 ? { opacity: [0, 0.6, 0], scale: [0, 1.8, 2.4] } : {}}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="absolute w-32 h-32 rounded-full border border-cyan-400/50 pointer-events-none"
      />

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: 12, filter: 'blur(8px)' }}
        animate={phase >= 2 ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center gap-4 relative z-10"
      >
        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-[#00E5FF]/10 border border-[#00E5FF]/40 flex items-center justify-center shadow-[0_0_40px_rgba(0,229,255,0.4)] backdrop-blur-xl">
          <Shield className="w-8 h-8 text-[#00E5FF]" />
        </div>

        {/* Wordmark */}
        <div className="text-center">
          <div className="text-3xl font-black tracking-tight text-white font-sans leading-none">
            EchoAid{' '}
            <span className="bg-gradient-to-r from-[#00E5FF] via-[#A855F7] to-[#D946EF] bg-clip-text text-transparent">
              X
            </span>
          </div>
          <div className="text-[10px] font-mono text-slate-500 tracking-[0.25em] uppercase mt-1.5">
            AI Emergency Companion
          </div>
        </div>
      </motion.div>

      {/* Caption */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={phase >= 3 ? { opacity: 1 } : {}}
        transition={{ duration: 0.5 }}
        className="absolute bottom-16 text-[11px] font-mono text-slate-500 tracking-[0.1em] flex items-center gap-2"
      >
        <span className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse" />
        Initializing AI Emergency Companion…
      </motion.div>
    </motion.div>
  );
};
