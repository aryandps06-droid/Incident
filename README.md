# EchoAid X — Real-Time AI Incident Commander

> **Evidence-First Autonomous AI Incident Commander for Live Operational War Rooms**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg?logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Agora RTC](https://img.shields.io/badge/Agora-Conversational_AI-099DFD.svg?logo=agora&logoColor=white)](https://www.agora.io/)
[![NVIDIA NIM](https://img.shields.io/badge/NVIDIA-NIM_Intelligence-76B900.svg?logo=nvidia&logoColor=white)](https://www.nvidia.com/)

---

## 📌 Overview

**EchoAid X** is an intelligent, real-time AI Incident Commander designed to join live technical and operational war rooms. During critical outages (such as SEV-1 payment gateway disruptions, checkout microservice failures, database connection spikes, or network degradation), engineering teams, support specialists, and business leaders communicate with partial, rapidly evolving, and sometimes conflicting information.

EchoAid X joins the live voice channel, extracts confirmed telemetry, distinguishes assumptions from verified evidence, flags conflicting claims, tracks ownership of action items, maintains an auto-synchronized incident timeline, and enforces human confirmation before high-stakes remediation (such as rollbacks or service restarts).

---

## 🚨 Problem Statement

During live high-severity incidents:
1. **Context Fragmentation**: Crucial facts get lost across verbal chatter and disparate monitoring tools.
2. **Assumption Cascades**: Hypotheses are frequently treated as confirmed facts, leading to wasted investigation cycles.
3. **Accountability Gaps**: Action items are suggested without clear ownership or follow-up.
4. **Discrepancy Blindspots**: Conflicting reports between frontend, backend, and infrastructure teams go unnoticed.
5. **Risky Actions**: Uncoordinated rollbacks or restarts can worsen outages without leadership confirmation.

---

## 💡 Solution: Evidence-First AI

EchoAid X acts as a dedicated, impartial Incident Commander that:
- **Listens to Live Team Audio**: Connects directly to the Agora SD-RTN voice channel via Agora Conversational AI Agent (UID `10001`).
- **Maintains Shared Situational Awareness**: Structures unstructured conversation into facts, hypotheses, decisions, action items, and risks.
- **Understands Participant Roles**: Weighs evidence according to speaker domain (Incident Commander, Backend, SRE, Frontend, Support, Security).
- **Enforces Critical Gates**: Requires explicit human confirmation before critical actions (e.g., executing deployment rollbacks).
- **Supports General & Multilingual Dialogue**: Handles conversational inquiries, technical troubleshooting, jokes, and general questions across English, Hindi, and Indian Hinglish.

---

## 🎙️ Real-Time Voice Architecture

```
User Microphone
      ↓
WebRTC LocalAudioTrack (Agora RTC Web SDK)
      ↓
Agora SD-RTN Channel (echoaid-room)
      ↓
Agora Conversational AI Agent (UID: 10001)
      ↓
LLM Intelligence & Incident Engine (NVIDIA NIM Llama 3.1 70B)
      ↓
Single Remote AI Audio Track (UID: 10001)
      ↓
Browser Playback (user.audioTrack.play())
```

### Voice System Highlights:
- **Microphone Default State**: Microphone starts **MUTED (`MIC OFF`)** by default upon room entry to prevent accidental background noise or speaker echo.
- **Click-to-Speak (`MIC LIVE`)**: Users unmute when speaking; speech is transcribed and streamed in real time.
- **Strict Single AI Voice**: AI audio playback is routed 100% through the Agora Conversational AI Agent (UID `10001`) over Agora RTC.
- **Duplicate Transcript Protection**: Rapid duplicate recognition events within 1500ms are deduplicated.
- **Single-Agent Concurrency Guard**: Backend thread locking ensures only one Agora AI Agent instance is spawned per room.

---

## 👥 Supported Incident Participant Roles

| Role | Responsibility & Contextual Weight |
| :--- | :--- |
| **Incident Commander** | War room leader with exclusive authority to confirm critical actions and rollbacks. |
| **Backend Engineer** | Provides API error rates, database locks, connection pools, and backend telemetry. |
| **Frontend Engineer** | Reports client-side error boundaries, user impact rates, and client telemetry. |
| **SRE / DevOps** | Monitors infrastructure health, Kubernetes pods, CPU/memory spikes, and network routing. |
| **Support / Customer Success** | Quantifies customer ticket surges and user-facing symptoms. |
| **Security Engineer** | Evaluates attack vectors, unauthorized access attempts, and credential leaks. |
| **Product Manager** | Tracks business impact, affected customer tiers, and SLA commitments. |
| **Business Lead** | Communicates executive stakeholder updates and revenue impact. |
| **Observer** | Passive participant monitoring room proceedings. |

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Framer Motion
- **Voice & Real-Time Audio**: Agora WebRTC SDK, Agora Conversational AI Agent v2
- **Backend API**: FastAPI, Uvicorn, Python 3.11+, Pydantic v2
- **Intelligence Engine**: NVIDIA NIM (`meta/llama-3.1-70b-instruct`)
- **Deployment Ready**: Render / Vercel / Cloud Container support

---

## 🚀 Installation & Local Setup

### 1. Clone the Repository
```bash
git clone https://github.com/aryandps06-droid/Incident.git
cd Incident
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` in the root:
```bash
cp .env.example .env
```
Fill in your Agora and NVIDIA credentials in `.env`.

### 3. Backend Setup (Terminal 1)
```bash
# Create and activate Python virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r backend/requirements.txt

# Start FastAPI server
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```

### 4. Frontend Setup (Terminal 2)
```bash
# Install node dependencies
npm install

# Start Vite development server
npm run dev
```

Visit **`http://localhost:5173`** to access the application.

---

## ⚙️ Environment Variables Reference

| Variable | Scope | Description |
| :--- | :--- | :--- |
| `VITE_API_BASE` / `VITE_API_BASE_URL` | Frontend | URL of backend API server (`http://localhost:8000` in dev) |
| `VITE_AGORA_APP_ID` | Frontend | Agora RTC App ID (Public Client Key) |
| `VITE_AGORA_CHANNEL` | Frontend | Agora RTC channel name (default: `echoaid-room`) |
| `PORT` | Backend | Port for FastAPI server (default: `8000`) |
| `FRONTEND_ORIGIN` | Backend | Production frontend origin for CORS |
| `ALLOW_ALL_CORS` | Backend | Enable CORS for local development (`true`) |
| `AGORA_APP_ID` | Backend | Agora App ID for RTC token builder |
| `AGORA_APP_CERTIFICATE` | Backend | Agora App Certificate for signing tokens |
| `AGORA_CUSTOMER_ID` | Backend | Agora REST API Customer ID |
| `AGORA_CUSTOMER_SECRET` | Backend | Agora REST API Customer Secret |
| `AGORA_PIPELINE_ID` | Backend | Agora Conversational AI Agent Pipeline ID |
| `NVIDIA_API_KEY` | Backend | NVIDIA NIM API Key for AI inference |
| `NVIDIA_MODEL` | Backend | Model identifier (`meta/llama-3.1-70b-instruct`) |
| `NVIDIA_BASE_URL` | Backend | NVIDIA NIM Base Endpoint (`https://integrate.api.nvidia.com/v1`) |

---

## 🔒 Security & Secrets Management

- **Server-Side Token Generation**: Agora RTC tokens and Conversational AI agent join requests are signed strictly on the backend.
- **Zero Secrets in Source**: App certificates, customer secrets, and NVIDIA API keys are managed exclusively via environment variables.
- **Strict `.gitignore`**: All `.env` files, build directories, scratch files, and Python cache artifacts are excluded from version control.
