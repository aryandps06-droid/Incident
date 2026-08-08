import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useEmergency } from '../../context/EmergencyContext';
import { Video, Mic, PhoneOff, X, UserCheck } from 'lucide-react';

export const TelehealthModal: React.FC = () => {
  const { activeModal, setActiveModal } = useEmergency();
  const [isMuted, setIsMuted] = useState(false);

  if (activeModal !== 'telehealth') return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-2xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-3xl bg-command-card border border-cyber-purple/50 rounded-2xl p-6 space-y-6 shadow-glow-purple"
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyber-purple/20 border border-cyber-purple/40 text-cyber-purple">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-sans">Emerg-Med Telehealth Video Bridge</h3>
              <div className="text-xs font-mono text-emerald-400">Dr. Sarah Connor, MD • Trauma Specialist Connected</div>
            </div>
          </div>
          <button
            onClick={() => setActiveModal('none')}
            className="p-2 rounded-xl bg-command-surface text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Screen Canvas Simulator */}
        <div className="relative aspect-video rounded-2xl bg-command-bg border border-command-border overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 bg-hud-grid opacity-30 pointer-events-none" />
          
          <div className="text-center space-y-3 z-10">
            <div className="w-20 h-20 rounded-full bg-cyber-purple/20 border-2 border-cyber-purple flex items-center justify-center text-cyber-purple mx-auto animate-pulse">
              <UserCheck className="w-10 h-10" />
            </div>
            <div className="font-mono text-sm font-bold text-white">LIVE ENCRYPTED RTC VIDEO FEED</div>
            <div className="text-xs font-mono text-cyber-cyan">UCSF Trauma Emergency Desk • 1080p 60fps</div>
          </div>

          {/* Self PIP View */}
          <div className="absolute bottom-4 right-4 w-36 aspect-video rounded-xl bg-slate-900 border border-cyber-cyan/40 p-2 flex items-center justify-center text-[10px] font-mono text-cyan-300">
            PATIENT FEED (LIVE)
          </div>
        </div>

        {/* Video Call Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-3 rounded-full border ${isMuted ? 'bg-cyber-red text-white' : 'bg-command-surface text-slate-200'}`}
          >
            <Mic className="w-5 h-5" />
          </button>
          <button
            onClick={() => setActiveModal('none')}
            className="px-6 py-3 rounded-full bg-cyber-red text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-glow-red"
          >
            <PhoneOff className="w-5 h-5" />
            <span>End Telehealth Bridge</span>
          </button>
        </div>

      </motion.div>
    </div>
  );
};
