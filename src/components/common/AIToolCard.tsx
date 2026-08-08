import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Building2, Users, FileText, CheckCircle2, ShieldAlert } from 'lucide-react';

export interface AIToolInvocation {
  id: string;
  name: 'open_live_maps' | 'share_current_location' | 'prepare_emergency_report' | 'find_nearby_hospitals' | 'access_emergency_contacts' | 'generate_emergency_summary';
  title: string;
  status: 'EXECUTING' | 'SUCCESS';
  payload?: any;
}

interface AIToolCardProps {
  tool: AIToolInvocation;
  onAction?: () => void;
}

export const AIToolCard: React.FC<AIToolCardProps> = ({ tool, onAction }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="p-4 rounded-3xl glass-card border border-cyan-400/40 shadow-glow-cyan backdrop-blur-3xl space-y-3 font-mono text-xs my-2 max-w-xl"
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
        <div className="flex items-center gap-2 text-cyan-300 font-bold">
          <div className="p-1.5 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-400">
            {tool.name === 'open_live_maps' && <Navigation className="w-4 h-4" />}
            {tool.name === 'share_current_location' && <MapPin className="w-4 h-4 text-emerald-400" />}
            {tool.name === 'find_nearby_hospitals' && <Building2 className="w-4 h-4 text-purple-400" />}
            {tool.name === 'access_emergency_contacts' && <Users className="w-4 h-4 text-sky-400" />}
            {tool.name === 'prepare_emergency_report' && <FileText className="w-4 h-4 text-amber-400" />}
            {tool.name === 'generate_emergency_summary' && <ShieldAlert className="w-4 h-4 text-red-400" />}
          </div>
          <span className="uppercase text-[11px] tracking-wide">{tool.title}</span>
        </div>

        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1 font-bold">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span>TOOL INVOKED</span>
        </span>
      </div>

      {/* Tool-specific interactive body */}
      {tool.name === 'open_live_maps' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-slate-300">
            <span>GPS Pin: 37.7749° N, 122.4194° W</span>
            <span className="text-cyan-400 font-bold">San Francisco, CA</span>
          </div>
          <div className="h-20 w-full rounded-2xl bg-space-bg border border-cyan-400/30 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-950/40 via-space-card to-space-bg" />
            <div className="relative z-10 flex items-center gap-2 text-cyan-300 text-xs font-sans">
              <MapPin className="w-4 h-4 text-red-400 animate-bounce" />
              <span>Live Emergency Radar Route Active</span>
            </div>
          </div>
        </div>
      )}

      {tool.name === 'share_current_location' && (
        <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Encrypted GPS Pin Broadcasted to EMS Grid</span>
          </div>
          <span className="font-bold">37.7749° N</span>
        </div>
      )}

      {tool.name === 'find_nearby_hospitals' && (
        <div className="space-y-1.5">
          <div className="flex justify-between font-bold text-white">
            <span>UCSF Helen Diller Medical Center</span>
            <span className="text-emerald-400">ETA: 4 mins</span>
          </div>
          <div className="text-[11px] text-slate-400">Level I Trauma Center • 4 Open Bays Available</div>
        </div>
      )}

      {tool.name === 'access_emergency_contacts' && (
        <div className="space-y-1.5 text-slate-300">
          <div className="flex justify-between items-center text-[11px]">
            <span>1. Dr. Sarah Connor (Spouse/Physician)</span>
            <span className="text-emerald-400 font-bold">✓ SMS Sent</span>
          </div>
          <div className="flex justify-between items-center text-[11px]">
            <span>2. Marcus Vance (Brother)</span>
            <span className="text-emerald-400 font-bold">✓ SMS Sent</span>
          </div>
        </div>
      )}

      {tool.name === 'prepare_emergency_report' && (
        <div className="flex justify-between items-center p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300">
          <span>Triage Assessment #EAX-2457 Compiled</span>
          <button 
            onClick={onAction}
            className="px-3 py-1 rounded-xl bg-amber-500 text-slate-950 font-sans font-bold text-[10px] hover:scale-105 transition-all"
          >
            Preview Report
          </button>
        </div>
      )}
    </motion.div>
  );
};
