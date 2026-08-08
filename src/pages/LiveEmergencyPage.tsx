import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEmergency } from '../context/EmergencyContext';
import { GlassCard } from '../components/common/GlassCard';
import { Badge } from '../components/common/Badge';
import { AudioWaveform } from '../components/common/AudioWaveform';
import { 
  PhoneCall, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  Heart, 
  Activity, 
  Radio, 
  ShieldAlert,
  ArrowRight,
  Siren
} from 'lucide-react';

export const LiveEmergencyPage: React.FC = () => {
  const { 
    activeSession, 
    endEmergencySession, 
    speakInstruction, 
    stopVoice, 
    isVoiceActive, 
    setIsVoiceActive,
    currentVitalHeartRate,
    currentVitalSpo2
  } = useEmergency();

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [cprCount, setCprCount] = useState(0);
  const [isCPRBeatActive, setIsCPRBeatActive] = useState(false);
  const [dispatchETA, setDispatchETA] = useState(240); // 4 minutes countdown

  // Audio Metronome Click Synth (Web Audio API)
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playClick = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 880; // A5 pitch
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

  // Dispatch ETA Countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setDispatchETA((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // CPR Metronome Loop if active step is CPR metronome
  const activeStep = activeSession?.steps[currentStepIndex];

  useEffect(() => {
    let metronomeTimer: any;
    if (activeStep?.action_type === 'metronome') {
      const intervalMs = (60 / (activeStep.bpm || 110)) * 1000; // ~545ms for 110 BPM
      metronomeTimer = setInterval(() => {
        setIsCPRBeatActive(true);
        playClick();
        setCprCount((c) => c + 1);
        setTimeout(() => setIsCPRBeatActive(false), 150);
      }, intervalMs);
    }

    return () => {
      clearInterval(metronomeTimer);
    };
  }, [activeStep]);

  // Speak step whenever step changes
  useEffect(() => {
    if (activeStep) {
      speakInstruction(`Step ${activeStep.step}: ${activeStep.title}. ${activeStep.instruction}`);
    }
  }, [currentStepIndex, activeStep]);

  const handleNextStep = () => {
    if (activeSession && currentStepIndex < activeSession.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      // Loop or finish
      speakInstruction("All initial triage guidance steps completed. Emergency responders are en route.");
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const formatETA = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!activeSession) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <ShieldAlert className="w-16 h-16 text-cyan-400 mx-auto animate-bounce" />
        <h2 className="text-3xl font-extrabold text-white">No Live Emergency Active</h2>
        <p className="text-slate-400">Launch an emergency triage session from the Dashboard or Landing Page.</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-120px)] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* Ambient Red Glow Background overlay */}
      <div className="fixed inset-0 bg-gradient-to-b from-emergency-500/10 via-navy-950/90 to-navy-950 pointer-events-none z-0" />
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-emergency-500 to-red-600 animate-pulse z-50" />

      {/* Top Banner Status Bar */}
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-2xl glass-panel-emergency border-red-500/50 shadow-glow-red">
        <div className="flex items-center gap-4">
          <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-red-600 text-white shadow-glow-red">
            <Siren className="w-7 h-7 animate-spin" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <Badge variant="red" pulse>LIVE EMERGENCY SESSION</Badge>
              <span className="text-xs font-mono text-cyan-300">ID: {activeSession.assessment_id}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
              {activeSession.protocol_title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button
            onClick={() => {
              if (isVoiceActive) {
                stopVoice();
                setIsVoiceActive(false);
              } else {
                setIsVoiceActive(true);
                if (activeStep) speakInstruction(activeStep.instruction);
              }
            }}
            className={`p-3 rounded-xl border font-mono text-xs flex items-center gap-2 transition-all ${
              isVoiceActive
                ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                : 'bg-navy-900 border-slate-700 text-slate-400'
            }`}
          >
            {isVoiceActive ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            <span>{isVoiceActive ? 'VOICE AI ON' : 'VOICE MUTED'}</span>
          </button>

          <button
            onClick={endEmergencySession}
            className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-emerald-600 text-white font-extrabold text-xs tracking-wider uppercase transition-all shadow-lg flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            RESOLVE & EXIT SESSION
          </button>
        </div>
      </div>

      {/* Main HUD Grid */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Interactive Step Guidance Engine (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Step Progress Tracker */}
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 bg-navy-900/80 p-4 rounded-xl border border-cyan-500/20">
            <span>ACTION STEP {currentStepIndex + 1} OF {activeSession.steps.length}</span>
            <div className="flex items-center gap-1.5">
              {activeSession.steps.map((st, i) => (
                <button
                  key={st.step}
                  onClick={() => setCurrentStepIndex(i)}
                  className={`h-2.5 rounded-full transition-all ${
                    i === currentStepIndex
                      ? 'w-8 bg-cyan-400 shadow-glow-cyan'
                      : i < currentStepIndex
                      ? 'w-4 bg-emerald-400'
                      : 'w-4 bg-slate-700'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Active Step Card */}
          <AnimatePresence mode="wait">
            {activeStep && (
              <motion.div
                key={activeStep.step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <GlassCard className="p-8 sm:p-10 border-cyan-500/40 space-y-6">
                  
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 font-mono text-xs border border-cyan-500/30">
                      STEP {activeStep.step} • {activeStep.action_type.toUpperCase()}
                    </span>

                    {/* Action Type Specific Indicators */}
                    {activeStep.action_type === 'metronome' && (
                      <div className="flex items-center gap-2 text-xs font-mono text-red-400 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/30">
                        <Heart className="w-4 h-4 animate-ping" />
                        <span>METRONOME ACTIVE: {activeStep.bpm || 110} BPM</span>
                      </div>
                    )}
                  </div>

                  <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-snug">
                    {activeStep.title}
                  </h2>

                  <p className="text-base sm:text-lg text-slate-200 leading-relaxed font-sans bg-navy-950/80 p-6 rounded-2xl border border-slate-800">
                    "{activeStep.instruction}"
                  </p>

                  {/* CPR Pulsing Beat Metronome Visualizer */}
                  {activeStep.action_type === 'metronome' && (
                    <div className="p-6 rounded-2xl bg-navy-950 border border-red-500/30 flex flex-col items-center justify-center space-y-4">
                      <div className="text-xs font-mono text-slate-400">RHYTHMIC COMPRESSION PACE COUNTER</div>
                      
                      <div className="relative flex items-center justify-center">
                        <motion.div
                          animate={{ scale: isCPRBeatActive ? 1.35 : 1 }}
                          transition={{ duration: 0.1 }}
                          className={`w-32 h-32 rounded-full flex flex-col items-center justify-center border-4 ${
                            isCPRBeatActive 
                              ? 'bg-red-600 border-white shadow-[0_0_50px_rgba(255,0,60,0.8)] text-white' 
                              : 'bg-navy-900 border-red-500/40 text-red-400'
                          }`}
                        >
                          <span className="text-3xl font-extrabold font-mono">{cprCount}</span>
                          <span className="text-[10px] font-mono uppercase tracking-widest">PRESS HARD</span>
                        </motion.div>
                      </div>

                      <div className="text-xs font-mono text-cyan-300">
                        Target: 100-120 Compressions / Min (Depth: 2 Inches)
                      </div>
                    </div>
                  )}

                  {/* Navigation Step Control Buttons */}
                  <div className="pt-4 flex items-center justify-between gap-4">
                    <button
                      onClick={handlePrevStep}
                      disabled={currentStepIndex === 0}
                      className="px-5 py-3 rounded-xl glass-panel text-xs font-bold text-slate-300 disabled:opacity-40"
                    >
                      Previous Step
                    </button>

                    <button
                      onClick={handleNextStep}
                      className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-extrabold text-sm uppercase tracking-wider shadow-glow-cyan hover:scale-105 transition-all flex items-center gap-2"
                    >
                      <span>
                        {currentStepIndex === activeSession.steps.length - 1 ? 'Finish Guidance Steps' : 'Step Completed Next Step'}
                      </span>
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>

                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>

          {/* AI Guidance Audio Feedback Box */}
          <GlassCard className="p-5 border-cyan-500/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
              <div>
                <div className="text-xs font-mono text-cyan-300">VOICE GUIDANCE FEEDBACK</div>
                <div className="text-xs text-slate-400">EchoAid AI is continuously analyzing ambient telemetry</div>
              </div>
            </div>
            <AudioWaveform active={isVoiceActive} barCount={20} height={28} />
          </GlassCard>

        </div>

        {/* Right Column: 911 Dispatch Tracker & Vitals Monitor (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Automated Dispatch Tracker */}
          <GlassCard className="p-6 border-red-500/40 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-mono text-red-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                <Siren className="w-4 h-4 text-red-500 animate-pulse" />
                911 EMS DISPATCH TRACKER
              </span>
              <Badge variant="red" pulse>EN ROUTE</Badge>
            </div>

            <div className="text-center py-4 space-y-2 bg-navy-950 rounded-xl border border-slate-800">
              <div className="text-xs font-mono text-slate-400">ESTIMATED PARAMEDIC ARRIVAL</div>
              <div className="text-4xl font-extrabold font-mono text-red-400 tracking-wider">
                {formatETA(dispatchETA)}
              </div>
              <div className="text-[11px] font-mono text-cyan-400">AMBULANCE UNIT #42 DISPATCHED</div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-mono">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>GPS Location Broadcasted (37.7749° N)</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400 font-mono">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>ICE Contacts Notified via SMS</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400 font-mono">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Medical ID attached to dispatch payload</span>
              </div>
            </div>
          </GlassCard>

          {/* Vitals Telemetry Card */}
          <GlassCard className="p-6 border-cyan-500/25 space-y-4">
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-cyan-400" />
              LIVE VITALS TELEMETRY
            </span>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 rounded-xl bg-navy-950 border border-slate-800">
                <div className="text-[10px] font-mono text-slate-400">HEART RATE</div>
                <div className="text-2xl font-extrabold text-red-400 font-mono">{currentVitalHeartRate}</div>
                <div className="text-[10px] text-slate-500">BPM</div>
              </div>
              <div className="p-3 rounded-xl bg-navy-950 border border-slate-800">
                <div className="text-[10px] font-mono text-slate-400">SPO2 OXYGEN</div>
                <div className="text-2xl font-extrabold text-cyan-400 font-mono">{currentVitalSpo2}%</div>
                <div className="text-[10px] text-slate-500">OPTIMAL</div>
              </div>
            </div>
          </GlassCard>

          {/* Emergency Contact Quick Hotline */}
          <GlassCard className="p-5 border-slate-800 space-y-3">
            <span className="text-xs font-mono text-slate-400">DIRECT EMERGENCY HARDWARE PHONE RELAY</span>
            <button 
              onClick={() => alert("Direct 911 phone bridge initiated.")}
              className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider shadow-glow-red flex items-center justify-center gap-2"
            >
              <PhoneCall className="w-4 h-4" />
              CALL 911 DIRECTLY NOW
            </button>
          </GlassCard>

        </div>

      </div>

    </div>
  );
};
