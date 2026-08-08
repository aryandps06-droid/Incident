import React from 'react';
import { GlassCard } from '../common/GlassCard';
import { Badge } from '../common/Badge';
import { AudioWaveform } from '../common/AudioWaveform';
import { Play, Download, Clock } from 'lucide-react';

export const AICallsView: React.FC = () => {
  const callLogs = [
    { id: 'CALL-9981', time: '21:24:02', duration: '4m 32s', patient: 'Alexander Vance', intent: 'Cardiac Chest Pain Triage', status: 'Completed', latency: '12ms' },
    { id: 'CALL-8841', time: '20:15:30', duration: '3m 10s', patient: 'Sarah Connor', intent: 'Anaphylactic Stinger Reaction', status: 'Completed', latency: '14ms' },
    { id: 'CALL-7712', time: '18:40:11', duration: '5m 40s', patient: 'Marcus Vance', intent: 'Arterial Bleed Hemorrhage', status: 'Completed', latency: '11ms' },
  ];

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-command-bg/95 hud-grid">
      <div className="flex items-center justify-between border-b border-command-border pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white font-sans">AI Emergency Call Logs & Audio Spectrum</h1>
            <Badge variant="cyan">3 RECENT RECORDINGS</Badge>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">Full 24kHz audio recording, speech-to-text transcript, and acoustic frequency spectrum.</p>
        </div>
      </div>

      <div className="space-y-4">
        {callLogs.map((call) => (
          <GlassCard key={call.id} className="p-6 border-command-border space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3 font-mono text-xs">
                <Badge variant="emerald">{call.status}</Badge>
                <span className="font-bold text-white text-sm">{call.id}</span>
                <span className="text-slate-400">• {call.patient}</span>
              </div>
              <div className="text-xs font-mono text-cyan-300">
                <Clock className="w-3.5 h-3.5 inline mr-1" /> {call.time} ({call.duration})
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div>
                <span className="text-slate-400 block text-xs font-mono">TRIAGE INTENT</span>
                <span className="text-white font-bold text-xs">{call.intent}</span>
              </div>
              <div className="w-48">
                <AudioWaveform active barCount={24} height={32} />
              </div>
              <div className="flex justify-end gap-2">
                <button className="px-4 py-2 rounded-xl bg-command-surface border border-slate-700 text-xs font-mono text-slate-200 flex items-center gap-1.5 hover:border-cyber-cyan">
                  <Play className="w-3.5 h-3.5 text-cyber-cyan" /> Play Audio
                </button>
                <button className="px-4 py-2 rounded-xl bg-command-surface border border-slate-700 text-xs font-mono text-slate-200 flex items-center gap-1.5 hover:border-cyber-cyan">
                  <Download className="w-3.5 h-3.5 text-cyber-cyan" /> Export Transcript
                </button>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};
