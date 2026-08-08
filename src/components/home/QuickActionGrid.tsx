import React, { useState } from 'react';
import { useEmergency } from '../../context/EmergencyContext';
import { Ambulance, MapPin, Stethoscope, PhoneCall, Check } from 'lucide-react';
import { PremiumCard } from '../common/PremiumCard';

export const QuickActionGrid: React.FC = () => {
  const { setActiveModal, locationGPS, startVoiceSession } = useEmergency();
  const [copied, setCopied] = useState(false);

  const handleShareLocation = () => {
    navigator.clipboard.writeText(`EMERGENCY SOS GPS LOCATION: ${locationGPS}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const quickActions = [
    {
      id: 'ambulance',
      title: 'Call Ambulance',
      subtitle: 'Instant 911 / 108 Dispatch',
      icon: <Ambulance className="w-6 h-6 text-brand-emergency" />,
      color: 'border-brand-emergency/30 bg-red-500/10',
      action: () => startVoiceSession('Call ambulance dispatch immediately for severe emergency'),
    },
    {
      id: 'location',
      title: copied ? 'Location Copied!' : 'Share Live Location',
      subtitle: 'GPS Satellite Pin',
      icon: copied ? <Check className="w-6 h-6 text-brand-success" /> : <MapPin className="w-6 h-6 text-brand-accent" />,
      color: 'border-brand-accent/30 bg-brand-accent/10',
      action: handleShareLocation,
    },
    {
      id: 'medical-id',
      title: 'Medical ID',
      subtitle: 'Blood Type & Allergies',
      icon: <Stethoscope className="w-6 h-6 text-brand-accent" />,
      color: 'border-brand-accent/30 bg-brand-accent/10',
      action: () => setActiveModal('medical-id'),
    },
    {
      id: 'contacts',
      title: 'Emergency Contacts',
      subtitle: 'Notify ICE Relays',
      icon: <PhoneCall className="w-6 h-6 text-purple-400" />,
      color: 'border-purple-500/30 bg-purple-500/10',
      action: () => setActiveModal('contacts'),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-4xl mx-auto pt-2">
      {quickActions.map((item, idx) => (
        <PremiumCard
          key={item.id}
          index={idx}
          onClick={item.action}
          className={`p-5 ${item.color} flex items-center gap-4`}
        >
          <div className="p-3 rounded-2xl bg-space-bg/80 border border-space-border shrink-0 group-hover:border-brand-accent/30 transition-colors duration-500">
            {item.icon}
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-sans">{item.title}</h3>
            <p className="text-xs text-slate-400 font-sans mt-0.5">{item.subtitle}</p>
          </div>
        </PremiumCard>
      ))}
    </div>
  );
};
