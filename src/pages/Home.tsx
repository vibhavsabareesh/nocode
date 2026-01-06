import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { useMode } from '@/contexts/ModeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EnergySelector } from '@/components/ui/energy-selector';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { 
  Play, 
  Clock, 
  CheckCircle2, 
  Circle, 
  Flame, 
  Zap,
  ChevronRight,
  Sparkles,
  Plus,
  ChevronUp,
  ChevronDown,
  X
} from 'lucide-react';
import { generateMicroSteps } from '@/lib/demo-data';

interface Task {
  id: string;
  title: string;
  subject_name: string;
  chapter_id: string | null;
  estimated_minutes: number;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  order_index: number;
  micro_steps: string[];
  completed_micro_steps: number;
}

interface Progress {
  total_xp: number;
  current_streak: number;
  total_focused_minutes: number;
  total_sessions_completed: number;
}

export default function Home() {
  const { experienceProfile, energyLevel, setEnergyLevel, hasMode, isGuestMode } = useMode();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [progress, setProgress] = useState<Progress>({
    total_xp: 0,
    current_streak: 0,
    total_focused_minutes: 0,
    total_sessions_completed: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user && !isGuestMode) {
      navigate('/');
      return;
    }
    loadData();
  }, [user, isGuestMode]);

  const loadData = async () => {
    setLoading(true);
    
    if (isGuestMode) {
      // Generate demo tasks for guest
      const demoTasks: Task[] = [
        {
          id: '1',
          title: 'Rational Numbers',
          subject_name: 'Mathematics',
          chapter_id: null,
          estimated_minutes: 25,
          status: 'pending',
          order_index: 0,
          micro_steps: generateMicroSteps('Rational Numbers', experienceProfile.microStepsGranularity === 'detailed'),
          completed_micro_steps: 0,
        },
        {
          id: '2',
          title: 'The Tsunami',
          subject_name: 'English',
          chapter_id: null,
          estimated_minutes: 20,
          status: 'pending',
          order_index: 1,
          micro_steps: generateMicroSteps('The Tsunami', experienceProfile.microStepsGranularity === 'detailed'),
          completed_micro_steps: 0,
        },
        {
          id: '3',
          title: 'Microorganisms',
          subject_name: 'Science',
          chapter_id: null,
          estimated_minutes: 25,
          status: 'pending',
          order_index: 2,
          micro_steps: generateMicroSteps('Microorganisms', experienceProfile.microStepsGranularity === 'detailed'),
          completed_micro_steps: 0,
        },
      ];
      setTasks(demoTasks.slice(0, experienceProfile.maxTasksToday));
      setProgress({ total_xp: 0, current_streak: 0, total_focused_minutes: 0, total_sessions_completed: 0 });
      setLoading(false);
      return;
    }

    try {
      // Load today's tasks
      const today = new Date().toISOString().split('T')[0];
      const { data: tasksData } = await supabase
        .from('daily_tasks')
        .select('*')
        .eq('user_id', user!.id)
        .eq('date', today)
        .order('order_index');

      if (tasksData && tasksData.length > 0) {
        setTasks(tasksData as Task[]);
      } else {
        // Generate tasks for today
        await generateTodaysTasks();
      }

      // Load progress
      const { data: progressData } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user!.id)
        .single();

      if (progressData) {
        setProgress(progressData as Progress);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
    
    setLoading(false);
  };

  const generateTodaysTasks = async () => {
    if (!user) return;

    try {
      // Get user's subjects
      const { data: userSubjects } = await supabase
        .from('user_subjects')
        .select('subject_name')
        .eq('user_id', user.id);

      const subjectNames = userSubjects?.map(s => s.subject_name) || ['Mathematics', 'English', 'Science'];

      // Get user's profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('board, grade')
        .eq('user_id', user.id)
        .single();

      const board = profile?.board || 'CBSE';
      const grade = profile?.grade || 8;

      // Get chapters for these subjects
      const { data: chapters } = await supabase
        .from('chapters')
        .select('*, subjects(name)')
        .eq('board', board)
        .eq('grade', grade)
        .limit(20);

      if (!chapters || chapters.length === 0) {
        setTasks([]);
        return;
      }

      // Filter chapters by user's subjects
      const relevantChapters = chapters.filter(c => 
        subjectNames.includes((c.subjects as any)?.name)
      );

      // Create tasks
      const today = new Date().toISOString().split('T')[0];
      const newTasks: any[] = [];
      const shuffled = [...relevantChapters].sort(() => Math.random() - 0.5);

      for (let i = 0; i < Math.min(experienceProfile.maxTasksToday, shuffled.length); i++) {
        const chapter = shuffled[i];
        newTasks.push({
          user_id: user.id,
          chapter_id: chapter.id,
          date: today,
          title: chapter.title,
          subject_name: (chapter.subjects as any)?.name,
          estimated_minutes: experienceProfile.defaultTimerMinutes,
          status: 'pending',
          order_index: i,
          micro_steps: generateMicroSteps(
            chapter.title, 
            experienceProfile.microStepsGranularity === 'detailed'
          ),
          completed_micro_steps: 0,
        });
      }

      if (newTasks.length > 0) {
        const { data: insertedTasks } = await supabase
          .from('daily_tasks')
          .insert(newTasks)
          .select();

        if (insertedTasks) {
          setTasks(insertedTasks as Task[]);
        }
      }
    } catch (error) {
      console.error('Error generating tasks:', error);
    }
  };

  const moveTask = async (taskId: string, direction: 'up' | 'down') => {
    const index = tasks.findIndex(t => t.id === taskId);
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === tasks.length - 1)
    ) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const newTasks = [...tasks];
    [newTasks[index], newTasks[newIndex]] = [newTasks[newIndex], newTasks[index]];
    
    // Update order indices
    newTasks.forEach((t, i) => t.order_index = i);
    setTasks(newTasks);

    if (!isGuestMode && user) {
      // Update in database
      for (const task of newTasks) {
        await supabase
          .from('daily_tasks')
          .update({ order_index: task.order_index })
          .eq('id', task.id);
      }
    }
  };

  const removeTask = async (taskId: string) => {
    setTasks(tasks.filter(t => t.id !== taskId));
    
    if (!isGuestMode && user) {
      await supabase.from('daily_tasks').delete().eq('id', taskId);
    }
  };

  const startFocus = (task: Task) => {
    navigate(`/focus/${task.id}`, { state: { task } });
  };

  const getSubjectIcon = (subject: string) => {
    const icons: Record<string, string> = {
      'Mathematics': '📐',
      'English': '📚',
      'Science': '🔬',
      'Computer Science': '💻',
      'Social Studies': '🌍',
    };
    return icons[subject] || '📖';
  };

  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-pulse text-muted-foreground">Loading your day...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header with Energy + Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Today's Plan</h1>
              <p className="text-muted-foreground">{experienceProfile.energyMessage}</p>
            </div>
            
            {hasMode('chronic_fatigue') && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">How's your energy?</p>
                <EnergySelector value={energyLevel} onChange={setEnergyLevel} />
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-xp-gold/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-xp-gold" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{progress.total_xp}</p>
                  <p className="text-xs text-muted-foreground">XP</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-streak-orange/20 flex items-center justify-center">
                  <Flame className="w-5 h-5 text-streak-orange" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{progress.current_streak}</p>
                  <p className="text-xs text-muted-foreground">Day Streak</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{progress.total_focused_minutes}</p>
                  <p className="text-xs text-muted-foreground">Minutes</p>
                </div>
              </div>
            </Card>
          </div>
        </motion.div>

        {/* Quick Start Button (Focus Support) */}
        {experienceProfile.showQuickStart && pendingTasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Button
              size="lg"
              className="w-full h-14 text-lg gap-3"
              onClick={() => startFocus(pendingTasks[0])}
            >
              <Zap className="w-5 h-5" />
              Quick Start 10 min
            </Button>
          </motion.div>
        )}

        {/* Tasks */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Tasks</h2>
            {!experienceProfile.reducedChoices && (
              <Button variant="outline" size="sm" asChild>
                <Link to="/library">
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Link>
              </Button>
            )}
          </div>

          {pendingTasks.length === 0 ? (
            <Card className="p-8 text-center">
              <CheckCircle2 className="w-12 h-12 mx-auto text-success mb-4" />
              <p className="text-lg font-medium text-foreground">All done for today!</p>
              <p className="text-muted-foreground">Great work. Come back tomorrow for more.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {pendingTasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="card-interactive">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Next Action Indicator */}
                        <div className={`mt-1 ${index === 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                          {index === 0 ? (
                            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                              <Play className="w-3 h-3 text-primary-foreground" />
                            </div>
                          ) : (
                            <Circle className="w-6 h-6" />
                          )}
                        </div>

                        {/* Task Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-medium text-foreground">{task.title}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-lg" role="img">{getSubjectIcon(task.subject_name)}</span>
                                <span className="text-sm text-muted-foreground">{task.subject_name}</span>
                                <Badge variant="secondary" className="text-xs">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {task.estimated_minutes} min
                                </Badge>
                              </div>
                            </div>
                          </div>

                          {/* Micro-steps preview */}
                          {index === 0 && (
                            <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                              <p className="text-xs font-medium text-muted-foreground mb-2">Next step:</p>
                              <p className="text-sm text-foreground">
                                {task.micro_steps[task.completed_micro_steps] || task.micro_steps[0]}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-1">
                          {!experienceProfile.reducedChoices && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => moveTask(task.id, 'up')}
                                disabled={index === 0}
                              >
                                <ChevronUp className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => moveTask(task.id, 'down')}
                                disabled={index === pendingTasks.length - 1}
                              >
                                <ChevronDown className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={() => removeTask(task.id)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Start Button */}
                      <div className="mt-4 flex justify-end">
                        <Button onClick={() => startFocus(task)}>
                          Start Focus
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* Completed Tasks */}
          {completedTasks.length > 0 && (
            <div className="pt-4 border-t">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Completed today</h3>
              <div className="space-y-2">
                {completedTasks.map(task => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/30"
                  >
                    <CheckCircle2 className="w-5 h-5 text-success" />
                    <span className="text-muted-foreground line-through">{task.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
