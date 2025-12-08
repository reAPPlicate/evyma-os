import { create } from 'zustand';
import { Goal } from '../api/entities';
import { useAuthStore } from './authStore';

/**
 * Goals Store
 * Manages user goals with CRUD operations
 */
export const useGoalsStore = create((set, get) => ({
  // State
  goals: [],
  isLoading: false,
  error: null,
  filter: 'active', // 'active', 'completed', 'archived', 'all'

  // Actions
  fetchGoals: async () => {
    set({ isLoading: true, error: null });
    try {
      const user = useAuthStore.getState().user;
      if (!user) throw new Error('User not authenticated');

      const goals = await Goal.query()
        .where('userId', user.id)
        .orderBy('createdAt', 'desc')
        .execute();

      set({ goals, isLoading: false });
      return goals;
    } catch (error) {
      console.error('Fetch goals error:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  createGoal: async (goalData) => {
    set({ isLoading: true, error: null });
    try {
      const user = useAuthStore.getState().user;
      if (!user) throw new Error('User not authenticated');

      const newGoal = await Goal.create({
        userId: user.id,
        status: 'active',
        progress: 0,
        milestones: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...goalData
      });

      set((state) => ({
        goals: [newGoal, ...state.goals],
        isLoading: false
      }));

      return newGoal;
    } catch (error) {
      console.error('Create goal error:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  updateGoal: async (goalId, updates) => {
    set({ isLoading: true, error: null });
    try {
      const updatedGoal = await Goal.update(goalId, {
        ...updates,
        updatedAt: new Date().toISOString()
      });

      set((state) => ({
        goals: state.goals.map((goal) =>
          goal.id === goalId ? updatedGoal : goal
        ),
        isLoading: false
      }));

      return updatedGoal;
    } catch (error) {
      console.error('Update goal error:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  deleteGoal: async (goalId) => {
    set({ isLoading: true, error: null });
    try {
      await Goal.delete(goalId);

      set((state) => ({
        goals: state.goals.filter((goal) => goal.id !== goalId),
        isLoading: false
      }));
    } catch (error) {
      console.error('Delete goal error:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  updateProgress: async (goalId, progress) => {
    const { updateGoal } = get();
    return updateGoal(goalId, { progress });
  },

  completeGoal: async (goalId) => {
    const { updateGoal } = get();
    return updateGoal(goalId, { status: 'completed', progress: 100 });
  },

  archiveGoal: async (goalId) => {
    const { updateGoal } = get();
    return updateGoal(goalId, { status: 'archived' });
  },

  setFilter: (filter) => set({ filter }),

  getFilteredGoals: () => {
    const { goals, filter } = get();
    if (filter === 'all') return goals;
    return goals.filter((goal) => goal.status === filter);
  },

  getActiveGoals: () => {
    const { goals } = get();
    return goals.filter((goal) => goal.status === 'active');
  },

  getCompletedGoals: () => {
    const { goals } = get();
    return goals.filter((goal) => goal.status === 'completed');
  },

  clearError: () => set({ error: null })
}));
