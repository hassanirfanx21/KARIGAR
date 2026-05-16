# KARIGAR — Complete UI Architecture & Design Specification
### Mobile App (React Native + Expo) — Frontend Only

---

## PART 1 — DESIGN SYSTEM FOUNDATION

---

### 1.1 Colour Palette

Every colour in the app traces back to this core palette. Nothing outside it is used.

| Token Name | Hex | Usage |
|---|---|---|
| `white-pure` | #FFFFFF | Page backgrounds, input fields, most surfaces |
| `white-soft` | #F7F3EE | Section backgrounds, cards on white bg |
| `charcoal-deep` | #1A1A1A | Primary text, dark navbar, footer |
| `charcoal-mid` | #2E2E2E | Dark card surfaces, agent trace background |
| `charcoal-light` | #3D3D3D | Secondary text on dark, icon fills |
| `brown-matte` | #5C3D2E | Card backgrounds, section dividers, pill chips |
| `brown-warm` | #7A5040 | Card hover state, secondary brown elements |
| `brown-surface` | #8B6150 | Borders on brown cards, image overlay tint |
| `gold-primary` | #C49A5A | ALL primary CTAs, active states, highlights, logo accent |
| `gold-light` | #D4AF78 | Secondary gold, star ratings, tag borders |
| `gold-muted` | #E8D4AA | Light gold backgrounds, shimmer loader tint |
| `text-on-dark` | #F0EDE8 | All text placed on charcoal or brown surfaces |
| `text-muted` | #9E9E9E | Placeholder text, timestamps, captions |
| `error-red` | #C0392B | Form errors, cancel actions |
| `success-green` | #2E7D52 | Booking confirmed states, verified badge |

---

### 1.2 Typography System

**Font Family:** Inter (Primary) + Noto Nastaliq Urdu (for Urdu script toggle)

All sizes use a strict 4-point scale.

| Role | Font | Weight | Size | Colour Default |
|---|---|---|---|---|
| `display-hero` | Inter | 900 Black | 56px | white-pure or gold-primary |
| `display-title` | Inter | 800 ExtraBold | 32px | charcoal-deep |
| `section-heading` | Inter | 700 Bold | 24px | charcoal-deep |
| `card-title` | Inter | 600 SemiBold | 18px | text-on-dark / charcoal-deep |
| `body-primary` | Inter | 400 Regular | 16px | charcoal-deep |
| `body-secondary` | Inter | 400 Regular | 14px | charcoal-light |
| `label-caps` | Inter | 600 SemiBold | 11px | gold-primary (uppercase) |
| `caption` | Inter | 400 Regular | 12px | text-muted |
| `urdu-body` | Noto Nastaliq | 400 Regular | 18px | charcoal-deep or text-on-dark |
| `urdu-hero` | Noto Nastaliq | 700 Bold | 28px | gold-primary |

Line heights: body = 1.6x, headings = 1.2x. Generous letter spacing on `label-caps` (+0.08em).

---

### 1.3 Spacing & Grid

- Base unit: 4px
- Screen horizontal padding: 20px (consistent across all screens)
- Card internal padding: 20px top/bottom, 20px left/right
- Stack spacing between major sections: 32px
- Stack spacing between related elements: 12–16px
- Corner radius: Cards = 16px. Buttons = 12px. Chips/Badges = 999px (full pill). Bottom Sheet = 24px top corners only.

---

### 1.4 Elevation & Shadow System

No harsh drop shadows. Subtle layering only.

- `shadow-card`: 0px 4px 16px rgba(0,0,0,0.08) — used on white cards on white-soft background
- `shadow-float`: 0px 8px 24px rgba(0,0,0,0.14) — bottom nav, floating buttons
- `shadow-modal`: 0px 16px 48px rgba(0,0,0,0.22) — bottom sheets, login overlay
- Brown cards on charcoal background need NO shadow — contrast does the lifting.

---

### 1.5 Iconography

- Library: Phosphor Icons (filled weight for active, regular for inactive)
- All icons: 24px default, 20px in compact areas, 28px in tab bar
- Active icon colour: gold-primary
- Inactive icon colour: charcoal-light (on white bg) or text-on-dark (on dark bg)
- Special icons: Worker role uses a Wrench icon. Customer uses a Person icon. Agent/AI uses a Sparkle/Lightning icon in gold.

---

### 1.6 Component Tokens (Recurring UI Pieces)

**Primary Button (Gold CTA)**
- Background: gold-primary (#C49A5A)
- Text: charcoal-deep, Inter 600, 16px
- Height: 52px
- Radius: 12px
- Width: full-width (stretch to screen minus 40px padding)
- Active press state: background darkens to #A8824A
- Loading state: gold background + white spinning ring inside

**Secondary Button (Outlined)**
- Border: 1.5px solid gold-primary
- Text: gold-primary, Inter 600, 16px
- Background: transparent
- Height: 52px

**Ghost Button (Text only)**
- Text: charcoal-light, Inter 500, 14px
- No border, no background
- Used for "Skip", "Cancel", "Back" actions

**Input Field (Standard)**
- Background: white-pure
- Border: 1px solid #E0D8D0 (resting), gold-primary (focused)
- Label above field: label-caps style
- Placeholder: text-muted
- Height: 52px, radius 12px
- Error state: border turns error-red, small red caption below

**Tag / Chip**
- Background: brown-matte
- Text: text-on-dark, Inter 500, 13px
- Padding: 6px 14px
- Selected state: background gold-primary, text charcoal-deep

**Status Badge**
- Confirmed: success-green background (10% opacity), success-green text
- Pending: gold-muted background, brown-matte text
- Cancelled: error-red background (10% opacity), error-red text

---

### 1.7 Agent Trace Component (Recurring Across Screens)

This component appears on every screen where AI is working. It is the visual signature of KARIGAR's intelligence.

**Container:**
- Background: charcoal-mid (#2E2E2E)
- Radius: 16px
- Left border accent: 3px solid gold-primary
- Padding: 16px

**Each agent step row:**
- Icon (Sparkle, gold): 20px, left aligned
- Step label (Inter 600, 14px, text-on-dark): e.g., "Intent Parsed"
- Duration (caption, text-muted, right-aligned): e.g., "0.8s"
- Status indicator:
  - Pending: white hollow ring, animating pulse
  - Active: spinning gold ring
  - Done: filled gold checkmark circle
  - Error: filled red X circle

**Section divider inside trace:** 0.5px line, #3D3D3D (very subtle)

**Header of trace block:**
- "KARIGAR Agent" in label-caps gold
- Small lightning bolt icon in gold
- Right side: total elapsed time in caption/text-muted

---

## PART 2 — NAVIGATION ARCHITECTURE

---

### 2.1 App Entry Flow

```
Landing Homepage (Scrollable)
      ↓ [Start Button]
Auth Bottom Sheet (slides up on same homepage)
      ├── Phone Login (OTP) ──→ Role Check
      │                              ├── Existing Customer → Customer Home
      │                              ├── Existing Worker → Worker Dashboard
      │                              └── New User → Role Selection Screen
      └── Role Selection Screen
                 ├── "I need a service" → Customer Registration (2 steps)
                 └── "I am a karigar" → Worker Registration (4 steps)
```

### 2.2 Post-Login Tab Structure

**Customer App — Bottom Tab Bar:**
| Tab | Icon | Label |
|---|---|---|
| Tab 1 (default) | Chat Bubble + Sparkle | Khidmat / Home |
| Tab 2 | Calendar Check | Bookings |
| Tab 3 | Map Pin | Nearby |
| Tab 4 | User Circle | Profile |

**Worker App — Bottom Tab Bar:**
| Tab | Icon | Label |
|---|---|---|
| Tab 1 (default) | Layout Dashboard | Dashboard |
| Tab 2 | Calendar | My Jobs |
| Tab 3 | Toggle On/Off | Availability |
| Tab 4 | User Circle | Profile |

Tab bar design:
- Background: white-pure with top border 0.5px #E0D8D0
- Active tab: gold-primary icon + gold-primary label (12px, 600 weight)
- Inactive tab: charcoal-light icon + charcoal-light label (12px, 400 weight)
- Floating centre button (optional): Plus button in gold for quick request (customer only)

---

## PART 3 — LANDING HOMEPAGE

**Screen ID:** HOME-01  
**Scroll behaviour:** Vertically scrollable, single page. No separate navigation needed. The navbar is transparent and sticks to top as user scrolls (becomes charcoal-deep on scroll).

---

### Section 1 — HERO (Full Viewport Height, Above the Fold)

**Layout:** Full-bleed background image. Dark overlay on top. Content centred.

**Background:**
- Full-screen photograph of a skilled worker mid-task — ideally a composite blurred image or a single artful shot (similar to Image 2 reference: a worker in an apron, confident, hands working). The image bleeds to all four edges.
- On top of the image: gradient overlay starting from transparent at top, going to rgba(26,26,26,0.82) at the bottom two-thirds. This ensures text reads clearly while keeping the humanity of the worker photo.

**Content — Vertical Stack, Centred:**

1. **Top pill badge** (position: upper centre, below status bar)
   - Background: rgba(196,154,90,0.18) — matte gold tint
   - Border: 1px solid gold-primary
   - Text: "کاریگر • AI Service Orchestrator" — Inter 500, 12px, gold-primary
   - Padding: 6px 16px, full pill radius
   - This sits at roughly 15% from top of hero

2. **KARIGAR Logotype** (main visual centred at 40% height)
   - Each letter K · A · R · I · G · A · R is displayed individually as a distinct typographic unit
   - Font: Inter 900 Black, 56px minimum (scales with screen)
   - Each letter: white-pure colour
   - Each letter has a subtle gold underline/bar of 3px height, gold-primary, centred under each character, with 4px gap from base of letter
   - Letters are evenly spaced horizontally with 8px gap between each
   - Slight entrance animation on first load: each letter drops in sequentially (stagger 80ms per letter) from 20px above its final position, fading in — this is the signature first impression

3. **Tagline** (below KARIGAR logotype, 16px gap)
   - Line 1: "Pakistan ka Bharosa Wala" — Noto Nastaliq Urdu or Inter 400, 16px, text-on-dark
   - Line 2: "Service Network" — Inter 300, 16px, gold-light
   - Both lines centred

4. **Start Button** (below tagline, 32px gap)
   - Background: gold-primary
   - Text: "Shuru Karo — شروع کریں" — Inter 600, 16px, charcoal-deep
   - Width: 200px, centred, height 52px, radius 12px
   - Left side: small rocket/sparkle icon in charcoal-deep (20px)
   - On press: triggers Auth Bottom Sheet to slide up (does not navigate away)
   - Subtle upward float animation on idle (keyframe: 0→6px→0, 3s loop)

5. **Scroll indicator** (bottom of hero, 24px from edge)
   - Three horizontal dots (like a carousel indicator), charcoal-light
   - Below dots: "Scroll to explore" in caption style, text-muted
   - Animated chevron-down icon bouncing gently, gold-light colour

---

### Section 2 — WHAT IS KARIGAR (Scroll: ~100vh from top)

**Background:** white-soft (#F7F3EE)  
**Padding:** 48px top/bottom, 20px horizontal

**Heading Block:**
- Label (caps): "KARIGAR KYA HAI?" — label-caps, gold-primary, centred
- Main Heading: "Aapki Zaroorat, Hamare Karigar" — section-heading (24px), charcoal-deep, centred
- Sub-text: "From a single message to a confirmed booking — our AI handles everything." — body-secondary, text-muted, centred, max-width 300px

**Three Feature Cards (horizontal scrollable row, snapping):**

Each card shares this structure:
- Background: brown-matte (#5C3D2E)
- Width: 260px, height: 180px, radius: 16px
- Internal padding: 20px
- Top: Icon in gold-primary (36px, Phosphor filled)
- Icon sits on a small circle: rgba(196,154,90,0.15) background, 52px circle
- Title: card-title (18px), text-on-dark, Inter 600, margin-top 12px
- Description: body-secondary (14px), rgba(240,237,232,0.7) — slightly dimmed white

Card 1 — "Samjho" (Understand)
- Icon: Chat Centered Text
- Title: "Baat Karo, AI Samjhega"
- Description: "Urdu, Roman Urdu, or English — type naturally, KARIGAR understands your request instantly."

Card 2 — "Dhundho" (Find)
- Icon: Map Trifold
- Title: "Nearest Karigar"
- Description: "Real-time matching finds verified skilled workers near your location in seconds."

Card 3 — "Book Karo" (Book)
- Icon: Calendar Check
- Title: "Instant Booking"
- Description: "One tap confirmation. No calls, no WhatsApp chasing. The AI books it for you."

Card 4 — "Follow Up" (Auto)
- Icon: Bell Ring
- Title: "Auto Reminders"
- Description: "Reminders, status updates, and completion confirmations — all automated."

**Scroll dots** below cards (4 dots): inactive = brown-warm, active = gold-primary

---

### Section 3 — HOW IT WORKS (Scroll: ~180vh)

**Background:** white-pure  
**Padding:** 48px top/bottom, 20px horizontal

**Heading:**
- Label: "KAISE KAAM KARTA HAI" — label-caps, gold-primary, centred
- Title: "3 Steps to Any Service" — section-heading, charcoal-deep, centred

**Step Cards (vertical stack, not scrollable):**

Each step is a row card:
- Background: white-pure
- Border: 1px solid #E0D8D0
- Radius: 16px
- Padding: 20px
- Shadow: shadow-card
- Left side: Step number circle (48px, gold-primary background, charcoal-deep number text, Inter 800, 20px)
- Right of number (16px gap): Title (card-title, charcoal-deep) + Description (body-secondary, text-muted)
- Vertical connector line between cards: 2px dashed, gold-light, centred on step number circles

Step 1: "Apni Zaroorat Batao"
- Title bold, description: "Type what you need in any language. 'Mujhe kal subah G-13 mein plumber chahiye' — that's enough."

Step 2: "AI Dhundh Lega"
- "Our agentic AI parses your request, finds nearby verified karigars, and ranks them by distance, rating, and availability."

Step 3: "Booking Ho Gayi"
- "Booking confirmed, worker notified, reminders scheduled. You don't lift a finger."

---

### Section 4 — TRUST SIGNALS (Scroll: ~250vh)

**Background:** charcoal-deep (#1A1A1A)  
**Padding:** 48px top/bottom, 20px horizontal

**Heading:**
- Label: "BY THE NUMBERS" — label-caps, gold-primary, centred
- Title: "Pakistan Bharosa Karta Hai" — section-heading, text-on-dark, centred

**Stats Row (3 items, horizontal, equal width):**
Each stat block:
- Number: display-title (32px), gold-primary, centred, Inter 800
- Label: body-secondary (14px), text-muted, centred

Stats: "500+" Verified Karigars | "10,000+" Bookings Done | "4.8★" Average Rating

**Divider:** 1px line, charcoal-light, full width, margin 32px top/bottom

**Worker CTA Block:**
- Small icon: Wrench, gold-primary, 32px, centred
- Title: "Karigar Ho? App Join Karo" — card-title, text-on-dark
- Sub-text: "Register once, get bookings automatically. No marketing needed." — body-secondary, text-muted, centred
- Button: Secondary outlined button — border gold-primary, text gold-primary: "Worker Registration"
- On press: Opens Auth Bottom Sheet pre-set to Worker flow

---

### Section 5 — FOOTER (Scroll: ~300vh)

**Background:** charcoal-deep  
**Padding:** 32px

- Logo: "KARIGAR" in Inter 700, 20px, gold-primary — left aligned
- Tagline: "کاریگر — Your Trusted Service Network" — caption, text-muted
- Two lines of links (caption, text-muted): About | Privacy | Terms | Contact
- Bottom line: "Built with Google Vertex AI · Pakistan 🇵🇰" — caption, text-muted, centred
- Top of footer: 1px gold-primary line accent, full width

---

## PART 4 — AUTHENTICATION FLOW

### Screen: AUTH-01 — Auth Bottom Sheet

**Trigger:** Pressing "Shuru Karo" on homepage  
**Behaviour:** Slides up as a bottom sheet over the blurred homepage. The homepage hero is still visible behind it (blurred: blur(8px) + darken overlay).

**Bottom Sheet Container:**
- Background: white-pure
- Top corners: 24px radius
- Drag handle: 4px × 40px pill, #E0D8D0, centred, 12px from top
- Height: 70% of screen height
- Shadow: shadow-modal

**Sheet Header (inside sheet, top area):**
- KARIGAR logo word in Inter 700, 20px, gold-primary — centred
- Title below: "Apna Account Banao ya Login Karo" — section-heading (smaller: 20px), charcoal-deep, centred
- Caption below title: "One-time setup. Takes 2 minutes." — body-secondary, text-muted, centred

**Phone Number Input Block:**
- Label (label-caps): "PHONE NUMBER"
- Flag + country code selector: Small Pakistan flag + "+92" in a left-attached pill (background: white-soft, border matching input) — compact, 52px height, 72px wide
- Phone input: Full standard input component (right of the flag pill, they form a single visually unified row)
- Below input: caption in text-muted: "We'll send a one-time code to verify"

**OTP After Submit:**
- Input transitions: phone field becomes dimmed/read-only
- New row appears: 6 individual OTP digit boxes (equal width, 44px × 52px each, charcoal-deep border, gold-primary border when active)
- Below boxes: "Code resend in 00:45" countdown timer, caption, text-muted, right-aligned
- "Resend Code" text button appears when timer hits 0

**Primary CTA Button:** "OTP Bhejo" / "Send OTP" — gold CTA button, full width

**Divider:** "ya phir" (or) — caption, text-muted, with lines either side

**Social Login Row:** (optional, single button)
- Google Sign-In: outlined secondary button, Google logo left, "Google se Login Karo" text

**Bottom of sheet:** "Koi problem hai? Help lein" — ghost button, centred, charcoal-light

---

### Screen: AUTH-02 — Role Selection

**Trigger:** After successful OTP verification for a NEW user  
**Layout:** Full screen, white-pure background. No tabs/nav.

**Header:**
- Back arrow (ghost, top-left)
- Title: "Aap kaun hain?" — display-title (32px), charcoal-deep, top padding 60px
- Sub: "Choose your role once. You can always switch later." — body-secondary, text-muted

**Two Large Role Cards (stacked, equal height ~160px each, 16px gap):**

Card Style:
- Background: white-soft
- Border: 2px solid #E0D8D0 (resting), 2px solid gold-primary (selected)
- Radius: 16px
- Padding: 24px
- Horizontal layout: Icon block left (64px × 64px square, brown-matte bg, 24px radius, icon centred 32px gold-primary) + Text block right (16px gap)
- Text block: Title (card-title 18px, charcoal-deep, Inter 600) + Description (body-secondary 14px, text-muted, 2 lines max)
- Selected state: Border turns gold-primary, background becomes gold-muted (#E8D4AA at 30% opacity), a gold checkmark badge appears top-right corner of card

Card 1 — Customer:
- Icon: User Circle (Phosphor)
- Title: "Mujhe Service Chahiye"
- Description: "Find and book verified karigars for your home, office, or any task."

Card 2 — Worker:
- Icon: Wrench (Phosphor)
- Title: "Main Karigar Hoon"
- Description: "Register your skills, get bookings automatically, grow your business."

**CTA Button:** "Aage Barhein" — gold primary button, full width, 32px from bottom. Disabled (50% opacity, non-interactive) until a role is selected.

---

### Screen: AUTH-03A — Customer Registration

**Trigger:** Selected "Mujhe Service Chahiye" + tapped Aage Barhein  
**Layout:** White-pure background, single scrollable form. Progress indicator at top.

**Progress Bar:**
- 2 steps total
- Bar: full width, 4px height, background #E0D8D0, filled portion gold-primary
- Step 1: 50% filled. Step 2: 100%.
- Step label above bar (right-aligned, caption, text-muted): "Step 1 of 2"

**Step 1 — Basic Info:**

Section label (label-caps, gold-primary): "AAPKI DETAILS"

Fields (top to bottom, each with label above and 16px gap between):
1. Full Name — text input. Label: "PURA NAAM". Placeholder: "e.g. Ahmed Khan"
2. City / Area — text input with Google Places autocomplete. Label: "AAPKA ILLAQA". Placeholder: "e.g. G-13, Islamabad"
3. Preferred Language — three pill chips in a row (Roman Urdu | اردو | English). Single-select. Selected chip: gold-primary bg, charcoal-deep text. Unselected: white-soft bg, brown-matte border.

CTA: "Agla Qadam" (Next Step) — gold primary button

**Step 2 — Address Confirmation:**
- Map thumbnail view (Google Static Maps, 16px radius, full width, height 160px) showing their entered area pre-pinned
- Below map: editable address input (pre-filled)
- "Notify me of bookings via" — two chip toggles: Push Notifications (default selected) | SMS

CTA: "Account Banao" — gold primary button

---

### Screen: AUTH-03B — Worker Registration (4-Step Wizard)

**Trigger:** Selected "Main Karigar Hoon"  
**Layout:** White-pure, scrollable, progress bar (4 steps). Same progress bar pattern as customer.

**Step 1 of 4 — Personal Identity**

Section label: "AAPKI PEHCHAAN"

Fields:
1. Full Name — "PURA NAAM" — text input
2. Phone — pre-filled from OTP step, read-only (dimmed input, locked icon right-side)
3. CNIC Number — "CNIC NAMBUR" — formatted input: auto-inserts dashes at positions 5 and 12. Format shown as placeholder: "XXXXX-XXXXXXX-X"
4. Profile Photo — large upload area:
   - Dashed border (1.5px dashed gold-primary), radius 12px, height 100px, full width
   - Centre: Camera icon (gold-primary, 32px) + "Apni Photo Upload Karo" (body-secondary, text-muted)
   - After upload: image preview fills the area with a small edit button overlay (bottom-right, 32px circle, charcoal-deep bg, pencil icon white)

CTA: "Agla" — gold primary button

**Step 2 of 4 — Service Details**

Section label: "AAPKI KHIDMAT"

Fields:
1. Service Category — large horizontal scrollable chip selector:
   - Each category is a chip with a small icon + label
   - Icons per category: Snowflake (AC), Droplets (Plumber), Lightning (Electrician), Book (Tutor), Sparkle (Beauty), Broom (Cleaning), Hammer (Carpenter)
   - Selected: gold-primary bg. Unselected: white-soft with #E0D8D0 border
   - Row wraps to 2 lines if needed

2. Service Tags — multi-select chips below category (context-sensitive, changes based on selected category). E.g., AC selected → shows "AC Repair", "Gas Refilling", "New Installation", "Cleaning". Up to 5 selectable.

3. Years of Experience — segmented control: "1–2 Saal", "3–5 Saal", "5–10 Saal", "10+ Saal". Same chip style.

4. Price Range — two side-by-side inputs: "MIN (PKR)" and "MAX (PKR)". Both number inputs. Caption below: "Per visit estimated range"

CTA: "Agla" — gold primary button

**Step 3 of 4 — Location & Availability**

Section label: "AAPKI JAGAH AUR WAQT"

1. Home Area / Base Location — text input with autocomplete. Label: "GHAR KA ILLAQA"
2. Service Radius — horizontal slider with 5 stops (5km / 10km / 15km / 20km / 25km):
   - Track background: #E0D8D0. Filled portion: gold-primary. Thumb: 20px circle gold-primary with white border.
   - Current value displayed in gold-primary above thumb: "10 km"
   - Caption: "Aap kitni door tak jana chahte hain?"

3. Available Days — 7 day toggle row: Sun Mon Tue Wed Thu Fri Sat
   - Each: 40px × 40px circle. Selected: gold-primary bg, charcoal-deep text. Unselected: white-soft, #E0D8D0 border.

4. Available Hours — two time pickers side by side: "SE (From)" and "TAK (Until)". Each: compact input with clock icon, shows time in HH:MM format.

CTA: "Agla" — gold primary button

**Step 4 of 4 — Review & Submit**

Section label: "JAANCH LEIN"

A summary card (background: brown-matte, radius 16px, padding 20px):
- Worker avatar (top-centre, 72px circle with uploaded photo)
- Name in card-title, text-on-dark
- Category chip (gold chip)
- Location + Radius row (Map Pin icon gold, caption text-on-dark)
- Price range row (Tag icon gold, caption text-on-dark)
- Days + Hours row (Clock icon gold, caption text-on-dark)
- CNIC row (Shield icon gold) — shows only last 4 digits, rest masked: "XXXXX-XXX-XXXX"

Below card: a grey info box:
- Background: white-soft, border gold-muted, radius 12px, padding 16px
- Shield Check icon (gold-primary, 20px) left
- Text: "Aapka CNIC hamari team verify karegi. 24 ghante mein confirmation milegi." — body-secondary, charcoal-light

Terms line: "Register karne se aap hamare Terms & Privacy Policy se agree karte hain." — caption, text-muted, centred with tappable links in gold-primary

CTA: "Register Ho Jao" — gold primary button

Success State (after submit): A full-screen success overlay slides up:
- Background: charcoal-deep
- Centre: animated checkmark (gold, drawn on), 80px
- "Shukriya, [Name]!" — display-title, text-on-dark
- "Verification ke baad aap active ho jaenge." — body-secondary, text-muted
- Button: "Dashboard Dekhein" — gold CTA button

---

## PART 5 — CUSTOMER APP SCREENS

---

### Screen: CUST-01 — Home / Chat Request Screen (Tab 1)

**This is the most important customer screen.**

**Background:** white-pure

**Top Bar (Sticky):**
- Left: Avatar circle (32px, customer photo or initials, brown-matte bg)
- Beside avatar: "Assalamualaikum, [First Name]" — body-primary, charcoal-deep (16px)
- Right side: Language toggle pill (Roman Urdu | اردو | EN) — compact pill switcher, 3 options, selected = gold-primary bg, unselected = charcoal-light text
- Far right: Bell icon (notifications) — Phosphor, 24px, charcoal-deep. Red dot overlay if unread.
- Below top bar: 0.5px separator line, #E0D8D0

**Service Shortcut Row (below top bar, horizontally scrollable):**
- Label (label-caps, gold-primary): "QUICK REQUEST"
- A horizontal scrollable row of 7 service category chips with icons:
  Each chip: icon (20px) + label. Background: white-soft, border #E0D8D0. Selected: gold-primary bg.
  Categories: AC ❄️ | Plumber 🔧 | Electrician ⚡ | Tutor 📚 | Cleaner 🧹 | Carpenter 🔨 | Beauty ✨
- Tapping a chip pre-fills the message input below with that service type

**Recent / Suggested Context (middle section, visible before user types):**

If no active booking:
- A centred illustration placeholder area (height 180px):
  - Background: white-soft, radius 16px
  - Centre: Sparkle icon (48px, gold-primary)
  - Text: "Kya zaroorat hai aaj?" (card-title, charcoal-deep, centred)
  - Sub: "Type karo, ya upar se service chunein" (body-secondary, text-muted, centred)

If there IS an active booking (returning user):
- Active Booking Preview Card (same area):
  - Background: brown-matte, radius 16px, padding 16px
  - Left: Wrench icon in gold (24px) in a 44px circle (gold at 15% opacity bg)
  - Right: "Ali AC Services" (card-title, text-on-dark) + "Kal 10:00 AM — G-13" (body-secondary, gold-light) + Status badge "Confirmed"
  - Chevron right (text-on-dark, 20px, right-aligned)
  - Tapping opens booking detail screen

**Bottom Input Area (sticky at bottom of screen, above tab bar):**

The chat input is the focal point. It looks polished and inviting, not like a search bar.

- Background of entire input zone: white-pure with top shadow (shadow-float reversed — shadows upward)
- Container: white-soft background, radius 16px, border 1.5px solid #E0D8D0, focused border: gold-primary
- Multiline TextInput inside: "Kya service chahiye? Kahan, kab?" — placeholder in text-muted, body-primary (16px), charcoal-deep text
- TextInput min-height 52px, max-height 120px (expands with text)
- Bottom row of input container:
  - Left: Mic icon (Phosphor, 22px, charcoal-light) — for future voice input
  - Right: Send button — 40px circle, gold-primary bg, paper-plane arrow icon (white, 18px)
- Below input: language caption: "Roman Urdu, اردو, ya English mein likhein" — caption, text-muted, centred

---

### Screen: CUST-02 — Agent Working Screen (Real-Time AI Trace)

**Trigger:** User submits a request. Screen does NOT navigate away. The input area collapses and the agent trace expands upward in the same screen.

**Layout Transition:**
- Input bar at bottom remains visible but collapses to a single read-only line showing the submitted message (with a small X to cancel)
- The main content area (above input) shows the live agent trace

**User Message Bubble (top of trace area):**
- Right-aligned
- Background: charcoal-deep
- Text: user's exact message, body-primary, text-on-dark
- Timestamp: caption, text-muted, below bubble
- Tail on the right side of bubble

**KARIGAR Agent Trace Block (left-aligned, below user bubble):**

Block header row:
- Small KARIGAR logo "K" mark in a 32px circle (gold-primary bg, charcoal-deep "K")
- "KARIGAR Agent" — label-caps, charcoal-light, left of the "K" mark... Actually left: the "K" circle, right: "KARIGAR Agent" text
- Right: "Processing..." label in caption gold-primary with animated 3-dot loader

The trace block is the Agent Trace Component defined in Part 1.7.

Each step appears sequentially (not all at once) with a 0.6s delay between revealing each step. Steps animate in from left (slide in + fade in).

**Step 1 — Intent Parser (appears immediately):**
- Status: Active (spinning gold ring)
- Label: "Samajh raha hoon..." (Roman Urdu) or "Understanding Request..."
- After 0.8s: Status → Done ✓
- Expanded detail (accordion, chevron to expand): Shows parsed result:
  - Service: "AC Technician" (gold chip)
  - Location: "G-13, Islamabad" (map pin icon + text)
  - Time: "Kal Subah — 10:00 AM" (clock icon + text)
  - Language detected: "Roman Urdu" (tag)

**Step 2 — Provider Discovery (appears after Step 1 done):**
- Status: Active → Done ✓
- Label: "Karigar dhundh raha hoon..." → "4 Karigar mile"
- Expanded detail: "Searching within 15km of G-13" + "4 available workers found"

**Step 3 — Matching & Ranking (appears after Step 2):**
- Status: Active → Done ✓
- Label: "Best match select kar raha hoon..." → "Match mil gaya!"
- Expanded detail: Mini ranking table (3 rows):
  Each row: Worker name | Distance | Score bar (thin gold filled bar)
  Top row highlighted with gold-left-border accent
  "Ali AC Services — 2.1km — Score: 92.4" (highlighted)
  Others dimmed

**Step 4 — Booking Execution (appears after Step 3):**
- Status: Active → Done ✓
- Label: "Booking confirm kar raha hoon..." → "Booking ho gayi! ✓"
- Duration shown

**Step 5 — Follow-Up Scheduling (appears after Step 4):**
- Status: Active → Done ✓
- Label: "Reminders schedule kar raha hoon..." → "3 reminders set"
- Duration shown

**Bottom of trace block:**
- Total time: "Total: 3.2 seconds" — caption, text-muted, right-aligned
- A thin gold line underlines the entire block

**After All Steps Complete → Booking Confirmation Card slides in below trace:**

This is the hero confirmation moment — it should feel satisfying and celebratory.

Background: brown-matte (#5C3D2E)
Radius: 16px
Padding: 20px
Shadow: shadow-float

Content (top to bottom inside card):
- "✅ Booking Confirm Ho Gayi!" — Inter 700, 18px, text-on-dark. The ✅ is a success-green circle check icon (20px).
- Thin divider line (gold-primary, 40% opacity, full width) — 12px margins
- Worker row: Avatar circle (40px, worker photo or initials, charcoal-mid bg) + "Ali AC Services" (card-title, text-on-dark) + "4.8 ★" (caption, gold-light) — right-aligned star/rating
- Detail rows (each row: icon left gold 18px + text right body-secondary text-on-dark):
  - Calendar icon: "Kal — Jumarat, 13 September"
  - Clock icon: "10:00 AM"
  - Map Pin icon: "G-13, Islamabad"
  - Tag icon: "AC Technician"
- Thin divider
- Booking ID block: "Booking ID" label-caps gold-primary + "BK-20240913-0047" Inter 700 16px text-on-dark (monospace style). Right side: Copy icon (18px, gold-primary)
- Confirmation Code: same pattern. "KRG-4751" in gold-primary, Inter 800, 20px

Two buttons below card:
- Primary: "Booking Detail Dekhein" — gold CTA full width
- Ghost: "Naya Request" — ghost button centred below

---

### Screen: CUST-03 — Booking Detail

**Background:** white-pure  
**Header:** Back arrow + "Booking Detail" (section-heading, charcoal-deep) + Share icon (Phosphor, 24px, charcoal-light) — right

**Hero Card (top, full width):**
- Background: brown-matte, radius 16px, padding 20px
- Worker photo (80px circle, top-centre, border: 3px gold-primary)
- Worker name (card-title, text-on-dark, centred)
- Category + Rating row (centred): gold chip (service type) + "4.8 ★" (gold-light)
- Status badge: large pill — "Confirmed" in success-green text on success-green 15% opacity bg

**Info Section:**

Section label (label-caps, gold-primary): "BOOKING DETAILS"

White card (border #E0D8D0, radius 16px, shadow-card):
Rows (each: icon left 20px gold + label text-muted 14px + value charcoal-deep 14px 600):
- Date: Thursday, 13 September 2024
- Time: 10:00 AM
- Location: G-13, Islamabad
- Service: AC Technician
- Booking ID: BK-20240913-0047 (monospace, with copy button inline)
- Confirmation Code: KRG-4751 (gold-primary text, Inter 800)
- Status: Confirmed (success-green)

**Agent Reasoning Section:**

Section label (label-caps, gold-primary): "AI KA FAISLA"

The Agent Trace Component (Part 1.7) rendered in a compact read-only collapsed state. A "Dekhein" (View) button expands it to show all 5 steps. This is where the hackathon evaluator can clearly see the agentic reasoning.

**Map Preview (full width, 180px height, 16px radius):**
- Google Static Map centred on G-13 with a pin
- Overlay label bottom-left: "G-13, Islamabad" on a charcoal-deep pill

**Action Buttons (bottom, sticky):**
- If status = Confirmed: Two buttons side by side:
  - Left (secondary outlined): "Cancel" — border error-red, text error-red
  - Right (gold primary): "Worker se Contact Karo"
- If status = Completed: One full-width gold button: "Rate Your Karigar"

---

### Screen: CUST-04 — My Bookings (Tab 2)

**Background:** white-soft  
**Header (sticky):** "Meri Bookings" — section-heading, charcoal-deep. Right: Filter icon (Phosphor, charcoal-light)

**Filter Chips Row (horizontally scrollable, below header):**
- All | Active | Completed | Cancelled
- Same chip style as throughout — selected: gold-primary bg

**Booking List (scrollable):**

Each booking card:
- Background: white-pure
- Radius: 16px
- Border: 1px solid #E0D8D0
- Shadow: shadow-card
- Padding: 16px
- Horizontal layout:
  - Left: Worker avatar circle (48px, worker photo or initials, brown-matte bg)
  - Centre: Worker name (Inter 600, 16px, charcoal-deep) + Service + Date/Time row (body-secondary, text-muted) + Status badge
  - Right: Chevron icon (charcoal-light)
- Bottom-left of card: Booking ID in caption/text-muted, monospace style

**Empty State (when no bookings):**
- Centred illustration area: clipboard icon (80px, gold-muted fill), charcoal-light outline
- "Abhi tak koi booking nahi" — card-title, charcoal-light, centred
- "Apni pehli service request karein!" — body-secondary, text-muted
- CTA: "Karigar Dhundhein" — gold primary button, centred, 200px wide

---

### Screen: CUST-05 — Nearby Map View (Tab 3)

**Full-screen Google Map** (React Native Maps)  
- Map style: custom style with muted whites, charcoal road labels, gold-primary highlight for current location ring
- Current location: pulsing gold-primary dot with outer ring animation

**Worker Pins on Map:**
- Each pin: 40px circle, brown-matte background, category icon (white, 18px) inside
- Selected pin: expands to 48px, gold-primary bg, slight bounce animation

**Sliding Bottom Sheet (resting at 25% screen height, expandable to 60%):**
- Handle bar at top
- Background: white-pure, top radius 24px, shadow-modal
- Header: "Aas Paas ke Karigar" (section-heading) + count badge (charcoal-deep bg, white text, 20px pill)
- Below header: horizontal filter chips (same as before)
- Worker card list (scrollable within sheet):
  Each card: horizontal layout, 72px height, white-pure bg, 12px radius, border #E0D8D0:
  - Left: Worker avatar 40px circle
  - Middle: Name (Inter 600, 14px) + Category tag + "X.X km" (caption, gold-primary)
  - Right: "X.X ★" (gold-light) + Book Now button (small, 28px height, gold bg, "Book" text, 10px radius)

---

## PART 6 — WORKER APP SCREENS

---

### Screen: WORK-01 — Worker Dashboard (Tab 1)

**Background:** white-soft  
**Top Area (charcoal-deep background, padded 24px, radius 24px bottom corners):**
- Row 1: "Assalamualaikum," (body-secondary, rgba(240,237,232,0.6)) + worker name (Inter 700, 20px, text-on-dark)
- Row 2: Availability toggle (large pill toggle):
  - OFF state: label "Offline — Bookings band" — charcoal-mid bg, #E0D8D0 text
  - ON state: label "Online — Bookings chal rahi hain" — gold-primary bg, charcoal-deep text
  - Toggle switch: 56px × 28px pill, animated thumb slides gold circle
- Row 3: Three stat mini-cards horizontal (each: white at 10% opacity bg, 12px radius, padding 12px):
  - "⭐ 4.8" (gold) — "Rating"
  - "47" (text-on-dark) — "Jobs Done"
  - "PKR 12,400" (text-on-dark) — "This Month"

**Incoming Booking Alert (if new booking, prominent card):**

Background: gold-primary, radius 16px, padding 20px, shadow-float. The most eye-catching element on screen.

- Row 1: Bell icon (charcoal-deep, 24px) + "Nai Booking!" (Inter 700, 18px, charcoal-deep)
- Service type (Inter 600, 16px, charcoal-deep)
- Details row: Date, Time, Location in caption, charcoal-light
- Distance: "2.1 km aap se" — body-secondary, charcoal-deep
- Two buttons side by side:
  - Accept: white bg, charcoal-deep text, "Qabool Karo" — radius 10px, height 44px
  - Decline: transparent bg, charcoal-deep border, "Mana Karo" — same size

**Today's Schedule Section:**

Label (label-caps, gold-primary): "AAJ KA SCHEDULE"

Job cards (vertical stack):
- Background: white-pure, radius 16px, border #E0D8D0, shadow-card, padding 16px
- Left border accent: 4px solid gold-primary (confirmed) or charcoal-light (completed)
- Content:
  - Time: "10:00 AM" — Inter 700, 18px, charcoal-deep
  - Service + Customer name: body-secondary, text-muted
  - Location: caption with map-pin icon, text-muted
  - Status badge: right-aligned

---

### Screen: WORK-02 — My Jobs (Tab 2)

Same pattern as CUST-04 Bookings but with:
- Filter chips: Pending | Confirmed | In Progress | Done
- Each card shows: Customer name (not worker name), Service, Location, Time, Status
- Completed cards show: star rating received (if given) below the card in gold-light

---

### Screen: WORK-03 — Availability Manager (Tab 3)

**Background:** white-pure  
**Header:** "Availability" — section-heading

**Main Toggle Card:**
- Background: brown-matte, radius 16px, padding 24px
- "Abhi Available Hoon" — card-title, text-on-dark, left-aligned
- Toggle (large, right-aligned): same pill toggle from dashboard
- Caption below toggle: "Isko band karne se nai bookings nahi aayengi." — body-secondary, rgba(240,237,232,0.7)

**Weekly Schedule Builder:**

Section label (label-caps, gold-primary): "HAAFTAWAR SCHEDULE"

For each day (7 rows):
- Day name (Inter 600, 14px, charcoal-deep) — left, 80px wide
- Time slot selector (centre): if day is active, shows "08:00 – 18:00" clickable which opens a time range bottom sheet. If inactive, shows "Band" in text-muted
- On/Off toggle (right): 44px pill toggle, gold when on, charcoal-light when off
- Row divider: 0.5px #E0D8D0

**Time Range Bottom Sheet (when time is tapped):**
- Two time wheels (From and Until) — native-style scroll picker, gold-primary highlight line on selected value
- "Save" gold button at bottom

**Upcoming Time Off Section:**

Section label (label-caps, gold-primary): "CHUTTI SET KARO"

Date range picker card (white-pure, border #E0D8D0, radius 16px):
- "Se" (From) date field + "Tak" (Until) date field side by side
- Below: "Reason (Optional)" text input
- "Chutti Add Karo" — secondary outlined button

---

### Screen: WORK-04 — Worker Profile (Tab 4)

**Background:** white-soft  
**Profile Header Card:**
- Background: charcoal-deep, radius 24px, padding 24px
- Worker photo: 88px circle, border 3px gold-primary
- Name: Inter 700, 22px, text-on-dark
- Service category chip: gold-primary bg
- Verified badge (if verified): shield-check icon + "Verified" in small pill (success-green)
- Stats row: "Jobs: 47 | Rating: 4.8 | Experience: 5 Saal" — caption, text-muted, centred

**Edit Sections (white cards, stacked):**

Each section: white-pure card, radius 16px, border #E0D8D0, padding 16px. Header: section label (label-caps, gold-primary) + Pencil edit icon (charcoal-light, right).

---

## Live UI Implementation Notes

- `agent-working.jsx` and `agent-trace.jsx` now render the real backend trace payload instead of a static step storyboard.
- `map.jsx` pulls nearby providers from the backend and uses Google Static Maps when a Maps API key is configured.
- `booking-detail.jsx` renders live booking, worker, pricing, and map data.
- `notifications.jsx` now fetches the live notifications feed from the backend.

- Service Details — lists current category, tags, price
- Location & Radius — shows area, service radius
- About Me — text description (editable)

---

## PART 7 — AGENTIC WORKFLOW SCREENS (Dedicated Views)

These screens exist to explicitly demonstrate the agentic pipeline for the hackathon evaluators. They are accessible from:
- Customer: tap any booking → scroll to "AI Ka Faisla" section → "Full Trace Dekhein" button
- Worker: tap any job → scroll down → "AI Reasoning" section

---

### Screen: AGENT-01 — Full Agent Trace Viewer

**Background:** charcoal-deep (#1A1A1A)  
**This screen is intentionally dark — it feels like a "terminal/cockpit" — technical, intelligent, impressive.**

**Header:**
- Back button (left, text-on-dark)
- "KARIGAR Agent Trace" — section-heading, text-on-dark
- Booking reference pill (right): "BK-20240913-0047" — gold chip

**Session Info Bar (below header):**
- Background: charcoal-mid, radius 12px, padding 12px
- Horizontal row: "Session ID: sess_abc123" (monospace caption, text-muted) + Separator (vertical line) + "Total Time: 3.2s" (caption, gold-primary) + Separator + "5 Agents" (caption, gold-primary)

**Agent Pipeline Visual (vertical, scrollable):**

Each agent block is fully expanded here (not accordion):

**Block Structure (one per agent):**
- Background: charcoal-mid (#2E2E2E)
- Radius: 16px
- Left accent bar: 3px solid gold-primary
- Padding: 20px
- Margin bottom: 12px

Between blocks: A connector line (2px dashed, charcoal-light, centred, height 12px) with a small right-pointing arrow icon at the bottom of the line in gold-primary. This visually shows the pipeline flow.

**Block Header Row:**
- Left: Agent icon circle (40px, brown-matte bg, icon in gold-primary 20px)
- Centre: "AGENT 1 — INTENT PARSER" (label-caps, gold-primary) on top line + "Samajh liya" (body-secondary, text-on-dark) on second line
- Right: "0.8s" (Inter 700, 16px, gold-primary) + status badge below (Done ✓ in success-green)

**Block Body (below header, top border separator):**

Input section:
- "INPUT" — label-caps, text-muted, micro
- Input value displayed in a code-style block: monospace body-secondary, rgba(240,237,232,0.8), background rgba(0,0,0,0.3), radius 8px, padding 12px

Output section:
- "OUTPUT" — label-caps, text-muted, micro
- Output value in same code block style but border-left 2px gold-primary

Tool Calls section (if any):
- "TOOLS CALLED" — label-caps, text-muted
- Each tool: horizontal pill — icon (20px) + tool name (caption, gold-light) + response time
  Example: 🗺️ "Google Maps Geocoding API — 0.3s"

**All 5 Agent Blocks in order:**
1. Intent Parser — icon: ChatCenteredText — Tools: Gemini API, Google Geocoding
2. Provider Discovery — icon: MagnifyingGlass — Tools: PostgreSQL Query, Google Distance Matrix
3. Matching & Ranking — icon: Trophy — Tools: Scoring Algorithm, Gemini (reasoning generation)
4. Booking Executor — icon: CalendarCheck — Tools: Supabase Write, FCM Notification
5. Follow-Up Scheduler — icon: BellRinging — Tools: BullMQ (Redis Queue)

**Bottom Summary Card:**
- Background: gold-primary (#C49A5A), radius 16px, padding 20px
- "Pipeline Complete ✓" — Inter 700, 18px, charcoal-deep
- Stats: "5 Agents | 6 Tool Calls | 3.2 Seconds | 0 Errors" — caption, charcoal-mid
- Button: "Booking Dekhein" — white bg, charcoal-deep text, secondary feel

---

### Screen: AGENT-02 — Live Agent Progress (During Processing)

This is the CUST-02 screen described in detail above. The key visual distinction:

While an agent step is ACTIVE:
- That block has a subtle pulsing glow border (gold-primary at 40% opacity, expanding and contracting, 1.5s loop)
- The status indicator is a spinning arc (not a full ring — 270-degree arc, rotating, gold-primary)
- Inside the block body: a shimmer loading bar replaces the content (gold-muted shimmer moving left to right)

When it COMPLETES:
- The glow fades out (0.3s)
- The spinning arc becomes a filled checkmark circle (gold-primary) with a brief scale-bounce animation (scale 1.3 → 1.0, 0.2s)
- The content fades in (0.4s)
- Then the next agent block fades in from below (0.5s delay)

---

## PART 8 — NOTIFICATION & OVERLAY SCREENS

---

### Push Notification Design (iOS/Android Lock Screen)

**Title:** KARIGAR 🔔  
**Body (User):** "Ali AC Services kal 10:00 AM par aa rahe hain! Code: KRG-4751"  
**Body (Worker):** "Nai Booking! [Customer name] — AC Technician, G-13 — Kal 10:00 AM"  
**Action buttons (iOS):** "Dekhein" | "OK"

---

### Screen: NOTIF-01 — In-App Notification Bell Screen

**Background:** white-soft  
**Header:** "Notifications" — section-heading

Each notification item (white-pure card, radius 12px, border #E0D8D0, padding 14px 16px):
- Left: Icon circle (40px):
  - Booking confirmed: green bg, check icon
  - Reminder: gold bg, bell icon
  - Rating request: brown-matte bg, star icon
- Centre: Title (Inter 600, 14px, charcoal-deep) + Body (caption, text-muted, 2 lines max)
- Right: Timestamp (caption, text-muted) + Unread dot (8px circle, gold-primary, only if unread)

Unread items: white-pure bg. Read items: white-soft bg.

---

### Screen: RATE-01 — Post-Job Rating

**Trigger:** User notification after job completion  
**Layout:** Bottom sheet (70% height) over dimmed screen

**Content:**
- Worker photo (80px circle, centred, gold-primary border)
- "Ali AC Services ko rate karein" — card-title, charcoal-deep, centred
- Sub: "AC Technician — 13 September, 10:00 AM" — body-secondary, text-muted, centred
- Star Rating Row (5 stars, centred): 
  - Each star: 40px, Phosphor Star icon
  - Unselected: #E0D8D0 fill
  - Selected/Hover: gold-primary fill with scale-bounce animation (each star fills one by one on tap)
  - Currently selected count: "4 stars" label below in gold-primary, body-secondary
- Optional review input: text area "Kuch kehna chahte hain? (Optional)" — placeholder text-muted, standard input style, height 80px
- CTA: "Rating Submit Karo" — gold primary button, full width
- Ghost: "Skip" — centred ghost button below

---

## PART 9 — DESIGN PRINCIPLES APPLIED (HCI)

**1. Visibility of System Status**
Every AI action shows live progress. The user always knows what KARIGAR is doing. The agent trace is not hidden — it is the central UI element during processing. No black-box moments.

**2. Match Between System and Real World**
Language is Urdu/Roman Urdu first. Icons match real-world concepts (wrench for workers, calendar for booking). Service category icons are universally recognizable. PKR for prices, not dollar signs.

**3. User Control and Freedom**
Every bottom sheet has a drag-to-dismiss handle. Every multi-step wizard has a back button. Cancel booking is always accessible (before confirmation). The language toggle is always visible in the top bar.

**4. Consistency and Standards**
Gold = action/primary throughout. Brown-matte = worker/service context cards throughout. Charcoal = dark surfaces/agent trace throughout. This mapping never breaks. Every tap that causes navigation has a back path.

**5. Error Prevention**
CNIC format is auto-formatted as user types. Phone number validated before OTP send. Required fields are labelled clearly. The submit button is disabled until form is valid. Time picker prevents selecting past times.

**6. Recognition Over Recall**
Service category chips (with icons) are shown prominently on the home screen so users can tap rather than type. Recent bookings surface on the home screen. Worker details are shown in the confirmation card — user never has to remember provider names.

**7. Flexibility and Efficiency of Use**
Quick shortcut chips for common services. Language toggle for switching mid-session. Workers can toggle availability with a single tap from the dashboard without navigating to settings.

**8. Aesthetic and Minimalist Design**
No gratuitous decoration. Every element serves a function. The homepage hero is impactful but the rest is clean white with strategic colour accents. Cards are spacious, not crowded. Typography hierarchy is clear at a glance.

**9. Help Users Recognize, Diagnose, and Recover from Errors**
Form errors appear inline below the field immediately (not after submit). OTP error shows a retry option with remaining attempts. If no workers are found, the agent screen shows a clear message with options: "Illaqa badlein ya waqt badlein?" with two action buttons.

**10. Trust Signals Embedded in Design**
Verified badge on worker profiles (shield-check in success-green). Star ratings always visible. Booking ID and Confirmation Code are prominently displayed (monospace, gold, large) — they feel official. Agent reasoning is transparent — users can see exactly why a worker was chosen.

---

## PART 10 — COLOUR APPLICATION SUMMARY

| Surface | Background | Text | Border/Accent |
|---|---|---|---|
| App background (most screens) | white-pure | charcoal-deep | — |
| Section backgrounds | white-soft | charcoal-deep | — |
| Feature/service cards | brown-matte | text-on-dark | gold-primary |
| Agent trace blocks | charcoal-mid | text-on-dark | gold-primary (left border) |
| Homepage hero | dark photo overlay | white-pure + gold | — |
| Stats/trust section | charcoal-deep | text-on-dark | gold-primary |
| Primary CTA buttons | gold-primary | charcoal-deep | — |
| Active booking alert (worker) | gold-primary | charcoal-deep | — |
| Bottom sheets / auth | white-pure | charcoal-deep | — |
| Tab bar | white-pure | gold (active) / charcoal-light (inactive) | top 0.5px |
| Input fields | white-pure | charcoal-deep | gold-primary (focused) |
| Status: Confirmed | transparent (success-green 10%) | success-green | — |
| Status: Pending | transparent (gold-muted 30%) | brown-matte | — |
| Status: Cancelled | transparent (error-red 10%) | error-red | — |

---

*KARIGAR UI Architecture v1.0 — Google AI Seekho Hackathon*
*Design System: White + Charcoal + Matte Brown + Gold #C49A5A*
