import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useEmergency } from '../../context/EmergencyContext';
import { AudioWaveform } from '../common/AudioWaveform';
import { 
  Mic, 
  MicOff, 
  Bot, 
  User, 
  Send, 
  Cpu, 
  Clock, 
  Activity, 
  Sparkles, 
  Radio
} from 'lucide-react';
import { apiService } from '../../services/api';

export const CenterStage: React.FC = () => {
  const { 
    activeSession, 
    dialogueMessages, 
    addDialogueMessage, 
    emergencyTimerSeconds, 
    isVoiceActive, 
    setIsVoiceActive,
    speakInstruction
  } = useEmergency();

  const [inputSpeech, setInputSpeech] = useState('');
  const [isPatientTalking, setIsPatientTalking] = useState(false);
  const [isAITalking, setIsAITalking] = useState(false);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [dialogueMessages]);

  const handleSendSpeech = async () => {
    if (!inputSpeech.trim()) return;
    const text = inputSpeech.trim();
    setInputSpeech('');

    // Add Patient dialogue message
    addDialogueMessage({
      sender: 'PATIENT',
      text: text,
      confidence: 0.98
    });

    setIsPatientTalking(true);
    setTimeout(() => setIsPatientTalking(false), 1200);

    // Call Triage API to get updated assessment
    setIsAITalking(true);
    const triageResult = await apiService.runTriage(text);

    setTimeout(() => {
      setIsAITalking(false);
      addDialogueMessage({
        sender: 'ECHO_AI',
        text: `Echo AI Triage update: ${triageResult.guidance} (Action: ${triageResult.recommended_action})`,
        confidence: 0.99
      });
      speakInstruction(triageResult.guidance);
    }, 1000);
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    const ms = Math.floor((seconds * 10) % 10);
    return `T+${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}:${ms}`;
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-6 gap-6 overflow-y-auto bg-command-bg/95 hud-grid">
      
      {/* Top Session Header & Precision Emergency Timer */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-command-card/90 border border-command-border backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-cyber-red/20 border border-cyber-red/50 shadow-glow-red">
            <Activity className="w-5 h-5 text-cyber-red animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyber-red/20 text-cyber-red border border-cyber-red/40 animate-pulse">
                CRITICAL SOS ACTIVE
              </span>
              <span className="text-xs font-mono text-slate-400">ID: {activeSession?.assessment_id || 'TRI-8821'}</span>
            </div>
            <h2 className="text-lg font-bold text-white font-sans mt-0.5">
              {activeSession?.protocol_title || 'Acute Coronary Syndrome & CPR Protocol'}
            </h2>
          </div>
        </div>

        {/* Stopwatch Timer */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-command-surface border border-cyber-red/40 font-mono text-base font-bold text-cyber-red shadow-glow-red flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyber-red animate-spin" />
            <span>{formatTimer(emergencyTimerSeconds)}</span>
          </div>

          <button
            onClick={() => setIsVoiceActive(!isVoiceActive)}
            className={`p-2.5 rounded-xl border font-mono text-xs flex items-center gap-2 transition-all ${
              isVoiceActive
                ? 'bg-cyber-cyan/20 border-cyber-cyan/40 text-cyber-cyan shadow-glow-cyan'
                : 'bg-command-surface border-slate-700 text-slate-400'
            }`}
          >
            {isVoiceActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            <span className="hidden sm:inline">{isVoiceActive ? 'VOICE HUD ON' : 'MUTED'}</span>
          </button>
        </div>
      </div>

      {/* Large Live Voice Conversation & Animated Microphones Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* Animated Dual Microphones & Spectrum Visualizer Card */}
        <div className="lg:col-span-12 p-6 rounded-2xl bg-command-card/90 border border-command-border backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-glass-command">
          
          <div className="absolute inset-0 bg-hud-grid opacity-20 pointer-events-none" />

          {/* Microphone 1: Patient / Operator Voice */}
          <div className="flex items-center gap-4 z-10">
            <div className="relative flex items-center justify-center">
              <motion.div
                animate={{ scale: isPatientTalking ? [1, 1.4, 1] : 1 }}
                transition={{ repeat: isPatientTalking ? Infinity : 0, duration: 0.8 }}
                className={`w-16 h-16 rounded-2xl flex items-center justify-center border-2 transition-all ${
                  isPatientTalking 
                    ? 'bg-cyber-red border-white text-white shadow-[0_0_35px_rgba(255,59,48,0.8)]' 
                    : 'bg-command-surface border-cyber-cyan/30 text-cyber-cyan'
                }`}
              >
                <User className="w-8 h-8" />
              </motion.div>
              {isPatientTalking && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-red opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-cyber-red"></span>
                </span>
              )}
            </div>
            <div>
              <div className="text-xs font-mono text-cyan-300 font-bold">PATIENT VOICE STREAM</div>
              <div className="text-[11px] font-mono text-slate-400">Channel A • 24kHz Sample Rate</div>
              <div className="text-[10px] font-mono text-emerald-400 mt-0.5">Speech-to-Text: ACTIVE</div>
            </div>
          </div>

          {/* Central Waveform Visualizer */}
          <div className="flex-1 flex flex-col items-center justify-center z-10 max-w-md">
            <div className="text-[10px] font-mono text-slate-400 mb-1 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-cyber-cyan animate-pulse" />
              LIVE DUAL AUDIO SPECTRUM SYNTHESIS
            </div>
            <AudioWaveform active={isVoiceActive} barCount={40} height={48} />
          </div>

          {/* Microphone 2: Echo AI Neural Stream */}
          <div className="flex items-center gap-4 z-10">
            <div>
              <div className="text-xs font-mono text-cyber-purple font-bold text-right">ECHO AI NEURAL VOICE</div>
              <div className="text-[11px] font-mono text-slate-400 text-right">Model: EchoAid V2.4</div>
              <div className="text-[10px] font-mono text-cyber-cyan text-right mt-0.5">Latency: 12ms</div>
            </div>
            <div className="relative flex items-center justify-center">
              <motion.div
                animate={{ scale: isAITalking ? [1, 1.4, 1] : 1 }}
                transition={{ repeat: isAITalking ? Infinity : 0, duration: 0.8 }}
                className={`w-16 h-16 rounded-2xl flex items-center justify-center border-2 transition-all ${
                  isAITalking 
                    ? 'bg-cyber-purple border-white text-white shadow-[0_0_35px_rgba(124,58,237,0.8)]' 
                    : 'bg-command-surface border-cyber-purple/40 text-cyber-purple'
                }`}
              >
                <Bot className="w-8 h-8" />
              </motion.div>
              {isAITalking && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-purple opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-cyber-purple"></span>
                </span>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Live Dialogue Transcript & AI Reasoning Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        
        {/* Dialogue Transcript Log (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-command-card/90 border border-command-border backdrop-blur-xl flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-command-border pb-3">
            <span className="text-xs font-mono text-cyber-cyan uppercase font-bold tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-cyber-cyan" />
              LIVE TRANSCRIPT & DIALOGUE STREAM
            </span>
            <span className="text-[10px] font-mono text-slate-400">REAL-TIME TELEMETRY</span>
          </div>

          {/* Transcript Message Scroll Area */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 max-h-[300px]">
            {dialogueMessages.map((msg) => (
              <div
                key={msg.id}
                className={`p-3.5 rounded-xl border text-xs leading-relaxed space-y-1 ${
                  msg.sender === 'ECHO_AI'
                    ? 'bg-cyber-purple/10 border-cyber-purple/30 text-slate-100 ml-4'
                    : msg.sender === 'PATIENT'
                    ? 'bg-cyber-cyan/10 border-cyber-cyan/30 text-slate-100 mr-4'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 text-center font-mono text-[11px]'
                }`}
              >
                <div className="flex items-center justify-between font-mono text-[10px] opacity-75">
                  <span className="font-bold flex items-center gap-1">
                    {msg.sender === 'ECHO_AI' && <Bot className="w-3 h-3 text-cyber-purple" />}
                    {msg.sender === 'PATIENT' && <User className="w-3 h-3 text-cyber-cyan" />}
                    {msg.sender}
                  </span>
                  <span>{msg.timestamp} {msg.confidence ? `• Conf: ${(msg.confidence * 100).toFixed(0)}%` : ''}</span>
                </div>
                <div>{msg.text}</div>
              </div>
            ))}
            <div ref={transcriptEndRef} />
          </div>

          {/* Input Prompt Box for Operator / Voice Override */}
          <div className="pt-2 flex gap-2">
            <input
              type="text"
              value={inputSpeech}
              onChange={(e) => setInputSpeech(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendSpeech()}
              placeholder="Type patient symptoms or operator command (e.g., Patient vomited, severe pain)..."
              className="flex-1 px-4 py-3 rounded-xl bg-command-surface border border-command-border text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyber-cyan font-sans"
            />
            <button
              onClick={handleSendSpeech}
              className="px-5 py-3 rounded-xl bg-cyber-cyan text-navy-950 font-bold text-xs shadow-glow-cyan hover:scale-105 transition-all flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              <span>Stream</span>
            </button>
          </div>
        </div>

        {/* AI Neural Reasoning Engine Card (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-command-card/90 border border-command-border backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between border-b border-command-border pb-3">
            <span className="text-xs font-mono text-cyber-purple uppercase font-bold tracking-wider flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-cyber-purple" />
              AI REASONING ENGINE
            </span>
            <span className="text-xs font-mono text-cyber-emerald font-bold">98.4% CONFIDENCE</span>
          </div>

          {/* Differential Diagnosis Ranking */}
          <div className="space-y-3 text-xs font-mono">
            <div className="text-[11px] text-slate-400">DIFFERENTIAL DIAGNOSIS PROBABILITY</div>

            {(activeSession?.differential_diagnosis || [
              { name: 'Acute Coronary Syndrome (ACS)', probability: 0.984 },
              { name: 'Aortic Dissection (Type A)', probability: 0.012 },
              { name: 'Pulmonary Embolism', probability: 0.004 },
            ]).map((diag, i) => (
              <div key={i} className="p-3 rounded-xl bg-command-surface border border-slate-800 space-y-1.5">
                <div className="flex justify-between font-bold text-white">
                  <span>{diag.name}</span>
                  <span className="text-cyber-cyan">{(diag.probability * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-cyber-purple to-cyber-cyan h-full rounded-full"
                    style={{ width: `${diag.probability * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-xl bg-command-surface border border-cyber-cyan/30 text-xs text-slate-300 space-y-1">
            <div className="font-mono text-cyber-cyan font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> AI Triage Recommendation:
            </div>
            <p className="text-[11px] leading-relaxed">
              {activeSession?.recommended_action || 'BEGIN 110 BPM CHEST COMPRESSIONS & NOTIFY PARAMEDIC DISPATCH'}
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
