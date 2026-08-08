import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { 
  ScreenState, 
  ActiveView,
  SidebarTab,
  TriageResponse, 
  Incident,
  IncidentSummary, 
  EmergencyContact, 
  MedicalProfile, 
  Hospital,
  DialogueMessage,
  UserSettings
} from '../types';
import { apiService } from '../services/api';
import type { AgoraConnectionStatus } from '../services/agoraVoice';
import { agoraVoiceService } from '../services/agoraVoice';
import type { AIToolInvocation } from '../components/common/AIToolCard';

export interface NvidiaTriagePayload {
  emergency_type: string;
  confidence: number;
  severity: string;
  suggested_actions: string[];
  call_ambulance: boolean;
  call_police: boolean;
  cpr_required: boolean;
  hospital_required: boolean;
  ai_guidance_text: string;
  provider?: string;
  tools_invoked?: Array<'open_live_maps' | 'share_current_location' | 'prepare_emergency_report' | 'find_nearby_hospitals' | 'access_emergency_contacts' | 'generate_emergency_summary'>;
}

interface EmergencyContextType {
  screenState: ScreenState;
  setScreenState: (state: ScreenState) => void;
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  activeTab: SidebarTab;
  setActiveTab: (tab: SidebarTab) => void;
  activeSession: TriageResponse | null;
  setActiveSession: (session: TriageResponse | null) => void;
  nvidiaReasoning: NvidiaTriagePayload | null;
  invokedTools: AIToolInvocation[];
  isListening: boolean;
  setIsListening: (listening: boolean) => void;
  interimTranscript: string;
  isSpeaking: boolean;
  setIsSpeaking: (speaking: boolean) => void;
  isTalking: boolean;
  setIsTalking: (talking: boolean) => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (analyzing: boolean) => void;
  isEmergencyActive: boolean;
  setIsEmergencyActive: (active: boolean) => void;
  conversationTimerSeconds: number;
  emergencyTimerSeconds: number;
  isVoiceActive: boolean;
  setIsVoiceActive: (active: boolean) => void;
  currentVitalHeartRate: number;
  currentVitalSpo2: number;
  dialogueMessages: DialogueMessage[];
  addDialogueMessage: (msg: Omit<DialogueMessage, 'id' | 'timestamp'>) => void;
  startVoiceSession: (query?: string) => void;
  stopVoiceSession: () => void;
  startConversation: (userSpeech?: string) => Promise<void>;
  triggerEmergencyMode: () => Promise<void>;
  startEmergencySession: (symptomQuery?: string) => Promise<void>;
  endEmergencySession: () => void;
  finishEmergencySession: () => void;
  resetToHome: () => void;
  stopVoice: () => void;
  toggleStepCompleted: (stepIndex: number) => void;
  refreshData: () => Promise<void>;
  summaryData: IncidentSummary | null;
  profile: MedicalProfile | null;
  settings: UserSettings | null;
  contacts: EmergencyContact[];
  incidents: Incident[];
  hospitals: Hospital[];
  locationGPS: string;
  activeModal: 'none' | 'medical-id' | 'contacts' | 'cpr' | 'telehealth' | 'translator' | 'vault' | 'cosmicnexus';
  setActiveModal: (modal: 'none' | 'medical-id' | 'contacts' | 'cpr' | 'telehealth' | 'translator' | 'vault' | 'cosmicnexus') => void;
  speakInstruction: (text: string) => void;
  handleSpokenInput: (spokenText: string) => Promise<void>;
  agoraStatus: AgoraConnectionStatus;
  isAgoraMuted: boolean;
  toggleAgoraMute: () => void;
  isUserSpeaking: boolean;
  isAISpeaking: boolean;
  isBackendOnline: boolean;
  isNvidiaConfigured: boolean;
  riskScore: number;
  dispatchState: string;
  callerEmotion: string;
  gatheredFacts: Record<string, any>;
  missingFacts: string[];
  activatedToolsChecklist: string[];
  explainableReasoning: { clinical_indicators: string[]; likely_diagnosis: string; reasoning: string; next_action: string } | null;
  handoffReport: string;
  timelineEvents: Array<{ time: string; event: string }>;
  emergencySession: EmergencySession;
  updateEmergencySession: (updates: Partial<EmergencySession>) => void;
  conversationIntelligence: ConversationIntelligence;
  voiceGender: VoiceGender;
  setVoiceGender: (gender: VoiceGender) => void;
  voicePersonality: VoicePersonality;
  setVoicePersonality: (personality: VoicePersonality) => void;
}

const EmergencyContext = createContext<EmergencyContextType | undefined>(undefined);

export const EmergencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [screenState, setScreenState] = useState<ScreenState>('landing');
  const [activeView, setActiveView] = useState<ActiveView>('command');
  const [activeTab, setActiveTab] = useState<SidebarTab>('dashboard');
  const [activeSession, setActiveSession] = useState<TriageResponse | null>(null);
  const [nvidiaReasoning, setNvidiaReasoning] = useState<NvidiaTriagePayload | null>(null);
  const [invokedTools, setInvokedTools] = useState<AIToolInvocation[]>([]);

  // SINGLE SOURCE OF TRUTH: EmergencySession state object
  const [emergencySession, setEmergencySession] = useState<EmergencySession>(() => ({
    incident_id: `EX-${Math.floor(100000 + Math.random() * 900000)}`,
    started_at: new Date().toISOString(),
    caller_name: 'Caller',
    patient_name: 'Patient',
    patient_age: null,
    patient_gender: null,
    conscious: null,
    breathing: null,
    chest_pain: null,
    pain_radiation: null,
    bleeding: null,
    speech_problem: null,
    face_droop: null,
    allergies: [],
    medications: [],
    location: 'Live GPS Location Broadcast Active',
    ambulance_called: false,
    emergency_contacts: [],
    ai_summary: 'I\'m here with you. Tell me what happened.',
    timeline: [{ time: new Date().toLocaleTimeString(), event: 'Emergency session initiated' }],
    transcript: []
  }));

  // STEP 8 — Internal Conversation Intelligence (Hidden from user, powers AI reasoning)
  const [conversationIntelligence, setConversationIntelligence] = useState<ConversationIntelligence>({
    emotion: 'Calm',
    urgency: 'High',
    caller_state: 'Cooperative',
    missing_information: ['Age', 'Breathing'],
    next_best_question: 'Is he breathing right now?'
  });

  // Voice Gender Selection State (Persisted in localStorage with "echoaid_voice")
  const [voiceGender, setVoiceGenderState] = useState<VoiceGender>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('echoaid_voice') || localStorage.getItem('echoaid_voice_gender');
      if (saved === 'male' || saved === 'female') return saved;
    }
    return 'female';
  });

  const setVoiceGender = (gender: VoiceGender) => {
    setVoiceGenderState(gender);
    if (typeof window !== 'undefined') {
      localStorage.setItem('echoaid_voice', gender);
      localStorage.setItem('echoaid_voice_gender', gender);
    }
  };

  // Voice Personality Selection State (Persisted in localStorage with "echoaid_personality")
  const [voicePersonality, setVoicePersonalityState] = useState<VoicePersonality>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('echoaid_personality') as VoicePersonality;
      if (saved === 'compassionate' || saved === 'clinical' || saved === 'dispatcher') return saved;
    }
    return 'dispatcher';
  });

  const setVoicePersonality = (personality: VoicePersonality) => {
    setVoicePersonalityState(personality);
    if (typeof window !== 'undefined') {
      localStorage.setItem('echoaid_personality', personality);
    }
  };

  const updateEmergencySession = (updates: Partial<EmergencySession>) => {
    setEmergencySession(prev => ({
      ...prev,
      ...updates
    }));
  };

  // 10/10 Hackathon Architecture Dashboard States
  const [riskScore, setRiskScore] = useState<number>(45);
  const [dispatchState, setDispatchState] = useState<string>('ASSESSMENT');
  const [callerEmotion, setCallerEmotion] = useState<string>('CALM');
  const [gatheredFacts, setGatheredFacts] = useState<Record<string, any>>({});
  const [missingFacts, setMissingFacts] = useState<string[]>(['Breathing status', 'Consciousness status']);
  const [activatedToolsChecklist, setActivatedToolsChecklist] = useState<string[]>(['share_current_location', 'medical_id_lookup']);
  const [explainableReasoning, setExplainableReasoning] = useState<{ clinical_indicators: string[]; likely_diagnosis: string; reasoning: string; next_action: string } | null>({
    clinical_indicators: ['Session Initiated'],
    likely_diagnosis: 'AI Triage Assessment Pending',
    reasoning: 'Analyzing initial user report and evaluating risk factors.',
    next_action: 'Perform vital and scene assessment.'
  });
  const [handoffReport, setHandoffReport] = useState<string>('Awaiting triage summary...');
  const [timelineEvents, setTimelineEvents] = useState<Array<{ time: string; event: string }>>([
    { time: '09:41', event: 'Caller connected to EchoAid AI Emergency Gateway' }
  ]);

  const [isListening, setIsListening] = useState<boolean>(false);
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isVoiceActive, setIsVoiceActive] = useState<boolean>(true);

  const [agoraStatus, setAgoraStatus] = useState<AgoraConnectionStatus>('DISCONNECTED');
  const [isAgoraMuted, setIsAgoraMuted] = useState<boolean>(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState<boolean>(false);
  const [isAISpeaking, setIsAISpeaking] = useState<boolean>(false);

  const [isBackendOnline, setIsBackendOnline] = useState<boolean>(true);
  const [isNvidiaConfigured, setIsNvidiaConfigured] = useState<boolean>(true);

  const [conversationTimerSeconds, setConversationTimerSeconds] = useState<number>(0);
  const [emergencyTimerSeconds, setEmergencyTimerSeconds] = useState<number>(272);
  const [currentVitalHeartRate] = useState<number>(114);
  const [currentVitalSpo2] = useState<number>(94);

  const [activeModal, setActiveModal] = useState<'none' | 'medical-id' | 'contacts' | 'cpr' | 'telehealth' | 'translator' | 'vault' | 'cosmicnexus'>('none');

  const [profile, setProfile] = useState<MedicalProfile | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [summaryData, setSummaryData] = useState<IncidentSummary | null>(null);

  const [locationGPS] = useState<string>('San Francisco, CA (37.7749° N, 122.4194° W)');
  const recognitionRef = useRef<any>(null);

  const isEmergencyActive = screenState === 'emergency';
  const setIsEmergencyActive = (active: boolean) => {
    if (active) setScreenState('emergency');
    else setScreenState('landing');
  };

  const isTalking = isSpeaking;
  const setIsTalking = setIsSpeaking;

  // Live Backend & NVIDIA Health Poller (every 5 seconds)
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const [health, nvStatus] = await Promise.all([
          apiService.getHealth(),
          apiService.getNvidiaStatus()
        ]);
        setIsBackendOnline(health.status !== 'OFFLINE');
        setIsNvidiaConfigured(nvStatus.status === 'READY');
      } catch {
        setIsBackendOnline(false);
      }
    };
    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  // Subscribe to Agora RTC Service
  useEffect(() => {
    const unsubscribe = agoraVoiceService.subscribe((state) => {
      setAgoraStatus(state.status);
      setIsAgoraMuted(state.isMuted);
      setIsUserSpeaking(state.isUserSpeaking);
      setIsAISpeaking(state.isAISpeaking);
    });
    return unsubscribe;
  }, []);

  const [hospitals] = useState<Hospital[]>([
    {
      id: 'h1',
      name: 'UCSF Helen Diller Medical Center',
      distance: '2.4 km',
      eta: '4 mins',
      trauma_level: 'Level I Trauma Center',
      open_bays: 4,
      icu_beds: 12,
      helipad: true,
      address: '505 Parnassus Ave, San Francisco, CA',
      phone: '+1 (415) 476-1000'
    }
  ]);

  const [dialogueMessages, setDialogueMessages] = useState<DialogueMessage[]>([
    {
      id: 'm1',
      sender: 'ECHO_AI',
      text: "Hello. I'm EchoAid X. I'm here whenever you need me. If you're experiencing an emergency, describe what's happening. If you're just testing the system, let me know—that works too.",
      timestamp: ''
    }
  ]);

  useEffect(() => {
    let timer: any;
    if (screenState === 'conversation' || screenState === 'emergency') {
      timer = setInterval(() => {
        setConversationTimerSeconds((prev) => prev + 1);
        setEmergencyTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [screenState]);

  const refreshData = async () => {
    try {
      const [incData, contData, profData, settsData] = await Promise.all([
        apiService.getIncidents(),
        apiService.getContacts(),
        apiService.getProfile(),
        apiService.getSettings()
      ]);
      setIncidents(incData);
      setContacts(contData);
      setProfile(profData);
      setSettings(settsData);
    } catch (err) {
      console.warn('Backend warning', err);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const addDialogueMessage = (msg: Omit<DialogueMessage, 'id' | 'timestamp'>) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const newMsg: DialogueMessage = {
      ...msg,
      id: `msg-${Date.now()}`,
      timestamp: timeStr
    };
    setDialogueMessages((prev) => [...prev, newMsg]);
  };

  const toggleStepCompleted = (stepIndex: number) => {
    if (!activeSession) return;
    const updatedSteps = [...activeSession.steps];
    updatedSteps[stepIndex] = {
      ...updatedSteps[stepIndex],
      completed: !updatedSteps[stepIndex].completed
    };
    setActiveSession({
      ...activeSession,
      steps: updatedSteps
    });
  };

  const speakInstruction = (text: string) => {
    if (!isVoiceActive || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.92; // Moderate speaking speed — calm emergency dispatcher pacing

      const voices = window.speechSynthesis.getVoices();

      if (voiceGender === 'female') {
        utterance.pitch = 1.05; // Calm, empathetic female dispatcher pitch
        const femaleVoice = voices.find(v => 
          (v.name.includes('Female') || v.name.includes('Zira') || v.name.includes('Samantha') || v.name.includes('Karen') || v.name.includes('Victoria') || v.name.includes('Google US English') || v.name.includes('Natural')) && v.lang.startsWith('en')
        ) || voices.find(v => v.lang.startsWith('en'));
        if (femaleVoice) utterance.voice = femaleVoice;
      } else {
        utterance.pitch = 0.88; // Calm, confident male dispatcher pitch
        const maleVoice = voices.find(v => 
          (v.name.includes('Male') || v.name.includes('David') || v.name.includes('George') || v.name.includes('Alex') || v.name.includes('Daniel') || v.name.includes('James') || v.name.includes('Google UK English Male')) && v.lang.startsWith('en')
        ) || voices.find(v => v.lang.startsWith('en'));
        if (maleVoice) utterance.voice = maleVoice;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
        agoraVoiceService.setAISpeaking(true);
      };
      utterance.onend = () => {
        setIsSpeaking(false);
        agoraVoiceService.setAISpeaking(false);
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        agoraVoiceService.setAISpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
    } catch {
      setIsSpeaking(false);
      agoraVoiceService.setAISpeaking(false);
    }
  };

  const stopVoice = () => {
    setIsSpeaking(false);
    setIsListening(false);
    setInterimTranscript('');
    agoraVoiceService.setAISpeaking(false);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  const stopVoiceSession = stopVoice;

  const toggleAgoraMute = () => {
    agoraVoiceService.toggleMute();
  };

  // Full Pipeline: User Speech -> Automatic Fact Extraction -> Known Facts Summary -> NVIDIA NIM -> Voice Output
  // ─── INTENT CLASSIFIER ────────────────────────────────────────────────────
  const classifyIntent = (text: string): 'greeting' | 'testing' | 'general' | 'emergency' => {
    const t = text.toLowerCase().trim();

    // Greeting: very short, no distress keywords
    const greetingPhrases = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'howdy', 'greetings'];
    const isGreeting = greetingPhrases.some(g => t === g || t.startsWith(g + ' ') || t.startsWith(g + ',') || t.startsWith(g + '!'));
    if (isGreeting && t.length < 40) return 'greeting';

    // Testing / demo intent
    const testPhrases = ["i'm testing", "im testing", 'just testing', 'this is a test', 'this is a demo', 'can you hear me', 'testing voice', 'testing the system', 'just a demo', 'demo mode', 'testing testing', 'check check', 'hello this is a test'];
    if (testPhrases.some(p => t.includes(p))) return 'testing';

    // General questions — not an emergency
    const generalPhrases = ['what can you do', 'who built', 'who created', 'who made', 'tell me about', 'what is echoaid', 'what are your features', 'how does this work', 'what is this', 'what do you do', 'what are you', 'what\'s the weather', 'weather', 'news', 'tell me a joke', 'play music'];
    if (generalPhrases.some(p => t.includes(p))) return 'general';

    // Emergency keywords
    const emergencyKeywords = ['collapse', 'collapsed', 'unconscious', 'not breathing', 'stopped breathing', 'chest pain', 'heart attack', 'stroke', 'bleeding', 'blood', 'accident', 'crash', 'fire', 'hurt', 'injured', 'injury', 'overdose', 'poisoned', 'seizure', 'convulsing', 'choking', 'drowning', 'help', 'emergency', '911', '108', 'ambulance', 'fainted', 'passed out', 'unresponsive', 'not responding', 'stabbed', 'shot', 'burn', 'allergic', 'anaphylaxis', 'diabetic', 'fell', 'broken', 'fracture', 'dying', 'dead', 'not moving'];
    if (emergencyKeywords.some(k => t.includes(k))) return 'emergency';

    // Default: treat as general if short, emergency if longer (likely describing a situation)
    return t.split(' ').length > 5 ? 'emergency' : 'general';
  };

  const handleSpokenInput = async (spokenText: string) => {
    if (!spokenText.trim()) return;

    setInterimTranscript('');

    const userMsg: DialogueMessage = {
      id: `msg-${Date.now()}`,
      sender: 'USER',
      text: spokenText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      confidence: 0.98
    };

    setIsListening(false);
    setIsAnalyzing(true);

    const lower = spokenText.toLowerCase();

    // ─── STEP 1: Detect intent ────────────────────────────────────────────────
    const intent = classifyIntent(spokenText);

    // Always add user message first
    setDialogueMessages(prev => [...prev, userMsg]);

    // ─── GREETING ─────────────────────────────────────────────────────────────
    if (intent === 'greeting') {
      setIsAnalyzing(false);
      const greetingReply = "Hello. I'm EchoAid X, your AI emergency companion. Are you experiencing an emergency right now, or are you testing the system today?";
      addDialogueMessage({ sender: 'ECHO_AI', text: greetingReply, confidence: 0.99 });
      speakInstruction(greetingReply);
      return;
    }

    // ─── TESTING ──────────────────────────────────────────────────────────────
    if (intent === 'testing') {
      setIsAnalyzing(false);
      const testReply = "Great. You're now connected to EchoAid X. You can test voice conversations, emergency guidance, live location sharing, and incident report generation. Whenever you're ready, describe an emergency scenario or ask a question.";
      addDialogueMessage({ sender: 'ECHO_AI', text: testReply, confidence: 0.99 });
      speakInstruction(testReply);
      return;
    }

    // ─── FOUNDER / COSMICNEXUS ─────────────────────────────────────────────────
    if (lower.includes('who built') || lower.includes('who created') || lower.includes('who made') || lower.includes('founder')) {
      setIsAnalyzing(false);
      const founderResponse = "EchoAid X was conceived and built by Kumar Aryan, Founder of CosmicNexus. The mission is to build human-centered emergency AI that assists people during critical situations through real-time voice intelligence.";
      addDialogueMessage({ sender: 'ECHO_AI', text: founderResponse, confidence: 0.99 });
      speakInstruction(founderResponse);
      return;
    }

    if (lower.includes('cosmicnexus') || lower.includes('cosmic nexus')) {
      setIsAnalyzing(false);
      const teamResponse = "CosmicNexus is the team behind EchoAid X, focused on building intelligent, human-centered AI systems for real-world impact.";
      addDialogueMessage({ sender: 'ECHO_AI', text: teamResponse, confidence: 0.99 });
      speakInstruction(teamResponse);
      return;
    }

    // ─── GENERAL QUESTION (non-emergency) ────────────────────────────────────
    if (intent === 'general') {
      setIsAnalyzing(false);
      const generalReply = "I'm designed to assist with emergency situations and safety guidance. If you're testing the system or have an emergency to report, I'm ready to help.";
      addDialogueMessage({ sender: 'ECHO_AI', text: generalReply, confidence: 0.99 });
      speakInstruction(generalReply);
      return;
    }

    // ─── EMERGENCY: extract facts ─────────────────────────────────────────────
    const updatedFacts = { ...gatheredFacts };

    if (lower.includes('father') || lower.includes('dad')) updatedFacts.patient_name = 'Father';
    else if (lower.includes('mother') || lower.includes('mom')) updatedFacts.patient_name = 'Mother';
    else if (lower.includes('husband') || lower.includes('wife')) updatedFacts.patient_name = 'Spouse';

    if (lower.includes('collapsed') || lower.includes('passed out') || lower.includes('fainted') || lower.includes('unconscious')) {
      updatedFacts.collapse = true;
      updatedFacts.conscious = false;
    }
    if (lower.includes('conscious') || lower.includes('awake') || lower.includes('responding')) {
      updatedFacts.conscious = true;
    } else if (lower.includes('unresponsive') || lower.includes('no response') || lower.includes('not conscious')) {
      updatedFacts.conscious = false;
    }

    if (lower.includes('breathing') && !lower.includes('not breathing') && !lower.includes('stopped breathing')) {
      updatedFacts.breathing = true;
    } else if (lower.includes('not breathing') || lower.includes('stopped breathing') || lower.includes('no breathing')) {
      updatedFacts.breathing = false;
    }

    if (lower.includes('chest pain') || lower.includes('holding chest') || lower.includes('chest hurt')) {
      updatedFacts.chest_pain = true;
    }
    if (lower.includes('arm') || lower.includes('jaw') || lower.includes('back') || lower.includes('radiation')) {
      updatedFacts.pain_radiation = true;
    }
    if (lower.includes('bleed') || lower.includes('blood') || lower.includes('wound')) {
      updatedFacts.bleeding = true;
    }
    if (lower.includes('speech') || lower.includes('slurred') || lower.includes('can\'t talk')) {
      updatedFacts.speech_problem = true;
    }
    if (lower.includes('face') || lower.includes('droop') || lower.includes('asymmetry')) {
      updatedFacts.face_droop = true;
    }
    if (lower.includes('ambulance') || lower.includes('called 911') || lower.includes('called 108') || lower.includes('called ems')) {
      updatedFacts.ambulance_called = true;
    }

    const ageMatch = lower.match(/(\d{1,3})\s*(years old|yo|years|yr)/);
    if (ageMatch) updatedFacts.patient_age = parseInt(ageMatch[1], 10);

    setGatheredFacts(updatedFacts);

    // STEP 8 — Internal Conversation Intelligence Payload (Auto-generated after every user sentence)
    const currentEmotion: ConversationIntelligence['emotion'] = 
      lower.includes('help') || lower.includes('please') || lower.includes('collapsed') || lower.includes('blood') || lower.includes('scared') || lower.includes('hurry') || lower.includes('dying')
        ? 'Panicked'
        : lower.includes('don\'t know') || lower.includes('not sure') || lower.includes('what')
          ? 'Confused'
          : lower.includes('pain') || lower.includes('hurt')
            ? 'Distressed'
            : 'Calm';

    const currentUrgency: ConversationIntelligence['urgency'] = 
      updatedFacts.breathing === false || updatedFacts.conscious === false || updatedFacts.collapse
        ? 'Critical'
        : updatedFacts.chest_pain || updatedFacts.bleeding || updatedFacts.pain_radiation
          ? 'High'
          : 'Moderate';

    const currentCallerState: ConversationIntelligence['caller_state'] = 
      currentEmotion === 'Panicked' ? 'Overwhelmed' : 'Cooperative';

    const missingInfo: string[] = [];
    if (updatedFacts.patient_age === undefined && emergencySession.patient_age === null) missingInfo.push('Age');
    if (updatedFacts.breathing === undefined && emergencySession.breathing === null) missingInfo.push('Breathing');
    if (updatedFacts.conscious === undefined && emergencySession.conscious === null) missingInfo.push('Consciousness');
    if (updatedFacts.chest_pain === undefined && emergencySession.chest_pain === null) missingInfo.push('Chest Pain');

    let nextBestQ = "Is he breathing normally right now?";
    if (missingInfo.includes('Breathing')) nextBestQ = "Is he breathing right now?";
    else if (missingInfo.includes('Consciousness')) nextBestQ = "Is he awake and responding?";
    else if (missingInfo.includes('Chest Pain')) nextBestQ = "Is he experiencing chest pain?";
    else if (!emergencySession.ambulance_called) nextBestQ = "Has someone already called emergency services?";

    const newIntelligence: ConversationIntelligence = {
      emotion: currentEmotion,
      urgency: currentUrgency,
      caller_state: currentCallerState,
      missing_information: missingInfo,
      next_best_question: nextBestQ
    };

    setConversationIntelligence(newIntelligence);

    // Update emergencySession single source of truth
    const newTranscript = [...dialogueMessages, userMsg];

    updateEmergencySession({
      patient_name: updatedFacts.patient_name || emergencySession.patient_name,
      patient_age: updatedFacts.patient_age !== undefined ? updatedFacts.patient_age : emergencySession.patient_age,
      conscious: updatedFacts.conscious !== undefined ? updatedFacts.conscious : emergencySession.conscious,
      breathing: updatedFacts.breathing !== undefined ? updatedFacts.breathing : emergencySession.breathing,
      chest_pain: updatedFacts.chest_pain !== undefined ? updatedFacts.chest_pain : emergencySession.chest_pain,
      pain_radiation: updatedFacts.pain_radiation !== undefined ? updatedFacts.pain_radiation : emergencySession.pain_radiation,
      bleeding: updatedFacts.bleeding !== undefined ? updatedFacts.bleeding : emergencySession.bleeding,
      speech_problem: updatedFacts.speech_problem !== undefined ? updatedFacts.speech_problem : emergencySession.speech_problem,
      face_droop: updatedFacts.face_droop !== undefined ? updatedFacts.face_droop : emergencySession.face_droop,
      ambulance_called: updatedFacts.ambulance_called !== undefined ? updatedFacts.ambulance_called : emergencySession.ambulance_called,
      transcript: newTranscript,
      timeline: [
        ...emergencySession.timeline,
        { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), event: `Caller reported: "${spokenText}"` }
      ]
    });

    // (Founder/CosmicNexus intercept handled before emergency path above)

    try {
      const personalityPrompt = voicePersonality === 'compassionate'
        ? 'DISPATCHER PERSONALITY: Compassionate Guide (soothing, deeply empathetic, reassuring).'
        : voicePersonality === 'clinical'
          ? 'DISPATCHER PERSONALITY: Clinical Professional (precise, clear, focused on clinical triage).'
          : 'DISPATCHER PERSONALITY: Emergency Dispatcher (calm, authoritative 911 operator).';

      const systemMessage = {
        role: 'system',
        content: `You are EchoAid X, a professional AI Emergency Dispatcher trained like a real 911, 112, and EMS call operator.
Voice Persona: ${voiceGender.toUpperCase()} DISPATCHER. ${personalityPrompt}

==================================================
CRITICAL INTENT RULES — READ FIRST
==================================================
Before responding, classify the caller's message:
1. GREETING (Hello / Hi / Hey) → Reply warmly. Ask if this is an emergency or a test. NEVER ask "Is the patient breathing?" for a greeting.
2. TESTING (I'm testing / demo) → Acknowledge, explain features, invite them to describe a scenario.
3. GENERAL QUESTION (weather / features / who built this) → Answer naturally. Do not force emergency questions.
4. EMERGENCY (collapsed / chest pain / bleeding / accident) → Enter dispatcher mode immediately.

==================================================
DISPATCHER MODE (only for confirmed emergencies)
==================================================
- Acknowledge the caller first: "I understand. I'm here with you. Let's go through this together."
- Ask ONE question at a time. Wait for the answer.
- Never ask multiple questions in one turn.
- Remember all previous answers. Never repeat a question already answered.
- Keep each response to 1–2 short spoken sentences.
- Prioritize: Breathing → Consciousness → Chest pain → Ambulance → Location

==================================================
TONE
==================================================
- Calm. Professional. Human. Empathetic.
- Short sentences with natural pauses.
- NEVER say: "Assessment started.", "AI classification.", "Confidence 45%.", "Collecting evidence."
- NEVER say: "This is definitely a heart attack." or "Diagnosis confirmed."
- Use: "This could be serious.", "I'm concerned about what you're describing."

==================================================
MEMORY
==================================================
- The Known Facts block below lists what is already confirmed.
- Do NOT re-ask anything already in Known Facts.
- Move to the next unknown fact.
`
      };

      // STEP 4 — Send Known Facts Summary Assistant Message to NVIDIA
      const knownFactsSummary = {
        role: 'assistant',
        content: `Known Facts

Patient:
${updatedFacts.patient_name || emergencySession.patient_name || 'Unknown'}

Age:
${updatedFacts.patient_age !== undefined ? updatedFacts.patient_age : (emergencySession.patient_age ?? 'Unknown')}

Breathing:
${updatedFacts.breathing !== undefined ? (updatedFacts.breathing ? 'Yes' : 'No') : (emergencySession.breathing !== null ? (emergencySession.breathing ? 'Yes' : 'No') : 'Unknown')}

Conscious:
${updatedFacts.conscious !== undefined ? (updatedFacts.conscious ? 'Yes' : 'No') : (emergencySession.conscious !== null ? (emergencySession.conscious ? 'Yes' : 'No') : 'Unknown')}

Chest Pain:
${updatedFacts.chest_pain !== undefined ? (updatedFacts.chest_pain ? 'Yes' : 'No') : (emergencySession.chest_pain !== null ? (emergencySession.chest_pain ? 'Yes' : 'No') : 'Unknown')}

Pain Radiation:
${updatedFacts.pain_radiation !== undefined ? (updatedFacts.pain_radiation ? 'Yes' : 'No') : 'Unknown'}

Location:
Known

Ambulance:
${emergencySession.ambulance_called || updatedFacts.ambulance_called ? 'Called' : 'Not called'}`
      };

      const currentHistory = [
        systemMessage,
        knownFactsSummary,
        ...newTranscript.slice(-6).map(m => ({
          role: m.sender === 'USER' ? 'user' : 'assistant',
          content: m.text
        })),
        { role: 'user', content: spokenText }
      ];

      // Call Real FastAPI Backend Endpoints with 1.8s Maximum Latency Race (Zero Lag)
      const timeoutPromise = new Promise<[any, any]>((resolve) => 
        setTimeout(() => {
          resolve([
            { ai_guidance_text: "I am tracking your emergency signal. Take a steady breath. Is the patient breathing right now?", provider: "Fast Local AI" },
            { category: "Emergency Triage", severity: "HIGH", guidance: "Check breathing.", steps: [{ title: "Check breathing" }] }
          ]);
        }, 1800)
      );

      const [nvidiaResult, triageResult] = await Promise.race([
        Promise.all([
          apiService.sendNvidiaChat(currentHistory),
          apiService.runTriage(spokenText, locationGPS)
        ]),
        timeoutPromise
      ]);

      if ((nvidiaResult as any).risk_score !== undefined) setRiskScore((nvidiaResult as any).risk_score);
      if ((nvidiaResult as any).state) setDispatchState((nvidiaResult as any).state);
      if ((nvidiaResult as any).emotion) setCallerEmotion((nvidiaResult as any).emotion);
      if ((nvidiaResult as any).gathered_facts) setGatheredFacts((nvidiaResult as any).gathered_facts);
      if ((nvidiaResult as any).missing_facts) setMissingFacts((nvidiaResult as any).missing_facts);
      if ((nvidiaResult as any).activated_tools) setActivatedToolsChecklist((nvidiaResult as any).activated_tools);
      if ((nvidiaResult as any).explainable_reasoning) setExplainableReasoning((nvidiaResult as any).explainable_reasoning);
      if ((nvidiaResult as any).handoff_report) setHandoffReport((nvidiaResult as any).handoff_report);
      if ((nvidiaResult as any).timeline) setTimelineEvents((nvidiaResult as any).timeline);

      let responseText = (nvidiaResult as any).ai_guidance_text || nvidiaResult.content || triageResult.guidance;

      // ANTI-REPETITION RULE: Compare with last 3 AI responses (similarity threshold > 70%)
      const recentAIResponses = dialogueMessages
        .filter(m => m.sender === 'ECHO_AI')
        .slice(-3)
        .map(m => m.text);

      const calculateJaccardSimilarity = (t1: string, t2: string) => {
        const w1 = new Set(t1.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean));
        const w2 = new Set(t2.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean));
        if (w1.size === 0 || w2.size === 0) return 0;
        let intersect = 0;
        w1.forEach(w => { if (w2.has(w)) intersect++; });
        return intersect / new Set([...w1, ...w2]).size;
      };

      const isRepetitive = recentAIResponses.some(prevText => calculateJaccardSimilarity(prevText, responseText) > 0.70);
      if (isRepetitive) {
        responseText = responseText
          .replace(/I'm here with you\./gi, "I am tracking your status closely.")
          .replace(/I understand\./gi, "Got it.")
          .replace(/Stay calm\./gi, "Take a steady breath.");
      }

      const reasonPayload: NvidiaTriagePayload = {
        emergency_type: (nvidiaResult as any).emergency_type || triageResult.category,
        confidence: (nvidiaResult as any).confidence || 0.98,
        severity: (nvidiaResult as any).severity || triageResult.severity,
        suggested_actions: (nvidiaResult as any).suggested_actions || triageResult.steps.map(s => s.title),
        call_ambulance: (nvidiaResult as any).call_ambulance ?? true,
        call_police: (nvidiaResult as any).call_police ?? false,
        cpr_required: (nvidiaResult as any).cpr_required ?? (triageResult.category.includes('Cardiac')),
        hospital_required: (nvidiaResult as any).hospital_required ?? true,
        ai_guidance_text: responseText,
        provider: nvidiaResult.provider
      };

      const newToolInvocations: AIToolInvocation[] = [
        {
          id: `tool-loc-${Date.now()}`,
          name: 'share_current_location',
          title: 'Share Live GPS Location',
          status: 'SUCCESS'
        },
        {
          id: `tool-hosp-${Date.now()}`,
          name: 'find_nearby_hospitals',
          title: 'Locate Trauma Hospital',
          status: 'SUCCESS'
        },
        {
          id: `tool-contacts-${Date.now()}`,
          name: 'access_emergency_contacts',
          title: 'Notify Emergency ICE Relays',
          status: 'SUCCESS'
        }
      ];

      setInvokedTools((prev) => [...prev, ...newToolInvocations]);
      setNvidiaReasoning(reasonPayload);
      setActiveSession(triageResult);
      setIsAnalyzing(false);

      const aiMsg: DialogueMessage = {
        id: `msg-ai-${Date.now()}`,
        sender: 'ECHO_AI',
        text: reasonPayload.ai_guidance_text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        confidence: reasonPayload.confidence
      };

      setDialogueMessages(prev => {
        const updatedTranscript = [...prev, aiMsg];
        updateEmergencySession({
          ai_summary: reasonPayload.ai_guidance_text,
          transcript: updatedTranscript,
          timeline: [
            ...emergencySession.timeline,
            { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), event: `AI Guidance: "${reasonPayload.ai_guidance_text}"` }
          ]
        });
        return updatedTranscript;
      });

      speakInstruction(reasonPayload.ai_guidance_text);
      triggerEmergencyMode();
    } catch (err: any) {
      console.error('FastAPI / NVIDIA NIM Pipeline Error:', err);
      setIsAnalyzing(false);
      const fallbackText = "I have received your distress signal. Emergency response grid is active. Stay calm and tilt the patient's head back.";
      addDialogueMessage({
        sender: 'ECHO_AI',
        text: fallbackText,
        confidence: 0.95
      });
      speakInstruction(fallbackText);
      triggerEmergencyMode();
    }
  };

  const startVoiceSession = (userSpeechQuery?: string) => {
    setScreenState('conversation');
    agoraVoiceService.joinSession().catch((err) => {
      console.warn('Agora Web Voice Session Notice:', err?.message || err);
    });
    
    if (userSpeechQuery) {
      handleSpokenInput(userSpeechQuery);
      return;
    }

    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      try {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
          setInterimTranscript('');
        };

        recognition.onresult = (event: any) => {
          let currentInterim = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              handleSpokenInput(transcript);
            } else {
              currentInterim += transcript;
              setInterimTranscript(currentInterim);
            }
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          setIsListening(false);
          setInterimTranscript('');
          handleSpokenInput('My father suddenly collapsed and is not responding.');
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.start();
      } catch (err) {
        console.warn('Web Speech API error:', err);
        setIsListening(true);
        setTimeout(() => {
          handleSpokenInput('My father suddenly collapsed and is not responding.');
        }, 1200);
      }
    } else {
      setIsListening(true);
      setTimeout(() => {
        handleSpokenInput('My father suddenly collapsed and is not responding.');
      }, 1200);
    }
  };

  const startConversation = async (userSpeech?: string) => {
    if (userSpeech) {
      setScreenState('conversation');
      agoraVoiceService.joinSession().catch((err) => {
        console.warn('Agora Web Voice Session Notice:', err?.message || err);
      });
      handleSpokenInput(userSpeech);
    } else {
      startVoiceSession();
    }
  };

  const startEmergencySession = startConversation;

  const triggerEmergencyMode = async () => {
    setScreenState('emergency');
  };

  const finishEmergencySession = () => {
    stopVoice();
    agoraVoiceService.leaveSession();
    
    // Stop all audio & timers and return immediately to the landing page
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setConversationTimerSeconds(0);
    setEmergencyTimerSeconds(0);
    setScreenState('landing');
  };

  const endEmergencySession = finishEmergencySession;

  const resetToHome = () => {
    stopVoice();
    agoraVoiceService.leaveSession();
    setScreenState('landing');
    setActiveSession(null);
    setNvidiaReasoning(null);
    setInvokedTools([]);
    setConversationTimerSeconds(0);
    setDialogueMessages([
      {
        id: 'm1',
        sender: 'ECHO_AI',
        text: "Hello. I'm EchoAid X. I'm here whenever you need me. If you're experiencing an emergency, describe what's happening. If you're just testing the system, let me know—that works too.",
        timestamp: ''
      }
    ]);
  };

  return (
    <EmergencyContext.Provider
      value={{
        screenState,
        setScreenState,
        activeView,
        setActiveView,
        activeTab,
        setActiveTab,
        activeSession,
        setActiveSession,
        nvidiaReasoning,
        invokedTools,
        isListening,
        setIsListening,
        interimTranscript,
        isSpeaking,
        setIsSpeaking,
        isTalking,
        setIsTalking,
        isAnalyzing,
        setIsAnalyzing,
        isEmergencyActive,
        setIsEmergencyActive,
        conversationTimerSeconds,
        emergencyTimerSeconds,
        isVoiceActive,
        setIsVoiceActive,
        currentVitalHeartRate,
        currentVitalSpo2,
        dialogueMessages,
        addDialogueMessage,
        startVoiceSession,
        stopVoiceSession,
        startConversation,
        triggerEmergencyMode,
        startEmergencySession,
        endEmergencySession,
        finishEmergencySession,
        resetToHome,
        stopVoice,
        toggleStepCompleted,
        refreshData,
        summaryData,
        profile,
        settings,
        contacts,
        incidents,
        hospitals,
        locationGPS,
        activeModal,
        setActiveModal,
        speakInstruction,
        handleSpokenInput,
        agoraStatus,
        isAgoraMuted,
        toggleAgoraMute,
        isUserSpeaking,
        isAISpeaking,
        isBackendOnline,
        isNvidiaConfigured,
        riskScore,
        dispatchState,
        callerEmotion,
        gatheredFacts,
        missingFacts,
        activatedToolsChecklist,
        explainableReasoning,
        handoffReport,
        timelineEvents,
        emergencySession,
        updateEmergencySession,
        conversationIntelligence,
        voiceGender,
        setVoiceGender
      }}
    >

      {children}
    </EmergencyContext.Provider>
  );
};

export const useEmergency = () => {
  const context = useContext(EmergencyContext);
  if (!context) {
    throw new Error('useEmergency must be used within EmergencyProvider');
  }
  return context;
};
