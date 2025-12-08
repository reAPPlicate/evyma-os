import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserProfile } from '../api/entities';

/**
 * Authentication Store
 * Manages user session, profile, and trial status
 */
export const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      profile: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,

      // Actions
      setUser: (user) => set({ user, isAuthenticated: !!user }),

      setProfile: (profile) => set({ profile }),

      login: async () => {
        set({ isLoading: true, error: null });
        try {
          const user = await User.getCurrentUser();

          if (user) {
            // Fetch or create user profile
            const profiles = await UserProfile.query()
              .where('userId', user.id)
              .limit(1)
              .execute();

            let profile = profiles[0];

            if (!profile) {
              // Create profile for new user
              profile = await UserProfile.create({
                userId: user.id,
                onboardingComplete: false,
                trialStartedAt: new Date().toISOString(),
                trialEndsAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                subscriptionTier: 'free',
                preferences: {},
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              });
            }

            set({ user, profile, isAuthenticated: true, isLoading: false });
            return { user, profile };
          } else {
            set({ user: null, profile: null, isAuthenticated: false, isLoading: false });
            return null;
          }
        } catch (error) {
          console.error('Login error:', error);
          set({ error: error.message, isLoading: false });
          return null;
        }
      },

      logout: async () => {
        try {
          await User.signOut();
          set({ user: null, profile: null, isAuthenticated: false });
        } catch (error) {
          console.error('Logout error:', error);
          set({ error: error.message });
        }
      },

      updateProfile: async (updates) => {
        const { profile } = get();
        if (!profile) return;

        try {
          const updated = await UserProfile.update(profile.id, {
            ...updates,
            updatedAt: new Date().toISOString()
          });
          set({ profile: updated });
          return updated;
        } catch (error) {
          console.error('Update profile error:', error);
          set({ error: error.message });
          throw error;
        }
      },

      completeOnboarding: async (coachPreference) => {
        const { profile } = get();
        if (!profile) return;

        try {
          const updated = await UserProfile.update(profile.id, {
            onboardingComplete: true,
            coachPreference,
            updatedAt: new Date().toISOString()
          });
          set({ profile: updated });
          return updated;
        } catch (error) {
          console.error('Complete onboarding error:', error);
          set({ error: error.message });
          throw error;
        }
      },

      isTrialActive: () => {
        const { profile } = get();
        if (!profile || !profile.trialEndsAt) return false;
        return new Date(profile.trialEndsAt) > new Date();
      },

      hasActiveSubscription: () => {
        const { profile } = get();
        if (!profile) return false;
        return profile.subscriptionTier && profile.subscriptionTier !== 'free';
      },

      canAccessPremium: () => {
        const { isTrialActive, hasActiveSubscription } = get();
        return isTrialActive() || hasActiveSubscription();
      },

      clearError: () => set({ error: null })
    }),
    {
      name: 'evyma-auth-storage',
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);
