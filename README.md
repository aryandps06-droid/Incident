# EchoAid X — The World's First AI Emergency Companion 🚑🤖

> **Built for the EchoSphere Agora Conversational AI Hackathon**

**EchoAid X** is a real-time, voice-first AI emergency companion powered by **Agora Conversational AI Voice Gateway** and **NVIDIA NIM AI Reasoning Engines**. Designed with an Apple-grade, VisionOS-inspired glassmorphism design system, EchoAid X uses **Progressive Disclosure** to deliver calm, instantaneous, and life-saving guidance during critical medical and safety emergencies.

---

## 🌟 Key Architectural Features

### 🎙️ Agora Conversational AI Voice Gateway
- **Phone-Call Audio Streaming**: Low-latency (12ms) bi-directional voice streaming.
- **Web Audio DSP**: Hardware-accelerated Echo Cancellation, Noise Suppression, and Auto Gain Control.
- **Voice Controls**: Join/Leave session, Mute/Unmute toggle, and automatic reconnection protocol.
- **Speaking Indicators**: Real-time visual spectrum waveforms for user speech and AI voice feedback.

### 🧠 NVIDIA NIM AI Emergency Reasoning Engine
- **Structured Emergency Classifier**: Dynamically evaluates symptoms and situation history across 9 core emergency categories:
  1. `Heart attack / Cardiac Arrest`
  2. `Stroke`
  3. `Fire`
  4. `Road accident`
  5. `Domestic violence`
  6. `Flood`
  7. `Earthquake`
  8. `Panic attack`
  9. `Food poisoning`
  10. `General Medical emergency`
- **Output Payload**: Real-time confidence metrics, severity ratings (`CRITICAL` / `URGENT` / `MODERATE`), step-by-step guidance, and emergency flags (`call_ambulance`, `call_police`, `cpr_required`, `hospital_required`).

### 🛠️ AI Tool Calling System
- Invokes modern animated cards inside the conversation feed dynamically:
  - `open_live_maps`: Interactive emergency route radar map.
  - `share_current_location`: Encrypted GPS pin broadcast status.
  - `find_nearby_hospitals`: Nearest Level I Trauma Center with live ETA.
  - `access_emergency_contacts`: Notified ICE emergency contact relays.
  - `prepare_emergency_report`: Compiled triage assessment preview.
  - `generate_emergency_summary`: Handled incident summary.

### 🎨 Apple Design Award Quality & Progressive Disclosure
- **5 Progressive Disclosure Scenes**: Information is revealed contextually only when needed—never cluttering the screen.
- **Squircle Glass Geometry**: 28px/36px rounded corners, specular top-edge light highlights (`inset 0 1px 1px 0 rgba(255,255,255,0.18)`), 36px frosted glass blur.
- **60 FPS GPU Performance**: Lerped `requestAnimationFrame` transforms (`translate3d`), zero-re-render mouse tracking, and optimized canvas particles.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS v4, Framer Motion, Lucide Icons, Vite.
- **Voice Engine**: Agora Web Voice SDK / Web Audio API DSP, Web Speech API.
- **Backend API**: Python 3.11+, FastAPI, Uvicorn, Pydantic v2.
- **AI Inference**: NVIDIA NIM API (`meta/llama-3.1-70b-instruct`).

---

## 🚀 Quickstart Guide

### Prerequisites
- Node.js 18+ & `npm`
- Python 3.10+ & `pip`
- NVIDIA NIM API Key (get key at [build.nvidia.com](https://build.nvidia.com))

### 1. Clone & Setup Environment
```bash
# Clone the repository
git clone https://github.com/your-username/echoaid-x.git
cd echoaid-x

# Create root .env file from template
cp .env.example .env

# Create backend .env file from template
cp backend/.env.example backend/.env
```

### 2. Configure NVIDIA API Key
Open `backend/.env` and paste your key:
```env
NVIDIA_API_KEY=nvapi-your-actual-nvidia-nim-api-key-here
NVIDIA_MODEL=meta/llama-3.1-70b-instruct
NVIDIA_BASE_URL=https://integrate.api.nvidia.com/v1
```

### 3. Start FastAPI Backend (Port 8080)
```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn main:app --port 8080 --reload
```

### 4. Start Vite Frontend (Port 5173)
```bash
# In a new terminal tab at project root
npm install
npm run dev
```

Open `http://localhost:5173/` in your browser.

---

## 🧪 Hackathon Demonstration Flow

```
1. Website Opens
   └─ State 1: Minimal AI Core Sphere + Title + Mic Button ("I'm here. Tell me what happened.")
        ↓
2. User Clicks AI Core / Mic
   └─ State 2: In-Page ChatGPT Voice transformation, Audio Waveform activates, Web Speech listening
        ↓
3. User Speaks Symptoms
   └─ "My father suddenly collapsed and is not breathing" (Word-by-Word interim transcript)
        ↓
4. NVIDIA NIM & Agora AI Reasoning
   └─ State 3: Red crimson lighting halo, Emergency Panel slides in (Cardiac Arrest, Confidence: 98%), AI Tool Cards invoke
        ↓
5. Emergency Handled Summary
   └─ State 4: Session recap, CPR Metronome, Ambulance dispatch, Download JSON Report
```

---

## 📄 License
MIT License. Built for the **EchoSphere Agora Conversational AI Hackathon**.
