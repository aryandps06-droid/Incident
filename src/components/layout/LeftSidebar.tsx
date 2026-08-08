import React from 'react';
import { useEmergency } from '../../context/EmergencyContext';
import type { SidebarTab } from '../../types';
import { 
  LayoutDashboard, 
  Activity, 
  PhoneCall, 
  UserCheck, 
  History as HistoryIcon, 
  Building2, 
  BarChart3, 
  Settings as SettingsIcon, 
  ShieldAlert,
  Radio
} from 'lucide-react';

export const LeftSidebar: React.FC = () => {
  const { activeTab, setActiveTab, isEmergencyActive } = useEmergency();

  const navItems: Array<{ id: SidebarTab; label: string; icon: React.ReactNode; badge?: string }> = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'emergency', label: 'Live Emergency', icon: <Activity className="w-4 h-4 text-cyber-red animate-pulse" />, badge: 'LIVE' },
    { id: 'calls', label: 'AI Calls', icon: <PhoneCall className="w-4 h-4" /> },
    { id: 'patients', label: 'Patients', icon: <UserCheck className="w-4 h-4" /> },
    { id: 'history', label: 'History', icon: <HistoryIcon className="w-4 h-4" /> },
    { id: 'hospitals', label: 'Hospitals', icon: <Building2 className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-64 bg-command-card/90 border-r border-command-border backdrop-blur-2xl flex flex-col justify-between select-none z-30">
      
      {/* Brand Header */}
      <div>
        <div className="h-16 px-5 border-b border-command-border flex items-center gap-3">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-command-surface border border-cyber-cyan/40 shadow-glow-cyan">
            <ShieldAlert className="w-5 h-5 text-cyber-cyan" />
            <div className="absolute inset-0 rounded-lg bg-cyber-cyan/10 animate-pulse pointer-events-none" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-extrabold tracking-wider font-mono text-white">
                ECHOAID <span className="text-cyber-cyan">OS</span>
              </span>
            </div>
            <div className="text-[10px] font-mono text-slate-400 tracking-tight">
              MISSION CONTROL V2.4
            </div>
          </div>
        </div>

        {/* Navigation Item List */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-mono font-medium transition-all ${
                  isActive
                    ? 'bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/35 shadow-glow-cyan'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-command-surface/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                    isEmergencyActive ? 'bg-cyber-red/20 text-cyber-red border border-cyber-red/40 animate-pulse' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Operator System Telemetry Footer */}
      <div className="p-4 border-t border-command-border bg-command-surface/40 space-y-2">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-cyber-emerald" /> Operator Desk #04
          </span>
          <span className="text-cyber-emerald">ACTIVE</span>
        </div>
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div className="bg-cyber-cyan h-full w-[94%]" />
        </div>
        <div className="text-[10px] font-mono text-slate-500 text-right">
          Mesh Channel: 0x88F2
        </div>
      </div>

    </aside>
  );
};
