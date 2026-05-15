# 🛠️ KARIGAR (کاریگر)
**AI Service Orchestrator for the Informal Economy**

> Built for the **Google AI Seekho Hackathon**

KARIGAR (Urdu for "Skilled Worker / Craftsman") is an end-to-end agentic AI system that transforms casual spoken or typed service requests (in Urdu, Roman Urdu, or English) into confirmed bookings automatically. It handles provider matching, scheduling, and follow-up automation without requiring users to navigate complex forms or filters.

---

## ✨ The Big Picture

Instead of scrolling through listings, a user simply types:
> *"Kal subah G-13 mein AC ka technician chahiye"*

The **KARIGAR Multi-Agent System**, powered by **Google Gemini**, takes over:
1. **Intent Parser:** Understands it means: AC Repair, G-13 Islamabad, Tomorrow Morning.
2. **Provider Discovery:** Finds nearby registered AC technicians from the database.
3. **Matching & Ranking:** Ranks them by distance, rating, and availability.
4. **Booking Executor:** Selects the best match and creates a booking record.
5. **Follow-up Scheduler:** Generates a confirmation message and schedules a reminder.

---

## 🚀 Features

- **Multi-Agent Architecture**: 5 specialized agents coordinated via Google Vertex AI Agent Builder.
- **Natural Language Booking**: Zero forms. Book services using conversational Urdu/English.
- **Agent Trace Transparency**: A dedicated UI screen to watch the AI's `thought process` and tool-calling live.
- **Unified Dual Portal**: Single app serving both Customers and Workers with role-based routing.
- **Real-time Notifications**: Real-time mock alerts for booking confirmations, reminders, and ratings.

---

## 💻 Tech Stack

### Frontend (This Repository)
- **Framework:** React Native + Expo (SDK 51+)
- **Navigation:** Expo Router (File-based routing)
- **UI & Styling:** React Native Reanimated, Expo Linear Gradient, Lucide Icons
- **Fonts:** `@expo-google-fonts/inter`
- **State/Architecture:** Component-based architecture with centralized theming (`constants/theme.js`).

### Backend & AI (Architecture Blueprint)
- **AI Backbone:** Google Gemini 1.5 Pro via Vertex AI Agent Builder (Antigravity).
- **Embeddings & Location:** `text-embedding-004`, Google Maps Geocoding & Distance Matrix API.
- **Backend:** Node.js, Express, TypeScript.
- **Database / Auth:** PostgreSQL (Supabase), Firebase Auth.

---

## 📂 Project Structure

```text
KarigarApp/
├── app/                      # Expo Router File-based Navigation
│   ├── (customer)/           # Customer-specific Tab Screens
│   ├── (worker)/             # Worker-specific Tab Screens
│   ├── auth/                 # Login & Registration Flows
│   ├── _layout.jsx           # Root App Layout
│   ├── agent-trace.jsx       # AI Agent Thinking Trace UI
│   └── notifications.jsx     # Global Notifications UI
├── components/               # Reusable UI Components
│   └── RatingModal.jsx       # Cross-platform Review Bottom Sheet
├── constants/                # Shared Design Tokens
│   └── theme.js              # Centralized Colors, Spacing, Typography
└── package.json              # Project Dependencies
```

---

## 💾 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or newer)
- [Expo CLI](https://expo.dev/)

### Installation & Run

1. **Clone the repository**
   ```bash
   git clone https://github.com/hassanirfanx21/Karigar.git
   cd Karigar
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **View the app**
   - Press **`w`** to open the app in a web browser.
   - Or download the **Expo Go** app on your phone and scan the QR code in the terminal.

---

## 📱 Screens Preview

- **Landing/Auth:** Clean role selection (Customer vs Worker) with specific onboarding funnels.
- **Customer Portal:** Intelligent service search, map-based provider tracking, dynamic booking screens.
- **Worker Portal:** Job marketplace, schedule management, availability toggles, and earnings dashboard.
- **Agent Trace:** Visual "under-the-hood" view to show hackathon judges exactly how the Gemini LLM is parsing, reasoning, and acting.

---
*Created for the Google AI Seekho Hackathon*