import React, { useState } from 'react';
import { useEmergency } from '../../context/EmergencyContext';
import type { SidebarTab } from '../../types';
import { Badge } from './Badge';
import { 
  ShieldAlert, 
  Activity, 
  History as HistoryIcon, 
  Settings as SettingsIcon, 
  LayoutDashboard, 
  Menu, 
  X,
  PhoneCall
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { activeTab, setActiveTab, isEmergencyActive, startEmergencySession } = useEmergency();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: SidebarTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'emergency', label: 'Live Triage', icon: <Activity className="w-4 h-4 text-emergency-500" /> },
    { id: 'history', label: 'Incidents', icon: <HistoryIcon className="w-4 h-4" /> },
    { id: 'settings', label: 'Medical ID & Settings', icon: <SettingsIcon className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-cyan-500/15 bg-navy-950/80 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand */}
          <div 
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-navy-800 to-navy-900 border border-cyan-500/40 shadow-glow-cyan transition-all duration-300 group-hover:scale-105">
              <ShieldAlert className="w-6 h-6 text-cyan-400 group-hover:text-cyan-300" />
              <div className="absolute inset-0 rounded-xl bg-cyan-500/10 animate-pulse pointer-events-none" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-wider font-sans text-white">
                  ECHOAID <span className="text-cyan-400">X</span>
                </span>
                <Badge variant={isEmergencyActive ? "red" : "emerald"} pulse>
                  {isEmergencyActive ? "EMERGENCY ACTIVE" : "VOICE CONNECTED"}
                </Badge>
              </div>
              <p className="text-[11px] font-mono text-slate-400 tracking-tight hidden sm:block">
                NEURAL EMERGENCY COMPANION
              </p>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-1 bg-navy-900/60 p-1.5 rounded-2xl border border-cyan-500/15 backdrop-blur-md">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium font-sans transition-all duration-200 ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(0,240,255,0.25)]'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Quick SOS Action & Signal Status */}
          <div className="hidden sm:flex items-center gap-4">
            <div className="text-right hidden xl:block font-mono text-[11px]">
              <div className="text-emerald-400 flex items-center justify-end gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                99.999% Satellite Relay
              </div>
              <div className="text-slate-400">0.4s AI Response Latency</div>
            </div>

            <button
              onClick={() => startEmergencySession('Sudden Severe Chest Pain & Shortness of breath')}
              className="relative inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-sans font-bold text-xs tracking-wider uppercase text-white bg-gradient-to-r from-red-600 via-emergency-500 to-red-600 border border-emergency-400 shadow-glow-red hover:scale-105 active:scale-95 transition-all duration-200 group overflow-hidden"
            >
              <PhoneCall className="w-4 h-4 animate-bounce text-white" />
              <span>START EMERGENCY SOS</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2.5 rounded-xl bg-navy-900 border border-cyan-500/20 text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-navy-950/95 border-b border-cyan-500/20 px-4 pt-3 pb-6 space-y-2 backdrop-blur-3xl animate-in slide-in-from-top-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === item.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-300 hover:bg-slate-800/40'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};
