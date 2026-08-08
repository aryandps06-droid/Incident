import React from 'react';
import { motion } from 'framer-motion';
import { useEmergency } from '../../context/EmergencyContext';
import { X, Lock } from 'lucide-react';

export const VaultDrawer: React.FC = () => {
  const { activeModal, setActiveModal, profile } = useEmergency();

  if (activeModal !== 'vault') return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-2xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl bg-command-card border border-cyber-emerald/50 rounded-2xl p-6 sm:p-8 space-y-6 shadow-glow-emerald"
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyber-emerald/20 border border-cyber-emerald/40 text-cyber-emerald">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-sans">Encrypted Patient Medical Vault</h3>
              <div className="text-xs font-mono text-cyber-emerald">Zero-Knowledge SHA-256 Vault</div>
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
          <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-command-bg border border-slate-800">
            <div>
              <span className="text-slate-400 block">PATIENT NAME</span>
              <span className="text-white font-bold font-sans text-sm">{profile?.full_name}</span>
            </div>
            <div>
              <span className="text-slate-400 block">BLOOD TYPE</span>
              <span className="text-cyber-red font-bold">{profile?.blood_type}</span>
            </div>
            <div>
              <span className="text-slate-400 block">AGE / GENDER</span>
              <span className="text-white">{profile?.age} Yrs • {profile?.gender}</span>
            </div>
            <div>
              <span className="text-slate-400 block">ORGAN DONOR</span>
              <span className="text-cyber-emerald">{profile?.organ_donor ? 'YES (REGISTERED)' : 'NO'}</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-command-bg border border-slate-800 space-y-1">
            <span className="text-slate-400 block">SEVERE KNOWN ALLERGIES</span>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {profile?.allergies.map((alg, i) => (
                <span key={i} className="px-2.5 py-1 rounded bg-cyber-red/15 text-cyber-red border border-cyber-red/30 text-xs font-bold">
                  {alg}
                </span>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-command-bg border border-slate-800 space-y-1">
            <span className="text-slate-400 block">MEDICAL CONDITIONS & MEDICATIONS</span>
            <div className="text-slate-200 font-sans">
              Conditions: {profile?.medical_conditions.join(', ')} <br />
              Medications: {profile?.medications.join(', ')}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-cyber-emerald/10 border border-cyber-emerald/30 space-y-1">
            <span className="text-cyber-emerald font-bold block">PARAMEDIC EMERGENCY NOTE</span>
            <p className="text-slate-200 font-sans italic">"{profile?.emergency_note}"</p>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={() => setActiveModal('none')}
            className="px-6 py-2.5 rounded-xl bg-cyber-emerald text-navy-950 font-bold text-xs shadow-glow-emerald"
          >
            Close Vault
          </button>
        </div>

      </motion.div>
    </div>
  );
};
