import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { agoraVoiceService } from '../../services/agoraVoice';
import { useIncident } from '../../context/IncidentContext';
import { useEmergency } from '../../context/EmergencyContext';
import type { ParticipantRole } from '../../types/incidentCommander';
import { 
  Mic, 
  MicOff, 
  Send, 
  Radio, 
  Sparkles, 
  MessageSquare, 
  User, 
  Bot
} from 'lucide-react';

const ROLES: ParticipantRole[] = [
  'Incident Commander',
  'Backend Engineer',
  'Frontend Engineer',
  'SRE',
  'DevOps Engineer',
  'Support Engineer',
  'Product Manager',
  'Business Lead',
  'Observer',
  'Security Engineer',
  'Database Engineer',
  'Network Engineer',
  'QA Engineer',
  'Engineering Manager',
  'Customer Support',
  'Other / Unknown'
];

export const LiveRoomPanel: React.FC = () => {
  const { 
    currentIncident, 
    activeSpeakerRole, 
    setActiveSpeakerRole, 
    activeSpeaker, 
    setActiveSpeaker,
    submitTranscriptStatement
  } = useIncident();

  const { 
    interimTranscript, 
    isAgoraMuted, 
    toggleAgoraMute,
    startVoiceSession,
    stopVoice
  } = useEmergency();

  const [statementText, setStatementText] = useState('');
  const [speakerName, setSpeakerName] = useState(activeSpeaker.name || 'Arjun');
  const transcriptContainerRef = useRef<HTMLDivElement>(null);
  const lastGreetedNameRef = useRef<string>('');

  // Dynamic welcome handler
  const triggerPersonalizedWelcome = (_name: string, _role?: string) => {
    // Rely exclusively on Agora AI Agent voice for greetings
  };

  // Keep speaker name in sync with selected participant in overview panel
  useEffect(() => {
    if (activeSpeaker && activeSpeaker.name) {
      setSpeakerName(activeSpeaker.name);
    }
  }, [activeSpeaker]);

  useEffect(() => {
    // Start with microphone OFF by default on room entry
    agoraVoiceService.setMuted(true);
    stopVoice();
  }, []);

  // Handle speaker name input change with 800ms debounce
  const handleSpeakerNameChange = (newName: string) => {
    setSpeakerName(newName);
    if (activeSpeaker) {
      setActiveSpeaker({ ...activeSpeaker, name: newName });
    }
  };

  const handleSpeakerNameBlur = () => {
    if (speakerName.trim() && speakerName.trim() !== lastGreetedNameRef.current) {
      triggerPersonalizedWelcome(speakerName.trim(), activeSpeakerRole);
    }
  };

  // Auto-scroll strictly inside transcript box without moving outer page
  useEffect(() => {
    if (transcriptContainerRef.current) {
      transcriptContainerRef.current.scrollTo({
        top: transcriptContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [currentIncident.transcript, interimTranscript]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statementText.trim()) return;
    const txt = statementText.trim();
    setStatementText('');
    await submitTranscriptStatement(speakerName, activeSpeakerRole, txt);
  };

  return (
    <div className="bg-[#050A1F]/90 border border-cyan-500/20 rounded-2xl p-4 flex flex-col h-[560px] shadow-2xl backdrop-blur-xl relative overflow-hidden">
      
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-3xl pointer-events-none" />

      {/* Top Header & Speaker Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-white/[0.07] relative z-10">
        <div className="flex items-center gap-2">
          <div className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
          </div>
          <span className="text-xs font-mono font-bold text-slate-100 tracking-wider flex items-center gap-1.5 whitespace-nowrap">
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            LIVE WAR ROOM TRANSCRIPT
          </span>
        </div>

        {/* Active Speaker Configurator with Dynamic Recognition */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[10.5px] font-mono text-slate-400">Speaker:</span>
          <input
            type="text"
            value={speakerName}
            onChange={(e) => handleSpeakerNameChange(e.target.value)}
            onBlur={handleSpeakerNameBlur}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSpeakerNameBlur();
              }
            }}
            className="w-20 px-2 py-1 rounded-lg bg-slate-900/90 border border-cyan-500/30 text-xs font-semibold text-cyan-200 focus:outline-none focus:border-cyan-400 shadow-inner"
            placeholder="Name"
            title="Type your name to get personal AI recognition and greetings"
          />
          <select
            value={activeSpeakerRole}
            onChange={(e) => {
              const newRole = e.target.value as ParticipantRole;
              setActiveSpeakerRole(newRole);
              triggerPersonalizedWelcome(speakerName, newRole);
            }}
            className="w-36 px-2 py-1 rounded-lg bg-slate-900/90 border border-white/[0.12] text-[11px] font-mono text-cyan-300 focus:outline-none focus:border-cyan-400 cursor-pointer truncate"
          >
            {ROLES.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Transcript Feed */}
      <div 
        ref={transcriptContainerRef}
        className="flex-1 overflow-y-auto my-3 pr-1.5 flex flex-col gap-2.5 relative z-10 scrollbar-thin scrollbar-thumb-cyan-500/20"
      >
        {currentIncident.transcript.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs font-mono">
            <MessageSquare className="w-8 h-8 mb-2 stroke-1 text-slate-600 animate-pulse" />
            <span>No statements recorded yet. Speak into mic or type below.</span>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {currentIncident.transcript.map(msg => {
              const isAI = msg.speaker === 'EchoAid X' || msg.speakerRole === 'AI Incident Commander';
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`p-3 rounded-xl border transition-all ${
                    isAI
                      ? 'bg-purple-950/30 border-purple-500/40 ml-3 shadow-[0_0_15px_rgba(168,85,247,0.15)]'
                      : 'bg-slate-900/70 border-white/[0.08] mr-3 hover:border-white/[0.15]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      {isAI ? (
                        <div className="w-5 h-5 rounded-md bg-purple-500/20 border border-purple-400/40 flex items-center justify-center">
                          <Bot className="w-3.5 h-3.5 text-purple-300" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-md bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center">
                          <User className="w-3 h-3 text-cyan-300" />
                        </div>
                      )}
                      <span className="text-xs font-semibold text-slate-100">{msg.speaker}</span>
                      <span className="text-[9.5px] font-mono px-1.5 py-0.5 rounded-md bg-slate-800/90 text-slate-300 border border-slate-700">
                        {msg.speakerRole || 'Observer'}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">{msg.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-sans pl-7">{msg.text}</p>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}

        {/* Live Interim Transcript Stream */}
        {interimTranscript && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3 rounded-xl border border-cyan-400/50 bg-cyan-950/40 text-xs text-cyan-200 animate-pulse italic flex items-center gap-2.5"
          >
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Streaming speech: "{interimTranscript}"</span>
          </motion.div>
        )}
      </div>

      {/* Input Form & Speech Controls */}
      <form onSubmit={(e) => handleSubmit(e)} className="pt-2.5 border-t border-white/[0.07] flex items-center gap-2 relative z-10">
        {/* Mic Toggle Button with Animated Red Motion Lights */}
        <button
          type="button"
          onClick={() => {
            if (!isAgoraMuted) {
              stopVoice();
              agoraVoiceService.setMuted(true);
            } else {
              toggleAgoraMute();
              startVoiceSession();
            }
          }}
          className={`relative px-4 py-2 rounded-xl border font-mono text-xs transition-all duration-300 flex items-center gap-2.5 cursor-pointer select-none overflow-hidden ${
            !isAgoraMuted
              ? 'bg-gradient-to-r from-rose-950/90 via-red-900/80 to-rose-950/90 text-white border-rose-500 shadow-[0_0_25px_rgba(244,63,94,0.6)] ring-1 ring-rose-400/50'
              : 'bg-slate-900/90 hover:bg-slate-850 text-slate-400 border-slate-700/60 hover:border-slate-500 hover:text-slate-200 shadow-sm'
          }`}
          title={!isAgoraMuted ? "Click to Turn Microphone OFF" : "Click to Turn Microphone ON"}
        >
          {/* Animated Red Motion Lights / Radar Wave when MIC LIVE */}
          {!isAgoraMuted ? (
            <>
              {/* Pulsing Red Radar Beacon */}
              <span className="relative flex h-3 w-3 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-80" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500 shadow-[0_0_8px_#f43f5e]" />
              </span>

              <Mic className="w-4 h-4 text-rose-300 animate-pulse shrink-0" />

              <span className="font-mono text-[11px] font-extrabold tracking-wider text-rose-100">
                MIC LIVE
              </span>

              {/* 4-Bar High-Frequency Red Motion Equalizer */}
              <div className="flex items-center gap-0.5 ml-1 h-3.5 shrink-0">
                <span className="w-1 bg-rose-400 rounded-full animate-[bounce_0.6s_infinite_100ms] h-2.5 shadow-[0_0_5px_#f43f5e]" />
                <span className="w-1 bg-red-400 rounded-full animate-[bounce_0.6s_infinite_300ms] h-3.5 shadow-[0_0_5px_#f43f5e]" />
                <span className="w-1 bg-rose-300 rounded-full animate-[bounce_0.6s_infinite_150ms] h-3 shadow-[0_0_5px_#f43f5e]" />
                <span className="w-1 bg-red-500 rounded-full animate-[bounce_0.6s_infinite_400ms] h-2 shadow-[0_0_5px_#f43f5e]" />
              </div>
            </>
          ) : (
            <>
              {/* Static Muted State */}
              <span className="w-2 h-2 rounded-full bg-slate-600 shrink-0" />
              <MicOff className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="font-mono text-[11px] font-bold text-slate-400">
                MIC OFF
              </span>
            </>
          )}
        </button>

        {/* Text Input */}
        <input
          type="text"
          value={statementText}
          onChange={(e) => setStatementText(e.target.value)}
          placeholder={`Type a statement as ${speakerName} or speak into mic…`}
          className="flex-1 px-3 py-2 rounded-xl bg-slate-900/90 border border-white/[0.1] text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 font-sans"
        />

        {/* Submit Statement Button */}
        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:brightness-110 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-cyan-500/25 transition cursor-pointer border-0"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>

    </div>
  );
};
