# KARIGAR (کاریگر) - System Context & State

## 1. System Overview
KARIGAR is a dual-role React Native application (Customer & Worker) powered by a Node.js Express backend. It uses Google Gemini AI to orchestrate service bookings through a hybrid agentic architecture (deterministic rules + agentic reasoning).

### The AI Agentic Pipeline
1. **Intent Agent (`intentAgent.js`)**: Parses raw text (Roman Urdu/English) into structured JSON.
2. **Discovery Agent (`discoveryAgent.js`)**: Queries Firestore for workers (category, availability, distance).
3. **Ranking Agent (`rankingAgent.js`)**: Evaluates candidates (distance, rating, etc.) + Gemini reasoning.
4. **Pricing Agent (`pricingAgent.js`)**: Computes dynamic pricing.
5. **Booking Agent (`bookingAgent.js`)**: Creates a confirmed booking in Firestore.
6. **Notification Agent (`notificationAgent.js`)**: Generates localized confirmation messages.
7. **Follow-up Agent (`followupAgent.js`)**: Schedules chron-based reminders.
8. **Dispute Agent (`disputeAgent.js`)**: Analyzes customer complaints.

## 2. Connections & Architecture
- **Frontend**: React Native with Expo Router (`app/`). Uses `fetch` to call Express.
- **Backend**: Node.js Express (`server/`).
- **Database**: Firebase Firestore (`server/config/firebase.js`).
- **AI**: Google Generative AI (Gemini 2.0 Flash) (`server/utils/gemini.js`).

## 3. Latest State & Known Issues (Diagnosis)
*   **Agent Pipeline & Orchestrator**: The frontend `agent-working.jsx` uses hardcoded animations ignoring backend status. `orchestrator.js` was running the entire process from intent parsing to booking and notifications automatically, without letting the user pick a worker.
*   **User Input & GPS**: `index.jsx` does not capture the user's GPS coordinates via `expo-location`.
*   **API Failure Handling**: Basic retry logic for Gemini, but lacks comprehensive conversational fallbacks if the API quota is hit.
*   **Notifications**: `notificationAgent.js` is mocked (`console.log` only). No actual HTTP calls.
*   **OTP & Auth**: Missing complete authentication logic (no `bcrypt` hashing, no `jsonwebtoken`, no SMS OTP provider).
*   **Data Flow**: Frontend Map (`map.jsx`) uses hardcoded dummy workers instead of pulling from the database.
*   **Database Schema & Seed**: Missing a proper seed script to test real Haversine distance matching.

## 4. Planned Activities & Current Tasks
1. **Logging**: Add `[MODULE][LEVEL]` logs across frontend/backend. Wrap API calls in `try/catch`.
2. **Pipeline Fix**: Modify `orchestrator.js` to return top 3 workers + Gemini conversational reply instead of auto-booking. Update `intentAgent.js` to strictly follow JSON schema and add fallback contingency questions.
3. **Frontend Integration**: Hook up `expo-location` in `index.jsx`. Fix `agent-working.jsx` to render real API responses and stop infinite animations.
4. **Notifications**: Add real HTTP fetch templates for WhatsApp Cloud API and JazzCash/SMS.
5. **Auth System**: Scaffold OTP generation, `bcrypt` password hashing, and JWT endpoints.
6. **Data & Map**: Add `seed.js` for real test workers and update `map.jsx` to fetch real data.

## 5. Current Live Status

- `agent-working.jsx` now renders the live backend response and trace summary instead of a static animation storyboard.
- `agent-trace.jsx` renders the actual trace payload from the backend or a booking record.
- `map.jsx` now fetches nearby workers live and can show a Google Static Maps preview.
- `booking-detail.jsx` and `notifications.jsx` now load live backend data.
- Travel time is part of discovery/ranking through Google Maps Distance Matrix when configured.
- Still intentionally left for later: APK generation, full Antigravity integration, and production auth/OTP.

---
*(Note: Update this file manually after prompts to keep the model contextually aligned with minor tweaks)*
