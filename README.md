# 🛠️ KARIGAR (کاریگر)
**AI Service Orchestrator for the Informal Economy**

[![Hackathon](https://img.shields.io/badge/Hackathon-Google_AI_Seekho-blue.svg)](#)
[![Tech Stack](https://img.shields.io/badge/Tech-React_Native_%7C_Node.js_%7C_Gemini_AI-gold.svg)](#)

KARIGAR (Urdu for *"Skilled Worker / Craftsman"*) is an end-to-end agentic AI system designed to bridge the gap between customers and informal economy workers. By transforming casual spoken or typed requests (in Urdu, Roman Urdu, or English) into confirmed bookings, KARIGAR eliminates the need for complex forms, filters, or endless scrolling.

The system **thinks, decides, acts, and follows up** entirely autonomously.

---

## ✨ How It Works (The Magic)

A user simply types:
> *"Kal subah G-13 mein AC ka technician chahiye"*

Without any further user interaction, the **KARIGAR Multi-Agent System** (orchestrated by **Google Vertex AI**) runs the entire process:

1. 🧠 **Agent 1 - Intent Parser:** Translates the natural language into structured data *(AC Repair | G-13 Islamabad | Tomorrow Morning)*.
2. 🔍 **Agent 2 - Provider Discovery:** Queries the exact coordinates against PostgreSQL for registered, available workers nearby.
3. 🏆 **Agent 3 - Matching & Ranking:** Evaluates candidates linearly based on distance (35%), rating (30%), completed jobs (20%), response rate (10%), and price tier (5%).
4. 📅 **Agent 4 - Booking Executor:** Locks in the slot, creates the DB record, handles worker push notifications, and generates a visual receipt.
5. 🔔 **Agent 5 - Follow-up Scheduler:** Queues up BullMQ background tasks to handle automatic appointment reminders (1 hour before) and post-service rating requests.

---

## 🚀 Key Features

- **5-Agent Autonomous Pipeline:** A Master Orchestrator delegates tasks dynamically, creating a completely zero-friction UI.
- **Natural Language Parsing**: Intelligent NLP bridging code-switched phrases (Roman Urdu + English) and temporal expressions ("kal dopahar", "parso"). 
- **Dual-Role Unified App**: A single React Native codebase sharing generic components but splitting entirely different core experiences for **Customers** (chat & map) and **Workers** (earnings & scheduling dashboard).
- **Transparency via "Agent Trace"**: A dedicated developer overlay UI allowing users to watch the LLM think, parse tool outputs, and evaluate reasoning in real-time.
- **Post-Booking Lifecycle**: 100% automated worker dispatching and background job queueing.

---

## 💻 Complete Technology Stack

KARIGAR relies on a modern, serverless mobile stack emphasizing Google's AI capabilities.

### 📱 Frontend (Mobile App / Primary Component)
- **Framework:** React Native + Expo (SDK 51+)
- **Architecture:** Expo Router (File-based navigation for deep-linking)
- **State Management:** Zustand (for lightweight role and auth sync)
- **UI Components:** React Native Paper + custom Lucide Icons + centralized Tokens

### 🧠 Backend & Infrastructure Layer
- **API Runtime:** Node.js 20 LTS + Express.js
- **Database:** PostgreSQL (via Supabase)
- **Auth:** Firebase Authentication (JWTs/OTP)
- **Background Jobs:** BullMQ + Upstash Redis (for scheduled follow-ups)
- **Hosting:** Google Cloud Run (Serverless)

### 🤖 AI Engine
- **Orchestrator:** Google Vertex AI Agent Builder ("Antigravity")
- **Core Reasoning Model:** Gemini 1.5 Pro
- **Semantic Layer:** Google `text-embedding-004`
- **Location APIs:** Google Maps Platform (Geocoding + Distance Matrix)

---

## 📂 Project Structure

```text
KarigarApp/
├── app/                      
│   ├── (customer)/           # Customer stack (Search Chat, Map Context, Booking Logs)
│   ├── (worker)/             # Worker stack (Dashboard metrics, Schedule, Availability)
│   ├── auth/                 # Role-based user/worker onboarding
│   ├── agent-trace.jsx       # Real-time transparent AI logic observer
│   └── _layout.jsx           # Global Navigation & Zustand context 
├── components/               # Pure UI modules (RatingModals, Loaders)
└── constants/theme.js        # Universal UX boundaries (Colors, Fonts)
```

---

## 🛠️ Quick Start

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [Expo CLI](https://expo.dev/)

### 2. Installation
```bash
git clone https://github.com/hassanirfanx21/Karigar.git
cd KarigarApp
npm install --legacy-peer-deps
```

### 3. Run the Development Server
```bash
npx expo start
```
* **Web Preview:** Press `w` in the terminal to bundle the web platform via Metro.
* **Mobile Preview:** Download **Expo Go** on your device and scan the terminal QR code.

---

## 📖 Complete Developer Documentation

For an exhaustive guide on the system, including:
- Detailed Architecture Flow
- Database Collections & Table Formats (Firestore)
- Complete API Reference & Data Formats
- Backend-to-Frontend Connection Status

Please read the newly created: [**KARIGAR_DEVELOPER_GUIDE.md**](./KARIGAR_DEVELOPER_GUIDE.md)

---
*Developed proudly for the **Google AI Seekho Hackathon 2026**.*

## Current Implementation Notes

- The customer-facing trace, nearby workers, notifications, and booking detail screens now consume live backend data instead of hardcoded demo lists.
- Google Maps support is wired for travel-time calculations on the backend and optional Static Maps previews on the frontend when `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` is provided.
- The ranking pipeline now includes travel time alongside distance, rating, availability, price fit, reliability, skill match, review recency, and cancellation rate.