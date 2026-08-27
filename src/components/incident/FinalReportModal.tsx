import React, { useState } from 'react';
import { useIncident } from '../../context/IncidentContext';
import { FileCheck, X, Copy, Download, Check } from 'lucide-react';

export const FinalReportModal: React.FC = () => {
  const { generatedReport, setGeneratedReport } = useIncident();
  const [copied, setCopied] = useState(false);

  if (!generatedReport) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedReport.markdownReport);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([generatedReport.markdownReport], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EchoAid_X_Incident_Report_${generatedReport.rawIncidentData?.id || 'INC-2048'}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-4xl max-h-[90vh] bg-[#070C1E] border border-cyan-500/50 rounded-2xl p-6 flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <FileCheck className="w-6 h-6 text-cyan-400" />
            <div>
              <h2 className="text-base font-bold text-slate-100 font-mono">FINAL INCIDENT SUMMARY REPORT</h2>
              <span className="text-xs text-slate-400 font-mono">Evidence-Backed Shared Understanding Summary</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Markdown'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-lg bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-500/50 text-cyan-200 text-xs font-medium flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .md</span>
            </button>
            <button
              onClick={() => setGeneratedReport(null)}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Report Content Display */}
        <div className="flex-1 overflow-y-auto my-4 p-4 rounded-xl bg-slate-950/80 border border-slate-900 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
          {generatedReport.markdownReport}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => setGeneratedReport(null)}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
          >
            Close Report
          </button>
        </div>

      </div>
    </div>
  );
};
