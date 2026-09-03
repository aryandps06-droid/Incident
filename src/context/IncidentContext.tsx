import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { 
  IncidentCommanderState, 
  Participant, 
  ParticipantRole, 
  Fact, 
  Hypothesis, 
  Decision, 
  ActionItem, 
  Conflict, 
  CriticalAction 
} from '../types/incidentCommander';
import { apiService } from '../services/api';

const DEFAULT_INCIDENT: IncidentCommanderState = {
  id: 'INC-2048',
  title: 'PAYMENT API OUTAGE & 503 ERROR SPIKE',
  description: 'Payment gateway processing failures impacting customer checkout across web and mobile platforms.',
  severity: 'SEV-1',
  status: 'INVESTIGATING',
  createdAt: new Date().toISOString(),
  startedAt: '10:37:00',
  resolvedAt: undefined,
  incidentCommander: 'Neha',
  affectedServices: ['Payment API v2', 'Checkout Microservice', 'Stripe Bridge'],
  impact: '14.2% payment failure rate, ~450 failed checkout attempts',
  impactModel: {
    technical: [
      'HTTP 503 errors on payment gateway API',
      'Checkout endpoint affected',
      'Core application still available',
      'Database, CPU, and memory healthy'
    ],
    customer: [
      'Failed payment transactions',
      'Failed checkout attempts',
      'Customers can browse but cannot complete some purchases',
      'Support reports increasing'
    ],
    business: {
      conversionAffected: true,
      revenueImpact: 'Revenue impact not yet quantified',
      customerTrustRisk: 'HIGH',
      businessSeverity: 'SEV-1'
    }
  },
  participants: [
    {
      id: 'p-neha',
      name: 'Neha',
      role: 'Incident Commander',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      status: 'active',
      joinedAt: '10:44:00',
      speaking: false,
      confidence: 1.0
    },
    {
      id: 'p-arjun',
      name: 'Arjun',
      role: 'Backend Engineer',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      status: 'active',
      joinedAt: '10:42:00',
      speaking: false,
      confidence: 0.98
    },
    {
      id: 'p-ananya',
      name: 'Ananya',
      role: 'Frontend Engineer',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
      status: 'active',
      joinedAt: '10:43:00',
      speaking: false,
      confidence: 0.97
    },
    {
      id: 'p-priya',
      name: 'Priya',
      role: 'SRE',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      status: 'active',
      joinedAt: '10:48:00',
      speaking: false,
      confidence: 0.96
    },
    {
      id: 'p-rahul',
      name: 'Rahul',
      role: 'Support Engineer',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      status: 'active',
      joinedAt: '10:37:00',
      speaking: false,
      confidence: 0.95
    },
    {
      id: 'p-kavita',
      name: 'Kavita',
      role: 'Product Manager',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      status: 'active',
      joinedAt: '10:40:00',
      speaking: false,
      confidence: 0.94
    },
    {
      id: 'p-rohan',
      name: 'Rohan',
      role: 'Business Lead',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      status: 'active',
      joinedAt: '10:41:00',
      speaking: false,
      confidence: 0.93
    },
    {
      id: 'p-marcus',
      name: 'Marcus',
      role: 'Observer',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
      status: 'active',
      joinedAt: '10:45:00',
      speaking: false,
      confidence: 0.90
    },
    {
      id: 'p-ai',
      name: 'EchoAid X',
      role: 'AI Incident Commander',
      avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150',
      status: 'active',
      joinedAt: '10:44:00',
      speaking: false,
      confidence: 1.0
    }
  ],
  facts: [],
  hypotheses: [],
  decisions: [],
  actions: [],
  conflicts: [],
  missingInformation: [
    {
      id: 'mi-1',
      topic: 'Root Cause Confirmation',
      description: 'Root cause remains unconfirmed. Awaiting live diagnostic evidence from the incident room.',
      severity: 'HIGH',
      status: 'IDENTIFIED'
    }
  ],
  risks: [
    'Payment failures ongoing during investigation',
    'Customer checkout impact active'
  ],
  timeline: [
    {
      id: 'evt-init',
      timestamp: '10:37:00',
      eventType: 'INCIDENT_CREATED',
      title: 'Incident Room INC-2048 Initialized',
      description: 'EchoAid X Evidence-First AI Incident Commander online. Listening to live war room audio.',
      source: 'EchoAid X',
      confidenceOrStatus: 'Online'
    }
  ],
  transcript: [],
  systemSignals: [
    {
      id: 'sig-1',
      serviceName: 'Payment API',
      metricName: 'HTTP 503 Rate',
      value: '14.2%',
      unit: 'error_rate',
      status: 'CRITICAL',
      timestamp: '10:37:00',
      isDemo: false
    },
    {
      id: 'sig-2',
      serviceName: 'Database Cluster',
      metricName: 'CPU Utilization',
      value: '42%',
      unit: 'percent',
      status: 'NORMAL',
      timestamp: '10:37:00',
      isDemo: false
    }
  ],
  aiUpdates: [
    'EchoAid X connected to room INC-2048 as Evidence-First AI Incident Commander.'
  ],
  integrations: [
    { service: 'Slack', status: 'CONNECTED', lastSync: '10:37:00', details: '#incident-pay-503 (Live)' },
    { service: 'Jira', status: 'CONNECTED', lastSync: '10:37:00', details: 'Ticket INC-2048 linked' },
    { service: 'PagerDuty', status: 'CONNECTED', lastSync: '10:37:00', details: 'On-call SRE & Commander acknowledged' },
    { service: 'Datadog / Monitoring', status: 'CONNECTED', lastSync: '10:37:00', details: 'Live telemetry active' }
  ],
  criticalActions: [],
  isDemoMode: false,
  demoStep: 0
};

export interface InterimSpeakerCard {
  speaker: string;
  speakerRole: ParticipantRole;
  type: 'human' | 'ai';
  text: string;
}

const DEMO_STEPS = [
  // STEP 1 — ECHOAID X
  {
    stepNum: 1,
    speaker: 'EchoAid X',
    speakerRole: 'AI Incident Commander' as ParticipantRole,
    type: 'ai' as const,
    text: "Hello team. I'm EchoAid X, your AI Incident Commander. I'll track the incident, separate facts from hypotheses, assign actions, and keep unresolved risks visible. Arjun, what's happening?",
    updateState: null
  },
  // STEP 2 — ARJUN
  {
    stepNum: 2,
    speaker: 'Arjun',
    speakerRole: 'Backend Engineer' as ParticipantRole,
    type: 'human' as const,
    text: "We're seeing HTTP 503 errors from the payment API, and checkout failures are increasing.",
    updateState: (prev: IncidentCommanderState) => ({
      ...prev,
      facts: [
        ...prev.facts,
        {
          id: `fact-${Date.now()}-1`,
          text: "HTTP 503 errors from payment API",
          sourceParticipantId: "p-arjun",
          sourceParticipantName: "Arjun",
          sourceParticipantRole: "Backend Engineer" as ParticipantRole,
          confidence: "Confirmed" as const,
          evidenceText: "Arjun: 'HTTP 503 errors from the payment API'",
          timestamp: new Date().toLocaleTimeString('en-US', { hour12: false })
        },
        {
          id: `fact-${Date.now()}-2`,
          text: "Checkout failures increasing",
          sourceParticipantId: "p-arjun",
          sourceParticipantName: "Arjun",
          sourceParticipantRole: "Backend Engineer" as ParticipantRole,
          confidence: "Confirmed" as const,
          evidenceText: "Arjun: 'checkout failures are increasing'",
          timestamp: new Date().toLocaleTimeString('en-US', { hour12: false })
        }
      ],
      impactModel: {
        ...prev.impactModel,
        technical: [
          'Payment API affected',
          'Checkout affected'
        ],
        customer: prev.impactModel?.customer || [],
        business: prev.impactModel?.business || {
          conversionAffected: true,
          revenueImpact: 'Revenue impact not yet quantified',
          customerTrustRisk: 'HIGH' as const,
          businessSeverity: 'SEV-1' as const
        }
      }
    })
  },
  // STEP 3 — ECHOAID X
  {
    stepNum: 3,
    speaker: 'EchoAid X',
    speakerRole: 'AI Incident Commander' as ParticipantRole,
    type: 'ai' as const,
    text: "I've recorded those as confirmed facts. The payment flow is currently experiencing a SEV-1 incident.",
    updateState: null
  },
  // STEP 4 — ANANYA
  {
    stepNum: 4,
    speaker: 'Ananya',
    speakerRole: 'Frontend Engineer' as ParticipantRole,
    type: 'human' as const,
    text: "Checkout requests are failing, but the rest of the application is loading normally.",
    updateState: (prev: IncidentCommanderState) => ({
      ...prev,
      facts: [
        ...prev.facts,
        {
          id: `fact-${Date.now()}-3`,
          text: "Non-payment parts of application are functioning",
          sourceParticipantId: "p-ananya",
          sourceParticipantName: "Ananya",
          sourceParticipantRole: "Frontend Engineer" as ParticipantRole,
          confidence: "Confirmed" as const,
          evidenceText: "Ananya: 'rest of the application is loading normally'",
          timestamp: new Date().toLocaleTimeString('en-US', { hour12: false })
        }
      ],
      impactModel: {
        ...prev.impactModel,
        technical: [
          'Payment flow affected',
          'General application remains available'
        ],
        customer: prev.impactModel?.customer || [],
        business: prev.impactModel?.business || {
          conversionAffected: true,
          revenueImpact: 'Revenue impact not yet quantified',
          customerTrustRisk: 'HIGH' as const,
          businessSeverity: 'SEV-1' as const
        }
      }
    })
  },
  // STEP 5 — PRIYA
  {
    stepNum: 5,
    speaker: 'Priya',
    speakerRole: 'SRE' as ParticipantRole,
    type: 'human' as const,
    text: "Infrastructure looks healthy. The database is healthy, and CPU and memory are within normal limits. I don't see infrastructure saturation.",
    updateState: (prev: IncidentCommanderState) => ({
      ...prev,
      facts: [
        ...prev.facts,
        {
          id: `fact-${Date.now()}-4`,
          text: "Infrastructure healthy (Database: Healthy, CPU: Normal, Memory: Normal, Infrastructure saturation: Not observed)",
          sourceParticipantId: "p-priya",
          sourceParticipantName: "Priya",
          sourceParticipantRole: "SRE" as ParticipantRole,
          confidence: "Confirmed" as const,
          evidenceText: "Priya: 'Database is healthy, and CPU and memory are within normal limits'",
          timestamp: new Date().toLocaleTimeString('en-US', { hour12: false })
        }
      ]
    })
  },
  // STEP 6 — ECHOAID X
  {
    stepNum: 6,
    speaker: 'EchoAid X',
    speakerRole: 'AI Incident Commander' as ParticipantRole,
    type: 'ai' as const,
    text: "Recorded. Infrastructure saturation is not a confirmed cause. Customer impact is also being reported: users can browse the application, but some cannot complete purchases.",
    updateState: (prev: IncidentCommanderState) => ({
      ...prev,
      impactModel: {
        ...prev.impactModel,
        technical: prev.impactModel?.technical || ['Payment flow affected', 'General application remains available'],
        customer: [
          'Failed payments',
          'Checkout failures',
          'Customers unable to complete some purchases'
        ],
        business: {
          conversionAffected: true,
          revenueImpact: 'Revenue impact not yet quantified',
          customerTrustRisk: 'HIGH' as const,
          businessSeverity: 'SEV-1' as const
        }
      }
    })
  },
  // STEP 7 — RAHUL
  {
    stepNum: 7,
    speaker: 'Rahul',
    speakerRole: 'Support Engineer' as ParticipantRole,
    type: 'human' as const,
    text: "Support is receiving multiple reports of failed payments and checkout attempts, and the reports started increasing around the same time as the outage.",
    updateState: (prev: IncidentCommanderState) => ({
      ...prev,
      impactModel: {
        ...prev.impactModel,
        technical: prev.impactModel?.technical || ['Payment flow affected', 'General application remains available'],
        customer: [
          'Failed payments',
          'Checkout failures',
          'Customers unable to complete some purchases',
          'Support reports increasing'
        ],
        business: prev.impactModel?.business || {
          conversionAffected: true,
          revenueImpact: 'Revenue impact not yet quantified',
          customerTrustRisk: 'HIGH' as const,
          businessSeverity: 'SEV-1' as const
        }
      },
      facts: [
        ...prev.facts,
        {
          id: `fact-${Date.now()}-5`,
          text: "Support reports increasing in same period as technical outage",
          sourceParticipantId: "p-rahul",
          sourceParticipantName: "Rahul",
          sourceParticipantRole: "Support Engineer" as ParticipantRole,
          confidence: "Confirmed" as const,
          evidenceText: "Rahul: 'reports started increasing around the same time as the outage'",
          timestamp: new Date().toLocaleTimeString('en-US', { hour12: false })
        }
      ]
    })
  },
  // STEP 8 — ECHOAID X
  {
    stepNum: 8,
    speaker: 'EchoAid X',
    speakerRole: 'AI Incident Commander' as ParticipantRole,
    type: 'ai' as const,
    text: "Customer impact is confirmed through both technical evidence and support reports. The incident timeline now shows the outage beginning around 08:42 UTC.",
    updateState: (prev: IncidentCommanderState) => ({
      ...prev,
      timeline: [
        ...prev.timeline,
        {
          id: `evt-${Date.now()}-1`,
          timestamp: '08:42:00',
          eventType: 'SYSTEM_SIGNAL_RECEIVED' as const,
          title: 'First 503 errors on Payment API',
          description: 'HTTP 503 error rate spike detected on payment endpoint',
          source: 'Telemetry',
          confidenceOrStatus: 'Confirmed'
        },
        {
          id: `evt-${Date.now()}-2`,
          timestamp: '08:42:00',
          eventType: 'SYSTEM_SIGNAL_RECEIVED' as const,
          title: 'Customer Reports Increasing',
          description: 'Support ticket influx regarding failed checkouts correlated with 08:42 UTC onset',
          source: 'Support Queue',
          confidenceOrStatus: 'Confirmed'
        }
      ]
    })
  },
  // STEP 9 — ARJUN
  {
    stepNum: 9,
    speaker: 'Arjun',
    speakerRole: 'Backend Engineer' as ParticipantRole,
    type: 'human' as const,
    text: "I found matching failures in the Stripe Bridge logs. The timestamps line up with the incident, so the latest Stripe Bridge deployment may be contributing to the failures.",
    updateState: (prev: IncidentCommanderState) => ({
      ...prev,
      hypotheses: [
        ...prev.hypotheses,
        {
          id: `hyp-${Date.now()}-stripe`,
          text: "Stripe Bridge may be contributing to the outage",
          sourceParticipantId: "p-arjun",
          sourceParticipantName: "Arjun",
          sourceParticipantRole: "Backend Engineer" as ParticipantRole,
          status: "UNCONFIRMED" as const,
          evidenceText: "Matching Stripe Bridge failures; Timestamps align with incident",
          timestamp: new Date().toLocaleTimeString('en-US', { hour12: false })
        }
      ]
    })
  },
  // STEP 10 — PRIYA
  {
    stepNum: 10,
    speaker: 'Priya',
    speakerRole: 'SRE' as ParticipantRole,
    type: 'human' as const,
    text: "I checked the deployment history. The latest Stripe Bridge deployment happened shortly before the first 503 errors.",
    updateState: (prev: IncidentCommanderState) => ({
      ...prev,
      hypotheses: prev.hypotheses.map(h =>
        h.text.includes("Stripe Bridge") ? { ...h, status: "LIKELY" as const } : h
      ),
      timeline: [
        ...prev.timeline,
        {
          id: `evt-${Date.now()}-3`,
          timestamp: '08:40:00',
          eventType: 'SYSTEM_SIGNAL_RECEIVED' as const,
          title: 'Stripe Bridge Deployment',
          description: 'Latest Stripe Bridge deployment preceded first 503 errors',
          source: 'Priya (SRE)',
          confidenceOrStatus: 'Correlated'
        }
      ]
    })
  },
  // STEP 11 — ECHOAID X
  {
    stepNum: 11,
    speaker: 'EchoAid X',
    speakerRole: 'AI Incident Commander' as ParticipantRole,
    type: 'ai' as const,
    text: "That strengthens the Stripe Bridge hypothesis, but root cause is still unconfirmed. Priya owns the deployment verification action. Based on the available evidence, I recommend rolling back the latest Stripe Bridge deployment.",
    updateState: (prev: IncidentCommanderState) => ({
      ...prev,
      actions: [
        ...prev.actions,
        {
          id: `act-${Date.now()}-priya`,
          task: "Verify Stripe Bridge deployment / prepare rollback",
          ownerName: "Priya",
          ownerRole: "SRE" as ParticipantRole,
          priority: "HIGH" as const,
          status: "IN_PROGRESS" as const,
          createdAt: new Date().toLocaleTimeString('en-US', { hour12: false })
        }
      ]
    })
  },
  // STEP 12 — ARJUN + ECHOAID X
  {
    stepNum: 12,
    speaker: 'Arjun',
    speakerRole: 'Backend Engineer' as ParticipantRole,
    type: 'human' as const,
    text: "I agree. We should roll back the latest Stripe Bridge deployment.",
    updateState: null,
    subFollowup: {
      speaker: 'EchoAid X',
      speakerRole: 'AI Incident Commander' as ParticipantRole,
      type: 'ai' as const,
      text: "Rollback is a critical production action. I recommend it based on the current evidence, but I require explicit human confirmation before execution.",
      updateState: (prev: IncidentCommanderState) => {
        const nowTs = new Date().toLocaleTimeString('en-US', { hour12: false });
        const criticalAction: CriticalAction = {
          id: `ca-${Date.now()}-rollback`,
          action: "Roll back latest Stripe Bridge deployment",
          targetSystem: "Stripe Bridge Service",
          reason: "Supporting evidence connects deployment timing and Stripe Bridge failures with payment incident",
          risk: "Production deployment rollback",
          isSimulated: true,
          status: 'PENDING_APPROVAL',
          evidence: "Matching Stripe Bridge logs & deployment timing align with 08:42 UTC 503 outage",
          requestedAt: nowTs
        };
        return {
          ...prev,
          criticalActions: [...prev.criticalActions, criticalAction]
        };
      }
    }
  }
];

interface IncidentContextType {
  currentIncident: IncidentCommanderState;
  activeSpeaker: Participant;
  setActiveSpeaker: (speaker: Participant) => void;
  activeSpeakerRole: ParticipantRole;
  setActiveSpeakerRole: (role: ParticipantRole) => void;
  evidenceDrawerItem: Fact | Hypothesis | Decision | ActionItem | Conflict | null;
  setEvidenceDrawerItem: (item: Fact | Hypothesis | Decision | ActionItem | Conflict | null) => void;
  pendingCriticalAction: CriticalAction | null;
  setPendingCriticalAction: (action: CriticalAction | null) => void;
  generatedReport: { markdownReport: string; rawIncidentData: any } | null;
  setGeneratedReport: (report: { markdownReport: string; rawIncidentData: any } | null) => void;
  isDemoPlaying: boolean;
  demoStep: number;
  interimSpeakerCard: InterimSpeakerCard | null;
  submitTranscriptStatement: (speaker: string, speakerRole: ParticipantRole, text: string) => Promise<void>;
  resolveConflict: (conflictId: string, choice: string, confirmedValue: string) => Promise<void>;
  approveCriticalAction: (actionId: string) => Promise<void>;
  rejectCriticalAction: (actionId: string) => Promise<void>;
  updateActionItem: (actionId: string, updates: Partial<ActionItem>) => Promise<void>;
  startDemoScenario: () => Promise<void>;
  stepNextDemoEvent: () => Promise<void>;
  resetIncidentRoom: () => Promise<void>;
  generateReport: () => Promise<void>;
  speakAISummary: (text: string) => void;
}

const IncidentContext = createContext<IncidentContextType | undefined>(undefined);

export const IncidentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentIncident, setCurrentIncident] = useState<IncidentCommanderState>(DEFAULT_INCIDENT);
  const [activeSpeaker, setActiveSpeaker] = useState<Participant>(DEFAULT_INCIDENT.participants[1]);
  const [activeSpeakerRole, setActiveSpeakerRole] = useState<ParticipantRole>('Backend Engineer');
  const [evidenceDrawerItem, setEvidenceDrawerItem] = useState<Fact | Hypothesis | Decision | ActionItem | Conflict | null>(null);
  const [pendingCriticalAction, setPendingCriticalAction] = useState<CriticalAction | null>(null);
  const [generatedReport, setGeneratedReport] = useState<{ markdownReport: string; rawIncidentData: any } | null>(null);
  const [isDemoPlaying, setIsDemoPlaying] = useState(false);
  const [demoStepIndex, setDemoStepIndex] = useState(0);
  const [interimSpeakerCard, setInterimSpeakerCard] = useState<InterimSpeakerCard | null>(null);

  const demoTimeoutsRef = useRef<any[]>([]);
  const isDemoCancelledRef = useRef<boolean>(false);

  const stopDemoRunner = () => {
    isDemoCancelledRef.current = true;
    demoTimeoutsRef.current.forEach((t: any) => clearTimeout(t));
    demoTimeoutsRef.current = [];
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setInterimSpeakerCard(null);
    setIsDemoPlaying(false);
  };

  const speakSpeakerStatement = (
    speakerName: string,
    speakerRole: ParticipantRole,
    speakerType: 'human' | 'ai',
    fullText: string
  ): Promise<void> => {
    return new Promise((resolve) => {
      if (isDemoCancelledRef.current) {
        setInterimSpeakerCard(null);
        resolve();
        return;
      }

      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }

      const words = fullText.split(' ');
      let wordIdx = 0;
      setInterimSpeakerCard({
        speaker: speakerName,
        speakerRole: speakerRole,
        type: speakerType,
        text: words[0] || ''
      });

      const intervalMs = Math.max(80, Math.min(180, Math.floor(2200 / Math.max(words.length, 1))));
      const wordInterval = setInterval(() => {
        if (isDemoCancelledRef.current) {
          clearInterval(wordInterval);
          setInterimSpeakerCard(null);
          resolve();
          return;
        }
        wordIdx += 2;
        if (wordIdx >= words.length) {
          setInterimSpeakerCard({
            speaker: speakerName,
            speakerRole: speakerRole,
            type: speakerType,
            text: fullText
          });
          clearInterval(wordInterval);
        } else {
          setInterimSpeakerCard({
            speaker: speakerName,
            speakerRole: speakerRole,
            type: speakerType,
            text: words.slice(0, wordIdx).join(' ')
          });
        }
      }, intervalMs);

      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(fullText);
        const voices = window.speechSynthesis.getVoices();
        const sNameLower = speakerName.toLowerCase();

        if (sNameLower.includes('echoaid')) {
          utterance.pitch = 1.15;
          utterance.rate = 1.18;
          const v = voices.find(v => (v.name.includes('Google') && v.name.includes('UK')) || v.name.includes('Zira') || v.name.includes('Hazel') || v.lang.startsWith('en-GB'));
          if (v) utterance.voice = v;
        } else if (sNameLower.includes('arjun')) {
          utterance.pitch = 0.85;
          utterance.rate = 1.25;
          const v = voices.find(v => (v.name.includes('Google') && v.name.includes('US') && v.name.includes('Male')) || v.name.includes('David') || v.name.includes('Guy') || (v.name.includes('Male') && v.lang.startsWith('en-US')));
          if (v) utterance.voice = v;
        } else if (sNameLower.includes('ananya')) {
          utterance.pitch = 1.20;
          utterance.rate = 1.22;
          const v = voices.find(v => v.name.includes('Jenny') || v.name.includes('Samantha') || (v.name.includes('Female') && v.lang.startsWith('en-US')));
          if (v) utterance.voice = v;
        } else if (sNameLower.includes('priya')) {
          utterance.pitch = 0.95;
          utterance.rate = 1.15;
          const v = voices.find(v => v.name.includes('Hazel') || v.name.includes('Sonia') || v.name.includes('Catherine') || v.lang.startsWith('en-GB') || v.lang.startsWith('en-AU'));
          if (v) utterance.voice = v;
        } else if (sNameLower.includes('rahul')) {
          utterance.pitch = 1.05;
          utterance.rate = 1.20;
          const v = voices.find(v => v.name.includes('Mark') || v.name.includes('George') || v.name.includes('Prabhat') || (v.name.includes('Male') && v.lang.startsWith('en-GB')));
          if (v) utterance.voice = v;
        }

        utterance.onend = () => {
          clearInterval(wordInterval);
          setInterimSpeakerCard(null);
          resolve();
        };

        utterance.onerror = () => {
          clearInterval(wordInterval);
          setInterimSpeakerCard(null);
          resolve();
        };

        window.speechSynthesis.speak(utterance);
      } else {
        setTimeout(() => {
          clearInterval(wordInterval);
          setInterimSpeakerCard(null);
          resolve();
        }, 2200);
      }
    });
  };

  const startDemoScenario = async () => {
    stopDemoRunner();
    isDemoCancelledRef.current = false;
    setIsDemoPlaying(true);
    setDemoStepIndex(0);

    try {
      await apiService.resetIncident('INC-2048');
    } catch (e) {
      console.warn("Backend reset during demo start", e);
    }
    if (isDemoCancelledRef.current) return;

    // Reset local incident state to EMPTY transcript & empty facts/hypotheses/actions/decisions
    const emptyDemoState: IncidentCommanderState = {
      ...DEFAULT_INCIDENT,
      facts: [],
      hypotheses: [],
      decisions: [],
      actions: [],
      conflicts: [],
      transcript: []
    };
    setCurrentIncident(emptyDemoState);
    setInterimSpeakerCard(null);

    // Execute DEMO_STEPS sequentially: EchoAid X -> Arjun -> EchoAid X -> Arjun ...
    for (let i = 0; i < DEMO_STEPS.length; i++) {
      if (isDemoCancelledRef.current) break;
      const step = DEMO_STEPS[i];
      setDemoStepIndex(step.stepNum);

      // Progressive speech utterance & voice separation
      await speakSpeakerStatement(step.speaker, step.speakerRole, step.type, step.text);
      if (isDemoCancelledRef.current) break;

      // Post finalized transcript card
      const nowTime = new Date().toLocaleTimeString('en-US', { hour12: false });
      const finalCard = {
        id: `tr-step-${i}-${Date.now()}`,
        speaker: step.speaker,
        speakerRole: step.speakerRole,
        type: step.type,
        status: 'final' as const,
        text: step.text,
        timestamp: nowTime
      };

      setCurrentIncident(prev => {
        const nextState = {
          ...prev,
          transcript: [...prev.transcript, finalCard]
        };
        if (step.updateState) {
          const updated = step.updateState(nextState);
          const pendingAction = updated.criticalActions?.find((ca: any) => ca.status === 'PENDING_APPROVAL');
          if (pendingAction) {
            setPendingCriticalAction(pendingAction);
          }
          return updated;
        }
        return nextState;
      });

      if ((step as any).subFollowup && !isDemoCancelledRef.current) {
        const sub = (step as any).subFollowup;
        await new Promise(res => setTimeout(res, 350));
        await speakSpeakerStatement(sub.speaker, sub.speakerRole, sub.type, sub.text);
        if (isDemoCancelledRef.current) break;

        const subNowTime = new Date().toLocaleTimeString('en-US', { hour12: false });
        const subFinalCard = {
          id: `tr-step-sub-${i}-${Date.now()}`,
          speaker: sub.speaker,
          speakerRole: sub.speakerRole,
          type: sub.type,
          status: 'final' as const,
          text: sub.text,
          timestamp: subNowTime
        };

        setCurrentIncident(prev => {
          const nextState = {
            ...prev,
            transcript: [...prev.transcript, subFinalCard]
          };
          if (sub.updateState) {
            const updated = sub.updateState(nextState);
            const pendingAction = updated.criticalActions?.find((ca: any) => ca.status === 'PENDING_APPROVAL');
            if (pendingAction) {
              setPendingCriticalAction(pendingAction);
            }
            return updated;
          }
          return nextState;
        });
      }

      // Pause briefly between speakers
      await new Promise(res => setTimeout(res, 350));
    }
  };

  // Load backend state on mount & connect Real-time SSE Stream
  useEffect(() => {
    apiService.getIncident('INC-2048').then(data => {
      if (data && data.id) {
        setCurrentIncident(data);
        const criticalPending = data.criticalActions?.find((ca: any) => ca.status === 'PENDING_APPROVAL');
        if (criticalPending) {
          setPendingCriticalAction(criticalPending);
        }
      }
    });

    const rawApiBase = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE || 'https://incident-ih39.onrender.com';
    const cleanApiBase = rawApiBase.replace(/\/+$/, '').replace(/\/api$/, '');
    const streamUrl = `${cleanApiBase}/api/incidents/INC-2048/stream`;
    
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource(streamUrl);
      eventSource.onmessage = (event) => {
        try {
          const updatedState = JSON.parse(event.data);
          if (updatedState && updatedState.id) {
            setCurrentIncident(updatedState);
            const criticalPending = updatedState.criticalActions?.find((ca: any) => ca.status === 'PENDING_APPROVAL');
            if (criticalPending) {
              setPendingCriticalAction(criticalPending);
            }
          }
        } catch (err) {
          console.warn("Error parsing real-time SSE event data", err);
        }
      };
    } catch (err) {
      console.warn("Failed initializing SSE stream", err);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);

  // Listen for spoken speech transcript events dispatched from EmergencyContext / speech recognition
  useEffect(() => {
    const handleSpokenTranscript = (e: Event) => {
      const customEvt = e as CustomEvent<{ text: string }>;
      if (customEvt.detail && customEvt.detail.text) {
        const text = customEvt.detail.text.trim();
        if (text.length >= 2) {
          console.log('[TRANSCRIPT] received in IncidentContext:', text);
          submitTranscriptStatement(activeSpeaker.name || 'Arjun', activeSpeakerRole, text);
        }
      }
    };

    window.addEventListener('echoaid_spoken_transcript', handleSpokenTranscript);
    return () => {
      window.removeEventListener('echoaid_spoken_transcript', handleSpokenTranscript);
    };
  }, [activeSpeaker, activeSpeakerRole]);

  const speakAISummary = (text: string) => {
    // Pure Single Voice: Agora Conversational AI Agent UID 10001 handles all audio
    console.log('[AI SUMMARY] (Agora RTC voice active):', text);
  };

  // No auto-speech on page load; speech starts only when joining room

  const submitTranscriptStatement = async (speaker: string, speakerRole: ParticipantRole, text: string) => {
    // 1. Optimistic frontend update
    const nowTime = new Date().toLocaleTimeString('en-US', { hour12: false });
    const segId = `tr-${Date.now()}`;

    setCurrentIncident(prev => {
      const isAI = speaker === 'EchoAid X' || speakerRole === 'AI Incident Commander';
      const humanSeg = { id: segId, speaker, speakerRole, type: isAI ? ('ai' as const) : ('human' as const), status: 'final' as const, text, timestamp: nowTime };
      const nextTranscript = [...prev.transcript, humanSeg];
      const nextTimeline = [
        ...prev.timeline,
        {
          id: `evt-${Date.now()}`,
          timestamp: nowTime,
          eventType: 'TRANSCRIPT_RECEIVED' as const,
          title: `Statement from ${speaker} (${speakerRole})`,
          description: text,
          source: speaker,
          confidenceOrStatus: 'Transcript',
          relatedEntityId: segId
        }
      ];

      return {
        ...prev,
        transcript: nextTranscript,
        timeline: nextTimeline
      };
    });

    // 2. Intelligent Real-Time Spoken Synthesis — Selective & Contextual Intelligence
    const lower = text.toLowerCase().trim();
    let spokenResponse = '';

    // A. Presence / Audio / Mic Testing
    if (lower.includes('can you hear') || lower.includes('are you listening') || lower.includes('hear me') || lower.includes('testing') || lower.includes('hello') || lower.includes('hey') || lower.includes('hi')) {
      spokenResponse = `Yes ${speaker}, I hear you clearly. EchoAid X is online and actively monitoring this incident room.`;
    }
    // B. Hindi / Hinglish Inquiries
    else if (lower.includes('main na') || lower.includes('kya hua') || lower.includes('kya chal') || lower.includes('sun rahe') || lower.includes('kaun hai') || lower.includes('batao')) {
      spokenResponse = `Ji ${speaker}, main live sun rahi hoon. Payment API v2 investigate ho raha hai.`;
    }
    // C. Status / Summary Inquiries
    else if (lower.includes('status') || lower.includes('summary') || lower.includes('what is happening') || lower.includes("what's happening")) {
      spokenResponse = `Incident ${currentIncident.id} is currently ${currentIncident.status}. Payment API v2 is experiencing a 14.2% HTTP 503 error rate.`;
    } 
    // D. Roles & Leadership Inquiries
    else if (lower.includes('who is commander') || lower.includes('who is leading') || lower.includes('who is in charge') || lower.includes('who is lead')) {
      spokenResponse = `Neha is the active Incident Commander leading this war room.`;
    } 
    // E. Root Cause & Broken Components Inquiries
    else if (lower.includes('what is failing') || lower.includes('what is broken') || lower.includes('what is the issue') || lower.includes('what is wrong')) {
      spokenResponse = `Payment API v2 and checkout microservice are failing with HTTP 503 errors. Approximately 450 checkout attempts have failed.`;
    } 
    // F. Rollback & Deployment Actions Inquiries
    else if (lower.includes('should we roll back') || lower.includes('is rollback ready') || lower.includes('can we rollback') || lower.includes('rollback status')) {
      spokenResponse = `Rollback to Deployment v2.7 is proposed. Human confirmation from Incident Commander is required before executing.`;
    } 
    // G. General Questions
    else if (lower.includes('?') || lower.startsWith('what ') || lower.startsWith('how ') || lower.startsWith('why ') || lower.startsWith('is there ') || lower.startsWith('where ')) {
      spokenResponse = `Investigating SEV-1 Payment Outage. Telemetry and timeline are live on your dashboard.`;
    }

    if (spokenResponse) {
      const aiSegId = `tr-ai-${Date.now()}`;
      setCurrentIncident(prev => ({
        ...prev,
        transcript: [
          ...prev.transcript.map(t => t.type === 'ai' ? { ...t, status: 'final' as const } : t),
          {
            id: aiSegId,
            speaker: 'EchoAid X',
            speakerRole: 'AI Incident Commander',
            type: 'ai' as const,
            status: 'speaking' as const,
            text: spokenResponse,
            timestamp: nowTime
          }
        ]
      }));
      speakAISummary(spokenResponse);
    }

    // 3. Concurrently send to Backend FastAPI + NVIDIA NIM Intelligence Pipeline
    console.log('[VOICE LOOP] 04 TRANSCRIPT_SENT_TO_BACKEND:', text);
    try {
      const resp = await apiService.postTranscript(currentIncident.id, speaker, speakerRole, text);
      if (resp && resp.incident) {
        setCurrentIncident(resp.incident);
        if (resp.aiExtracted?.criticalAction) {
          setPendingCriticalAction(resp.aiExtracted.criticalAction);
          speakAISummary("Critical action proposal detected: Human confirmation required from Incident Commander.");
        }
      }
    } catch (err) {
      console.warn('Backend transcript post notice:', err);
    }
  };

  const resolveConflict = async (conflictId: string, choice: string, confirmedValue: string) => {
    const resp = await apiService.resolveConflict(currentIncident.id, conflictId, choice, confirmedValue);
    if (resp) {
      setCurrentIncident(resp);
    } else {
      // Local fallback
      setCurrentIncident(prev => ({
        ...prev,
        conflicts: prev.conflicts.map(c => c.id === conflictId ? {
          ...c,
          status: choice as any,
          resolution: `Confirmed '${confirmedValue}' by Human Incident Commander`,
          confirmedValue
        } : c)
      }));
    }
    speakAISummary(`Conflict resolved. Onset time confirmed as ${confirmedValue}.`);
  };

  const approveCriticalAction = async (actionId: string) => {
    const resp = await apiService.approveCriticalAction(currentIncident.id, actionId);
    if (resp) {
      setCurrentIncident(resp);
    } else {
      // Local fallback execution
      setCurrentIncident(prev => ({
        ...prev,
        status: 'STABILIZED',
        criticalActions: prev.criticalActions.map(ca => ca.id === actionId ? {
          ...ca,
          status: 'EXECUTED',
          approvedBy: 'Neha (Incident Commander)',
          executionResult: 'Simulated Execution Successful: Deployment v2.8 rolled back.'
        } : ca),
        systemSignals: prev.systemSignals.map(sig => sig.metricName.includes('503') ? { ...sig, value: '0.08%', status: 'NORMAL' } : sig)
      }));
    }
    setPendingCriticalAction(null);
    speakAISummary("Critical action approved and executed. Deployment v2.8 rolled back. HTTP 503 error rate returned to normal. Incident is now STABILIZED.");
  };

  const rejectCriticalAction = async (actionId: string) => {
    const resp = await apiService.rejectCriticalAction(currentIncident.id, actionId);
    if (resp) {
      setCurrentIncident(resp);
    } else {
      setCurrentIncident(prev => ({
        ...prev,
        criticalActions: prev.criticalActions.map(ca => ca.id === actionId ? { ...ca, status: 'REJECTED' } : ca)
      }));
    }
    setPendingCriticalAction(null);
    speakAISummary("Critical action rejected by Incident Commander.");
  };

  const updateActionItem = async (actionId: string, updates: Partial<ActionItem>) => {
    const resp = await apiService.updateActionItem(currentIncident.id, actionId, updates);
    if (resp) {
      setCurrentIncident(resp);
    } else {
      setCurrentIncident(prev => ({
        ...prev,
        actions: prev.actions.map(a => a.id === actionId ? { ...a, ...updates } : a)
      }));
    }
  };
  const resetIncidentRoom = async () => {
    stopDemoRunner();
    try {
      const res = await apiService.resetIncident('INC-2048');
      if (res && res.id) {
        setCurrentIncident({ ...res, transcript: [], facts: [], hypotheses: [], decisions: [], actions: [] });
      } else {
        setCurrentIncident({ ...DEFAULT_INCIDENT, transcript: [], facts: [], hypotheses: [], decisions: [], actions: [] });
      }
    } catch (err) {
      console.warn("Failed resetting incident room", err);
      setCurrentIncident({ ...DEFAULT_INCIDENT, transcript: [], facts: [], hypotheses: [], decisions: [], actions: [] });
    }
    setDemoStepIndex(0);
    setPendingCriticalAction(null);
    setEvidenceDrawerItem(null);
    setGeneratedReport(null);
  };

  const stepNextDemoEvent = async () => {
    // Automated runner handles timing sequentially
  };

  const generateReport = async () => {
    const rep = await apiService.generateIncidentReport(currentIncident.id);
    if (rep) {
      setGeneratedReport(rep);
    } else {
      // Local fallback markdown report
      setGeneratedReport({
        markdownReport: `# 🚨 ECHOAID X INCIDENT SUMMARY REPORT\n\n**Incident ID**: \`${currentIncident.id}\`\n**Title**: ${currentIncident.title}\n**Severity**: \`${currentIncident.severity}\`\n**Status**: \`${currentIncident.status}\`\n\n### Executive Summary\n${currentIncident.description}\n\n### Root Cause Assessment\nDeployment v2.8 rolled back. Connection pool behavior identified as primary suspect.\n`,
        rawIncidentData: currentIncident
      });
    }
  };

  return (
    <IncidentContext.Provider value={{
      currentIncident,
      activeSpeaker,
      setActiveSpeaker,
      activeSpeakerRole,
      setActiveSpeakerRole,
      evidenceDrawerItem,
      setEvidenceDrawerItem,
      pendingCriticalAction,
      setPendingCriticalAction,
      generatedReport,
      setGeneratedReport,
      isDemoPlaying,
      demoStep: demoStepIndex,
      interimSpeakerCard,
      submitTranscriptStatement,
      resolveConflict,
      approveCriticalAction,
      rejectCriticalAction,
      updateActionItem,
      startDemoScenario,
      stepNextDemoEvent,
      resetIncidentRoom,
      generateReport,
      speakAISummary
    }}>
      {children}
    </IncidentContext.Provider>
  );
};

export const useIncident = () => {
  const context = useContext(IncidentContext);
  if (!context) {
    throw new Error('useIncident must be used within an IncidentProvider');
  }
  return context;
};
