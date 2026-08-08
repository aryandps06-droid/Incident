import React from 'react';
import { motion } from 'framer-motion';
import { useEmergency } from '../../context/EmergencyContext';
import { VoiceWaveform } from '../home/VoiceWaveform';
import { AuroraBackground } from '../common/AuroraBackground';
import { 
  Siren, 
  HeartPulse, 
  Building2, 
  CheckCircle2, 
  ArrowRight,
  Bot,
  User
} from 'lucide-react';

export const EmergencyModeScreen: React.FC = () => {
  const { 
    activeSession, 
    dialogueMessages, 
    finishEmergencySession, 
    setActiveModal, 
    hospitals, 
    contacts 
  } = useEmergency();

  const primaryHospital = hospitals[0];

  return (
    <AuroraBackground>
      <div className="min-h-screen flex flex-col justify-between p-6 lg:p-8 select-none relative overflow-hidden">
        
        {/* Header */}
        <header className="flex items-center justify-between border-b border-brand-emergency/30 pb-4 z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-brand-emergency/20 border border-brand-emergency/50 flex items-center justify-center text-brand-emergency shadow-glow-red">
              <Siren className="w-5 h-5 animate-spin" />
            </div>
            <span className="text-xl font-extrabold text-white font-sans">
              EchoAid <span className="text-brand-emergency">X</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="px-4 py-1.5 rounded-full bg-brand-emergency/20 text-brand-emergency font-mono text-xs font-bold border border-brand-emergency/40 animate-pulse backdrop-blur-xl">
              EMERGENCY MODE ACTIVE
            </span>

            <button
              onClick={finishEmergencySession}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-brand-emergency via-red-600 to-rose-600 text-white font-sans font-bold text-xs shadow-glow-red flex items-center gap-2 hover:scale-105 transition-all"
            >
              <span>Finish & View Summary</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Grid Stage */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 my-6 items-start z-10 overflow-y-auto">
          
          <div className="lg:col-span-7 space-y-6 flex flex-col justify-between h-full">
            <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-2">
              {dialogueMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-5 rounded-3xl text-sm leading-relaxed space-y-1.5 backdrop-blur-2xl shadow-card-soft ${
                    msg.sender === 'ECHO_AI'
                      ? 'bg-space-card/90 border border-white/10 text-white'
                      : 'bg-gradient-to-r from-blue-600 via-brand-accent to-indigo-600 text-white font-medium shadow-glow-brand ml-8'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono opacity-70">
                    <span className="font-bold flex items-center gap-1">
                      {msg.sender === 'ECHO_AI' && <Bot className="w-3.5 h-3.5 text-brand-accent" />}
                      {msg.sender === 'USER' && <User className="w-3.5 h-3.5 text-white" />}
                      {msg.sender === 'ECHO_AI' ? 'EchoAid X' : 'You'}
                    </span>
                    <span>{msg.timestamp}</span>
                  </div>
                  <div>{msg.text}</div>
                </div>
              ))}
            </div>

            <div className="text-center pt-2">
              <VoiceWaveform active color="#FF4D4F" barCount={40} height={40} />
              <div className="text-[11px] font-mono text-brand-emergency font-bold mt-1">
                AI Continuous Emergency Telemetry Monitoring
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-5 space-y-4"
          >
            
            {/* Card 1: AI Analysis */}
            <div className="p-6 rounded-3xl glass-card-emergency border border-brand-emergency/50 space-y-3 shadow-glow-red backdrop-blur-3xl">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-brand-emergency uppercase">POSSIBLE EMERGENCY</span>
                <span className="text-xs font-mono text-white font-bold bg-brand-emergency/30 px-3 py-1 rounded-full border border-brand-emergency/40">
                  Confidence: {activeSession?.confidence_score ? Math.round(activeSession.confidence_score * 100) : 97}%
                </span>
              </div>

              <div className="text-2xl font-extrabold text-white font-sans">
                {activeSession?.category || 'Cardiac Arrest'}
              </div>

              <div className="w-full bg-space-bg h-2.5 rounded-full overflow-hidden border border-white/10">
                <div 
                  className="bg-gradient-to-r from-red-600 to-rose-500 h-full rounded-full shadow-glow-red" 
                  style={{ width: `${(activeSession?.confidence_score || 0.97) * 100}%` }} 
                />
              </div>
            </div>

            {/* Card 2: Recommended Actions */}
            <div className="p-6 rounded-3xl glass-card border border-white/10 space-y-4 shadow-card-soft backdrop-blur-3xl">
              <div className="text-xs font-mono font-bold text-slate-300 uppercase border-b border-white/10 pb-2">
                RECOMMENDED ACTIONS
              </div>

              <div className="space-y-3 text-xs">
                
                <div className="p-3.5 rounded-2xl bg-brand-emergency/15 border border-brand-emergency/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-brand-emergency text-white font-bold font-mono">1</div>
                    <div>
                      <div className="font-bold text-white text-sm">Call Ambulance</div>
                      <div className="text-[11px] text-slate-300">High Priority Dispatch</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-brand-emergency font-bold bg-brand-emergency/20 px-2.5 py-1 rounded-full border border-brand-emergency/30">
                    DISPATCHED
                  </span>
                </div>

                <div 
                  onClick={() => setActiveModal('cpr')}
                  className="p-3.5 rounded-2xl bg-space-surface/80 border border-white/10 hover:border-cyan-400 cursor-pointer flex items-center justify-between transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-space-card text-cyan-400 font-bold font-mono">2</div>
                    <div>
                      <div className="font-bold text-white text-sm group-hover:text-cyan-300 transition-colors">Start CPR</div>
                      <div className="text-[11px] text-slate-400">110 BPM Rhythmic Guide</div>
                    </div>
                  </div>
                  <HeartPulse className="w-5 h-5 text-cyan-400 animate-pulse" />
                </div>

                <div className="p-3.5 rounded-2xl bg-space-surface/80 border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-space-card text-brand-success font-bold font-mono">3</div>
                    <div>
                      <div className="font-bold text-white text-sm">Share Live Location</div>
                      <div className="text-[11px] text-slate-400">Broadcasting GPS coordinates</div>
                    </div>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-brand-success" />
                </div>

              </div>
            </div>

            {/* Card 3: Destination Hospital */}
            <div className="p-6 rounded-3xl glass-card border border-white/10 space-y-3 shadow-card-soft backdrop-blur-3xl">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300 font-bold flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-cyan-400" />
                  NEAREST DESTINATION
                </span>
                <span className="text-brand-success font-bold">ETA: 4 mins</span>
              </div>

              <div className="text-base font-bold text-white font-sans">{primaryHospital.name}</div>
              <div className="text-xs text-slate-400 font-mono">{primaryHospital.address}</div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-mono text-slate-400">
                <span>Ambulance: <span className="text-brand-success font-bold">On the way</span></span>
                <span>ICE Alerted: <span className="text-cyan-400 font-bold">{contacts.length} Contacts</span></span>
              </div>
            </div>

          </motion.div>

        </div>

      </div>
    </AuroraBackground>
  );
};
