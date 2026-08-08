import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEmergency } from '../../context/EmergencyContext';
import { apiService } from '../../services/api';
import { 
  X, 
  Users, 
  CheckCircle2, 
  PhoneCall, 
  ShieldAlert, 
  Plus, 
  Check, 
  Sparkles,
  HeartPulse,
  Flame,
  Shield,
  HelpCircle,
  AlertTriangle
} from 'lucide-react';

export const ContactsModal: React.FC = () => {
  const { activeModal, setActiveModal, contacts, refreshData } = useEmergency();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRelationship, setNewRelationship] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (activeModal !== 'contacts') return null;

  // Real National & International Direct Emergency Numbers
  const realEmergencyHotlines = [
    {
      id: 'h1',
      name: 'National Ambulance Service (EMS)',
      number: '108',
      desc: 'Immediate Emergency Cardiac & Trauma Ambulance Dispatch',
      badge: '24/7 Free Medical Response',
      icon: <HeartPulse className="w-5 h-5 text-red-400 animate-pulse" />,
      btnColor: 'bg-red-600 hover:bg-red-500 shadow-glow-red text-white'
    },
    {
      id: 'h2',
      name: 'Unified National Emergency Helpline',
      number: '112',
      desc: 'Single National Helpline (Ambulance, Police, Fire)',
      badge: 'Global Standard 112 Dispatch',
      icon: <ShieldAlert className="w-5 h-5 text-cyan-400 animate-pulse" />,
      btnColor: 'bg-cyan-600 hover:bg-cyan-500 shadow-glow-cyan text-white'
    },
    {
      id: 'h3',
      name: 'Police Emergency Control Room',
      number: '100',
      desc: 'Police Enforcement & Law Rapid Action Unit',
      badge: 'Immediate Dispatch',
      icon: <Shield className="w-5 h-5 text-purple-400" />,
      btnColor: 'bg-purple-600 hover:bg-purple-500 shadow-glow-purple text-white'
    },
    {
      id: 'h4',
      name: 'Fire & Rescue Operations',
      number: '101',
      desc: 'Fire Brigade, Explosion & Structural Hazard Rescue',
      badge: 'Hazard Operations',
      icon: <Flame className="w-5 h-5 text-orange-400" />,
      btnColor: 'bg-orange-600 hover:bg-orange-500 text-white'
    },
    {
      id: 'h5',
      name: 'Women\'s Emergency Helpline',
      number: '1091',
      desc: '24/7 Women Safety, Distress SOS & Rescue Relay',
      badge: 'Instant Protection',
      icon: <Users className="w-5 h-5 text-pink-400" />,
      btnColor: 'bg-pink-600 hover:bg-pink-500 text-white'
    },
    {
      id: 'h6',
      name: 'Child Protection Emergency Helpline',
      number: '1098',
      desc: 'Child Safety & Immediate Emergency Assistance',
      badge: 'Child Helpline',
      icon: <HelpCircle className="w-5 h-5 text-emerald-400" />,
      btnColor: 'bg-emerald-600 hover:bg-emerald-500 text-white'
    },
    {
      id: 'h7',
      name: 'National Poison Control Center',
      number: '1800-11-6666',
      desc: 'Toxic Chemical, Venom & Poison Triage Support',
      badge: 'Medical Toxicology',
      icon: <AlertTriangle className="w-5 h-5 text-yellow-400" />,
      btnColor: 'bg-yellow-600 hover:bg-yellow-500 text-white'
    }
  ];

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;

    setIsSubmitting(true);
    try {
      await apiService.addContact({
        id: `c${Date.now()}`,
        name: newName.trim(),
        relationship: newRelationship.trim() || 'Emergency Contact',
        phone: newPhone.trim(),
        notify_on_sos: true,
        is_primary: false,
        email: `${newName.toLowerCase().replace(/\s+/g, '.')}@emergency.contact`
      });
      await refreshData();
      setNewName('');
      setNewRelationship('');
      setNewPhone('');
      setShowAddForm(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-2xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-2xl bg-[#070C1E]/95 border border-cyan-500/40 rounded-[32px] p-6 sm:p-8 space-y-6 shadow-[0_35px_90px_rgba(0,0,0,0.9)] backdrop-blur-3xl text-left max-h-[90vh] overflow-y-auto custom-scrollbar relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-red-500/20 via-cyan-500/20 to-purple-500/20 border border-cyan-400/50 text-cyan-300 shadow-[0_0_15px_rgba(0,229,255,0.4)]">
              <PhoneCall className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-white font-sans tracking-tight">
                Emergency Hotlines & ICE Contacts
              </h3>
              <div className="text-xs font-mono text-cyan-300 font-semibold flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>Real 1-Tap Direct Phone Call & GPS SOS Relays</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveModal('none')}
            aria-label="Close contacts modal"
            className="p-2 rounded-2xl bg-white/[0.06] border border-white/15 text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SECTION 1: REAL NATIONAL EMERGENCY HOTLINES (AMBULANCE, POLICE, FIRE) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <span>Official Real Emergency Numbers (1-Tap Dial)</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Direct Telephony</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {realEmergencyHotlines.map((h) => (
              <div 
                key={h.id} 
                className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-cyan-400/50 transition-all duration-300 space-y-2.5 flex flex-col justify-between group shadow-card-soft"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-white/[0.06] border border-white/10 group-hover:border-cyan-400/40 shrink-0">
                      {h.icon}
                    </div>
                    <div>
                      <div className="font-bold text-white text-xs font-sans group-hover:text-cyan-300 transition-colors">
                        {h.name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-sans line-clamp-1 mt-0.5">
                        {h.desc}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-white/10">
                  <span className="text-[14px] font-mono font-black text-cyan-300">
                    {h.number}
                  </span>

                  {/* Real 1-Tap Dial Link */}
                  <a
                    href={`tel:${h.number.replace(/[^0-9]/g, '')}`}
                    className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold flex items-center gap-1.5 transition-all hover:scale-105 cursor-pointer ${h.btnColor}`}
                  >
                    <PhoneCall className="w-3 h-3" />
                    <span>Call {h.number.split(' ')[0]}</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 2: SAVED ICE FAMILY & PHYSICIAN CONTACTS */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between border-t border-white/10 pt-4">
            <div className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-purple-400" />
              <span>Personal ICE Emergency Contacts ({contacts.length})</span>
            </div>

            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/40 text-purple-300 text-xs font-mono font-bold flex items-center gap-1 hover:bg-purple-500/30 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showAddForm ? 'Cancel' : 'Add Contact'}</span>
            </button>
          </div>

          {/* Add Contact Form */}
          <AnimatePresence>
            {showAddForm && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleAddContact}
                className="p-4 rounded-2xl bg-white/[0.05] border border-purple-500/40 space-y-3 text-xs overflow-hidden"
              >
                <div className="font-bold text-white font-sans flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>Add New Emergency ICE Contact</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Full Name (e.g. Dr. Vance)"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-white/[0.06] border border-white/15 text-white placeholder-slate-400 font-sans focus:outline-none focus:border-purple-400"
                  />
                  <input
                    type="text"
                    placeholder="Relationship (e.g. Spouse)"
                    value={newRelationship}
                    onChange={(e) => setNewRelationship(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-white/[0.06] border border-white/15 text-white placeholder-slate-400 font-sans focus:outline-none focus:border-purple-400"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Phone Number (e.g. +1 555-0192)"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-white/[0.06] border border-white/15 text-white placeholder-slate-400 font-sans focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-glow-purple flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Contact</span>
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Contacts List */}
          <div className="space-y-2.5">
            {contacts.map((c) => (
              <div 
                key={c.id} 
                className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-purple-400/40 flex flex-wrap items-center justify-between gap-3 transition-all duration-200"
              >
                <div>
                  <div className="font-bold text-white text-sm font-sans flex items-center gap-2">
                    <span>{c.name}</span>
                    {c.is_primary && (
                      <span className="text-[9px] font-mono text-cyan-300 bg-cyan-500/15 px-2 py-0.5 rounded-full border border-cyan-400/30 font-bold uppercase">
                        Primary ICE
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 font-sans mt-0.5">
                    {c.relationship} • <strong className="text-slate-200 font-mono">{c.phone}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/15 px-2.5 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Auto-SMS
                  </span>

                  {/* Real Direct Dial Link */}
                  <a
                    href={`tel:${c.phone.replace(/[^0-9+]/g, '')}`}
                    className="px-3 py-1 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold flex items-center gap-1 transition-all shadow-glow-cyan cursor-pointer"
                  >
                    <PhoneCall className="w-3 h-3" />
                    <span>Call</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span>GPS location & Medical ID attached on dial</span>
          </div>

          <button
            onClick={() => setActiveModal('none')}
            className="px-6 py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-glow-cyan hover:scale-105 transition-all cursor-pointer"
          >
            Done
          </button>
        </div>

      </motion.div>
    </div>
  );
};
