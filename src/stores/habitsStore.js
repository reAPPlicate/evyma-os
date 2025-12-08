import { create } from 'zustand';
import { Habit } from '../api/entities';
import { useAuthStore } from './authStore';

/**
 * Habits Store
 * Manages habit tracking with streaks and check-ins
 */
export const useHabitsStore = create((set, get) => ({
  // State
  habits: [],
  isLoading: false,
  error: null,

  // Actions
  fetchHabits: async () => {
    set({ isLoading: true, error: null });
    try {
      const user = useAuthStore.getState().user;
      if (!user) throw new Error('User not authenticated');

      const habits = await Habit.query()
        .where('userId', user.id)
        .where('status', 'active')
        .orderBy('createdAt', 'desc')
        .execute();

      set({ habits, isLoading: false });
      return habits;
    } catch (error) {
      console.error('Fetch habits error:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  createHabit: async (habitData) => {
    set({ isLoading: true, error: null });
    try {
      const user = useAuthStore.getState().user;
      if (!user) throw new Error('User not authenticated');

      const newHabit = await Habit.create({
        userId: user.id,
        frequency: 'daily',
        streak: 0,
        longestStreak: 0,
        completionHistory: [],
        reminderEnabled: false,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...habitData
      });

      set((state) => ({
        habits: [newHabit, ...state.habits],
        isLoading: false
      }));

      return newHabit;
    } catch (error) {
      console.error('Create habit error:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  updateHabit: async (habitId, updates) => {
    set({ isLoading: true, error: null });
    try {
      const updatedHabit = await Habit.update(habitId, {
        ...updates,
        updatedAt: new Date().toISOString()
      });

      set((state) => ({
        habits: state.habits.map((habit) =>
          habit.id === habitId ? updatedHabit : habit
        ),
        isLoading: false
      }));

      return updatedHabit;
    } catch (error) {
      console.error('Update habit error:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  deleteHabit: async (habitId) => {
    set({ isLoading: true, error: null });
    try {
      await Habit.delete(habitId);

      set((state) => ({
        habits: state.habits.filter((habit) => habit.id !== habitId),
        isLoading: false
      }));
    } catch (error) {
      console.error('Delete habit error:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  checkIn: async (habitId) => {
    try {
      const { habits } = get();
      const habit = habits.find((h) => h.id === habitId);
      if (!habit) throw new Error('Habit not found');

      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const lastChecked = habit.lastCheckedAt ? new Date(habit.lastCheckedAt) : null;
      const lastCheckedDate = lastChecked ? lastChecked.toISOString().split('T')[0] : null;

      // Check if already checked in today
      if (lastCheckedDate === today) {
        throw new Error('Already checked in today');
      }

      // Calculate new streak
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayDate = yesterday.toISOString().split('T')[0];

      const isConsecutive = lastCheckedDate === yesterdayDate;
      const newStreak = isConsecutive ? habit.streak + 1 : 1;
      const newLongestStreak = Math.max(newStreak, habit.longestStreak);

      // Update completion history
      const completionHistory = [...(habit.completionHistory || []), today];

      const updatedHabit = await Habit.update(habitId, {
        lastCheckedAt: now.toISOString(),
        streak: newStreak,
        longestStreak: newLongestStreak,
        completionHistory,
        updatedAt: now.toISOString()
      });

      set((state) => ({
        habits: state.habits.map((h) =>
          h.id === habitId ? updatedHabit : h
        )
      }));

      return updatedHabit;
    } catch (error) {
      console.error('Check-in error:', error);
      set({ error: error.message });
      throw error;
    }
  },

  getHabitsByFrequency: (frequency) => {
    const { habits } = get();
    return habits.filter((habit) => habit.frequency === frequency);
  },

  getTodayHabits: () => {
    const { habits } = get();
    const today = new Date().toISOString().split('T')[0];

    return habits.map((habit) => ({
      ...habit,
      checkedToday: habit.lastCheckedAt &&
        new Date(habit.lastCheckedAt).toISOString().split('T')[0] === today
    }));
  },

  getTopStreaks: (limit = 5) => {
    const { habits } = get();
    return [...habits]
      .sort((a, b) => b.streak - a.streak)
      .slice(0, limit);
  },

  archiveHabit: async (habitId) => {
    const { updateHabit } = get();
    return updateHabit(habitId, { status: 'archived' });
  },

  clearError: () => set({ error: null })
}));
