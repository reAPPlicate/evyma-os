import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTheme } from '@/components/theme/ThemeContext';
import { 
  CheckCircle2, Circle, Clock, Target, Flame, Star, 
  Lightbulb, TrendingUp, Sparkles, ChevronRight, Plus,
  Calendar, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, isToday, isTomorrow, isPast } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const Activity = base44.entities.Activity;
const Todo = base44.entities.Todo;

export default function DynamicFeed({ accentColor = '#3B82F6' }) {
  const { isDarkMode } = useTheme();
  const queryClient = useQueryClient();

  // Fetch todos
  const { data: todos = [], isLoading: todosLoading } = useQuery({
    queryKey: ['todos'],
    queryFn: () => Todo.filter({ status: { $ne: 'completed' } }, '-priority,due_date', 10),
  });

  // Fetch recent activities
  const { data: activities = [], isLoading: activitiesLoading } = useQuery({
    queryKey: ['activities'],
    queryFn: () => Activity.list('-created_date', 5),
  });

  // Toggle todo completion
  const toggleTodo = useMutation({
    mutationFn: async (todo) => {
      const newStatus = todo.status === 'completed' ? 'pending' : 'completed';
      await Todo.update(todo.id, { 
        status: newStatus,
        completed_at: newStatus === 'completed' ? new Date().toISOString() : null
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    }
  });



  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '59, 130, 246';
  };
  const accentRgb = hexToRgb(accentColor);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-yellow-400';
      default: return 'text-white/40';
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'goal_progress': return Target;
      case 'habit_completed': return Flame;
      case 'milestone': return Star;
      case 'achievement': return TrendingUp;
      default: return CheckCircle2;
    }
  };

  const formatDueDate = (date) => {
    if (!date) return null;
    const d = new Date(date);
    if (isToday(d)) return 'Today';
    if (isTomorrow(d)) return 'Tomorrow';
    if (isPast(d)) return 'Overdue';
    return format(d, 'MMM d');
  };

  const isLoading = todosLoading || activitiesLoading;

  return (
    <div className="space-y-6 pb-8">
      {/* Transmission Items Section */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className={`text-sm font-semibold uppercase tracking-wider ${isDarkMode ? 'text-white/50' : 'text-zinc-500'}`}>
            Transmission Items
          </h3>
          <span className="text-xs text-white/40">{todos.length} pending</span>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : todos.length === 0 ? (
          <div 
            className="rounded-xl p-6 text-center"
            style={{ 
              backgroundColor: isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
              border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`
            }}
          >
            <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-white/20" />
            <p className="text-sm text-white/40">All caught up!</p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {todos.map((todo, index) => {
                const dueLabel = formatDueDate(todo.due_date);
                const isOverdue = dueLabel === 'Overdue';
                
                return (
                  <motion.div
                    key={todo.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className="group rounded-xl p-3 flex items-center gap-3 cursor-pointer transition-all"
                    style={{
                      backgroundColor: isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                      border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`
                    }}
                    onClick={() => toggleTodo.mutate(todo)}
                  >
                    <button
                      className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        todo.status === 'completed' 
                          ? 'border-green-500 bg-green-500' 
                          : 'border-white/30 hover:border-white/50'
                      }`}
                    >
                      {todo.status === 'completed' && (
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      )}
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${
                        todo.status === 'completed' ? 'text-white/40 line-through' : 'text-white/90'
                      }`}>
                        {todo.title}
                      </p>
                      {todo.description && (
                        <p className="text-xs text-white/40 truncate mt-0.5">{todo.description}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {dueLabel && (
                        <span className={`text-xs flex items-center gap-1 ${
                          isOverdue ? 'text-red-400' : 'text-white/40'
                        }`}>
                          {isOverdue && <AlertCircle className="w-3 h-3" />}
                          {dueLabel}
                        </span>
                      )}
                      <div className={`w-2 h-2 rounded-full ${getPriorityColor(todo.priority)}`} 
                        style={{ backgroundColor: 'currentColor' }} 
                      />
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </section>

      {/* Recent Activity Section */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className={`text-sm font-semibold uppercase tracking-wider ${isDarkMode ? 'text-white/50' : 'text-zinc-500'}`}>
            Recent Activity
          </h3>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2].map(i => (
              <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div 
            className="rounded-xl p-6 text-center"
            style={{ 
              backgroundColor: isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
              border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`
            }}
          >
            <Clock className="w-10 h-10 mx-auto mb-2 text-white/20" />
            <p className="text-sm text-white/40">No recent activity</p>
          </div>
        ) : (
          <div className="space-y-2">
            {activities.map((activity, index) => {
              const IconComponent = getActivityIcon(activity.type);
              
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="rounded-xl p-3 flex items-center gap-3"
                  style={{
                    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                    border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`
                  }}
                >
                  <div 
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: `rgba(${accentRgb}, 0.15)` }}
                  >
                    <IconComponent className="w-4 h-4" style={{ color: accentColor }} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white/90 truncate">{activity.title}</p>
                    {activity.description && (
                      <p className="text-xs text-white/40 truncate">{activity.description}</p>
                    )}
                  </div>

                  <span className="text-xs text-white/30 flex-shrink-0">
                    {format(new Date(activity.created_date), 'h:mm a')}
                  </span>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}