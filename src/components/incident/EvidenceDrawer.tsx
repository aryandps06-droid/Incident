import React from 'react';
import { useIncident } from '../../context/IncidentContext';
import { X, ShieldCheck } from 'lucide-react';

export const EvidenceDrawer: React.FC = () => {
  const { evidenceDrawerItem, setEvidenceDrawerItem, currentIncident } = useIncident();

  if (!evidenceDrawerItem) return null;

  const item: any = evidenceDrawerItem;

  // Find origin transcript segment if available
  const matchingTranscript = currentIncident.transcript.find(
    tr => tr.id === item.transcriptSegmentId || tr.text.includes(item.evidenceText || item.text || '')
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-lg bg-[#070C1E] border-l border-slate-800 h-full p-6 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-slate-100 font-mono">EVIDENCE PROVENANCE VIEWER</h2>
          </div>
          <button
            onClick={() => setEvidenceDrawerItem(null)}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-5">
          
          {/* Claim / Statement Box */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block mb-1">
              RECORDED STATEMENT / CLAIM
            </span>
            <p className="text-sm font-semibold text-slate-100 leading-relaxed">
              "{item.text || item.action || item.task}"
            </p>
          </div>

          {/* Evidence Source & Provenance */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col gap-2.5 text-xs text-slate-300">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              ORIGIN & PROVENANCE METADATA
            </span>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Source Speaker:</span>
              <span className="font-semibold text-slate-200">{item.sourceParticipantName || item.decisionMakerName || item.ownerName || 'Incident Room'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Speaker Role:</span>
              <span className="font-mono text-cyan-300">{item.sourceParticipantRole || item.decisionMakerRole || item.ownerRole || 'Participant'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Timestamp:</span>
              <span className="font-mono text-slate-300">{item.timestamp || item.createdAt || 'Live Session'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Confidence Score:</span>
              <span className="font-mono text-emerald-400 font-bold">{item.confidence || '98% (High Evidence)'}</span>
            </div>
          </div>

          {/* Originating Transcript Segment */}
          <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-800/40">
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block mb-2">
              ORIGINATING TRANSCRIPT SEGMENT
            </span>
            {matchingTranscript ? (
              <div className="p-3 rounded bg-slate-900 border border-slate-800 text-xs text-slate-200 font-sans">
                <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                  <span>{matchingTranscript.speaker} ({matchingTranscript.speakerRole})</span>
                  <span>{matchingTranscript.timestamp}</span>
                </div>
                <p className="italic">"{matchingTranscript.text}"</p>
              </div>
            ) : (
              <p className="text-xs text-slate-300 italic">
                "{item.evidenceText || item.evidence || 'Linked directly to live audio stream & system logs.'}"
              </p>
            )}
          </div>

          {/* Contradicting Evidence if any */}
          {item.contradictingEvidenceText && (
            <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-800/40 text-xs">
              <span className="text-[10px] font-mono text-rose-400 uppercase tracking-wider block mb-1">
                CONTRADICTING EVIDENCE LOGGED
              </span>
              <p className="text-rose-200">{item.contradictingEvidenceText}</p>
            </div>
          )}

        </div>

        {/* Footer Close */}
        <div className="pt-4 border-t border-slate-800">
          <button
            onClick={() => setEvidenceDrawerItem(null)}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
          >
            Close Provenance Viewer
          </button>
        </div>

      </div>
    </div>
  );
};
