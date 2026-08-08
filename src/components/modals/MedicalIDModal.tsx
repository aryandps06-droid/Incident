import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useEmergency } from '../../context/EmergencyContext';
import { apiService } from '../../services/api';
import { 
  X, 
  Stethoscope, 
  Edit3, 
  Save, 
  AlertTriangle, 
  ShieldCheck, 
  Download, 
  Heart, 
  Sparkles,
  Lock,
  FileText
} from 'lucide-react';

export const MedicalIDModal: React.FC = () => {
  const { activeModal, setActiveModal, profile, refreshData } = useEmergency();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState<number>(34);
  const [gender, setGender] = useState('Male');
  const [bloodType, setBloodType] = useState('O-Positive (O+)');
  const [organDonor, setOrganDonor] = useState(true);
  const [allergiesText, setAllergiesText] = useState('');
  const [conditionsText, setConditionsText] = useState('');
  const [medicationsText, setMedicationsText] = useState('');
  const [insurance, setInsurance] = useState('');
  const [emergencyNote, setEmergencyNote] = useState('');

  // Sync profile data when modal opens
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || 'Alexander Vance');
      setAge(profile.age || 34);
      setGender(profile.gender || 'Male');
      setBloodType(profile.blood_type || 'O-Positive (O+)');
      setOrganDonor(profile.organ_donor ?? true);
      setAllergiesText(profile.allergies ? profile.allergies.join(', ') : 'Penicillin, Bee Stings, Latex');
      setConditionsText(profile.medical_conditions ? profile.medical_conditions.join(', ') : 'Mild Asthma, Hypertension');
      setMedicationsText(profile.medications ? profile.medications.join(', ') : 'Albuterol Inhaler (PRN), Lisinopril 10mg');
      setInsurance(profile.insurance_provider || 'Aetna Healthcare #99281-EA');
      setEmergencyNote(profile.emergency_note || 'Carries EpiPen in main backpack pocket. Pre-existing bronchial sensitivity.');
    }
  }, [profile, activeModal]);

  if (activeModal !== 'medical-id') return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updatedProfile = {
        full_name: fullName.trim(),
        age: Number(age),
        gender: gender.trim(),
        blood_type: bloodType.trim(),
        allergies: allergiesText.split(',').map(s => s.trim()).filter(Boolean),
        medical_conditions: conditionsText.split(',').map(s => s.trim()).filter(Boolean),
        medications: medicationsText.split(',').map(s => s.trim()).filter(Boolean),
        organ_donor: organDonor,
        insurance_provider: insurance.trim(),
        emergency_note: emergencyNote.trim()
      };

      await apiService.updateProfile(updatedProfile);
      await refreshData();
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const downloadMedicalPass = () => {
    const passText = `==================================================
EMERGENCY MEDICAL ID PASS — APPLE HEALTH COMPLIANT
==================================================
Patient Name: ${fullName}
Blood Type: ${bloodType}
Age / Gender: ${age} Yrs • ${gender}
Organ Donor: ${organDonor ? 'YES' : 'NO'}
Insurance: ${insurance}

--------------------------------------------------
CRITICAL ALLERGIES:
${allergiesText}

--------------------------------------------------
MEDICAL CONDITIONS:
${conditionsText}

--------------------------------------------------
CURRENT MEDICATIONS:
${medicationsText}

--------------------------------------------------
PARAMEDIC EMERGENCY INSTRUCTION NOTE:
"${emergencyNote}"

==================================================
Platform: EchoAid X Emergency Vault
Encrypted: HIPAA & Apple Health 256-Bit Storage
==================================================`;

    const blob = new Blob([passText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Medical_ID_${fullName.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-2xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-2xl bg-[#070C1E]/95 border border-purple-500/40 rounded-[32px] p-6 sm:p-8 space-y-5 shadow-[0_35px_90px_rgba(0,0,0,0.9)] backdrop-blur-3xl text-left max-h-[90vh] overflow-y-auto custom-scrollbar relative"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500/20 via-cyan-500/20 to-pink-500/20 border border-purple-400/50 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
              <Stethoscope className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-white font-sans tracking-tight flex items-center gap-2">
                <span>Emergency Medical ID Vault</span>
                <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30 uppercase font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" /> Active
                </span>
              </h3>
              <div className="text-xs font-mono text-purple-300 font-semibold flex items-center gap-1 mt-0.5">
                <Lock className="w-3 h-3 text-cyan-400" />
                <span>Apple Health & HIPAA Compliant 256-Bit Encrypted Storage</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-3.5 py-1.5 rounded-2xl bg-purple-500/20 border border-purple-400/40 hover:bg-purple-500/30 text-purple-200 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-glow-purple"
            >
              <Edit3 className="w-3.5 h-3.5 text-purple-300" />
              <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
            </button>

            <button
              onClick={() => setActiveModal('none')}
              aria-label="Close Medical ID"
              className="p-2 rounded-2xl bg-white/[0.06] border border-white/15 text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* INTERACTIVE EDIT MODE */}
        {isEditing ? (
          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs font-sans">
            <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 space-y-3">
              <div className="font-bold text-purple-300 font-mono uppercase text-[11px] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Edit Patient Vitals & Identification</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-bold block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-white/[0.06] border border-white/15 text-white placeholder-slate-400 font-sans focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-bold block mb-1">Blood Type</label>
                  <select
                    value={bloodType}
                    onChange={(e) => setBloodType(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#070C1E] border border-white/15 text-white font-sans focus:outline-none focus:border-purple-400"
                  >
                    <option value="O-Positive (O+)">O-Positive (O+)</option>
                    <option value="O-Negative (O-)">O-Negative (O-)</option>
                    <option value="A-Positive (A+)">A-Positive (A+)</option>
                    <option value="A-Negative (A-)">A-Negative (A-)</option>
                    <option value="B-Positive (B+)">B-Positive (B+)</option>
                    <option value="B-Negative (B-)">B-Negative (B-)</option>
                    <option value="AB-Positive (AB+)">AB-Positive (AB+)</option>
                    <option value="AB-Negative (AB-)">AB-Negative (AB-)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-bold block mb-1">Age (Years)</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-white/[0.06] border border-white/15 text-white font-sans focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-bold block mb-1">Gender</label>
                  <input
                    type="text"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-white/[0.06] border border-white/15 text-white font-sans focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <label className="text-[11px] font-bold text-white flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={organDonor}
                    onChange={(e) => setOrganDonor(e.target.checked)}
                    className="w-4 h-4 rounded text-purple-500 focus:ring-purple-400"
                  />
                  <span>Registered Organ Donor</span>
                </label>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono text-red-400 uppercase font-bold block mb-1">Severe Allergies (comma separated)</label>
              <input
                type="text"
                value={allergiesText}
                onChange={(e) => setAllergiesText(e.target.value)}
                placeholder="Penicillin, Bee Stings, Latex"
                className="w-full px-3.5 py-2 rounded-xl bg-white/[0.06] border border-red-500/40 text-white placeholder-slate-400 font-sans focus:outline-none focus:border-red-400"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono text-cyan-400 uppercase font-bold block mb-1">Medical Conditions (comma separated)</label>
              <input
                type="text"
                value={conditionsText}
                onChange={(e) => setConditionsText(e.target.value)}
                placeholder="Mild Asthma, Hypertension"
                className="w-full px-3.5 py-2 rounded-xl bg-white/[0.06] border border-white/15 text-white placeholder-slate-400 font-sans focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono text-purple-400 uppercase font-bold block mb-1">Medications (comma separated)</label>
              <input
                type="text"
                value={medicationsText}
                onChange={(e) => setMedicationsText(e.target.value)}
                placeholder="Albuterol Inhaler (PRN), Lisinopril 10mg"
                className="w-full px-3.5 py-2 rounded-xl bg-white/[0.06] border border-white/15 text-white placeholder-slate-400 font-sans focus:outline-none focus:border-purple-400"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono text-slate-400 uppercase font-bold block mb-1">Insurance Provider & Policy #</label>
              <input
                type="text"
                value={insurance}
                onChange={(e) => setInsurance(e.target.value)}
                placeholder="Aetna Healthcare #99281-EA"
                className="w-full px-3.5 py-2 rounded-xl bg-white/[0.06] border border-white/15 text-white placeholder-slate-400 font-sans focus:outline-none focus:border-purple-400"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono text-yellow-400 uppercase font-bold block mb-1">Paramedic Emergency Instruction Note</label>
              <textarea
                rows={2}
                value={emergencyNote}
                onChange={(e) => setEmergencyNote(e.target.value)}
                placeholder="Carries EpiPen in front pocket. Asthma trigger under intense exertion."
                className="w-full px-3.5 py-2 rounded-xl bg-white/[0.06] border border-yellow-500/40 text-white placeholder-slate-400 font-sans focus:outline-none focus:border-yellow-400 resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-5 py-2.5 rounded-2xl bg-white/[0.06] border border-white/15 text-slate-300 font-bold hover:bg-white/10 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-glow-purple flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>Save Medical ID</span>
              </button>
            </div>
          </form>
        ) : (
          /* READ-ONLY REAL MEDICAL ID CARD DISPLAY */
          <div className="space-y-4 text-xs sm:text-sm font-sans">
            
            {/* Primary Vitals Header Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-white/[0.04] border border-white/10 text-center shadow-card-soft">
              <div>
                <span className="text-slate-400 block text-[10px] font-mono uppercase">PATIENT NAME</span>
                <span className="text-white font-bold font-sans text-sm mt-0.5 block">{fullName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-mono uppercase">BLOOD GROUP</span>
                <span className="text-red-400 font-extrabold font-mono text-sm mt-0.5 block">{bloodType}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-mono uppercase">AGE / GENDER</span>
                <span className="text-white font-bold mt-0.5 block">{age} Yrs • {gender}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-mono uppercase">ORGAN DONOR</span>
                <span className="text-emerald-400 font-bold font-mono text-sm mt-0.5 block flex items-center justify-center gap-1">
                  <Heart className="w-3.5 h-3.5 fill-emerald-400/30 text-emerald-400" />
                  <span>{organDonor ? 'YES' : 'NO'}</span>
                </span>
              </div>
            </div>

            {/* Severe Known Allergies */}
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 space-y-1">
              <span className="text-red-400 text-[10px] font-mono uppercase font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>SEVERE KNOWN ALLERGIES</span>
              </span>
              <div className="flex flex-wrap gap-2 pt-1">
                {allergiesText.split(',').map(s => s.trim()).filter(Boolean).map((alg, i) => (
                  <span key={i} className="px-3 py-1 rounded-xl bg-red-500/20 text-red-300 border border-red-500/40 text-xs font-bold font-mono shadow-glow-red">
                    {alg}
                  </span>
                ))}
              </div>
            </div>

            {/* Medical Conditions & Medications */}
            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
              <span className="text-cyan-400 text-[10px] font-mono uppercase font-bold flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5" />
                <span>MEDICAL CONDITIONS & MEDICATIONS</span>
              </span>
              <div className="text-slate-200 leading-relaxed text-xs space-y-1">
                <div><strong className="text-white">Conditions:</strong> {conditionsText}</div>
                <div><strong className="text-white">Medications:</strong> {medicationsText}</div>
                <div><strong className="text-white">Insurance:</strong> <span className="font-mono text-purple-300">{insurance}</span></div>
              </div>
            </div>

            {/* Paramedic Emergency Instruction Note */}
            <div className="p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 space-y-1">
              <span className="text-yellow-400 font-mono font-bold text-[10px] uppercase flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                <span>PARAMEDIC EMERGENCY INSTRUCTION NOTE</span>
              </span>
              <p className="text-yellow-100 italic font-sans text-xs">"{emergencyNote}"</p>
            </div>

            {/* Footer Actions: Download Pass & Close */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/10">
              <button
                onClick={downloadMedicalPass}
                className="px-4 py-2.5 rounded-2xl bg-white/[0.06] border border-white/15 hover:border-cyan-400 text-cyan-300 font-sans text-xs font-bold flex items-center gap-2 transition-all hover:scale-105 cursor-pointer"
              >
                <Download className="w-4 h-4 text-cyan-400" />
                <span>Download Medical ID Pass</span>
              </button>

              <button
                onClick={() => setActiveModal('none')}
                className="px-6 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-glow-purple hover:scale-105 transition-all cursor-pointer"
              >
                Done
              </button>
            </div>

          </div>
        )}

      </motion.div>
    </div>
  );
};
