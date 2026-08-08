import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useEmergency } from '../../context/EmergencyContext';
import { AuroraBackground } from '../common/AuroraBackground';
import { 
  CheckCircle2, 
  Download, 
  Share2, 
  Building2, 
  Heart, 
  ArrowLeft, 
  Shield,
  Check
} from 'lucide-react';

export const SummaryScreen: React.FC = () => {
  const { summaryData, resetToHome } = useEmergency();
  const [copied, setCopied] = useState(false);

  const downloadJSONReport = () => {
    if (!summaryData) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(summaryData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `EchoAid_Summary_${summaryData.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleShare = () => {
    if (!summaryData) return;
    navigator.clipboard.writeText(`EchoAid X Emergency Summary Report (${summaryData.id}): Condition: ${summaryData.aiDiagnosis}, Duration: ${summaryData.duration}, Hospital: ${summaryData.hospitalDestination.name}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <AuroraBackground>
      <div className="min-h-screen flex flex-col justify-between p-6 lg:p-12 select-none relative overflow-hidden">
        
        {/* Header */}
        <header className="flex items-center justify-between z-10 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-brand-success/20 border border-brand-success/40 flex items-center justify-center text-brand-success shadow-glow-emerald">
              <Shield className="w-5 h-5" />
            </div>
            <span className="text-xl font-extrabold text-white font-sans">
              EchoAid <span className="bg-gradient-to-r from-cyan-400 via-brand-accent to-purple-500 bg-clip-text text-transparent">X</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={downloadJSONReport}
              className="px-4 py-2.5 rounded-2xl bg-space-card/80 border border-white/10 hover:border-cyan-400 text-xs font-mono text-slate-200 flex items-center gap-2 transition-all backdrop-blur-xl"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Download Report</span>
            </button>

            <button
              onClick={handleShare}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-brand-accent to-blue-600 text-white font-bold text-xs shadow-glow-brand flex items-center gap-2 hover:scale-105 transition-all"
            >
              {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
              <span>{copied ? 'Copied Link' : 'Share'}</span>
            </button>
          </div>
        </header>

        {/* Summary Content */}
        <div className="flex-1 max-w-4xl mx-auto w-full my-6 z-10 space-y-6 overflow-y-auto">
          
          {/* Hero Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-8 rounded-3xl glass-card border border-brand-success/40 flex flex-col sm:flex-row items-center gap-6 shadow-glow-emerald backdrop-blur-3xl"
          >
            <div className="w-16 h-16 rounded-full bg-brand-success/20 border-2 border-brand-success text-brand-success flex items-center justify-center shrink-0 shadow-glow-emerald">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="text-center sm:text-left space-y-1">
              <h1 className="text-3xl font-extrabold text-white font-sans tracking-tight">
                Emergency Handled
              </h1>
              <p className="text-sm text-slate-300 font-sans">
                Help has been dispatched successfully. Emergency telemetry report generated.
              </p>
            </div>
          </motion.div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            <div className="md:col-span-7 space-y-6">
              
              <div className="p-6 rounded-3xl glass-card border border-white/10 space-y-4 shadow-card-soft backdrop-blur-3xl">
                <div>
                  <span className="text-xs font-mono font-bold text-cyan-400 uppercase block mb-1">WHAT HAPPENED</span>
                  <p className="text-sm text-slate-200 font-sans leading-relaxed">
                    "{summaryData?.userQueryRecap || 'You reported that your father suddenly collapsed and was not responding.'}"
                  </p>
                </div>

                <div className="pt-3 border-t border-white/10">
                  <span className="text-xs font-mono font-bold text-brand-emergency uppercase block mb-1">AI DIAGNOSIS</span>
                  <div className="text-lg font-extrabold text-white font-sans flex items-center justify-between">
                    <span>{summaryData?.aiDiagnosis || 'Cardiac Arrest'}</span>
                    <span className="text-xs font-mono text-brand-emergency bg-brand-emergency/20 px-3 py-1 rounded-full border border-brand-emergency/30">
                      Confidence: {summaryData?.confidenceScore || 97}%
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 space-y-2">
                  <span className="text-xs font-mono font-bold text-brand-success uppercase block mb-1">ACTIONS TAKEN</span>
                  <div className="space-y-2 text-xs text-slate-200 font-sans">
                    {(summaryData?.actionsTaken || [
                      'Ambulance called',
                      'CPR guidance provided',
                      'Live location shared',
                      'Emergency contacts notified'
                    ]).map((act, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-brand-success shrink-0" />
                        <span>{act}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 text-xs text-slate-400 font-sans italic flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-brand-emergency shrink-0" />
                  <span>Stay safe. I'm always here when you need me.</span>
                </div>
              </div>

            </div>

            <div className="md:col-span-5 space-y-6">
              
              <div className="p-6 rounded-3xl glass-card border border-white/10 space-y-3 shadow-card-soft backdrop-blur-3xl font-mono text-xs">
                <div className="text-slate-300 font-bold uppercase border-b border-white/10 pb-2">SESSION SUMMARY</div>
                
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-slate-400">Start Time:</span>
                  <span className="text-white font-bold">{summaryData?.startTime || '09:41 PM'}</span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-slate-400">End Time:</span>
                  <span className="text-white font-bold">{summaryData?.endTime || '09:56 PM'}</span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-slate-400">Duration:</span>
                  <span className="text-cyan-400 font-bold">{summaryData?.duration || '15 mins'}</span>
                </div>

                <div className="flex justify-between py-1.5">
                  <span className="text-slate-400">Location:</span>
                  <span className="text-slate-200">{summaryData?.location || 'San Francisco, CA'}</span>
                </div>
              </div>

              <div className="p-6 rounded-3xl glass-card border border-white/10 space-y-3 shadow-card-soft backdrop-blur-3xl">
                <div className="text-xs font-mono font-bold text-cyan-400 uppercase flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-cyan-400" />
                  HOSPITAL DESTINATION
                </div>

                <div className="text-base font-bold text-white font-sans">
                  {summaryData?.hospitalDestination?.name || 'UCSF Helen Diller Medical Center'}
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  {summaryData?.hospitalDestination?.address || '505 Parnassus Ave, San Francisco, CA'}
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* Return Button */}
        <footer className="flex justify-center pt-2 z-10">
          <button
            onClick={resetToHome}
            className="px-8 py-4 rounded-2xl bg-space-card/80 border border-white/10 hover:border-cyan-400 text-white font-sans font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-glow-brand transition-all hover:scale-105 backdrop-blur-xl"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-400" />
            <span>Return to Home Screen</span>
          </button>
        </footer>

      </div>
    </AuroraBackground>
  );
};
