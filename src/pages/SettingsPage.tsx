import React, { useState } from 'react';
import { useEmergency } from '../context/EmergencyContext';
import { GlassCard } from '../components/common/GlassCard';
import { Badge } from '../components/common/Badge';
import { apiService } from '../services/api';
import { 
  Settings as SettingsIcon, 
  User, 
  Users, 
  Volume2, 
  Plus, 
  Save, 
  CheckCircle2,
  Cpu
} from 'lucide-react';
import type { MedicalProfile, EmergencyContact, UserSettings } from '../types';

export const SettingsPage: React.FC = () => {
  const { profile, contacts, settings, refreshData } = useEmergency();

  const [activeTab, setActiveTab] = useState<'profile' | 'contacts' | 'voice' | 'sensors'>('profile');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form states
  const [profileForm, setProfileForm] = useState<MedicalProfile>(
    profile || {
      full_name: "Alexander Vance",
      age: 34,
      gender: "Male",
      blood_type: "O-Positive (O+)",
      allergies: ["Penicillin", "Bee Stings", "Latex"],
      medical_conditions: ["Mild Asthma", "Hypertension"],
      medications: ["Albuterol Inhaler (PRN)", "Lisinopril 10mg"],
      organ_donor: true,
      insurance_provider: "Aetna Healthcare #99281-EA",
      emergency_note: "Carries EpiPen in front pocket. Asthma trigger under intense exertion."
    }
  );

  const [contactsList, setContactsList] = useState<EmergencyContact[]>(contacts);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactRel, setNewContactRel] = useState('');

  const [settingsForm, setSettingsForm] = useState<UserSettings>(
    settings || {
      voice_speed: 1.0,
      voice_gender: "Calm Female (Echo Core)",
      auto_dispatch_911: true,
      crash_detection_sensitivity: "High",
      fall_detection_enabled: true,
      offline_ai_fallback: true,
      biometric_lock: true,
      stealth_sos_trigger: "Triple Power Button Tap"
    }
  );

  const handleSaveProfile = async () => {
    await apiService.updateProfile(profileForm);
    await refreshData();
    triggerSaveNotification();
  };

  const handleSaveSettings = async () => {
    await apiService.updateSettings(settingsForm);
    await refreshData();
    triggerSaveNotification();
  };

  const handleAddContact = async () => {
    if (!newContactName || !newContactPhone) return;
    const added = await apiService.addContact({
      name: newContactName,
      phone: newContactPhone,
      relationship: newContactRel || 'Emergency Contact',
      email: `${newContactName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      is_primary: contactsList.length === 0,
      notify_on_sos: true,
    });
    setContactsList([...contactsList, added]);
    setNewContactName('');
    setNewContactPhone('');
    setNewContactRel('');
    await refreshData();
    triggerSaveNotification();
  };

  const triggerSaveNotification = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <SettingsIcon className="w-7 h-7 text-cyan-400" />
              Medical ID & System Configuration
            </h1>
            {saveSuccess && (
              <Badge variant="emerald" pulse>
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                CHANGES SAVED TO VAULT
              </Badge>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">Configure encrypted personal health details, ICE contact alert relays, and hardware trigger sensitivities.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-cyan-500/20 pb-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold font-mono transition-all ${
            activeTab === 'profile'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-glow-cyan'
              : 'bg-navy-900 text-slate-400 hover:text-white'
          }`}
        >
          <User className="w-4 h-4" /> Personal Medical ID
        </button>

        <button
          onClick={() => setActiveTab('contacts')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold font-mono transition-all ${
            activeTab === 'contacts'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-glow-cyan'
              : 'bg-navy-900 text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" /> ICE Emergency Contacts ({contactsList.length})
        </button>

        <button
          onClick={() => setActiveTab('voice')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold font-mono transition-all ${
            activeTab === 'voice'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-glow-cyan'
              : 'bg-navy-900 text-slate-400 hover:text-white'
          }`}
        >
          <Volume2 className="w-4 h-4" /> AI Voice & Synthesis
        </button>

        <button
          onClick={() => setActiveTab('sensors')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold font-mono transition-all ${
            activeTab === 'sensors'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-glow-cyan'
              : 'bg-navy-900 text-slate-400 hover:text-white'
          }`}
        >
          <Cpu className="w-4 h-4" /> Hardware & SOS Triggers
        </button>
      </div>

      {/* Tab 1: Personal Medical ID */}
      {activeTab === 'profile' && (
        <GlassCard className="p-8 border-cyan-500/30 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <User className="w-5 h-5 text-cyan-400" /> Medical Vault Profile
            </h2>
            <span className="text-xs font-mono text-emerald-400">HIPAA 256-BIT ENCRYPTED</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-xs">
            <div>
              <label className="text-slate-400 block mb-1 font-mono">Full Patient Name</label>
              <input
                type="text"
                value={profileForm.full_name}
                onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-navy-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-400 font-sans"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-mono">Age (Years)</label>
              <input
                type="number"
                value={profileForm.age}
                onChange={(e) => setProfileForm({ ...profileForm, age: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 rounded-xl bg-navy-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-400 font-sans"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-mono">Blood Type Group</label>
              <select
                value={profileForm.blood_type}
                onChange={(e) => setProfileForm({ ...profileForm, blood_type: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-navy-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-400 font-sans"
              >
                {['O-Positive (O+)', 'O-Negative (O-)', 'A-Positive (A+)', 'A-Negative (A-)', 'B-Positive (B+)', 'B-Negative (B-)', 'AB-Positive (AB+)', 'AB-Negative (AB-)'].map((bt) => (
                  <option key={bt} value={bt}>{bt}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-mono">Severe Allergies (Comma separated)</label>
              <input
                type="text"
                value={profileForm.allergies.join(', ')}
                onChange={(e) => setProfileForm({ ...profileForm, allergies: e.target.value.split(',').map(s => s.trim()) })}
                className="w-full px-4 py-3 rounded-xl bg-navy-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-400 font-sans"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-mono">Medical Conditions</label>
              <input
                type="text"
                value={profileForm.medical_conditions.join(', ')}
                onChange={(e) => setProfileForm({ ...profileForm, medical_conditions: e.target.value.split(',').map(s => s.trim()) })}
                className="w-full px-4 py-3 rounded-xl bg-navy-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-400 font-sans"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-mono">Current Medications</label>
              <input
                type="text"
                value={profileForm.medications.join(', ')}
                onChange={(e) => setProfileForm({ ...profileForm, medications: e.target.value.split(',').map(s => s.trim()) })}
                className="w-full px-4 py-3 rounded-xl bg-navy-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-400 font-sans"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-400 block mb-1 font-mono text-xs">Paramedic Emergency Instructions Note</label>
            <textarea
              rows={3}
              value={profileForm.emergency_note}
              onChange={(e) => setProfileForm({ ...profileForm, emergency_note: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-navy-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-400 font-sans"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleSaveProfile}
              className="px-6 py-3 rounded-xl bg-cyan-500 text-navy-950 font-bold text-xs shadow-glow-cyan hover:scale-105 transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Save Medical ID Vault
            </button>
          </div>
        </GlassCard>
      )}

      {/* Tab 2: ICE Contacts */}
      {activeTab === 'contacts' && (
        <GlassCard className="p-8 border-cyan-500/30 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-400" /> ICE Emergency Relays
            </h2>
            <span className="text-xs font-mono text-cyan-400">AUTOMATED SMS SATELLITE DISPATCH</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contactsList.map((c) => (
              <div key={c.id} className="p-4 rounded-xl bg-navy-950 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">{c.name}</span>
                  {c.is_primary && <Badge variant="cyan">PRIMARY ICE</Badge>}
                </div>
                <div className="text-slate-400">{c.relationship}</div>
                <div className="font-mono text-cyan-300">{c.phone}</div>
                <div className="text-[11px] text-slate-500">{c.email}</div>
              </div>
            ))}
          </div>

          {/* Add New Contact Form */}
          <div className="p-5 rounded-2xl bg-navy-950/80 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-cyan-400" /> Add New Emergency Contact
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <input
                type="text"
                placeholder="Full Name (e.g. Sarah Connor)"
                value={newContactName}
                onChange={(e) => setNewContactName(e.target.value)}
                className="px-4 py-2.5 rounded-xl bg-navy-900 border border-slate-800 text-white focus:outline-none focus:border-cyan-400"
              />
              <input
                type="text"
                placeholder="Phone (+1 555 019-2834)"
                value={newContactPhone}
                onChange={(e) => setNewContactPhone(e.target.value)}
                className="px-4 py-2.5 rounded-xl bg-navy-900 border border-slate-800 text-white focus:outline-none focus:border-cyan-400"
              />
              <input
                type="text"
                placeholder="Relationship (e.g. Spouse / Doctor)"
                value={newContactRel}
                onChange={(e) => setNewContactRel(e.target.value)}
                className="px-4 py-2.5 rounded-xl bg-navy-900 border border-slate-800 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
            <button
              onClick={handleAddContact}
              className="px-5 py-2.5 rounded-xl bg-cyan-500 text-navy-950 font-bold text-xs shadow-glow-cyan hover:scale-105 transition-all"
            >
              Add Emergency Contact
            </button>
          </div>
        </GlassCard>
      )}

      {/* Tab 3: AI Voice */}
      {activeTab === 'voice' && (
        <GlassCard className="p-8 border-cyan-500/30 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-cyan-400" /> AI Voice & Speech Synthesizer Settings
            </h2>
          </div>

          <div className="space-y-6 text-xs max-w-xl">
            <div>
              <label className="text-slate-400 block mb-2 font-mono">Speech Speed Rate ({settingsForm.voice_speed}x)</label>
              <input
                type="range"
                min="0.75"
                max="1.25"
                step="0.05"
                value={settingsForm.voice_speed}
                onChange={(e) => setSettingsForm({ ...settingsForm, voice_speed: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                <span>0.75x (Calm & Slow)</span>
                <span>1.0x (Standard)</span>
                <span>1.25x (Rapid Crisis)</span>
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-2 font-mono">Voice Synthesizer Persona</label>
              <select
                value={settingsForm.voice_gender}
                onChange={(e) => setSettingsForm({ ...settingsForm, voice_gender: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-navy-950 border border-slate-800 text-white font-sans focus:outline-none focus:border-cyan-400"
              >
                <option>Calm Female (Echo Core)</option>
                <option>Authoritative Male (Rescue Operator)</option>
                <option>Low-Pitch Soothing (Panic Neutralizer)</option>
              </select>
            </div>

            <div className="pt-2">
              <button
                onClick={handleSaveSettings}
                className="px-6 py-3 rounded-xl bg-cyan-500 text-navy-950 font-bold text-xs shadow-glow-cyan hover:scale-105 transition-all flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> Save Voice Configuration
              </button>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Tab 4: Hardware & Sensors */}
      {activeTab === 'sensors' && (
        <GlassCard className="p-8 border-cyan-500/30 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-cyan-400" /> Hardware Triggers & Crash Sensors
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="p-5 rounded-2xl bg-navy-950 border border-slate-800 space-y-3">
              <span className="font-bold text-white block text-sm">Crash & High-G Deceleration</span>
              <p className="text-slate-400 text-xs">Triggers automated 10-second SOS countdown if vehicle impact &gt; 8.5G detected.</p>
              <select
                value={settingsForm.crash_detection_sensitivity}
                onChange={(e) => setSettingsForm({ ...settingsForm, crash_detection_sensitivity: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-navy-900 border border-slate-800 text-cyan-300 font-mono"
              >
                <option>High (Sensitive)</option>
                <option>Medium (Standard Auto)</option>
                <option>Low (Track / Extreme Sports)</option>
              </select>
            </div>

            <div className="p-5 rounded-2xl bg-navy-950 border border-slate-800 space-y-3">
              <span className="font-bold text-white block text-sm">Fall & Hard Impact Sensor</span>
              <p className="text-slate-400 text-xs">Continuous accelerometer monitoring for elderly or high-altitude falls.</p>
              <Badge variant={settingsForm.fall_detection_enabled ? 'emerald' : 'red'}>
                {settingsForm.fall_detection_enabled ? 'ACTIVE & PROTECTED' : 'DISABLED'}
              </Badge>
            </div>
          </div>
        </GlassCard>
      )}

    </div>
  );
};
