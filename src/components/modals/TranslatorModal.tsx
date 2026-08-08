import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useEmergency } from '../../context/EmergencyContext';
import { Languages, X, Globe, Sparkles } from 'lucide-react';

export const TranslatorModal: React.FC = () => {
  const { activeModal, setActiveModal, activeSession } = useEmergency();
  const [selectedLang, setSelectedLang] = useState('Spanish (Español)');

  if (activeModal !== 'translator') return null;

  const translations: Record<string, string> = {
    'Spanish (Español)': 'Emergencia cardíaca. Inicie compresiones torácicas a ritmo de 110 BPM. La ambulancia está en camino.',
    'French (Français)': 'Urgence cardiaque. Commencez les compressions thoraciques au rythme de 110 BPM. L’ambulance est en route.',
    'Mandarin (中文)': '心脏紧急情况。以每分钟110次的节奏开始胸外按压。救护车正在赶来。',
    'Arabic (العربية)': 'طوارئ قلبيّة. ابدأ بالضغط على الصدر بمعدل 110 ضغطة في الدقيقة. الإسعاف في الطريق.',
    'Hindi (हिन्दी)': 'कार्डियक आपातकाल। 110 बीपीएम की गति से छाती दबाना शुरू करें। एम्बुलेंस रास्ते में है।',
    'German (Deutsch)': 'Kardialer Notfall. Beginnen Sie mit der Herzdruckmassage im Rhythmus von 110 BPM. Der Krankenwagen ist unterwegs.'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-2xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-xl bg-command-card border border-cyber-cyan/50 rounded-2xl p-6 space-y-6 shadow-glow-cyan"
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyber-cyan/20 border border-cyber-cyan/40 text-cyber-cyan">
              <Languages className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-sans">Multi-Lingual Emergency Translator</h3>
              <div className="text-xs font-mono text-cyber-cyan">Real-time Triage Translation Engine</div>
            </div>
          </div>
          <button
            onClick={() => setActiveModal('none')}
            className="p-2 rounded-xl bg-command-surface text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs font-mono">
          <div>
            <label className="text-slate-400 block mb-1">SELECT TARGET RESPONDER LANGUAGE</label>
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-command-surface border border-slate-800 text-white font-sans focus:outline-none focus:border-cyber-cyan"
            >
              {Object.keys(translations).map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>

          <div className="p-4 rounded-xl bg-command-bg border border-slate-800 space-y-2">
            <div className="text-slate-400 text-[11px] flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-cyber-cyan" /> ORIGINAL ENGLISH INSTRUCTION:
            </div>
            <div className="text-slate-200 font-sans">
              "{activeSession?.guidance || 'Cardiac emergency. Initiate chest compressions at 110 BPM. Paramedics en route.'}"
            </div>
          </div>

          <div className="p-5 rounded-xl bg-cyber-cyan/10 border border-cyber-cyan/30 space-y-2">
            <div className="text-cyber-cyan font-bold text-[11px] flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" /> TRANSLATED TRIAGE PAYLOAD ({selectedLang.toUpperCase()}):
            </div>
            <div className="text-white font-sans text-sm font-semibold">
              "{translations[selectedLang] || translations['Spanish (Español)']}"
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={() => setActiveModal('none')}
            className="px-6 py-2.5 rounded-xl bg-cyber-cyan text-navy-950 font-bold text-xs shadow-glow-cyan"
          >
            Close Translator
          </button>
        </div>

      </motion.div>
    </div>
  );
};
