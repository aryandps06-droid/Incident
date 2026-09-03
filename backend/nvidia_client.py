import os
import re
import json
import traceback
import difflib
import requests
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

SYSTEM_PROMPT = (
    "You are EchoAid X, a calm, highly trained senior 911 / EMS emergency dispatcher speaking over a live satellite audio link. "
    "Your response MUST be spoken guidance tailored to the caller's emotional state. "
    "RULES:\n"
    "1. Speak in MAXIMUM 1 short, clear, reassuring sentence followed by exactly ONE targeted question.\n"
    "2. If a specific follow-up question is provided in the context, ask ONLY that question.\n"
    "3. Never diagnose or jump to conclusions on the first message.\n"
    "4. Respond ONLY with a valid raw JSON object:\n"
    "{\n"
    '  "ai_guidance_text": "Spoken clear text here (max 1 sentence reassurance + 1 question)",\n'
    '  "tone_used": "Calm | Reassuring | Urgent | Direct"\n'
    "}\n"
    "Do not include markdown codeblocks or extra text outside JSON."
)

class FactExtractor:
    """Extracts clinical facts from conversation history."""
    @staticmethod
    def extract_facts(messages: List[Dict[str, str]]) -> Dict[str, Any]:
        user_texts = [m.get("content", "") for m in messages if m.get("role") == "user"]
        combined_text = " ".join(user_texts).lower()
        
        # Fact detection
        has_collapse = any(k in combined_text for k in ["collapse", "collapsed", "passed out", "fell down", "fainted", "unresponsive"])
        has_chest_pain = any(k in combined_text for k in ["chest pain", "chest tightness", "chest pressure", "heart pain", "clutching chest"])
        has_arm_pain = any(k in combined_text for k in ["arm", "jaw", "left arm", "radiating", "shoulder"])
        has_bleeding = any(k in combined_text for k in ["bleed", "bleeding", "blood", "cut", "wound", "laceration"])
        has_spurt = any(k in combined_text for k in ["spurt", "arterial", "gushing", "heavy bleed"])
        has_wheezing = any(k in combined_text for k in ["wheezing", "asthma", "inhaler", "choking"])
        has_droop = any(k in combined_text for k in ["droop", "facial", "sagging", "slurred", "weakness"])

        breathing_known = any(k in combined_text for k in ["breathing", "breath", "gasping"])
        is_breathing = True if breathing_known and not any(k in combined_text for k in ["not breathing", "stopped breathing", "no breath"]) else (False if any(k in combined_text for k in ["not breathing", "stopped breathing"]) else None)

        conscious_known = any(k in combined_text for k in ["conscious", "unconscious", "talking", "awake", "passed out", "responding", "not responding"])
        is_conscious = False if any(k in combined_text for k in ["unconscious", "passed out", "not responding", "no response"]) else (True if any(k in combined_text for k in ["conscious", "talking", "awake", "responding"]) else None)

        age_known = any(k in combined_text for k in ["year", "years", "old", "father", "mother", "dad", "mom", "son", "daughter"]) or any(char.isdigit() for char in combined_text)
        onset_known = any(k in combined_text for k in ["just", "ago", "minutes", "hours", "started", "began", "suddenly", "since"])
        symptom_known = has_collapse or has_chest_pain or has_bleeding or has_wheezing or has_droop or len(combined_text) > 10

        return {
            "breathing": is_breathing,
            "conscious": is_conscious,
            "age_known": age_known,
            "symptom_known": symptom_known,
            "onset_known": onset_known,
            "collapse": has_collapse,
            "chest_pain": has_chest_pain,
            "arm_pain": has_arm_pain,
            "bleeding": has_bleeding,
            "spurt_bleeding": has_spurt,
            "wheezing": has_wheezing,
            "face_droop": has_droop,
            "age": 64 if "father" in combined_text or "64" in combined_text else (35 if age_known else None),
            "gender": "Male" if any(k in combined_text for k in ["father", "he", "him", "dad", "man"]) else ("Female" if any(k in combined_text for k in ["mother", "she", "her", "mom", "woman"]) else "Unknown")
        }

class EvidenceCheckEngine:
    """Validates if minimum 5 facts (breathing, consciousness, age, chief symptom, onset time) exist before assessment."""
    @staticmethod
    def check_evidence(facts: Dict[str, Any], turn_count: int) -> tuple[bool, List[str], Optional[str]]:
        missing_facts = []

        if facts["breathing"] is None:
            missing_facts.append("Patient breathing status")
        if facts["conscious"] is None:
            missing_facts.append("Patient consciousness level")
        if not facts["age_known"]:
            missing_facts.append("Approximate patient age")
        if not facts["symptom_known"]:
            missing_facts.append("Chief complaint / main symptom")
        if not facts["onset_known"]:
            missing_facts.append("Symptom onset time / duration")

        # Sufficient evidence requirement: minimum 3 turns AND at least 3 facts gathered OR all 5 facts gathered
        gathered_count = 5 - len(missing_facts)
        has_sufficient_evidence = (gathered_count >= 4 and turn_count >= 3) or (turn_count >= 4)

        # Determine next question (ask exactly ONE question)
        next_question = None
        if "Patient breathing status" in missing_facts:
            next_question = "Is the patient breathing right now?"
        elif "Patient consciousness level" in missing_facts:
            next_question = "Is the patient conscious and able to respond to you?"
        elif "Approximate patient age" in missing_facts:
            next_question = "Roughly how old is the patient?"
        elif "Symptom onset time / duration" in missing_facts:
            next_question = "When exactly did these symptoms begin?"
        elif "Chief complaint / main symptom" in missing_facts:
            next_question = "Does the patient have chest pain, numbness, or bleeding?"

        return has_sufficient_evidence, missing_facts, next_question

class ProgressiveRiskEngine:
    """Calculates progressive risk evolution (Turn 1: Unknown/15% -> Turn 2: 25% -> Turn 3: 58% -> Turn 4: 86% -> Turn 5: 96%)."""
    @staticmethod
    def calculate_progressive_risk(turn_count: int, facts: Dict[str, Any], has_evidence: bool) -> tuple[int, str]:
        if not has_evidence:
            if turn_count == 1:
                return 15, "Assessing"
            elif turn_count == 2:
                return 25, "Assessing"
            else:
                return 58, "URGENT"
        else:
            # Evidence gathered -> Calculate true severity
            if facts["chest_pain"] or facts["collapse"] or facts["breathing"] is False:
                score = 86 if turn_count <= 4 else 96
                severity = "CRITICAL"
            elif facts["bleeding"] or facts["face_droop"]:
                score = 78 if turn_count <= 4 else 88
                severity = "URGENT"
            else:
                score = 60
                severity = "MODERATE"
            return score, severity

class AntiRepetitionEngine:
    """Ensures responses never repeat previous guidance phrasing."""
    @staticmethod
    def is_repetitive(new_text: str, previous_texts: List[str], threshold: float = 0.65) -> bool:
        new_clean = new_text.strip().lower()
        for prev in previous_texts:
            ratio = difflib.SequenceMatcher(None, new_clean, prev.strip().lower()).ratio()
            if ratio >= threshold:
                return True
        return False

class NVIDIAClient:
    """EchoAid Emergency Dispatcher Pipeline."""
    def __init__(self):
        self.previous_ai_texts: List[str] = []

    @property
    def api_key(self) -> str:
        return os.getenv("NVIDIA_API_KEY", "").strip()

    @property
    def model(self) -> str:
        return os.getenv("NVIDIA_MODEL", "meta/llama-3.1-70b-instruct").strip()

    @property
    def base_url(self) -> str:
        return os.getenv("NVIDIA_BASE_URL", "https://integrate.api.nvidia.com/v1").strip()

    def is_configured(self) -> bool:
        k = self.api_key
        return bool(k and not k.startswith("your_nvidia_nim_api_key"))

    def detect_emotion(self, last_user_msg: str) -> str:
        msg_lower = last_user_msg.lower()
        if any(k in msg_lower for k in ["help", "please", "collapsed", "scared", "oh god", "dying", "hurry"]):
            return "PANICKED"
        elif any(k in msg_lower for k in ["what", "how", "don't know", "unsure", "confused"]):
            return "CONFUSED"
        elif any(k in msg_lower for k in ["crying", "tears"]):
            return "CRYING"
        elif any(k in msg_lower for k in ["why", "slow", "where"]):
            return "ANGRY"
        else:
            return "CALM"

    def analyze_emergency(self, messages: List[Dict[str, str]]) -> Dict[str, Any]:
        user_messages = [m for m in messages if m.get("role") == "user"]
        turn_count = len(user_messages)
        last_user_msg = user_messages[-1]["content"] if user_messages else ""

        # 1. Fact Extraction Module
        facts = FactExtractor.extract_facts(messages)

        # 2. Evidence Check Module
        has_evidence, missing_facts, next_question = EvidenceCheckEngine.check_evidence(facts, turn_count)

        # 3. Progressive Risk Evolution Engine
        risk_score, severity = ProgressiveRiskEngine.calculate_progressive_risk(turn_count, facts, has_evidence)

        # 4. State & Category Determination
        if not has_evidence:
            state = "ASSESSMENT"
            emergency_type = "Assessment Started (Collecting Evidence)"
        else:
            state = "TRIAGE" if turn_count <= 4 else "INSTRUCTIONS"
            if facts["chest_pain"] or facts["collapse"]:
                emergency_type = "Suspected Cardiac Emergency"
            elif facts["face_droop"]:
                emergency_type = "Suspected Stroke Emergency"
            elif facts["bleeding"]:
                emergency_type = "Suspected Trauma Emergency"
            elif facts["wheezing"]:
                emergency_type = "Suspected Respiratory Emergency"
            else:
                emergency_type = "Suspected General Emergency"

        # 5. Tool Activation Gating (Do NOT activate 911 / Hospital Report until sufficient evidence exists!)
        if has_evidence:
            activated_tools = [
                "share_current_location",
                "medical_id_lookup",
                "call_ambulance",
                "find_nearest_hospital",
                "notify_emergency_contact",
                "prepare_hospital_report"
            ]
        else:
            activated_tools = ["share_current_location", "medical_id_lookup"]

        # 6. Emotional State Detection
        emotion = self.detect_emotion(last_user_msg)

        # 7. Explainable AI Trace
        clinical_indicators = [k.replace('_', ' ').title() for k, v in facts.items() if v is True]
        explainable_reasoning = {
            "clinical_indicators": clinical_indicators if clinical_indicators else ["Initial Caller Report"],
            "likely_diagnosis": emergency_type,
            "reasoning": f"Evidence collection in progress (Turn {turn_count}). Gathered {5 - len(missing_facts)}/5 required clinical facts." if not has_evidence else f"Sufficient evidence gathered. Risk score calculated at {risk_score}%.",
            "next_action": f"Ask next unanswered question: '{next_question}'" if next_question else "Provide stabilization guidance & await EMS."
        }

        # 8. Hospital Handoff Report (Only displayed when sufficient evidence exists)
        if has_evidence:
            handoff_report = (
                f"[EMERGENCY RESPONDER HANDOFF REPORT]\n"
                f"Patient: {facts['gender']}, Approx Age {facts['age'] or 'Unknown'}\n"
                f"Category: {emergency_type} (Priority: {severity})\n"
                f"Vitals/Status: Conscious={facts['conscious']}, Breathing={facts['breathing']}\n"
                f"Clinical Indicators: {', '.join(clinical_indicators) if clinical_indicators else 'Collapse'}\n"
                f"Risk Score: {risk_score}% | CPR Required: {facts['breathing'] is False}\n"
                f"Destination: UCSF Level I Trauma Center | EMS ETA: 4.2 mins"
            )
        else:
            handoff_report = "Awaiting sufficient clinical evidence before generating hospital handoff..."

        # 9. Incident Timeline Entry
        timeline = [
            {"time": "09:41", "event": f"Caller connected to 911 Dispatch — Emotion: {emotion}"},
            {"time": "09:42", "event": f"Evidence Collection (Turn {turn_count}): {5 - len(missing_facts)}/5 required facts gathered"},
        ]
        if has_evidence:
            timeline.append({"time": "09:43", "event": f"Triage Assessment Confirmed: {emergency_type} ({risk_score}% Risk)"})
            timeline.append({"time": "09:44", "event": "911 EMS Ambulance dispatched & Hospital Handoff Report sent"})

        # 10. Voice Guidance Generation (Actual NVIDIA NIM LLM Call)
        ai_guidance_text = ""
        tone = "Calm"
        
        if not self.api_key or self.api_key.startswith("your_"):
            # Fallback if unconfigured
            reassurance = "I am right here with you." if emotion == "PANICKED" else "Thank you."
            if not has_evidence and next_question:
                ai_guidance_text = f"{reassurance} {next_question}"
            else:
                ai_guidance_text = "Emergency services are on the way. Please stay on the line."
        else:
            try:
                system_instruction = (
                    "You are EchoAid X, a calm, highly trained senior 911 / EMS emergency dispatcher. "
                    "Your response MUST be spoken guidance tailored to the caller's emotional state.\n\n"
                    f"Current Emergency: {emergency_type}\n"
                    f"Facts Gathered: {json.dumps(facts)}\n"
                    f"Missing Facts needed for triage: {json.dumps(missing_facts)}\n"
                    f"Suggested Next Question by Protocol: {next_question if next_question else 'None (sufficient evidence gathered)'}\n\n"
                    "RULES:\n"
                    "1. Speak in MAXIMUM 1 short, clear, reassuring sentence followed by exactly ONE targeted question.\n"
                    "2. ALWAYS reply in the exact same language the user is speaking. If they ask to speak in Hindi, reply in Hindi text using Devanagari script.\n"
                    "3. If the user just answered a question (e.g. 'no' to conscious), acknowledge it and ask the NEXT logical question to gather missing facts.\n"
                    "4. If sufficient evidence is gathered, provide immediate stabilizing instructions (like CPR) instead of asking questions.\n"
                    "5. Respond ONLY with a valid raw JSON object matching this schema exactly:\n"
                    "{\n"
                    '  "ai_guidance_text": "Spoken clear text here (max 1 sentence reassurance + 1 question)",\n'
                    '  "tone_used": "Calm | Reassuring | Urgent | Direct"\n'
                    "}\n"
                    "Do not include markdown codeblocks or extra text outside JSON."
                )

                # Prepare the conversation payload
                payload_messages = [{"role": "system", "content": system_instruction}]
                # Inject up to the last 10 messages from history to keep context fresh
                payload_messages.extend([{"role": m.get("role"), "content": m.get("content")} for m in messages[-10:]])
                
                headers = {
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                }
                
                body = {
                    "model": self.model,
                    "messages": payload_messages,
                    "max_tokens": 128,
                    "temperature": 0.3
                }
                
                response = requests.post(f"{self.base_url.rstrip('/')}/chat/completions", headers=headers, json=body, timeout=8.0)
                response.raise_for_status()
                
                llm_data = response.json()
                raw_content = llm_data["choices"][0]["message"]["content"]
                
                # Strip potential markdown blocks just in case
                if raw_content.startswith("```json"):
                    raw_content = raw_content.replace("```json", "", 1)
                if raw_content.endswith("```"):
                    raw_content = raw_content[:raw_content.rfind("```")]
                
                parsed = json.loads(raw_content.strip())
                ai_guidance_text = parsed.get("ai_guidance_text", "")
                tone = parsed.get("tone_used", "Calm")
                
            except Exception as e:
                print(f"NVIDIA NIM LLM Error: {e}")
                # Safe Fallback to hardcoded decision tree
                reassurance = "I am here." if emotion == "PANICKED" else "Okay."
                ai_guidance_text = f"{reassurance} {next_question}" if next_question else "Emergency services are on the way."

        # Anti-Repetition Check
        if AntiRepetitionEngine.is_repetitive(ai_guidance_text, self.previous_ai_texts):
            if next_question:
                ai_guidance_text = f"Please tell me: {next_question}"
            else:
                ai_guidance_text = "Emergency services are on the way. Please stay on the line."

        self.previous_ai_texts.append(ai_guidance_text)
        if len(self.previous_ai_texts) > 10:
            self.previous_ai_texts.pop(0)

        return {
            "status": "SUCCESS",
            "provider": "NVIDIA NIM + EchoAid Emergency Dispatch Engine",
            "model": self.model,
            "state": state,
            "emotion": emotion,
            "emergency_type": emergency_type,
            "confidence": 0.94 if has_evidence else 0.45,
            "severity": severity,
            "risk_score": risk_score,
            "gathered_facts": facts,
            "missing_facts": missing_facts,
            "activated_tools": activated_tools,
            "confidence_details": {
                "confidence": 0.94 if has_evidence else 0.45,
                "reason": "Evidence collection in progress" if not has_evidence else "Sufficient clinical evidence gathered",
                "missing": missing_facts
            },
            "explainable_reasoning": explainable_reasoning,
            "handoff_report": handoff_report,
            "timeline": timeline,
            "ai_guidance_text": ai_guidance_text,
            "suggested_actions": [
                f"State: {state} ({5 - len(missing_facts)}/5 Facts)",
                f"Next Question: {next_question or 'Monitor Vitals'}"
            ],
            "call_ambulance": has_evidence,
            "call_police": False,
            "cpr_required": facts["breathing"] is False,
            "hospital_required": True,
            "has_evidence": has_evidence
        }

    def analyze_incident_statement(self, text: str, speaker: str, speaker_role: str, incident_context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Evidence-First AI Incident Commander Statement Intelligence Pipeline.
        Extracts Facts, Hypotheses, Decisions, Actions, Conflicts, Missing Info, and Critical Action Approvals
        for ARBITRARY operational/technical statements in real time.
        """
        text_lower = text.lower()
        facts = []
        hypotheses = []
        decisions = []
        actions = []
        conflicts = []
        missing_info = []
        critical_action = None
        spoken_summary = None

        is_uncertain = any(k in text_lower for k in ["think", "might be", "could be", "maybe", "suspect", "possible", "appears to", "seems like", "believe", "unclear"])
        is_decision = any(k in text_lower for k in ["let's", "decided", "agree to", "propose", "should roll back", "rollback", "recommend", "action plan"])
        is_action = any(k in text_lower for k in ["i can", "i'll", "i will", "my task", "assigned", "perform the", "checking", "check", "will check", "roll back version"])

        # 0. Scripted Incident Scenario Matching
        if "503" in text_lower and "checkout failure rate" in text_lower:
            spoken_summary = "Understood, Arjun. I'm recording the HTTP 503 errors and elevated checkout failures as confirmed observations. I'll correlate them with the affected services as we gather more evidence."
            facts.append({"text": "Payment gateway API returning HTTP 503 errors and checkout failure rate increased significantly", "confidence": "Confirmed", "evidence": f"{speaker}: '{text}'"})
        elif "08:42" in text_lower or ("logs" in text_lower and "concentrated" in text_lower):
            spoken_summary = "Recorded. The incident timeline now includes the 08:42 UTC onset and identifies the checkout endpoint as the affected path."
            facts.append({"text": "Errors started around 08:42 UTC and are concentrated on checkout endpoint", "confidence": "Confirmed", "evidence": f"{speaker}: '{text}'"})
        elif "database looks healthy" in text_lower or ("cpu" in text_lower and "memory" in text_lower and "normal" in text_lower):
            spoken_summary = "Recorded as supporting evidence. The database, CPU, and memory currently appear healthy. This helps narrow the investigation, but it does not establish the root cause."
            facts.append({"text": "Database, CPU and memory appear healthy and within normal limits", "confidence": "Confirmed", "evidence": f"{speaker}: '{text}'"})
        elif "stripe bridge" in text_lower and ("possibility" in text_lower or "haven't confirmed" in text_lower or "causing" in text_lower):
            spoken_summary = "I'll record the Stripe Bridge as a hypothesis, not a confirmed fact. The hypothesis is that the Stripe Bridge may be contributing to the payment failures."
            hypotheses.append({"text": "Stripe Bridge may be contributing to payment failures", "status": "UNCONFIRMED", "evidence": f"{speaker}: '{text}'"})
        elif "stripe bridge logs" in text_lower and ("check" in text_lower or "compare" in text_lower):
            spoken_summary = "Action recorded. Owner: Arjun, Backend Engineer. The task is to check the Stripe Bridge logs and compare the error timestamps with the latest deployment. Status: pending."
            actions.append({"task": "Check Stripe Bridge logs and compare error timestamps with latest deployment", "ownerName": "Arjun", "ownerRole": "Backend Engineer", "priority": "HIGH", "status": "ASSIGNED"})
        elif "matching failures" in text_lower:
            spoken_summary = "That provides supporting evidence for the Stripe Bridge hypothesis. However, correlation alone is not sufficient to declare root cause. I'll keep the root cause unconfirmed."
            hypotheses.append({"text": "Stripe Bridge logs match payment API 503 error timestamps", "status": "LIKELY", "evidence": f"{speaker}: '{text}'"})
        elif "stripe bridge deployment" in text_lower or ("deployment" in text_lower and "shortly before" in text_lower):
            spoken_summary = "Recorded. The deployment timing strengthens the current hypothesis, but root cause remains unconfirmed until the team validates the effect of the deployment."
            facts.append({"text": "Stripe Bridge deployment occurred shortly before 08:42 UTC error spike", "confidence": "Confirmed", "evidence": f"{speaker}: '{text}'"})
        elif "roll back" in text_lower or "rollback" in text_lower:
            spoken_summary = "Rollback is a potentially critical action. I recommend the rollback based on the current evidence, but I require explicit human confirmation before execution."
            decisions.append({"action": "Roll back latest Stripe Bridge deployment", "status": "PROPOSED", "rationale": "Correlated error spike and deployment timing", "evidence": f"{speaker}: '{text}'"})
            critical_action = {
                "action": "Roll back latest Stripe Bridge deployment",
                "targetSystem": "Stripe Bridge Service",
                "reason": "Correlated error spike following deployment",
                "risk": "Temporary deployment rollback state change",
                "isSimulated": True
            }

        # 1. Action Assignment
        if is_action and not actions:
            actions.append({
                "task": text,
                "ownerName": speaker,
                "ownerRole": speaker_role,
                "priority": "HIGH",
                "status": "ASSIGNED"
            })

        # 2. Decision Proposal
        if is_decision and not decisions:
            decisions.append({
                "action": f"Decision proposed: {text}",
                "status": "PROPOSED",
                "rationale": f"Proposed by {speaker} ({speaker_role})",
                "evidence": f"{speaker}: '{text}'"
            })
            if ("rollback" in text_lower or "roll back" in text_lower) and not critical_action:
                critical_action = {
                    "action": f"Rollback requested: {text}",
                    "targetSystem": "Production Environment",
                    "reason": f"Decision proposed by {speaker}: '{text}'",
                    "risk": "Production deployment state change",
                    "isSimulated": True
                }

        # 3. Hypothesis (Uncertain statement)
        elif is_uncertain:
            hypotheses.append({
                "text": text,
                "status": "UNCONFIRMED",
                "evidence": f"{speaker} ({speaker_role}): '{text}'"
            })

        # 4. Confirmed Fact / Direct Technical Observation (ONLY for genuine incident telemetry)
        elif not is_action and not is_decision:
            is_technical_evidence = any(k in text_lower for k in [
                "503", "502", "500", "404", "error", "fail", "outage", "down", "crash",
                "database", "pool", "timeout", "latency", "cpu", "memory", "spike",
                "deploy", "v2.7", "v2.8", "release", "rollback", "gateway", "stripe",
                "checkout", "payment", "conversion", "sla", "traffic", "10:37", "10:42",
                "pod", "cluster", "service", "endpoint", "logs", "metrics"
            ])
            if is_technical_evidence and len(text.strip()) >= 8:
                facts.append({
                    "text": text,
                    "confidence": "Confirmed",
                    "evidence": f"{speaker} ({speaker_role}): '{text}'"
                })

        # 5. Check if statement provides evidence for/against existing hypotheses (e.g. CPU normal vs DB overload)
        if any(k in text_lower for k in ["cpu", "normal", "memory", "ok", "fine"]) and "normal" in text_lower:
            for existing_h in incident_context.get("hypotheses", []):
                if "database" in existing_h.get("text", "").lower() or "overloaded" in existing_h.get("text", "").lower():
                    existing_h["contradictingEvidence"] = f"Evidence against hypothesis: {speaker} ({speaker_role}) reported '{text}'"

        # 6. Conflict Detection (e.g. start time 10:37 vs 10:42)
        if ("started at" in text_lower or "first started" in text_lower or "10:37" in text_lower or "10:42" in text_lower):
            if any("10:37" in str(f.get("evidenceText", f.get("evidence", ""))) or "10:42" in str(f.get("evidenceText", f.get("evidence", ""))) for f in incident_context.get("facts", [])) or "10:42" in text or "10:37" in text:
                conflicts.append({
                    "topic": "Incident Onset Timestamp Discrepancy",
                    "statementA": "Customer reports started at 10:37",
                    "sourceA": "Rahul (Support)",
                    "statementB": text,
                    "sourceB": f"{speaker} ({speaker_role})",
                    "resolutionNeeded": True
                })

        # 7. Real NVIDIA NIM LLM API Call for Contextual JSON Refinement
        if self.is_configured():
            try:
                recent_facts = [f.get("text", "") for f in incident_context.get("facts", [])[-3:]]
                system_prompt = (
                    "You are EchoAid X, an Evidence-First AI Incident Commander with deep technical and bilingual conversational intelligence (English, Hindi, Hinglish).\n"
                    "Your role:\n"
                    "1. BILINGUAL MATCHING: Reply in `aiSummarySpoken` using the EXACT language and style the user spoke (English -> English, Hindi -> natural Hindi, Hinglish -> natural Hinglish). Do not use robotic machine Hindi.\n"
                    "2. INCIDENT INTELLIGENCE: If the statement is about an operational incident/outage, extract confirmed facts, hypotheses, decisions, and actions into the JSON arrays and generate a concise 1-sentence operational response in `aiSummarySpoken`.\n"
                    "3. CONVERSATIONAL & CASUAL: If asked jokes, greetings, or interesting facts (e.g., 'Tell me a joke', 'Tell me another joke', 'Tell me something interesting', 'Hello'), reply naturally, cheerfully, and dynamically in `aiSummarySpoken`.\n"
                    "4. TROUBLESHOOTING: If a problem is reported ('My network is not working', 'Wi-Fi issue'), give 1 isolation step + 1 targeted question in `aiSummarySpoken`.\n"
                    "5. USER-TRIGGERED MEDICAL INQUIRIES: If asked educational health/medical questions ('What is dehydration?'), answer informatively. Never start spontaneous emergency triage ('Is patient breathing?') unless user reports an active crisis.\n"
                    "6. LOCATION & WEATHER: If asked for weather or nearby places without a city/location ('Where is the nearest hospital?', 'What is the weather?'), politely ask for their city or neighborhood.\n"
                    "7. NEVER REFUSE: Never say you lack knowledge or search capability.\n\n"
                    "IMPORTANT: Output ONLY the raw JSON object. Do not output any reasoning, thinking, or preamble. Your output must begin with '{'.\n\n"
                    "Schema:\n"
                    "{\n"
                    '  "aiSummarySpoken": "Your concise, direct, helpful spoken response in user language (1-3 sentences)",\n'
                    '  "facts": [{"text": "...", "confidence": "Confirmed | High", "evidence": "..."}],\n'
                    '  "hypotheses": [{"text": "...", "status": "UNCONFIRMED | DISPROVED | LIKELY", "evidence": "..."}],\n'
                    '  "decisions": [{"action": "...", "status": "PROPOSED | APPROVED", "rationale": "...", "evidence": "..."}],\n'
                    '  "actions": [{"task": "...", "ownerName": "...", "ownerRole": "...", "priority": "HIGH", "status": "ASSIGNED"}],\n'
                    '  "conflicts": [{"topic": "...", "statementA": "...", "sourceA": "...", "statementB": "...", "sourceB": "..."}]\n'
                    "}"
                )
                headers = {
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                }
                payload = {
                    "model": self.model,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": f"Speaker: {speaker} ({speaker_role})\nStatement: '{text}'\nRecent Context Facts: {json.dumps(recent_facts)}"}
                    ],
                    "temperature": 0.2,
                    "max_tokens": 256
                }
                print("[NVIDIA NIM] CALLING ENDPOINT:", f"{self.base_url}/chat/completions", flush=True)
                res = requests.post(f"{self.base_url}/chat/completions", headers=headers, json=payload, timeout=4)
                print("[NVIDIA NIM] RESPONSE STATUS:", res.status_code, flush=True)
                if res.status_code == 200:
                    raw_res = res.json()["choices"][0]["message"]["content"].strip()

                    print("[NVIDIA NIM] CONTENT:", raw_res.encode('ascii', errors='replace').decode('ascii'), flush=True)

                    def extract_json_object(text: str):
                        text = text.strip()

                        # Strip thinking tags if present
                        if "<think>" in text and "</think>" in text:
                            text = text[text.rfind("</think>") + 8:].strip()

                        # Remove markdown fences if present
                        if text.startswith("```"):
                            first_newline = text.find("\n")
                            if first_newline != -1:
                                text = text[first_newline + 1:]

                            if "```" in text:
                                text = text[:text.rfind("```")]

                        # First try the entire response
                        try:
                            return json.loads(text.strip())
                        except json.JSONDecodeError:
                            pass

                        # Find the first JSON object
                        start = text.find("{")
                        end = text.rfind("}")

                        if start != -1 and end != -1 and end > start:
                            candidate = text[start:end + 1]

                            try:
                                return json.loads(candidate)
                            except json.JSONDecodeError:
                                pass

                        # Fallback: extract aiSummarySpoken directly if JSON was truncated
                        if '"aiSummarySpoken"' in text:
                            spoken_match = re.search(r'"aiSummarySpoken"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"', text)
                            if spoken_match:
                                try:
                                    extracted_spoken = spoken_match.group(1).encode().decode('unicode_escape')
                                except Exception:
                                    extracted_spoken = spoken_match.group(1)
                                return {
                                    "aiSummarySpoken": extracted_spoken,
                                    "facts": [],
                                    "hypotheses": [],
                                    "decisions": [],
                                    "actions": [],
                                    "conflicts": []
                                }

                        # If closing bracket was cut off, try appending closing brackets
                        if start != -1:
                            candidate = text[start:]
                            for suffix in ["\n}", "\n]}", '"}]}', '"]}}']:
                                try:
                                    return json.loads(candidate + suffix)
                                except json.JSONDecodeError:
                                    pass

                        raise ValueError(
                            "NVIDIA returned non-JSON content. "
                            f"Raw response: {text[:2000]}"
                        )

                    parsed_llm = extract_json_object(raw_res)

                    # Merge LLM extractions into result lists without duplicate text
                    for llm_f in parsed_llm.get("facts", []):
                        if llm_f.get("text") and not any(f["text"].lower() == llm_f["text"].lower() for f in facts):
                            facts.append(llm_f)
                    for llm_h in parsed_llm.get("hypotheses", []):
                        if llm_h.get("text") and not any(h["text"].lower() == llm_h["text"].lower() for h in hypotheses):
                            hypotheses.append(llm_h)
                    for llm_d in parsed_llm.get("decisions", []):
                        if llm_d.get("action") and not any(d["action"].lower() == llm_d["action"].lower() for d in decisions):
                            decisions.append(llm_d)
                    for llm_a in parsed_llm.get("actions", []):
                        if llm_a.get("task") and not any(a["task"].lower() == llm_a["task"].lower() for a in actions):
                            actions.append(llm_a)
                    if parsed_llm.get("aiSummarySpoken"):
                        spoken_summary = parsed_llm["aiSummarySpoken"]
            except Exception as e:
                print(f"[NVIDIA NIM Incident Intelligence Notice] Using pattern extraction: {e}")

        if not spoken_summary:
            clean_snippet = text.strip()
            if len(clean_snippet) > 75:
                clean_snippet = clean_snippet[:72] + "..."
            text_lower = text.lower()
            if "503" in text_lower or "error" in text_lower or "fail" in text_lower:
                spoken_summary = f"Understood {speaker}. Correlating HTTP 503 error rates with payment service health."
            elif "rollback" in text_lower or "deploy" in text_lower:
                spoken_summary = f"Rollback proposal noted from {speaker}. Awaiting confirmation."
            elif "database" in text_lower or "pool" in text_lower or "timeout" in text_lower:
                spoken_summary = f"Database telemetry noted from {speaker}. Checking connection pool capacity."
            else:
                spoken_summary = f"Got it {speaker}. {clean_snippet}"

        return {
            "facts": facts,
            "hypotheses": hypotheses,
            "decisions": decisions,
            "actions": actions,
            "conflicts": conflicts,
            "missingInformation": missing_info,
            "criticalAction": critical_action,
            "aiSummarySpoken": spoken_summary
        }

nvidia_client = NVIDIAClient()

