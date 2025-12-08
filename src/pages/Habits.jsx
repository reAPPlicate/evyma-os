import { useEffect, useState } from 'react';
import { useHabitsStore } from '@/stores/habitsStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { Plus, CheckCircle2, Circle, Flame, Trophy, Calendar, Edit, Trash2, Archive } from 'lucide-react';
import { toast } from 'sonner';
import { CardSkeleton } from '@/components/LoadingSpinner';

const FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Daily', icon: '📅' },
  { value: 'weekly', label: 'Weekly', icon: '📆' },
  { value: 'custom', label: 'Custom', icon: '⚙️' }
];

export default function Habits() {
  const { habits, fetchHabits, createHabit, updateHabit, deleteHabit, checkIn, getTodayHabits, getTopStreaks, isLoading } = useHabitsStore();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [deletingHabitId, setDeletingHabitId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    frequency: 'daily',
    reminderEnabled: false,
    reminderTime: '09:00'
  });

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      frequency: 'daily',
      reminderEnabled: false,
      reminderTime: '09:00'
    });
  };

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast.error('Please enter a habit name');
      return;
    }

    try {
      await createHabit({
        name: formData.name,
        description: formData.description,
        frequency: formData.frequency,
        reminderEnabled: formData.reminderEnabled,
        reminderTime: formData.reminderTime
      });

      toast.success('Habit created! Start your streak today! 🔥');
      setIsCreateOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to create habit');
      console.error(error);
    }
  };

  const handleEdit = async () => {
    if (!editingHabit) return;

    try {
      await updateHabit(editingHabit.id, formData);
      toast.success('Habit updated successfully!');
      setEditingHabit(null);
      resetForm();
    } catch (error) {
      toast.error('Failed to update habit');
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (!deletingHabitId) return;

    try {
      await deleteHabit(deletingHabitId);
      toast.success('Habit deleted');
      setDeletingHabitId(null);
    } catch (error) {
      toast.error('Failed to delete habit');
      console.error(error);
    }
  };

  const handleCheckIn = async (habitId) => {
    try {
      const updated = await checkIn(habitId);
      toast.success(`🔥 Streak: ${updated.streak} ${updated.streak === 1 ? 'day' : 'days'}!`, {
        description: updated.streak > updated.longestStreak - 1 ? 'New record!' : undefined
      });
    } catch (error) {
      if (error.message.includes('Already checked in')) {
        toast.info('You already checked in today!');
      } else {
        toast.error('Failed to check in');
      }
      console.error(error);
    }
  };

  const handleArchive = async (habitId) => {
    try {
      await updateHabit(habitId, { status: 'archived' });
      toast.success('Habit archived');
    } catch (error) {
      toast.error('Failed to archive habit');
    }
  };

  const openEditDialog = (habit) => {
    setEditingHabit(habit);
    setFormData({
      name: habit.name,
      description: habit.description || '',
      frequency: habit.frequency || 'daily',
      reminderEnabled: habit.reminderEnabled || false,
      reminderTime: habit.reminderTime || '09:00'
    });
  };

  const todayHabits = getTodayHabits();
  const topStreaks = getTopStreaks(5);
  const totalCheckinsToday = todayHabits.filter(h => h.checkedToday).length;
  const longestCurrentStreak = Math.max(...habits.map(h => h.streak || 0), 0);

  // Generate last 7 days for calendar view
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push({
        date: date.toISOString().split('T')[0],
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: date.getDate()
      });
    }
    return days;
  };

  const last7Days = getLast7Days();

  return (
    <div className="min-h-screen w-full p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
              <Flame className="w-8 h-8 text-orange-500" />
              Habits
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 mt-2">
              Build consistency, one day at a time
            </p>
          </div>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
                <Plus className="w-5 h-5" />
                New Habit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Habit</DialogTitle>
                <DialogDescription>
                  What habit do you want to build?
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Habit Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Morning meditation"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Why is this important to you?"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select
                    value={formData.frequency}
                    onValueChange={(value) => setFormData({ ...formData, frequency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FREQUENCY_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.icon} {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Reminder</Label>
                    <p className="text-sm text-zinc-500">Get a daily reminder</p>
                  </div>
                  <Switch
                    checked={formData.reminderEnabled}
                    onCheckedChange={(checked) => setFormData({ ...formData, reminderEnabled: checked })}
                  />
                </div>

                {formData.reminderEnabled && (
                  <div>
                    <Label htmlFor="reminderTime">Reminder Time</Label>
                    <Input
                      id="reminderTime"
                      type="time"
                      value={formData.reminderTime}
                      onChange={(e) => setFormData({ ...formData, reminderTime: e.target.value })}
                    />
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setIsCreateOpen(false);
                  resetForm();
                }}>
                  Cancel
                </Button>
                <Button onClick={handleCreate}>Create Habit</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="backdrop-blur-xl bg-white/80 dark:bg-zinc-900/80 border-white/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Check-ins Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {totalCheckinsToday} / {todayHabits.length}
              </div>
              {todayHabits.length > 0 && (
                <div className="mt-2 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all"
                    style={{ width: `${(totalCheckinsToday / todayHabits.length) * 100}%` }}
                  />
                </div>
              )}
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
                {longestCurrentStreak} {longestCurrentStreak === 1 ? 'day' : 'days'}
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-xl bg-white/80 dark:bg-zinc-900/80 border-white/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Active Habits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{habits.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Habits */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3].map(i => <CardSkeleton key={i} />)}
          </div>
        ) : habits.length === 0 ? (
          <Card className="backdrop-blur-xl bg-white/80 dark:bg-zinc-900/80 border-white/20">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Flame className="w-16 h-16 text-zinc-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No habits yet</h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-center mb-4">
                Create your first habit to start building streaks!
              </p>
              <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Create Habit
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Today's Check-ins */}
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Today's Check-ins
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {todayHabits.map(habit => (
                  <Card
                    key={habit.id}
                    className={`backdrop-blur-xl bg-white/80 dark:bg-zinc-900/80 border-2 ${
                      habit.checkedToday
                        ? 'border-green-500 bg-green-500/10'
                        : 'border-white/20'
                    }`}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg flex items-center gap-2">
                            {habit.checkedToday ? (
                              <CheckCircle2 className="w-5 h-5 text-green-500" />
                            ) : (
                              <Circle className="w-5 h-5 text-zinc-400" />
                            )}
                            {habit.name}
                          </CardTitle>
                          {habit.description && (
                            <CardDescription className="mt-2">
                              {habit.description}
                            </CardDescription>
                          )}
                        </div>

                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(habit)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeletingHabitId(habit.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Streak */}
                      {habit.streak > 0 && (
                        <div className="flex items-center gap-2 text-orange-600">
                          <Flame className="w-5 h-5" />
                          <span className="font-bold text-lg">{habit.streak}</span>
                          <span className="text-sm">
                            {habit.streak === 1 ? 'day streak' : 'days streak'}
                          </span>
                          {habit.streak === habit.longestStreak && habit.longestStreak > 1 && (
                            <Trophy className="w-4 h-4 ml-auto" />
                          )}
                        </div>
                      )}

                      {/* Last 7 Days */}
                      <div>
                        <Label className="text-xs text-zinc-500 mb-2 block">Last 7 Days</Label>
                        <div className="flex gap-1">
                          {last7Days.map(day => {
                            const isCompleted = habit.completionHistory?.includes(day.date);
                            const isToday = day.date === new Date().toISOString().split('T')[0];

                            return (
                              <div
                                key={day.date}
                                className="flex-1 flex flex-col items-center gap-1"
                              >
                                <div className="text-xs text-zinc-500">{day.dayName}</div>
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                                    isCompleted
                                      ? 'bg-green-500 text-white'
                                      : isToday
                                      ? 'bg-zinc-200 dark:bg-zinc-700 border-2 border-blue-500'
                                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
                                  }`}
                                >
                                  {isCompleted ? '✓' : day.dayNum}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter className="flex gap-2">
                      {!habit.checkedToday ? (
                        <Button
                          className="flex-1 gap-2"
                          onClick={() => handleCheckIn(habit.id)}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Check In
                        </Button>
                      ) : (
                        <Alert className="flex-1">
                          <AlertDescription className="text-sm">
                            ✓ Checked in today
                          </AlertDescription>
                        </Alert>
                      )}
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleArchive(habit.id)}
                      >
                        <Archive className="w-4 h-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>

            {/* Top Streaks */}
            {topStreaks.length > 0 && topStreaks.some(h => h.streak > 0) && (
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  Top Streaks
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {topStreaks.filter(h => h.streak > 0).map((habit, index) => (
                    <Card key={habit.id} className="backdrop-blur-xl bg-white/80 dark:bg-zinc-900/80 border-white/20">
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl font-bold text-zinc-400">#{index + 1}</div>
                          <div className="flex-1">
                            <div className="font-medium">{habit.name}</div>
                            <div className="flex items-center gap-1 text-orange-600 mt-1">
                              <Flame className="w-4 h-4" />
                              <span className="font-bold">{habit.streak}</span>
                              <span className="text-xs">days</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Edit Dialog */}
        <Dialog open={!!editingHabit} onOpenChange={(open) => {
          if (!open) {
            setEditingHabit(null);
            resetForm();
          }
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Habit</DialogTitle>
              <DialogDescription>Update your habit details</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Habit Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="edit-frequency">Frequency</Label>
                <Select
                  value={formData.frequency}
                  onValueChange={(value) => setFormData({ ...formData, frequency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FREQUENCY_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.icon} {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Reminder</Label>
                  <p className="text-sm text-zinc-500">Get a daily reminder</p>
                </div>
                <Switch
                  checked={formData.reminderEnabled}
                  onCheckedChange={(checked) => setFormData({ ...formData, reminderEnabled: checked })}
                />
              </div>

              {formData.reminderEnabled && (
                <div>
                  <Label htmlFor="edit-reminderTime">Reminder Time</Label>
                  <Input
                    id="edit-reminderTime"
                    type="time"
                    value={formData.reminderTime}
                    onChange={(e) => setFormData({ ...formData, reminderTime: e.target.value })}
                  />
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setEditingHabit(null);
                resetForm();
              }}>
                Cancel
              </Button>
              <Button onClick={handleEdit}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={!!deletingHabitId} onOpenChange={(open) => {
          if (!open) setDeletingHabitId(null);
        }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Habit?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this habit and all its check-in history. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
