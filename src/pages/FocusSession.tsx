import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useMode } from '@/contexts/ModeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ProgressRing } from '@/components/ui/progress-ring';
import { supabase } from '@/integrations/supabase/client';
import { 
  Play, 
  Pause, 
  Square, 
  Check,
  Clock,
  AlertCircle
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  subject_name: string;
  micro_steps: string[];
  completed_micro_steps: number;
}

export default function FocusSession() {
  const { taskId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { experienceProfile, hasMode, isGuestMode } = useMode();
  const { user } = useAuth();

  const task = location.state?.task as Task | undefined;

  const [duration, setDuration] = useState(experienceProfile.defaultTimerMinutes);
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(task?.completed_micro_steps || 0);
  const [showEndingSoon, setShowEndingSoon] = useState(false);
  const [wasInterrupted, setWasInterrupted] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<Date | null>(null);

  // Handle visibility change (anti-escape)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isRunning) {
        // User left the tab during focus
        setWasInterrupted(true);
        endSession(false, 'tab_left');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isRunning]);

  // Timer logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          const newTime = prev - 1;
          
          // Show ending soon banner (Routine mode)
          if (experienceProfile.showEndingSoonBanner && newTime <= 60 && newTime > 0) {
            setShowEndingSoon(true);
          }
          
          if (newTime <= 0) {
            endSession(true, 'completed');
            return 0;
          }
          
          return newTime;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, experienceProfile.showEndingSoonBanner]);

  const startSession = async () => {
    setIsRunning(true);
    startTimeRef.current = new Date();
    setWasInterrupted(false);

    if (!isGuestMode && user) {
      const { data } = await supabase
        .from('focus_sessions')
        .insert({
          user_id: user.id,
          task_id: taskId !== 'quick' ? taskId : null,
          planned_duration: duration,
        })
        .select()
        .single();

      if (data) {
        setSessionId(data.id);
      }
    }
  };

  const pauseSession = () => {
    setIsRunning(false);
  };

  const endSession = useCallback(async (completed: boolean, reason: string) => {
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);

    const actualDuration = startTimeRef.current
      ? Math.floor((new Date().getTime() - startTimeRef.current.getTime()) / 1000 / 60)
      : 0;

    const xpEarned = completed ? duration : 0;

    if (!isGuestMode && user && sessionId) {
      await supabase
        .from('focus_sessions')
        .update({
          ended_at: new Date().toISOString(),
          actual_duration: actualDuration,
          completed,
          end_reason: reason,
          xp_earned: xpEarned,
        })
        .eq('id', sessionId);

      // Update progress
      if (completed) {
        // Update user progress manually
        const { data: currentProgress } = await supabase
          .from('user_progress')
          .select('total_xp, total_focused_minutes, total_sessions_completed')
          .eq('user_id', user.id)
          .single();

        if (currentProgress) {
          await supabase.from('user_progress').update({
            total_xp: (currentProgress.total_xp || 0) + xpEarned,
            total_focused_minutes: (currentProgress.total_focused_minutes || 0) + actualDuration,
            total_sessions_completed: (currentProgress.total_sessions_completed || 0) + 1,
          }).eq('user_id', user.id);
        }

        // Mark task as completed
        if (taskId && taskId !== 'quick') {
          await supabase
            .from('daily_tasks')
            .update({ status: 'completed' })
            .eq('id', taskId);
        }
      }
    }

    // Navigate to session end
    navigate('/session-end', {
      state: {
        completed,
        reason,
        xpEarned,
        duration: actualDuration,
        task,
      },
    });
  }, [isGuestMode, user, sessionId, duration, taskId, task, navigate]);

  const completeStep = () => {
    if (task && currentStep < task.micro_steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const setTimerDuration = (mins: number) => {
    setDuration(mins);
    setTimeLeft(mins * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((duration * 60 - timeLeft) / (duration * 60)) * 100;

  if (!task && taskId !== 'quick') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="focus-overlay flex flex-col items-center justify-center p-4">
      <AnimatePresence>
        {wasInterrupted && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed top-4 left-4 right-4 p-4 bg-warning/10 border border-warning rounded-lg flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-warning" />
            <p className="text-sm">
              Session ended because focus was interrupted. Want to try 10 minutes?
            </p>
            <Button size="sm" onClick={() => { setTimerDuration(10); setWasInterrupted(false); }}>
              Try 10 min
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-md w-full text-center space-y-8">
        {/* Task Info */}
        {task && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-2xl font-bold text-foreground mb-2">{task.title}</h1>
            <p className="text-muted-foreground">{task.subject_name}</p>
          </motion.div>
        )}

        {/* Timer */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex justify-center"
        >
          <ProgressRing
            progress={progress}
            size={240}
            strokeWidth={12}
            className={isRunning ? 'timer-active' : ''}
          >
            <div className="text-center">
              <p className="text-5xl font-bold text-foreground">{formatTime(timeLeft)}</p>
              <p className="text-sm text-muted-foreground mt-2">
                {isRunning ? 'Focusing...' : 'Ready'}
              </p>
            </div>
          </ProgressRing>
        </motion.div>

        {/* Duration Selector (before start) */}
        {!isRunning && timeLeft === duration * 60 && (
          <div className="flex justify-center gap-3">
            {[10, 25, 45].map(mins => (
              <Button
                key={mins}
                variant={duration === mins ? 'default' : 'outline'}
                size="lg"
                onClick={() => setTimerDuration(mins)}
              >
                {mins} min
              </Button>
            ))}
          </div>
        )}

        {/* Controls */}
        <div className="flex justify-center gap-4">
          {!isRunning ? (
            <Button size="lg" className="h-14 px-8 gap-2" onClick={startSession}>
              <Play className="w-5 h-5" />
              {timeLeft < duration * 60 ? 'Resume' : 'Start'}
            </Button>
          ) : (
            <>
              <Button size="lg" variant="outline" className="h-14 px-6" onClick={pauseSession}>
                <Pause className="w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="destructive"
                className="h-14 px-6"
                onClick={() => endSession(false, 'user_stopped')}
              >
                <Square className="w-5 h-5" />
              </Button>
            </>
          )}
        </div>

        {/* Micro-steps */}
        {task && task.micro_steps.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-left space-y-3"
          >
            <h3 className="font-medium text-foreground text-center">Current Step</h3>
            <div className="p-4 bg-card rounded-xl border">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary">{currentStep + 1}</span>
                </div>
                <div className="flex-1">
                  <p className="text-foreground">{task.micro_steps[currentStep]}</p>
                </div>
                {currentStep < task.micro_steps.length - 1 && (
                  <Button size="sm" variant="ghost" onClick={completeStep}>
                    <Check className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                Step {currentStep + 1} of {task.micro_steps.length}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Ending Soon Banner (Routine mode) */}
      <AnimatePresence>
        {showEndingSoon && experienceProfile.showEndingSoonBanner && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="ending-soon-banner"
          >
            <p className="text-warning font-medium">
              ⏰ Session ending in less than a minute
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
