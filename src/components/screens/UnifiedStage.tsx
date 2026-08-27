import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEmergency } from '../../context/EmergencyContext';
import { LandingScreen } from './LandingScreen';
import { IncidentHeader } from '../incident/IncidentHeader';
import { IncidentOverviewPanel } from '../incident/IncidentOverviewPanel';
import { LiveRoomPanel } from '../incident/LiveRoomPanel';
import { AIIntelligencePanel } from '../incident/AIIntelligencePanel';
import { LiveTimelinePanel } from '../incident/LiveTimelinePanel';
import { EvidenceDrawer } from '../incident/EvidenceDrawer';
import { CriticalActionModal } from '../incident/CriticalActionModal';
import { FinalReportModal } from '../incident/FinalReportModal';

export const UnifiedStage: React.FC = () => {
  const { 
    screenState, 
    isListening, 
    isSpeaking, 
    isAnalyzing, 
    isUserSpeaking, 
    isAISpeaking 
  } = useEmergency();

  const [toasts] = useState<Array<{ id: number; text: string; icon?: React.ReactNode }>>([]);

  return (
    <div className="relative w-full min-h-screen bg-[#020304] overflow-hidden">
      
      {/* LOCKED LANDING SCREEN: Always Mounted in Background */}
      <div className="absolute inset-0 z-0">
        <LandingScreen />
      </div>

      {/* DYNAMIC AMBIENT STATE LIGHTING */}
      <AnimatePresence>
        {screenState !== 'landing' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className={`absolute inset-0 z-10 pointer-events-none mix-blend-screen transition-colors duration-1000 ${
              isAnalyzing ? 'bg-purple-900/10' :
              (isUserSpeaking || isListening) ? 'bg-blue-900/10' :
              (isAISpeaking || isSpeaking) ? 'bg-cyan-900/10' :
              'bg-transparent'
            }`}
          >
            <div className={`absolute inset-0 transition-opacity duration-1000 ${isAnalyzing ? 'opacity-100' : 'opacity-0'}`} 
                 style={{ background: 'radial-gradient(circle at 50% 50%, rgba(168,85,247,0.15) 0%, transparent 60%)' }} />
            <div className={`absolute inset-0 transition-opacity duration-1000 ${(isUserSpeaking || isListening) ? 'opacity-100' : 'opacity-0'}`} 
                 style={{ background: 'radial-gradient(circle at 50% 50%, rgba(59,130,246,0.15) 0%, transparent 60%)' }} />
            <div className={`absolute inset-0 transition-opacity duration-1000 ${(isAISpeaking || isSpeaking) ? 'opacity-100' : 'opacity-0'}`} 
                 style={{ background: 'radial-gradient(circle at 50% 50%, rgba(0,229,255,0.15) 0%, transparent 60%)' }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* OVERLAY CONVERSATION STAGE: Incident Commander Room */}
      <AnimatePresence>
        {screenState !== 'landing' && (
          <motion.div
            key="conversation-overlay"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4 }}
            className="relative z-30 min-h-screen bg-[#03050F] text-slate-100 flex flex-col pointer-events-auto pb-12"
          >
            <IncidentHeader />

            <div className="max-w-[1700px] mx-auto w-full p-4 flex-1 flex flex-col gap-4">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-3">
                  <IncidentOverviewPanel />
                </div>
                <div className="lg:col-span-5">
                  <LiveRoomPanel />
                </div>
                <div className="lg:col-span-4">
                  <AIIntelligencePanel />
                </div>
              </div>

              <LiveTimelinePanel />

              <EvidenceDrawer />
              <CriticalActionModal />
              <FinalReportModal />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLOATING TOAST NOTIFICATIONS */}
      <div className="fixed top-5 right-5 z-[60] flex flex-col gap-2 pointer-events-none items-end">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 40, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              className="flex items-center gap-3 pl-0 pr-4 py-3 rounded-[18px] bg-[#070C1E]/96 border border-white/10 text-white font-sans text-xs font-medium shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-2xl pointer-events-auto overflow-hidden"
            >
              <div className="w-1 self-stretch bg-cyan-400 rounded-full ml-0 shrink-0" />
              <div className="flex items-center gap-2.5 pl-2">
                {toast.icon}
                <span>{toast.text}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
};
