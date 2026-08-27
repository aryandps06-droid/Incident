import React from 'react';
import { useIncident } from '../../context/IncidentContext';
import { useEmergency } from '../../context/EmergencyContext';
import { useAuth } from '../../context/AuthContext';
import { 
  ShieldAlert, 
  Play, 
  FastForward, 
  FileCheck, 
  Radio, 
  Activity, 
  Flame,
  Volume2,
  RotateCcw,
  LogOut
} from 'lucide-react';

export const IncidentHeader: React.FC = () => {
  const { 
    currentIncident, 
    startDemoScenario, 
    stepNextDemoEvent, 
    isDemoPlaying, 
    demoStep, 
    resetIncidentRoom,
    generateReport, 
    speakAISummary 
  } = useIncident();
  const { agoraStatus, resetToHome } = useEmergency();
  const { signOut } = useAuth();

  const handleSignOut = () => {
    signOut();
    resetToHome();
  };

  const severityColors = {
    'SEV-1': 'bg-red-500/20 text-red-400 border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.3)]',
    'SEV-2': 'bg-amber-500/20 text-amber-400 border-amber-500/40',
    'SEV-3': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
    'SEV-4': 'bg-blue-500/20 text-blue-400 border-blue-500/40'
  };

  const statusColors = {
    'INVESTIGATING': 'bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.2)] animate-pulse',
    'MITIGATING': 'bg-blue-500/15 text-blue-300 border-blue-500/40',
    'MONITORING': 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40',
    'STABILIZED': 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.25)]',
    'RESOLVED': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
  };

  return (
    <header className="border-b border-cyan-500/20 bg-[#040817]/95 backdrop-blur-2xl px-5 py-3 sticky top-0 z-40 shadow-2xl select-none">
      <div className="max-w-[1700px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left: Brand & Incident Title */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-rose-500 p-0.5 shadow-lg shadow-cyan-500/25 flex items-center justify-center">
            <div className="w-full h-full bg-[#05091C] rounded-[10px] flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-rose-400 text-sm">
                ECHOAID X
              </span>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 font-mono font-bold">
                AI INCIDENT COMMANDER
              </span>
            </div>
            <h1 className="text-sm sm:text-base font-semibold text-slate-100 flex items-center gap-2 mt-0.5">
              <span className="font-mono text-cyan-400 font-bold">{currentIncident.id}</span>
              <span className="text-slate-600">•</span>
              <span className="truncate max-w-[550px] text-slate-200">{currentIncident.title}</span>
            </h1>
          </div>
        </div>

        {/* Center: Live Badges & Telemetry */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Severity Badge */}
          <div className={`px-2.5 py-1 rounded-lg border font-mono text-xs font-bold flex items-center gap-1.5 ${severityColors[currentIncident.severity]}`}>
            <Flame className="w-3.5 h-3.5" />
            {currentIncident.severity}
          </div>

          {/* Status Badge */}
          <div className={`px-2.5 py-1 rounded-lg border font-mono text-xs font-semibold flex items-center gap-1.5 ${statusColors[currentIncident.status]}`}>
            <Activity className="w-3.5 h-3.5" />
            STATUS: {currentIncident.status}
          </div>

          {/* Agora RTC Voice Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-300 font-mono">
            <Radio className={`w-3.5 h-3.5 ${
              agoraStatus === 'READY' || agoraStatus === 'CONNECTED' 
                ? 'text-emerald-400 animate-pulse' 
                : agoraStatus === 'WAITING_FOR_AI'
                ? 'text-amber-400 animate-pulse'
                : agoraStatus === 'AI_CONNECTED'
                ? 'text-cyan-400'
                : agoraStatus === 'AI_OFFLINE' || agoraStatus === 'TOKEN_ERROR'
                ? 'text-rose-400'
                : 'text-slate-400'
            }`} />
            <span>AGORA VOICE: <strong className={`font-mono ${
              agoraStatus === 'READY' || agoraStatus === 'CONNECTED' 
                ? 'text-emerald-300' 
                : agoraStatus === 'WAITING_FOR_AI'
                ? 'text-amber-300'
                : agoraStatus === 'AI_CONNECTED'
                ? 'text-cyan-300'
                : agoraStatus === 'AI_OFFLINE' || agoraStatus === 'TOKEN_ERROR'
                ? 'text-rose-400'
                : 'text-slate-300'
            }`}>{agoraStatus.replace(/_/g, ' ')}</strong></span>
          </div>

          {/* Integration Chips */}
          <div className="hidden xl:flex items-center gap-1.5">
            {currentIncident.integrations.map(integ => (
              <div key={integ.service} className="px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/[0.08] text-[9.5px] text-slate-300 font-mono flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${integ.status === 'CONNECTED' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                {integ.service}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Actions, Demo Controls & User Profile */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          
          {/* Spoken AI Summary Button */}
          <button
            onClick={() => speakAISummary(`Operational status for ${currentIncident.id}: Status is ${currentIncident.status}. ${currentIncident.facts.length} facts logged, ${currentIncident.conflicts.filter(c => c.status === 'UNRESOLVED').length} unresolved conflicts.`)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-cyan-500/30 text-cyan-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
            title="Speak AI Status Summary Aloud"
          >
            <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">AI Summary</span>
          </button>

          {/* Reset Room Button */}
          <button
            onClick={resetIncidentRoom}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
            title="Reset Incident Room to 0 facts & fresh real-time slate"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          {/* Launch Demo Scenario Button */}
          <button
            onClick={startDemoScenario}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 via-cyan-600 to-emerald-600 hover:brightness-110 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-cyan-500/25 transition cursor-pointer border-0"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>DEMO</span>
          </button>

          {/* Step Next Demo Event Button */}
          {isDemoPlaying && (
            <button
              onClick={stepNextDemoEvent}
              className="px-3 py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/50 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 animate-bounce cursor-pointer"
            >
              <FastForward className="w-3.5 h-3.5" />
              <span>Step ({demoStep + 1}/5)</span>
            </button>
          )}

          {/* Generate Report Button */}
          <button
            onClick={generateReport}
            className="px-2.5 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Report</span>
          </button>

          {/* Single Direct 1-Click Sign Out Button */}
          <button
            onClick={handleSignOut}
            className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 hover:border-rose-500/50 text-rose-300 hover:text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ml-1 whitespace-nowrap shrink-0"
            title="Sign Out & Exit Incident War Room"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span>Sign Out</span>
          </button>

        </div>

      </div>
    </header>
  );
};
