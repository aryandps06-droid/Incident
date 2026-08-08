export type ScreenState = 'landing' | 'conversation' | 'emergency' | 'summary';
export type ActiveView = 'command' | 'medical-id' | 'incidents' | 'settings';
export type SidebarTab = 'dashboard' | 'emergency' | 'calls' | 'patients' | 'history' | 'hospitals' | 'analytics' | 'settings';
export type ConversationState = 'IDLE' | 'LISTENING' | 'PROCESSING' | 'GENERATING' | 'SPEAKING' | 'WAITING_FOR_USER' | 'INTERRUPTED' | 'ERROR';

export interface DialogueMessage {
  id: string;
  sender: 'USER' | 'ECHO_AI' | 'SYSTEM' | 'PATIENT';
  text: string;
  timestamp: string;
  confidence?: number;
}

export interface TriageStep {
  step: number;
  title: string;
  instruction: string;
  action_type: string;
  duration_sec: number;
  bpm?: number;
  completed?: boolean;
}

export interface TriageResponse {
  assessment_id: string;
  timestamp: string;
  category: string;
  severity: 'CRITICAL' | 'URGENT' | 'STABLE' | 'MODERATE';
  protocol_title: string;
  guidance: string;
  recommended_action: string;
  cpr_bpm: number;
  estimated_ems_eta: string;
  confidence_score: number;
  steps: TriageStep[];
  differential_diagnosis?: Array<{ name: string; probability: number }>;
  vital_targets: {
    target_hr: string;
    target_spo2: string;
    target_respiration: string;
  };
}

export interface Incident {
  id: string;
  timestamp: string;
  category: string;
  severity: 'CRITICAL' | 'URGENT' | 'STABLE' | 'MODERATE';
  status: string;
  location: string;
  symptoms_reported: string[];
  ai_assessment: string;
  steps_completed: number;
  total_steps: number;
  duration_seconds: number;
  responder_eta: string;
  vital_summary?: {
    peak_hr: number;
    avg_spo2: string;
    bp: string;
  };
}

export interface IncidentSummary {
  id: string;
  startTime: string;
  endTime: string;
  duration: string;
  location: string;
  userQueryRecap: string;
  aiDiagnosis: string;
  confidenceScore: number;
  actionsTaken: string[];
  hospitalDestination: {
    name: string;
    address: string;
  };
}

export interface EmergencyContact {
  id?: string;
  name: string;
  relationship: string;
  phone: string;
  email: string;
  is_primary: boolean;
  notify_on_sos: boolean;
}

export interface MedicalProfile {
  full_name: string;
  age: number;
  gender: string;
  blood_type: string;
  allergies: string[];
  medical_conditions: string[];
  medications: string[];
  organ_donor: boolean;
  insurance_provider: string;
  emergency_note: string;
}

export interface Hospital {
  id: string;
  name: string;
  distance: string;
  eta: string;
  trauma_level: string;
  open_bays: number;
  icu_beds?: number;
  helipad?: boolean;
  address: string;
  phone: string;
}

export interface UserSettings {
  voice_speed: number;
  voice_gender: string;
  auto_dispatch_911: boolean;
  crash_detection_sensitivity: string;
  fall_detection_enabled: boolean;
  offline_ai_fallback: boolean;
  biometric_lock: boolean;
  stealth_sos_trigger: string;
}

export interface SystemHealth {
  status: string;
  system: string;
  version: string;
  ai_latency_ms: number;
  satellite_mesh: string;
  timestamp: string;
}

export interface EmergencySession {
  incident_id: string;
  started_at: string;
  caller_name: string;
  patient_name: string;
  patient_age: number | null;
  patient_gender: string | null;
  conscious: boolean | null;
  breathing: boolean | null;
  chest_pain: boolean | null;
  pain_radiation: boolean | null;
  bleeding: boolean | null;
  speech_problem: boolean | null;
  face_droop: boolean | null;
  allergies: string[];
  medications: string[];
  location: string;
  ambulance_called: boolean;
  emergency_contacts: EmergencyContact[];
  ai_summary: string;
  timeline: Array<{ time: string; event: string }>;
  transcript: DialogueMessage[];
}

export interface ConversationIntelligence {
  emotion: 'Panicked' | 'Calm' | 'Confused' | 'Distressed' | 'Agitated';
  urgency: 'Critical' | 'High' | 'Moderate' | 'Low';
  caller_state: 'Cooperative' | 'Overwhelmed' | 'Hesitant' | 'Responsive';
  missing_information: string[];
  next_best_question: string;
}

export type VoiceGender = 'female' | 'male';
export type VoicePersonality = 'dispatcher' | 'compassionate' | 'clinical';
