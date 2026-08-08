import React from 'react';
import { motion } from 'framer-motion';

export const AIThinkingAnimation: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -4, scale: 0.95 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-center gap-3 px-4 py-3 rounded-2xl premium-glass border border-white/10 w-fit"
      role="status"
      aria-label="EchoAid X is thinking"
    >
      {/* Neural thinking rings */}
      <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
        {/* Ring 1 */}
        <div
          className="thinking-ring-1 absolute w-8 h-8 rounded-full border border-cyan-400/60"
          style={{ borderTopColor: 'transparent', borderRightColor: 'transparent' }}
        />
        {/* Ring 2 */}
        <div
          className="thinking-ring-2 absolute w-5 h-5 rounded-full border border-purple-400/60"
          style={{ borderTopColor: 'transparent', borderLeftColor: 'transparent' }}
        />
        {/* Center dot */}
        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#FCD34D]" />
      </div>

      {/* Animated dots + label */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono text-slate-300">
          🧠 Let me think
        </span>
        <div className="flex items-end gap-[3px] h-4">
          <div className="neural-dot-1 w-1 h-1 rounded-full bg-cyan-400 shadow-[0_0_4px_#00E5FF]" />
          <div className="neural-dot-2 w-1 h-1 rounded-full bg-purple-400 shadow-[0_0_4px_#A855F7]" />
          <div className="neural-dot-3 w-1 h-1 rounded-full bg-pink-400 shadow-[0_0_4px_#EC4899]" />
        </div>
      </div>

      {/* SVG neural network nodes */}
      <svg width="48" height="24" viewBox="0 0 48 24" className="opacity-60 shrink-0" aria-hidden="true">
        {/* Nodes */}
        <motion.circle
          cx="4" cy="12" r="2.5"
          fill="#00E5FF"
          animate={{ r: [2, 3.5, 2], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: 0 }}
        />
        <motion.circle
          cx="20" cy="6" r="2.5"
          fill="#A855F7"
          animate={{ r: [2, 3.5, 2], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
        />
        <motion.circle
          cx="20" cy="18" r="2.5"
          fill="#EC4899"
          animate={{ r: [2, 3.5, 2], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        />
        <motion.circle
          cx="44" cy="12" r="2.5"
          fill="#00E5FF"
          animate={{ r: [2, 3.5, 2], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: 0.7 }}
        />
        {/* Lines */}
        <motion.line
          x1="6" y1="12" x2="18" y2="6"
          stroke="#00E5FF" strokeWidth="0.8" strokeOpacity="0.4"
          animate={{ strokeOpacity: [0.2, 0.8, 0.2] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
        />
        <motion.line
          x1="6" y1="12" x2="18" y2="18"
          stroke="#A855F7" strokeWidth="0.8" strokeOpacity="0.4"
          animate={{ strokeOpacity: [0.2, 0.8, 0.2] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
        />
        <motion.line
          x1="22" y1="6" x2="42" y2="12"
          stroke="#EC4899" strokeWidth="0.8" strokeOpacity="0.4"
          animate={{ strokeOpacity: [0.2, 0.8, 0.2] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
        />
        <motion.line
          x1="22" y1="18" x2="42" y2="12"
          stroke="#A855F7" strokeWidth="0.8" strokeOpacity="0.4"
          animate={{ strokeOpacity: [0.2, 0.8, 0.2] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: 0.6 }}
        />
      </svg>
    </motion.div>
  );
};
