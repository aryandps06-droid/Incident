# EchoAid X — Production Deployment Guide 🚀

This document outlines the step-by-step procedure to deploy **EchoAid X** to production.

---

## 🏗️ Architecture Overview

- **Frontend**: Single Page Application (SPA) built with React, Vite, and Tailwind CSS. Deployable to **Vercel**, **Netlify**, or **Cloudflare Pages**.
- **Backend API**: Python FastAPI application. Deployable to **Render**, **Railway**, **Fly.io**, or **AWS App Runner**.

---

## ⚡ 1. Backend Deployment (FastAPI on Render / Railway)

### Option A: Deploy on Render.com
1. Create a free account at [render.com](https://render.com).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository containing `echoaid-x`.
4. Configure the service:
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add Environment Variables under **Environment**:
   - `NVIDIA_API_KEY`: `nvapi-your-key-here`
   - `NVIDIA_MODEL`: `meta/llama-3.1-70b-instruct`
   - `NVIDIA_BASE_URL`: `https://integrate.api.nvidia.com/v1`
6. Click **Create Web Service**. Your backend URL will be `https://echoaid-backend.onrender.com`.

---

## 🌐 2. Frontend Deployment (Vite React on Vercel)

### Deploy on Vercel
1. Install Vercel CLI or connect via [vercel.com](https://vercel.com).
2. Import the GitHub repository.
3. Configure project build settings:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variable if connecting custom API URL:
   - `VITE_API_BASE_URL`: `https://echoaid-backend.onrender.com/api`
5. Click **Deploy**. Vercel will build and assign an SSL domain (e.g. `https://echoaid-x.vercel.app`).

---

## 🐳 3. Containerized Deployment (Docker & Docker Compose)

A production-ready `Dockerfile` and `docker-compose.yml` can run both services locally or on AWS EC2 / DigitalOcean.

### Build and Run with Docker Compose
```bash
docker-compose up --build -d
```
- Frontend will be available at `http://localhost:5173`
- Backend API will be available at `http://localhost:8080`

---

## ✅ Pre-Hackathon Demo Checklist

- [x] Test `http://localhost:5173/` in Google Chrome with microphone permissions enabled.
- [x] Verify `.env` file in `backend/.env` contains your `NVIDIA_API_KEY`.
- [x] Confirm `http://localhost:8080/api/health` returns status `ONLINE`.
- [x] Test speech recognition input by speaking into the microphone.
- [x] Test AI Tool Calling cards (`open_live_maps`, `find_nearby_hospitals`, `share_current_location`).
- [x] Verify smooth 60 FPS transitions across all Progressive Disclosure scenes.
