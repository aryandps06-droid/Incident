import React from 'react';
import { useEmergency } from '../../context/EmergencyContext';
import { Badge } from '../common/Badge';
import { RadarGrid } from '../common/RadarGrid';
import { 
  Stethoscope, 
  CheckSquare, 
  Square, 
  Building2, 
  MapPin, 
  Siren
} from 'lucide-react';

export const RightPanel: React.FC = () => {
  const { 
    activeSession, 
    toggleStepCompleted, 
    hospitals, 
    contacts, 
    locationGPS 
  } = useEmergency();

  const primaryHospital = hospitals[0];

  return (
    <aside className="w-80 bg-command-card/90 border-l border-command-border backdrop-blur-2xl p-5 flex flex-col gap-5 overflow-y-auto select-none z-30">
      
      {/* 1. Emergency Severity & Current Diagnosis */}
      <div className="p-4 rounded-2xl bg-command-surface border border-cyber-red/40 space-y-2 shadow-glow-red">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono text-slate-400">EMERGENCY SEVERITY</span>
          <Badge variant="red" pulse>CRITICAL LEVEL 1</Badge>
        </div>
        <div className="text-base font-extrabold text-white font-sans">
          {activeSession?.category || 'Cardiac Emergency / ACS'}
        </div>
        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          {activeSession?.guidance || 'High risk acute coronary syndrome. Maintain rhythmic compression pace.'}
        </p>
      </div>

      {/* 2. Suggested Immediate Actions Checklist */}
      <div className="p-4 rounded-2xl bg-command-surface border border-command-border space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="text-xs font-mono text-cyber-cyan font-bold flex items-center gap-1.5">
            <Stethoscope className="w-4 h-4 text-cyber-cyan" />
            SUGGESTED ACTIONS ({activeSession?.steps.filter(s => s.completed).length || 0}/{activeSession?.steps.length || 4})
          </span>
        </div>

        <div className="space-y-2 text-xs">
          {(activeSession?.steps || [
            { step: 1, title: 'Verify Airway', instruction: 'Check airway clear', completed: true },
            { step: 2, title: 'Dispatch Telemetry', instruction: 'Send GPS payload', completed: true },
            { step: 3, title: 'Chest Compressions', instruction: '110 BPM pace', completed: false },
            { step: 4, title: 'AED Prep', instruction: 'Locate defibrillator', completed: false }
          ]).map((st, idx) => (
            <div
              key={st.step}
              onClick={() => toggleStepCompleted(idx)}
              className={`p-2.5 rounded-xl border cursor-pointer flex items-start gap-2.5 transition-all ${
                st.completed
                  ? 'bg-cyber-emerald/10 border-cyber-emerald/40 text-emerald-300'
                  : 'bg-command-bg border-slate-800 text-slate-300 hover:border-cyber-cyan/40'
              }`}
            >
              {st.completed ? (
                <CheckSquare className="w-4 h-4 text-cyber-emerald shrink-0 mt-0.5" />
              ) : (
                <Square className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              )}
              <div>
                <div className="font-bold text-white">{st.title}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{st.instruction}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Nearest Hospital & Trauma Center */}
      <div className="p-4 rounded-2xl bg-command-surface border border-command-border space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="text-xs font-mono text-cyber-cyan font-bold flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-cyber-cyan" />
            NEAREST TRAUMA CENTER
          </span>
          <Badge variant="emerald">{primaryHospital.trauma_level}</Badge>
        </div>

        <div className="space-y-1.5 text-xs">
          <div className="font-bold text-white text-sm">{primaryHospital.name}</div>
          <div className="text-slate-400 text-[11px]">{primaryHospital.address}</div>
          <div className="flex items-center justify-between pt-1 font-mono text-cyan-300">
            <span>Distance: {primaryHospital.distance}</span>
            <span className="font-bold text-emerald-400">ETA: {primaryHospital.eta}</span>
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
            <span>Open Bays: <span className="text-white font-bold">{primaryHospital.open_bays}</span></span>
            <span>Helipad: <span className="text-cyber-cyan">{primaryHospital.helipad ? 'READY' : 'NONE'}</span></span>
          </div>
        </div>
      </div>

      {/* 4. Live GPS Radar Map Visualizer */}
      <div className="p-4 rounded-2xl bg-command-surface border border-command-border space-y-2 text-center">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span>LIVE GPS SATELLITE BEACON</span>
          <MapPin className="w-3.5 h-3.5 text-cyber-red animate-bounce" />
        </div>
        <div className="w-full aspect-square max-h-[160px] mx-auto rounded-xl overflow-hidden border border-cyber-cyan/30">
          <RadarGrid />
        </div>
        <div className="text-[10px] font-mono text-cyan-300">
          {locationGPS}
        </div>
      </div>

      {/* 5. Ambulance Dispatch Progress Bar */}
      <div className="p-4 rounded-2xl bg-cyber-red/10 border border-cyber-red/35 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-cyber-red font-bold flex items-center gap-1">
            <Siren className="w-4 h-4 animate-spin text-cyber-red" />
            PARAMEDIC DISPATCH UNIT #42
          </span>
          <span className="text-white font-bold">ETA 3.4 MINS</span>
        </div>
        <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
          <div className="bg-gradient-to-r from-red-600 to-cyber-red h-full w-[70%] animate-pulse" />
        </div>
        <div className="text-[10px] font-mono text-slate-400 flex justify-between">
          <span>DISPATCH SENT</span>
          <span className="text-cyber-cyan">EN ROUTE</span>
          <span>ARRIVED</span>
        </div>
      </div>

      {/* 6. Emergency ICE Contacts Status */}
      <div className="p-4 rounded-2xl bg-command-surface border border-command-border space-y-2">
        <span className="text-xs font-mono text-slate-400 uppercase font-bold block mb-1">
          ICE EMERGENCY CONTACTS ({contacts.length})
        </span>
        <div className="space-y-1.5 text-xs">
          {contacts.slice(0, 2).map((c) => (
            <div key={c.id} className="p-2 rounded-lg bg-command-bg border border-slate-800 flex justify-between items-center">
              <div>
                <div className="font-bold text-white">{c.name}</div>
                <div className="text-[10px] text-slate-400">{c.phone}</div>
              </div>
              <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                NOTIFIED
              </span>
            </div>
          ))}
        </div>
      </div>

    </aside>
  );
};
