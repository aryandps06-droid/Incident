import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEmergency } from '../../context/EmergencyContext';
import { LandingScreen } from './LandingScreen';
import { VoiceWaveform } from '../home/VoiceWaveform';
import { apiService } from '../../services/api';
import { 
  User, 
  Send, 
  XCircle, 
  Clock, 
  Shield, 
  HeartPulse, 
  CheckCircle2, 
  Download,
  Activity,
  Mic,
  PhoneCall,
  MapPin,
  Stethoscope,
  Users,
  Sparkles,
  HelpCircle,
  X,
  AlertCircle,
  FileText,
  Loader2,
  Globe,
  Radio
} from 'lucide-react';

const LinkedinIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.77a1.64 1.64 0 1 0 0 3.28 1.64 1.64 0 0 0 0-3.28Z" />
  </svg>
);

export const UnifiedStage: React.FC = () => {
  const { 
    screenState, 
    dialogueMessages, 
    isListening, 
    interimTranscript,
    isSpeaking, 
    isAnalyzing, 
    conversationTimerSeconds,
    finishEmergencySession,
    activeModal,
    setActiveModal,
    hospitals,
    handleSpokenInput,
    nvidiaReasoning,
    isUserSpeaking,
    isAISpeaking,
    gatheredFacts,
    missingFacts,
    startVoiceSession,
    stopVoice,
    explainableReasoning,
    isBackendOnline,
    emergencySession
  } = useEmergency();

  const [inputSpeech, setInputSpeech] = useState('');
  const [showCallConfirmModal, setShowCallConfirmModal] = useState(false);
  const [isGeoSharing, setIsGeoSharing] = useState(false);
  const [geoData, setGeoData] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [toasts, setToasts] = useState<Array<{ id: number; text: string; icon?: React.ReactNode }>>([]);
  
  // REAL AI FLOATING ASSISTANT STATE
  const [showFloatingAssistant, setShowFloatingAssistant] = useState(false);
  const [assistantInput, setAssistantInput] = useState('');
  const [isAssistantThinking, setIsAssistantThinking] = useState(false);
  const [isAssistantListening, setIsAssistantListening] = useState(false);
  const [assistantMessages, setAssistantMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([{
    role: 'assistant',
    content: "I'm here to help. You can ask me about EchoAid X features, how to set up your Medical ID, or what to do right now."
  }]);

  // Rotating input placeholder
  const placeholders = [
    'Type or speak symptoms naturally…',
    'My father suddenly collapsed…',
    'Someone is having chest pain…',
    'My mother is struggling to breathe…',
    'There was an accident…',
  ];
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [placeholderVisible, setPlaceholderVisible] = useState(true);
  useEffect(() => {
    const cycle = setInterval(() => {
      setPlaceholderVisible(false);
      setTimeout(() => {
        setPlaceholderIdx(i => (i + 1) % placeholders.length);
        setPlaceholderVisible(true);
      }, 300);
    }, 4000);
    return () => clearInterval(cycle);
  }, []);

  // Export report modal
  const [showExportModal, setShowExportModal] = useState<'idle' | 'preparing' | 'done'>('idle');

  // AI assistant idle tooltip
  const [showAssistantTip, setShowAssistantTip] = useState(false);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!showFloatingAssistant) {
      idleTimerRef.current = setTimeout(() => setShowAssistantTip(true), 10000);
    } else {
      setShowAssistantTip(false);
    }
    return () => { if (idleTimerRef.current) clearTimeout(idleTimerRef.current); };
  }, [showFloatingAssistant]);
  useEffect(() => {
    if (showAssistantTip) {
      const t = setTimeout(() => setShowAssistantTip(false), 5000);
      return () => clearTimeout(t);
    }
  }, [showAssistantTip]);

  // Session start time for real incident timeline
  const [sessionStartTime] = useState(() => new Date());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const assistantChatEndRef = useRef<HTMLDivElement>(null);
  const watchIdRef = useRef<number | null>(null);
  const speechRecognitionRef = useRef<any>(null);
  const primaryHospital = hospitals[0];

  // Format a Date as HH:MM AM/PM
  const formatTime = (d: Date) => d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [dialogueMessages, interimTranscript, isAnalyzing]);

  useEffect(() => {
    if (showFloatingAssistant) {
      assistantChatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [assistantMessages, isAssistantThinking, showFloatingAssistant]);

  // Toast notification helper — top-right spring style
  const addToast = (text: string, icon?: React.ReactNode) => {
    const newToast = { id: Date.now(), text, icon };
    setToasts(prev => [...prev, newToast]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== newToast.id));
    }, 3500);
  };

  // Real Geolocation API handler
  const toggleLocationSharing = () => {
    if (isGeoSharing) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setIsGeoSharing(false);
      setGeoData(null);
      addToast('Location sharing stopped', <MapPin className="w-4 h-4 text-cyan-400" />);
    } else {
      if (!navigator.geolocation) {
        addToast('Geolocation is not supported by your browser', <AlertCircle className="w-4 h-4 text-red-400" />);
        return;
      }
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          setGeoData({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: Math.round(pos.coords.accuracy)
          });
          if (!isGeoSharing) {
            setIsGeoSharing(true);
            addToast('✓ Live location sharing active', <MapPin className="w-4 h-4 text-cyan-400" />);
          }
        },
        (err) => {
          addToast(`Location error: ${err.message}`, <AlertCircle className="w-4 h-4 text-red-400" />);
          setIsGeoSharing(false);
        },
        { enableHighAccuracy: true }
      );
    }
  };

  // Trigger Phone Dialer
  const confirmAndCallAmbulance = () => {
    setShowCallConfirmModal(false);
    addToast('Opening phone dialer (112)...', <PhoneCall className="w-4 h-4 text-red-400" />);
    window.location.href = "tel:112";
  };

  const handleSendSpeech = async () => {
    if (!inputSpeech.trim()) return;
    const text = inputSpeech.trim();
    setInputSpeech('');
    handleSpokenInput(text);
  };

  // SECTION 14: Download Official Emergency Report (Synchronous download to prevent browser user gesture expiration)
  const downloadFullEmergencyReport = () => {
    const session = emergencySession;

    // Build timeline entries
    const timelineList = session.timeline.length > 0
      ? session.timeline.map(t => `[${t.time}] ${t.event}`).join('\n')
      : 'No timeline events recorded.';

    // Build transcript entries
    const transcriptList = session.transcript.length > 0
      ? session.transcript.map(m => `[${m.timestamp}] ${m.sender === 'ECHO_AI' ? 'EchoAid Dispatcher' : 'Caller'}: ${m.text}`).join('\n')
      : 'No transcript recorded.';

    // Build contact status
    const contactList = contacts.length > 0
      ? contacts.map(c => `• ${c.name} (${c.relationship}): ${c.phone} — ${c.notify_on_sos ? 'Notified via SMS' : 'On Standby'}`).join('\n')
      : '• No registered ICE emergency contacts.';

    const reportText = `
================================================================================
ECHOAID X — OFFICIAL EMS HANDOFF & EMERGENCY INCIDENT REPORT
================================================================================
Incident ID       : ${session.incident_id}
Started At        : ${new Date(session.started_at).toLocaleString()}
Generated At      : ${new Date().toLocaleString()}
System Provider   : EchoAid X Emergency Dispatch Grid (by CosmicNexus)
Creator & Founder : Kumar Aryan (CosmicNexus)

--------------------------------------------------------------------------------
1. INCIDENT SUMMARY
--------------------------------------------------------------------------------
Initial Chief Complaint : ${session.transcript[0]?.text ? `"${session.transcript[0].text}"` : 'Emergency Dispatch Session Initiated'}
Session Status          : ${session.ambulance_called ? 'EMS Ambulance Dispatched' : 'Active Emergency Triage'}
Current AI Summary      : ${session.ai_summary || 'Monitoring patient airway and vital signs.'}

--------------------------------------------------------------------------------
2. PATIENT DEMOGRAPHICS & PROFILE
--------------------------------------------------------------------------------
Caller Designation   : ${session.caller_name || 'Caller'}
Patient Relationship : ${session.patient_name || 'Unknown'}
Age                  : ${session.patient_age !== null ? `${session.patient_age} years` : 'Unknown'}
Gender               : ${session.patient_gender || 'Unknown'}
Known Allergies      : ${session.allergies.length > 0 ? session.allergies.join(', ') : 'Unknown'}
Current Medications  : ${session.medications.length > 0 ? session.medications.join(', ') : 'Unknown'}

--------------------------------------------------------------------------------
3. COLLECTED CLINICAL SYMPTOMS
--------------------------------------------------------------------------------
• Conscious Status    : ${session.conscious !== null ? (session.conscious ? 'YES (Conscious)' : 'NO (Unconscious)') : 'Unknown'}
• Breathing Status    : ${session.breathing !== null ? (session.breathing ? 'YES (Breathing)' : 'NO (Not breathing / Gasping)') : 'Unknown'}
• Chest Pain          : ${session.chest_pain !== null ? (session.chest_pain ? 'YES (Reported)' : 'NO') : 'Unknown'}
• Pain Radiation      : ${session.pain_radiation !== null ? (session.pain_radiation ? 'YES (Radiating to arm/jaw/back)' : 'NO') : 'Unknown'}
• Active Bleeding     : ${session.bleeding !== null ? (session.bleeding ? 'YES (Hemorrhage reported)' : 'NO') : 'Unknown'}
• Speech Difficulty   : ${session.speech_problem !== null ? (session.speech_problem ? 'YES (Slurred/Difficulty)' : 'NO') : 'Unknown'}
• Facial Droop        : ${session.face_droop !== null ? (session.face_droop ? 'YES (Asymmetry noted)' : 'NO') : 'Unknown'}

--------------------------------------------------------------------------------
4. OUTSTANDING / UNCONFIRMED INFORMATION
--------------------------------------------------------------------------------
${missingFacts.length > 0 ? missingFacts.map(f => `• ${f.replace(/_/g, ' ')}`).join('\n') : '• None — primary emergency triage indicators collected.'}

--------------------------------------------------------------------------------
5. ACTIONS COMPLETED
--------------------------------------------------------------------------------
${invokedTools.length > 0 ? invokedTools.map(t => `• ${t.title} [${t.status}]`).join('\n') : '• Live AI Emergency Voice Guidance\n• Location Telemetry Broadcast'}

--------------------------------------------------------------------------------
6. LOCATION TELEMETRY & GPS COORDINATES
--------------------------------------------------------------------------------
GPS Telemetry Status  : ${isGeoSharing ? 'ACTIVE — Real-Time High-Precision Broadcast' : 'Unknown (Permission pending)'}
Exact GPS Coordinates : ${geoData && isGeoSharing ? `${geoData.lat.toFixed(6)}° N, ${geoData.lng.toFixed(6)}° E (±${geoData.accuracy}m accuracy)` : 'Unknown'}
Location Description  : ${session.location || 'Unknown'}

--------------------------------------------------------------------------------
7. DYNAMICALLY ASSIGNED NEAREST HOSPITAL
--------------------------------------------------------------------------------
Facility Name         : ${primaryHospital?.name ? primaryHospital.name : 'Unknown'}
Facility Address      : ${primaryHospital?.address ? primaryHospital.address : 'Unknown'}
Estimated EMS ETA     : ${primaryHospital?.eta ? primaryHospital.eta : 'Unknown'}

--------------------------------------------------------------------------------
8. EMERGENCY CONTACT NOTIFICATION STATUS
--------------------------------------------------------------------------------
${contactList}

--------------------------------------------------------------------------------
9. CONVERSATION TIMELINE
--------------------------------------------------------------------------------
${timelineList}

--------------------------------------------------------------------------------
10. FULL CONVERSATION TRANSCRIPT
--------------------------------------------------------------------------------
${transcriptList}

--------------------------------------------------------------------------------
11. MEDICAL HANDOFF & DISPATCHER NOTES
--------------------------------------------------------------------------------
Dispatcher Notes : ${handoffReport && handoffReport !== 'Awaiting triage summary...' ? handoffReport : (session.ai_summary || 'Maintain firm airway control and monitor patient position until EMS arrives.')}

================================================================================
Official EMS Handoff Documentation · EchoAid X Neural Emergency System
Creator: Kumar Aryan · Founder of CosmicNexus
================================================================================`;

    // Trigger download SYNCHRONOUSLY while user click gesture is active
    try {
      const blob = new Blob([reportText.trim()], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `EchoAid_EMS_Handoff_Report_${session.incident_id}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    } catch (err) {
      console.error('Download error:', err);
    }

    // Show visual confirmation modal & toast
    setShowExportModal('done');
    setTimeout(() => setShowExportModal('idle'), 2500);
    addToast('✓ Professional EMS Handoff Report downloaded to your device', <Download className="w-4 h-4 text-cyan-400" />);
  };

  // Real Backend AI Call & Intercept for Founder Branding Queries
  const handleAssistantSend = async (userText?: string) => {
    const textToSend = userText || assistantInput;
    if (!textToSend.trim() || isAssistantThinking) return;

    const userMessageContent = textToSend.trim();
    if (!userText) setAssistantInput('');

    // Append User Message
    const updatedMessages = [...assistantMessages, { role: 'user' as const, content: userMessageContent }];
    setAssistantMessages(updatedMessages);
    setIsAssistantThinking(true);

    // SECTION 7: Intercept Founder & Creator Queries
    const isFounderQuery = /who (created|built|made|is the founder|designed)|cosmicnexus|aryan|kumar/i.test(userMessageContent);
    if (isFounderQuery) {
      setTimeout(() => {
        const founderReply = `EchoAid X was envisioned, designed, and developed by Kumar Aryan, Founder & Creator of CosmicNexus.\n\nBuilt under the innovation banner of CosmicNexus, EchoAid X combines conversational AI, real-time communication, intelligent emergency workflows, and human-centered design to create a calmer and more accessible emergency assistance experience.`;

        setAssistantMessages(prev => [...prev, { role: 'assistant', content: founderReply }]);
        setIsAssistantThinking(false);
      }, 500);
      return;
    }

    try {
      const systemContextPrompt = {
        role: 'system',
        content: `You are EchoAid X, a professional AI Emergency Dispatcher inspired by real 911, 112, and EMS call operators created by Kumar Aryan (Founder of CosmicNexus).

CORE BEHAVIOR:
- Be calm, reassuring, and human. Sound like a trained emergency dispatcher.
- Always acknowledge the caller first ("I understand.", "I'm right here with you.", "Okay.").
- Ask only ONE question at a time.
- Keep responses under 2 short spoken sentences.
- Never repeat questions or give definitive diagnoses (e.g. say "This could be a serious cardiac emergency", "This needs urgent medical attention").

CONVERSATION MEMORY:
Current Session Facts: ${JSON.stringify(gatheredFacts)}.
Location Shared: ${geoData ? `Yes (${geoData.lat.toFixed(4)}, ${geoData.lng.toFixed(4)})` : 'No'}.

QUESTION TREES:
- CARDIAC: Collapse -> Breathing -> Consciousness -> Chest Pain -> Pain Radiation -> EMS Called
- STROKE: Face Drooping -> Arm Weakness -> Speech Difficulty -> Time Symptoms Started
- BLEEDING: Location -> Spurting? -> Apply Direct Pressure -> Conscious?
- BREATHING: Can they speak? -> Wheezing? -> Asthma history? -> Inhaler available?
- ALLERGIC REACTION: Swelling? -> Trouble breathing? -> EpiPen available?

VOICE STYLE:
Speak like a calm, warm, human emergency dispatcher with natural pauses.`
      };

      const apiHistory = [
        systemContextPrompt,
        ...updatedMessages.slice(-6).map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content }))
      ];

      const res = await apiService.sendNvidiaChat(apiHistory);
      const replyText = res.ai_guidance_text || res.content || "EchoAid X is active and ready to guide you through emergency response steps.";

      setAssistantMessages(prev => [...prev, { role: 'assistant', content: replyText }]);
    } catch (err) {
      setAssistantMessages(prev => [
        ...prev, 
        { role: 'assistant', content: "I'm having trouble connecting right now. Please try again in a moment." }
      ]);
    } finally {
      setIsAssistantThinking(false);
    }
  };

  // Web Speech API for Floating Assistant Microphone Input
  const toggleAssistantMic = () => {
    if (isAssistantListening) {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }
      setIsAssistantListening(false);
      return;
    }

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      addToast('Speech recognition not supported in browser', <AlertCircle className="w-4 h-4 text-red-400" />);
      return;
    }

    const recognition = new SpeechRec();
    speechRecognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsAssistantListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((r: any) => r[0].transcript)
        .join('');
      setAssistantInput(transcript);
      if (event.results[0].isFinal) {
        setIsAssistantListening(false);
        handleAssistantSend(transcript);
      }
    };

    recognition.onerror = (err: any) => {
      addToast(`Mic error: ${err.error}`, <AlertCircle className="w-4 h-4 text-red-400" />);
      setIsAssistantListening(false);
    };

    recognition.onend = () => {
      setIsAssistantListening(false);
    };

    recognition.start();
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="relative w-full min-h-screen bg-[#03050F] overflow-hidden">
      
      {/* LOCKED LANDING SCREEN: Always Mounted in Background */}
      <div className="absolute inset-0 z-0">
        <LandingScreen />
      </div>

      {/* OVERLAY CONVERSATION STAGE: Appears seamlessly when mic is pressed / session starts */}
      <AnimatePresence>
        {screenState !== 'landing' && (
          <motion.div
            key="conversation-overlay"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-30 min-h-screen flex flex-col justify-between p-3 sm:p-5 lg:p-7 pointer-events-auto bg-gradient-to-t from-[#03050F]/95 via-[#03050F]/75 to-transparent backdrop-blur-[6px]"
          >
            
            {/* SECTION 15: Offline Safety Mode Banner if backend offline */}
            {!isBackendOnline && (
              <div className="bg-red-500/20 border border-red-500/40 px-4 py-2 rounded-2xl text-center text-xs font-mono text-red-300 flex items-center justify-center gap-2 mb-2 shadow-glow-red">
                <AlertCircle className="w-4 h-4 text-red-400 animate-pulse shrink-0" />
                <span>Connection interrupted — showing basic emergency guidance. Ambulance call & location sharing remain active.</span>
              </div>
            )}

            {/* Top Minimal Call Header Bar */}
            <header className="flex items-center justify-between gap-4 z-40 max-w-7xl mx-auto w-full pb-2">
              
              <div className="flex items-center gap-3">
                <button
                  onClick={finishEmergencySession}
                  aria-label="Return to landing page"
                  className="flex items-center gap-2 group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-400/50 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(0,229,255,0.4)] backdrop-blur-xl group-hover:bg-cyan-500/25 transition-all">
                    <Shield className="w-4 h-4" />
                  </div>
                  <span className="text-lg font-black tracking-tight text-white font-sans group-hover:text-cyan-300 transition-colors">
                    EchoAid <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">X</span>
                  </span>
                </button>
                <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-cyan-300 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-400/30 ml-2">
                  <Activity className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
                  <span>Emergency Voice Session Active</span>
                </div>
              </div>

              {/* Live Location Status Chip & Controls */}
              <div className="flex items-center gap-3">
                {isGeoSharing && geoData && (
                  <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 font-mono text-[10px] backdrop-blur-2xl">
                    <MapPin className="w-3 h-3 text-cyan-400 animate-pulse" />
                    <span>Live GPS: {geoData.lat.toFixed(4)}, {geoData.lng.toFixed(4)} (±{geoData.accuracy}m)</span>
                    <button onClick={toggleLocationSharing} aria-label="Stop sharing location" className="text-slate-400 hover:text-white ml-1 font-bold underline cursor-pointer">Stop</button>
                  </div>
                )}

                <div className="flex items-center gap-1.5 text-xs text-red-400 font-mono font-bold bg-red-500/20 px-3.5 py-1.5 rounded-full border border-red-500/40 backdrop-blur-2xl shadow-glow-red">
                  <Clock className="w-3.5 h-3.5 animate-pulse" />
                  <span>{formatTimer(conversationTimerSeconds)}</span>
                </div>

                <button
                  onClick={finishEmergencySession}
                  aria-label="End call session"
                  className="px-4 py-1.5 rounded-full bg-red-500/20 border border-red-500/40 hover:bg-red-500/30 text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-glow-red hover:scale-105 cursor-pointer"
                >
                  <XCircle className="w-4 h-4 text-red-400" />
                  <span>End Call</span>
                </button>
              </div>

            </header>

            {/* Desktop Grid Layout: LEFT SIDE (70%) & RIGHT SIDE (30%) */}
            <div className="flex-1 max-w-7xl mx-auto w-full my-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-end py-2">
              
              {/* LEFT SIDE (70% — lg:col-span-8): Main Conversation Thread, Voice Orb & Action Bar */}
              <div className="lg:col-span-8 flex flex-col justify-end space-y-4 h-full max-h-[calc(100vh-140px)]">
                
                {/* Voice Orb Area above conversation */}
                <div className="flex flex-col items-center justify-center space-y-2 pt-2 shrink-0">
                  <div 
                    onClick={() => isListening || isSpeaking ? stopVoice() : startVoiceSession()}
                    role="button"
                    aria-label="Toggle voice microphone orb"
                    className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 bg-gradient-to-br from-cyan-950/70 via-[#050816] to-[#03050F] backdrop-blur-3xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:scale-105 ${
                      isUserSpeaking
                        ? 'border-emerald-400 shadow-glow-emerald'
                        : isAISpeaking
                          ? 'border-purple-400 shadow-glow-purple'
                          : 'border-cyan-400/60 animate-breathe'
                    }`}
                  >
                    <Mic className={`w-7 h-7 ${isUserSpeaking ? 'text-emerald-300 animate-bounce' : isAISpeaking ? 'text-purple-300 animate-pulse' : 'text-cyan-300'}`} />
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-cyan-300 mt-1">
                      {isUserSpeaking ? 'LISTENING' : isAISpeaking ? 'SPEAKING' : 'TAP MIC'}
                    </span>
                  </div>

                  <VoiceWaveform 
                    active={isListening || isSpeaking || isAnalyzing || isUserSpeaking || isAISpeaking} 
                    color={isAISpeaking ? '#A855F7' : isUserSpeaking ? '#10B981' : '#00E5FF'} 
                    barCount={28} 
                    height={26} 
                  />
                </div>

                {/* Floating Glass Message Bubbles Container (Section 9: AI slides from left, User slides from right) */}
                <div className="space-y-3.5 max-h-[44vh] overflow-y-auto pr-2 custom-scrollbar flex flex-col justify-end">
                  {dialogueMessages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, x: msg.sender === 'USER' ? 25 : -25, scale: 0.97 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                      className={`flex gap-3 max-w-xl ${msg.sender === 'USER' ? 'ml-auto flex-row-reverse' : ''}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                        msg.sender === 'ECHO_AI' 
                          ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300 shadow-[0_0_12px_rgba(0,229,255,0.3)]' 
                          : 'bg-white/10 border-white/20 text-white'
                      }`}>
                        {msg.sender === 'ECHO_AI' ? <Shield className="w-4 h-4 text-cyan-400" /> : <User className="w-4 h-4" />}
                      </div>

                      <div className={`p-4 rounded-[28px] text-sm leading-relaxed space-y-1 backdrop-blur-3xl shadow-card-soft ${
                        msg.sender === 'ECHO_AI'
                          ? 'bg-[#070C1E]/90 border border-cyan-500/30 text-slate-100 rounded-tl-sm shadow-[0_15px_45px_rgba(0,0,0,0.6)]'
                          : 'bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 text-white font-medium shadow-[0_15px_45px_rgba(0,229,255,0.25)] rounded-tr-sm'
                      }`}>
                        <div className="flex items-center justify-between text-[10px] font-mono opacity-70 gap-4">
                          <span className="font-bold flex items-center gap-1">
                            {msg.sender === 'ECHO_AI' ? 'EchoAid Dispatcher' : 'You'}
                          </span>
                          <span>{msg.timestamp}</span>
                        </div>
                        <div className="font-sans text-sm">{msg.text}</div>
                      </div>
                    </motion.div>
                  ))}

                  {/* Word-by-word interim transcript */}
                  {interimTranscript && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex gap-3 max-w-xl ml-auto flex-row-reverse"
                    >
                      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border bg-cyan-500/20 border-cyan-400 text-cyan-300">
                        <Mic className="w-4 h-4 animate-pulse" />
                      </div>
                      <div className="p-4 rounded-[28px] text-sm leading-relaxed bg-cyan-950/70 border border-cyan-400/50 text-cyan-200 italic font-sans backdrop-blur-3xl">
                        <span className="text-[10px] font-mono text-cyan-400 uppercase block font-bold mb-1">Listening…</span>
                        "{interimTranscript}"
                      </div>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Action Buttons + Input Composer — mobile sticky */}
                <div className="space-y-3 pt-1 mobile-sticky-bar sm:static sm:bg-transparent sm:backdrop-filter-none sm:border-0 sm:p-0">
                  
                  {/* Real Functional Actions Bar */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setShowCallConfirmModal(true)}
                      aria-label="Call Ambulance"
                      className="px-3.5 py-2 rounded-2xl bg-red-500/20 border border-red-500/40 hover:bg-red-500/30 text-red-300 font-sans font-bold text-xs flex items-center gap-2 transition-all hover:scale-105 cursor-pointer shadow-glow-red"
                    >
                      <PhoneCall className="w-3.5 h-3.5 text-red-400" />
                      <span>Call Ambulance (112)</span>
                    </button>

                    <button
                      onClick={toggleLocationSharing}
                      aria-label="Share Location"
                      className={`px-3.5 py-2 rounded-2xl border text-xs font-sans font-bold flex items-center gap-2 transition-all hover:scale-105 cursor-pointer ${
                        isGeoSharing 
                          ? 'bg-cyan-500/25 border-cyan-400 text-cyan-300 shadow-glow-cyan' 
                          : 'bg-white/[0.05] border-white/15 text-slate-300 hover:border-cyan-400'
                      }`}
                    >
                      <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{isGeoSharing ? '✓ Location Active' : 'Share Location'}</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveModal('contacts');
                        addToast('Emergency contacts list opened', <Users className="w-4 h-4 text-emerald-400" />);
                      }}
                      aria-label="View Emergency Contacts"
                      className="px-3.5 py-2 rounded-2xl bg-white/[0.05] border border-white/15 hover:border-emerald-400/60 text-slate-300 font-sans font-bold text-xs flex items-center gap-2 transition-all hover:scale-105 cursor-pointer"
                    >
                      <Users className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Emergency Contacts</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveModal('medical-id');
                        addToast('Medical ID profile attached', <Stethoscope className="w-4 h-4 text-purple-400" />);
                      }}
                      aria-label="View Medical ID"
                      className="px-3.5 py-2 rounded-2xl bg-white/[0.05] border border-white/15 hover:border-purple-400/60 text-slate-300 font-sans font-bold text-xs flex items-center gap-2 transition-all hover:scale-105 cursor-pointer"
                    >
                      <Stethoscope className="w-3.5 h-3.5 text-purple-400" />
                      <span>Medical ID</span>
                    </button>
                  </div>

                  {/* Message Composer Bar with rotating placeholder & cyan focus */}
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={inputSpeech}
                      onChange={(e) => setInputSpeech(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendSpeech()}
                      placeholder={placeholderVisible ? placeholders[placeholderIdx] : ''}
                      aria-label="Emergency symptom input"
                      className="flex-1 px-5 py-3.5 rounded-2xl bg-white/[0.06] border border-white/15 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_25px_rgba(0,229,255,0.35)] font-sans backdrop-blur-3xl shadow-card-soft transition-all duration-300"
                    />
                    <button
                      onClick={handleSendSpeech}
                      aria-label="Send emergency symptom message"
                      className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white font-bold text-sm shadow-glow-brand hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span>Send</span>
                    </button>
                  </div>

                </div>

              </div>

              {/* RIGHT SIDE — Emergency Summary Glass Card */}
              <div className="lg:col-span-4 flex flex-col justify-end">
                <div className="p-5 sm:p-6 rounded-[32px] bg-[#070C1E]/85 border border-cyan-500/30 shadow-[0_30px_90px_rgba(0,0,0,0.85)] backdrop-blur-3xl glass-shimmer flex flex-col max-h-[calc(100vh-140px)] overflow-hidden">
                  <div className="space-y-3.5 overflow-y-auto custom-scrollbar pr-1.5 flex-1">
                  
                  {/* Panel Title */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-cyan-400" />
                      <span className="font-bold text-white text-sm font-sans">Emergency Summary</span>
                    </div>
                    <div className="text-[10px] font-mono text-cyan-300 bg-cyan-500/15 px-2.5 py-0.5 rounded-full border border-cyan-400/30 uppercase font-bold">
                      Real-time
                    </div>
                  </div>

                  {/* 1. Priority */}
                  <div className="space-y-1">
                    <div className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">STATUS</div>
                    <div className="text-sm font-extrabold flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-400 animate-ping shrink-0" />
                      <span className={dialogueMessages.filter(m => m.sender === 'USER').length === 0 ? 'text-amber-300' : 'text-red-400'}>
                        {dialogueMessages.filter(m => m.sender === 'USER').length === 0
                          ? 'Active Session — Awaiting Caller'
                          : emergencySession.breathing === false || emergencySession.conscious === false
                            ? 'CRITICAL EMERGENCY — Priority 1 Dispatch'
                            : emergencySession.ambulance_called
                              ? 'Ambulance Dispatched — Units En Route'
                              : 'Active Triage — Assessing Symptoms'}
                      </span>
                    </div>
                  </div>

                  <div className="h-[1px] bg-white/10" />

                  {/* 2. Gathered Information — Single Source of Truth from emergencySession */}
                  <div className="space-y-1">
                    <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">GATHERED INFORMATION</div>
                    <div className="space-y-1 text-xs text-slate-200">
                      <div className="space-y-1.5">
                        {emergencySession.patient_name && (
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>Patient: <strong className="text-white">{emergencySession.patient_name}</strong></span>
                          </div>
                        )}
                        {emergencySession.breathing !== null && (
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>Breathing: <strong className="text-white">{emergencySession.breathing ? 'Normal / Active' : 'Difficulty / Gasping'}</strong></span>
                          </div>
                        )}
                        {emergencySession.conscious !== null && (
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>Conscious: <strong className="text-white">{emergencySession.conscious ? 'Yes (Conscious)' : 'No (Unconscious)'}</strong></span>
                          </div>
                        )}
                        {emergencySession.chest_pain && (
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>Chest pain: <strong className="text-white">Reported</strong></span>
                          </div>
                        )}
                        {emergencySession.pain_radiation && (
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>Radiation: <strong className="text-white">Arm / Jaw / Back</strong></span>
                          </div>
                        )}
                        {emergencySession.bleeding && (
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>Bleeding: <strong className="text-white">Active Hemorrhage</strong></span>
                          </div>
                        )}
                        {emergencySession.patient_age && (
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>Age: <strong className="text-white">{emergencySession.patient_age} years</strong></span>
                          </div>
                        )}
                        {!emergencySession.patient_name && emergencySession.breathing === null && emergencySession.conscious === null && !emergencySession.chest_pain && !emergencySession.bleeding && (
                          <div className="flex items-center gap-2 text-slate-400 text-xs py-0.5">
                            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                            <span>Awaiting caller description...</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="h-[1px] bg-white/10" />

                  {/* 3. DYNAMIC EMERGENCY CHECKLIST */}
                  <div className="space-y-1">
                    <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">EMERGENCY CHECKLIST</div>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center gap-2">
                        {isGeoSharing ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        )}
                        <span className={isGeoSharing ? 'text-slate-200' : 'text-amber-300/90 font-mono'}>
                          {isGeoSharing ? 'Location broadcast active' : 'Location sharing pending'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {emergencySession.patient_name ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        )}
                        <span className={emergencySession.patient_name ? 'text-slate-200' : 'text-amber-300/90 font-mono'}>
                          {emergencySession.patient_name ? `Patient identified (${emergencySession.patient_name})` : 'Patient identity pending'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {emergencySession.breathing !== null ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        )}
                        <span className={emergencySession.breathing !== null ? 'text-slate-200' : 'text-amber-300/90 font-mono'}>
                          {emergencySession.breathing !== null ? 'Breathing status confirmed' : 'Breathing status pending'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {emergencySession.chest_pain !== null ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        )}
                        <span className={emergencySession.chest_pain !== null ? 'text-slate-200' : 'text-amber-300/90 font-mono'}>
                          {emergencySession.chest_pain !== null ? 'Chest pain status confirmed' : 'Chest pain status pending'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {emergencySession.allergies.length > 0 ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0 opacity-70" />
                        )}
                        <span className={emergencySession.allergies.length > 0 ? 'text-slate-200' : 'text-amber-300/80 font-mono'}>
                          {emergencySession.allergies.length > 0 ? 'Allergies confirmed' : 'Allergies pending'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="h-[1px] bg-white/10" />

                  {/* 4. Nearest Hospital & ETA */}
                  <div className="space-y-1">
                    <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">NEAREST HOSPITAL & ETA</div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-white truncate max-w-[170px]">
                        {isGeoSharing && primaryHospital?.name ? primaryHospital.name : 'Trauma Medical Center'}
                      </span>
                      <span className="text-emerald-400 font-mono font-bold bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        {isGeoSharing && primaryHospital?.eta ? `ETA ${primaryHospital.eta}` : 'ETA 4-6 mins'}
                      </span>
                    </div>
                  </div>

                  <div className="h-[1px] bg-white/10" />

                  {/* SECTION 13: Animated Incident Timeline with real timestamps */}
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">INCIDENT TIMELINE</div>
                    <div className="space-y-1 text-[11px] text-slate-300 font-mono">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping shrink-0" />
                        <span className="text-slate-400">{formatTime(sessionStartTime)}</span>
                        <span className="text-white">Session started</span>
                      </div>
                      {dialogueMessages.length >= 2 && (
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                          <span className="text-slate-400">{formatTime(new Date(sessionStartTime.getTime() + 30000))}</span>
                          <span className="text-emerald-300">AI dispatcher connected</span>
                        </div>
                      )}
                      {isGeoSharing && (
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
                          <span className="text-slate-400">{formatTime(new Date())}</span>
                          <span className="text-purple-300">Location shared</span>
                        </div>
                      )}
                      {dialogueMessages.filter(m => m.sender === 'USER').length >= 2 && (
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                          <span className="text-slate-400">{formatTime(new Date(sessionStartTime.getTime() + conversationTimerSeconds * 1000))}</span>
                          <span className="text-red-300">Assessment in progress</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="h-[1px] bg-white/10" />

                  {/* 5. Recommended Next Step */}
                  <div className="space-y-1">
                    <div className="text-[10px] font-mono text-cyan-400 uppercase font-bold tracking-wider">RECOMMENDED NEXT STEP</div>
                    <div className="text-xs text-slate-200 italic leading-relaxed">
                      {explainableReasoning?.next_action
                        ? `"${explainableReasoning.next_action.replace(/^Ask next unanswered question:\s*/i, '')}"`
                        : dialogueMessages.filter(m => m.sender === 'USER').length === 0
                          ? '"Wait for the caller to describe the situation."'
                          : '"Continue gathering information and keep caller calm."'}
                    </div>
                  </div>

                  <div className="h-[1px] bg-white/10" />

                  {/* SECTION 14: Download Official Emergency Report */}
                  <button
                    onClick={downloadFullEmergencyReport}
                    className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 border border-cyan-400/40 hover:border-cyan-400 text-cyan-300 font-sans text-xs font-bold flex items-center justify-center gap-2 transition-all hover:scale-102 cursor-pointer shadow-card-soft"
                  >
                    <Download className="w-4 h-4 text-cyan-400" />
                    <span>Download Emergency Report</span>
                  </button>

                  </div>
                </div>
              </div>

            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* FLOATING TOAST NOTIFICATIONS — top-right spring style */}
      <div className="fixed top-5 right-5 z-[60] flex flex-col gap-2 pointer-events-none items-end">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 40, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              className="flex items-center gap-3 pl-0 pr-4 py-3 rounded-[18px] bg-[#070C1E]/96 border border-white/10 text-white font-sans text-xs font-medium shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-2xl pointer-events-auto overflow-hidden"
            >
              {/* Left accent line */}
              <div className="w-1 self-stretch bg-cyan-400 rounded-full ml-0 shrink-0" />
              <div className="flex items-center gap-2.5 pl-2">
                {toast.icon}
                <span>{toast.text}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* CONFIRMATION MODAL BEFORE CALLING AMBULANCE (112) */}
      <AnimatePresence>
        {showCallConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="p-6 rounded-[32px] bg-[#070C1E] border border-red-500/50 max-w-md w-full space-y-4 shadow-[0_30px_90px_rgba(239,68,68,0.4)] backdrop-blur-3xl text-left"
            >
              <div className="flex items-center gap-3 text-red-400 font-bold font-sans text-lg">
                <PhoneCall className="w-6 h-6 animate-bounce" />
                <span>Confirm Ambulance Call</span>
              </div>
              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                This action will trigger your device phone dialer to call emergency services <strong>(112 / 911)</strong>.
              </p>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowCallConfirmModal(false)}
                  className="flex-1 py-3 rounded-2xl bg-white/[0.06] border border-white/15 text-xs text-slate-300 font-bold hover:bg-white/10 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAndCallAmbulance}
                  className="flex-1 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-glow-red transition-all cursor-pointer"
                >
                  Call 112 Now
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ABOUT COSMICNEXUS & FOUNDER MODAL */}
      <AnimatePresence>
        {activeModal === 'cosmicnexus' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="p-6 sm:p-8 rounded-[36px] bg-[#070C1E] border border-cyan-400/50 max-w-xl w-full space-y-5 shadow-[0_35px_90px_rgba(0,229,255,0.4)] backdrop-blur-3xl text-left relative overflow-hidden"
            >
              <button 
                onClick={() => setActiveModal('none')}
                aria-label="Close modal"
                className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-pink-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shadow-[0_0_20px_rgba(0,229,255,0.4)]">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white font-sans tracking-tight">
                    Cosmic<span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Nexus</span>
                  </h2>
                  <p className="text-xs font-mono text-cyan-300 font-semibold">
                    Building intelligent systems for a safer, smarter future.
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-300 font-sans leading-relaxed pt-1">
                <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1.5">
                  <div className="text-[10px] font-mono text-cyan-400 uppercase font-bold">FOUNDER & CREATOR</div>
                  <div className="text-base font-extrabold text-white font-sans flex items-center gap-2">
                    <span>Kumar Aryan</span>
                    <span className="text-xs font-mono font-normal text-slate-400">Founder & Creator — CosmicNexus</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="font-bold text-white text-xs font-mono uppercase">VISION</div>
                  <p className="text-slate-300 text-xs">
                    To create intelligent systems that do more than process information — systems that can support people during critical moments with clarity, empathy, and real-time guidance.
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="font-bold text-white text-xs font-mono uppercase">BUILT WITH</div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-200 font-mono">
                    <div className="flex items-center gap-1.5"><Sparkles className="w-3 h-3 text-cyan-400" /> Advanced AI</div>
                    <div className="flex items-center gap-1.5"><Radio className="w-3 h-3 text-purple-400" /> Real-time Voice</div>
                    <div className="flex items-center gap-1.5"><HeartPulse className="w-3 h-3 text-red-400" /> Emergency Triage</div>
                    <div className="flex items-center gap-1.5"><Globe className="w-3 h-3 text-emerald-400" /> React + FastAPI</div>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-between items-center border-t border-white/10">
                <a
                  href="https://www.linkedin.com/in/aryan-aryan-1b8704351/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn profile"
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white font-bold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(0,229,255,0.4)] hover:scale-105 transition-all cursor-pointer"
                >
                  <LinkedinIcon className="w-4 h-4 text-white" />
                  <span>Connect with Kumar Aryan on LinkedIn</span>
                </a>
                <button
                  onClick={() => setActiveModal('none')}
                  className="px-4 py-2.5 rounded-2xl bg-white/[0.06] border border-white/15 text-xs text-slate-300 font-bold hover:bg-white/10 transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* REAL AI FLOATING ASSISTANT WIDGET */}
      <div className="fixed bottom-6 right-6 z-50">
        {!showFloatingAssistant ? (
          <div className="relative flex flex-col items-center">

            {/* Idle tooltip — appears after 10s */}
            <AnimatePresence>
              {showAssistantTip && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                  className="absolute -top-14 right-0 bg-[#070C1E] border border-cyan-400/40 text-slate-200 font-sans text-[11px] px-3.5 py-2 rounded-xl whitespace-nowrap shadow-card-soft z-50 max-w-[200px] text-center"
                >
                  Need help setting up Medical ID?
                  <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-[#070C1E] border-r border-b border-cyan-400/40 rotate-45" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Hover tooltip */}
            <div className="absolute -top-9 right-0 opacity-0 group-hover:opacity-100 bg-[#070C1E] border border-cyan-400/40 text-cyan-300 font-sans text-[11px] font-medium px-3 py-1 rounded-xl whitespace-nowrap shadow-card-soft z-50 pointer-events-none transition-opacity">
              AI Assistant
            </div>

            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.93 }}
              onClick={() => { setShowFloatingAssistant(true); setShowAssistantTip(false); }}
              aria-label="Open EchoAid AI Assistant"
              className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 p-0.5 cursor-pointer shadow-[0_0_20px_rgba(0,229,255,0.4)] flex items-center justify-center"
            >
              <div className="w-full h-full rounded-full bg-[#070C1E]/90 backdrop-blur-3xl flex items-center justify-center text-cyan-300">
                <Sparkles className="w-6 h-6" />
              </div>
            </motion.button>
          </div>
        ) : (
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 20 }}
            className="w-80 sm:w-96 p-5 rounded-[24px] bg-[#070C1E]/95 border border-cyan-400/50 shadow-[0_30px_90px_rgba(0,0,0,0.9)] backdrop-blur-3xl space-y-3 text-left"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-white font-sans">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>EchoAid AI Assistant</span>
              </div>
              <button 
                onClick={() => setShowFloatingAssistant(false)}
                aria-label="Close assistant panel"
                className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Conversation Thread */}
            <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1 text-xs custom-scrollbar">
              {assistantMessages.map((m, idx) => (
                <div 
                  key={idx} 
                  className={`p-3 rounded-2xl whitespace-pre-line ${
                    m.role === 'assistant' 
                      ? 'bg-white/[0.06] border border-white/10 text-slate-200 rounded-tl-sm' 
                      : 'bg-cyan-600 text-white ml-auto max-w-[85%] font-medium rounded-tr-sm'
                  }`}
                >
                  {m.content}
                </div>
              ))}

              {/* Real Typing Indicator — human-feeling */}
              {isAssistantThinking && (
                <div className="p-3 rounded-2xl bg-white/[0.06] border border-cyan-400/30 text-cyan-300 flex items-center gap-2 text-xs">
                  <span className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                  <span className="font-sans text-slate-300">EchoAid is thinking…</span>
                </div>
              )}
              <div ref={assistantChatEndRef} />
            </div>

            {/* Micro Suggestion Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <button 
                onClick={() => handleAssistantSend("Who created EchoAid X?")}
                className="px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/15 text-[10px] text-cyan-300 hover:border-cyan-400 cursor-pointer"
              >
                Who created EchoAid X?
              </button>
              <button 
                onClick={() => handleAssistantSend("Summarize our current emergency call")}
                className="px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/15 text-[10px] text-purple-300 hover:border-purple-400 cursor-pointer"
              >
                Summarize Call
              </button>
            </div>

            {/* Real Text & Microphone Input Bar */}
            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={assistantInput}
                onChange={(e) => setAssistantInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAssistantSend()}
                placeholder={isAssistantListening ? "Listening to your voice..." : "Ask assistant..."}
                disabled={isAssistantThinking}
                aria-label="Assistant message input"
                className="flex-1 px-3 py-2 rounded-xl bg-white/[0.05] border border-white/15 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 font-sans"
              />
              <button
                onClick={toggleAssistantMic}
                aria-label="Voice input for assistant"
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  isAssistantListening 
                    ? 'bg-red-500/25 border-red-400 text-red-300 animate-bounce' 
                    : 'bg-white/[0.05] border-white/15 text-cyan-300 hover:border-cyan-400'
                }`}
                title="Voice Input"
              >
                <Mic className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleAssistantSend()}
                disabled={isAssistantThinking || !assistantInput.trim()}
                aria-label="Send message to assistant"
                className="px-3 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 disabled:opacity-50 cursor-pointer flex items-center gap-1"
              >
                {isAssistantThinking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Send'}
              </button>
            </div>

          </motion.div>
        )}
      </div>

      {/* EXPORT REPORT MODAL */}
      <AnimatePresence>
        {showExportModal !== 'idle' && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm pointer-events-none">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="flex flex-col items-center gap-4 px-10 py-8 rounded-[28px] bg-[#070C1E]/96 border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.8)] backdrop-blur-3xl pointer-events-auto"
            >
              {showExportModal === 'preparing' ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  >
                    <Loader2 className="w-10 h-10 text-cyan-400" />
                  </motion.div>
                  <p className="text-sm font-sans text-slate-300 font-medium">Preparing Emergency Report…</p>
                </>
              ) : (
                <>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  >
                    <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                  </motion.div>
                  <p className="text-sm font-sans text-white font-bold">Report Ready</p>
                  <p className="text-xs text-slate-400">Saved to your downloads</p>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
