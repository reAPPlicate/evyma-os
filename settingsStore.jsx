import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Settings Store
 * Manages app settings and UI preferences with local persistence
 */
export const useSettingsStore = create(
  persist(
    (set) => ({
      theme: 'blue',
      isDarkMode: true,
      gridColumns: 4,
      showApps: true,
      notifications: {
        email: true,
        sms: false,
        push: false
      },
      sounds: {
        enabled: true,
        volume: 0.5
      },

      setTheme: (theme) => set({ theme }),

      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),

      setDarkMode: (isDarkMode) => set({ isDarkMode }),

      setGridColumns: (gridColumns) => set({ gridColumns }),

      toggleShowApps: () => set((state) => ({ showApps: !state.showApps })),

      setShowApps: (showApps) => set({ showApps }),

      updateNotifications: (notifications) => set((state) => ({
        notifications: { ...state.notifications, ...notifications }
      })),

      updateSounds: (sounds) => set((state) => ({
        sounds: { ...state.sounds, ...sounds }
      })),

      reset: () => set({
        theme: 'blue',
        isDarkMode: true,
        gridColumns: 4,
        showApps: true,
        notifications: {
          email: true,
          sms: false,
          push: false
        },
        sounds: {
          enabled: true,
          volume: 0.5
        }
      })
    }),
    {
      name: 'evyma-settings-storage'
    }
  )
);