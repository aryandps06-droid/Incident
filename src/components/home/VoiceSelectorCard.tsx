import React from 'react';
import { motion } from 'framer-motion';
import { useEmergency } from '../../context/EmergencyContext';
import { Volume2, Check, ShieldAlert, HeartHandshake, Stethoscope } from 'lucide-react';
import type { VoicePersonality } from '../../types';

export const VoiceSelectorCard: React.FC = () => {
  const { voiceGender, setVoiceGender, voicePersonality, setVoicePersonality } = useEmergency();

  const personalities: Array<{ id: VoicePersonality; title: string; subtitle: string; icon: React.ReactNode }> = [
    {
      id: 'dispatcher',
      title: 'Dispatcher',
      subtitle: 'Authoritative',
      icon: <ShieldAlert className="w-3 h-3 text-cyan-400" />
    },
    {
      id: 'compassionate',
      title: 'Compassionate',
      subtitle: 'Soothing',
      icon: <HeartHandshake className="w-3 h-3 text-pink-400" />
    },
    {
      id: 'clinical',
      title: 'Clinical',
      subtitle: 'Triage Focus',
      icon: <Stethoscope className="w-3 h-3 text-emerald-400" />
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full p-2 rounded-xl bg-white/[0.04] border border-white/12 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.3)] transition-all duration-300 hover:border-white/20 space-y-1.5"
    >
      {/* Title & Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-md bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
            <Volume2 className="w-3 h-3" />
          </div>
          <div>
            <h4 className="text-[11px] font-bold text-white font-sans leading-none">AI Voice & Persona</h4>
            <p className="text-[9px] text-slate-400 font-sans mt-0.5 leading-none">Emergency voice experience</p>
          </div>
        </div>
        <span className="text-[8px] font-mono text-cyan-300 bg-cyan-500/15 px-1.5 py-0.5 rounded-full border border-cyan-400/30 uppercase font-semibold">
          {voiceGender} · {voicePersonality}
        </span>
      </div>

      {/* 1. Voice Gender Segmented Control */}
      <div className="grid grid-cols-2 gap-1.5 bg-navy-950/60 p-1 rounded-xl border border-white/10">
        
        <motion.button
          type="button"
          onClick={() => setVoiceGender('female')}
          whileHover={{ scale: 1.01, y: -1 }}
          whileTap={{ scale: 0.98 }}
          aria-label="Select Female Dispatcher"
          className={`relative flex items-center justify-center gap-1.5 py-1 px-2 rounded-lg text-[10px] font-semibold font-sans transition-all duration-200 cursor-pointer ${
            voiceGender === 'female'
              ? 'bg-gradient-to-r from-cyan-500/25 via-blue-500/20 to-purple-500/20 text-white border border-cyan-400/60 shadow-[0_0_12px_rgba(0,229,255,0.3)]'
              : 'text-slate-400 hover:text-white hover:bg-white/[0.05] border border-transparent'
          }`}
        >
          {voiceGender === 'female' && (
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="shrink-0 text-cyan-300">
              <Check className="w-3 h-3 stroke-[3]" />
            </motion.span>
          )}
          <span>Female Dispatcher</span>
        </motion.button>

        <motion.button
          type="button"
          onClick={() => setVoiceGender('male')}
          whileHover={{ scale: 1.01, y: -1 }}
          whileTap={{ scale: 0.98 }}
          aria-label="Select Male Dispatcher"
          className={`relative flex items-center justify-center gap-1.5 py-1 px-2 rounded-lg text-[10px] font-semibold font-sans transition-all duration-200 cursor-pointer ${
            voiceGender === 'male'
              ? 'bg-gradient-to-r from-cyan-500/25 via-blue-500/20 to-purple-500/20 text-white border border-cyan-400/60 shadow-[0_0_12px_rgba(0,229,255,0.3)]'
              : 'text-slate-400 hover:text-white hover:bg-white/[0.05] border border-transparent'
          }`}
        >
          {voiceGender === 'male' && (
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="shrink-0 text-cyan-300">
              <Check className="w-3 h-3 stroke-[3]" />
            </motion.span>
          )}
          <span>Male Dispatcher</span>
        </motion.button>

      </div>

      {/* 2. Voice Personality Segmented Control */}
      <div className="grid grid-cols-3 gap-1 bg-navy-950/60 p-1 rounded-xl border border-white/10">
        {personalities.map((p) => {
          const isSelected = voicePersonality === p.id;
          return (
            <motion.button
              key={p.id}
              type="button"
              onClick={() => setVoicePersonality(p.id)}
              whileHover={{ scale: 1.01, y: -1 }}
              whileTap={{ scale: 0.97 }}
              aria-label={`Select ${p.title} Personality`}
              className={`flex flex-col items-center justify-center p-1 rounded-lg text-center transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-br from-cyan-500/30 via-blue-500/20 to-purple-500/20 text-white border border-cyan-400/70 shadow-[0_0_12px_rgba(0,229,255,0.25)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent'
              }`}
            >
              <div className="mb-0.5">{p.icon}</div>
              <div className="text-[9px] font-bold font-sans leading-none truncate w-full">{p.title}</div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};
