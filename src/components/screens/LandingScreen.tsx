import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Radio, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Mic, 
  Server, 
  Users, 
  Sparkles, 
  Terminal,
  ShieldAlert,
  GitBranch,
  Layers,
  LogOut
} from 'lucide-react';
import { useEmergency } from '../../context/EmergencyContext';
import { useAuth } from '../../context/AuthContext';
import { NeuralAIFigure } from '../home/NeuralAIFigure';

export const LandingScreen: React.FC = () => {
  const { 
    startConversation, 
    isListening, 
    isSpeaking, 
    isAnalyzing, 
    isUserSpeaking, 
    isAISpeaking, 
    agoraStatus 
  } = useEmergency();

  const { user, isAuthenticated, signOut } = useAuth();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<'problem' | 'capabilities' | 'scenario'>('problem');

  const isVoiceActive = isListening || isSpeaking || isAnalyzing || isUserSpeaking || isAISpeaking || agoraStatus === 'CONNECTED';

  // Dynamic AI status label
  const getAIStateBadge = () => {
    if (isAnalyzing) return { text: 'ANALYZING CONTEXT', color: 'text-purple-400 bg-purple-950/60 border-purple-500/30' };
    if (isUserSpeaking || isListening) return { text: 'LISTENING TO WAR ROOM', color: 'text-cyan-400 bg-cyan-950/60 border-cyan-500/30' };
    if (isAISpeaking || isSpeaking) return { text: 'SPOKEN STATUS SUMMARY', color: 'text-indigo-400 bg-indigo-950/60 border-indigo-500/30' };
    return { text: 'INCIDENT INTELLIGENCE ACTIVE', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30' };
  };

  const aiStatus = getAIStateBadge();

  // Handler for Directly Joining Incident Room (No Login Barrier)
  const handleJoinIncidentRoom = (initialPrompt?: string) => {
    // Enter room directly - Agora AI Agent will speak its greeting once over Agora RTC audio
    startConversation(initialPrompt);
  };

  return (
    <div className="relative h-screen max-h-screen w-full bg-[#020305] text-slate-100 font-sans selection:bg-cyan-500/20 selection:text-cyan-200 antialiased overflow-hidden flex flex-col justify-between select-none">
      
      {/* ─── LIVE OPERATIONAL NETWORK BACKGROUND ─── */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div 
          className="absolute top-[-10%] right-[10%] w-[600px] h-[600px] rounded-full blur-[140px] opacity-25 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(0,217,255,0.22) 0%, rgba(99,102,241,0.12) 45%, transparent 70%)' }}
        />
        <div 
          className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full blur-[150px] opacity-15 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.18) 0%, rgba(14,165,233,0.1) 50%, transparent 70%)' }}
        />
        
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 217, 255, 0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 217, 255, 0.25) 1px, transparent 1px)`,
            backgroundSize: '32px 32px'
          }}
        />

        <div 
          className="absolute inset-0 opacity-[0.015] pointer-events-none"
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.3) 0px, rgba(255, 255, 255, 0.3) 1px, transparent 1px, transparent 3px)`
          }}
        />
      </div>

      {/* ─── TOP SYSTEM & INCIDENT ROOM STATUS BAR ─── */}
      <header className="relative z-30 w-full px-5 sm:px-8 lg:px-10 py-2.5 flex items-center justify-between border-b border-white/[0.06] bg-[#020305]/85 backdrop-blur-2xl shrink-0">
        
        {/* Brand & Mission Positioning */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 via-blue-600/30 to-indigo-600/20 border border-cyan-500/40 flex items-center justify-center shadow-md shadow-cyan-950/50">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-[17px] font-bold tracking-tight text-white select-none">
                EchoAid <span className="text-cyan-400">X</span>
              </span>
              <span className="text-[8px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
                COMMANDER v2.5
              </span>
            </div>
            <span className="text-[9px] font-medium tracking-wider uppercase text-slate-400 font-mono">
              AI Incident Commander
            </span>
          </div>
        </div>

        {/* Room & Status Pill */}
        <div className="flex items-center gap-2.5">
          
          {/* Room ID Tag */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.03] border border-white/[0.07] text-[10px] font-mono text-slate-300">
            <Server className="w-3 h-3 text-cyan-400" />
            <span>ROOM: <span className="text-white font-bold">SEV1-WAR-ROOM</span></span>
          </div>

          {/* User Profile If Logged In */}
          {isAuthenticated && user && (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-gradient-to-r from-cyan-950/40 to-indigo-950/30 border border-cyan-500/40 hover:border-cyan-400 transition-all cursor-pointer backdrop-blur-xl"
              >
                <img
                  src={user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.displayName}`}
                  alt={user.displayName}
                  className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-400/50"
                />
                <div className="flex flex-col text-left">
                  <span className="text-[11px] font-bold text-white leading-tight truncate max-w-[110px]">
                    {user.displayName}
                  </span>
                  <span className="text-[8px] font-mono text-cyan-300 leading-tight truncate max-w-[110px]">
                    {user.role}
                  </span>
                </div>
              </button>

              {/* User Dropdown Menu */}
              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-52 rounded-xl bg-[#060913] border border-cyan-500/30 p-2 shadow-2xl z-50 flex flex-col gap-1 font-mono text-xs"
                  >
                    <button
                      onClick={() => {
                        signOut();
                        setShowUserMenu(false);
                      }}
                      className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors cursor-pointer w-full text-left text-[10px]"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* System Live Pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 backdrop-blur-xl">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            <span className="text-[9px] font-semibold tracking-wider text-emerald-300 uppercase font-mono">
              ONLINE
            </span>
          </div>

        </div>
      </header>

      {/* ─── MAIN HERO AREA (TWO COLUMNS: 80% COMPACT SCALE) ─── */}
      <main className="relative z-10 flex-1 max-w-[1550px] w-full mx-auto px-5 sm:px-8 lg:px-10 flex flex-col lg:flex-row items-center justify-between gap-6 py-2">
        
        {/* ─── LEFT COLUMN: EXACT PROBLEM STATEMENT & DEMONSTRATED CAPABILITIES ─── */}
        <div className="flex-1 max-w-xl flex flex-col justify-center text-left z-20">
          
          {/* Subtitle Badge */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 text-[10px] font-mono tracking-wider uppercase mb-2.5 shadow-sm shadow-cyan-950 self-start"
          >
            <Terminal className="w-3 h-3 text-cyan-400 animate-pulse" />
            <span>Operational War Room AI</span>
            <span className="w-1 h-1 rounded-full bg-cyan-400" />
            <span className="text-white font-semibold">Evidence-First</span>
          </motion.div>

          {/* Main Title */}
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight font-sans mb-1.5"
          >
            Real-Time AI <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
              Incident Commander
            </span>
          </motion.h1>

          {/* 3-Tab Problem Statement, 8 Requirements & Outage Scenario Module */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="p-3.5 rounded-2xl bg-gradient-to-br from-white/[0.04] to-white/[0.015] border border-cyan-500/20 backdrop-blur-xl shadow-2xl mb-3 flex flex-col gap-2.5"
          >
            {/* Tab Buttons */}
            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/[0.06] text-[10.5px] font-mono">
              <button
                onClick={() => setActiveTab('problem')}
                className={`flex-1 py-1.5 rounded-lg font-bold transition-all cursor-pointer text-center ${
                  activeTab === 'problem' 
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                THE MISSION
              </button>
              <button
                onClick={() => setActiveTab('capabilities')}
                className={`flex-1 py-1.5 rounded-lg font-bold transition-all cursor-pointer text-center ${
                  activeTab === 'capabilities' 
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                8 REQUIREMENTS
              </button>
              <button
                onClick={() => setActiveTab('scenario')}
                className={`flex-1 py-1.5 rounded-lg font-bold transition-all cursor-pointer text-center ${
                  activeTab === 'scenario' 
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                OUTAGE SCENARIO
              </button>
            </div>

            {/* Tab 1: Verbatim Mission & Thesis */}
            {activeTab === 'problem' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[11px] text-slate-300 leading-relaxed font-mono flex flex-col gap-1.5"
              >
                <p className="text-cyan-200/90 font-medium">
                  EchoAid X joins live operational or technical incident rooms to listen to team discussions, organize information, and help maintain a shared understanding.
                </p>
                <div className="grid grid-cols-2 gap-1.5 text-[10px] text-slate-300 pt-0.5">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-cyan-400 shrink-0" />
                    <span>Distinguish facts vs assumptions</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-indigo-400 shrink-0" />
                    <span>Continuous live timeline</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>Track decision &amp; action ownership</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ShieldAlert className="w-3 h-3 text-amber-400 shrink-0" />
                    <span>Human confirmation for rollbacks</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Tab 2: The 8 Demonstrated Capabilities Grid */}
            {activeTab === 'capabilities' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-2 gap-1 text-[10px] font-mono leading-snug"
              >
                <div className="p-1.5 rounded-md bg-cyan-950/30 border border-cyan-500/20 flex items-center gap-1.5 text-slate-200">
                  <Mic className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span>Real-time voice participation</span>
                </div>

                <div className="p-1.5 rounded-md bg-indigo-950/30 border border-indigo-500/20 flex items-center gap-1.5 text-slate-200">
                  <Users className="w-3 h-3 text-indigo-400 shrink-0" />
                  <span>Participant role recognition</span>
                </div>

                <div className="p-1.5 rounded-md bg-emerald-950/30 border border-emerald-500/20 flex items-center gap-1.5 text-slate-200">
                  <GitBranch className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>Extract facts, hypotheses &amp; actions</span>
                </div>

                <div className="p-1.5 rounded-md bg-purple-950/30 border border-purple-500/20 flex items-center gap-1.5 text-slate-200">
                  <CheckCircle2 className="w-3 h-3 text-purple-400 shrink-0" />
                  <span>Assign &amp; track task ownership</span>
                </div>

                <div className="p-1.5 rounded-md bg-amber-950/30 border border-amber-500/20 flex items-center gap-1.5 text-slate-200">
                  <ShieldAlert className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>Detect missing/conflicting info</span>
                </div>

                <div className="p-1.5 rounded-md bg-blue-950/30 border border-blue-500/20 flex items-center gap-1.5 text-slate-200">
                  <Clock className="w-3 h-3 text-blue-400 shrink-0" />
                  <span>Continuous incident timeline</span>
                </div>

                <div className="p-1.5 rounded-md bg-pink-950/30 border border-pink-500/20 flex items-center gap-1.5 text-slate-200">
                  <Mic className="w-3 h-3 text-pink-400 shrink-0" />
                  <span>Spoken status summaries</span>
                </div>

                <div className="p-1.5 rounded-md bg-teal-950/30 border border-teal-500/20 flex items-center gap-1.5 text-slate-200">
                  <Layers className="w-3 h-3 text-teal-400 shrink-0" />
                  <span>Human confirmation for execution</span>
                </div>
              </motion.div>
            )}

            {/* Tab 3: Payment System Outage Example Scenario */}
            {activeTab === 'scenario' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[11px] text-slate-300 leading-relaxed font-mono flex flex-col gap-1"
              >
                <div className="flex items-center gap-1.5 text-amber-300 font-bold text-[10px]">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  <span>EXAMPLE SEV-1: PAYMENT SYSTEM OUTAGE</span>
                </div>
                <p className="text-[10.5px] text-slate-300">
                  Engineers, support teams, and leads join with incomplete or conflicting info. EchoAid X organizes evidence, tracks responsibilities, flags discrepancies, and delivers spoken status updates with human confirmation before rollbacks.
                </p>
              </motion.div>
            )}

          </motion.div>

          {/* ─── PRIMARY & SECONDARY ACTION BUTTONS (Direct Entry) ─── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-2.5"
          >
            {/* Primary CTA: Join Live Incident Room Directly */}
            <button
              onClick={() => handleJoinIncidentRoom()}
              className="group relative px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:brightness-110 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer border-0 overflow-hidden"
            >
              <Radio className="w-3.5 h-3.5 text-cyan-200 animate-pulse" />
              <span>Join Incident Room</span>
              <ArrowRight className="w-3.5 h-3.5 text-white group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Secondary CTA: Quick Simulate 503 Outage */}
            <button
              onClick={() => handleJoinIncidentRoom('The payment gateway API is throwing 503 HTTP errors and checkout failure rate surged to 42%.')}
              className="px-4 py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] hover:border-cyan-500/40 text-slate-200 font-semibold text-[11px] uppercase tracking-wider backdrop-blur-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Simulate 503 Outage</span>
            </button>
          </motion.div>

          {/* ─── AI INCIDENT CORE STATUS MODULE (Compact) ─── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="p-2.5 rounded-xl bg-gradient-to-r from-white/[0.035] to-white/[0.015] border border-white/[0.08] backdrop-blur-xl shadow-xl flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              {/* Audio Orb */}
              <div className="relative flex items-center justify-center">
                <div className={`absolute w-9 h-9 rounded-full border border-cyan-500/30 ${isVoiceActive ? 'animate-ping' : 'animate-pulse'}`} />
                <div className="absolute w-7 h-7 rounded-full border border-indigo-500/40" />
                
                <button
                  onClick={() => handleJoinIncidentRoom()}
                  className="relative w-6.5 h-6.5 rounded-full bg-gradient-to-br from-cyan-500 to-indigo-600 p-[1px] cursor-pointer shadow-md shadow-cyan-500/30 hover:scale-105 transition-transform"
                  aria-label="Toggle Voice Core"
                >
                  <div className="w-full h-full rounded-full bg-[#05070A] flex items-center justify-center">
                    <Mic className="w-3 h-3 text-cyan-300" />
                  </div>
                </button>
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[8.5px] font-mono font-bold uppercase tracking-widest text-cyan-400">
                    AI INCIDENT CORE
                  </span>
                  <span className={`text-[7.5px] font-mono font-semibold px-1.5 py-0.2 rounded-full border ${aiStatus.color}`}>
                    {aiStatus.text}
                  </span>
                </div>
                <span className="text-[10.5px] font-semibold text-white">
                  Listening to multi-speaker discussions &bull; Evidence-Aware
                </span>
              </div>
            </div>

            {/* Connected Tool Ecosystem Tags */}
            <div className="hidden sm:flex flex-col items-end gap-0.5">
              <span className="text-[8.5px] font-mono text-slate-400 uppercase tracking-widest">
                TOOL INTEGRATIONS
              </span>
              <div className="flex items-center gap-1 text-[9px] font-mono text-slate-300">
                <span className="px-1.5 py-0.2 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-300">Jira</span>
                <span className="px-1.5 py-0.2 rounded bg-purple-950/60 border border-purple-500/30 text-purple-300">Slack</span>
                <span className="px-1.5 py-0.2 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-300">PagerDuty</span>
              </div>
            </div>
          </motion.div>

        </div>

        {/* ─── RIGHT COLUMN: INTERACTIVE 3D NEURAL HEAD & LIVING BRAIN CELLS ─── */}
        <div className="flex-1 w-full max-w-[580px] flex items-center justify-center relative">
          <NeuralAIFigure />
        </div>

      </main>

      {/* ─── BOTTOM STATUS TICKER & AUDIT INTEGRATIONS ─── */}
      <footer className="relative z-30 w-full px-6 py-2 border-t border-white/[0.06] bg-[#020305]/90 backdrop-blur-2xl flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] font-mono text-slate-400 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-cyan-400 font-semibold">EchoAid X Commander v2.5</span>
          <span>&bull;</span>
          <span className="text-slate-300">FastAPI &amp; NVIDIA NIM Active</span>
          <span className="hidden sm:inline text-slate-600">&bull;</span>
          <span className="hidden sm:inline text-slate-400">Evidence-First Architecture</span>
        </div>

        <div className="flex items-center gap-3 text-slate-300">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            REAL-TIME VOICE
          </span>
          <span>&bull;</span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            HUMAN-IN-THE-LOOP
          </span>
          <span>&bull;</span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            EVIDENCE-AWARE
          </span>
        </div>
      </footer>

    </div>
  );
};
