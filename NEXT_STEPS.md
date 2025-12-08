# EVYMA MVP Development - Next Steps

**Date:** December 8, 2025
**Current State:** UI Shell Complete (15%), No Backend (0%)
**Goal:** Launchable MVP in 4 weeks

---

## Quick Decision: Which Path?

You have **2 options** for development:

### Option A: Use Feature Branch (Recommended ✅)
- **Branch:** `claude/evyma-mvp-launch-review-01T3DHQ7oyUGnFcPr3rkttGn`
- **Status:** Week 1 foundation complete
- **Includes:** Auth pages, Zustand stores, entities, error handling
- **Action:** Merge to main, continue with Week 2

### Option B: Build from Main
- **Branch:** `main`
- **Status:** Only UI shell
- **Action:** Start Week 1 foundation from scratch

**Recommendation:** **Use Option A**. Week 1 foundation is already built and tested on feature branch. Merge it and move forward.

---

## Immediate Actions (This Week)

### 1. Merge Feature Branch to Main

```bash
git checkout main
git merge claude/evyma-mvp-launch-review-01T3DHQ7oyUGnFcPr3rkttGn
git push origin main
```

**What This Adds:**
- ✅ Complete database schema (11 entities)
- ✅ Authentication pages (Auth.jsx)
- ✅ Protected routes
- ✅ Zustand state management (4 stores)
- ✅ Error boundary & loading components
- ✅ Environment configuration

### 2. Set Up Base44 Entities

Base44 requires you to define entities in their dashboard or via API. You have 2 options:

#### Option A: Define via Base44 Dashboard (Easier)

1. Log in to Base44 dashboard
2. Navigate to your app: `6928d0ca672d396f2390d3a7`
3. Go to "Entities" section
4. Create each entity with fields:

**UserProfile:**
```json
{
  "name": "UserProfile",
  "fields": {
    "userId": "string",
    "onboardingComplete": "boolean",
    "trialStartedAt": "datetime",
    "trialEndsAt": "datetime",
    "subscriptionTier": "string",
    "coachPreference": "string",
    "preferences": "json"
  }
}
```

**Goal:**
```json
{
  "name": "Goal",
  "fields": {
    "userId": "string",
    "title": "string",
    "description": "string",
    "targetDate": "datetime",
    "status": "string",
    "progress": "number",
    "category": "string",
    "milestones": "json"
  }
}
```

**Habit:**
```json
{
  "name": "Habit",
  "fields": {
    "userId": "string",
    "name": "string",
    "description": "string",
    "frequency": "string",
    "customFrequency": "json",
    "streak": "number",
    "longestStreak": "number",
    "lastCheckedAt": "datetime",
    "completionHistory": "json",
    "reminderTime": "string",
    "reminderEnabled": "boolean",
    "status": "string"
  }
}
```

**Repeat for:** CoachCharacter, RealtimeSession, ChatMessage, Subscription, TimerSession, Notification, EmailLog

#### Option B: Define via Base44 API (Programmatic)

```javascript
// scripts/setupEntities.js
import { base44 } from './src/api/base44Client';

async function setupEntities() {
  // Define UserProfile
  await base44.entities.define('UserProfile', {
    userId: { type: 'string', required: true },
    onboardingComplete: { type: 'boolean', default: false },
    trialStartedAt: { type: 'datetime' },
    trialEndsAt: { type: 'datetime' },
    subscriptionTier: { type: 'string', default: 'free' },
    coachPreference: { type: 'string' },
    preferences: { type: 'json', default: {} }
  });

  // Define Goal
  await base44.entities.define('Goal', {
    userId: { type: 'string', required: true, index: true },
    title: { type: 'string', required: true },
    description: { type: 'string' },
    targetDate: { type: 'datetime' },
    status: { type: 'string', default: 'active', index: true },
    progress: { type: 'number', default: 0 },
    category: { type: 'string', index: true },
    milestones: { type: 'json', default: [] }
  });

  // ... define remaining entities

  console.log('✅ All entities defined');
}

setupEntities();
```

Run: `node scripts/setupEntities.js`

### 3. Configure Environment Variables

**Important:** Base44 hosting may inject variables automatically. Check their docs.

If you need to set them manually:

```bash
# .env.local (DO NOT commit)
VITE_BASE44_APP_ID=6928d0ca672d396f2390d3a7
VITE_OPENAI_API_KEY=sk-proj-YOUR_KEY_HERE
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY
VITE_APP_URL=http://localhost:5173
```

**Note:** If deploying to Base44 hosting, these may be set in their dashboard instead.

### 4. Test Authentication Flow

**Manual Test:**

1. Start dev server: `npm run dev`
2. Navigate to http://localhost:5173
3. Should redirect to `/auth` (not logged in)
4. Enter email, click "Start free trial"
5. Check console for Base44 auth flow
6. If using magic link, check email
7. Complete login
8. Should redirect to `/home`
9. Refresh page → should stay logged in

**Expected Behavior with Base44:**
- `base44.auth.login()` may redirect to Base44-hosted login page
- After auth, redirects back to your app with token
- Token stored in localStorage automatically
- `base44.auth.me()` returns current user

**If This Doesn't Work:**
- Check Base44 docs for auth flow specifics
- May need to configure redirect URLs in Base44 dashboard
- OAuth provider setup (Google, GitHub, etc.)

---

## Week 2: Core Features (40 hours)

### Task 2.1: Onboarding Flow (12 hours)

**File to Create:** `src/pages/Onboarding.jsx`

**Requirements:**
- 3-step wizard: Welcome → Create Goal → Choose Coach
- Progress indicator (1/3, 2/3, 3/3)
- Skip button (optional)
- On completion: Set `onboardingComplete: true`, redirect to /home

**Implementation:**

```javascript
// src/pages/Onboarding.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useGoalsStore } from '../stores/goalsStore';

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [goalTitle, setGoalTitle] = useState('');
  const [coachId, setCoachId] = useState('balanced');
  const navigate = useNavigate();

  const { profile, completeOnboarding } = useAuthStore();
  const { createGoal } = useGoalsStore();

  const handleComplete = async () => {
    // Create first goal
    await createGoal({
      title: goalTitle,
      status: 'active',
      progress: 0
    });

    // Mark onboarding complete
    await completeOnboarding(coachId);

    // Redirect to home
    navigate('/');
  };

  // ... implement UI with steps
}
```

**Add Route:**
```javascript
// src/pages/index.jsx
<Route path="/onboarding" element={
  <ProtectedRoute requireOnboarding={false}>
    <Onboarding />
  </ProtectedRoute>
} />
```

### Task 2.2: Goals CRUD Page (14 hours)

**File to Create:** `src/pages/Goals.jsx`

**Features:**
- List all goals with progress bars
- Create new goal (modal or slide-in form)
- Edit goal (inline or modal)
- Delete goal (confirm dialog)
- Filter by status (active, completed, archived)
- Mark as complete button

**Use Zustand Store:**
```javascript
import { useGoalsStore } from '../stores/goalsStore';

function Goals() {
  const { goals, fetchGoals, createGoal, updateGoal, deleteGoal } = useGoalsStore();

  useEffect(() => {
    fetchGoals();
  }, []);

  // ... implement UI
}
```

**Add Route:**
```javascript
<Route path="/goals" element={
  <ProtectedRoute>
    <Layout><Goals /></Layout>
  </ProtectedRoute>
} />
```

### Task 2.3: Habits Tracking Page (14 hours)

**File to Create:** `src/pages/Habits.jsx`

**Features:**
- List all habits with streaks
- Daily check-in button (✅)
- Streak visualization (🔥 fire emoji + number)
- Create/edit/delete habits
- Completion history (last 7 days calendar view)

**Implementation:**
```javascript
import { useHabitsStore } from '../stores/habitsStore';

function Habits() {
  const { habits, fetchHabits, checkIn, getTodayHabits } = useHabitsStore();

  const todayHabits = getTodayHabits();

  const handleCheckIn = async (habitId) => {
    try {
      await checkIn(habitId);
      toast.success('Checked in! 🔥');
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ... implement UI
}
```

---

## Week 3: AI Coaching & Dashboard (40 hours)

### Task 3.1: Text Chat with AI (12 hours)

**File to Create:** `src/pages/Chat.jsx`

**Base44 Integration:**
```javascript
import { InvokeLLM } from '../api/integrations';
import { useAuthStore } from '../stores/authStore';

function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { profile } = useAuthStore();

  const sendMessage = async () => {
    const userMessage = { role: 'user', content: input };
    setMessages([...messages, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await InvokeLLM({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a ${profile.coachPreference || 'balanced'} life coach. Help the user achieve their goals.`
          },
          ...messages,
          userMessage
        ]
      });

      const assistantMessage = {
        role: 'assistant',
        content: response.choices[0].message.content
      };

      setMessages([...messages, userMessage, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  // ... implement chat UI
}
```

**UI Components:**
- Message bubbles (user vs assistant)
- Input field with send button
- Typing indicator (when isLoading)
- Auto-scroll to bottom
- Mobile-friendly (full height)

### Task 3.2: Coach Personalities (8 hours)

**Option 1: Seed to Database**

```javascript
// scripts/seedCoaches.js
import { CoachCharacter } from './src/api/entities';

const coaches = [
  {
    name: 'Balanced',
    personality: 'balanced',
    description: 'Supportive and encouraging, balanced approach',
    systemPrompt: 'You are a balanced life coach. Be supportive, encouraging, and help users achieve their goals with a positive mindset.',
    voiceId: 'nova',
    avatar: '😊',
    isDefault: true,
    isActive: true
  },
  {
    name: 'Challenger',
    personality: 'challenging',
    description: 'Direct and accountability-focused',
    systemPrompt: 'You are a challenging coach. Push users to their limits, hold them accountable, and don't accept excuses. Be direct but fair.',
    voiceId: 'onyx',
    avatar: '💪',
    isDefault: false,
    isActive: true
  },
  // ... add 3 more
];

async function seedCoaches() {
  for (const coach of coaches) {
    await CoachCharacter.create(coach);
  }
  console.log('✅ Coaches seeded');
}

seedCoaches();
```

**Option 2: Hardcode in UI** (faster for MVP)

```javascript
// src/data/coaches.js
export const COACHES = [
  { id: 'balanced', name: 'Balanced', emoji: '😊', systemPrompt: '...' },
  { id: 'challenging', name: 'Challenger', emoji: '💪', systemPrompt: '...' },
  { id: 'nurturing', name: 'Nurturer', emoji: '🤗', systemPrompt: '...' },
  { id: 'analytical', name: 'Analyst', emoji: '🤓', systemPrompt: '...' },
  { id: 'motivational', name: 'Motivator', emoji: '🎯', systemPrompt: '...' }
];
```

### Task 3.3: Dashboard with Stats (6 hours)

**File to Create:** `src/pages/Dashboard.jsx`

**Features:**
- Active goals (top 3) with progress bars
- Habit streaks (visual indicators)
- Recent coaching sessions (last 7 days)
- Focus timer stats (total sessions, total time)
- Weekly calendar view (check-in dots)

**Implementation:**
```javascript
import { useGoalsStore } from '../stores/goalsStore';
import { useHabitsStore } from '../stores/habitsStore';

function Dashboard() {
  const { getActiveGoals } = useGoalsStore();
  const { getTopStreaks } = useHabitsStore();

  const activeGoals = getActiveGoals().slice(0, 3);
  const topStreaks = getTopStreaks(5);

  // ... render stats
}
```

### Task 3.4: Session Summaries (4 hours)

**Auto-generate after chat:**

```javascript
// In Chat.jsx, after conversation ends (user clicks "End session")
const generateSummary = async () => {
  const summary = await InvokeLLM({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'Summarize this coaching session in 3 bullet points.'
      },
      {
        role: 'user',
        content: JSON.stringify(messages)
      }
    ]
  });

  // Save to RealtimeSession entity
  await RealtimeSession.create({
    userId: user.id,
    coachId: profile.coachPreference,
    sessionType: 'text',
    transcript: messages,
    summary: summary.choices[0].message.content,
    duration: sessionDuration
  });
};
```

### Task 3.5: Weekly Calendar View (6 hours)

**Component:** `src/components/WeeklyCalendar.jsx`

```javascript
function WeeklyCalendar({ habits }) {
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const today = new Date();
  const weekStart = new Date(today.setDate(today.getDate() - today.getDay() + 1));

  return (
    <div className="grid grid-cols-7 gap-2">
      {weekDays.map((day, i) => {
        const date = new Date(weekStart);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];

        // Check if habits completed on this date
        const completed = habits.filter(h =>
          h.completionHistory?.includes(dateStr)
        );

        return (
          <div key={day} className="text-center">
            <div className="text-sm text-gray-500">{day}</div>
            <div className="text-lg">{date.getDate()}</div>
            {completed.length > 0 && (
              <div className="text-green-500">✓ {completed.length}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
```

---

## Week 4: Monetization & Polish (40 hours)

### Task 4.1: Stripe Integration (12 hours)

**Install Stripe:**
```bash
npm install @stripe/stripe-js
```

**File to Create:** `src/pages/Billing.jsx`

**Create Stripe Products:**
1. Log in to Stripe Dashboard
2. Create product: "EVYMA Basic" → $10/month
3. Get Price ID: `price_xxxxx`
4. Add to `.env.local`: `VITE_STRIPE_PRICE_BASIC=price_xxxxx`

**Implementation:**
```javascript
import { loadStripe } from '@stripe/stripe-js';
import { config } from '../api/base44Client';

const stripePromise = loadStripe(config.stripePublishableKey);

function Billing() {
  const { profile } = useAuthStore();

  const handleUpgrade = async () => {
    const stripe = await stripePromise;

    // Create checkout session (via Base44 function or direct Stripe API)
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        priceId: config.stripePrices.basic,
        userId: user.id
      })
    });

    const { sessionId } = await response.json();

    // Redirect to Stripe Checkout
    await stripe.redirectToCheckout({ sessionId });
  };

  // ... render billing UI
}
```

**Webhook Handler (Base44 Function):**
```javascript
// functions/stripeWebhook.js
import { Subscription } from './src/api/entities';

export async function handleStripeWebhook(event) {
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    // Create subscription record
    await Subscription.create({
      userId: session.metadata.userId,
      stripeCustomerId: session.customer,
      stripeSubscriptionId: session.subscription,
      status: 'active',
      tier: 'basic',
      amount: 1000, // $10.00 in cents
      currency: 'usd'
    });
  }

  if (event.type === 'customer.subscription.deleted') {
    // Cancel subscription
    await Subscription.update(subscriptionId, { status: 'canceled' });
  }
}
```

### Task 4.2: Trial System (8 hours)

**Display Trial Banner:**
```javascript
// src/components/TrialBanner.jsx
import { useAuthStore } from '../stores/authStore';

function TrialBanner() {
  const { profile, isTrialActive } = useAuthStore();

  if (!isTrialActive() || !profile.trialEndsAt) return null;

  const hoursLeft = Math.floor(
    (new Date(profile.trialEndsAt) - new Date()) / (1000 * 60 * 60)
  );

  return (
    <div className="bg-blue-500 text-white p-4 text-center">
      <p className="font-semibold">
        {hoursLeft} hours left in your free trial
      </p>
      <Button onClick={() => navigate('/billing')} variant="secondary">
        Upgrade Now
      </Button>
    </div>
  );
}
```

**Paywall:**
```javascript
// src/components/Paywall.jsx
function Paywall({ children }) {
  const { canAccessPremium } = useAuthStore();

  if (!canAccessPremium()) {
    return (
      <div className="text-center p-8">
        <h2>Your trial has ended</h2>
        <p>Upgrade to continue using EVYMA</p>
        <Button onClick={() => navigate('/billing')}>
          Upgrade to Basic ($10/mo)
        </Button>
      </div>
    );
  }

  return children;
}
```

### Task 4.3: Email Summaries (6 hours)

```javascript
import { SendEmail } from '../api/integrations';

async function emailSessionSummary(session, user) {
  await SendEmail({
    to: user.email,
    subject: `Your ${new Date().toLocaleDateString()} Coaching Session`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #3B82F6;">Session Summary</h1>
        <p><strong>Date:</strong> ${new Date(session.createdAt).toLocaleDateString()}</p>
        <p><strong>Duration:</strong> ${Math.round(session.duration / 60)} minutes</p>

        <h2>Summary</h2>
        <p>${session.summary}</p>

        ${session.actionItems?.length > 0 ? `
          <h2>Action Items</h2>
          <ul>
            ${session.actionItems.map(item => `<li>${item}</li>`).join('')}
          </ul>
        ` : ''}

        <a href="${config.appUrl}/sessions/${session.id}" style="display: inline-block; background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">
          View Full Session
        </a>
      </div>
    `
  });
}
```

### Task 4.4: Mobile Testing (6 hours)

**Test on Real Devices:**
- iPhone (Safari)
- Android (Chrome)
- iPad (Safari)

**Critical Flows:**
- [ ] Sign up → onboarding → first session (< 5 min)
- [ ] Create goal
- [ ] Check in on habit
- [ ] Chat with AI (keyboard doesn't overlap input)
- [ ] Stripe checkout works on mobile
- [ ] Voice recording (if implemented)

**Fix Common Mobile Issues:**
- Input zoom on iOS (font-size: 16px minimum)
- Fixed positioning with keyboard open
- Touch targets (min 44x44px)
- Horizontal scroll (max-width: 100vw)

### Task 4.5: Performance Optimization (4 hours)

**Code Splitting:**
```javascript
// src/pages/index.jsx
import { lazy, Suspense } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';

const Goals = lazy(() => import('./Goals'));
const Habits = lazy(() => import('./Habits'));
const Chat = lazy(() => import('./Chat'));

<Route path="/goals" element={
  <Suspense fallback={<LoadingSpinner fullScreen />}>
    <Goals />
  </Suspense>
} />
```

**Lazy Load Images:**
```javascript
<img src={avatar} alt="Coach" loading="lazy" />
```

**Bundle Analysis:**
```bash
npm install -D rollup-plugin-visualizer
# Add to vite.config.js
# Run: npm run build
# Open stats.html to see bundle breakdown
```

### Task 4.6: Pre-Launch Polish (4 hours)

**Legal Pages:**
- [ ] Terms of Service (`/terms`)
- [ ] Privacy Policy (`/privacy`)
- [ ] Disclaimer/Medical disclaimer (`/disclaimer`)

**404 Page:**
```javascript
// src/pages/NotFound.jsx
export default function NotFound() {
  return (
    <div className="text-center p-8">
      <h1 className="text-6xl">404</h1>
      <p>Page not found</p>
      <Button onClick={() => navigate('/')}>Go Home</Button>
    </div>
  );
}
```

**Error Logging:**
```bash
npm install @sentry/react
```

```javascript
// src/main.jsx
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE
});
```

---

## Deployment (Base44 Hosting)

### Option 1: Base44 Automatic Deployment

If Base44 provides hosting:

1. Connect GitHub repo in Base44 dashboard
2. Set production environment variables
3. Enable auto-deploy on `main` branch
4. Push to `main` → automatic deployment

### Option 2: Manual Deployment

```bash
# Build for production
npm run build

# Upload dist/ folder to Base44
# Or deploy to Vercel/Netlify
```

**Custom Domain:**
- Add CNAME record: `evyma.app → base44-hosting.com`
- Configure in Base44 dashboard

---

## Post-Launch Monitoring

### Week 1 After Launch

**Daily Tasks:**
- Check error logs (Sentry)
- Monitor signup conversion (Analytics)
- Review support tickets
- Track trial → paid conversion

**Metrics to Track:**
- Signups per day
- Activation rate (complete onboarding)
- Trial-to-paid conversion
- Churn rate
- Average session duration
- Most used features (Goals vs Habits vs Chat)

**User Feedback:**
- Add Typeform survey: "How can we improve?"
- Monitor social media mentions
- Set up support email: support@evyma.app

---

## Summary: Your 4-Week Roadmap

| Week | Focus | Deliverables | Hours |
|------|-------|--------------|-------|
| **Week 1** | Foundation | Auth, entities, state mgmt | 40 |
| **Week 2** | Core Features | Goals, Habits, Onboarding | 40 |
| **Week 3** | AI & Analytics | Chat, Dashboard, Summaries | 40 |
| **Week 4** | Monetization | Stripe, Trial, Testing | 40 |

**Total:** 160 hours (~4 weeks at 40h/week)

---

## Decision Points

**Before Starting Week 2:**
- [ ] Merge feature branch to main (or rebuild from main)
- [ ] Define all entities in Base44 dashboard
- [ ] Test authentication flow end-to-end
- [ ] Verify InvokeLLM integration works

**Before Starting Week 4:**
- [ ] Create Stripe account + products
- [ ] Get Stripe test keys
- [ ] Set up webhook endpoint
- [ ] Test checkout flow in sandbox

**Before Launch:**
- [ ] Switch Stripe to live mode
- [ ] Add legal pages
- [ ] Set up error logging
- [ ] Configure custom domain
- [ ] Load test (100 concurrent users)

---

## Need Help?

**Base44 Documentation:**
- Authentication: [Base44 Auth Docs]
- Entities: [Base44 Database Docs]
- Integrations: [Base44 Integrations Docs]

**Community Support:**
- Base44 Discord/Slack
- GitHub Discussions (if public repo)

**Hire Help:**
- Consider hiring freelancer for Week 4 if timeline tight
- Upwork, Fiverr: "React + Stripe integration"
- Budget: $500-1000 for 10-15 hours of expert help

---

**Ready to build? Start with merging the feature branch and testing authentication! 🚀**
