import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEmergency } from '../../context/EmergencyContext';
import { Mic, Sparkles, BrainCircuit } from 'lucide-react';
import { VoiceWaveform } from './VoiceWaveform';

export const AIOrb: React.FC = () => {
  const { isListening, isSpeaking, isAnalyzing, isUserSpeaking, isAISpeaking, screenState, startConversation, stopVoice } = useEmergency();
  
  const [isHovered, setIsHovered] = useState(false);
  const [ripples, setRipples] = useState<Array<{ id: number }>>([]);

  const isActiveState = isListening || isSpeaking || isAnalyzing || isUserSpeaking || isAISpeaking;

  const handleOrbClick = () => {
    const newRipple = { id: Date.now() };
    setRipples((prev) => [...prev.slice(-3), newRipple]);

    if (isActiveState) {
      stopVoice();
    } else {
      startConversation();
    }
  };

  // Humanized labels based on Next-Generation UX
  const primaryText = isUserSpeaking || isListening
    ? "👂 I'm listening..." 
    : isAnalyzing
      ? "🧠 Let me think..."
      : isAISpeaking || isSpeaking 
        ? "✨ Speaking..." 
        : screenState !== 'landing' 
          ? "Voice Session Active" 
          : "Tap or speak to begin";

  // Color mapping
  const activeColorStr = (isUserSpeaking || isListening) 
    ? '#3B82F6' // Blue
    : isAnalyzing 
      ? '#A855F7' // Purple
      : (isAISpeaking || isSpeaking)
        ? '#00E5FF' // Cyan
        : '#00E5FF';

  return (
    <div className="flex flex-col items-center justify-center space-y-1.5 py-0">
      {/* Top Status Chip */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border backdrop-blur-xl transition-colors duration-500 ${
          isAnalyzing ? 'border-purple-400/30 shadow-[0_0_12px_rgba(168,85,247,0.2)]' :
          (isUserSpeaking || isListening) ? 'border-blue-400/30 shadow-[0_0_12px_rgba(59,130,246,0.2)]' :
          'border-cyan-400/30 shadow-[0_0_12px_rgba(0,229,255,0.2)]'
        }`}
      >
        <span className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
            isAnalyzing ? 'bg-purple-400' : (isUserSpeaking || isListening) ? 'bg-blue-400' : 'bg-cyan-400'
          }`} />
          <span className={`relative inline-flex rounded-full h-2 w-2 ${
            isAnalyzing ? 'bg-purple-400' : (isUserSpeaking || isListening) ? 'bg-blue-400' : 'bg-cyan-400'
          }`} />
        </span>
        <span className={`text-[10px] font-mono font-bold tracking-[0.2em] uppercase transition-colors duration-500 ${
          isAnalyzing ? 'text-purple-300' : (isUserSpeaking || isListening) ? 'text-blue-300' : 'text-cyan-300'
        }`}>
          AI VOICE CORE
        </span>
      </motion.div>

      {/* Main Holographic 3-Layer Orb Stage */}
      <div 
        className="relative flex items-center justify-center cursor-pointer group select-none my-1" 
        onClick={handleOrbClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        role="button"
        aria-label="Interactive AI Voice Core"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleOrbClick()}
      >
        {/* Soft Spotlight Glow Behind Component */}
        <div className="absolute w-44 h-44 sm:w-56 sm:h-56 rounded-full bg-radial-vignette opacity-85 pointer-events-none" />

        {/* Ambient Bloom */}
        <motion.div
          animate={{
            scale: isAISpeaking ? [1, 1.25, 1] : isUserSpeaking ? [1, 1.2, 1] : isHovered ? 1.15 : [1, 1.06, 1],
            opacity: isActiveState ? [0.75, 0.95, 0.75] : isHovered ? 0.85 : [0.45, 0.65, 0.45],
            background: `radial-gradient(circle, ${activeColorStr}80 0%, transparent 70%)`
          }}
          transition={{ duration: isAISpeaking ? 1.2 : isUserSpeaking ? 1.5 : 3.5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute w-40 h-40 sm:w-48 sm:h-48 rounded-full blur-[36px] pointer-events-none"
        />

        {/* Dynamic Expanding Shockwave Ripples */}
        <AnimatePresence>
          {ripples.map((r) => (
            <motion.div
              key={r.id}
              initial={{ scale: 0.7, opacity: 0.9 }}
              animate={{ scale: 2.1, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
              className="absolute w-36 h-36 rounded-full border-2 pointer-events-none shadow-[0_0_25px_rgba(0,229,255,0.6)]"
              style={{ borderColor: activeColorStr }}
            />
          ))}
        </AnimatePresence>

        {/* LAYER 1: OUTER ENERGY RING */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: isUserSpeaking ? 6 : isAISpeaking ? 4 : isHovered ? 8 : 12, repeat: Infinity, ease: 'linear' }}
          className="relative w-32 h-32 lg:w-36 lg:h-36 rounded-full p-[2px] pointer-events-none flex items-center justify-center transition-all duration-700"
          style={{
            background: `conic-gradient(from 0deg, ${activeColorStr}, rgba(255,255,255,0.1), ${activeColorStr})`,
            boxShadow: `0 0 25px ${activeColorStr}40`
          }}
        >
          <div className="w-full h-full rounded-full bg-[#03050F]/80 backdrop-blur-2xl relative">
            {/* Tiny Orbiting Light Particles */}
            <div className={`w-2 h-2 rounded-full absolute -top-1 left-1/2 -translate-x-1/2 animate-pulse ${
              isAnalyzing ? 'bg-purple-300 shadow-[0_0_12px_#A855F7]' : (isUserSpeaking || isListening) ? 'bg-blue-300 shadow-[0_0_12px_#3B82F6]' : 'bg-cyan-300 shadow-[0_0_12px_#00E5FF]'
            }`} />
            <div className={`w-1.5 h-1.5 rounded-full absolute -bottom-1 left-1/2 -translate-x-1/2 ${
              isAnalyzing ? 'bg-purple-300 shadow-[0_0_12px_#A855F7]' : (isUserSpeaking || isListening) ? 'bg-blue-300 shadow-[0_0_12px_#3B82F6]' : 'bg-cyan-300 shadow-[0_0_12px_#00E5FF]'
            }`} />
          </div>
        </motion.div>

        {/* LAYER 2: GLASS SHELL */}
        <motion.div
          animate={{ scale: isHovered ? 1.04 : 1 }}
          transition={{ duration: 0.3 }}
          className="absolute w-24 h-24 lg:w-28 lg:h-28 rounded-full backdrop-blur-[24px] border-2 border-white/20 bg-gradient-to-br from-cyan-950/60 via-[#070C1E]/90 to-[#03050F] shadow-[inset_0_2px_12px_rgba(255,255,255,0.15),0_15px_40px_rgba(0,0,0,0.8)] flex items-center justify-center overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white/15 via-transparent to-transparent pointer-events-none" />
          <div className="animate-glass-reflection absolute inset-0 w-full h-full rounded-full bg-gradient-to-r from-transparent via-cyan-300/20 to-transparent pointer-events-none" />

          {/* LAYER 3: AI CORE */}
          <motion.div
            animate={{
              scale: isAISpeaking ? [1, 1.12, 1] : isAnalyzing ? [1, 1.05, 1] : isUserSpeaking ? [1, 1.08, 1] : [1, 1.03, 1],
              boxShadow: isAnalyzing
                ? ['0 0 25px rgba(168,85,247,0.7)', '0 0 45px rgba(168,85,247,0.9)', '0 0 25px rgba(168,85,247,0.7)']
                : isUserSpeaking || isListening
                  ? ['0 0 25px rgba(59,130,246,0.7)', '0 0 45px rgba(59,130,246,0.9)', '0 0 25px rgba(59,130,246,0.7)']
                  : isAISpeaking || isSpeaking
                    ? ['0 0 20px rgba(0,229,255,0.4)', '0 0 35px rgba(0,229,255,0.7)', '0 0 20px rgba(0,229,255,0.4)']
                    : ['0 0 15px rgba(255,255,255,0.1)', '0 0 20px rgba(255,255,255,0.2)', '0 0 15px rgba(255,255,255,0.1)']
            }}
            transition={{ duration: isAISpeaking || isUserSpeaking ? 1.2 : 3, repeat: Infinity, ease: 'easeInOut' }}
            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex flex-col items-center justify-center transition-colors duration-700 ${
              isAnalyzing 
                ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white'
                : isUserSpeaking || isListening
                  ? 'bg-gradient-to-br from-blue-500 to-cyan-600 text-white'
                  : isAISpeaking || isSpeaking
                    ? 'bg-gradient-to-br from-cyan-400 to-teal-500 text-white'
                    : 'bg-gradient-to-br from-slate-700 to-slate-900 text-slate-300'
            }`}
          >
            {/* Inner Icon */}
            <motion.div
              animate={{ y: [-1, 1, -1] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              className="flex items-center justify-center"
            >
              {isAnalyzing ? (
                <BrainCircuit className="w-7 h-7 sm:w-8 sm:h-8 text-white animate-pulse drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]" />
              ) : isAISpeaking || isSpeaking ? (
                <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-white animate-pulse drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]" />
              ) : (
                <Mic className={`w-7 h-7 sm:w-8 sm:h-8 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] ${isActiveState ? 'text-white' : 'text-slate-400'}`} />
              )}
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Real Holographic Audio Waveform Section */}
      <div className="w-full max-w-[280px] h-8 flex items-center justify-center px-2">
        <VoiceWaveform 
          active={isActiveState} 
          color={activeColorStr} 
          barCount={24} 
          height={24} 
        />
      </div>

      {/* Typography Labels Below Orb */}
      <div className="text-center space-y-0.5">
        <motion.div 
          key={primaryText}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm sm:text-[15px] font-sans font-semibold text-white tracking-wide"
          style={{ textShadow: `0 0 12px ${activeColorStr}99` }}
        >
          {primaryText}
        </motion.div>
        <div className="text-xs font-sans font-medium text-slate-400 tracking-normal">
          Voice-powered emergency assistance
        </div>
      </div>
    </div>
  );
};
