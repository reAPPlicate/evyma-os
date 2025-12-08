import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Target, Flame, Clock, MessageSquare, Calendar, TrendingUp, Award } from 'lucide-react';
import { useTheme } from '@/components/theme/ThemeContext';
import GlassCard from '@/components/theme/GlassCard';
import { format, startOfWeek, addDays, isToday, isSameDay } from 'date-fns';

export default function Dashboard() {
  const navigate = useNavigate();
  const { isDarkMode, theme } = useTheme();
  const accentColor = theme.accent;

  // Fetch data
  const { data: goals = [] } = useQuery({
    queryKey: ['goals'],
    queryFn: () => base44.entities.Goal.list('-updated_date', 100),
  });

  const { data: habits = [] } = useQuery({
    queryKey: ['habits'],
    queryFn: () => base44.entities.Habit.list('-updated_date', 100),
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ['recent-sessions'],
    queryFn: () => base44.entities.RealtimeSession.list('-created_date', 10),
  });

  const { data: activities = [] } = useQuery({
    queryKey: ['activities-week'],
    queryFn: () => base44.entities.Activity.list('-created_date', 50),
  });

  // Calculate stats
  const activeGoals = goals.filter(g => g.status === 'active').length;
  const totalSessions = sessions.length;
  const currentStreaks = habits.filter(h => h.is_active).reduce((sum, h) => sum + (h.streak || 0), 0);
  const totalCoachingTime = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
  const totalMinutes = Math.floor(totalCoachingTime / 60);

  // Weekly calendar data
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getActivitiesForDay = (date) => {
    return activities.filter(a => {
      const activityDate = new Date(a.created_date);
      return isSameDay(activityDate, date);
    });
  };

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <GlassCard className="p-4">
      <div className="flex items-center gap-3">
        <div 
          className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
        <div>
          <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>{value}</p>
          <p className={`text-xs ${isDarkMode ? 'text-white/60' : 'text-zinc-500'}`}>{label}</p>
        </div>
      </div>
    </GlassCard>
  );

  return (
    <div className="min-h-screen p-6 pb-32">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div 
            className="w-16 h-16 rounded-3xl flex items-center justify-center"
            style={{ backgroundColor: `${accentColor}20` }}
          >
            <TrendingUp className="w-8 h-8" style={{ color: accentColor }} />
          </div>
          <div>
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
              Dashboard
            </h1>
            <p className={`text-sm ${isDarkMode ? 'text-white/60' : 'text-zinc-500'}`}>
              Your progress at a glance
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={MessageSquare} label="Sessions" value={totalSessions} color={accentColor} />
          <StatCard icon={Target} label="Active Goals" value={activeGoals} color="#22c55e" />
          <StatCard icon={Flame} label="Total Streaks" value={currentStreaks} color="#f97316" />
          <StatCard icon={Clock} label="Coaching Time" value={`${totalMinutes}m`} color="#8b5cf6" />
        </div>

        {/* Weekly Calendar */}
        <GlassCard className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5" style={{ color: accentColor }} />
            <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
              This Week
            </h2>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day, idx) => {
              const dayActivities = getActivitiesForDay(day);
              const hasActivity = dayActivities.length > 0;
              const isCurrentDay = isToday(day);

              return (
                <div
                  key={idx}
                  className={`
                    aspect-square rounded-xl p-2 flex flex-col items-center justify-center
                    transition-all cursor-pointer
                    ${isCurrentDay ? 'ring-2' : ''}
                    ${hasActivity ? '' : isDarkMode ? 'bg-white/5' : 'bg-zinc-100'}
                  `}
                  style={{
                    backgroundColor: hasActivity ? `${accentColor}20` : undefined,
                    borderColor: isCurrentDay ? accentColor : 'transparent'
                  }}
                >
                  <span className={`text-[10px] font-medium ${isDarkMode ? 'text-white/60' : 'text-zinc-500'}`}>
                    {format(day, 'EEE')}
                  </span>
                  <span className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
                    {format(day, 'd')}
                  </span>
                  {hasActivity && (
                    <div 
                      className="w-1.5 h-1.5 rounded-full mt-1"
                      style={{ backgroundColor: accentColor }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* Recent Sessions */}
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" style={{ color: accentColor }} />
              <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
                Recent Sessions
              </h2>
            </div>
          </div>

          {sessions.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className={`w-12 h-12 mx-auto mb-3 ${isDarkMode ? 'text-white/20' : 'text-zinc-300'}`} />
              <p className={`text-sm ${isDarkMode ? 'text-white/40' : 'text-zinc-400'}`}>
                No sessions yet. Start a conversation to see your history here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={`
                    p-4 rounded-xl transition-all cursor-pointer
                    ${isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-zinc-50 hover:bg-zinc-100'}
                  `}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4" style={{ color: accentColor }} />
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
                          {Math.floor((session.duration || 0) / 60)}m {(session.duration || 0) % 60}s
                        </span>
                      </div>
                      {session.summary && (
                        <p className={`text-sm ${isDarkMode ? 'text-white/70' : 'text-zinc-600'}`}>
                          {session.summary.slice(0, 100)}...
                        </p>
                      )}
                    </div>
                    <span className={`text-xs ${isDarkMode ? 'text-white/40' : 'text-zinc-400'}`}>
                      {format(new Date(session.created_date), 'MMM d')}
                    </span>
                  </div>
                  {session.insights && session.insights.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {session.insights.slice(0, 3).map((insight, i) => (
                        <span
                          key={i}
                          className={`text-xs px-2 py-1 rounded-lg ${
                            isDarkMode ? 'bg-white/10 text-white/70' : 'bg-zinc-200 text-zinc-700'
                          }`}
                        >
                          {insight.slice(0, 20)}...
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        {/* Streak Badge */}
        {currentStreaks > 0 && (
          <GlassCard className="p-5">
            <div className="flex items-center justify-center gap-3">
              <Award className="w-8 h-8" style={{ color: accentColor }} />
              <div className="text-center">
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
                  {currentStreaks} Day Streak
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-white/60' : 'text-zinc-500'}`}>
                  Keep it up! You're building amazing habits.
                </p>
              </div>
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
}