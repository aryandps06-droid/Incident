import React from 'react';
import { ShieldCheck, HeartPulse, Cpu, Globe, Lock } from 'lucide-react';
import { useEmergency } from '../../context/EmergencyContext';

export const Footer: React.FC = () => {
  const { setActiveTab } = useEmergency();

  return (
    <footer className="border-t border-cyan-500/15 bg-navy-950/90 text-slate-400 py-12 px-4 sm:px-6 lg:px-8 mt-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
        
        {/* Brand Info */}
        <div className="md:col-span-1 space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-cyan-400" />
            <span className="text-lg font-bold text-white tracking-wider font-sans">
              ECHOAID <span className="text-cyan-400">X</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            The World's First AI Emergency Companion. Designed to save critical lives in the first 180 seconds of sudden cardiac, trauma, and medical distress.
          </p>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 w-fit">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            SYSTEMS OPERATIONAL • 0.4s AI LATENCY
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="space-y-3">
          <h4 className="text-xs font-mono font-semibold uppercase text-cyan-300 tracking-wider">Navigation</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <button onClick={() => setActiveTab('dashboard')} className="hover:text-cyan-400 transition-colors">
                Command Dashboard
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab('emergency')} className="hover:text-cyan-400 transition-colors">
                Live AI Triage Session
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab('history')} className="hover:text-cyan-400 transition-colors">
                Incident History & Telemetry
              </button>
            </li>
          </ul>
        </div>

        {/* System & Architecture */}
        <div className="space-y-3">
          <h4 className="text-xs font-mono font-semibold uppercase text-cyan-300 tracking-wider">Neural Mesh Core</h4>
          <ul className="space-y-2 text-xs">
            <li className="flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" /> Edge AI Engine (Zero-Latency)
            </li>
            <li className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-cyan-400" /> Low-Earth Satellite Beacon Relay
            </li>
            <li className="flex items-center gap-2">
              <HeartPulse className="w-3.5 h-3.5 text-cyan-400" /> 110 BPM Rhythmic Guidance
            </li>
            <li className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-cyan-400" /> Encrypted Biometric Medical Vault
            </li>
          </ul>
        </div>

        {/* Medical & Regulatory Badges */}
        <div className="space-y-3">
          <h4 className="text-xs font-mono font-semibold uppercase text-cyan-300 tracking-wider">Safety Certifications</h4>
          <div className="space-y-2 text-[11px] font-mono text-slate-400">
            <div className="p-2 rounded-lg bg-navy-900/60 border border-slate-800 flex items-center justify-between">
              <span>ISO 13485 Medical AI</span>
              <span className="text-emerald-400">COMPLIANT</span>
            </div>
            <div className="p-2 rounded-lg bg-navy-900/60 border border-slate-800 flex items-center justify-between">
              <span>HIPAA Vault Encryption</span>
              <span className="text-emerald-400">256-BIT</span>
            </div>
            <div className="p-2 rounded-lg bg-navy-900/60 border border-slate-800 flex items-center justify-between">
              <span>FirstNet Emergency Network</span>
              <span className="text-cyan-400">READY</span>
            </div>
          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <div>
          © 2026 EchoAid X Systems Inc. All rights reserved. Designed for emergency simulation & instant life support protocol delivery.
        </div>
        <div className="flex gap-6">
          <span className="hover:text-slate-300 cursor-pointer">Privacy Policy</span>
          <span className="hover:text-slate-300 cursor-pointer">Terms of Service</span>
          <span className="hover:text-slate-300 cursor-pointer">Emergency Compliance</span>
        </div>
      </div>
    </footer>
  );
};
