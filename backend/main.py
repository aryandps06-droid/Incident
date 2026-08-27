import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

from agora_token_builder import RtcTokenBuilder
import time
import threading
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
import json
import os
import uuid
import base64
import requests
import traceback
from datetime import datetime
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

app = FastAPI(
    title="EchoAid X Neural Engine API",
    description="The World's First AI Emergency Companion Backend",
    version="1.0.0"
)

try:
    from nvidia_client import nvidia_client
except ImportError:
    from backend.nvidia_client import nvidia_client

try:
    from incident_engine import IncidentEngine
except ImportError:
    from backend.incident_engine import IncidentEngine

# CORS configuration supporting development & Render production origins
frontend_origin = os.getenv("FRONTEND_ORIGIN")
allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
if frontend_origin:
    allowed_origins.append(frontend_origin.strip().rstrip('/'))

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if os.getenv("ALLOW_ALL_CORS", "true").lower() == "true" else allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def catch_exceptions_middleware(request: Request, call_next):
    try:
        response = await call_next(request)
        return response
    except Exception as e:
        traceback.print_exc()
        return JSONResponse(status_code=500, content={
            "success": False,
            "error": "Internal server error occurred.",
            "detail": str(e)
        })

if os.environ.get("VERCEL") == "1":
    DATA_DIR = "/tmp"
else:
    DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
    
DB_FILE = os.path.join(DATA_DIR, "db.json")
incident_engine = IncidentEngine(DATA_DIR)

def init_db():
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR, exist_ok=True)
    if not os.path.exists(DB_FILE):
        default_data = {
            "profile": {
                "full_name": "Alexander Vance",
                "age": 34,
                "gender": "Male",
                "blood_type": "O-Positive (O+)",
                "allergies": ["Penicillin", "Bee Stings", "Latex"],
                "medical_conditions": ["Mild Asthma", "Hypertension"],
                "medications": ["Albuterol Inhaler (PRN)", "Lisinopril 10mg"],
                "organ_donor": True,
                "insurance_provider": "Aetna Healthcare #99281-EA",
                "emergency_note": "Carries epi-pen in main backpack pocket. Pre-existing bronchial sensitivity."
            },
            "contacts": [
                {
                    "id": "c1",
                    "name": "National Ambulance Service",
                    "relationship": "Emergency Trauma Response",
                    "phone": "108",
                    "email": "ems@national-ambulance.gov",
                    "is_primary": True,
                    "notify_on_sos": True
                },
                {
                    "id": "c2",
                    "name": "Unified National Helpline",
                    "relationship": "Single Emergency Response (All)",
                    "phone": "112",
                    "email": "sos@emergency112.gov",
                    "is_primary": True,
                    "notify_on_sos": True
                },
                {
                    "id": "c3",
                    "name": "Police Control Room",
                    "relationship": "Rapid Enforcement Response",
                    "phone": "100",
                    "email": "police@emergency.gov",
                    "is_primary": False,
                    "notify_on_sos": True
                },
                {
                    "id": "c4",
                    "name": "Fire & Rescue Services",
                    "relationship": "Hazard & Rescue Operations",
                    "phone": "101",
                    "email": "fire@rescue.gov",
                    "is_primary": False,
                    "notify_on_sos": True
                },
                {
                    "id": "c5",
                    "name": "Dr. Sarah Connor",
                    "relationship": "Primary Physician / Spouse",
                    "phone": "+1 (555) 019-2834",
                    "email": "sarah.connor@echoaid.io",
                    "is_primary": False,
                    "notify_on_sos": True
                },
                {
                    "id": "c6",
                    "name": "Marcus Vance",
                    "relationship": "Brother",
                    "phone": "+1 (555) 014-9921",
                    "email": "marcus.vance@techmesh.net",
                    "is_primary": False,
                    "notify_on_sos": True
                }
            ],
            "incidents": [
                {
                    "id": "INC-88219",
                    "timestamp": "2026-08-01T14:32:00Z",
                    "category": "Cardiac Triage Simulation",
                    "severity": "CRITICAL",
                    "status": "Resolved",
                    "location": "37.7749° N, 122.4194° W (San Francisco, CA)",
                    "symptoms_reported": ["Chest pain", "Shortness of breath", "Left arm tingling"],
                    "ai_assessment": "High probability acute coronary event. CPR cadence 110 bpm initiated. Dispatch notified at T+12s.",
                    "steps_completed": 4,
                    "total_steps": 4,
                    "duration_seconds": 284,
                    "responder_eta": "4.2 mins",
                    "vital_summary": {"peak_hr": 142, "avg_spo2": "94%", "bp": "145/95"}
                },
                {
                    "id": "INC-74102",
                    "timestamp": "2026-07-22T09:15:00Z",
                    "category": "Severe Allergic Anaphylaxis",
                    "severity": "URGENT",
                    "status": "Resolved",
                    "location": "37.7833° N, 122.4167° W (Financial District)",
                    "symptoms_reported": ["Facial swelling", "Wheezing", "Stinger exposure"],
                    "ai_assessment": "Anaphylactic reaction detected. Guided EpiPen administration into lateral thigh. Airway monitored continuously.",
                    "steps_completed": 3,
                    "total_steps": 3,
                    "duration_seconds": 190,
                    "responder_eta": "6.0 mins",
                    "vital_summary": {"peak_hr": 128, "avg_spo2": "96%", "bp": "120/80"}
                },
                {
                    "id": "INC-61920",
                    "timestamp": "2026-06-11T18:40:00Z",
                    "category": "Trauma & Arterial Bleed Control",
                    "severity": "URGENT",
                    "status": "Resolved",
                    "location": "37.7500° N, 122.4333° W (Mission District)",
                    "symptoms_reported": ["Deep glass cut on left forearm", "Pulsatile bleeding"],
                    "ai_assessment": "Direct pressure protocol applied. Tourniquet prep guided. Limb elevation confirmed.",
                    "steps_completed": 5,
                    "total_steps": 5,
                    "duration_seconds": 340,
                    "responder_eta": "5.5 mins",
                    "vital_summary": {"peak_hr": 115, "avg_spo2": "98%", "bp": "118/78"}
                }
            ],
            "settings": {
                "voice_speed": 1.0,
                "voice_gender": "Calm Female (Echo Core)",
                "auto_dispatch_911": True,
                "crash_detection_sensitivity": "High",
                "fall_detection_enabled": True,
                "offline_ai_fallback": True,
                "biometric_lock": True,
                "stealth_sos_trigger": "Triple Power Button Tap"
            }
        }
        with open(DB_FILE, "w") as f:
            json.dump(default_data, f, indent=2)

def load_db():
    init_db()
    try:
        with open(DB_FILE, "r") as f:
            return json.load(f)
    except Exception:
        init_db()
        with open(DB_FILE, "r") as f:
            return json.load(f)

def save_db(data):
    with open(DB_FILE, "w") as f:
        json.dump(data, f, indent=2)

# Models
class TriageRequest(BaseModel):
    symptoms: str
    patient_status: Optional[str] = "Conscious"
    location: Optional[str] = "37.7749° N, 122.4194° W"
    vitals_override: Optional[dict] = None

class IncidentCreate(BaseModel):
    category: str
    severity: str
    symptoms_reported: List[str]
    ai_assessment: str
    duration_seconds: int
    location: Optional[str] = "37.7749° N, 122.4194° W"
    steps_completed: int
    total_steps: int

class Contact(BaseModel):
    id: Optional[str] = None
    name: str
    relationship: str
    phone: str
    email: str
    is_primary: bool = False
    notify_on_sos: bool = True

class ProfileUpdate(BaseModel):
    full_name: str
    age: int
    gender: str
    blood_type: str
    allergies: List[str]
    medical_conditions: List[str]
    medications: List[str]
    organ_donor: bool
    insurance_provider: str
    emergency_note: str

class ChatMessagePayload(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessagePayload]
    session_id: Optional[str] = None
    patient_status: Optional[str] = "Conscious"
    location: Optional[str] = "San Francisco, CA"

# NVIDIA NIM AI Service Endpoints (Support both /api/nvidia/status and /nvidia/status)
@app.get("/api/nvidia/status")
@app.get("/nvidia/status")
def nvidia_status():
    return {
        "configured": nvidia_client.is_configured(),
        "model": nvidia_client.model,
        "base_url": nvidia_client.base_url,
        "status": "READY" if nvidia_client.is_configured() else "UNCONFIGURED_FALLBACK_ACTIVE"
    }

@app.post("/api/chat")
@app.post("/chat")
def nvidia_chat(req: ChatRequest):
    formatted_msgs = [{"role": m.role, "content": m.content} for m in req.messages]
    result = nvidia_client.analyze_emergency(formatted_msgs)
    return result



# Endpoints
@app.get("/health")
@app.get("/api/health")
def health_check():
    return {
        "status": "ok"
    }

@app.post("/api/triage")
def perform_triage(req: TriageRequest):
    symptoms_lower = req.symptoms.lower()
    
    # AI Neural Protocol Dispatch Engine Logic
    if any(k in symptoms_lower for k in ["chest pain", "heart attack", "cardiac", "stroke", "numbness", "unconscious", "not breathing", "cpr"]):
        category = "Cardiac / Sudden Collapse"
        severity = "CRITICAL"
        protocol_title = "High-Fidelity CPR & Resuscitation Protocol"
        steps = [
            {"step": 1, "title": "Check Responsiveness & Airway", "instruction": "Tap shoulders firmly and ask loudly 'Are you okay?'. Tilt head back slightly to open airway.", "action_type": "verify", "duration_sec": 10},
            {"step": 2, "title": "Call Dispatch Relay (Automated)", "instruction": "EchoAid X is automatically routing telemetry to 911 dispatch with live GPS coordinates.", "action_type": "alert", "duration_sec": 5},
            {"step": 3, "title": "Begin Rhythmic Chest Compressions", "instruction": "Place heel of hand on center of chest. Interlock fingers. Push hard and fast to 110-120 BPM audio beat.", "action_type": "metronome", "duration_sec": 120, "bpm": 110},
            {"step": 4, "title": "Locate AED (Automated External Defibrillator)", "instruction": "Send bystander for nearest AED. EchoAid X beacon signal is pinging nearby AED cabinets.", "action_type": "hardware", "duration_sec": 30}
        ]
        guidance = "CRITICAL EMERGENCY. Stay calm. Follow the rhythmic audio beat. EchoAid AI emergency dispatch relay has been activated."
        cpr_bpm = 110
        recommended_action = "IMMEDIATE EMS DISPATCH & CONTINUOUS CPR"

    elif any(k in symptoms_lower for k in ["bleed", "cut", "wound", "blood", "arterial", "gash", "laceration"]):
        category = "Severe Hemorrhage / Trauma"
        severity = "CRITICAL" if "arterial" in symptoms_lower or "heavy" in symptoms_lower else "URGENT"
        protocol_title = "Arterial & Deep Laceration Hemorrhage Control"
        steps = [
            {"step": 1, "title": "Apply Firm Direct Pressure", "instruction": "Place sterile cloth or bare hands directly over the wound. Press down firmly with full body weight.", "action_type": "press", "duration_sec": 60},
            {"step": 2, "title": "Elevate Above Heart Level", "instruction": "If wound is on arm or leg, elevate the injured limb above heart level to decrease pressure.", "action_type": "position", "duration_sec": 15},
            {"step": 3, "title": "Prepare & Apply Tourniquet", "instruction": "If severe spurt bleeding persists, apply tourniquet 2-3 inches above the wound (never on a joint). Tighten until bleeding stops.", "action_type": "tourniquet", "duration_sec": 45},
            {"step": 4, "title": "Maintain Pressure & Monitor Shock", "instruction": "Keep patient warm with a jacket. Do not remove soaked cloths—layer fresh cloths on top.", "action_type": "monitor", "duration_sec": 90}
        ]
        guidance = "Hemorrhage risk detected. Maintain firm continuous pressure. Do not lift cloth to inspect wound while pressure is applied."
        cpr_bpm = 0
        recommended_action = "DIRECT PRESSURE & TOURNIQUET READY"

    elif any(k in symptoms_lower for k in ["choke", "choking", "food stuck", "airway", "gasping"]):
        category = "Airway Obstruction (Choking)"
        severity = "CRITICAL"
        protocol_title = "Heimlich Abdominal Thrust Protocol"
        steps = [
            {"step": 1, "title": "Confirm Complete Airway Obstruction", "instruction": "Ask 'Are you choking?'. If patient cannot speak, cough, or breathe, act immediately.", "action_type": "verify", "duration_sec": 5},
            {"step": 2, "title": "Give 5 Back Blows", "instruction": "Stand behind patient, lean them forward slightly, deliver 5 firm blows between shoulder blades using heel of hand.", "action_type": "physical", "duration_sec": 10},
            {"step": 3, "title": "Perform 5 Abdominal Thrusts (Heimlich)", "instruction": "Wrap arms around waist, make a fist above navel, thumb inward. Grasp fist and pull inward and upward quickly.", "action_type": "physical", "duration_sec": 15},
            {"step": 4, "title": "Repeat Cycle until Object Dislodges", "instruction": "Alternate 5 back blows and 5 abdominal thrusts until airway is clear or person becomes unresponsive.", "action_type": "repeat", "duration_sec": 60}
        ]
        guidance = "Choking protocol activated. Perform quick upward abdominal thrusts to dislodge obstruction."
        cpr_bpm = 0
        recommended_action = "BACK BLOWS & ABDOMINAL THRUSTS"

    elif any(k in symptoms_lower for k in ["allergy", "anaphylaxis", "bee", "peanut", "epi", "swelling", "hives"]):
        category = "Anaphylactic Reaction"
        severity = "URGENT"
        protocol_title = "Anaphylaxis Auto-Injector (EpiPen) Protocol"
        steps = [
            {"step": 1, "title": "Locate Epinephrine Auto-Injector", "instruction": "Check patient bag for EpiPen or equivalent epinephrine auto-injector.", "action_type": "locate", "duration_sec": 15},
            {"step": 2, "title": "Inject into Outer Thigh", "instruction": "Remove safety cap. Hold orange tip against outer thigh at 90° angle. Press firmly until it clicks and hold for 3 full seconds.", "action_type": "inject", "duration_sec": 10},
            {"step": 3, "title": "Massage Injection Site", "instruction": "Massage the area for 10 seconds to enhance absorption.", "action_type": "physical", "duration_sec": 10},
            {"step": 4, "title": "Position Patient for Airway Security", "instruction": "Lay patient flat with legs elevated unless breathing is difficult, in which case keep sitting.", "action_type": "position", "duration_sec": 30}
        ]
        guidance = "Anaphylaxis protocol active. Administer Epinephrine immediately and prepare for second dose if EMS ETA exceeds 10 mins."
        cpr_bpm = 0
        recommended_action = "ADMINISTER EPIPEN & MONITOR AIRWAY"

    else:
        category = "General Emergency Triage"
        severity = "MODERATE"
        protocol_title = "Standard Emergency Vital Stabilization"
        steps = [
            {"step": 1, "title": "Assess Immediate Hazards", "instruction": "Ensure environment is safe from traffic, fire, gas, or electrical hazards.", "action_type": "verify", "duration_sec": 10},
            {"step": 2, "title": "Position Patient Comfortably", "instruction": "Keep patient calm, seated or lying down comfortably. Do not move if neck/back trauma suspected.", "action_type": "position", "duration_sec": 20},
            {"step": 3, "title": "Monitor Breathing & Heart Rate", "instruction": "Check radial pulse at wrist and observe chest rise and fall.", "action_type": "monitor", "duration_sec": 30},
            {"step": 4, "title": "Stay Connected with EchoAid Voice AI", "instruction": "EchoAid AI will continuously stream audio telemetry to response operators.", "action_type": "alert", "duration_sec": 30}
        ]
        guidance = "General triage active. Monitoring vital stability and broadcasting satellite beacon location."
        cpr_bpm = 0
        recommended_action = "STABILIZE PATIENT & MONITOR VITALS"

    return {
        "assessment_id": f"TRI-{uuid.uuid4().hex[:8].upper()}",
        "timestamp": datetime.utcnow().isoformat(),
        "category": category,
        "severity": severity,
        "protocol_title": protocol_title,
        "guidance": guidance,
        "recommended_action": recommended_action,
        "cpr_bpm": cpr_bpm,
        "estimated_ems_eta": "4.5 minutes",
        "confidence_score": 0.982,
        "steps": steps,
        "vital_targets": {
            "target_hr": "60-100 BPM",
            "target_spo2": "> 95%",
            "target_respiration": "12-20 BPM"
        }
    }

@app.get("/api/incidents")
def get_incidents():
    db = load_db()
    return db.get("incidents", [])

@app.post("/api/incidents")
def create_incident(inc: IncidentCreate):
    db = load_db()
    new_inc = inc.dict()
    new_inc["id"] = f"INC-{uuid.uuid4().hex[:5].upper()}"
    new_inc["timestamp"] = datetime.utcnow().isoformat()
    new_inc["status"] = "Resolved"
    new_inc["vital_summary"] = {"peak_hr": 124, "avg_spo2": "97%", "bp": "122/82"}
    new_inc["responder_eta"] = "4.0 mins"
    
    db["incidents"].insert(0, new_inc)
    save_db(db)
    return new_inc

@app.get("/api/contacts")
def get_contacts():
    db = load_db()
    return db.get("contacts", [])

@app.post("/api/contacts")
def add_contact(contact: Contact):
    db = load_db()
    new_c = contact.dict()
    new_c["id"] = f"c{len(db.get('contacts', [])) + 1}"
    db["contacts"].append(new_c)
    save_db(db)
    return new_c

@app.post("/api/contacts/alert")
def alert_contacts(payload: dict):
    db = load_db()
    contacts = db.get("contacts", [])
    notified = [c["name"] for c in contacts if c.get("notify_on_sos")]
    
    return {
        "status": "SOS_DISPATCHED",
        "notified_contacts": notified,
        "count": len(notified),
        "gps_payload": payload.get("location", "37.7749° N, 122.4194° W"),
        "medical_id_attached": True,
        "sms_gateway": "Twilio / EchoAid Encrypted Mesh",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/api/profile")
def get_profile():
    db = load_db()
    return db.get("profile", {})

@app.put("/api/profile")
def update_profile(prof: ProfileUpdate):
    db = load_db()
    db["profile"] = prof.dict()
    save_db(db)
    return db["profile"]

@app.get("/api/settings")
def get_settings():
    db = load_db()
    return db.get("settings", {})

@app.put("/api/settings")
def update_settings(settings: dict):
    db = load_db()
    db["settings"] = settings
    save_db(db)
    return db["settings"]

load_dotenv()

AGORA_APP_ID = os.getenv("AGORA_APP_ID")
AGORA_CUSTOMER_ID = os.getenv("AGORA_CUSTOMER_ID")
AGORA_CUSTOMER_SECRET = os.getenv("AGORA_CUSTOMER_SECRET")
AGORA_PIPELINE_ID = os.getenv("AGORA_PIPELINE_ID")
AGORA_APP_CERTIFICATE = os.getenv("AGORA_APP_CERTIFICATE")
print("[AGORA INIT] APP ID =", AGORA_APP_ID)
print("[AGORA INIT] CERT =", AGORA_APP_CERTIFICATE)
print("[AGORA INIT] CUSTOMER ID =", AGORA_CUSTOMER_ID)
print("[AGORA INIT] PIPELINE ID =", AGORA_PIPELINE_ID)

class AgoraJoinRequest(BaseModel):
    channel: Optional[str] = "echoaid-room"
    uid: Optional[int] = 10002
    mode: Optional[str] = "incident"

INCIDENT_COMMANDER_SYSTEM_PROMPT = """
You are EchoAid X, a single highly capable conversational AI assistant whose primary superpower is being a real-time Incident Commander for live operational & technical war rooms.

You participate in live technical, operational, and general conversations, maintaining shared situational awareness while seamlessly handling real-world inquiries.

PRIMARY SPECIALIZATION — INCIDENT COMMANDER INTELLIGENCE:
1. When the conversation is about an incident or technical outage, extract confirmed facts, hypotheses, decisions, action items, owners, unresolved questions, conflicting information, and timeline events.
2. Never present assumptions as confirmed facts, and never invent root causes or metrics.
3. Recognize participant roles: Incident Commander, Backend Engineer, Frontend Engineer, SRE, DevOps Engineer, Platform Engineer, Infrastructure Engineer, Security Engineer, Support Engineer, Product Manager, Engineering Manager, Business Lead, Customer Support, Observer.
4. Distinguish facts from hypotheses (e.g., "That's currently a hypothesis; deployment causation is not yet confirmed.").
5. Flag conflicting statements without picking sides arbitrarily.
6. Propose mitigations (rollbacks, restarts), but NEVER pretend to execute critical actions without explicit human approval.

GENERAL REAL-WORLD & CONVERSATIONAL CAPABILITY:
1. Answer general knowledge, tech explanations, coding questions, brainstorming, and everyday questions naturally.
2. JOKES & HUMOR: Tell diverse, funny, appropriate jokes when requested (and different jokes when asked for another one).
3. TROUBLESHOOTING: Provide 1 clear isolation step + 1 targeted question when a problem is reported (e.g. Wi-Fi, network, system).
4. USER-TRIGGERED MEDICAL INQUIRIES: If the user asks an educational medical/first-aid question (e.g. "What is dehydration?"), answer informatively. NEVER spontaneously start medical triage ("Is patient breathing?") unless the user explicitly reports an active medical crisis.
5. LOCATION & WEATHER: If asked for weather or nearby places without location, politely ask for the city or neighborhood.
6. NEVER USE BLANKET REFUSALS: Never say "I only handle incidents", "I don't have search options", or "I have no knowledge".

BILINGUAL HINDI + ENGLISH & HINGLISH:
- Match the user's language and dialect naturally (English -> English, Hindi -> natural Hindi, Hinglish -> natural Indian Hinglish).
- Do not use rigid textbook Hindi or robotic machine translations.

CRITICAL CONVERSATIONAL TIMING RULE:
- Your initial greeting has ALREADY been spoken automatically by the voice system.
- DO NOT repeat or re-state your greeting.
- DO NOT speak spontaneously upon joining.
- Wait silently for a human participant to speak or ask a question before generating any response.

TONE: Calm, intelligent, concise, and natural.
""".strip()

MEDICAL_EMERGENCY_SYSTEM_PROMPT = (
    "You are EchoAid X Incident Commander AI.\n"
    "Participate calmly in the live incident room and respond naturally."
)

current_echoaid_agent_id: Optional[str] = None
last_join_timestamp: float = 0.0
last_join_mode: Optional[str] = None
agent_join_lock = threading.Lock()

@app.post("/api/agora/join")
def join_agora(req: Optional[AgoraJoinRequest] = None):
    global current_echoaid_agent_id, last_join_timestamp, last_join_mode
    with agent_join_lock:
        try:
            channel_name = req.channel if req and req.channel else "echoaid-room"
            agent_uid = 10001
            user_uid = req.uid if req and req.uid else 10002
            mode = req.mode if req and req.mode else "incident"

            # Deduplication: if the exact same agent was created in the last 20 seconds, do not recreate
            now = time.time()
            if current_echoaid_agent_id and (now - last_join_timestamp) < 20.0 and last_join_mode == mode:
                print(f"[AGORA AGENT] Reusing active agent session {current_echoaid_agent_id} (joined {now - last_join_timestamp:.1f}s ago)")
                return {
                    "status": "already_running",
                    "agent_id": current_echoaid_agent_id,
                    "channel": channel_name,
                    "agent_uid": agent_uid
                }

            selected_prompt = MEDICAL_EMERGENCY_SYSTEM_PROMPT if mode == "medical" else INCIDENT_COMMANDER_SYSTEM_PROMPT
            
            if not AGORA_APP_ID or not AGORA_CUSTOMER_ID or not AGORA_CUSTOMER_SECRET or not AGORA_PIPELINE_ID:
                raise HTTPException(
                    status_code=500,
                    detail="Agora environment variables (AGORA_APP_ID, AGORA_CUSTOMER_ID, AGORA_CUSTOMER_SECRET, AGORA_PIPELINE_ID) are missing."
                )

            expiration = 3600
            current_timestamp = int(time.time())
            privilege_expire = current_timestamp + expiration

            agent_token = ""
            if AGORA_APP_CERTIFICATE:
                agent_token = RtcTokenBuilder.buildTokenWithUid(
                    AGORA_APP_ID,
                    AGORA_APP_CERTIFICATE,
                    channel_name,
                    agent_uid,
                    1,
                    privilege_expire
                )

            print("[AGORA DEBUG] join requested")
            print(f"[AGORA DEBUG] channel = {channel_name}")
            print(f"[AGORA DEBUG] user_uid = {user_uid}")
            print(f"[AGORA DEBUG] agent_uid = {agent_uid}")
            print(f"[AGORA DEBUG] pipeline_id = {AGORA_PIPELINE_ID}")
            print("[AGORA DEBUG] agent token generated = true")
            print(f"[AGORA DEBUG] token uid = {agent_uid}")
            print(f"[AGORA TOKEN] AGENT token UID = {agent_uid}")
            print(f"[AGORA TOKEN] AGENT channel = {channel_name}")
            print(f"[AGORA PAYLOAD]\nchannel={channel_name}\nagent_rtc_uid={agent_uid}\nremote_rtc_uids=*\ntoken_present=true\npipeline_id={AGORA_PIPELINE_ID}")

            auth = base64.b64encode(
                f"{AGORA_CUSTOMER_ID}:{AGORA_CUSTOMER_SECRET}".encode()
            ).decode()
            headers = {
                "Authorization": f"Basic {auth}",
                "Content-Type": "application/json"
            }

            # Terminate previous agent session ONLY if switching between modes (medical <-> incident)
            if current_echoaid_agent_id and last_join_mode is not None and last_join_mode != mode:
                try:
                    leave_url = f"https://api.agora.io/api/conversational-ai-agent/v2/projects/{AGORA_APP_ID}/agents/{current_echoaid_agent_id}/leave"
                    requests.post(leave_url, headers=headers, timeout=5)
                    print(f"[AGORA AGENT] Mode switched from {last_join_mode} to {mode}. Terminated previous agent session: {current_echoaid_agent_id}")
                except Exception as leave_err:
                    print(f"[AGORA AGENT WARNING] Error leaving previous agent session: {leave_err}")

            url = f"https://api.agora.io/api/conversational-ai-agent/v2/projects/{AGORA_APP_ID}/join"

            greeting_text = (
                "EchoAid emergency assistant is ready. Tell me what is happening." 
                if mode == "medical" 
                else "EchoAid Incident Commander is online. Tell me what is happening."
            )

            payload = {
                "name": channel_name,
                "pipeline_id": AGORA_PIPELINE_ID,
                "properties": {
                    "channel": channel_name,
                    "token": agent_token,
                    "agent_rtc_uid": str(agent_uid),
                    "remote_rtc_uids": ["*"],
                    "llm": {
                        "system_messages": [
                            {
                                "role": "system",
                                "content": selected_prompt
                            }
                        ],
                        "greeting_message": greeting_text
                    }
                }
            }

            sanitized_payload = {
                "name": channel_name,
                "pipeline_id": AGORA_PIPELINE_ID,
                "properties": {
                    "channel": channel_name,
                    "token": "[PROTECTED_AGENT_RTC_TOKEN]",
                    "agent_rtc_uid": str(agent_uid),
                    "remote_rtc_uids": ["*"],
                    "llm": {
                        "system_messages": [
                            {
                                "role": "system",
                                "content": selected_prompt
                            }
                        ],
                        "greeting_message": greeting_text
                    }
                }
            }

            print("\n========== AGORA AGENT JOIN REQUEST ==========")
            print("URL:", url)
            print("HEADERS: Authorization: Basic [PROTECTED]")
            print("SANITIZED PAYLOAD (Sent to Agora API):")
            print(json.dumps(sanitized_payload, indent=4))
            print("==============================================\n")

            print(f"[VOICE LOOP] 07 RESPONSE_SENT_TO_AGORA channel={channel_name} mode={mode} agent_uid={agent_uid}")
            response = requests.post(
                url,
                headers=headers,
                json=payload,
                timeout=10
            )

            # Handle 409 TaskConflict: reuse existing active agent session without creating an overlapping duplicate
            if response.status_code == 409:
                conflict_agent_id = None
                try:
                    conflict_agent_id = response.json().get("agent_id")
                except Exception:
                    pass
                
                if conflict_agent_id:
                    print(f"[AGORA AGENT] 409 TaskConflict detected. Reusing existing active agent: {conflict_agent_id}")
                    current_echoaid_agent_id = conflict_agent_id
                    last_join_timestamp = time.time()
                    last_join_mode = mode
                    return {
                        "status": "RUNNING",
                        "agent_id": conflict_agent_id,
                        "channel": channel_name,
                        "agent_uid": agent_uid,
                        "appId": AGORA_APP_ID
                    }

            print("STATUS CODE:", response.status_code)
            try:
                resp_data = response.json()
            except Exception:
                resp_data = {"raw": response.text}

            agent_id = resp_data.get("agent_id") if isinstance(resp_data, dict) else "N/A"
            agent_status = resp_data.get("status") if isinstance(resp_data, dict) else "UNKNOWN"

            if agent_id and agent_id != "N/A":
                current_echoaid_agent_id = agent_id
                last_join_timestamp = time.time()
                last_join_mode = mode

            print(f"[AGORA DEBUG] Agora create response status = {response.status_code}")
            print(f"[AGORA DEBUG] agent_id = {agent_id}")
            print(f"[AGORA DEBUG] agent status = {agent_status}")
            print(f"[AGORA AGENT STATE]\nagent_id={agent_id}\nstatus={agent_status}\nrtc_channel={channel_name}\nrtc_uid={agent_uid}\nmessage=ok")
            print(f"[VOICE LOOP] 08 AGORA_AGENT_RESPONSE_RECEIVED status={response.status_code} agent_id={agent_id} agent_status={agent_status}")

            if agent_id and agent_id != "N/A" and response.status_code == 200:
                status_url = f"https://api.agora.io/api/conversational-ai-agent/v2/projects/{AGORA_APP_ID}/agents/{agent_id}"
                for check_idx in range(1, 4):
                    try:
                        time.sleep(0.5)
                        st_resp = requests.get(status_url, headers=headers, timeout=5)
                        if st_resp.ok:
                            st_json = st_resp.json()
                            curr_st = st_json.get("status", "UNKNOWN")
                            print(f"[AGENT RTC] status check #{check_idx} = {curr_st}")
                            if curr_st == "RUNNING":
                                resp_data["status"] = "RUNNING"
                                break
                            elif curr_st in ["FAILED", "STOPPED"]:
                                print(f"[AGENT RTC ERROR] status={curr_st} reason={st_json.get('message', 'UNKNOWN')}")
                                break
                    except Exception as poll_err:
                        print(f"[AGENT RTC] Poll check #{check_idx} error: {poll_err}")

            if response.status_code >= 400:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=resp_data
                )

            if isinstance(resp_data, dict):
                resp_data["agent_uid"] = agent_uid
                resp_data["channel"] = channel_name
                resp_data["appId"] = AGORA_APP_ID
            return resp_data

        except HTTPException:
            raise
        except Exception as e:
            import traceback
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/agora/token")
def generate_agora_token(channel: Optional[str] = "echoaid-room", uid: Optional[int] = 10002):
    import traceback

    try:
        channel_name = channel or "echoaid-room"
        user_uid = uid or 10002

        if not AGORA_APP_ID:
            raise HTTPException(status_code=500, detail="AGORA_APP_ID is missing")

        expiration = 3600
        current_timestamp = int(time.time())
        privilege_expire = current_timestamp + expiration

        token = ""
        if AGORA_APP_CERTIFICATE:
            token = RtcTokenBuilder.buildTokenWithUid(
                AGORA_APP_ID,
                AGORA_APP_CERTIFICATE,
                channel_name,
                user_uid,
                1,
                privilege_expire
            )

        print(f"[AGORA TOKEN] USER token UID = {user_uid}")
        print(f"[AGORA TOKEN] USER channel = {channel_name}")
        print("[AGORA TOKEN] user_token_generated = true")

        return {
            "token": token,
            "channel": channel_name,
            "uid": user_uid,
            "appId": AGORA_APP_ID
        }
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# ==========================================
# ECHOAID X INCIDENT COMMANDER ENDPOINTS
# ==========================================

class CreateIncidentReq(BaseModel):
    title: str
    description: str
    severity: Optional[str] = "SEV-1"
    incidentCommander: Optional[str] = "Neha"

class UpdateIncidentReq(BaseModel):
    status: Optional[str] = None
    severity: Optional[str] = None
    incidentCommander: Optional[str] = None
    impact: Optional[str] = None

class TranscriptSegmentReq(BaseModel):
    speaker: str
    speakerRole: Optional[str] = "Backend Engineer"
    text: str

class ResolveConflictReq(BaseModel):
    resolutionChoice: str
    confirmedValue: str

class UpdateActionItemReq(BaseModel):
    status: Optional[str] = None
    ownerName: Optional[str] = None
    ownerRole: Optional[str] = None

import asyncio
from fastapi.responses import StreamingResponse

subscribers: List[asyncio.Queue] = []

def broadcast_update_sync(incident_data: dict):
    """Synchronous helper to push updates to SSE subscribers."""
    json_str = json.dumps(incident_data)
    for q in list(subscribers):
        try:
            q.put_nowait(json_str)
        except Exception:
            if q in subscribers:
                subscribers.remove(q)

@app.get("/api/incidents/{incident_id}/stream")
async def stream_incident_updates(incident_id: str):
    """Real-time Server-Sent Events (SSE) stream for incident updates."""
    queue = asyncio.Queue()
    subscribers.append(queue)

    async def event_generator():
        try:
            inc = incident_engine.get_incident(incident_id)
            if inc:
                yield f"data: {json.dumps(inc)}\n\n"
            while True:
                data = await queue.get()
                yield f"data: {data}\n\n"
        except asyncio.CancelledError:
            if queue in subscribers:
                subscribers.remove(queue)

    return StreamingResponse(event_generator(), media_type="text/event-stream")

@app.get("/api/incidents")
def list_incidents():
    return incident_engine.list_incidents()

@app.post("/api/incidents")
def create_incident(req: CreateIncidentReq):
    return incident_engine.create_incident(
        title=req.title,
        description=req.description,
        severity=req.severity or "SEV-1",
        incident_commander=req.incidentCommander or "Neha"
    )

@app.get("/api/incidents/demo")
@app.post("/api/incidents/demo/start")
def start_demo_incident():
    demo = incident_engine.start_demo_scenario()
    broadcast_update_sync(demo)
    return demo

@app.get("/api/incidents/{incident_id}")
def get_incident(incident_id: str):
    inc = incident_engine.get_incident(incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    return inc

@app.post("/api/incidents/{incident_id}/reset")
def reset_incident(incident_id: str):
    fresh = incident_engine.reset_incident(incident_id)
    broadcast_update_sync(fresh)
    return fresh

@app.patch("/api/incidents/{incident_id}")
def update_incident(incident_id: str, req: UpdateIncidentReq):
    updates = {k: v for k, v in req.dict().items() if v is not None}
    updated = incident_engine.update_incident(incident_id, updates)
    if not updated:
        raise HTTPException(status_code=404, detail="Incident not found")
    broadcast_update_sync(updated)
    return updated

@app.post("/api/incidents/{incident_id}/transcript")
def process_transcript(incident_id: str, req: TranscriptSegmentReq):
    print(f"[VOICE LOOP] 05 AI_PROCESSING_STARTED incident={incident_id} text='{req.text}'")
    inc_context = incident_engine.get_incident(incident_id) or {}
    
    ai_extracted = nvidia_client.analyze_incident_statement(
        text=req.text,
        speaker=req.speaker,
        speaker_role=req.speakerRole or "Observer",
        incident_context=inc_context
    )
    print(f"[VOICE LOOP] 06 AI_RESPONSE_CREATED summary='{ai_extracted.get('aiSummarySpoken', '')}'")
    
    updated_inc = incident_engine.add_transcript_segment(
        incident_id=incident_id,
        speaker=req.speaker,
        speaker_role=req.speakerRole or "Observer",
        text=req.text,
        ai_analysis=ai_extracted
    )
    print(f"[TRANSCRIPT] received for incident {incident_id}")
    print(f"[TRANSCRIPT] speaker: {req.speaker} ({req.speakerRole})")
    print(f"[TRANSCRIPT] text: '{req.text}'")
    print("[INCIDENT] Transcript stored")
    broadcast_update_sync(updated_inc)
    print("[INCIDENT STREAM] Transcript published")
    return {
        "incident": updated_inc,
        "aiExtracted": ai_extracted
    }

class AgoraTranscriptWebhookReq(BaseModel):
    incidentId: Optional[str] = "INC-2048"
    speaker: Optional[str] = "Participant"
    speakerRole: Optional[str] = "Observer"
    text: str
    confidence: Optional[float] = 0.95
    timestamp: Optional[str] = None
    source: Optional[str] = "agora"

@app.post("/api/agora/webhook")
@app.post("/api/agora/transcript")
def agora_transcript_webhook(req: AgoraTranscriptWebhookReq):
    print("[AGORA WEBHOOK] Received")
    print(f"[AGORA TRANSCRIPT] text received: '{req.text}'")
    print(f"[AGORA TRANSCRIPT] speaker/uid: {req.speaker} ({req.speakerRole})")

    incident_id = req.incidentId or "INC-2048"
    inc_context = incident_engine.get_incident(incident_id) or {}

    ai_extracted = nvidia_client.analyze_incident_statement(
        text=req.text,
        speaker=req.speaker or "Participant",
        speaker_role=req.speakerRole or "Observer",
        incident_context=inc_context
    )

    updated_inc = incident_engine.add_transcript_segment(
        incident_id=incident_id,
        speaker=req.speaker or "Participant",
        speaker_role=req.speakerRole or "Observer",
        text=req.text,
        ai_analysis=ai_extracted
    )

    print("[INCIDENT] Transcript stored")
    broadcast_update_sync(updated_inc)
    print("[INCIDENT STREAM] Transcript published")

    return {
        "status": "success",
        "incident": updated_inc,
        "aiExtracted": ai_extracted
    }

@app.get("/api/incidents/{incident_id}/facts")
def get_facts(incident_id: str):
    inc = incident_engine.get_incident(incident_id)
    return inc.get("facts", []) if inc else []

@app.get("/api/incidents/{incident_id}/hypotheses")
def get_hypotheses(incident_id: str):
    inc = incident_engine.get_incident(incident_id)
    return inc.get("hypotheses", []) if inc else []

@app.get("/api/incidents/{incident_id}/decisions")
def get_decisions(incident_id: str):
    inc = incident_engine.get_incident(incident_id)
    return inc.get("decisions", []) if inc else []

@app.get("/api/incidents/{incident_id}/actions")
def get_actions(incident_id: str):
    inc = incident_engine.get_incident(incident_id)
    return inc.get("actions", []) if inc else []

@app.get("/api/incidents/{incident_id}/timeline")
def get_timeline(incident_id: str):
    inc = incident_engine.get_incident(incident_id)
    return inc.get("timeline", []) if inc else []

@app.post("/api/incidents/{incident_id}/conflicts/{conflict_id}/resolve")
def resolve_conflict(incident_id: str, conflict_id: str, req: ResolveConflictReq):
    updated = incident_engine.resolve_conflict(incident_id, conflict_id, req.resolutionChoice, req.confirmedValue)
    if not updated:
        raise HTTPException(status_code=404, detail="Conflict or Incident not found")
    broadcast_update_sync(updated)
    return updated

@app.post("/api/incidents/{incident_id}/critical-actions/{action_id}/approve")
def approve_critical_action(incident_id: str, action_id: str):
    updated = incident_engine.approve_critical_action(incident_id, action_id)
    if not updated:
        raise HTTPException(status_code=404, detail="Critical action not found")
    broadcast_update_sync(updated)
    return updated

@app.post("/api/incidents/{incident_id}/critical-actions/{action_id}/reject")
def reject_critical_action(incident_id: str, action_id: str):
    updated = incident_engine.reject_critical_action(incident_id, action_id)
    if not updated:
        raise HTTPException(status_code=404, detail="Critical action not found")
    broadcast_update_sync(updated)
    return updated

@app.patch("/api/incidents/{incident_id}/actions/{action_id}")
def update_action_item(incident_id: str, action_id: str, req: UpdateActionItemReq):
    updates = {k: v for k, v in req.dict().items() if v is not None}
    updated = incident_engine.update_action_item(incident_id, action_id, updates)
    if not updated:
        raise HTTPException(status_code=404, detail="Action item not found")
    broadcast_update_sync(updated)
    return updated

@app.post("/api/incidents/{incident_id}/report")
def generate_report(incident_id: str):
    return incident_engine.generate_incident_report(incident_id)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)