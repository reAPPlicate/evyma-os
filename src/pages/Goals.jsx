import { useEffect, useState } from 'react';
import { useGoalsStore } from '@/components/stores/goalsStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Slider } from '@/components/ui/slider';
import { Plus, Target, Edit, Trash2, Check, Archive, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { CardSkeleton } from '@/components/LoadingSpinner';

const CATEGORIES = [
  { value: 'career', label: 'Career', icon: '💼' },
  { value: 'health', label: 'Health', icon: '💪' },
  { value: 'relationships', label: 'Relationships', icon: '❤️' },
  { value: 'personal', label: 'Personal', icon: '🌟' },
  { value: 'financial', label: 'Financial', icon: '💰' },
  { value: 'learning', label: 'Learning', icon: '📚' }
];

const STATUS_COLORS = {
  active: 'border-blue-500 bg-blue-500/10',
  completed: 'border-green-500 bg-green-500/10',
  paused: 'border-yellow-500 bg-yellow-500/10',
  abandoned: 'border-gray-500 bg-gray-500/10'
};

export default function Goals() {
  const { goals, fetchGoals, createGoal, updateGoal, deleteGoal, filter, setFilter, isLoading } = useGoalsStore();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [deletingGoalId, setDeletingGoalId] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'personal',
    target_date: '',
    progress: 0
  });

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'personal',
      target_date: '',
      progress: 0
    });
  };

  const handleCreate = async () => {
    if (!formData.title.trim()) {
      toast.error('Please enter a goal title');
      return;
    }

    try {
      await createGoal({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        target_date: formData.target_date || null,
        progress: 0,
        status: 'active'
      });

      setIsCreateOpen(false);
      resetForm();
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = async () => {
    if (!editingGoal) return;

    try {
      await updateGoal(editingGoal.id, formData);
      setEditingGoal(null);
      resetForm();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (!deletingGoalId) return;

    try {
      await deleteGoal(deletingGoalId);
      setDeletingGoalId(null);
    } catch (error) {
      console.error(error);
    }
  };

  const handleProgressUpdate = async (goalId, newProgress) => {
    try {
      await updateGoal(goalId, { progress: newProgress });

      if (newProgress === 100) {
        toast.success('🎉 Goal completed!');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleStatusChange = async (goalId, status) => {
    try {
      await updateGoal(goalId, { status });
    } catch (error) {
      console.error(error);
    }
  };

  const openEditDialog = (goal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      description: goal.description || '',
      category: goal.category || 'personal',
      target_date: goal.target_date ? new Date(goal.target_date).toISOString().split('T')[0] : '',
      progress: goal.progress || 0
    });
  };

  const filteredGoals = filter === 'all'
    ? goals
    : goals.filter(g => g.status === filter);

  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');

  return (
    <div className="min-h-screen w-full p-4 md:p-8 pb-40">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
              <Target className="w-8 h-8 text-blue-500" />
              Goals
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 mt-2">
              Track your progress toward what matters most
            </p>
          </div>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
                <Plus className="w-5 h-5" />
                New Goal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Goal</DialogTitle>
                <DialogDescription>
                  What do you want to achieve? Set a goal and track your progress.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Goal Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Launch my product"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="What does success look like?"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(cat => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.icon} {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="target_date">Target Date</Label>
                    <Input
                      id="target_date"
                      type="date"
                      value={formData.target_date}
                      onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setIsCreateOpen(false);
                  resetForm();
                }}>
                  Cancel
                </Button>
                <Button onClick={handleCreate}>Create Goal</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="backdrop-blur-xl bg-white/80 dark:bg-zinc-900/80 border-white/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Active Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{activeGoals.length}</div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-xl bg-white/80 dark:bg-zinc-900/80 border-white/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{completedGoals.length}</div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-xl bg-white/80 dark:bg-zinc-900/80 border-white/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Average Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {activeGoals.length > 0
                  ? Math.round(activeGoals.reduce((acc, g) => acc + (g.progress || 0), 0) / activeGoals.length)
                  : 0}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Tabs value={filter} onValueChange={setFilter} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-4">
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="abandoned">Archived</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>

          <TabsContent value={filter} className="mt-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => <CardSkeleton key={i} />)}
              </div>
            ) : filteredGoals.length === 0 ? (
              <Card className="backdrop-blur-xl bg-white/80 dark:bg-zinc-900/80 border-white/20">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Target className="w-16 h-16 text-zinc-400 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No goals yet</h3>
                  <p className="text-zinc-600 dark:text-zinc-400 text-center mb-4">
                    {filter === 'active'
                      ? "Create your first goal to get started!"
                      : `No ${filter} goals to show.`}
                  </p>
                  {filter === 'active' && (
                    <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
                      <Plus className="w-4 h-4" />
                      Create Goal
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredGoals.map(goal => {
                  const category = CATEGORIES.find(c => c.value === goal.category);
                  const daysUntilTarget = goal.target_date
                    ? Math.ceil((new Date(goal.target_date) - new Date()) / (1000 * 60 * 60 * 24))
                    : null;

                  return (
                    <Card
                      key={goal.id}
                      className={`backdrop-blur-xl bg-white/80 dark:bg-zinc-900/80 border-2 ${STATUS_COLORS[goal.status]}`}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-lg">{category?.icon}</span>
                              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase">
                                {category?.label}
                              </span>
                            </div>
                            <CardTitle className="text-xl">{goal.title}</CardTitle>
                            {goal.description && (
                              <CardDescription className="mt-2">
                                {goal.description}
                              </CardDescription>
                            )}
                          </div>

                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(goal)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeletingGoalId(goal.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {/* Progress */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-sm">Progress</Label>
                            <span className="text-sm font-semibold">{goal.progress || 0}%</span>
                          </div>
                          <Progress value={goal.progress || 0} className="h-2" />

                          {goal.status === 'active' && (
                            <Slider
                              value={[goal.progress || 0]}
                              onValueChange={([value]) => handleProgressUpdate(goal.id, value)}
                              max={100}
                              step={5}
                              className="mt-2"
                            />
                          )}
                        </div>

                        {/* Target Date */}
                        {goal.target_date && (
                          <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(goal.target_date).toLocaleDateString()}
                              {daysUntilTarget !== null && daysUntilTarget >= 0 && (
                                <span className="ml-2 text-xs">
                                  ({daysUntilTarget} days left)
                                </span>
                              )}
                            </span>
                          </div>
                        )}
                      </CardContent>

                      <CardFooter className="flex gap-2">
                        {goal.status === 'active' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 gap-2"
                              onClick={() => handleStatusChange(goal.id, 'completed')}
                            >
                              <Check className="w-4 h-4" />
                              Complete
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-2"
                              onClick={() => handleStatusChange(goal.id, 'abandoned')}
                            >
                              <Archive className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        {goal.status === 'abandoned' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => handleStatusChange(goal.id, 'active')}
                          >
                            Reactivate
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Edit Dialog */}
        <Dialog open={!!editingGoal} onOpenChange={(open) => {
          if (!open) {
            setEditingGoal(null);
            resetForm();
          }
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Goal</DialogTitle>
              <DialogDescription>Update your goal details</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Goal Title *</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.icon} {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="edit-target_date">Target Date</Label>
                  <Input
                    id="edit-target_date"
                    type="date"
                    value={formData.target_date}
                    onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setEditingGoal(null);
                resetForm();
              }}>
                Cancel
              </Button>
              <Button onClick={handleEdit}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={!!deletingGoalId} onOpenChange={(open) => {
          if (!open) setDeletingGoalId(null);
        }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Goal?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete this goal and all associated data.
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