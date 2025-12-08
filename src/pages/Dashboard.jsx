import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoalsStore } from '@/stores/goalsStore';
import { useHabitsStore } from '@/stores/habitsStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Target,
  Flame,
  MessageCircle,
  Plus,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Clock,
  Award
} from 'lucide-react';
import { formatDate, getRelativeTime } from '@/utils';
import { CardSkeleton } from '@/components/LoadingSpinner';

export default function Dashboard() {
  const navigate = useNavigate();
  const { goals, fetchGoals, getActiveGoals, getCompletedGoals, isLoading: goalsLoading } = useGoalsStore();
  const { habits, fetchHabits, getTodayHabits, getTopStreaks, isLoading: habitsLoading } = useHabitsStore();

  const [weekData, setWeekData] = useState([]);

  useEffect(() => {
    fetchGoals();
    fetchHabits();
  }, [fetchGoals, fetchHabits]);

  // Generate week data for calendar
  useEffect(() => {
    const generateWeekData = () => {
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const isToday = i === 0;

        // Count check-ins for this day
        const checkIns = habits.filter(h =>
          h.completionHistory?.includes(dateStr)
        ).length;

        days.push({
          date: dateStr,
          dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
          dayNum: date.getDate(),
          checkIns,
          isToday
        });
      }
      return days;
    };

    if (habits.length > 0) {
      setWeekData(generateWeekData());
    }
  }, [habits]);

  const activeGoals = getActiveGoals();
  const completedGoals = getCompletedGoals();
  const todayHabits = getTodayHabits();
  const topStreaks = getTopStreaks(3);

  const totalCheckinsToday = todayHabits.filter(h => h.checkedToday).length;
  const longestStreak = Math.max(...habits.map(h => h.streak || 0), 0);
  const avgGoalProgress = activeGoals.length > 0
    ? Math.round(activeGoals.reduce((acc, g) => acc + (g.progress || 0), 0) / activeGoals.length)
    : 0;

  const isLoading = goalsLoading || habitsLoading;

  return (
    <div className="min-h-screen w-full p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">Dashboard</h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-2">
            Your progress at a glance
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="backdrop-blur-xl bg-white/80 dark:bg-zinc-900/80 border-white/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Active Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{activeGoals.length}</div>
              <p className="text-xs text-zinc-500 mt-1">
                {completedGoals.length} completed
              </p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-xl bg-white/80 dark:bg-zinc-900/80 border-white/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                <Flame className="w-4 h-4" />
                Longest Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">
                {longestStreak}
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                {longestStreak === 1 ? 'day' : 'days'} in a row
              </p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-xl bg-white/80 dark:bg-zinc-900/80 border-white/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Today's Check-ins
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {totalCheckinsToday}/{todayHabits.length}
              </div>
              {todayHabits.length > 0 && (
                <Progress value={(totalCheckinsToday / todayHabits.length) * 100} className="h-1 mt-2" />
              )}
            </CardContent>
          </Card>

          <Card className="backdrop-blur-xl bg-white/80 dark:bg-zinc-900/80 border-white/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Avg Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{avgGoalProgress}%</div>
              <p className="text-xs text-zinc-500 mt-1">
                across all goals
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Active Goals */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Goals */}
            <Card className="backdrop-blur-xl bg-white/80 dark:bg-zinc-900/80 border-white/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-blue-500" />
                      Active Goals
                    </CardTitle>
                    <CardDescription>Your current focus areas</CardDescription>
                  </div>
                  <Button onClick={() => navigate('/goals')} variant="outline" size="sm">
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => <CardSkeleton key={i} />)}
                  </div>
                ) : activeGoals.length === 0 ? (
                  <div className="text-center py-8">
                    <Target className="w-12 h-12 text-zinc-400 mx-auto mb-3" />
                    <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                      No active goals yet
                    </p>
                    <Button onClick={() => navigate('/goals')} className="gap-2">
                      <Plus className="w-4 h-4" />
                      Create Goal
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeGoals.slice(0, 5).map(goal => (
                      <div key={goal.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium">{goal.title}</h4>
                            {goal.targetDate && (
                              <p className="text-xs text-zinc-500 flex items-center gap-1 mt-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(goal.targetDate)}
                              </p>
                            )}
                          </div>
                          <Badge variant="outline">{goal.progress || 0}%</Badge>
                        </div>
                        <Progress value={goal.progress || 0} className="h-2" />
                      </div>
                    ))}
                    {activeGoals.length > 5 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full"
                        onClick={() => navigate('/goals')}
                      >
                        View {activeGoals.length - 5} more goals
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Weekly Calendar */}
            <Card className="backdrop-blur-xl bg-white/80 dark:bg-zinc-900/80 border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-500" />
                  This Week
                </CardTitle>
                <CardDescription>Your check-in activity</CardDescription>
              </CardHeader>
              <CardContent>
                {habits.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-zinc-400 mx-auto mb-3" />
                    <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                      Create habits to track your weekly progress
                    </p>
                    <Button onClick={() => navigate('/habits')} className="gap-2">
                      <Plus className="w-4 h-4" />
                      Create Habit
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-7 gap-2">
                    {weekData.map(day => (
                      <div key={day.date} className="text-center">
                        <div className="text-xs text-zinc-500 mb-1">{day.dayName}</div>
                        <div
                          className={`
                            aspect-square rounded-lg flex flex-col items-center justify-center
                            ${day.isToday
                              ? 'bg-blue-500 text-white ring-2 ring-blue-500 ring-offset-2'
                              : day.checkIns > 0
                              ? 'bg-green-500 text-white'
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
                            }
                          `}
                        >
                          <div className="text-lg font-semibold">{day.dayNum}</div>
                          {day.checkIns > 0 && (
                            <div className="text-xs">✓{day.checkIns}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Quick Actions & Streaks */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="backdrop-blur-xl bg-white/80 dark:bg-zinc-900/80 border-white/20">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  className="w-full justify-start gap-2"
                  variant="outline"
                  onClick={() => navigate('/chat')}
                >
                  <MessageCircle className="w-4 h-4" />
                  Start Coaching Session
                </Button>
                <Button
                  className="w-full justify-start gap-2"
                  variant="outline"
                  onClick={() => navigate('/goals')}
                >
                  <Plus className="w-4 h-4" />
                  Create New Goal
                </Button>
                <Button
                  className="w-full justify-start gap-2"
                  variant="outline"
                  onClick={() => navigate('/habits')}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Check In on Habits
                </Button>
              </CardContent>
            </Card>

            {/* Top Streaks */}
            {topStreaks.length > 0 && topStreaks.some(h => h.streak > 0) && (
              <Card className="backdrop-blur-xl bg-white/80 dark:bg-zinc-900/80 border-white/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Award className="w-5 h-5 text-yellow-500" />
                      Top Streaks
                    </CardTitle>
                    <Button onClick={() => navigate('/habits')} variant="ghost" size="sm">
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {topStreaks.filter(h => h.streak > 0).map((habit, index) => (
                    <div key={habit.id} className="flex items-center gap-3">
                      <div className="text-2xl font-bold text-zinc-400">#{index + 1}</div>
                      <div className="flex-1">
                        <div className="font-medium">{habit.name}</div>
                        <div className="flex items-center gap-1 text-orange-600 text-sm">
                          <Flame className="w-3 h-3" />
                          <span className="font-semibold">{habit.streak}</span>
                          <span className="text-xs text-zinc-500">days</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Motivational Card */}
            <Card className="backdrop-blur-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Clock className="w-8 h-8 text-blue-500 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Keep Going!</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {totalCheckinsToday === todayHabits.length && todayHabits.length > 0
                      ? "🎉 You've completed all your habits today!"
                      : activeGoals.length === 0
                      ? "Set your first goal to start tracking progress"
                      : `You're making progress on ${activeGoals.length} ${activeGoals.length === 1 ? 'goal' : 'goals'}`}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
