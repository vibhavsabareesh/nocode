import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sparkles, Flame, Clock, Home, RotateCcw, AlertTriangle } from 'lucide-react';

interface SessionEndState {
  completed: boolean;
  reason: string;
  xpEarned: number;
  duration: number;
  task?: {
    title: string;
    subject_name: string;
  };
}

export default function SessionEnd() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as SessionEndState | undefined;

  if (!state) {
    navigate('/home');
    return null;
  }

  const { completed, reason, xpEarned, duration, task } = state;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full"
      >
        <Card className="p-8 text-center">
          {completed ? (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="w-20 h-20 mx-auto mb-6 rounded-full bg-success/20 flex items-center justify-center"
              >
                <Sparkles className="w-10 h-10 text-success" />
              </motion.div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Session Complete!</h1>
              <p className="text-muted-foreground mb-6">
                {task ? `Great work on "${task.title}"!` : 'Great focus session!'}
              </p>
            </>
          ) : (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="w-20 h-20 mx-auto mb-6 rounded-full bg-warning/20 flex items-center justify-center"
              >
                <AlertTriangle className="w-10 h-10 text-warning" />
              </motion.div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Session Ended</h1>
              <p className="text-muted-foreground mb-6">
                {reason === 'tab_left' 
                  ? 'Focus was interrupted when you left the page.'
                  : reason === 'user_stopped'
                  ? 'You stopped the session early.'
                  : 'Session was not completed.'}
              </p>
            </>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-4 rounded-xl bg-muted/50">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-xp-gold" />
                <span className="text-2xl font-bold text-foreground">{xpEarned}</span>
              </div>
              <p className="text-xs text-muted-foreground">XP Earned</p>
            </div>
            <div className="p-4 rounded-xl bg-muted/50">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-primary" />
                <span className="text-2xl font-bold text-foreground">{duration}</span>
              </div>
              <p className="text-xs text-muted-foreground">Minutes</p>
            </div>
          </div>

          {/* Streak indicator */}
          {completed && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-8 p-4 rounded-xl bg-streak-orange/10 border border-streak-orange/30"
            >
              <div className="flex items-center justify-center gap-2">
                <Flame className="w-5 h-5 text-streak-orange" />
                <span className="font-medium text-foreground">Streak maintained!</span>
              </div>
            </motion.div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Button onClick={() => navigate('/home')} className="w-full">
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            {!completed && (
              <Button 
                variant="outline" 
                onClick={() => navigate(-1)}
                className="w-full"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
