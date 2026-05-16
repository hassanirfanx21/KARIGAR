# KARIGAR — AI Service Orchestrator for Informal Economy
## Complete System Architecture & Technical Specification

---

## 1. Project Identity

**Name:** KARIGAR (کاریگر — Urdu for "Skilled Worker / Craftsman")  
**Purpose:** End-to-end agentic AI system that transforms a casual spoken/typed service request (in Urdu, Roman Urdu, or English) into a confirmed booking with provider matching, scheduling, and follow-up automation.  
**Hackathon:** Google AI Seekho Hackathon  
**Core Mandate:** Full agentic pipeline — not a listing app, not a booking form. The system *thinks, decides, acts, and follows up* autonomously.

---

## 2. The Big Picture (What Actually Happens)

A user types: **"Kal subah G-13 mein AC ka technician chahiye"**

The system, without any further user interaction:
1. Understands it means: AC Repair, G-13 Islamabad, Tomorrow Morning
2. Finds nearby registered AC technicians from the database
3. Ranks them by distance, rating, and availability
4. Selects the best one with clear reasoning
5. Creates a booking record (10:00 AM slot)
6. Generates a confirmation message for both user and worker
7. Schedules a reminder 1 hour before the appointment
8. Logs every decision and action with traceable reasoning

All of this happens via a **multi-agent pipeline** orchestrated through **Google Gemini (Vertex AI Agent Builder / Antigravity)**.

---

## 3. Technology Stack

### 3.1 Frontend — Mobile App (PRIMARY DELIVERABLE)

| Layer | Technology | Why |
|---|---|---|
| Framework | React Native with Expo (SDK 51+) | Cross-platform, fast iteration, Expo Go for demo |
| Navigation | Expo Router (file-based) | Clean routing, deep links |
| UI Components | React Native Paper + custom | Material Design base, customizable |
| Language Toggle | i18next + react-i18next | Urdu (Roman) ↔ English switching |
| State Management | Zustand | Lightweight, no boilerplate |
| API Client | Axios + React Query | Caching, background refetch |
| Maps | react-native-maps + Google Maps SDK | Provider locations, distance display |
| Local Storage | Expo SecureStore | Auth tokens, user preferences |
| Push Notifications | Expo Notifications | Booking confirmations, reminders |

### 3.2 Backend — API Server

| Layer | Technology | Why |
|---|---|---|
| Runtime | Node.js 20 LTS | Fast, async, great ecosystem |
| Framework | Express.js | Lightweight, flexible |
| Language | TypeScript | Type safety for complex agent data |
| Auth | Firebase Auth (JWT) | Easy social login + phone OTP |
| ORM | Prisma | Type-safe DB queries |
| Database | PostgreSQL (via Supabase) | Relational data, free tier for hackathon |
| Real-time | Supabase Realtime (WebSockets) | Live booking status updates |
| File Storage | Supabase Storage | Worker profile photos, CNIC images |
| Job Queue | BullMQ + Redis (Upstash) | Scheduled reminders, async agent tasks |
| Hosting | Google Cloud Run | Serverless, auto-scales, free tier |

### 3.3 AI / Agent Layer — THE CORE

| Component | Technology | Role |
|---|---|---|
| **Primary Orchestrator** | Google Vertex AI Agent Builder (Antigravity) | Master agent coordination, tool calling, reasoning pipeline |
| **LLM Backbone** | Gemini 1.5 Pro (via Vertex AI) | Intent parsing, reasoning, response generation |
| **Embedding Model** | text-embedding-004 (Google) | Semantic service category matching |
| **Geocoding / Distance** | Google Maps Platform (Geocoding + Distance Matrix API) | Real location resolution, km calculations |
| **Places Search** | Google Places API (Nearby Search) | Supplement mock data with real place context |
| **Agent Memory** | Vertex AI Agent Builder Session State | Carry context across multi-turn conversations |
| **Agent Tools** | Custom Cloud Functions (defined as Vertex AI Tools) | Database queries, booking writes, notification triggers |

### 3.4 Supporting Infrastructure

| Tool | Purpose |
|---|---|
| Firebase Auth | Unified auth for both users and workers |
| Supabase | PostgreSQL + Storage + Realtime in one |
| Upstash Redis | BullMQ job queue for reminders |
| Google Cloud Run | Host Express.js backend |
| Google Cloud Functions | Individual agent tools (callable by Vertex AI) |
| GitHub Actions | CI/CD pipeline |
| Expo EAS Build | App builds for demo/submission |

---

## 4. Full Agentic Pipeline — The Heart of KARIGAR

This is the most critical part of the system. Every user request passes through **5 specialized agents** coordinated by a **Master Orchestrator**. Each agent has defined inputs, outputs, tools, and logs.

---

### AGENT 0 — Master Orchestrator (Google Vertex AI Agent Builder)

**Role:** The brain. Receives the raw user message, decides which agents to call, in what order, and assembles the final response. This is the Antigravity component — it manages the full multi-step reasoning pipeline.

**Trigger:** Every new user message in the chat interface.

**What it does:**
- Parses the incoming message
- Routes to Agent 1 (Intent Parser) first
- After each agent responds, decides next action
- Handles fallbacks (e.g., if no providers found, asks user to widen area)
- Assembles the final structured output card shown to the user
- Maintains session state (conversation memory across turns)

**Vertex AI Configuration:**
- Agent type: Conversational Agent with Tool Use enabled
- Tools registered: all Cloud Function endpoints (one per agent below)
- System instruction: defines its role as an orchestrator, not a responder
- Grounding: disabled (we handle our own data)
- State persistence: per-session (tied to user ID)

**Log output:**
```
[ORCHESTRATOR] Session: usr_abc123
[ORCHESTRATOR] Received: "Kal subah G-13 mein AC ka technician chahiye"
[ORCHESTRATOR] Routing to → IntentAgent
[ORCHESTRATOR] IntentAgent returned: {service: "AC Technician", location: "G-13", time: "tomorrow_morning"}
[ORCHESTRATOR] Routing to → ProviderDiscoveryAgent
[ORCHESTRATOR] ProviderDiscoveryAgent returned: 4 candidates
[ORCHESTRATOR] Routing to → MatchingAgent
[ORCHESTRATOR] MatchingAgent returned: best_match = worker_xyz
[ORCHESTRATOR] Routing to → BookingAgent
[ORCHESTRATOR] BookingAgent returned: booking_id = BK-20240912-0047
[ORCHESTRATOR] Routing to → FollowUpAgent
[ORCHESTRATOR] FollowUpAgent returned: reminder scheduled at T-60min
[ORCHESTRATOR] Assembling final response card
```

---

### AGENT 1 — Intent Parser Agent

**Role:** Extract structured meaning from messy natural language input in any of the three supported languages.

**Input:** Raw user text (string)  
**Output:** Structured JSON — `{ service_type, service_category, location_raw, location_resolved, time_preference, urgency, language_detected }`

**Implementation:** Cloud Function wrapping a direct Gemini API call with a strict JSON-output system prompt.

**System Prompt Strategy:**
The agent is given a prompt that:
- Lists all supported service categories (AC, Plumber, Electrician, Tutor, etc.)
- Lists known Islamabad/Rawalpindi sectors for location matching
- Maps Roman Urdu time phrases to time slots (e.g., "kal subah" → tomorrow_morning → 09:00–12:00)
- Instructs output to be ONLY valid JSON (no prose)

**Language Handling:**
- Urdu (Arabic script): Gemini natively handles it
- Roman Urdu: Gemini handles it with prompt examples ("kal subah", "abhi", "shaam ko")
- English: Default
- Mixed (code-switching): Gemini handles gracefully, prompt provides examples

**Time Resolution Logic:**
```
"abhi" / "ابھی"           → today, next available slot (within 2 hours)
"aaj" / "آج"              → today, user picks slot
"kal subah"               → tomorrow, 09:00–12:00
"kal dopahar"             → tomorrow, 12:00–15:00
"kal shaam"               → tomorrow, 15:00–18:00
"parso"                   → day after tomorrow
specific time             → parsed directly
```

**Location Resolution:**
- Raw string sent to Google Maps Geocoding API
- Returns lat/lng coordinates + formatted address
- Fallback: fuzzy match against known sectors list

**Tool called by Orchestrator:** `POST /tools/intent-parse`

**Log output:**
```
[INTENT_AGENT] Input: "Kal subah G-13 mein AC ka technician chahiye"
[INTENT_AGENT] Language detected: Roman Urdu
[INTENT_AGENT] Gemini parsed: service="AC Technician", raw_location="G-13", time="kal subah"
[INTENT_AGENT] Geocoding G-13 → {lat: 33.6844, lng: 73.0479, formatted: "G-13, Islamabad"}
[INTENT_AGENT] Time resolved: tomorrow_morning → 2024-09-13 09:00–12:00
[INTENT_AGENT] Output: {service_type: "AC Technician", category: "hvac", location: {lat, lng, label: "G-13, Islamabad"}, time_slot: {date: "2024-09-13", window: "09:00-12:00"}, urgency: "normal"}
```

---

### AGENT 2 — Provider Discovery Agent

**Role:** Query the worker database for registered providers who match the service category and are within a reasonable radius.

**Input:** `{ category, location: {lat, lng}, time_slot }`  
**Output:** Array of provider candidates with raw data

**Implementation:** Cloud Function that:
1. Queries PostgreSQL for workers matching `service_category = 'hvac'` (or mapped category)
2. Filters by `is_available = true` and `is_verified = true`
3. Optionally supplements with Google Places Nearby Search for extra context (not for booking, just discovery enrichment)
4. Returns up to 10 candidates with their coordinates

**Database Query Logic:**
```sql
SELECT w.*, 
       (6371 * acos(cos(radians($lat)) * cos(radians(w.lat)) * 
        cos(radians(w.lng) - radians($lng)) + 
        sin(radians($lat)) * sin(radians(w.lat)))) AS distance_km
FROM workers w
WHERE w.service_category = $category
  AND w.is_available = true
  AND w.is_verified = true
HAVING distance_km < 15
ORDER BY distance_km ASC
LIMIT 10;
```

**Availability Cross-Check:**
- Query `bookings` table for each worker on the requested date/window
- Mark as `available: false` if slot is taken

**Tool called by Orchestrator:** `POST /tools/discover-providers`

**Log output:**
```
[DISCOVERY_AGENT] Searching for: category=hvac, location=(33.6844, 73.0479), radius=15km
[DISCOVERY_AGENT] DB query returned: 6 workers
[DISCOVERY_AGENT] Availability check: 2 workers have conflicts on 2024-09-13 09:00-12:00
[DISCOVERY_AGENT] Available candidates: 4 workers
[DISCOVERY_AGENT] Workers: [Ali AC Services (2.1km), Hassan Cooling (3.4km), Tariq HVAC (5.2km), Brothers AC (7.8km)]
```

---

### AGENT 3 — Matching & Ranking Agent

**Role:** Score and rank providers using multi-factor logic, then produce a clear human-readable reasoning for the selection.

**Input:** Array of provider candidates  
**Output:** `{ recommended_provider, ranking, reasoning_text, alternatives[] }`

**Scoring Formula (weighted):**

| Factor | Weight | Source |
|---|---|---|
| Distance (closer = higher score) | 35% | Haversine from Agent 2 |
| Rating (1–5 stars, worker-registered) | 30% | Worker profile |
| Completed Jobs Count | 20% | Booking history |
| Response Rate | 10% | Historical acceptance |
| Price Tier (lower = slight preference) | 5% | Worker profile |

**Score Calculation:**
```
distance_score  = (1 - distance_km / max_distance) * 100
rating_score    = (rating / 5) * 100
jobs_score      = min(completed_jobs / 50, 1) * 100  // caps at 50 jobs = 100
response_score  = acceptance_rate * 100

final_score = (distance_score * 0.35) + (rating_score * 0.30) + 
              (jobs_score * 0.20) + (response_score * 0.10) + 
              (price_score * 0.05)
```

**Reasoning Generation:**
After scoring, the agent calls Gemini with the top provider's data to generate a short, user-friendly explanation in the appropriate language:

> "Ali AC Services ko select kiya gaya kyunke yeh sirf 2.1 km door hain, unki rating 4.8/5 hai, aur unhone 47 jobs successfully complete ki hain."

**Tool called by Orchestrator:** `POST /tools/match-rank`

**Log output:**
```
[MATCHING_AGENT] Scoring 4 candidates...
[MATCHING_AGENT] Ali AC Services: distance=91.6, rating=96.0, jobs=94.0, response=88.0 → SCORE=92.4
[MATCHING_AGENT] Hassan Cooling: distance=79.2, rating=84.0, jobs=60.0, response=90.0 → SCORE=78.9
[MATCHING_AGENT] Tariq HVAC: distance=65.4, rating=88.0, jobs=80.0, response=70.0 → SCORE=75.1
[MATCHING_AGENT] Brothers AC: distance=48.0, rating=72.0, jobs=40.0, response=65.0 → SCORE=56.8
[MATCHING_AGENT] Recommended: Ali AC Services (score: 92.4)
[MATCHING_AGENT] Reasoning generated in Roman Urdu
```

---

### AGENT 4 — Booking Execution Agent

**Role:** Simulate the complete booking transaction — create the booking record, assign the provider, confirm the slot, and generate receipts.

**Input:** `{ user_id, worker_id, time_slot, service_type, location }`  
**Output:** `{ booking_id, status, confirmation_message, receipt }`

**What it creates:**

1. **Booking Record** in PostgreSQL:
```json
{
  "booking_id": "BK-20240913-0047",
  "user_id": "usr_abc123",
  "worker_id": "wrk_xyz789",
  "service_type": "AC Technician",
  "status": "confirmed",
  "slot_date": "2024-09-13",
  "slot_time": "10:00 AM",
  "location_label": "G-13, Islamabad",
  "location_lat": 33.6844,
  "location_lng": 73.0479,
  "created_at": "2024-09-12T14:23:11Z",
  "confirmation_code": "KRG-4751"
}
```

2. **Worker Notification** (push notification via Expo Notifications / FCM):
```
New Booking! [BK-20240913-0047]
Service: AC Technician
Location: G-13, Islamabad
Time: Tomorrow, 10:00 AM
Customer: Confirmed
```

3. **User Confirmation Card** (rendered in app):
```
✅ Booking Confirmed!
ID: BK-20240913-0047
Provider: Ali AC Services
Time: Tomorrow, 10:00 AM
Location: G-13, Islamabad
Code: KRG-4751
```

4. **Simulated SMS/WhatsApp message** (logged as mock, shown in demo):
```
KARIGAR: Aapki booking confirm ho gayi!
Booking ID: BK-20240913-0047
Ali AC Services kal 10:00 AM par aayenge.
Confirmation Code: KRG-4751
```

**Tool called by Orchestrator:** `POST /tools/execute-booking`

**Log output:**
```
[BOOKING_AGENT] Creating booking for user usr_abc123 with worker wrk_xyz789
[BOOKING_AGENT] Slot 2024-09-13 10:00 AM confirmed available
[BOOKING_AGENT] DB write: bookings table → booking_id BK-20240913-0047
[BOOKING_AGENT] Worker notification sent via FCM
[BOOKING_AGENT] User confirmation card generated
[BOOKING_AGENT] Mock WhatsApp message logged
[BOOKING_AGENT] Booking status: CONFIRMED
```

---

### AGENT 5 — Follow-Up Automation Agent

**Role:** Schedule and execute all post-booking interactions without any user trigger.

**Input:** `{ booking_id, slot_datetime, user_id, worker_id }`  
**Output:** Scheduled job IDs + confirmation of what was queued

**What it schedules (via BullMQ + Upstash Redis):**

| Job | Trigger Time | Action |
|---|---|---|
| User reminder | 1 hour before slot | Push notification to user |
| Worker reminder | 2 hours before slot | Push notification to worker |
| "On my way" prompt | 30 min before slot | Prompt worker to send status update |
| Completion check | 2 hours after slot start | Ask user to confirm job completion |
| Rating request | 30 min after completion | Ask user to rate the worker |

**BullMQ Job Definition:**
```typescript
await bookingQueue.add('user-reminder', {
  booking_id: 'BK-20240913-0047',
  user_id: 'usr_abc123',
  message: 'Ali AC Services 1 ghante mein aa rahe hain! Confirmation: KRG-4751'
}, {
  delay: timeUntilSlot - (60 * 60 * 1000), // 1 hour before
  attempts: 3,
  backoff: { type: 'exponential', delay: 5000 }
});
```

**Completion Flow:**
When user marks job as complete → Agent 5 fires:
- Updates booking status to `completed`
- Triggers rating prompt
- Updates worker's `completed_jobs` count
- Logs completion timestamp

**Tool called by Orchestrator:** `POST /tools/schedule-followup`

**Log output:**
```
[FOLLOWUP_AGENT] Scheduling follow-ups for booking BK-20240913-0047
[FOLLOWUP_AGENT] Slot time: 2024-09-13 10:00 AM PKT
[FOLLOWUP_AGENT] Job queued: worker-reminder → fires at 08:00 AM (delay: 63600000ms)
[FOLLOWUP_AGENT] Job queued: user-reminder → fires at 09:00 AM (delay: 67200000ms)
[FOLLOWUP_AGENT] Job queued: completion-check → fires at 12:00 PM (delay: 86400000ms)
[FOLLOWUP_AGENT] Job queued: rating-request → fires at 12:30 PM
[FOLLOWUP_AGENT] All follow-ups scheduled successfully
```

---

## 5. Data Architecture

### 5.1 Worker Registration Flow

Workers register through the same mobile app (separate "Worker Mode" tab) or a dedicated onboarding screen.

**Worker Registration Fields:**
```typescript
interface WorkerProfile {
  // Identity
  full_name: string
  phone_number: string         // Pakistani format: +92-XXX-XXXXXXX
  cnic_number: string          // 13-digit, verified format
  profile_photo_url: string    // Supabase Storage
  cnic_front_photo_url: string
  
  // Service
  service_category: ServiceCategory  // enum: hvac, plumbing, electrical, etc.
  service_tags: string[]             // ["AC repair", "AC installation", "refrigerator"]
  years_experience: number
  price_per_hour: number             // PKR
  price_type: 'hourly' | 'fixed' | 'negotiable'
  
  // Location
  home_area: string                  // "G-13, Islamabad"
  service_radius_km: number          // How far they're willing to travel
  lat: number
  lng: number
  
  // Availability
  available_days: string[]           // ["monday", "tuesday", ...]
  available_hours: string            // "08:00-18:00"
  is_available: boolean              // Toggle (for day-off, vacation)
  
  // Status
  is_verified: boolean               // Admin-verified CNIC
  rating: number                     // 1-5, starts at 0 (no ratings yet)
  completed_jobs: number
  acceptance_rate: number
  fcm_token: string                  // For push notifications
}
```

**Service Categories (Enum):**
```
hvac         → AC / Cooling technicians
plumbing     → Plumbers
electrical   → Electricians
tutoring     → Home tutors (also subject: maths, english, etc.)
beauty       → Beauticians, salon at home
cleaning     → House cleaning services
carpentry    → Carpenters, furniture repair
painting     → House painters
driving      → Drivers (personal, school van)
gardening    → Gardeners / mali
```

### 5.2 Database Schema (PostgreSQL via Supabase)

**Table: users**
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
firebase_uid TEXT UNIQUE NOT NULL
full_name TEXT
phone_number TEXT
preferred_language TEXT DEFAULT 'roman_urdu'  -- 'roman_urdu' | 'urdu' | 'english'
created_at TIMESTAMPTZ DEFAULT now()
```

**Table: workers**
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
firebase_uid TEXT UNIQUE NOT NULL
full_name TEXT NOT NULL
phone_number TEXT NOT NULL
cnic_number TEXT UNIQUE NOT NULL
service_category TEXT NOT NULL
service_tags TEXT[]
price_per_hour INTEGER
home_area TEXT
lat DOUBLE PRECISION
lng DOUBLE PRECISION
service_radius_km INTEGER DEFAULT 10
available_days TEXT[]
available_hours TEXT
is_available BOOLEAN DEFAULT true
is_verified BOOLEAN DEFAULT false
rating DECIMAL(3,2) DEFAULT 0
completed_jobs INTEGER DEFAULT 0
acceptance_rate DECIMAL(5,2) DEFAULT 100.0
fcm_token TEXT
profile_photo_url TEXT
created_at TIMESTAMPTZ DEFAULT now()
```

**Table: bookings**
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
booking_ref TEXT UNIQUE NOT NULL    -- "BK-YYYYMMDD-XXXX"
user_id UUID REFERENCES users(id)
worker_id UUID REFERENCES workers(id)
service_type TEXT NOT NULL
status TEXT NOT NULL DEFAULT 'confirmed'  -- confirmed | in_progress | completed | cancelled
slot_date DATE NOT NULL
slot_time TIME NOT NULL
location_label TEXT
location_lat DOUBLE PRECISION
location_lng DOUBLE PRECISION
confirmation_code TEXT NOT NULL
user_rating INTEGER                 -- 1-5, filled after completion
user_review TEXT
agent_reasoning JSONB              -- Full reasoning trace from agents
created_at TIMESTAMPTZ DEFAULT now()
completed_at TIMESTAMPTZ
```

**Table: agent_logs**
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
booking_id UUID REFERENCES bookings(id)
session_id TEXT
agent_name TEXT NOT NULL
action TEXT NOT NULL
input_data JSONB
output_data JSONB
duration_ms INTEGER
created_at TIMESTAMPTZ DEFAULT now()
```

**Table: scheduled_jobs**
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
booking_id UUID REFERENCES bookings(id)
job_type TEXT NOT NULL        -- 'user_reminder' | 'worker_reminder' | 'completion_check' | 'rating_request'
scheduled_at TIMESTAMPTZ
executed_at TIMESTAMPTZ
status TEXT DEFAULT 'pending'
bullmq_job_id TEXT
```

---

## 6. Mobile App Architecture (React Native + Expo)

### 6.1 App Structure (Expo Router)

```
app/
├── (auth)/
│   ├── welcome.tsx          -- Language selection + sign in
│   ├── login.tsx            -- Phone OTP login
│   └── register.tsx         -- User registration
├── (user)/
│   ├── _layout.tsx          -- Tab navigator
│   ├── index.tsx            -- Home: chat/request input
│   ├── bookings.tsx         -- My bookings list
│   ├── booking/[id].tsx     -- Booking detail + status
│   └── profile.tsx          -- User profile settings
├── (worker)/
│   ├── _layout.tsx
│   ├── dashboard.tsx        -- Worker's incoming bookings
│   ├── register.tsx         -- Worker onboarding (multi-step)
│   ├── availability.tsx     -- Toggle availability, set hours
│   └── profile.tsx          -- Worker profile edit
└── _layout.tsx              -- Root layout, auth check
```

### 6.2 The Core User Experience — Chat Interface (Home Screen)

The main screen is a **conversational chat UI**, not a form.

- Large input field at bottom (supports Urdu keyboard)
- Language toggle in top bar (Roman Urdu / اردو / English)
- As the user types and submits, a real-time **agent trace card** expands showing:
  - "Samajh raha hoon..." (Understanding...)
  - "Providers dhoond raha hoon..." (Finding providers...)
  - "Best match select kar raha hoon..." (Selecting best match...)
  - Final booking confirmation card
- The trace is fetched from the agent log stream (Server-Sent Events or polling)

### 6.3 Multilingual Implementation

**i18n Keys (sample):**
```json
{
  "roman_urdu": {
    "home_placeholder": "Kya service chahiye? (e.g., plumber, AC technician)",
    "agent_thinking": "Samajh raha hoon...",
    "agent_finding": "Karigar dhoond raha hoon...",
    "agent_matching": "Best match select kar raha hoon...",
    "booking_confirmed": "Booking confirm ho gayi!",
    "provider_found": "{{name}} — {{distance}} door, Rating: {{rating}}/5"
  },
  "english": {
    "home_placeholder": "What service do you need? (e.g., plumber, AC technician)",
    "agent_thinking": "Understanding your request...",
    ...
  }
}
```

The app saves the user's language preference and passes it to the backend so agent-generated text (reasoning, confirmations) comes back in the right language.

---

## 7. Backend API Structure (Express.js + TypeScript)

```
src/
├── routes/
│   ├── auth.routes.ts        -- Firebase token verification
│   ├── worker.routes.ts      -- CRUD for worker profiles
│   ├── booking.routes.ts     -- Booking CRUD + status
│   └── agent.routes.ts       -- Proxy to Vertex AI agent pipeline
├── agents/
│   ├── orchestrator.ts       -- Calls Vertex AI Agent Builder
│   ├── tools/
│   │   ├── intentParser.ts   -- Agent 1 implementation
│   │   ├── providerDiscovery.ts  -- Agent 2 implementation
│   │   ├── matchRanker.ts    -- Agent 3 implementation
│   │   ├── bookingExecutor.ts   -- Agent 4 implementation
│   │   └── followUpScheduler.ts -- Agent 5 implementation
├── services/
│   ├── gemini.service.ts     -- Vertex AI Gemini API wrapper
│   ├── maps.service.ts       -- Google Maps API wrapper
│   ├── notifications.service.ts -- FCM push notifications
│   └── queue.service.ts      -- BullMQ + Redis job management
├── middleware/
│   ├── auth.middleware.ts    -- Firebase JWT verification
│   └── logging.middleware.ts -- Agent trace logger
├── db/
│   └── prisma.ts             -- Prisma client
└── index.ts
```

### 7.1 Main Agent API Endpoint

```
POST /api/agent/request
Authorization: Bearer <firebase_jwt>

Body: {
  message: string,          // Raw user input
  language: string,         // 'roman_urdu' | 'urdu' | 'english'
  session_id: string        // For Vertex AI session continuity
}

Response (streaming SSE):
data: {"step": "intent", "status": "processing"}
data: {"step": "intent", "status": "done", "result": {...}}
data: {"step": "discovery", "status": "processing"}
data: {"step": "discovery", "status": "done", "result": {...}}
...
data: {"step": "complete", "booking": {...}, "reasoning": "..."}
```

---

## 8. Google Antigravity (Vertex AI Agent Builder) — Central Role

This section specifically addresses the mandatory Antigravity requirement.

### 8.1 What Antigravity Manages

The Vertex AI Agent Builder project hosts the **KARIGAR Master Orchestrator Agent** configured with:

**Agent Settings:**
- Model: gemini-1.5-pro-002
- Max turns: 10
- Tool calling: enabled
- Session state: server-side (persists across conversation turns)

**Registered Tools (OpenAPI spec sent to Vertex AI):**
```yaml
tools:
  - name: parse_intent
    description: Parse natural language service request into structured data
    endpoint: https://karigar-api.run.app/tools/intent-parse
    
  - name: discover_providers  
    description: Find available workers near given coordinates for a service category
    endpoint: https://karigar-api.run.app/tools/discover-providers
    
  - name: rank_and_match
    description: Score and rank providers, generate recommendation reasoning
    endpoint: https://karigar-api.run.app/tools/match-rank
    
  - name: execute_booking
    description: Create confirmed booking record, notify worker, generate receipt
    endpoint: https://karigar-api.run.app/tools/execute-booking
    
  - name: schedule_followup
    description: Queue reminder and follow-up jobs for a booking
    endpoint: https://karigar-api.run.app/tools/schedule-followup
    
  - name: geocode_location
    description: Convert a text location to lat/lng coordinates via Google Maps
    endpoint: https://karigar-api.run.app/tools/geocode
```

**Master Orchestrator System Prompt (abbreviated):**
```
You are KARIGAR, an AI service orchestrator for Pakistan's informal economy.
Your job is to help users book skilled workers (plumbers, AC technicians, electricians, etc.)

When a user sends a request:
1. Always call parse_intent first to extract service, location, and time
2. Call discover_providers with the extracted data
3. Call rank_and_match with the provider list
4. If providers are found, call execute_booking with the best match
5. Always call schedule_followup after a successful booking
6. Respond in the same language as the user

If no providers are found: ask if the user wants to expand the search radius or try a different time.
If the request is unclear: ask one clarifying question (not multiple).
Always be brief. Show the booking card, not a long explanation.
```

### 8.2 Multi-Turn Conversation Handling

Antigravity maintains session state, enabling:
- User: "Plumber chahiye" → Agent asks: "Kahan aur kab?"
- User: "G-9, kal" → Agent now has full context, proceeds
- User: "Actually kal nahi, parso" → Agent modifies time slot
- User: "Theek hai, confirm karo" → Agent executes booking

All of this is managed by Vertex AI's built-in conversation state — no manual context tracking needed in the backend.

---

## 9. Worker Registration Flow (Step-by-Step)

The worker onboarding in the app is a 4-step wizard:

**Step 1 — Personal Info**
- Full name, phone number
- CNIC number (validated format: XXXXX-XXXXXXX-X)
- Profile photo upload (camera or gallery)

**Step 2 — Service Details**
- Service category (picker with Roman Urdu labels)
- Service tags (multi-select chips: "AC Repair", "AC Installation", etc.)
- Years of experience (slider)
- Price per hour / fixed rate (PKR)

**Step 3 — Location & Availability**
- Home area (text with Google Places autocomplete)
- Service radius (5km / 10km / 15km / 20km slider)
- Available days (day-of-week toggles)
- Available hours (time range picker)

**Step 4 — Review & Submit**
- Summary of all entered data
- Agreement to terms
- Submit → creates worker record with `is_verified: false`
- Admin panel can then verify CNIC and flip `is_verified: true`

After verification, the worker appears in discovery results.

---

## 10. Agent Trace Logging (Audit Trail)

Every agent action writes to the `agent_logs` table. The mobile app fetches these logs and renders them as a live trace for the user — giving transparency into what the system is doing.

**Agent Trace Card (shown in app):**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 KARIGAR Agent Trace
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Intent Parsed           [0.8s]
   Service: AC Technician
   Location: G-13, Islamabad
   Time: Kal Subah (10:00 AM)

✅ Providers Found         [1.2s]
   4 available workers near G-13

✅ Best Match Selected     [0.6s]
   Ali AC Services — Score: 92.4
   Reason: Nearest + highest rating

✅ Booking Confirmed       [0.4s]
   ID: BK-20240913-0047
   Code: KRG-4751

✅ Reminders Scheduled     [0.2s]
   3 follow-up jobs queued
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total: 3.2 seconds
```

This trace is the **required "Agent Trace / Logs" deliverable** from the hackathon brief.

---

## 11. Mock Data Strategy

For demo purposes (when real workers haven't registered), the system ships with 20 pre-seeded mock workers:

```typescript
const mockWorkers = [
  {
    full_name: "Ali AC Services",
    service_category: "hvac",
    service_tags: ["AC repair", "AC installation", "gas refilling"],
    home_area: "G-13, Islamabad",
    lat: 33.6844, lng: 73.0479,
    service_radius_km: 10,
    rating: 4.8,
    completed_jobs: 47,
    price_per_hour: 1500,
    is_verified: true,
    is_available: true
  },
  // ... 19 more across different categories and Islamabad/Rawalpindi sectors
]
```

The discovery agent uses real database queries — mock data is just pre-seeded. There's no hardcoding in agent logic.

---

## 12. Request Flow Summary (End-to-End)

```
USER TYPES: "Kal subah G-13 mein AC ka technician chahiye"
     ↓
MOBILE APP sends to POST /api/agent/request (SSE stream)
     ↓
BACKEND calls Vertex AI Agent Builder (Antigravity)
     ↓
ORCHESTRATOR AGENT decides: call parse_intent tool
     ↓
INTENT AGENT: Gemini extracts {service, location, time} → geocodes location
     ↓
ORCHESTRATOR receives structured data → calls discover_providers tool
     ↓
DISCOVERY AGENT: DB query → 4 available workers within 15km
     ↓
ORCHESTRATOR → calls rank_and_match tool
     ↓
MATCHING AGENT: scores all 4 → Ali AC Services wins (92.4) → Gemini writes reasoning
     ↓
ORCHESTRATOR → calls execute_booking tool
     ↓
BOOKING AGENT: writes DB record → FCM to worker → generates receipt
     ↓
ORCHESTRATOR → calls schedule_followup tool
     ↓
FOLLOWUP AGENT: queues 3 BullMQ jobs in Redis
     ↓
ORCHESTRATOR assembles final response
     ↓
BACKEND streams all agent steps + final card back to app (SSE)
     ↓
APP renders live agent trace + booking confirmation card
```

---

## 13. Assumptions & Limitations

**Assumptions:**
- Workers use smartphones and have the app installed
- Islamabad/Rawalpindi geography for Phase 1 (sector-based naming)
- Pricing is in PKR
- Phone OTP via Firebase (Pakistani numbers supported)
- Payment is cash-on-delivery (no online payment in v1)

**Limitations:**
- No real-time worker GPS tracking (worker location is registered home area)
- WhatsApp integration is simulated (log-only, no actual WhatsApp API)
- SMS is simulated (FCM push notification used instead)
- Worker verification is manual (admin checks CNIC manually in Supabase dashboard)
- Antigravity tool calls require internet (no offline fallback)

**Demo Scope:**
- At least 1 full booking cycle will be live-demonstrated (not mocked UI)
- Agent trace logs will be shown in real-time
- Mock worker dataset pre-seeded for consistent demo

---

## 14. Evaluation Criteria Mapping

| Criterion | How KARIGAR Addresses It |
|---|---|
| Google Antigravity (25%) | Vertex AI Agent Builder is the orchestrator; all tool routing goes through it |
| Agentic Reasoning & Workflow (20%) | 5 specialized agents with defined inputs/outputs, Orchestrator manages planning → decision → action → follow-up |
| Matching Quality & Decision Logic (20%) | 5-factor weighted scoring formula with Gemini-generated reasoning text |
| Action Simulation & Execution (15%) | Real DB writes, FCM notifications, BullMQ jobs — not mock UI |
| Technical Implementation (10%) | TypeScript backend, Prisma ORM, clean agent separation, error handling |
| Innovation & UX (10%) | Multilingual chat UI, live agent trace card, Roman Urdu support |

---

*KARIGAR Architecture v1.0 — Google AI Seekho Hackathon*

## Live Frontend Notes

- The customer screens now read from the backend for trace, nearby workers, booking detail, and notifications.
- Discovery and ranking include travel time from Google Maps Distance Matrix when `GOOGLE_MAPS_API_KEY` is configured.
- Static Maps previews are optional on the frontend and use `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`.
