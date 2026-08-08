import React from 'react';
import { useEmergency } from '../../context/EmergencyContext';
import type { ActiveView } from '../../types';
import { ShieldCheck, PhoneCall, Sparkles, User, Settings as SettingsIcon, History } from 'lucide-react';

export const AppHeader: React.FC = () => {
  const { activeView, setActiveView, isEmergencyActive, startVoiceSession } = useEmergency();

  const navItems: { id: ActiveView; label: string; icon: React.ReactNode }[] = [
    { id: 'command', label: 'AI Command Center', icon: <Sparkles className="w-4 h-4 text-brand-accent" /> },
    { id: 'medical-id', label: 'Medical ID', icon: <User className="w-4 h-4 text-slate-400" /> },
    { id: 'incidents', label: 'Incidents', icon: <History className="w-4 h-4 text-slate-400" /> },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon className="w-4 h-4 text-slate-400" /> },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-space-border bg-space-bg/80 backdrop-blur-2xl px-6 lg:px-12 h-20 flex items-center justify-between select-none">
      
      {/* Brand & Logo */}
      <div 
        onClick={() => setActiveView('command')}
        className="flex items-center gap-3 cursor-pointer group"
      >
        <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-space-card border border-brand-accent/30 shadow-glow-brand transition-all group-hover:scale-105">
          <ShieldCheck className="w-5 h-5 text-brand-accent" />
          <div className="absolute inset-0 rounded-2xl bg-brand-accent/10 animate-pulse pointer-events-none" />
        </div>
        <div>
          <div className="text-lg font-bold tracking-tight text-white font-sans flex items-center gap-2">
            EchoAid <span className="text-brand-accent">X</span>
            {isEmergencyActive && (
              <span className="px-2 py-0.5 rounded-full bg-brand-emergency/20 text-brand-emergency text-[10px] font-mono font-bold border border-brand-emergency/40 animate-pulse">
                CRITICAL SOS
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 font-mono tracking-tight hidden sm:block">
            THE WORLD'S FIRST AI EMERGENCY COMPANION
          </p>
        </div>
      </div>

      {/* Nav Buttons (Linear/OpenAI style) */}
      <nav className="hidden md:flex items-center gap-1.5 p-1.5 rounded-2xl bg-space-card/80 border border-space-border backdrop-blur-xl">
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold font-sans transition-all duration-200 ${
                isActive
                  ? 'bg-brand-accent/15 text-white border border-brand-accent/40 shadow-glow-brand'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-space-surface/50'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Telemetry Status & Quick Action */}
      <div className="flex items-center gap-4">
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-space-card border border-space-border text-xs font-mono text-slate-300">
          <span className="h-2 w-2 rounded-full bg-brand-success animate-ping" />
          <span>AI Engine: <span className="text-brand-success font-bold">Ready (0.4s)</span></span>
        </div>

        <button
          onClick={() => startVoiceSession('Emergency distress - sudden chest pain')}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-brand-emergency to-red-600 text-white font-sans font-bold text-xs uppercase tracking-wider shadow-glow-red hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
        >
          <PhoneCall className="w-4 h-4 animate-bounce" />
          <span>Emergency SOS</span>
        </button>
      </div>

    </header>
  );
};
