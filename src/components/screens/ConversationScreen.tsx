import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useEmergency } from '../../context/EmergencyContext';
import { VoiceWaveform } from '../home/VoiceWaveform';
import { AuroraBackground } from '../common/AuroraBackground';
import { 
  Bot, User, Send, XCircle, Sparkles, Clock, Shield, AlertTriangle, 
  Activity, CheckCircle2, FileText, Cpu, HeartPulse, Stethoscope, Compass 
} from 'lucide-react';
import { apiService } from '../../services/api';

export const ConversationScreen: React.FC = () => {
  const { 
    dialogueMessages, 
    addDialogueMessage, 
    isListening, 
    setIsListening, 
    isSpeaking, 
    isAnalyzing, 
    setIsAnalyzing,
    conversationTimerSeconds,
    finishEmergencySession,
    speakInstruction,
    riskScore,
    dispatchState,
    callerEmotion,
    gatheredFacts,
    missingFacts,
    activatedToolsChecklist,
    explainableReasoning,
    handoffReport
  } = useEmergency();

  const [inputSpeech, setInputSpeech] = useState('');

  const handleSendSpeech = async () => {
    if (!inputSpeech.trim()) return;
    const text = inputSpeech.trim();
    setInputSpeech('');

    addDialogueMessage({
      sender: 'USER',
      text: text,
      confidence: 0.98
    });

    setIsListening(false);
    setIsAnalyzing(true);

    try {
      const history = dialogueMessages.map(m => ({
        role: m.sender === 'USER' ? 'user' : 'assistant',
        content: m.text
      }));
      history.push({ role: 'user', content: text });

      const nvidiaResult = await apiService.sendNvidiaChat(history);
      setIsAnalyzing(false);

      const guidanceText = nvidiaResult.ai_guidance_text || 'Please answer the dispatcher question.';

      addDialogueMessage({
        sender: 'ECHO_AI',
        text: guidanceText,
        confidence: nvidiaResult.confidence || 0.95
      });

      speakInstruction(guidanceText);
    } catch (err) {
      setIsAnalyzing(false);
      const fallback = 'I have received your response. Is the patient breathing right now?';
      addDialogueMessage({
        sender: 'ECHO_AI',
        text: fallback,
        confidence: 0.90
      });
      speakInstruction(fallback);
    }
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const hasEvidence = (missingFacts && missingFacts.length <= 1) || riskScore >= 75;

  const getRiskColor = (score: number) => {
    if (!hasEvidence) return 'text-cyan-400 bg-cyan-500/20 border-cyan-500/40';
    if (score >= 80) return 'text-red-400 bg-red-500/20 border-red-500/40';
    if (score >= 60) return 'text-amber-400 bg-amber-500/20 border-amber-500/40';
    return 'text-cyan-400 bg-cyan-500/20 border-cyan-500/40';
  };

  const availableToolsList = [
    { key: 'share_current_location', label: 'Share Live GPS Coordinates' },
    { key: 'medical_id_lookup', label: 'Retrieve Patient Medical ID' },
    { key: 'call_ambulance', label: 'Dispatch 911 / EMS Ambulance' },
    { key: 'find_nearest_hospital', label: 'Select Trauma Hospital' },
    { key: 'prepare_hospital_report', label: 'Generate Responder Handoff' },
    { key: 'notify_emergency_contact', label: 'Alert ICE Contacts' }
  ];

  return (
    <AuroraBackground>
      <div className="min-h-screen flex flex-col justify-between p-4 lg:p-8 select-none relative overflow-hidden text-slate-100">
        
        {/* Top Command Bar */}
        <header className="flex flex-wrap items-center justify-between z-10 border-b border-white/10 pb-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-400 shadow-glow-cyan">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-extrabold text-white font-sans tracking-tight">
                EchoAid <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">X</span>
              </span>
              <div className="text-[10px] font-mono text-cyan-400/80 tracking-widest uppercase font-semibold">
                Emergency Dispatch Gateway
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Dispatcher State Badge */}
            <div className="px-3.5 py-1.5 rounded-full bg-space-card/90 border border-white/10 text-xs font-mono flex items-center gap-2 backdrop-blur-xl">
              <Compass className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
              <span className="text-slate-400">STATE:</span>
              <span className="text-cyan-300 font-bold">{hasEvidence ? dispatchState : 'EVIDENCE COLLECTION'}</span>
            </div>

            {/* Caller Emotional State Badge */}
            <div className="px-3.5 py-1.5 rounded-full bg-space-card/90 border border-white/10 text-xs font-mono flex items-center gap-2 backdrop-blur-xl">
              <HeartPulse className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-slate-400">EMOTION:</span>
              <span className="text-purple-300 font-bold">{callerEmotion}</span>
            </div>

            {/* Timer Badge */}
            <div className="flex items-center gap-1.5 font-mono text-xs text-red-400 font-bold bg-red-500/10 px-3.5 py-1.5 rounded-full border border-red-500/30">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTimer(conversationTimerSeconds)}</span>
            </div>

            <button
              onClick={finishEmergencySession}
              className="px-4 py-1.5 rounded-2xl bg-space-surface border border-white/10 hover:border-red-500 text-xs font-mono text-slate-300 hover:text-white flex items-center gap-1.5 transition-all shadow-card-soft"
            >
              <XCircle className="w-4 h-4 text-red-400" />
              <span>End Call</span>
            </button>
          </div>
        </header>

        {/* Main Grid: Left Panel (Conversation Stream) | Right Panel (Progressive Operations Dashboard) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 my-4 z-10 overflow-hidden min-h-0">
          
          {/* Left Column: Live Dispatcher Conversation Stream (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-4 bg-space-card/60 rounded-3xl p-5 border border-white/10 backdrop-blur-2xl shadow-card-soft min-h-0">
            
            {/* Conversation Stream */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 max-h-[48vh] scrollbar-thin">
              {dialogueMessages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`flex gap-3 max-w-xl ${msg.sender === 'USER' ? 'ml-auto flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                    msg.sender === 'ECHO_AI' 
                      ? 'bg-cyan-500/20 border-cyan-400/60 text-cyan-300 shadow-glow-cyan' 
                      : 'bg-space-surface border-white/20 text-white'
                  }`}>
                    {msg.sender === 'ECHO_AI' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>

                  <div className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed space-y-1 backdrop-blur-2xl ${
                    msg.sender === 'ECHO_AI'
                      ? 'bg-space-card/90 border border-white/10 text-white rounded-tl-none'
                      : 'bg-gradient-to-r from-blue-600 via-cyan-600 to-indigo-600 text-white font-medium shadow-glow-brand rounded-tr-none'
                  }`}>
                    <div className="flex items-center justify-between text-[10px] font-mono opacity-70 gap-4">
                      <span className="font-bold">{msg.sender === 'ECHO_AI' ? '911 Emergency Dispatcher' : 'Caller'}</span>
                      <span>{msg.timestamp}</span>
                    </div>
                    <div>{msg.text}</div>
                  </div>
                </motion.div>
              ))}

              {isAnalyzing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 text-xs font-mono text-cyan-300 p-3 rounded-2xl bg-space-card/80 border border-white/10 w-fit backdrop-blur-xl"
                >
                  <Sparkles className="w-4 h-4 animate-spin text-cyan-400" />
                  <span>Gathering critical evidence...</span>
                </motion.div>
              )}
            </div>

            {/* Audio Waveform */}
            <div className="text-center space-y-1 pt-1 border-t border-white/10">
              <VoiceWaveform active={isListening || isSpeaking} color="#00E5FF" barCount={40} height={36} />
              <div className="text-[10px] font-mono text-slate-400">
                {isListening ? 'Microphone Active — Listening to Caller' : 'Audio Gateway — Dispatcher Output'}
              </div>
            </div>

            {/* Speech Input Form */}
            <div className="flex gap-2">
              <input
                type="text"
                value={inputSpeech}
                onChange={(e) => setInputSpeech(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendSpeech()}
                placeholder="Answer dispatcher question (e.g. He is breathing but has chest pain)..."
                className="flex-1 px-4 py-3 rounded-2xl bg-space-surface/90 border border-white/10 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-sans backdrop-blur-2xl"
              />
              <button
                onClick={handleSendSpeech}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white font-bold text-xs sm:text-sm shadow-glow-cyan hover:scale-105 transition-all flex items-center gap-2 shrink-0"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </div>

          </div>

          {/* Right Column: Progressive Operations Dashboard (5 cols) */}
          <div className="lg:col-span-5 flex flex-col space-y-4 overflow-y-auto max-h-[78vh] pr-1 scrollbar-thin">
            
            {/* Live Risk Score Evolution Gauge */}
            <div className="p-4 rounded-3xl bg-space-card/80 border border-white/10 backdrop-blur-2xl shadow-card-soft space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-white uppercase tracking-wider">
                  <Activity className="w-4 h-4 text-red-400" />
                  <span>Emergency Risk Score</span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-black border ${getRiskColor(riskScore)}`}>
                  {hasEvidence ? `${riskScore}% RISK` : 'ASSESSING (UNKNOWN)'}
                </span>
              </div>

              {/* Progress Gauge Bar */}
              <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden p-0.5 border border-white/10">
                <motion.div 
                  initial={{ width: '15%' }}
                  animate={{ width: `${riskScore}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className={`h-full rounded-full ${
                    !hasEvidence 
                      ? 'bg-gradient-to-r from-slate-600 to-cyan-500' 
                      : (riskScore >= 80 ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 shadow-[0_0_12px_#EF4444]' : 'bg-gradient-to-r from-cyan-400 to-blue-600')
                  }`}
                />
              </div>

              <div className="flex justify-between text-[10px] font-mono text-slate-400 pt-0.5">
                <span>Assessing</span>
                <span>Gathering Facts</span>
                <span>{hasEvidence ? 'Triage Confirmed' : 'Awaiting Threshold'}</span>
              </div>
            </div>

            {/* Explainable AI Medical Reasoning Card */}
            {explainableReasoning && (
              <div className="p-4 rounded-3xl bg-space-card/80 border border-white/10 backdrop-blur-2xl shadow-card-soft space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <span>Clinical Evidence & Diagnosis</span>
                </div>

                <div className="space-y-1.5 text-xs font-sans">
                  <div className="flex items-start gap-2">
                    <span className="text-slate-400 font-mono text-[11px] shrink-0 font-bold">STATUS:</span>
                    <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded border ${
                      hasEvidence ? 'bg-red-500/20 border-red-500/40 text-red-300' : 'bg-cyan-500/10 border-cyan-400/30 text-cyan-300'
                    }`}>
                      {explainableReasoning.likely_diagnosis}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300 leading-relaxed bg-space-bg/60 p-2.5 rounded-xl border border-white/5 font-mono">
                    {explainableReasoning.reasoning}
                  </div>
                  <div className="flex items-start gap-2 text-[11px]">
                    <span className="text-emerald-400 font-mono font-bold shrink-0">NEXT ACTION:</span>
                    <span className="text-emerald-200 font-medium">{explainableReasoning.next_action}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Gathered Facts vs Missing Information */}
            <div className="p-4 rounded-3xl bg-space-card/80 border border-white/10 backdrop-blur-2xl shadow-card-soft space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-white uppercase tracking-wider">
                <Stethoscope className="w-4 h-4 text-purple-400" />
                <span>Evidence Checklist</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                {/* Missing Facts */}
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1.5">
                  <div className="text-[10px] font-mono text-amber-300 font-bold uppercase flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Missing Facts ({missingFacts.length})</span>
                  </div>
                  <ul className="space-y-1 text-[11px] text-amber-200 font-mono">
                    {missingFacts.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-amber-400 shrink-0" />
                        <span className="truncate">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Gathered Facts */}
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-1.5">
                  <div className="text-[10px] font-mono text-emerald-300 font-bold uppercase flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Gathered Facts</span>
                  </div>
                  <ul className="space-y-1 text-[11px] text-emerald-200 font-mono">
                    {Object.entries(gatheredFacts).filter(([, val]) => val === true || typeof val === 'string' || typeof val === 'number').slice(0, 4).map(([k, val], idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-emerald-400 shrink-0" />
                        <span className="capitalize truncate">{k.replace('_', ' ')}: <strong className="text-white">{String(val)}</strong></span>
                      </li>
                    ))}
                    {Object.keys(gatheredFacts).length === 0 && (
                      <li className="text-slate-500 text-[10px]">Awaiting initial facts...</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            {/* Active Tools Checklist */}
            <div className="p-4 rounded-3xl bg-space-card/80 border border-white/10 backdrop-blur-2xl shadow-card-soft space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  <span>Tool Orchestration</span>
                </div>
                {!hasEvidence && (
                  <span className="text-[10px] font-mono text-amber-400">911 GATED UNTIL EVIDENCE MET</span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
                {availableToolsList.map((tool) => {
                  const isActivated = activatedToolsChecklist.includes(tool.key);
                  return (
                    <div 
                      key={tool.key}
                      className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${
                        isActivated 
                          ? 'bg-cyan-500/15 border-cyan-400/50 text-cyan-200 font-bold' 
                          : 'bg-space-bg/40 border-white/5 text-slate-500 opacity-60'
                      }`}
                    >
                      <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border text-[9px] ${
                        isActivated ? 'bg-cyan-400 text-slate-950 border-white font-bold' : 'border-slate-600'
                      }`}>
                        {isActivated ? '✓' : ''}
                      </div>
                      <span className="truncate">{tool.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Hospital Responder Handoff Card (Gated until evidence threshold) */}
            {hasEvidence && (
              <div className="p-4 rounded-3xl bg-space-card/90 border border-purple-500/30 backdrop-blur-2xl shadow-card-soft space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-purple-300 uppercase tracking-wider">
                    <FileText className="w-4 h-4 text-purple-400" />
                    <span>Hospital Responder Handoff</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400">911 NOTIFIED</span>
                </div>

                <div className="p-3 rounded-2xl bg-space-bg/90 border border-white/10 text-[11px] font-mono text-slate-300 leading-relaxed whitespace-pre-line">
                  {handoffReport}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </AuroraBackground>
  );
};
