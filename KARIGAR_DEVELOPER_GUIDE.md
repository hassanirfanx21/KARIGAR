# KARIGAR (کاریگر) - Developer Guide & System Architecture

Welcome to the comprehensive developer documentation for KARIGAR. This guide is intended to provide a new developer with everything they need to understand the architecture, connect to the database, understand the AI agent flow, and work on the frontend/backend.

---

## 1. System Overview & Architecture Flow

KARIGAR is a dual-role React Native application (Customer & Worker) powered by a Node.js Express backend that orchestrates multiple AI agents (using Google Gemini) to fulfill service bookings.

### **The AI Agentic Pipeline**
The core of the system is the **Master Orchestrator** (`server/agents/orchestrator.js`). When a user sends a natural language request, the orchestrator triggers the following agents sequentially:

1. **Intent Agent (`intentAgent.js`)**: Parses raw multilingual text (Roman Urdu/English) into structured JSON (`service_category`, `location`, `date`, `urgency`, etc.).
2. **Discovery Agent (`discoveryAgent.js`)**: Queries the database for workers matching the category, availability, and distance. Includes an auto-expand fallback if no workers are found.
3. **Ranking Agent (`rankingAgent.js`)**: Evaluates candidates linearly based on 8 factors (distance, rating, availability, reliability, price match, etc.) and uses Gemini to generate a human-readable reasoning for the top 5 candidates.
4. **Pricing Agent (`pricingAgent.js`)**: Computes dynamic pricing based on base rate, distance surcharge, urgency multiplier, complexity, and loyalty discounts.
5. **Booking Agent (`bookingAgent.js`)**: (Triggered on user selection) Creates a confirmed booking record in the database.
6. **Notification Agent (`notificationAgent.js`)**: Generates localized confirmation messages for both the user (WhatsApp/SMS) and the worker.
7. **Follow-up Agent (`followupAgent.js`)**: Schedules chron-based reminders (e.g., 1 hour before service, post-service review).
8. **Dispute Agent (`disputeAgent.js`)**: Analyzes customer complaints and dictates next steps (Refund, Re-assign, or Manual Review).

### **Hybrid Agentic Architecture: Rules vs. Agents**
KARIGAR follows a hybrid approach where **"Rules define reality. Agents decide how to navigate it."**
- **Deterministic Rules (Reality):** Tools like `utils/geocoder.js` and `discoveryAgent.js` handle immutable physical constraints. A 10km distance is an undeniable fact. A schedule prevents a worker from being in two places at once.
- **Agentic Reasoning (Autonomy):** Agents handle ambiguity, prioritization, and fallback. `intentAgent.js` infers the context and urgency from natural language. `rankingAgent.js` weighs the importance of distance vs. rating dynamically and explains *why* a worker fits. If the hard rules yield zero matches, the orchestrator acts autonomously to relax the radius and time filters rather than outright failing.

---

## 2. Connections & Data Flow

### **Frontend to Backend**
- The React Native app (`app/`) uses standard `fetch` API calls to communicate with the Node.js Express server (`server/`).
- The base URL is loaded from `constants/config.js` or `.env` (`EXPO_PUBLIC_API_URL`).
- Example: `fetch('${API_URL}/api/agent/request', ...)`

### **Backend to Database (Firestore)**
- The backend connects to Firebase Firestore via the Firebase Admin SDK (`server/config/firebase.js`).
- **Connection Status**: Requires `serviceAccountKey.json` in `server/config/` for authentication. If missing, falls back to default app credentials (for cloud deployments).

### **Backend to AI (Gemini)**
- Uses `@google/generative-ai` package (`server/utils/gemini.js`). Requires `GEMINI_API_KEY` in `server/.env`.

---

## 3. Frontend Structure & Pages Links

The frontend is built using **Expo Router** (file-based routing) and structured into two main role stacks:

### **Customer App (`app/(customer)`)**
- `index.jsx` (Home): Landing dashboard, service shortcuts, active booking preview, AI text input.
- `agent-working.jsx`: The "Trace UI" showing the orchestrator pipeline in real-time. Calls `/api/agent/request` and animates steps.
- `booking-detail.jsx`: Displays final booking summary, itemized pricing, and the agent's reasoning.
- `map.jsx`: Shows nearby workers.
- `baseline-compare.jsx`: UI to compare Agentic approach vs Standard baseline search.
- `dispute.jsx`: Form to report issues. Calls `/api/agent/dispute`.
- `profile.jsx` / `bookings.jsx`: User management and history.

### **Worker App (`app/(worker)`)**
- `index.jsx` (Dashboard): Shows online/offline toggle, today's schedule, new booking alerts, earnings stats.
- `availability.jsx` / `schedule.jsx`: Worker calendar management.
- `profile.jsx`: Worker details and settings.

### **Auth & Root**
- `app/index.jsx`: Root landing screen with animated trace UI and "Kaise Kaam Karta Hai" info.
- `app/auth/`: Contains `login.jsx`, `role-selection.jsx`, `customer-registration.jsx`, `worker-registration.jsx`.

---

## 4. API Reference

All API routes are prefixed with `/api`.

### **Agent Routes (`/api/agent`)**
- **`POST /request`**
  - **Payload**: `{ message: string, language?: string, user_id?: string }`
  - **Returns**: Parsed intent, ranked workers list, trace logs, prices.
- **`POST /book`**
  - **Payload**: `{ user_id, worker_id, intent, pricing, user_phone, worker_phone, worker_name }`
  - **Returns**: `booking_id`, `confirmation_code`, generated notifications, and follow-ups.
- **`POST /dispute`**
  - **Payload**: `{ complaint_text, language, booking, worker_history, charged_amount }`
  - **Returns**: Resolution classification, reasoning, and next steps.
- **`POST /compare`**
  - **Payload**: `{ message, language }`
  - **Returns**: Side-by-side comparison of agentic vs baseline results.
- **`GET /baseline`**
  - **Query**: `?message=...&lat=...&lng=...`
  - **Returns**: Distance-based only results.

### **Booking Routes (`/api/bookings`)**
- **`GET /:id`**: Fetches a booking document from Firestore.
- **`POST /:id/dispute`**: Submits a dispute for a specific booking ID.

### **Worker Routes (`/api/workers`)**
- **`GET /`**: Lists all workers. Optional query `?category=hvac`.
- **`GET /:id`**: Fetch specific worker details.

---

## 5. Database Schema (Firestore)

### **Collection: `workers`**
Represents service providers.
- `id` (Document ID)
- `name` (String)
- `category` (String: hvac, plumbing, electrical, etc.)
- `is_available` (Boolean)
- `is_verified` (Boolean)
- `lat` / `lng` (Numbers - Coordinates)
- `sector` (String - e.g., "G-13, Islamabad")
- `service_radius_km` (Number)
- `base_price` (Number)
- `rating` (Number: 0-5)
- `total_reviews` (Number)
- `last_review_days_ago` (Number)
- `on_time_rate` (Number: 0-100)
- `cancellation_rate` (Number: 0-100)
- `tags` (Array of Strings)
- `available_hours` (String: "09:00-18:00")
- `available_days` (Array of Strings: "mon", "tue", etc.)

### **Collection: `bookings`**
Represents a confirmed job.
- `id` / `booking_ref` (Document ID: BK-YYYYMMDD-XXXX)
- `user_id` (String)
- `worker_id` (String)
- `service_type` (String)
- `service_display` (String)
- `status` (String: 'confirmed', 'in_progress', 'completed', 'dispute_resolved')
- `slot_date` (String: YYYY-MM-DD)
- `slot_time` (Object: `{ start: "09:00", end: "12:00" }`)
- `location` (Object: `{ lat, lng, label }`)
- `pricing` (Object: `{ final_price: Number, breakdown: Array }`)
- `agent_trace` (Array of Objects - Logs of agent thought process)
- `confirmation_code` (String: KRG-XXXX)
- `created_at` (ISO Date String)
- `dispute_result` (Object - Exists if a dispute was filed)

---

## 6. How to Run Locally

### **Backend Setup**
1. `cd server`
2. `npm install`
3. Create `.env` and add: `GEMINI_API_KEY=your_key` and `PORT=3000`.
4. Place `serviceAccountKey.json` inside `server/config/` for Firestore access.
5. Run `npm start` or `npm run dev`.

### **Frontend Setup**
1. `cd ..` (root directory)
2. `npm install`
3. Create `.env` and add: `EXPO_PUBLIC_API_URL=http://<YOUR_LOCAL_IP>:3000`
4. Run `npx expo start`
5. Use the Expo Go app on your phone or hit `w` for web preview.

---

## 7. Modular Execution & Component Isolation

To develop and debug efficiently, you don't need to run the entire stack. You can run individual agents in isolation using the provided CLI scripts. This is critical for testing edge cases without relying on a mocked frontend or the complete backend pipeline.

Run these scripts from the `server` directory:

1. **Test Intent Parsing (NLP Extraction)**
   - **Command:** `node scripts/test-intent.js "your test sentence here"`
   - **Purpose:** Tests how Gemini parses your sentence into a JSON schema. Bypasses the database entirely.

2. **Test Ranking Agent (Reasoning Logic)**
   - **Command:** `node scripts/test-ranking.js`
   - **Purpose:** Runs the ranking logic against a set of hard-coded mock candidates. Useful to observe how urgency or distance affects the AI's final score and reasoning text.

3. **Test Master Orchestrator (Full Pipeline Trace)**
   - **Command:** `node scripts/test-orchestrator.js "your test sentence"`
   - **Purpose:** Runs the full End-to-End flow and prints the `trace` pipeline. Use this to verify that data passes correctly from Intent -> Discovery -> Ranking -> Pricing -> Booking.

---

## 8. Developer Notes
- **Testing without Firestore data**: Use the `npm run seed` script (if available) or manually add a document to the `workers` collection to test the pipeline.
- **Frontend vs Backend Reality**: The trace progress bar in the customer app (`agent-working.jsx`) uses mocked sequential animations to ensure a smooth UI experience. However, the final output (selected worker, pricing, booking ID, confirmation code) is generated by the true backend execution of the orchestrator.
- **Handling Quota Limits**: The `intentAgent.js` has a built-in fallback to keyword parsing if the Gemini API rate limit is hit (`429`).
- **Adding New Categories**: Update `VALID_CATEGORIES` and `CATEGORY_KEYWORDS` in `server/agents/intentAgent.js`.
