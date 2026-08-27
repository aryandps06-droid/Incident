import os
import json
import uuid
import time
from datetime import datetime
from typing import List, Dict, Any, Optional

class IncidentEngine:
    """
    Core Incident Management State Engine for EchoAid X Evidence-First AI Incident Commander.
    Manages structured state, event log, conflict detection, action ownership, evidence tracking,
    and demo simulation.
    """
    def __init__(self, data_dir: str):
        self.data_dir = data_dir
        self.incidents_file = os.path.join(data_dir, "incident_commander_db.json")
        self._init_storage()

    def _init_storage(self):
        if not os.path.exists(self.data_dir):
            os.makedirs(self.data_dir, exist_ok=True)
        if not os.path.exists(self.incidents_file):
            default_demo = self._build_default_demo_state()
            with open(self.incidents_file, "w") as f:
                json.dump({"incidents": {default_demo["id"]: default_demo}}, f, indent=2)

    def _load_data(self) -> Dict[str, Any]:
        try:
            with open(self.incidents_file, "r") as f:
                return json.load(f)
        except Exception:
            return {"incidents": {}}

    def _save_data(self, data: Dict[str, Any]):
        with open(self.incidents_file, "w") as f:
            json.dump(data, f, indent=2)

    def get_incident(self, incident_id: str) -> Optional[Dict[str, Any]]:
        data = self._load_data()
        inc = data.get("incidents", {}).get(incident_id)
        if not inc and incident_id in ["INC-2048", "INC-DEMO-PAYMENT", "current"]:
            inc = self._build_default_demo_state()
            data.setdefault("incidents", {})[inc["id"]] = inc
            self._save_data(data)
        return inc

    def list_incidents(self) -> List[Dict[str, Any]]:
        data = self._load_data()
        incidents = list(data.get("incidents", {}).values())
        if not incidents:
            demo = self._build_default_demo_state()
            data.setdefault("incidents", {})[demo["id"]] = demo
            self._save_data(data)
            return [demo]
        return incidents

    def create_incident(self, title: str, description: str, severity: str = "SEV-1", incident_commander: str = "Neha") -> Dict[str, Any]:
        data = self._load_data()
        inc_id = f"INC-{int(time.time() * 1000) % 100000}"
        now_iso = datetime.utcnow().isoformat() + "Z"
        now_time = datetime.now().strftime("%H:%M:%S")

        new_inc = {
            "id": inc_id,
            "title": title,
            "description": description,
            "severity": severity,
            "status": "INVESTIGATING",
            "createdAt": now_iso,
            "startedAt": now_time,
            "resolvedAt": None,
            "incidentCommander": incident_commander,
            "affectedServices": ["Payment API", "Checkout Gateway"],
            "impact": "Customers experiencing transaction failures",
            "participants": [
                {
                    "id": "p1",
                    "name": incident_commander,
                    "role": "Incident Commander",
                    "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
                    "status": "active",
                    "joinedAt": now_time,
                    "speaking": False,
                    "confidence": 1.0
                },
                {
                    "id": "p-ai",
                    "name": "EchoAid X",
                    "role": "AI Incident Commander",
                    "avatar": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150",
                    "status": "active",
                    "joinedAt": now_time,
                    "speaking": False,
                    "confidence": 1.0
                }
            ],
            "facts": [],
            "hypotheses": [],
            "decisions": [],
            "actions": [],
            "conflicts": [],
            "missingInformation": [
                {
                    "id": "mi-1",
                    "topic": "Incident Start Time",
                    "description": "Exact onset timestamp requires confirmation from support & backend logs",
                    "severity": "HIGH",
                    "status": "IDENTIFIED"
                },
                {
                    "id": "mi-2",
                    "topic": "Root Cause",
                    "description": "Root cause is unconfirmed. Database overload vs Deployment v2.8 currently hypothesized.",
                    "severity": "HIGH",
                    "status": "IDENTIFIED"
                }
            ],
            "risks": ["Potential revenue impact during peak hours", "Customer support queue overflow"],
            "timeline": [
                {
                    "id": f"evt-{uuid.uuid4().hex[:6]}",
                    "timestamp": now_time,
                    "eventType": "INCIDENT_CREATED",
                    "title": "Incident Room Created",
                    "description": f"{title} ({severity}) created by {incident_commander}",
                    "source": incident_commander,
                    "confidenceOrStatus": "System"
                }
            ],
            "transcript": [],
            "systemSignals": [
                {
                    "id": "sig-1",
                    "serviceName": "Payment API",
                    "metricName": "HTTP 503 Rate",
                    "value": "14.2%",
                    "unit": "error_rate",
                    "status": "CRITICAL",
                    "timestamp": now_time,
                    "isDemo": True
                },
                {
                    "id": "sig-2",
                    "serviceName": "Database Cluster",
                    "metricName": "CPU Utilization",
                    "value": "42%",
                    "unit": "percent",
                    "status": "NORMAL",
                    "timestamp": now_time,
                    "isDemo": True
                }
            ],
            "aiUpdates": [f"EchoAid X joined incident room {inc_id} as Evidence-First AI Incident Commander."],
            "integrations": [
                {"service": "Slack", "status": "CONNECTED", "lastSync": now_time, "details": "Posting to #incident-pay-503"},
                {"service": "Jira", "status": "CONNECTED", "lastSync": now_time, "details": "Ticket INC-2048 linked"},
                {"service": "PagerDuty", "status": "CONNECTED", "lastSync": now_time, "details": "On-call SRE & Commander acknowledged"},
                {"service": "Datadog / Monitoring", "status": "DEMO_SIMULATED", "lastSync": now_time, "details": "Live metrics streaming"}
            ],
            "criticalActions": [],
            "isDemoMode": False,
            "demoStep": 0
        }

        data.setdefault("incidents", {})[inc_id] = new_inc
        self._save_data(data)
        return new_inc

    def update_incident(self, incident_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        data = self._load_data()
        inc = data.get("incidents", {}).get(incident_id)
        if not inc:
            return None

        for k, v in updates.items():
            if k in inc:
                inc[k] = v

        now_time = datetime.now().strftime("%H:%M:%S")
        if "status" in updates:
            self._add_timeline_event(inc, "INCIDENT_STABILIZED" if updates["status"] == "STABILIZED" else "INCIDENT_RESOLVED", 
                                    f"Status changed to {updates['status']}", f"Status updated to {updates['status']}", "System", updates["status"])

        self._save_data(data)
        return inc

    def add_transcript_segment(self, incident_id: str, speaker: str, speaker_role: str, text: str, ai_analysis: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        data = self._load_data()
        inc = data.get("incidents", {}).get(incident_id)
        if not inc:
            inc = self._build_default_demo_state()
            data.setdefault("incidents", {})[inc["id"]] = inc

        now_time = datetime.now().strftime("%H:%M:%S")
        seg_id = f"tr-{uuid.uuid4().hex[:6]}"

        # Append transcript
        inc["transcript"].append({
            "id": seg_id,
            "speaker": speaker,
            "speakerRole": speaker_role,
            "text": text,
            "timestamp": now_time
        })

        # Ensure participant exists
        existing_p = next((p for p in inc["participants"] if p["name"].lower() == speaker.lower()), None)
        if not existing_p:
            inc["participants"].append({
                "id": f"p-{uuid.uuid4().hex[:4]}",
                "name": speaker,
                "role": speaker_role or "Observer",
                "avatar": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
                "status": "active",
                "joinedAt": now_time,
                "speaking": True,
                "confidence": 0.95
            })

        # Add event to timeline
        self._add_timeline_event(inc, "TRANSCRIPT_RECEIVED", f"{speaker} ({speaker_role})", text, speaker, "Transcript", seg_id)

        # Process structured AI analysis payload
        if ai_analysis:
            # Facts
            for f in ai_analysis.get("facts", []):
                fact_id = f"fact-{uuid.uuid4().hex[:6]}"
                new_fact = {
                    "id": fact_id,
                    "text": f.get("text", ""),
                    "sourceParticipantId": existing_p["id"] if existing_p else "p-gen",
                    "sourceParticipantName": speaker,
                    "sourceParticipantRole": speaker_role,
                    "timestamp": now_time,
                    "confidence": f.get("confidence", "Confirmed"),
                    "evidenceText": f.get("evidence", text),
                    "transcriptSegmentId": seg_id
                }
                # Prevent duplicate text
                if not any(existing_f["text"].lower() == new_fact["text"].lower() for existing_f in inc["facts"]):
                    inc["facts"].append(new_fact)
                    self._add_timeline_event(inc, "FACT_CREATED", "Confirmed Fact Logged", new_fact["text"], speaker, "Confirmed", fact_id)

            # Hypotheses
            for h in ai_analysis.get("hypotheses", []):
                hypo_id = f"hypo-{uuid.uuid4().hex[:6]}"
                new_hypo = {
                    "id": hypo_id,
                    "text": h.get("text", ""),
                    "status": h.get("status", "UNCONFIRMED"),
                    "sourceParticipantId": existing_p["id"] if existing_p else "p-gen",
                    "sourceParticipantName": speaker,
                    "sourceParticipantRole": speaker_role,
                    "timestamp": now_time,
                    "evidenceText": h.get("evidence", text),
                    "contradictingEvidenceText": h.get("contradictingEvidence")
                }
                if not any(existing_h["text"].lower() == new_hypo["text"].lower() for existing_h in inc["hypotheses"]):
                    inc["hypotheses"].append(new_hypo)
                    self._add_timeline_event(inc, "HYPOTHESIS_CREATED", "Hypothesis Logged", f"{new_hypo['text']} (Status: UNCONFIRMED)", speaker, "Unconfirmed", hypo_id)

            # Decisions
            for d in ai_analysis.get("decisions", []):
                dec_id = f"dec-{uuid.uuid4().hex[:6]}"
                new_dec = {
                    "id": dec_id,
                    "action": d.get("action", ""),
                    "status": d.get("status", "PROPOSED"),
                    "decisionMakerId": existing_p["id"] if existing_p else "p-gen",
                    "decisionMakerName": speaker,
                    "decisionMakerRole": speaker_role,
                    "timestamp": now_time,
                    "rationale": d.get("rationale", "Proposed by Incident Team"),
                    "evidenceText": d.get("evidence", text)
                }
                if not any(existing_d["action"].lower() == new_dec["action"].lower() for existing_d in inc["decisions"]):
                    inc["decisions"].append(new_dec)
                    self._add_timeline_event(inc, "DECISION_PROPOSED", "Decision Proposed", new_dec["action"], speaker, new_dec["status"], dec_id)

            # Actions
            for a in ai_analysis.get("actions", []):
                act_id = f"act-{uuid.uuid4().hex[:6]}"
                new_act = {
                    "id": act_id,
                    "task": a.get("task", ""),
                    "ownerId": existing_p["id"] if a.get("ownerName") == speaker else None,
                    "ownerName": a.get("ownerName", speaker if "I " in text or "I'll" in text else None),
                    "ownerRole": a.get("ownerRole", speaker_role if a.get("ownerName") == speaker else None),
                    "priority": a.get("priority", "HIGH"),
                    "status": "ASSIGNED" if a.get("ownerName") else "PENDING",
                    "createdAt": now_time,
                    "relatedEvidenceText": text
                }
                if not any(existing_a["task"].lower() == new_act["task"].lower() for existing_a in inc["actions"]):
                    inc["actions"].append(new_act)
                    self._add_timeline_event(inc, "ACTION_CREATED", "Action Item Created", f"{new_act['task']} (Owner: {new_act['ownerName'] or 'Unassigned'})", speaker, new_act["status"], act_id)

                    # Flag missing owner if none
                    if not new_act["ownerName"]:
                        inc["missingInformation"].append({
                            "id": f"mi-{uuid.uuid4().hex[:4]}",
                            "topic": "Unassigned Action Owner",
                            "description": f"Action '{new_act['task']}' has no assigned owner.",
                            "severity": "MEDIUM",
                            "status": "IDENTIFIED"
                        })

            # Conflicts
            for c in ai_analysis.get("conflicts", []):
                conf_id = f"conf-{uuid.uuid4().hex[:6]}"
                new_conf = {
                    "id": conf_id,
                    "topic": c.get("topic", "Statement Conflict"),
                    "statementA": c.get("statementA", ""),
                    "sourceA": c.get("sourceA", "Participant"),
                    "statementB": c.get("statementB", ""),
                    "sourceB": c.get("sourceB", speaker),
                    "status": "UNRESOLVED"
                }
                if not any(existing_c["topic"].lower() == new_conf["topic"].lower() for existing_c in inc["conflicts"]):
                    inc["conflicts"].append(new_conf)
                    self._add_timeline_event(inc, "CONFLICT_DETECTED", "⚠️ Discrepancy / Conflict Detected", f"{new_conf['topic']}: '{new_conf['statementA']}' ({new_conf['sourceA']}) vs '{new_conf['statementB']}' ({new_conf['sourceB']})", "EchoAid X", "UNRESOLVED", conf_id)

            # Critical Actions
            ca_data = ai_analysis.get("criticalAction")
            if ca_data and ca_data.get("action"):
                ca_id = f"ca-{uuid.uuid4().hex[:6]}"
                new_ca = {
                    "id": ca_id,
                    "action": ca_data.get("action"),
                    "targetSystem": ca_data.get("targetSystem", "Production Service"),
                    "reason": ca_data.get("reason", "Incident mitigation decision"),
                    "evidence": ca_data.get("evidence", text),
                    "risk": ca_data.get("risk", "Service interruption / deployment rollback"),
                    "status": "PENDING_APPROVAL",
                    "requestedAt": now_time,
                    "isSimulated": ca_data.get("isSimulated", True)
                }
                if not any(existing_ca["action"].lower() == new_ca["action"].lower() for existing_ca in inc["criticalActions"]):
                    inc["criticalActions"].append(new_ca)
                    self._add_timeline_event(inc, "CRITICAL_ACTION_REQUESTED", "🛑 Human Approval Required", f"Critical Action: {new_ca['action']}", speaker, "PENDING_APPROVAL", ca_id)

        self._save_data(data)
        return inc

    def resolve_conflict(self, incident_id: str, conflict_id: str, resolution_choice: str, confirmed_value: str) -> Optional[Dict[str, Any]]:
        data = self._load_data()
        inc = data.get("incidents", {}).get(incident_id)
        if not inc:
            return None

        now_time = datetime.now().strftime("%H:%M:%S")
        for conf in inc["conflicts"]:
            if conf["id"] == conflict_id:
                conf["status"] = resolution_choice
                conf["resolution"] = f"Human Confirmation: Confirmed '{confirmed_value}'"
                conf["resolvedAt"] = now_time
                conf["confirmedValue"] = confirmed_value

                # Also resolve related missing info if start time
                if "start" in conf["topic"].lower():
                    for mi in inc["missingInformation"]:
                        if "start" in mi["topic"].lower():
                            mi["status"] = "RESOLVED"
                            mi["resolvedValue"] = confirmed_value

                self._add_timeline_event(inc, "CONFLICT_RESOLVED", "Conflict Resolved by Human Confirmation", f"{conf['topic']} confirmed as '{confirmed_value}'", "Incident Commander", "Resolved", conflict_id)
                break

        self._save_data(data)
        return inc

    def approve_critical_action(self, incident_id: str, action_id: str, approved_by: str = "Neha (Incident Commander)") -> Optional[Dict[str, Any]]:
        data = self._load_data()
        inc = data.get("incidents", {}).get(incident_id)
        if not inc:
            return None

        now_time = datetime.now().strftime("%H:%M:%S")
        for ca in inc["criticalActions"]:
            if ca["id"] == action_id:
                ca["status"] = "EXECUTED"
                ca["approvedAt"] = now_time
                ca["approvedBy"] = approved_by
                ca["executionResult"] = "SIMULATED EXECUTION SUCCESSFUL: Deployment v2.8 rolled back to v2.7. Traffic rerouted cleanly."

                # Update incident status to MITIGATING -> STABILIZED
                inc["status"] = "STABILIZED"
                
                # Lower error rate in system signals
                for sig in inc["systemSignals"]:
                    if "503" in sig["metricName"]:
                        sig["value"] = "0.08%"
                        sig["status"] = "NORMAL"

                self._add_timeline_event(inc, "CRITICAL_ACTION_APPROVED", "Human Approved Critical Action", f"Approved by {approved_by}: {ca['action']}", approved_by, "APPROVED", action_id)
                self._add_timeline_event(inc, "CRITICAL_ACTION_EXECUTED", "Simulated Execution Completed", ca["executionResult"], "Simulated Adapter", "SUCCESS", action_id)
                self._add_timeline_event(inc, "INCIDENT_STABILIZED", "Incident Stabilized", "HTTP 503 error rate returned to normal (0.08%) following rollback.", "Datadog / Monitoring", "STABILIZED")
                break

        self._save_data(data)
        return inc

    def reject_critical_action(self, incident_id: str, action_id: str, rejected_by: str = "Incident Commander") -> Optional[Dict[str, Any]]:
        data = self._load_data()
        inc = data.get("incidents", {}).get(incident_id)
        if not inc:
            return None

        now_time = datetime.now().strftime("%H:%M:%S")
        for ca in inc["criticalActions"]:
            if ca["id"] == action_id:
                ca["status"] = "REJECTED"
                ca["executionResult"] = f"Action rejected by {rejected_by}."
                self._add_timeline_event(inc, "CRITICAL_ACTION_REJECTED", "Critical Action Rejected", f"Rejected by {rejected_by}: {ca['action']}", rejected_by, "REJECTED", action_id)
                break

        self._save_data(data)
        return inc

    def update_action_item(self, incident_id: str, action_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        data = self._load_data()
        inc = data.get("incidents", {}).get(incident_id)
        if not inc:
            return None

        now_time = datetime.now().strftime("%H:%M:%S")
        for act in inc["actions"]:
            if act["id"] == action_id:
                for k, v in updates.items():
                    act[k] = v
                if updates.get("status") == "COMPLETED":
                    act["completedAt"] = now_time
                    self._add_timeline_event(inc, "ACTION_COMPLETED", "Action Task Completed", f"Task '{act['task']}' completed by {act.get('ownerName', 'Owner')}", act.get("ownerName", "User"), "COMPLETED", action_id)
                elif updates.get("ownerName"):
                    act["assignedAt"] = now_time
                    self._add_timeline_event(inc, "ACTION_ASSIGNED", "Action Assigned", f"Task '{act['task']}' assigned to {act['ownerName']}", "Incident Commander", "ASSIGNED", action_id)
                break

        self._save_data(data)
        return inc

    def reset_incident(self, incident_id: str = "INC-2048") -> Dict[str, Any]:
        """
        Resets an incident room state to a clean slate with 0 facts, 0 hypotheses, 0 decisions, 0 conflicts.
        """
        data = self._load_data()
        fresh = self._build_default_demo_state()
        fresh["id"] = incident_id
        data.setdefault("incidents", {})[incident_id] = fresh
        self._save_data(data)
        return fresh

    def start_demo_scenario(self) -> Dict[str, Any]:
        """
        Starts the EcoSphere Payment API Outage Demo Scenario (Phase 20 & 21).
        """
        demo = self._build_default_demo_state()
        data = self._load_data()
        data.setdefault("incidents", {})[demo["id"]] = demo
        self._save_data(data)
        return demo

    def generate_incident_report(self, incident_id: str) -> Dict[str, Any]:
        inc = self.get_incident(incident_id)
        if not inc:
            inc = self._build_default_demo_state()

        facts_list = [f"- **{f['text']}** (Source: {f['sourceParticipantName']}, {f['sourceParticipantRole']} | Confidence: {f['confidence']})" for f in inc.get("facts", [])]
        hypo_list = [f"- **{h['text']}** (Status: *{h['status']}* | Source: {h['sourceParticipantName']})" for h in inc.get("hypotheses", [])]
        dec_list = [f"- **{d['action']}** (Proposed by: {d['decisionMakerName']} | Status: {d['status']})" for d in inc.get("decisions", [])]
        act_list = [f"- [{ 'x' if a['status'] == 'COMPLETED' else ' ' }] **{a['task']}** — Assigned to: **{a.get('ownerName') or 'UNASSIGNED'}** ({a.get('priority')} Priority)" for a in inc.get("actions", [])]
        timeline_list = [f"- **{t['timestamp']}** `[{t['eventType']}]` {t['title']}: {t['description']}" for t in inc.get("timeline", [])]
        conflicts_list = [f"- **{c['topic']}**: '{c['statementA']}' ({c['sourceA']}) vs '{c['statementB']}' ({c['sourceB']}) -> **Status: {c['status']}**" for c in inc.get("conflicts", [])]
        unresolved_risks = [f"- {r}" for r in inc.get("risks", [])]

        root_cause_text = "Root cause remains **UNCONFIRMED**. Deployment v2.8 identified as primary suspected contributor prior to rollback."

        markdown_report = f"""# 🚨 ECHOAID X INCIDENT SUMMARY REPORT

**Incident ID**: `{inc['id']}`  
**Title**: {inc['title']}  
**Severity**: `{inc['severity']}`  
**Status**: `{inc['status']}`  
**Incident Commander**: {inc['incidentCommander']}  
**Started At**: {inc['startedAt']} | **Resolved/Stabilized At**: {inc.get('resolvedAt') or '10:58:00'}  
**Affected Services**: {', '.join(inc.get('affectedServices', []))}  

---

### Executive Summary
{inc['description']}. EchoAid X maintained a live, evidence-backed shared understanding of all facts, hypotheses, decisions, conflicting statements, and critical action approvals throughout the outage.

### Root Cause Assessment
> **{root_cause_text}**

---

### Confirmed Facts
{chr(10).join(facts_list) if facts_list else 'No confirmed facts logged.'}

### Hypotheses & Evidence Tracking
{chr(10).join(hypo_list) if hypo_list else 'No hypotheses logged.'}

### Key Decisions
{chr(10).join(dec_list) if dec_list else 'No decisions logged.'}

### Action Items & Ownership
{chr(10).join(act_list) if act_list else 'No actions logged.'}

### Detected Discrepancies & Conflicts
{chr(10).join(conflicts_list) if conflicts_list else 'No unresolved conflicts.'}

---

### Complete Incident Timeline
{chr(10).join(timeline_list)}

---

### Follow-up Actions & Unresolved Risks
{chr(10).join(unresolved_risks)}
- [ ] Perform post-mortem code review on Deployment v2.8 connection pool configuration.
- [ ] Update monitoring alert thresholds for early 503 error rate anomalies.
"""

        return {
            "incidentId": inc["id"],
            "title": inc["title"],
            "severity": inc["severity"],
            "status": inc["status"],
            "commander": inc["incidentCommander"],
            "markdownReport": markdown_report,
            "rawIncidentData": inc,
            "generatedAt": datetime.utcnow().isoformat() + "Z"
        }

    def _add_timeline_event(self, inc: Dict[str, Any], event_type: str, title: str, description: str, source: str, conf_or_status: str, related_id: Optional[str] = None):
        now_time = datetime.now().strftime("%H:%M:%S")
        evt = {
            "id": f"evt-{uuid.uuid4().hex[:6]}",
            "timestamp": now_time,
            "eventType": event_type,
            "title": title,
            "description": description,
            "source": source,
            "confidenceOrStatus": conf_or_status,
            "relatedEntityId": related_id
        }
        inc.setdefault("timeline", []).append(evt)

    def _build_default_demo_state(self) -> Dict[str, Any]:
        """
        Builds the clean, real-time EchoAid X Incident Room State (INC-2048).
        Starts completely fresh with 0 mock facts/transcripts, ready for live speech ingestion.
        """
        now_time = datetime.now().strftime("%H:%M:%S")
        return {
            "id": "INC-2048",
            "title": "PAYMENT API OUTAGE & 503 ERROR SPIKE",
            "description": "Payment gateway processing failures impacting customer checkout across web and mobile platforms.",
            "severity": "SEV-1",
            "status": "INVESTIGATING",
            "createdAt": datetime.utcnow().isoformat() + "Z",
            "startedAt": "10:37:00",
            "resolvedAt": None,
            "incidentCommander": "Neha",
            "affectedServices": ["Payment API v2", "Checkout Microservice", "Stripe Bridge"],
            "impact": "14.2% payment failure rate, ~450 failed checkout attempts",
            "participants": [
                {
                    "id": "p-neha",
                    "name": "Neha",
                    "role": "Incident Commander",
                    "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
                    "status": "active",
                    "joinedAt": "10:44:00",
                    "speaking": False,
                    "confidence": 1.0
                },
                {
                    "id": "p-arjun",
                    "name": "Arjun",
                    "role": "Backend Engineer",
                    "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
                    "status": "active",
                    "joinedAt": "10:42:00",
                    "speaking": False,
                    "confidence": 0.98
                },
                {
                    "id": "p-ananya",
                    "name": "Ananya",
                    "role": "Frontend Engineer",
                    "avatar": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150",
                    "status": "active",
                    "joinedAt": "10:43:00",
                    "speaking": False,
                    "confidence": 0.97
                },
                {
                    "id": "p-priya",
                    "name": "Priya",
                    "role": "SRE / DevOps",
                    "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
                    "status": "active",
                    "joinedAt": "10:48:00",
                    "speaking": False,
                    "confidence": 0.96
                },
                {
                    "id": "p-rahul",
                    "name": "Rahul",
                    "role": "Support",
                    "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
                    "status": "active",
                    "joinedAt": "10:37:00",
                    "speaking": False,
                    "confidence": 0.95
                },
                {
                    "id": "p-kavita",
                    "name": "Kavita",
                    "role": "Product Manager",
                    "avatar": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150",
                    "status": "active",
                    "joinedAt": "10:40:00",
                    "speaking": False,
                    "confidence": 0.94
                },
                {
                    "id": "p-rohan",
                    "name": "Rohan",
                    "role": "Business Lead",
                    "avatar": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
                    "status": "active",
                    "joinedAt": "10:41:00",
                    "speaking": False,
                    "confidence": 0.93
                },
                {
                    "id": "p-marcus",
                    "name": "Marcus",
                    "role": "Observer",
                    "avatar": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150",
                    "status": "active",
                    "joinedAt": "10:45:00",
                    "speaking": False,
                    "confidence": 0.90
                },
                {
                    "id": "p-ai",
                    "name": "EchoAid X",
                    "role": "AI Incident Commander",
                    "avatar": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150",
                    "status": "active",
                    "joinedAt": "10:44:00",
                    "speaking": False,
                    "confidence": 1.0
                }
            ],
            "facts": [],
            "hypotheses": [],
            "decisions": [],
            "actions": [],
            "conflicts": [],
            "missingInformation": [
                {
                    "id": "mi-1",
                    "topic": "Root Cause Confirmation",
                    "description": "Root cause remains unconfirmed. Awaiting live diagnostic evidence from the incident room.",
                    "severity": "HIGH",
                    "status": "IDENTIFIED"
                }
            ],
            "risks": [
                "Payment failures ongoing during investigation",
                "Customer checkout impact active"
            ],
            "timeline": [
                {
                    "id": "evt-init",
                    "timestamp": "10:37:00",
                    "eventType": "INCIDENT_CREATED",
                    "title": "Incident Room INC-2048 Initialized",
                    "description": "EchoAid X Evidence-First AI Incident Commander online. Listening to live war room audio.",
                    "source": "EchoAid X",
                    "confidenceOrStatus": "Online"
                }
            ],
            "transcript": [],
            "systemSignals": [
                {
                    "id": "sig-1",
                    "serviceName": "Payment API",
                    "metricName": "HTTP 503 Rate",
                    "value": "14.2%",
                    "unit": "error_rate",
                    "status": "CRITICAL",
                    "timestamp": "10:37:00",
                    "isDemo": False
                },
                {
                    "id": "sig-2",
                    "serviceName": "Database Cluster",
                    "metricName": "CPU Utilization",
                    "value": "42%",
                    "unit": "percent",
                    "status": "NORMAL",
                    "timestamp": "10:37:00",
                    "isDemo": False
                }
            ],
            "aiUpdates": [
                "EchoAid X connected to room INC-2048 as Evidence-First AI Incident Commander."
            ],
            "integrations": [
                {"service": "Slack", "status": "CONNECTED", "lastSync": "10:37:00", "details": "#incident-pay-503 (Live)"},
                {"service": "Jira", "status": "CONNECTED", "lastSync": "10:37:00", "details": "Ticket INC-2048 linked"},
                {"service": "PagerDuty", "status": "CONNECTED", "lastSync": "10:37:00", "details": "On-call SRE & Commander acknowledged"},
                {"service": "Datadog / Monitoring", "status": "CONNECTED", "lastSync": "10:37:00", "details": "Live telemetry active"}
            ],
            "criticalActions": [],
            "isDemoMode": False,
            "demoStep": 0
        }
