import React from 'react';
import { useEmergency } from '../../context/EmergencyContext';
import { GlassCard } from '../common/GlassCard';
import { Badge } from '../common/Badge';
// Hospitals view

export const HospitalsView: React.FC = () => {
  const { hospitals } = useEmergency();

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-command-bg/95 hud-grid">
      <div className="flex items-center justify-between border-b border-command-border pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white font-sans">Regional Trauma Center Network & Bay Capacity</h1>
            <Badge variant="emerald">3 MEDICAL CENTERS ONLINE</Badge>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">Live ICU bed availability, trauma bay capacity, and helipad status.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {hospitals.map((h) => (
          <GlassCard key={h.id} className="p-6 border-command-border space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <Badge variant="cyan">{h.trauma_level}</Badge>
              <span className="text-xs font-mono text-emerald-400 font-bold">ETA: {h.eta}</span>
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white font-sans">{h.name}</h3>
              <p className="text-xs text-slate-400 font-mono">{h.address}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono text-center">
              <div className="p-2.5 rounded-xl bg-command-surface border border-slate-800">
                <div className="text-[10px] text-slate-400">OPEN BAYS</div>
                <div className="text-lg font-extrabold text-cyan-300">{h.open_bays}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-command-surface border border-slate-800">
                <div className="text-[10px] text-slate-400">ICU BEDS</div>
                <div className="text-lg font-extrabold text-emerald-400">{h.icu_beds}</div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Helipad: <span className="text-white font-bold">{h.helipad ? 'READY' : 'NONE'}</span></span>
              <button 
                onClick={() => alert(`Direct dispatch bridge to ${h.name} initiated.`)}
                className="px-3 py-1.5 rounded-lg bg-cyber-cyan text-navy-950 font-bold text-[11px] hover:scale-105 transition-all"
              >
                Contact Bay Desk
              </button>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};
