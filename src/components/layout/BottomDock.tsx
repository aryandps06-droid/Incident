import React from 'react';
import { useEmergency } from '../../context/EmergencyContext';
import { 
  PhoneCall, 
  Share2, 
  Video, 
  HeartPulse, 
  Languages, 
  FileText,
  ShieldAlert,
  Check
} from 'lucide-react';

export const BottomDock: React.FC = () => {
  const { setActiveModal, locationGPS } = useEmergency();
  const [copied, setCopied] = React.useState(false);

  const handleShareLocation = () => {
    navigator.clipboard.writeText(`EMERGENCY SOS GPS LOCATION: ${locationGPS}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <footer className="h-16 bg-command-card/95 border-t border-command-border backdrop-blur-2xl px-6 flex items-center justify-between select-none z-30">
      
      <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
        <ShieldAlert className="w-4 h-4 text-cyber-red animate-pulse" />
        <span className="hidden sm:inline">COMMAND QUICK DOCK:</span>
      </div>

      {/* Dock Action Buttons */}
      <div className="flex items-center gap-2 sm:gap-3">
        
        {/* 1. Call 108 / 911 Direct */}
        <button
          onClick={() => alert('Direct 108/911 Emergency Telemetry Hotline Triggered!')}
          className="px-4 py-2 rounded-xl bg-cyber-red hover:bg-red-600 text-white font-extrabold text-xs tracking-wider font-mono shadow-glow-red flex items-center gap-2 transition-all hover:scale-105"
        >
          <PhoneCall className="w-4 h-4 animate-bounce" />
          <span>CALL 108 / 911</span>
        </button>

        {/* 2. Share Location */}
        <button
          onClick={handleShareLocation}
          className="px-3.5 py-2 rounded-xl bg-command-surface hover:bg-slate-800 border border-command-border text-slate-200 text-xs font-mono flex items-center gap-2 transition-all"
        >
          {copied ? <Check className="w-4 h-4 text-cyber-emerald" /> : <Share2 className="w-4 h-4 text-cyber-cyan" />}
          <span className="hidden md:inline">{copied ? 'GPS Copied!' : 'Share GPS'}</span>
        </button>

        {/* 3. Video Call Doctor */}
        <button
          onClick={() => setActiveModal('telehealth')}
          className="px-3.5 py-2 rounded-xl bg-command-surface hover:bg-slate-800 border border-command-border text-slate-200 text-xs font-mono flex items-center gap-2 transition-all hover:border-cyber-purple"
        >
          <Video className="w-4 h-4 text-cyber-purple" />
          <span className="hidden md:inline">Video Call Doctor</span>
        </button>

        {/* 4. CPR Guide */}
        <button
          onClick={() => setActiveModal('cpr')}
          className="px-3.5 py-2 rounded-xl bg-command-surface hover:bg-slate-800 border border-command-border text-slate-200 text-xs font-mono flex items-center gap-2 transition-all hover:border-cyber-red"
        >
          <HeartPulse className="w-4 h-4 text-cyber-red animate-pulse" />
          <span className="hidden md:inline">CPR 110 BPM</span>
        </button>

        {/* 5. Translate */}
        <button
          onClick={() => setActiveModal('translator')}
          className="px-3.5 py-2 rounded-xl bg-command-surface hover:bg-slate-800 border border-command-border text-slate-200 text-xs font-mono flex items-center gap-2 transition-all hover:border-cyber-cyan"
        >
          <Languages className="w-4 h-4 text-cyber-cyan" />
          <span className="hidden md:inline">Translator</span>
        </button>

        {/* 6. Medical History */}
        <button
          onClick={() => setActiveModal('vault')}
          className="px-3.5 py-2 rounded-xl bg-command-surface hover:bg-slate-800 border border-command-border text-slate-200 text-xs font-mono flex items-center gap-2 transition-all hover:border-cyber-emerald"
        >
          <FileText className="w-4 h-4 text-cyber-emerald" />
          <span className="hidden md:inline">Medical Vault</span>
        </button>

      </div>

      <div className="hidden lg:block font-mono text-[10px] text-slate-500">
        ECHOAID OPERATING SYSTEM • SECURE SHA-256
      </div>

    </footer>
  );
};
