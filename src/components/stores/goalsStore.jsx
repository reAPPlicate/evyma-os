import { create } from 'zustand';
import { base44 } from '@/api/base44Client';
import toast from 'react-hot-toast';

/**
 * Goals Store
 * Manages user goals with CRUD operations using Base44
 */
export const useGoalsStore = create((set, get) => ({
  goals: [],
  isLoading: false,
  error: null,
  filter: 'active',

  fetchGoals: async () => {
    set({ isLoading: true, error: null });
    try {
      const user = await base44.auth.me();
      if (!user) throw new Error('User not authenticated');

      const goals = await base44.entities.Goal.filter(
        { created_by: user.email },
        '-created_date',
        100
      );

      set({ goals, isLoading: false });
      return goals;
    } catch (error) {
      console.error('Fetch goals error:', error);
      set({ error: error.message, isLoading: false });
      toast.error('Failed to load goals');
      throw error;
    }
  },

  createGoal: async (goalData) => {
    set({ isLoading: true, error: null });
    try {
      const newGoal = await base44.entities.Goal.create({
        status: 'active',
        progress: 0,
        ...goalData
      });

      set((state) => ({
        goals: [newGoal, ...state.goals],
        isLoading: false
      }));

      toast.success('Goal created successfully');
      return newGoal;
    } catch (error) {
      console.error('Create goal error:', error);
      set({ error: error.message, isLoading: false });
      toast.error('Failed to create goal');
      throw error;
    }
  },

  updateGoal: async (goalId, updates) => {
    set({ isLoading: true, error: null });
    try {
      const updatedGoal = await base44.entities.Goal.update(goalId, updates);

      set((state) => ({
        goals: state.goals.map((goal) =>
          goal.id === goalId ? updatedGoal : goal
        ),
        isLoading: false
      }));

      toast.success('Goal updated');
      return updatedGoal;
    } catch (error) {
      console.error('Update goal error:', error);
      set({ error: error.message, isLoading: false });
      toast.error('Failed to update goal');
      throw error;
    }
  },

  deleteGoal: async (goalId) => {
    set({ isLoading: true, error: null });
    try {
      await base44.entities.Goal.delete(goalId);

      set((state) => ({
        goals: state.goals.filter((goal) => goal.id !== goalId),
        isLoading: false
      }));

      toast.success('Goal deleted');
    } catch (error) {
      console.error('Delete goal error:', error);
      set({ error: error.message, isLoading: false });
      toast.error('Failed to delete goal');
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
    return updateGoal(goalId, { status: 'abandoned' });
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