import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEmergency } from '../context/EmergencyContext';
import { GlassCard } from '../components/common/GlassCard';
import { Badge } from '../components/common/Badge';
import type { Incident } from '../types';
import { 
  History as HistoryIcon, 
  Search, 
  Download, 
  FileText, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  X, 
  Calendar,
  Filter
} from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const { incidents } = useEmergency();
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  const filteredIncidents = incidents.filter((inc) => {
    const matchesSeverity = filterSeverity === 'ALL' || inc.severity === filterSeverity;
    const matchesSearch = 
      inc.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.ai_assessment.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSeverity && matchesSearch;
  });

  const exportJSONReport = (inc: Incident) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(inc, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `EchoAid_Report_${inc.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pb-16">
      
      {/* Page Title & Stats */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <HistoryIcon className="w-7 h-7 text-cyan-400" />
              Emergency Incident History
            </h1>
            <Badge variant="cyan">{incidents.length} RECORDS LOGGED</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">Full audit trails, AI triage transcripts, and satellite telemetry exports.</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="px-4 py-2 rounded-xl bg-navy-900 border border-slate-800 text-xs font-mono text-cyan-400">
            AVG RESPONDER ETA: <span className="font-bold text-white">4.2 MINS</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <GlassCard className="p-4 border-cyan-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search incident ID, category, or symptoms..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-950/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-4 h-4 text-slate-400 mr-1" />
          {['ALL', 'CRITICAL', 'URGENT', 'MODERATE'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                filterSeverity === sev
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-glow-cyan'
                  : 'bg-navy-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Incidents Table / List */}
      <div className="space-y-4">
        {filteredIncidents.length === 0 ? (
          <GlassCard className="p-12 text-center text-slate-400 space-y-3">
            <FileText className="w-12 h-12 text-slate-600 mx-auto" />
            <p className="text-sm">No emergency incidents found matching your query filters.</p>
          </GlassCard>
        ) : (
          filteredIncidents.map((inc) => (
            <motion.div key={inc.id} layout>
              <GlassCard variant="hover" className="p-6 border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
                  <div className="flex items-center gap-3">
                    <Badge variant={inc.severity === 'CRITICAL' ? 'red' : 'warning'}>
                      {inc.severity}
                    </Badge>
                    <span className="text-base font-bold text-white">{inc.category}</span>
                    <span className="text-xs font-mono text-slate-400">({inc.id})</span>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                      {new Date(inc.timestamp).toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1 text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {inc.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block font-mono">LOCATION GPS BEACON</span>
                    <span className="text-slate-200 font-mono mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400" /> {inc.location}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block font-mono">RESPONSE TELEMETRY</span>
                    <span className="text-slate-200 font-mono mt-0.5 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" /> ETA {inc.responder_eta} • Duration {inc.duration_seconds}s
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block font-mono">STEPS COMPLETED</span>
                    <span className="text-cyan-300 font-mono mt-0.5 font-bold">
                      {inc.steps_completed} of {inc.total_steps} Guidance Steps Executed
                    </span>
                  </div>
                </div>

                <div className="bg-navy-950 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-300">
                  <span className="font-mono text-cyan-400 font-semibold mr-2">AI ASSESSMENT AUDIT:</span>
                  {inc.ai_assessment}
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => setSelectedIncident(inc)}
                    className="text-xs font-mono text-cyan-300 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <FileText className="w-4 h-4" /> Inspect Detailed Audit Report
                  </button>

                  <button
                    onClick={() => exportJSONReport(inc)}
                    className="px-3.5 py-1.5 rounded-lg bg-navy-900 border border-cyan-500/30 text-xs font-mono text-slate-300 hover:text-white hover:border-cyan-400 flex items-center gap-1.5 transition-all"
                  >
                    <Download className="w-3.5 h-3.5 text-cyan-400" /> Export JSON Telemetry
                  </button>
                </div>

              </GlassCard>
            </motion.div>
          ))
        )}
      </div>

      {/* Incident Inspector Modal Drawer */}
      <AnimatePresence>
        {selectedIncident && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-navy-900 border border-cyan-500/40 rounded-2xl p-6 sm:p-8 space-y-6 shadow-[0_0_50px_rgba(0,240,255,0.2)] max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <Badge variant={selectedIncident.severity === 'CRITICAL' ? 'red' : 'warning'}>
                    {selectedIncident.severity}
                  </Badge>
                  <h3 className="text-xl font-bold text-white">{selectedIncident.category}</h3>
                </div>
                <button
                  onClick={() => setSelectedIncident(null)}
                  className="p-1.5 rounded-lg bg-navy-950 border border-slate-700 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-navy-950 border border-slate-800 font-mono">
                  <div>
                    <span className="text-slate-400 block">INCIDENT ID</span>
                    <span className="text-white font-bold">{selectedIncident.id}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">TIMESTAMP</span>
                    <span className="text-white">{new Date(selectedIncident.timestamp).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">LOCATION GPS</span>
                    <span className="text-cyan-400">{selectedIncident.location}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">PARAMEDIC ETA</span>
                    <span className="text-emerald-400">{selectedIncident.responder_eta}</span>
                  </div>
                </div>

                {selectedIncident.vital_summary && (
                  <div className="p-4 rounded-xl bg-navy-950 border border-slate-800">
                    <span className="font-mono text-cyan-400 font-semibold block mb-2">RECORDED VITALS SUMMARY</span>
                    <div className="grid grid-cols-3 gap-2 font-mono text-center">
                      <div className="p-2 bg-navy-900 rounded">
                        <span className="text-slate-400 block text-[10px]">PEAK HEART RATE</span>
                        <span className="text-red-400 font-bold text-sm">{selectedIncident.vital_summary.peak_hr} BPM</span>
                      </div>
                      <div className="p-2 bg-navy-900 rounded">
                        <span className="text-slate-400 block text-[10px]">AVG SPO2</span>
                        <span className="text-cyan-400 font-bold text-sm">{selectedIncident.vital_summary.avg_spo2}</span>
                      </div>
                      <div className="p-2 bg-navy-900 rounded">
                        <span className="text-slate-400 block text-[10px]">BLOOD PRESSURE</span>
                        <span className="text-emerald-400 font-bold text-sm">{selectedIncident.vital_summary.bp}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <span className="font-mono text-slate-400 block mb-1">AI NEURAL ASSESSMENT LOG</span>
                  <p className="text-slate-200 bg-navy-950 p-4 rounded-xl border border-slate-800 leading-relaxed font-sans">
                    {selectedIncident.ai_assessment}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  onClick={() => exportJSONReport(selectedIncident)}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 text-navy-950 font-bold text-xs shadow-glow-cyan hover:scale-105 transition-all flex items-center gap-2"
                >
                  <Download className="w-4 h-4" /> Download Medical Report JSON
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
