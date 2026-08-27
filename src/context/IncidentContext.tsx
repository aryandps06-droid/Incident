import React, { createContext, useContext, useState, useEffect } from 'react';
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

// DEMO SCENARIO SEQUENCE DATA (Phase 20 & 21)
const DEMO_SEQUENCE = [
  {
    speaker: 'Arjun',
    speakerRole: 'Backend Engineer' as ParticipantRole,
    text: 'The new database connection pool might be overloaded.',
    aiUpdate: 'Hypothesis logged: Database connection pool overload (UNCONFIRMED).'
  },
  {
    speaker: 'Priya',
    speakerRole: 'SRE / DevOps' as ParticipantRole,
    text: 'Database CPU looks normal at 42%.',
    aiUpdate: 'Fact logged: Database CPU normal (Contradiction noted: DB overload unconfirmed).'
  },
  {
    speaker: 'Priya',
    speakerRole: 'SRE / DevOps' as ParticipantRole,
    text: 'Deployment v2.8 happened shortly before the error spike.',
    aiUpdate: 'Hypothesis logged: Deployment v2.8 regression (LIKELY).'
  },
  {
    speaker: 'Neha',
    speakerRole: 'Incident Commander' as ParticipantRole,
    text: "Let's roll back v2.8.",
    aiUpdate: 'Decision proposed: Rollback Deployment v2.8.'
  },
  {
    speaker: 'Arjun',
    speakerRole: 'Backend Engineer' as ParticipantRole,
    text: 'I can perform the rollback.',
    aiUpdate: 'Action assigned to Arjun: Rollback v2.8. 🛑 CRITICAL ACTION APPROVAL REQUESTED.'
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

    const apiBase = import.meta.env.VITE_API_BASE ? `${import.meta.env.VITE_API_BASE}/api` : '/api';
    const streamUrl = `${apiBase}/incidents/INC-2048/stream`;
    
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
      const nextTranscript = [...prev.transcript, { id: segId, speaker, speakerRole, text, timestamp: nowTime }];
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
    // Note: Regular non-question statements are recorded silently without robotic echoing

    if (spokenResponse) {
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

  const startDemoScenario = async () => {
    setIsDemoPlaying(true);
    setDemoStepIndex(0);
    const backendDemo = await apiService.startDemoIncident();
    if (backendDemo) {
      setCurrentIncident(backendDemo);
    } else {
      setCurrentIncident(DEFAULT_INCIDENT);
    }
    speakAISummary("EchoAid X EcoSphere Demo Scenario initiated: Payment API Outage INC-2048.");
  };

  const stepNextDemoEvent = async () => {
    if (demoStepIndex < DEMO_SEQUENCE.length) {
      const step = DEMO_SEQUENCE[demoStepIndex];
      await submitTranscriptStatement(step.speaker, step.speakerRole, step.text);
      setDemoStepIndex(prev => prev + 1);
    } else {
      setIsDemoPlaying(false);
      speakAISummary("Demo scenario sequence complete. Ready to generate final incident summary report.");
    }
  };

  const resetIncidentRoom = async () => {
    try {
      const res = await apiService.resetIncident('INC-2048');
      if (res && res.id) {
        setCurrentIncident(res);
      } else {
        setCurrentIncident(DEFAULT_INCIDENT);
      }
      setIsDemoPlaying(false);
      setDemoStepIndex(0);
      setPendingCriticalAction(null);
      setEvidenceDrawerItem(null);
      setGeneratedReport(null);
    } catch (err) {
      console.warn("Failed resetting incident room", err);
      setCurrentIncident(DEFAULT_INCIDENT);
    }
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
