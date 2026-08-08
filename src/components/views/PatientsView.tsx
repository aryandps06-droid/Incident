import React from 'react';
import { useEmergency } from '../../context/EmergencyContext';
import { GlassCard } from '../common/GlassCard';
import { Badge } from '../common/Badge';
// Patients view

export const PatientsView: React.FC = () => {
  const { profile } = useEmergency();

  const patientsList = [
    { id: 'P-9921', name: profile?.full_name || 'Alexander Vance', age: 34, blood: 'O+', status: 'Active Emergency Triage', risk: 'HIGH', allergies: 'Penicillin, Bee Stings' },
    { id: 'P-8810', name: 'Dr. Sarah Connor', age: 38, blood: 'A+', status: 'Stable Monitoring', risk: 'LOW', allergies: 'None' },
    { id: 'P-7704', name: 'Marcus Vance', age: 31, blood: 'B+', status: 'Resolved Incident', risk: 'LOW', allergies: 'Latex' },
  ];

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-command-bg/95 hud-grid">
      <div className="flex items-center justify-between border-b border-command-border pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white font-sans">Patient Telemetry Queue & Medical ID Vaults</h1>
            <Badge variant="cyan">3 MONITORED PATIENTS</Badge>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">Real-time cardiac, respiratory, and GPS beacon monitoring for registered patients.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {patientsList.map((p) => (
          <GlassCard key={p.id} className="p-6 border-command-border space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Badge variant={p.risk === 'HIGH' ? 'red' : 'emerald'}>{p.risk} RISK</Badge>
                <span className="font-mono text-xs text-slate-400">{p.id}</span>
              </div>
              <span className="text-xs font-mono text-cyan-300 font-bold">{p.blood}</span>
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white font-sans">{p.name}</h3>
              <p className="text-xs text-slate-400 font-mono">{p.age} Yrs • {p.status}</p>
            </div>

            <div className="p-3 rounded-xl bg-command-surface border border-slate-800 text-xs text-slate-300 space-y-1 font-mono">
              <div className="text-[10px] text-slate-400">KNOWN SEVERE ALLERGIES</div>
              <div className="text-cyber-red font-bold">{p.allergies}</div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};
