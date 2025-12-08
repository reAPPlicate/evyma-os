import { create } from 'zustand';
import { base44 } from '@/api/base44Client';
import toast from 'react-hot-toast';

/**
 * Habits Store
 * Manages habit tracking with streaks and check-ins using Base44
 */
export const useHabitsStore = create((set, get) => ({
  habits: [],
  isLoading: false,
  error: null,

  fetchHabits: async () => {
    set({ isLoading: true, error: null });
    try {
      const user = await base44.auth.me();
      if (!user) throw new Error('User not authenticated');

      const habits = await base44.entities.Habit.filter(
        { created_by: user.email, is_active: true },
        '-created_date',
        100
      );

      set({ habits, isLoading: false });
      return habits;
    } catch (error) {
      console.error('Fetch habits error:', error);
      set({ error: error.message, isLoading: false });
      toast.error('Failed to load habits');
      throw error;
    }
  },

  createHabit: async (habitData) => {
    set({ isLoading: true, error: null });
    try {
      const newHabit = await base44.entities.Habit.create({
        frequency: 'daily',
        streak: 0,
        best_streak: 0,
        is_active: true,
        ...habitData
      });

      set((state) => ({
        habits: [newHabit, ...state.habits],
        isLoading: false
      }));

      toast.success('Habit created successfully');
      return newHabit;
    } catch (error) {
      console.error('Create habit error:', error);
      set({ error: error.message, isLoading: false });
      toast.error('Failed to create habit');
      throw error;
    }
  },

  updateHabit: async (habitId, updates) => {
    set({ isLoading: true, error: null });
    try {
      const updatedHabit = await base44.entities.Habit.update(habitId, updates);

      set((state) => ({
        habits: state.habits.map((habit) =>
          habit.id === habitId ? updatedHabit : habit
        ),
        isLoading: false
      }));

      toast.success('Habit updated');
      return updatedHabit;
    } catch (error) {
      console.error('Update habit error:', error);
      set({ error: error.message, isLoading: false });
      toast.error('Failed to update habit');
      throw error;
    }
  },

  deleteHabit: async (habitId) => {
    set({ isLoading: true, error: null });
    try {
      await base44.entities.Habit.delete(habitId);

      set((state) => ({
        habits: state.habits.filter((habit) => habit.id !== habitId),
        isLoading: false
      }));

      toast.success('Habit deleted');
    } catch (error) {
      console.error('Delete habit error:', error);
      set({ error: error.message, isLoading: false });
      toast.error('Failed to delete habit');
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
      const lastChecked = habit.last_checked_at ? new Date(habit.last_checked_at) : null;
      const lastCheckedDate = lastChecked ? lastChecked.toISOString().split('T')[0] : null;

      if (lastCheckedDate === today) {
        toast.error('Already checked in today');
        throw new Error('Already checked in today');
      }

      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayDate = yesterday.toISOString().split('T')[0];

      const isConsecutive = lastCheckedDate === yesterdayDate;
      const newStreak = isConsecutive ? habit.streak + 1 : 1;
      const newBestStreak = Math.max(newStreak, habit.best_streak);

      const updatedHabit = await base44.entities.Habit.update(habitId, {
        last_checked_at: now.toISOString(),
        streak: newStreak,
        best_streak: newBestStreak
      });

      set((state) => ({
        habits: state.habits.map((h) =>
          h.id === habitId ? updatedHabit : h
        )
      }));

      toast.success(`🔥 ${newStreak} day streak!`);
      return updatedHabit;
    } catch (error) {
      console.error('Check-in error:', error);
      set({ error: error.message });
      if (error.message !== 'Already checked in today') {
        toast.error('Failed to check in');
      }
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
      checkedToday: habit.last_checked_at &&
        new Date(habit.last_checked_at).toISOString().split('T')[0] === today
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
    return updateHabit(habitId, { is_active: false });
  },

  clearError: () => set({ error: null })
}));