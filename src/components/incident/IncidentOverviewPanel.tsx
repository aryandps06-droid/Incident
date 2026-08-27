import React from 'react';
import { motion } from 'framer-motion';
import { useIncident } from '../../context/IncidentContext';
import { 
  Users, 
  UserCheck, 
  Server, 
  AlertCircle
} from 'lucide-react';

export const IncidentOverviewPanel: React.FC = () => {
  const { currentIncident, activeSpeaker, setActiveSpeaker, setActiveSpeakerRole } = useIncident();

  const roleColors: Record<string, string> = {
    'Incident Commander': 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    'Backend Engineer': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    'Frontend Engineer': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    'SRE': 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    'DevOps Engineer': 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    'Support Engineer': 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    'Product Manager': 'bg-pink-500/20 text-pink-300 border-pink-500/40',
    'Business Lead': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
    'Observer': 'bg-slate-700/50 text-slate-400 border-slate-600',
    'Security Engineer': 'bg-red-500/20 text-red-300 border-red-500/40',
    'Database Engineer': 'bg-teal-500/20 text-teal-300 border-teal-500/40',
    'Network Engineer': 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    'QA Engineer': 'bg-violet-500/20 text-violet-300 border-violet-500/40',
    'Engineering Manager': 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    'Customer Support': 'bg-lime-500/20 text-lime-300 border-lime-500/40',
    'Other / Unknown': 'bg-slate-700/50 text-slate-400 border-slate-600',
    'AI Incident Commander': 'bg-purple-500/20 text-purple-300 border-purple-500/40 font-bold'
  };

  return (
    <div className="bg-[#050A1F]/90 border border-cyan-500/20 rounded-2xl p-4 flex flex-col gap-4 shadow-2xl backdrop-blur-xl h-[560px] overflow-hidden justify-between select-none">
      
      {/* Commander & Incident Metadata */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5 font-bold">
            <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
            INCIDENT COMMANDER
          </span>
          <span className="text-xs font-mono text-cyan-300 font-bold px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 shadow-sm">
            {currentIncident.incidentCommander}
          </span>
        </div>

        {/* Customer Impact Box */}
        <div className="bg-slate-900/80 border border-rose-500/30 rounded-xl p-3 text-xs shadow-lg">
          <span className="font-bold text-rose-400 flex items-center gap-1.5 mb-1 text-[11px] uppercase tracking-wider font-mono">
            <AlertCircle className="w-3.5 h-3.5" />
            Customer Impact
          </span>
          <p className="text-slate-300 leading-relaxed font-sans">{currentIncident.impact}</p>
        </div>
      </div>

      {/* Affected Services */}
      <div>
        <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2 font-bold">
          <Server className="w-3 h-3 text-indigo-400" />
          AFFECTED SERVICES
        </span>
        <div className="flex flex-wrap gap-1.5">
          {currentIncident.affectedServices.map(svc => (
            <span key={svc} className="text-[11px] font-mono px-2 py-0.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-slate-200">
              {svc}
            </span>
          ))}
        </div>
      </div>

      <hr className="border-white/[0.07]" />

      {/* Active Incident Participants & Roles */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono text-slate-300 uppercase tracking-wider flex items-center gap-1.5 font-bold">
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            INCIDENT PARTICIPANTS ({currentIncident.participants.length})
          </span>
        </div>

        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-1.5 scrollbar-thin scrollbar-thumb-cyan-500/20">
          {currentIncident.participants.map(p => {
            const isSelected = activeSpeaker.id === p.id;
            return (
              <motion.div
                key={p.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => {
                  setActiveSpeaker(p);
                  setActiveSpeakerRole(p.role);
                }}
                className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-cyan-950/50 border-cyan-400/60 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                    : 'bg-slate-900/60 border-white/[0.06] hover:border-white/[0.15]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <img
                      src={p.avatar}
                      alt={p.name}
                      className="w-7 h-7 rounded-full object-cover border border-slate-700"
                    />
                    <span className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border border-[#050A1F] ${
                      p.status === 'active' ? 'bg-emerald-400' : 'bg-slate-500'
                    }`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-slate-100">{p.name}</span>
                      {p.name === 'EchoAid X' && (
                        <span className="text-[8.5px] px-1.5 py-0.2 rounded-full bg-purple-900/80 text-purple-300 font-mono font-bold border border-purple-500/40">
                          AI COMMANDER
                        </span>
                      )}
                    </div>
                    <span className={`inline-block text-[9.5px] font-mono px-1.5 py-0.2 rounded-md border mt-0.5 ${roleColors[p.role] || roleColors['Observer']}`}>
                      {p.role}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-[9.5px] font-mono text-slate-400">
                    {Math.round(p.confidence * 100)}%
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
