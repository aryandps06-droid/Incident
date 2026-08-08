import React from 'react';
import { motion } from 'framer-motion';
import { useEmergency } from '../../context/EmergencyContext';
import { ShieldCheck, Building2, MapPin, CheckCircle2, Siren, ArrowUpRight } from 'lucide-react';

export const EmergencyStatusPanel: React.FC = () => {
  const { isEmergencyActive, activeSession, hospitals, locationGPS } = useEmergency();
  const primaryHospital = hospitals[0];

  return (
    <div className="space-y-6 w-full max-w-sm">
      
      {/* Card 1: Clean Emergency Status Card */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className={`p-6 rounded-3xl backdrop-blur-2xl border transition-all duration-300 ${
          isEmergencyActive 
            ? 'glass-card-emergency border-brand-emergency/50 shadow-glow-red' 
            : 'glass-card border-space-border shadow-card-soft'
        }`}
      >
        <div className="flex items-center justify-between border-b border-space-border/60 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${isEmergencyActive ? 'bg-brand-emergency animate-ping' : 'bg-brand-success'}`} />
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-slate-300">
              {isEmergencyActive ? 'ACTIVE CRITICAL TRIAGE' : 'SYSTEM STANDBY'}
            </span>
          </div>
          <span className="text-[11px] font-mono text-brand-accent">0.4s AI LATENCY</span>
        </div>

        {isEmergencyActive ? (
          <div className="space-y-3">
            <div className="text-xl font-extrabold text-white font-sans">
              {activeSession?.category || 'Cardiac Emergency'}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {activeSession?.guidance || 'High risk acute coronary symptoms detected. Paramedic dispatch notified.'}
            </p>
            <div className="p-3 rounded-2xl bg-space-surface border border-space-border text-xs font-mono text-brand-emergency flex items-center gap-2">
              <Siren className="w-4 h-4 animate-spin text-brand-emergency" />
              <span>Paramedic Dispatch Unit #42 En Route (ETA 3.8m)</span>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-base font-bold text-white font-sans flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-brand-success" />
              AI Neural Edge Active
            </div>
            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              Monitoring vital sensors, decibel shocks, and orbital GPS channels. Ready for immediate response.
            </p>
          </div>
        )}
      </motion.div>

      {/* Card 2: Nearby Hospital Card */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="p-6 rounded-3xl glass-card border border-space-border shadow-card-soft space-y-4 hover:border-brand-accent/40 transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between border-b border-space-border/60 pb-3">
          <span className="text-xs font-mono font-bold text-brand-accent flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-brand-accent" />
            NEARBY HOSPITAL
          </span>
          <span className="px-2 py-0.5 rounded-full bg-brand-success/15 text-brand-success text-[10px] font-mono font-bold">
            {primaryHospital.trauma_level}
          </span>
        </div>

        <div>
          <div className="text-base font-bold text-white font-sans group-hover:text-brand-accent transition-colors flex items-center justify-between">
            <span>{primaryHospital.name}</span>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-brand-accent transition-colors" />
          </div>
          <div className="text-xs text-slate-400 font-mono mt-1">{primaryHospital.address}</div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
          <div className="p-3 rounded-2xl bg-space-surface border border-space-border text-center">
            <div className="text-[10px] text-slate-400">DISTANCE</div>
            <div className="text-sm font-bold text-white mt-0.5">{primaryHospital.distance}</div>
          </div>
          <div className="p-3 rounded-2xl bg-space-surface border border-space-border text-center">
            <div className="text-[10px] text-slate-400">AMBULANCE ETA</div>
            <div className="text-sm font-bold text-brand-success mt-0.5">{primaryHospital.eta}</div>
          </div>
        </div>
      </motion.div>

      {/* Card 3: Live Location Card */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="p-6 rounded-3xl glass-card border border-space-border shadow-card-soft space-y-3"
      >
        <div className="flex items-center justify-between border-b border-space-border/60 pb-3">
          <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-brand-accent animate-bounce" />
            LIVE GPS BEACON
          </span>
          <span className="text-[10px] font-mono text-brand-success flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Locked (±0.8m)
          </span>
        </div>

        <div className="text-xs font-mono text-white font-bold">
          {locationGPS}
        </div>
        <div className="text-[11px] text-slate-400 font-sans">
          Encrypted coordinates continuously shared with emergency responders during distress.
        </div>
      </motion.div>

    </div>
  );
};
