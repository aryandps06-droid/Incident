export type IncidentSeverity = 'SEV-1' | 'SEV-2' | 'SEV-3' | 'SEV-4';

export type IncidentStatus = 'INVESTIGATING' | 'MITIGATING' | 'MONITORING' | 'STABILIZED' | 'RESOLVED';

export type ParticipantRole = 
  | 'Incident Commander' 
  | 'Backend Engineer' 
  | 'Frontend Engineer' 
  | 'SRE'
  | 'DevOps Engineer' 
  | 'Support Engineer' 
  | 'Product Manager' 
  | 'Business Lead' 
  | 'Observer' 
  | 'Security Engineer'
  | 'Database Engineer'
  | 'Network Engineer'
  | 'QA Engineer'
  | 'Engineering Manager'
  | 'Customer Support'
  | 'Other / Unknown'
  | 'AI Incident Commander';

export interface Participant {
  id: string;
  name: string;
  role: ParticipantRole;
  avatar: string;
  status: 'active' | 'idle' | 'left';
  joinedAt: string;
  speaking: boolean;
  confidence: number;
}

export interface Fact {
  id: string;
  text: string;
  sourceParticipantId: string;
  sourceParticipantName: string;
  sourceParticipantRole: ParticipantRole;
  timestamp: string;
  confidence: 'Confirmed' | 'High' | 'Medium';
  evidenceText: string;
  transcriptSegmentId?: string;
}

export interface Hypothesis {
  id: string;
  text: string;
  status: 'UNCONFIRMED' | 'DISPROVED' | 'LIKELY';
  sourceParticipantId: string;
  sourceParticipantName: string;
  sourceParticipantRole: ParticipantRole;
  timestamp: string;
  evidenceText: string;
  contradictingEvidenceText?: string;
}

export interface Decision {
  id: string;
  action: string;
  status: 'PROPOSED' | 'APPROVED' | 'REJECTED' | 'EXECUTED';
  decisionMakerId: string;
  decisionMakerName: string;
  decisionMakerRole?: ParticipantRole;
  timestamp: string;
  rationale: string;
  evidenceText: string;
}

export interface ActionItem {
  id: string;
  task: string;
  ownerId?: string;
  ownerName?: string;
  ownerRole?: ParticipantRole;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'BLOCKED' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  assignedAt?: string;
  completedAt?: string;
  relatedDecisionId?: string;
  relatedEvidenceText?: string;
}

export interface Conflict {
  id: string;
  topic: string;
  statementA: string;
  sourceA: string;
  sourceARole?: ParticipantRole;
  statementB: string;
  sourceB: string;
  sourceBRole?: ParticipantRole;
  status: 'UNRESOLVED' | 'RESOLVED_A' | 'RESOLVED_B' | 'RESOLVED_CUSTOM';
  resolution?: string;
  resolvedAt?: string;
  confirmedValue?: string;
}

export interface MissingInformation {
  id: string;
  topic: string;
  description: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'IDENTIFIED' | 'RESOLVED';
  assignedOwner?: string;
  resolvedValue?: string;
}

export interface CriticalAction {
  id: string;
  action: string;
  targetSystem: string;
  reason: string;
  evidence: string;
  risk: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'EXECUTED';
  requestedAt: string;
  approvedAt?: string;
  approvedBy?: string;
  executionResult?: string;
  isSimulated: boolean;
}

export interface SystemSignal {
  id: string;
  serviceName: string;
  metricName: string;
  value: number | string;
  unit: string;
  status: 'NORMAL' | 'ELEVATED' | 'CRITICAL';
  timestamp: string;
  isDemo: boolean;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  eventType: 
    | 'INCIDENT_CREATED'
    | 'PARTICIPANT_JOINED'
    | 'PARTICIPANT_LEFT'
    | 'TRANSCRIPT_RECEIVED'
    | 'FACT_CREATED'
    | 'FACT_UPDATED'
    | 'HYPOTHESIS_CREATED'
    | 'HYPOTHESIS_UPDATED'
    | 'DECISION_PROPOSED'
    | 'DECISION_APPROVED'
    | 'DECISION_REJECTED'
    | 'ACTION_CREATED'
    | 'ACTION_ASSIGNED'
    | 'ACTION_STARTED'
    | 'ACTION_BLOCKED'
    | 'ACTION_COMPLETED'
    | 'CONFLICT_DETECTED'
    | 'CONFLICT_RESOLVED'
    | 'MISSING_INFO_DETECTED'
    | 'SYSTEM_SIGNAL_RECEIVED'
    | 'STATUS_SUMMARY_CREATED'
    | 'CRITICAL_ACTION_REQUESTED'
    | 'CRITICAL_ACTION_APPROVED'
    | 'CRITICAL_ACTION_REJECTED'
    | 'CRITICAL_ACTION_EXECUTED'
    | 'INCIDENT_STABILIZED'
    | 'INCIDENT_RESOLVED';
  title: string;
  description: string;
  source: string;
  confidenceOrStatus: string;
  relatedEntityId?: string;
}

export interface IntegrationStatus {
  service: 'Slack' | 'Jira' | 'PagerDuty' | 'Datadog / Monitoring';
  status: 'CONNECTED' | 'DEMO_SIMULATED' | 'OFFLINE';
  lastSync: string;
  details?: string;
}

export interface IncidentCommanderState {
  id: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  createdAt: string;
  startedAt: string;
  resolvedAt?: string;
  incidentCommander: string;
  affectedServices: string[];
  impact: string;
  participants: Participant[];
  facts: Fact[];
  hypotheses: Hypothesis[];
  decisions: Decision[];
  actions: ActionItem[];
  conflicts: Conflict[];
  missingInformation: MissingInformation[];
  risks: string[];
  timeline: TimelineEvent[];
  transcript: Array<{
    id: string;
    speaker: string;
    speakerRole?: ParticipantRole;
    text: string;
    timestamp: string;
  }>;
  systemSignals: SystemSignal[];
  aiUpdates: string[];
  integrations: IntegrationStatus[];
  criticalActions: CriticalAction[];
  isDemoMode: boolean;
  demoStep: number;
}
