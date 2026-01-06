import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { useMode } from '@/contexts/ModeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { 
  Sparkles, 
  Flame, 
  Clock, 
  Target,
  Trophy,
  Calendar
} from 'lucide-react';
import { BADGES } from '@/lib/demo-data';

interface Progress {
  total_xp: number;
  current_streak: number;
  longest_streak: number;
  total_focused_minutes: number;
  total_sessions_completed: number;
  badges: string[];
}

export default function ProgressPage() {
  const { isGuestMode } = useMode();
  const { user } = useAuth();
  
  const [progress, setProgress] = useState<Progress>({
    total_xp: 0,
    current_streak: 0,
    longest_streak: 0,
    total_focused_minutes: 0,
    total_sessions_completed: 0,
    badges: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    setLoading(true);
    
    if (isGuestMode) {
      setProgress({
        total_xp: 0,
        current_streak: 0,
        longest_streak: 0,
        total_focused_minutes: 0,
        total_sessions_completed: 0,
        badges: [],
      });
      setLoading(false);
      return;
    }

    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setProgress(data as Progress);
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
    
    setLoading(false);
  };

  const earnedBadges = BADGES.filter(b => progress.badges?.includes(b.id));
  const lockedBadges = BADGES.filter(b => !progress.badges?.includes(b.id));

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-muted-foreground">Loading progress...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold text-foreground mb-2">Your Progress</h1>
          <p className="text-muted-foreground">Track your learning journey</p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <Card className="p-4">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-xp-gold/20 flex items-center justify-center mb-3">
                <Sparkles className="w-6 h-6 text-xp-gold" />
              </div>
              <p className="text-2xl font-bold text-foreground">{progress.total_xp}</p>
              <p className="text-sm text-muted-foreground">Total XP</p>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-streak-orange/20 flex items-center justify-center mb-3">
                <Flame className="w-6 h-6 text-streak-orange" />
              </div>
              <p className="text-2xl font-bold text-foreground">{progress.current_streak}</p>
              <p className="text-sm text-muted-foreground">Day Streak</p>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-3">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground">{formatTime(progress.total_focused_minutes)}</p>
              <p className="text-sm text-muted-foreground">Focus Time</p>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center mb-3">
                <Target className="w-6 h-6 text-success" />
              </div>
              <p className="text-2xl font-bold text-foreground">{progress.total_sessions_completed}</p>
              <p className="text-sm text-muted-foreground">Sessions</p>
            </div>
          </Card>
        </motion.div>

        {/* Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-badge-purple" />
                Badges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Earned */}
                {earnedBadges.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">Earned</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {earnedBadges.map(badge => (
                        <div
                          key={badge.id}
                          className="p-4 rounded-xl bg-badge-purple/10 border border-badge-purple/30 text-center"
                        >
                          <span className="text-3xl mb-2 block">{badge.icon}</span>
                          <p className="font-medium text-foreground">{badge.name}</p>
                          <p className="text-xs text-muted-foreground">{badge.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Locked */}
                {lockedBadges.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">Keep going to unlock</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {lockedBadges.map(badge => (
                        <div
                          key={badge.id}
                          className="p-4 rounded-xl bg-muted/50 border border-border text-center opacity-60"
                        >
                          <span className="text-3xl mb-2 block grayscale">{badge.icon}</span>
                          <p className="font-medium text-foreground">{badge.name}</p>
                          <p className="text-xs text-muted-foreground">{badge.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Streak Calendar Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Streak History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-8 text-center">
                <div>
                  <Flame className="w-12 h-12 mx-auto text-streak-orange mb-4" />
                  <p className="text-lg font-medium text-foreground">
                    Longest streak: {progress.longest_streak} days
                  </p>
                  <p className="text-muted-foreground">Keep studying daily to build your streak!</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AppLayout>
  );
}
