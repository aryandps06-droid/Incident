import React from 'react';
import { useIncident } from '../../context/IncidentContext';
import { AlertTriangle, CheckCircle2, XCircle, Eye } from 'lucide-react';

export const CriticalActionModal: React.FC = () => {
  const { pendingCriticalAction, approveCriticalAction, rejectCriticalAction, setEvidenceDrawerItem } = useIncident();

  if (!pendingCriticalAction) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-[#090E26] border-2 border-rose-500/80 rounded-2xl p-6 shadow-[0_0_50px_rgba(244,63,94,0.3)] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/60 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6 text-rose-400 animate-pulse" />
          </div>
          <div>
            <span className="text-xs font-mono text-rose-400 font-bold tracking-wider block">
              🛑 CRITICAL ACTION APPROVAL REQUIRED
            </span>
            <h2 className="text-lg font-bold text-slate-100">{pendingCriticalAction.action}</h2>
          </div>
        </div>

        {/* Action Details */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col gap-2.5 text-xs text-slate-300 mb-6">
          <div className="flex justify-between">
            <span className="text-slate-400">Target System:</span>
            <span className="font-mono font-semibold text-cyan-300">{pendingCriticalAction.targetSystem}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Reason / Proposal:</span>
            <span className="text-slate-200">{pendingCriticalAction.reason}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Risk Assessment:</span>
            <span className="font-mono text-rose-300 font-semibold">{pendingCriticalAction.risk}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Execution Mode:</span>
            <span className="font-mono text-emerald-400 font-semibold">Simulated Operational Adapter</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => approveCriticalAction(pendingCriticalAction.id)}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>APPROVE & EXECUTE</span>
          </button>

          <button
            onClick={() => rejectCriticalAction(pendingCriticalAction.id)}
            className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center gap-1.5 transition"
          >
            <XCircle className="w-4 h-4 text-rose-400" />
            <span>REJECT</span>
          </button>

          <button
            onClick={() => setEvidenceDrawerItem(pendingCriticalAction as any)}
            className="px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-cyan-300 font-semibold text-xs flex items-center gap-1.5 transition"
          >
            <Eye className="w-4 h-4" />
            <span>Evidence</span>
          </button>
        </div>

      </div>
    </div>
  );
};
