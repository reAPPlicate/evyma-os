import { createClient } from '@base44/sdk';

// Create a client with authentication required
export const base44 = createClient({
  appId: import.meta.env.VITE_BASE44_APP_ID || "6928d0ca672d396f2390d3a7",
  requiresAuth: true // Ensure authentication is required for all operations
});

// Export config helper
export const config = {
  base44AppId: import.meta.env.VITE_BASE44_APP_ID,
  openaiApiKey: import.meta.env.VITE_OPENAI_API_KEY,
  stripePublishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
  stripeSecretKey: import.meta.env.VITE_STRIPE_SECRET_KEY,
  stripeWebhookSecret: import.meta.env.VITE_STRIPE_WEBHOOK_SECRET,
  stripePrices: {
    basic: import.meta.env.VITE_STRIPE_PRICE_BASIC,
    moderate: import.meta.env.VITE_STRIPE_PRICE_MODERATE,
    advanced: import.meta.env.VITE_STRIPE_PRICE_ADVANCED
  },
  appUrl: import.meta.env.VITE_APP_URL || 'http://localhost:5173',
  apiUrl: import.meta.env.VITE_API_URL || 'https://api.base44.com',
  trialDurationHours: parseInt(import.meta.env.VITE_TRIAL_DURATION_HOURS || '24'),
  features: {
    voiceAI: import.meta.env.VITE_ENABLE_VOICE_AI === 'true',
    smsReminders: import.meta.env.VITE_ENABLE_SMS_REMINDERS === 'true',
    multipleTiers: import.meta.env.VITE_ENABLE_MULTIPLE_TIERS === 'false'
  }
};
