# EVYMA Testing Plan & Quality Assurance Strategy

**Date:** December 8, 2025
**Branch:** main (production review)
**Current State:** UI Shell (15% complete)

---

## Executive Summary

The current codebase has **excellent UI/UX** (9/10 quality) but **zero backend functionality**. Testing should focus on:
1. **What works:** UI components, responsive design, Focus Timer
2. **What's missing:** Authentication, data persistence, core features
3. **Integration:** Base44 SDK methods and API connectivity

---

## Phase 1: Current State Testing (Do This Now)

### 1.1 UI/UX Testing

**Manual Testing Checklist:**

- [ ] **Home Page Load**
  - Load http://localhost:5173
  - Verify theme switcher works (12 colors)
  - Toggle dark/light mode
  - Test 3-column vs 4-column grid layout
  - Hide/show apps toggle

- [ ] **Responsive Design**
  - Test on desktop (1920x1080, 1366x768)
  - Test on tablet (768px width)
  - Test on mobile (375px, 414px width)
  - Verify Dock scales properly
  - Check app grid responsiveness

- [ ] **Focus Timer (Core Feature)**
  - **Timer Mode:**
    - Start Pomodoro (25 min work, 5 min break)
    - Start 52-17 technique
    - Start 90-20 technique
    - Create custom timer
    - Pause/resume
    - Reset
  - **Stopwatch Mode:**
    - Start/stop stopwatch
    - Record lap times
  - **Alarm Mode:**
    - Set alarm time
    - Test alarm sound
  - **Sounds:**
    - Toggle white noise, brown noise, rain, ocean, forest
    - Adjust volume slider
  - **Session Notes:**
    - Complete a session
    - Add notes
    - Verify session appears in history
  - **Bug Check:**
    - Refresh page → **Sessions lost** (expected bug, no persistence)
    - Switch tabs during timer → verify timer continues

- [ ] **Settings Drawer**
  - Open settings (gear icon in app grid)
  - Change theme color
  - Toggle dark mode
  - Change grid columns
  - Close drawer (overlay click, X button)

- [ ] **Notifications Drawer**
  - Open notifications (bell icon in Dock)
  - Verify empty state message
  - Close drawer

- [ ] **App Launcher**
  - Click each app icon → **Verify console logs** (placeholders)
  - Drag app icons to rearrange (if edit mode works)
  - Verify only Timer and Settings actually work

### 1.2 Browser Compatibility

**Test in:**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (macOS/iOS)
- [ ] Edge (latest)

**Known Issues to Check:**
- Safari: Web Audio API may require user gesture
- iOS Safari: Fullscreen issues with Dock overlay
- Firefox: SVG rendering in hexagonal Dock

### 1.3 Performance Testing

**Metrics to Measure:**

```bash
# Run Lighthouse audit
npm run build
npm run preview
# Open Chrome DevTools → Lighthouse → Run Audit

Target Scores:
- Performance: >90
- Accessibility: >90
- Best Practices: >80
- SEO: >70
```

**Expected Results:**
- First Contentful Paint (FCP): < 1.5s
- Largest Contentful Paint (LCP): < 2.5s
- Time to Interactive (TTI): < 3.5s
- Bundle size: < 500KB (check with `npm run build`)

### 1.4 Accessibility Testing

- [ ] Keyboard navigation (Tab, Enter, Esc)
- [ ] Screen reader (NVDA, VoiceOver)
- [ ] Focus indicators visible
- [ ] ARIA labels present
- [ ] Color contrast (4.5:1 minimum)

---

## Phase 2: Base44 Integration Testing (Next Priority)

### 2.1 Authentication Testing

**Prerequisites:**
- Merge feature branch with Auth.jsx
- Deploy to Base44 hosting or test locally

**Test Cases:**

```javascript
// Test 1: Magic Link Sign-Up
1. Navigate to /auth
2. Enter email
3. Click "Start free trial"
4. Check email inbox
5. Click magic link
6. Verify redirect to /onboarding (or /home)
7. Verify user session persists on page refresh

// Test 2: Sign-In (Existing User)
1. Sign out
2. Navigate to /auth
3. Toggle to "Sign In"
4. Enter registered email
5. Click magic link in email
6. Verify redirect to /home
7. Check trial timer started

// Test 3: Protected Routes
1. Clear cookies/localStorage
2. Navigate to /home
3. Verify redirect to /auth?redirect=/home
4. After login, verify redirect back to /home

// Test 4: Session Persistence
1. Sign in
2. Refresh page
3. Verify user still authenticated
4. Close tab, reopen → still authenticated
```

### 2.2 Database Entity Testing

**Setup:**
```javascript
// In Base44 dashboard, create entities:
- UserProfile
- Goal
- Habit
- TimerSession
```

**Test CRUD Operations:**

```javascript
// Test 1: Create Goal
import { base44 } from './src/api/base44Client';

const user = await base44.auth.me();
const goal = await base44.entities.Goal.create({
  userId: user.id,
  title: "Launch EVYMA MVP",
  targetDate: "2025-12-31",
  status: "active",
  progress: 0
});
console.log('Created goal:', goal);

// Test 2: List Goals
const goals = await base44.entities.Goal.list({ userId: user.id });
console.log('User goals:', goals);

// Test 3: Update Goal
const updated = await base44.entities.Goal.update(goal.id, {
  progress: 50
});
console.log('Updated goal:', updated);

// Test 4: Delete Goal
await base44.entities.Goal.delete(goal.id);
console.log('Goal deleted');
```

### 2.3 AI Integration Testing (InvokeLLM)

**Test Text Chat:**

```javascript
import { InvokeLLM } from './src/api/integrations';

// Test 1: Simple Chat
const response = await InvokeLLM({
  model: "gpt-4o-mini",
  messages: [
    { role: "system", content: "You are a life coach." },
    { role: "user", content: "Help me stay motivated to work out." }
  ]
});
console.log('AI Response:', response.choices[0].message.content);

// Test 2: Streaming (if supported)
const stream = await InvokeLLM({
  model: "gpt-4o-mini",
  messages: [...],
  stream: true
});
for await (const chunk of stream) {
  console.log(chunk);
}
```

### 2.4 Email Integration Testing

```javascript
import { SendEmail } from './src/api/integrations';

// Test 1: Session Summary Email
await SendEmail({
  to: user.email,
  subject: "Your Coaching Session Summary",
  html: `
    <h1>Session Summary</h1>
    <p>You discussed: Goal setting and motivation</p>
    <p>Action items:</p>
    <ul>
      <li>Set 3 specific goals for this month</li>
      <li>Schedule daily 30-min focus sessions</li>
    </ul>
  `
});

// Verify email received in inbox
```

---

## Phase 3: Feature Integration Testing (After Building Features)

### 3.1 Goals Management

**Test Workflow:**
1. Sign in as new user
2. Create first goal
3. Edit goal title
4. Update progress to 50%
5. Mark as completed
6. Archive goal
7. Filter by status (active, completed, archived)
8. Delete goal
9. Refresh page → verify data persists

### 3.2 Habits Tracking

**Test Workflow:**
1. Create daily habit "Morning meditation"
2. Check in for today
3. Verify streak = 1
4. Check in tomorrow (simulate with date change)
5. Verify streak = 2
6. Skip a day → verify streak resets
7. Check completion history array

### 3.3 AI Coaching Session

**Test Workflow:**
1. Navigate to Chat page
2. Send message: "I want to improve my productivity"
3. Verify AI responds within 5 seconds
4. Continue 3-4 message conversation
5. Verify chat history displays
6. Refresh page → verify messages persist
7. Check if session summary auto-generates

### 3.4 Trial & Subscription

**Test Workflow:**
1. Sign up new account
2. Verify "Trial ends in 23 hours" banner
3. Use app for 1 hour
4. Fast-forward system time 24 hours (for testing)
5. Verify paywall appears
6. Click "Upgrade" button
7. Verify Stripe checkout opens
8. Use test card: 4242 4242 4242 4242
9. Complete payment
10. Verify access restored
11. Check Subscription entity created

---

## Phase 4: End-to-End Testing (Pre-Launch)

### 4.1 User Journey Test

**Complete 5-Minute Onboarding Flow:**

```
Time   Action                        Expected Result
----   ---------------------------   ---------------------------------
0:00   Visit evyma.app              → Landing/Auth page loads
0:30   Enter email, click "Sign up" → Magic link sent
1:00   Click magic link in email    → Redirect to onboarding
1:30   Step 1: Set first goal       → Goal creation form
2:30   Step 2: Choose coach         → Coach personality selection
3:00   Step 3: Start first session  → Chat or voice interface
5:00   Complete onboarding          → Redirect to dashboard with goal
```

**Verify:**
- Total time < 5 minutes
- No errors or broken links
- Data persists after onboarding
- User sees trial banner

### 4.2 Daily Active User Flow

```
Day 1: Sign up → Create 3 goals → Start timer → Chat with AI
Day 2: Check in on habit → Update goal progress → 25-min focus session
Day 3: Complete goal → Chat about next goal → Check streak
```

### 4.3 Load Testing

**Tools:**
- k6 (https://k6.io)
- Artillery (https://artillery.io)

**Test Scenarios:**

```javascript
// Load test: 100 concurrent users
import http from 'k6/http';
import { check } from 'k6';

export let options = {
  vus: 100, // 100 virtual users
  duration: '1m',
};

export default function () {
  let res = http.get('https://evyma.app');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'page loads < 3s': (r) => r.timings.duration < 3000,
  });
}
```

**Target Metrics:**
- 100 concurrent users: 99% requests < 3s response time
- 500 req/sec: No errors
- Database queries < 200ms

---

## Phase 5: Security & Compliance Testing

### 5.1 Security Checklist

- [ ] HTTPS enforced (no HTTP)
- [ ] Base44 auth tokens stored securely (httpOnly cookies)
- [ ] No API keys exposed in frontend code
- [ ] No sensitive data in console.log
- [ ] CORS configured properly
- [ ] XSS protection (React escapes by default)
- [ ] CSRF tokens (check Base44 SDK)

### 5.2 Privacy & GDPR

- [ ] Privacy Policy page published
- [ ] Terms of Service page published
- [ ] Cookie consent banner (if using analytics)
- [ ] Data deletion endpoint (GDPR right to erasure)
- [ ] Data export endpoint (GDPR right to portability)

---

## Testing Tools & Setup

### Recommended Tools

```bash
# Install testing dependencies
npm install -D @testing-library/react @testing-library/jest-dom vitest

# Unit tests
npm install -D vitest @vitest/ui

# E2E tests
npm install -D playwright
```

### Example Unit Test

```javascript
// src/components/__tests__/FocusTimer.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import FocusTimer from '../evyma/FocusTimer';

test('Timer starts when play button clicked', () => {
  render(<FocusTimer />);
  const playButton = screen.getByLabelText('Start timer');
  fireEvent.click(playButton);

  // Verify timer is running
  expect(screen.getByText(/running/i)).toBeInTheDocument();
});
```

---

## Bug Tracking Template

### Severity Levels
- **P0 (Blocker):** Prevents core functionality (auth broken, payments fail)
- **P1 (Critical):** Major feature broken (timer crashes, goals won't save)
- **P2 (High):** UI bug or minor feature issue (button misaligned, typo)
- **P3 (Low):** Nice-to-have improvement

### Bug Report Template

```markdown
**Title:** [P0] Users cannot sign in with magic link

**Steps to Reproduce:**
1. Go to /auth
2. Enter email: test@example.com
3. Click "Send magic link"
4. Click link in email

**Expected:** Redirect to /home, user authenticated
**Actual:** 500 error, redirect to /auth

**Environment:** Chrome 120, macOS 14.1, Production
**Screenshot:** [attach]
**Console Errors:** [paste]
```

---

## Pre-Launch Checklist

### 1 Week Before Launch

- [ ] All P0 bugs fixed
- [ ] All P1 bugs fixed or documented
- [ ] End-to-end user journey tested 10+ times
- [ ] Load testing completed (100 concurrent users)
- [ ] Mobile testing on 3+ real devices
- [ ] Legal pages published (Terms, Privacy)
- [ ] Error logging active (Sentry/LogRocket)
- [ ] Analytics tracking live (PostHog/Mixpanel)
- [ ] Stripe in live mode (not test)
- [ ] Email templates tested

### Launch Day

- [ ] Smoke test critical flows (auth, payment, chat)
- [ ] Monitor error logs (first hour)
- [ ] Monitor server metrics (CPU, memory, requests)
- [ ] Customer support ready
- [ ] Rollback plan documented

### Post-Launch (Week 1)

- [ ] Daily error log review
- [ ] User feedback collection (Typeform, Google Forms)
- [ ] Conversion funnel analysis (trial → paid)
- [ ] Performance monitoring (page load times)
- [ ] A/B test onboarding flow (if traffic allows)

---

## Testing Summary

| Phase | When | Duration | Priority |
|-------|------|----------|----------|
| **Phase 1: Current State** | Now | 2 hours | P0 |
| **Phase 2: Base44 Integration** | After merging auth branch | 4 hours | P0 |
| **Phase 3: Feature Testing** | As features built | Ongoing | P0 |
| **Phase 4: E2E Testing** | 1 week before launch | 8 hours | P0 |
| **Phase 5: Security** | 3 days before launch | 4 hours | P1 |

**Total Testing Effort:** ~20 hours across 4 weeks

---

## Next Steps

1. **Immediate (Today):**
   - Run Phase 1 tests on current UI
   - Document any bugs found
   - Verify Focus Timer works on mobile

2. **This Week:**
   - Merge feature branch with authentication
   - Run Phase 2 Base44 integration tests
   - Set up error logging (Sentry free tier)

3. **Ongoing:**
   - Test each new feature as it's built
   - Keep bug backlog in GitHub Issues
   - Weekly testing session (1 hour)
