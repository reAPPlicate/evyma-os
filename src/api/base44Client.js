import { createClient } from '@base44/sdk';

// Create a client with authentication required
export const base44 = createClient({
  appId: "6928d0ca672d396f2390d3a7",
  requiresAuth: true // Ensure authentication is required for all operations
});
