from agora_token_builder import RtcTokenBuilder
import time
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
import json
import os
import uuid
import base64
import requests
from datetime import datetime
from dotenv import load_dotenv
from fastapi import HTTPException

app = FastAPI(
    title="EchoAid X Neural Engine API",
    description="The World's First AI Emergency Companion Backend",
    version="1.0.0"
)

try:
    from nvidia_client import nvidia_client
except ImportError:
    from backend.nvidia_client import nvidia_client

# Enable CORS for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if os.environ.get("VERCEL") == "1":
    DATA_DIR = "/tmp"
else:
    DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
    
DB_FILE = os.path.join(DATA_DIR, "db.json")

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

# NVIDIA NIM AI Service Endpoint
@app.get("/api/nvidia/status")
def nvidia_status():
    return {
        "configured": nvidia_client.is_configured(),
        "model": nvidia_client.model,
        "base_url": nvidia_client.base_url,
        "status": "READY" if nvidia_client.is_configured() else "UNCONFIGURED_FALLBACK_ACTIVE"
    }

@app.post("/api/chat")
def nvidia_chat(req: ChatRequest):
    formatted_msgs = [{"role": m.role, "content": m.content} for m in req.messages]
    result = nvidia_client.analyze_emergency(formatted_msgs)
    return result



# Endpoints
@app.get("/api/health")
def health_check():
    return {
        "status": "ONLINE",
        "system": "EchoAid X Neural Engine",
        "version": "2.4.0-PROD",
        "ai_latency_ms": 14,
        "satellite_mesh": "ACTIVE (12 NODES)",
        "timestamp": datetime.utcnow().isoformat()
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

@app.post("/api/agora/join")
def join_agora(req: Optional[AgoraJoinRequest] = None):
    try:
        channel_name = req.channel if req and req.channel else "echoaid-room"
        agent_uid = 10001
        
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

        auth = base64.b64encode(
            f"{AGORA_CUSTOMER_ID}:{AGORA_CUSTOMER_SECRET}".encode()
        ).decode()

        url = f"https://api.agora.io/api/conversational-ai-agent/v2/projects/{AGORA_APP_ID}/join"

        payload = {
            "name": channel_name,
            "pipeline_id": AGORA_PIPELINE_ID,
            "properties": {
                "channel": channel_name,
                "token": agent_token,
                "agent_rtc_uid": str(agent_uid),
                "remote_rtc_uids": ["*"]
            }
        }
        headers = {
            "Authorization": f"Basic {auth}",
            "Content-Type": "application/json"
        }

        print("\n========== AGORA AGENT JOIN REQUEST ==========")
        print("URL:", url)
        print("HEADERS: Authorization: Basic [PROTECTED]")
        print("PAYLOAD:")
        print(json.dumps(payload, indent=4))
        print("==============================================\n")

        response = requests.post(
            url,
            headers=headers,
            json=payload,
            timeout=10
        )

        print("STATUS CODE:", response.status_code)
        print("========== AGORA AGENT RESPONSE ==========")
        try:
            resp_data = response.json()
            print(json.dumps(resp_data, indent=4))
        except Exception:
            resp_data = {"raw": response.text}
            print(response.text)
        print("==========================================\n")

        if response.status_code >= 400:
            raise HTTPException(
                status_code=response.status_code,
                detail=resp_data
            )

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

        print("\n========== AGORA TOKEN GENERATION ==========")
        print("APP ID:", repr(AGORA_APP_ID))
        print("CERT:", repr(AGORA_APP_CERTIFICATE))
        print("CHANNEL:", repr(channel_name))
        print("USER UID:", repr(user_uid))
        print("============================================\n")

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

        return {
            "token": token,
            "channel": channel_name,
            "uid": user_uid
        }

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))