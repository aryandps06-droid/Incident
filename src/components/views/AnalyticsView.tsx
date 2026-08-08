import React from 'react';
import { GlassCard } from '../common/GlassCard';
import { Badge } from '../common/Badge';
// Analytics view

export const AnalyticsView: React.FC = () => {
  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-command-bg/95 hud-grid">
      <div className="flex items-center justify-between border-b border-command-border pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white font-sans">Emergency Mission Telemetry & Response Metrics</h1>
            <Badge variant="emerald">99.999% RELIABILITY</Badge>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">Aggregated statistics on response latencies, triage accuracy, and satellite uptime.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <GlassCard className="p-6 border-command-border">
          <div className="text-xs font-mono text-slate-400">AVERAGE AI LATENCY</div>
          <div className="text-3xl font-extrabold text-cyber-cyan font-mono mt-2">12ms</div>
          <div className="text-[11px] font-mono text-emerald-400 mt-1">0.4s Full Triage Response</div>
        </GlassCard>

        <GlassCard className="p-6 border-command-border">
          <div className="text-xs font-mono text-slate-400">PARAMEDIC RESPONDER ETA</div>
          <div className="text-3xl font-extrabold text-white font-mono mt-2">4.2m</div>
          <div className="text-[11px] font-mono text-emerald-400 mt-1">1.8 mins Faster than Regional Avg</div>
        </GlassCard>

        <GlassCard className="p-6 border-command-border">
          <div className="text-xs font-mono text-slate-400">TRIAGE MODEL ACCURACY</div>
          <div className="text-3xl font-extrabold text-cyber-purple font-mono mt-2">99.8%</div>
          <div className="text-[11px] font-mono text-slate-400 mt-1">ISO 13485 Benchmarked</div>
        </GlassCard>

        <GlassCard className="p-6 border-command-border">
          <div className="text-xs font-mono text-slate-400">INCIDENTS RESOLVED</div>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono mt-2">1,420</div>
          <div className="text-[11px] font-mono text-slate-400 mt-1">100% Audit Logging</div>
        </GlassCard>
      </div>
    </div>
  );
};
