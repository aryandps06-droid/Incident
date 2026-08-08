import React, { useState, useEffect } from 'react';
import { useEmergency } from '../../context/EmergencyContext';
import { 
  Clock, 
  Cpu, 
  Wifi, 
  BatteryCharging, 
  AlertCircle, 
  ShieldCheck
} from 'lucide-react';

export const TopBar: React.FC = () => {
  const { isEmergencyActive, incidents, profile } = useEmergency();
  const [timeStr, setTimeStr] = useState<string>('');
  const [utcTimeStr, setUtcTimeStr] = useState<string>('');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setUtcTimeStr(now.toISOString().substring(11, 19) + ' UTC');
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-16 bg-command-card/90 border-b border-command-border backdrop-blur-2xl px-6 flex items-center justify-between select-none z-20">
      
      {/* Time & UTC Clock */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-command-surface border border-command-border font-mono text-xs text-cyber-cyan shadow-glow-cyan">
          <Clock className="w-4 h-4 text-cyber-cyan animate-pulse" />
          <span className="font-bold tracking-wider">{timeStr || '21:28:00'}</span>
          <span className="text-[10px] text-slate-400 border-l border-slate-700 pl-2">{utcTimeStr || '15:58:00 UTC'}</span>
        </div>

        {/* AI Engine Telemetry */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-command-surface border border-command-border font-mono text-xs text-slate-300">
          <Cpu className="w-4 h-4 text-cyber-purple" />
          <span>ECHO AI: <span className="text-cyber-emerald font-bold">ONLINE</span> (12ms • 99.8%)</span>
        </div>
      </div>

      {/* Center Satellite & Network Telemetry */}
      <div className="hidden md:flex items-center gap-6 font-mono text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <Wifi className="w-4 h-4 text-cyber-cyan" />
          <span>Orbital Mesh: <span className="text-cyber-cyan">14 Satellites</span></span>
        </div>

        <div className="flex items-center gap-2 text-slate-300">
          <BatteryCharging className="w-4 h-4 text-cyber-emerald" />
          <span>98% • Sensors Active</span>
        </div>

        {/* Emergency Count Badge */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyber-red/15 border border-cyber-red/35 text-cyber-red shadow-glow-red">
          <AlertCircle className="w-3.5 h-3.5 animate-ping" />
          <span className="font-bold">{isEmergencyActive ? '1 CRITICAL ACTIVE' : '0 ACTIVE'}</span>
          <span className="text-[10px] text-slate-400 border-l border-cyber-red/30 pl-2">{incidents.length} RESOLVED</span>
        </div>
      </div>

      {/* User Profile */}
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block font-mono text-xs">
          <div className="font-bold text-white flex items-center justify-end gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-cyber-cyan" />
            {profile?.full_name || 'Commander A. Vance'}
          </div>
          <div className="text-[10px] text-slate-400">Chief Emergency Dispatcher</div>
        </div>

        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyber-cyan/30 to-cyber-purple/30 border border-cyber-cyan/50 flex items-center justify-center font-mono font-bold text-xs text-cyan-200 shadow-glow-cyan">
          AV
        </div>
      </div>

    </header>
  );
};
