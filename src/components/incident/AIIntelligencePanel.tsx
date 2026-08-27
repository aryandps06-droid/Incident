import React, { useState } from 'react';
import { useIncident } from '../../context/IncidentContext';
import { 
  CheckCircle2, 
  Lightbulb, 
  Target, 
  ListTodo, 
  AlertOctagon, 
  HelpCircle, 
  Activity, 
  Zap,
  Eye,
  Check,
  UserCheck
} from 'lucide-react';

type IntelTab = 'facts' | 'hypotheses' | 'decisions' | 'actions' | 'conflicts' | 'missing' | 'signals' | 'integrations';

export const AIIntelligencePanel: React.FC = () => {
  const { 
    currentIncident, 
    setEvidenceDrawerItem, 
    resolveConflict, 
    updateActionItem 
  } = useIncident();

  const [activeTab, setActiveTab] = useState<IntelTab>('facts');

  const unresolvedConflictsCount = currentIncident.conflicts.filter(c => c.status === 'UNRESOLVED').length;

  return (
    <div className="bg-[#050A1F]/90 border border-cyan-500/20 rounded-2xl p-4 flex flex-col h-[560px] shadow-2xl backdrop-blur-xl relative overflow-hidden">
      
      {/* Ambient glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-3xl pointer-events-none" />

      {/* Intelligence Tabs Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-3 border-b border-white/[0.07] scrollbar-thin scrollbar-thumb-cyan-500/20 relative z-10">
        <button
          onClick={() => setActiveTab('facts')}
          className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
            activeTab === 'facts'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-950'
              : 'bg-white/[0.02] text-slate-400 hover:text-slate-200 border border-transparent hover:border-white/[0.06]'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>FACTS</span>
          <span className="px-1.5 py-0.2 rounded-full bg-emerald-950/80 text-[10px] text-emerald-300 font-mono">
            {currentIncident.facts.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('hypotheses')}
          className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
            activeTab === 'hypotheses'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-950'
              : 'bg-white/[0.02] text-slate-400 hover:text-slate-200 border border-transparent hover:border-white/[0.06]'
          }`}
        >
          <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
          <span>HYPO</span>
          <span className="px-1.5 py-0.2 rounded-full bg-amber-950/80 text-[10px] text-amber-300 font-mono">
            {currentIncident.hypotheses.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('decisions')}
          className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
            activeTab === 'decisions'
              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm shadow-blue-950'
              : 'bg-white/[0.02] text-slate-400 hover:text-slate-200 border border-transparent hover:border-white/[0.06]'
          }`}
        >
          <Target className="w-3.5 h-3.5 text-blue-400" />
          <span>DECISIONS</span>
          <span className="px-1.5 py-0.2 rounded-full bg-blue-950/80 text-[10px] text-blue-300 font-mono">
            {currentIncident.decisions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('actions')}
          className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
            activeTab === 'actions'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-950'
              : 'bg-white/[0.02] text-slate-400 hover:text-slate-200 border border-transparent hover:border-white/[0.06]'
          }`}
        >
          <ListTodo className="w-3.5 h-3.5 text-cyan-400" />
          <span>ACTIONS</span>
          <span className="px-1.5 py-0.2 rounded-full bg-cyan-950/80 text-[10px] text-cyan-300 font-mono">
            {currentIncident.actions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('conflicts')}
          className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer relative ${
            activeTab === 'conflicts'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm shadow-rose-950'
              : 'bg-white/[0.02] text-slate-400 hover:text-slate-200 border border-transparent hover:border-white/[0.06]'
          }`}
        >
          <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
          <span>CONFLICTS</span>
          {unresolvedConflictsCount > 0 ? (
            <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center animate-bounce">
              {unresolvedConflictsCount}
            </span>
          ) : (
            <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] text-slate-400 font-mono">
              0
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('missing')}
          className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
            activeTab === 'missing'
              ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 shadow-sm shadow-yellow-950'
              : 'bg-white/[0.02] text-slate-400 hover:text-slate-200 border border-transparent hover:border-white/[0.06]'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5 text-yellow-400" />
          <span>MISSING</span>
          <span className="px-1.5 py-0.2 rounded-full bg-yellow-950/80 text-[10px] text-yellow-300 font-mono">
            {currentIncident.missingInformation.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('signals')}
          className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
            activeTab === 'signals'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm shadow-indigo-950'
              : 'bg-white/[0.02] text-slate-400 hover:text-slate-200 border border-transparent hover:border-white/[0.06]'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-indigo-400" />
          <span>SIGNALS</span>
          <span className="px-1.5 py-0.2 rounded-full bg-indigo-950/80 text-[10px] text-indigo-300 font-mono">
            {currentIncident.systemSignals.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('integrations')}
          className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
            activeTab === 'integrations'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm shadow-purple-950'
              : 'bg-white/[0.02] text-slate-400 hover:text-slate-200 border border-transparent hover:border-white/[0.06]'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-purple-400" />
          <span>TOOLS</span>
          <span className="px-1.5 py-0.2 rounded-full bg-purple-950/80 text-[10px] text-purple-300 font-mono">
            {currentIncident.integrations.length}
          </span>
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto my-3 pr-2 flex flex-col gap-3">
        
        {/* 1. FACTS TAB */}
        {activeTab === 'facts' && (
          currentIncident.facts.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs font-mono text-slate-500">
              No confirmed facts logged yet.
            </div>
          ) : (
            currentIncident.facts.map(fact => (
              <div key={fact.id} className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-800/40 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-300">{fact.text}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-200 border border-emerald-700">
                    {fact.confidence}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Source: {fact.sourceParticipantName} ({fact.sourceParticipantRole})</span>
                  <span className="font-mono text-slate-500">{fact.timestamp}</span>
                </div>
                <button
                  onClick={() => setEvidenceDrawerItem(fact)}
                  className="self-start mt-1 text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 underline decoration-cyan-500/40"
                >
                  <Eye className="w-3 h-3" />
                  VIEW EVIDENCE
                </button>
              </div>
            ))
          )
        )}

        {/* 2. HYPOTHESES TAB */}
        {activeTab === 'hypotheses' && (
          currentIncident.hypotheses.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs font-mono text-slate-500">
              No hypotheses logged yet.
            </div>
          ) : (
            currentIncident.hypotheses.map(hypo => (
              <div key={hypo.id} className="p-3 rounded-xl bg-amber-950/20 border border-amber-800/40 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-amber-200">{hypo.text}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-900/60 text-amber-300 border border-amber-700">
                    {hypo.status}
                  </span>
                </div>
                {hypo.contradictingEvidenceText && (
                  <div className="p-2 rounded bg-rose-950/30 border border-rose-800/40 text-[11px] text-rose-300">
                    <span className="font-semibold text-rose-400">Contradicting Evidence: </span>
                    {hypo.contradictingEvidenceText}
                  </div>
                )}
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Proposed by: {hypo.sourceParticipantName}</span>
                  <span className="font-mono text-slate-500">{hypo.timestamp}</span>
                </div>
                <button
                  onClick={() => setEvidenceDrawerItem(hypo)}
                  className="self-start mt-1 text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 underline decoration-cyan-500/40"
                >
                  <Eye className="w-3 h-3" />
                  VIEW EVIDENCE
                </button>
              </div>
            ))
          )
        )}

        {/* 3. DECISIONS TAB */}
        {activeTab === 'decisions' && (
          currentIncident.decisions.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs font-mono text-slate-500">
              No decisions proposed or executed yet.
            </div>
          ) : (
            currentIncident.decisions.map(dec => (
              <div key={dec.id} className="p-3 rounded-xl bg-blue-950/20 border border-blue-800/40 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-blue-200">{dec.action}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700">
                    {dec.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">Rationale: {dec.rationale}</p>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Decision Maker: {dec.decisionMakerName} ({dec.decisionMakerRole})</span>
                  <span className="font-mono text-slate-500">{dec.timestamp}</span>
                </div>
                <button
                  onClick={() => setEvidenceDrawerItem(dec)}
                  className="self-start mt-1 text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 underline decoration-cyan-500/40"
                >
                  <Eye className="w-3 h-3" />
                  VIEW EVIDENCE
                </button>
              </div>
            ))
          )
        )}

        {/* 4. ACTIONS & OWNERSHIP TAB */}
        {activeTab === 'actions' && (
          currentIncident.actions.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs font-mono text-slate-500">
              No action items logged yet.
            </div>
          ) : (
            currentIncident.actions.map(act => (
              <div key={act.id} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200">{act.task}</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                    act.priority === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {act.priority}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <div className="flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Owner: <strong>{act.ownerName || 'UNASSIGNED'}</strong></span>
                  </div>

                  <button
                    onClick={() => updateActionItem(act.id, { status: act.status === 'COMPLETED' ? 'ASSIGNED' : 'COMPLETED' })}
                    className={`px-2.5 py-1 rounded text-[11px] font-mono font-semibold flex items-center gap-1 transition ${
                      act.status === 'COMPLETED'
                        ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                    }`}
                  >
                    <Check className="w-3 h-3" />
                    {act.status === 'COMPLETED' ? 'COMPLETED' : 'Mark Complete'}
                  </button>
                </div>
              </div>
            ))
          )
        )}

        {/* 5. CONFLICTS TAB (PHASE 11 CORE FEATURE) */}
        {activeTab === 'conflicts' && (
          currentIncident.conflicts.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs font-mono text-slate-500">
              No statement discrepancies detected.
            </div>
          ) : (
            currentIncident.conflicts.map(conf => {
              const isResolved = conf.status !== 'UNRESOLVED';
              return (
                <div key={conf.id} className={`p-3.5 rounded-xl border flex flex-col gap-3 transition ${
                  isResolved ? 'bg-slate-900/60 border-slate-800' : 'bg-rose-950/30 border-rose-600/60 shadow-[0_0_15px_rgba(225,29,72,0.15)]'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono text-rose-300 flex items-center gap-1.5">
                      <AlertOctagon className="w-4 h-4 text-rose-400" />
                      DISCREPANCY: {conf.topic}
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                      isResolved ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700' : 'bg-rose-900/80 text-rose-200 border border-rose-600 animate-pulse'
                    }`}>
                      {conf.status}
                    </span>
                  </div>

                  {/* Conflicting Statements */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded bg-slate-900/90 border border-slate-800">
                      <span className="text-[10px] font-mono text-cyan-400 block mb-0.5">Option A: {conf.sourceA}</span>
                      <p className="text-slate-200">{conf.statementA}</p>
                    </div>
                    <div className="p-2 rounded bg-slate-900/90 border border-slate-800">
                      <span className="text-[10px] font-mono text-rose-400 block mb-0.5">Option B: {conf.sourceB}</span>
                      <p className="text-slate-200">{conf.statementB}</p>
                    </div>
                  </div>

                  {/* Resolution Confirmation Buttons (Phase 11 Requirement) */}
                  {!isResolved ? (
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[11px] font-mono text-slate-400">Resolve Conflict:</span>
                      <button
                        onClick={() => resolveConflict(conf.id, 'RESOLVED_A', '10:37')}
                        className="px-2.5 py-1 rounded bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/50 text-emerald-200 text-xs font-mono font-semibold"
                      >
                        [ CONFIRM 10:37 ]
                      </button>
                      <button
                        onClick={() => resolveConflict(conf.id, 'RESOLVED_B', '10:42')}
                        className="px-2.5 py-1 rounded bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-500/50 text-cyan-200 text-xs font-mono font-semibold"
                      >
                        [ CONFIRM 10:42 ]
                      </button>
                    </div>
                  ) : (
                    <div className="text-xs text-emerald-300 font-mono bg-emerald-950/40 p-2 rounded border border-emerald-800/50">
                      ✅ {conf.resolution}
                    </div>
                  )}
                </div>
              );
            })
          )
        )}

        {/* 6. MISSING INFORMATION TAB */}
        {activeTab === 'missing' && (
          currentIncident.missingInformation.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs font-mono text-slate-500">
              All critical incident metadata confirmed.
            </div>
          ) : (
            currentIncident.missingInformation.map(mi => (
              <div key={mi.id} className="p-3 rounded-xl bg-yellow-950/20 border border-yellow-800/40 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-yellow-200">{mi.topic}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-yellow-900/60 text-yellow-300 border border-yellow-700">
                    {mi.severity} SEVERITY
                  </span>
                </div>
                <p className="text-xs text-slate-300">{mi.description}</p>
              </div>
            ))
          )
        )}

        {/* 7. SYSTEM SIGNALS TAB */}
        {activeTab === 'signals' && (
          <div className="flex flex-col gap-3">
            <div className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 p-2 rounded border border-cyan-800/50 flex items-center justify-between">
              <span>DEMO MONITORING & TELEMETRY STREAM</span>
              <span className="animate-ping w-2 h-2 rounded-full bg-cyan-400" />
            </div>
            {currentIncident.systemSignals.map(sig => (
              <div key={sig.id} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-200 block">{sig.serviceName}</span>
                  <span className="text-[11px] text-slate-400 font-mono">{sig.metricName}</span>
                </div>
                <div className="text-right">
                  <span className={`text-base font-mono font-bold ${
                    sig.status === 'CRITICAL' ? 'text-rose-400' : 'text-emerald-400'
                  }`}>
                    {sig.value}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 block">{sig.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 8. INTEGRATIONS TAB */}
        {activeTab === 'integrations' && (
          <div className="flex flex-col gap-3">
            {currentIncident.integrations.map(integ => (
              <div key={integ.service} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-200 block">{integ.service}</span>
                  <span className="text-[11px] text-slate-400 font-mono">{integ.details}</span>
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                  integ.status === 'CONNECTED' ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700' : 'bg-amber-900/60 text-amber-300 border border-amber-700'
                }`}>
                  {integ.status}
                </span>
              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
};
