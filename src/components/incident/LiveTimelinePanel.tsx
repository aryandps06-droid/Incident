import React from 'react';
import { useIncident } from '../../context/IncidentContext';
import { Clock } from 'lucide-react';

export const LiveTimelinePanel: React.FC = () => {
  const { currentIncident } = useIncident();

  const getEventBadgeClass = (type: string) => {
    switch (type) {
      case 'INCIDENT_CREATED': return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'FACT_CREATED': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'HYPOTHESIS_CREATED': return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'CONFLICT_DETECTED': return 'bg-rose-600/30 text-rose-200 border-rose-500/60 font-bold animate-pulse';
      case 'CRITICAL_ACTION_REQUESTED': return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'INCIDENT_STABILIZED': return 'bg-emerald-500/30 text-emerald-200 border-emerald-500/60 font-bold';
      default: return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="bg-[#050A1F]/90 border border-cyan-500/20 rounded-2xl p-4 shadow-2xl backdrop-blur-xl relative overflow-hidden">
      
      {/* Ambient Glow */}
      <div className="absolute bottom-0 right-0 w-64 h-32 bg-cyan-500/5 blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between mb-3 relative z-10">
        <span className="text-xs font-mono font-bold text-slate-100 tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          CONTINUOUS LIVE INCIDENT TIMELINE ({currentIncident.timeline.length} EVENTS)
        </span>
        <span className="text-[10px] font-mono text-cyan-400/80">Auto-synchronized with Evidence Engine</span>
      </div>

      <div className="relative border-l-2 border-cyan-500/20 ml-2 pl-4 flex flex-col gap-2.5 max-h-[160px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-cyan-500/20 relative z-10">
        {currentIncident.timeline.map((evt) => (
          <div key={evt.id} className="relative flex items-start gap-3">
            <span className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#06b6d4] border-2 border-[#050A1F]" />
            <div className="flex-1 bg-slate-900/60 border border-white/[0.06] hover:border-cyan-500/30 rounded-xl p-2.5 text-xs flex flex-col gap-1 transition-all">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-100">{evt.title}</span>
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-md border ${getEventBadgeClass(evt.eventType)}`}>
                    {evt.eventType}
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">{evt.timestamp}</span>
                </div>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed font-sans">{evt.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
