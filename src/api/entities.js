import { base44 } from './base44Client';

// ============================================
// EVYMA Database Entities
// ============================================

// Authentication
export const User = base44.auth;

// Extended User Profile (custom fields)
export const UserProfile = base44.entity('UserProfile', {
  userId: 'string',           // Reference to auth User
  onboardingComplete: 'boolean',
  trialStartedAt: 'datetime',
  trialEndsAt: 'datetime',
  subscriptionTier: 'string',  // 'free', 'basic', 'moderate', 'advanced'
  coachPreference: 'string',   // CoachCharacter ID
  preferences: 'json',         // { theme, notifications, etc. }
  createdAt: 'datetime',
  updatedAt: 'datetime'
});

// Goals Management
export const Goal = base44.entity('Goal', {
  userId: 'string',
  title: 'string',
  description: 'string',
  targetDate: 'datetime',
  status: 'string',            // 'active', 'completed', 'archived', 'paused'
  progress: 'number',          // 0-100
  category: 'string',          // 'career', 'health', 'relationships', 'personal', 'financial'
  milestones: 'json',          // Array of milestone objects
  createdAt: 'datetime',
  updatedAt: 'datetime'
});

// Habits Tracking
export const Habit = base44.entity('Habit', {
  userId: 'string',
  name: 'string',
  description: 'string',
  frequency: 'string',         // 'daily', 'weekly', 'custom'
  customFrequency: 'json',     // { days: ['monday', 'wednesday'], timesPerWeek: 3 }
  streak: 'number',            // Current streak count
  longestStreak: 'number',     // Best streak achieved
  lastCheckedAt: 'datetime',
  completionHistory: 'json',   // Array of completion dates
  reminderTime: 'string',      // '09:00', '14:30', etc.
  reminderEnabled: 'boolean',
  status: 'string',            // 'active', 'paused', 'archived'
  createdAt: 'datetime',
  updatedAt: 'datetime'
});

// Coach Personalities
export const CoachCharacter = base44.entity('CoachCharacter', {
  name: 'string',
  personality: 'string',       // 'balanced', 'challenging', 'nurturing', 'analytical', 'motivational'
  description: 'string',
  systemPrompt: 'string',      // Full system prompt for LLM
  voiceId: 'string',           // OpenAI voice ID (alloy, echo, fable, onyx, nova, shimmer)
  avatar: 'string',            // URL or emoji
  isDefault: 'boolean',
  isActive: 'boolean',
  createdAt: 'datetime'
});

// AI Coaching Sessions (Realtime API)
export const RealtimeSession = base44.entity('RealtimeSession', {
  userId: 'string',
  coachId: 'string',           // CoachCharacter ID
  sessionType: 'string',       // 'voice', 'text', 'hybrid'
  transcript: 'json',          // Array of message objects
  summary: 'string',           // AI-generated summary
  duration: 'number',          // Duration in seconds
  audioUrl: 'string',          // URL to stored audio recording (if any)
  goals: 'json',               // Array of goal IDs discussed
  habits: 'json',              // Array of habit IDs discussed
  sentiment: 'string',         // 'positive', 'neutral', 'challenging'
  actionItems: 'json',         // Array of action items extracted
  createdAt: 'datetime'
});

// Text Chat Messages (fallback)
export const ChatMessage = base44.entity('ChatMessage', {
  userId: 'string',
  sessionId: 'string',         // Optional: group messages into sessions
  coachId: 'string',
  role: 'string',              // 'user', 'assistant', 'system'
  content: 'string',
  metadata: 'json',            // { model, tokens, etc. }
  createdAt: 'datetime'
});

// Subscription & Payments
export const Subscription = base44.entity('Subscription', {
  userId: 'string',
  stripeCustomerId: 'string',
  stripeSubscriptionId: 'string',
  status: 'string',            // 'trialing', 'active', 'past_due', 'canceled', 'unpaid'
  tier: 'string',              // 'basic', 'moderate', 'advanced'
  currentPeriodStart: 'datetime',
  currentPeriodEnd: 'datetime',
  cancelAtPeriodEnd: 'boolean',
  canceledAt: 'datetime',
  trialEnd: 'datetime',
  priceId: 'string',           // Stripe price ID
  amount: 'number',            // Amount in cents
  currency: 'string',
  createdAt: 'datetime',
  updatedAt: 'datetime'
});

// Focus Timer Sessions (migrate from local state)
export const TimerSession = base44.entity('TimerSession', {
  userId: 'string',
  mode: 'string',              // 'timer', 'stopwatch', 'alarm'
  technique: 'string',         // 'pomodoro', '52-17', '90-20', 'custom'
  duration: 'number',          // Duration in seconds
  workDuration: 'number',      // Work interval (for interval mode)
  breakDuration: 'number',     // Break interval (for interval mode)
  intervals: 'number',         // Number of intervals completed
  sound: 'string',             // Ambient sound used
  notes: 'string',             // User notes
  completed: 'boolean',
  startedAt: 'datetime',
  completedAt: 'datetime',
  createdAt: 'datetime'
});

// Notifications
export const Notification = base44.entity('Notification', {
  userId: 'string',
  type: 'string',              // 'session_summary', 'trial_expiring', 'habit_reminder', 'goal_milestone'
  title: 'string',
  message: 'string',
  link: 'string',              // Deep link to relevant page
  read: 'boolean',
  actionRequired: 'boolean',
  metadata: 'json',
  createdAt: 'datetime',
  readAt: 'datetime'
});

// Email Log (for tracking sent emails)
export const EmailLog = base44.entity('EmailLog', {
  userId: 'string',
  emailType: 'string',         // 'session_summary', 'welcome', 'trial_expiring', 'payment_failed'
  recipient: 'string',
  subject: 'string',
  sentAt: 'datetime',
  status: 'string',            // 'sent', 'failed', 'bounced'
  externalId: 'string',        // Email service provider ID
  metadata: 'json'
});