import React from 'react';
import { motion } from 'framer-motion';
import { useEmergency } from '../context/EmergencyContext';
import { GlassCard } from '../components/common/GlassCard';
import { Badge } from '../components/common/Badge';
import { 
  Heart, 
  Activity, 
  PhoneCall, 
  ShieldCheck, 
  MapPin, 
  Users, 
  AlertTriangle, 
  Flame, 
  Bone, 
  Stethoscope, 
  ChevronRight,
  Clock,
  CheckCircle2,
  Zap
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { 
    startEmergencySession, 
    setActiveTab, 
    currentVitalHeartRate, 
    currentVitalSpo2, 
    locationGPS, 
    profile, 
    contacts, 
    incidents 
  } = useEmergency();

  const quickActionTiles = [
    {
      title: 'Cardiac CPR',
      symptom: 'Sudden Chest Pain, Collapse, CPR Metronome Needed',
      badge: 'CRITICAL',
      icon: <Heart className="w-6 h-6 text-red-400" />,
      color: 'border-red-500/40 bg-red-500/10'
    },
    {
      title: 'Airway Choking',
      symptom: 'Adult choking on food, Heimlich maneuver guided protocol',
      badge: 'CRITICAL',
      icon: <Activity className="w-6 h-6 text-amber-400" />,
      color: 'border-amber-500/40 bg-amber-500/10'
    },
    {
      title: 'Arterial Bleed Control',
      symptom: 'Deep laceration, severe blood loss, tourniquet prep',
      badge: 'URGENT',
      icon: <AlertTriangle className="w-6 h-6 text-rose-400" />,
      color: 'border-rose-500/40 bg-rose-500/10'
    },
    {
      title: 'Anaphylactic Allergy',
      symptom: 'Bee sting or food allergy, EpiPen thigh injection guide',
      badge: 'URGENT',
      icon: <Zap className="w-6 h-6 text-purple-400" />,
      color: 'border-purple-500/40 bg-purple-500/10'
    },
    {
      title: 'Severe Burn Treatment',
      symptom: 'Thermal or chemical burn, immediate cooling protocol',
      badge: 'MODERATE',
      icon: <Flame className="w-6 h-6 text-orange-400" />,
      color: 'border-orange-500/40 bg-orange-500/10'
    },
    {
      title: 'Bone Fracture Immobilization',
      symptom: 'Limb fracture, pain management, splinting steps',
      badge: 'STABLE',
      icon: <Bone className="w-6 h-6 text-cyan-400" />,
      color: 'border-cyan-500/40 bg-cyan-500/10'
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pb-16">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Command Center</h1>
            <Badge variant="emerald" pulse>SYSTEM MONITORED</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">Welcome back, {profile?.full_name || 'Alexander Vance'}. All neural emergency telemetry is live.</p>
        </div>

        <button
          onClick={() => startEmergencySession('Chest pain and acute distress')}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-emergency-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-glow-red hover:scale-105 transition-all"
        >
          <PhoneCall className="w-4 h-4 animate-bounce" />
          TRIGGER IMMEDIATE SOS
        </button>
      </div>

      {/* Real-time Telemetry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Heart Rate */}
        <GlassCard className="p-5 border-cyan-500/20">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>HEART RATE (ECG)</span>
            <Heart className="w-4 h-4 text-red-500 animate-pulse" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">{currentVitalHeartRate}</span>
            <span className="text-xs font-mono text-cyan-400">BPM</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-400 font-mono flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Normal Sinus Rhythm
          </div>
        </GlassCard>

        {/* SpO2 */}
        <GlassCard className="p-5 border-cyan-500/20">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>BLOOD OXYGEN (SPO2)</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">{currentVitalSpo2}%</span>
            <span className="text-xs font-mono text-emerald-400">OPTIMAL</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 font-mono">
            Target: &gt; 95% Oxygenation
          </div>
        </GlassCard>

        {/* GPS Lock */}
        <GlassCard className="p-5 border-cyan-500/20">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>GPS SATELLITE BEACON</span>
            <MapPin className="w-4 h-4 text-cyan-400 animate-bounce" />
          </div>
          <div className="mt-3 text-xs font-mono text-white font-semibold truncate">
            {locationGPS}
          </div>
          <div className="mt-2 text-[11px] text-cyan-400 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            12 Satellites Locked (±0.8m)
          </div>
        </GlassCard>

        {/* Device Sensors */}
        <GlassCard className="p-5 border-cyan-500/20">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>SAFETY SENSOR SUITE</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Badge variant="emerald" className="text-[10px]">Crash Detect ON</Badge>
            <Badge variant="cyan" className="text-[10px]">Fall Detect ON</Badge>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 font-mono">
            Stealth SOS: Triple Tap Power
          </div>
        </GlassCard>

      </div>

      {/* Main Grid: Quick Action Triage Tiles + Medical ID Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Quick Triage Grid (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-cyan-400" />
              Instant AI Triage Launchpad
            </h2>
            <span className="text-xs text-slate-400">Click any card to start live protocol guidance</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {quickActionTiles.map((tile, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => startEmergencySession(tile.symptom)}
                className={`p-5 rounded-2xl cursor-pointer border backdrop-blur-xl transition-all duration-200 ${tile.color} hover:border-cyan-400 shadow-glass-card`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-navy-950/80 border border-slate-700/50">
                    {tile.icon}
                  </div>
                  <Badge variant={tile.badge === 'CRITICAL' ? 'red' : 'warning'}>
                    {tile.badge}
                  </Badge>
                </div>
                <h3 className="text-sm font-bold text-white">{tile.title}</h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">{tile.symptom}</p>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-cyan-300 font-medium">
                  <span>Start Protocol</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Medical ID Preview & Contacts Sidebar (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Medical Profile Summary */}
          <GlassCard className="p-6 border-cyan-500/25 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-semibold">MEDICAL ID CARD</span>
              <button 
                onClick={() => setActiveTab('settings')}
                className="text-xs text-slate-400 hover:text-cyan-300 font-mono underline"
              >
                Edit Profile
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Full Name:</span>
                <span className="font-bold text-white">{profile?.full_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Blood Type:</span>
                <span className="font-mono font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">{profile?.blood_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Age / Gender:</span>
                <span className="text-white">{profile?.age} yrs • {profile?.gender}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Severe Allergies:</span>
                <div className="flex flex-wrap gap-1">
                  {profile?.allergies.map((alg, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[11px]">
                      {alg}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Emergency Medical Note:</span>
                <p className="text-[11px] text-slate-300 bg-navy-950 p-2.5 rounded-lg border border-slate-800 italic">
                  "{profile?.emergency_note}"
                </p>
              </div>
            </div>
          </GlassCard>

          {/* ICE Emergency Contacts */}
          <GlassCard className="p-6 border-cyan-500/25 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                <Users className="w-4 h-4 text-cyan-400" />
                ICE EMERGENCY CONTACTS ({contacts.length})
              </span>
            </div>

            <div className="space-y-3">
              {contacts.map((c) => (
                <div key={c.id} className="p-3 rounded-xl bg-navy-950/80 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-white">{c.name}</div>
                    <div className="text-[11px] text-slate-400">{c.relationship} • {c.phone}</div>
                  </div>
                  {c.notify_on_sos && (
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      AUTO-SMS
                    </span>
                  )}
                </div>
              ))}
            </div>
          </GlassCard>

        </div>

      </div>

      {/* Recent Incidents Section */}
      <GlassCard className="p-6 border-cyan-500/20">
        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">Recent Incident History</h3>
          </div>
          <button
            onClick={() => setActiveTab('history')}
            className="text-xs font-mono text-cyan-300 hover:underline flex items-center gap-1"
          >
            View Full Audit Logs ({incidents.length})
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {incidents.slice(0, 3).map((inc) => (
            <div key={inc.id} className="p-4 rounded-xl bg-navy-950/70 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant={inc.severity === 'CRITICAL' ? 'red' : 'warning'}>{inc.severity}</Badge>
                <span className="text-[11px] font-mono text-slate-400">{new Date(inc.timestamp).toLocaleDateString()}</span>
              </div>
              <div className="font-bold text-sm text-white">{inc.category}</div>
              <p className="text-xs text-slate-400 line-clamp-2">{inc.ai_assessment}</p>
              <div className="text-[11px] font-mono text-cyan-400 pt-1">
                Responder ETA: {inc.responder_eta} • Duration: {inc.duration_seconds}s
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

    </div>
  );
};
