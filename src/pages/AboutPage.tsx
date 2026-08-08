import React from 'react';
import { GlassCard } from '../components/common/GlassCard';
import { Badge } from '../components/common/Badge';
import { 
  Cpu, 
  Globe, 
  HeartPulse, 
  Lock, 
  FileCheck,
  Radio
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  const safetySpecs = [
    { spec: 'Medical AI Standard', status: 'ISO 13485 Certified', icon: <FileCheck className="w-5 h-5 text-cyan-400" /> },
    { spec: 'Data Encryption', status: 'HIPAA 256-Bit Vault', icon: <Lock className="w-5 h-5 text-emerald-400" /> },
    { spec: 'Emergency Bandwidth', status: 'FirstNet Band 14 Authorized', icon: <Radio className="w-5 h-5 text-purple-400" /> },
    { spec: 'CPR Resuscitation Spec', status: 'AHA 2026 Guidelines', icon: <HeartPulse className="w-5 h-5 text-red-400" /> },
  ];

  const founders = [
    { name: 'Dr. Evelyn Vance, MD', role: 'Chief Medical Officer', org: 'Former Trauma Director, Johns Hopkins Emergency Medicine' },
    { name: 'Kaelen Thorne', role: 'Head of Neural Architecture', org: 'Ex-OpenAI & Aerospace Telemetry Lead' },
    { name: 'Maya Lin, MS', role: 'VP of Aerospace Systems', org: 'Former NASA Satellite Communications Specialist' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 pb-16">
      
      {/* Page Title Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4 pt-6">
        <Badge variant="cyan" pulse>MISSION & ARCHITECTURE</Badge>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Saving Lives in the Critical <span className="text-gradient-cyan">First 180 Seconds</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-sans">
          EchoAid X was founded on a singular urgent premise: when sudden cardiac arrest or massive hemorrhage occurs, professional ambulance response average 7 to 10 minutes. The first 3 minutes determine brain survival.
        </p>
      </div>

      {/* Tech Architecture Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <GlassCard className="p-8 space-y-4 border-cyan-500/30">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-glow-cyan">
            <Cpu className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white">0.4s Edge Neural Triage</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Our proprietary 300MB quantized neural engine runs directly on mobile & edge silicon, evaluating symptoms and generating step-by-step guidance in 14 milliseconds without server roundtrips.
          </p>
        </GlassCard>

        <GlassCard className="p-8 space-y-4 border-emerald-500/30">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-glow-emerald">
            <Globe className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white">Orbital Satellite Relay</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Dual-mesh satellite broadcast channels ensure emergency GPS coordinates and medical ID payloads reach emergency dispatch centers even in deep wilderness zero-signal zones.
          </p>
        </GlassCard>

        <GlassCard className="p-8 space-y-4 border-purple-500/30">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <HeartPulse className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white">AHA-Paced CPR Guidance</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Integrated 110 BPM acoustic metronome and real-time voice feedback keep bystanders composed and executing chest compressions with precise target depth and rate.
          </p>
        </GlassCard>

      </div>

      {/* Safety & Compliance Matrix */}
      <GlassCard className="p-8 sm:p-10 border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <Badge variant="emerald" pulse className="mb-2">REGULATORY COMPLIANCE</Badge>
            <h2 className="text-2xl font-bold text-white">Medical Safety & Security Protocols</h2>
          </div>
          <div className="text-xs font-mono text-cyan-400">ISO 13485 • HIPAA COMPLIANT</div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {safetySpecs.map((item, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-navy-950/80 border border-slate-800 space-y-2">
              <div className="p-2.5 rounded-xl bg-navy-900 w-fit">{item.icon}</div>
              <div className="text-xs text-slate-400 font-mono mt-2">{item.spec}</div>
              <div className="text-sm font-bold text-white font-mono">{item.status}</div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Leadership & Medical Advisory Board */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Scientific & Engineering Advisors</h2>
          <p className="text-xs text-slate-400">Built by emergency medicine physicians, aerospace telemetry engineers, and neural AI researchers.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {founders.map((f, i) => (
            <GlassCard key={i} className="p-6 border-cyan-500/20 space-y-3">
              <div className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center font-bold text-cyan-400 font-mono">
                0{i+1}
              </div>
              <h3 className="text-lg font-bold text-white">{f.name}</h3>
              <div className="text-xs font-mono text-cyan-300">{f.role}</div>
              <p className="text-xs text-slate-400 leading-relaxed">{f.org}</p>
            </GlassCard>
          ))}
        </div>
      </div>

    </div>
  );
};
