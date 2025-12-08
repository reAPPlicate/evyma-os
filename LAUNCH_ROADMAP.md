# EVYMA MVP Launch Roadmap - Critical Gap Analysis

**Date:** December 8, 2025
**Current Branch:** `claude/evyma-mvp-launch-review-01T3DHQ7oyUGnFcPr3rkttGn`
**Assessment:** Critical misalignment between contract assumptions and reality

---

## 🚨 CRITICAL FINDING: Contract vs. Reality

### The Launch Contract Claims (~75% Complete):
- ✅ Authentication working
- ✅ Goals/Habits CRUD working
- ✅ Voice AI Coach working (Realtime API)
- ✅ Text chat fallback working
- ✅ Coach personalities working
- ✅ Session summaries working
- ✅ Trial system working
- ✅ Stripe integration working
- ✅ SMS reminders working

### Actual Codebase Reality (~15% Complete):
- ✅ **ONLY COMPLETE:** Beautiful UI shell + Focus Timer
- ❌ **NOT IMPLEMENTED:** Everything else listed above
- ⚠️ **INFRASTRUCTURE ONLY:** Base44 SDK configured but unused

**Gap:** The contract assumes 10-15 days of polish work. **Reality:** 60-80 hours of core feature development needed.

---

## Current State: What Actually Exists

### ✅ Working Features (15%)

1. **Focus Timer** (734 lines, production-ready)
   - Pomodoro, 52-17, 90-20 techniques
   - Stopwatch and alarm modes
   - Ambient sounds (5 types)
   - Session tracking in local state
   - **Gap:** Not persisted to database

2. **UI Shell** (344 lines Home.jsx + components)
   - 12 theme colors with dark/light mode
   - Mobile-first responsive design
   - Dock navigation with SVG hexagonal design
   - App launcher grid (14 app placeholders)
   - Settings and notifications drawers
   - **Gap:** 13 out of 14 apps lead nowhere

3. **Infrastructure**
   - Base44 SDK v0.1.2 configured (App ID: `6928d0ca672d396f2390d3a7`)
   - Shadcn UI (54 components installed)
   - Tailwind CSS + Framer Motion
   - React Router v7.2.0
   - Available integrations: InvokeLLM, SendEmail, UploadFile

### ❌ Missing Features (85%)

**Authentication**
- No sign-in/sign-up UI
- No protected routes
- No user session management
- No auth state in React

**Data Layer**
- No database entities defined (only `User` auth entity)
- No data models for: Goals, Habits, Sessions, CoachCharacter, Subscriptions
- No API calls to Base44 backend
- Timer sessions lost on page refresh

**Core Features**
- Goals management: 0% (placeholder app icon only)
- Habits tracking: 0% (placeholder app icon only)
- Voice AI coaching: 0% (no OpenAI Realtime API)
- Text chat: 0% (input UI exists, no backend)
- Coach personalities: 0% (not implemented)
- Session summaries: 0% (not implemented)
- Dashboard/stats: 0% (placeholder app icon only)

**Monetization**
- Stripe: 0% (no integration found)
- Trial system: 0% (not implemented)
- Subscription tiers: 0% (not implemented)
- Payment UI: 0% (Billing app is placeholder)

**Communication**
- Email summaries: 0% (SendEmail available but unused)
- SMS reminders: 0% (no Twilio integration)
- Notifications: 0% (drawer exists, empty)

---

## Revised Build Plan: 4-Week Sprint

### **Week 1: Foundation & Authentication** (40 hours)

#### Priority 0: Critical Infrastructure

**Task 1.1: Base44 Database Schema** (8 hours)
- Define entities in Base44:
  ```javascript
  // src/api/entities.js
  - User (extend with: onboardingComplete, trialEndsAt, subscriptionTier, coachPreference)
  - Goal (id, userId, title, description, targetDate, status, progress, createdAt)
  - Habit (id, userId, name, frequency, streak, lastCheckedAt, createdAt)
  - CoachCharacter (id, name, personality, systemPrompt, voiceId)
  - RealtimeSession (id, userId, coachId, transcript, summary, duration, createdAt)
  - Subscription (id, userId, stripeCustomerId, status, tier, currentPeriodEnd)
  ```

**Task 1.2: Authentication Flow** (12 hours)
- Create `src/pages/Auth.jsx` - Sign in/sign up UI
- Use Base44 magic link or OAuth
- Protected route wrapper (`src/components/ProtectedRoute.jsx`)
- User session context (`src/context/AuthContext.jsx`)
- Redirect logic: auth → onboarding → home

**Task 1.3: State Management** (8 hours)
- Install Zustand: `npm install zustand`
- Create stores:
  - `src/stores/authStore.js` - User session, logout
  - `src/stores/goalsStore.js` - Goals CRUD + sync
  - `src/stores/habitsStore.js` - Habits CRUD + sync
  - `src/stores/settingsStore.js` - Theme, notifications

**Task 1.4: Environment Configuration** (4 hours)
- Create `.env.local`:
  ```
  VITE_BASE44_APP_ID=6928d0ca672d396f2390d3a7
  VITE_OPENAI_API_KEY=sk-...
  VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
  ```
- Update `base44Client.js` to use env vars
- Add `.env.example` to repo

**Task 1.5: Error Handling** (8 hours)
- Error boundary component (`src/components/ErrorBoundary.jsx`)
- Toast notifications for API errors (already have Sonner)
- Loading states (skeletons, spinners)
- Offline detection

---

### **Week 2: Core Features (Goals, Habits, Onboarding)** (40 hours)

#### Priority 0: 5-Minute Onboarding Flow

**Task 2.1: Onboarding Page** (12 hours)
- Create `src/pages/Onboarding.jsx`
- Multi-step form (React Hook Form + Zod):
  1. Welcome + accept disclaimer
  2. "What's one goal?" (quick goal creation)
  3. "Choose your coach" (3-5 personalities)
  4. "Start your first session" (redirect to voice chat)
- Progress indicator (1/4, 2/4, 3/4, 4/4)
- Skip option (redirect to dashboard)
- Store: `onboardingComplete: true` in User entity

**Task 2.2: Goals Management** (14 hours)
- Create `src/pages/Goals.jsx`:
  - List view with progress bars
  - Create/edit/delete modals
  - Status filter (active, completed, archived)
  - Due date picker (react-day-picker)
  - Progress slider (0-100%)
- CRUD operations via Base44 SDK
- Sync with Zustand store
- Update AppLauncher to navigate to `/goals`

**Task 2.3: Habits Tracking** (14 hours)
- Create `src/pages/Habits.jsx`:
  - List view with checkboxes
  - Create/edit/delete modals
  - Frequency options (daily, weekly, custom)
  - Streak calculation and display
  - Check-in button → update `lastCheckedAt`
- CRUD operations via Base44 SDK
- Visual streak indicators (🔥 fire emoji + number)
- Update AppLauncher to navigate to `/habits`

---

### **Week 3: AI Coach + Dashboard** (40 hours)

#### Priority 0: Voice AI Coaching

**Task 3.1: OpenAI Realtime API Integration** (16 hours)
- Research OpenAI Realtime API docs
- Install: `npm install openai`
- Create `src/services/realtimeAI.js`:
  - WebSocket connection to Realtime API
  - Audio recording via Web Audio API
  - Voice activity detection (VAD)
  - Streaming transcription
- Update Dock component:
  - Connect voice recording button to Realtime API
  - Visual feedback (waveform, speaking indicator)
  - Handle audio playback from AI
- Store sessions in RealtimeSession entity

**Task 3.2: Coach Personalities** (8 hours)
- Seed 5 CoachCharacter entities:
  1. Balanced (neutral, supportive)
  2. Challenging (direct, accountability-focused)
  3. Nurturing (warm, empathetic)
  4. Analytical (data-driven, strategic)
  5. Motivational (energetic, enthusiastic)
- Create `src/pages/CoachSelection.jsx`
- Store user preference in User entity
- Pass coach systemPrompt to Realtime API

**Task 3.3: Text Chat Fallback** (6 hours)
- Create `src/pages/Chat.jsx` (or update existing if found)
- Connect Dock text input to Base44 InvokeLLM
- Streaming chat UI with message history
- Use same coach personality systemPrompt
- Fallback when voice unavailable (mobile Safari issues)

**Task 3.4: Session Summaries** (4 hours)
- After each Realtime session, generate summary via InvokeLLM:
  - Prompt: "Summarize this coaching session in 3 bullet points"
  - Store in RealtimeSession.summary
- Display in session history
- "Email me this summary" button (Task 4.2)

**Task 3.5: Dashboard & Weekly View** (6 hours)
- Create `src/pages/Dashboard.jsx`:
  - Active goals (top 3) with progress bars
  - Habit streaks (visual 🔥 indicators)
  - Recent sessions (last 7 days)
  - **Weekly calendar view:**
    - 7-day grid (Mon-Sun)
    - Check-in dots per day (green = completed)
    - Streak visualization
- Stats: Total sessions, longest streak, goals completed

---

### **Week 4: Monetization + Polish** (40 hours)

#### Priority 0: Stripe Integration

**Task 4.1: Stripe Setup** (12 hours)
- Install: `npm install @stripe/stripe-js`
- Create Stripe products:
  - Free Trial (24-hour, no card required)
  - Basic Tier ($10/mo)
- Create `src/pages/Billing.jsx`:
  - Current subscription status
  - Upgrade button → Stripe Checkout
  - Customer portal link (manage billing)
- Webhook handler via Base44 function:
  - `checkout.session.completed` → create Subscription
  - `customer.subscription.updated` → update status
  - `customer.subscription.deleted` → cancel subscription
- Trial enforcement: Check `trialEndsAt` vs current time

**Task 4.2: Email Notifications** (6 hours)
- Use Base44 SendEmail integration
- Post-session email:
  - Trigger: After RealtimeSession saved
  - Content: Session summary + date + coach name
  - Subject: "Your [Date] coaching session summary"
- Welcome email (post-signup)
- Trial expiring email (23 hours into trial)

**Task 4.3: Trial System + Upgrade UX** (8 hours)
- On signup: Set `trialEndsAt = now() + 24 hours`
- Trial banner in Dashboard:
  - "X hours left in your free trial"
  - "Upgrade to continue" button
- Post-trial block:
  - If `now() > trialEndsAt && !subscription`, show paywall
  - Block access to voice/chat sessions
  - Allow view-only access to past sessions
- Re-trial prevention (already mentioned as fixed in contract)

**Task 4.4: Mobile Testing** (6 hours)
- Test on physical devices:
  - iPhone (Safari, Chrome)
  - Android (Chrome, Firefox)
- Critical flows:
  - Sign up → onboarding → first session
  - Voice recording (Web Audio API compatibility)
  - Habit check-ins
  - Stripe checkout
- Fix responsive layout issues (likely in Dock, Drawers)

**Task 4.5: Performance Optimization** (4 hours)
- Lazy load pages: `React.lazy()` + `Suspense`
- Code splitting (separate chunks for Goals, Habits, Chat, Dashboard)
- Image optimization (if any)
- Bundle analysis: `npm install vite-plugin-visualizer`
- Target: < 3s page load, < 500KB initial bundle

**Task 4.6: Production Readiness** (4 hours)
- Legal pages (Terms, Privacy, Disclaimer)
- 404 page
- Sentry or error logging setup
- Analytics (PostHog, Mixpanel, or Google Analytics)
- Monitoring (uptime checks via Better Uptime or Pingdom)
- Load testing (k6 or Artillery - 100 concurrent users)

---

## Scope Reductions (Recommend Cutting for MVP)

### Cut from Launch Contract:

1. **SMS Reminders** (Save 8 hours)
   - Reason: Email summaries + in-app notifications sufficient for MVP
   - Adds Twilio complexity and cost
   - Defer to post-launch

2. **Multiple Subscription Tiers** (Already simplified in contract)
   - Keep only: Free Trial → Basic ($10/mo)
   - Hide Moderate/Advanced from UI
   - Backend can support them, but don't expose

3. **Advanced Gamification**
   - Keep basic streaks (already in Habits)
   - Cut: Achievement trees, leaderboards, points system (contract already excludes)

4. **Calendar Integration** (Not in contract, but app icon exists)
   - Cut from MVP
   - Defer to post-launch

5. **Journal, Health Tracking, Rewards** (App placeholders)
   - Cut from MVP
   - These are feature creep
   - Remove app icons or grey them out

---

## Critical Path: Minimum Viable Launch

If time is constrained, focus on **absolute essentials only** (reduce to 2 weeks / 60 hours):

### Week 1 (30 hours):
- Authentication flow (8h)
- Database schema (6h)
- Simple onboarding (no coach selection) (6h)
- Goals CRUD (basic) (10h)

### Week 2 (30 hours):
- Text chat with AI (no voice) (12h)
- Dashboard with goals progress (6h)
- Stripe checkout + trial (10h)
- Mobile testing (2h)

**Launch with:** Text-only AI coaching, goals tracking, basic trial-to-paid flow.
**Defer:** Voice AI, habits, coach personalities, session summaries, weekly view.

---

## Technical Debt & Risks

### High Risk:
1. **OpenAI Realtime API Complexity** (16h estimate may be low)
   - WebSocket handling, audio encoding, error recovery
   - Mobile browser audio API limitations
   - **Mitigation:** Start with text chat, add voice as v1.1

2. **Stripe Webhook Reliability**
   - Base44 function cold starts
   - Webhook signature verification
   - **Mitigation:** Thorough testing with Stripe CLI

3. **Mobile Safari Voice Recording**
   - getUserMedia() requires HTTPS + user gesture
   - Audio encoding compatibility
   - **Mitigation:** Extensive testing, fallback to text

### Medium Risk:
4. **Base44 Learning Curve**
   - Team may not be familiar with Base44 SDK
   - Entity relationship modeling
   - **Mitigation:** Review Base44 docs, start simple

5. **Trial Re-Trial Prevention**
   - Contract mentions "just fixed re-trial bug"
   - But no code exists yet
   - **Mitigation:** Use fingerprinting (email + device ID)

### Low Risk:
6. **Timer Session Migration**
   - Currently in local state, need to persist
   - **Mitigation:** Simple data migration, low complexity

---

## Deployment Plan

### Pre-Launch Checklist:
- [ ] Environment variables set in production
- [ ] Base44 app deployed and verified
- [ ] Stripe set to live mode (not test)
- [ ] Legal pages published (Terms, Privacy)
- [ ] Error logging active (Sentry)
- [ ] Analytics tracking live
- [ ] Uptime monitoring configured
- [ ] Load testing completed (100 users)
- [ ] Mobile testing on 3+ devices
- [ ] Email templates tested
- [ ] Trial expiration flow tested end-to-end

### Launch Day:
1. Deploy to production (Base44 handles hosting)
2. Smoke test critical flows
3. Monitor error logs (first 24 hours)
4. Customer support ready for onboarding questions

---

## Revised Effort Estimate

| Phase | Original Contract | Actual Effort | Reason for Difference |
|:---|:---:|:---:|:---|
| **Week 1: Foundation** | 0h (assumed done) | **40h** | Auth, DB schema, state management all missing |
| **Week 2: Core Features** | 15h (onboarding polish) | **40h** | Goals, Habits, Onboarding built from scratch |
| **Week 3: AI + Dashboard** | 10h (weekly view + polish) | **40h** | Voice AI, coach personalities, chat, summaries all missing |
| **Week 4: Monetization** | 5h (simplify tiers + testing) | **40h** | Stripe integration, trial system, emails all missing |
| **TOTAL** | **30h** | **160h** | **130h gap** due to incorrect baseline assessment |

**Realistic Timeline:**
- **4 weeks (1 full-time dev):** 160 hours = Aggressive but feasible
- **2 weeks (2 full-time devs):** Parallel work on features
- **6 weeks (1 part-time dev):** More sustainable pace

---

## Recommendations to CEO

### 1. **Revise Launch Expectations**
The contract assumes polish work on existing features. Reality: 160 hours of core development needed. This is not a "30-day sprint to launch" from current state. It's a **4-8 week build from 15% completion**.

### 2. **De-Risk Voice AI**
Voice coaching is high-complexity, high-risk. Recommend:
- **Phase 1 Launch:** Text chat only (12h instead of 16h for voice)
- **Phase 1.1 (2 weeks post-launch):** Add voice as enhancement
- Reduces launch risk, faster to market

### 3. **Simplify MVP Further**
Cut these from initial launch:
- Voice AI → defer to v1.1
- Habits tracking → focus on Goals only
- Coach personalities → single default coach
- SMS reminders → email only

**Ultra-MVP (2 weeks):**
- Auth + Onboarding
- Goals CRUD
- Text AI chat
- Trial + Stripe
- Dashboard (goals progress only)

**Result:** Launchable in 60 hours instead of 160 hours.

### 4. **Resource Allocation**
Current plan assumes 1 developer. To hit 30-day launch:
- **Option A:** 2 developers (parallel work)
- **Option B:** Reduce scope to Ultra-MVP
- **Option C:** Extend to 6-8 weeks (more realistic)

### 5. **Quality vs. Speed**
Rushing 160 hours into 30 days = technical debt + bugs. Recommend:
- **Week 1-2:** Foundation (auth, DB, core UI)
- **Week 3-4:** AI chat + goals
- **Week 5-6:** Monetization + polish
- **Week 7:** Testing + soft launch
- **Week 8:** Public launch

**Launch Confidence:**
- With current plan (30 days, 1 dev, full scope): **25%**
- With Ultra-MVP (30 days, 1 dev): **70%**
- With full scope (60 days, 2 devs): **85%**

---

## Next Steps

1. **Approve scope:** Full MVP (160h) or Ultra-MVP (60h)?
2. **Assign resources:** 1 or 2 developers?
3. **Set timeline:** 30, 45, or 60 days?
4. **Begin Week 1:** Database schema + authentication (critical path)

**Ready to start implementation on your command.**
