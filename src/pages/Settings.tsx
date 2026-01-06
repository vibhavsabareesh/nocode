import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { useMode } from '@/contexts/ModeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ModeCard } from '@/components/ui/mode-card';
import { supabase } from '@/integrations/supabase/client';
import { SUPPORT_MODE_INFO, TIMER_PRESETS, SupportModeKey } from '@/lib/demo-data';
import { useToast } from '@/hooks/use-toast';
import { Save, RefreshCw } from 'lucide-react';

// Order modes to show primary ones first
const MODE_ORDER: SupportModeKey[] = ['dyslexia', 'adhd', 'sensory_safe', 'autism', 'dyscalculia', 'motor_difficulties', 'chronic_fatigue'];

export default function Settings() {
  const { preferences, setPreferences, hasMode, updateMode, isGuestMode } = useMode();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [saving, setSaving] = useState(false);

  const saveSettings = async () => {
    setSaving(true);

    if (!isGuestMode && user) {
      try {
        // Map new mode keys to database enum values
        const dbModes = preferences.selectedModes.map(mode => {
          const mapping: Record<string, string> = {
            'dyslexia': 'reading_support',
            'adhd': 'focus_support',
            'autism': 'routine_low_overwhelm',
            'dyscalculia': 'step_by_step_math',
            'sensory_safe': 'sensory_safe',
            'motor_difficulties': 'motor_friendly',
            'chronic_fatigue': 'energy_mode',
          };
          return mapping[mode] || mode;
        });

        await supabase.from('profiles').update({
          selected_modes: dbModes as any,
          timer_preset: preferences.timerPreset,
          reading_large_font: preferences.readingLargeFont,
          reading_increased_spacing: preferences.readingIncreasedSpacing,
          reading_one_section_at_a_time: preferences.readingOneSectionAtATime,
          reading_highlight_current: preferences.readingHighlightCurrent,
          sensory_reduce_motion: preferences.sensoryReduceMotion,
          sensory_sound_off: preferences.sensorySoundOff,
          motor_large_buttons: preferences.motorLargeButtons,
        }).eq('user_id', user.id);
      } catch (error) {
        console.error('Error saving settings:', error);
      }
    }

    toast({
      title: 'Settings saved',
      description: 'Your preferences have been updated.',
    });
    setSaving(false);
  };

  const updatePreference = <K extends keyof typeof preferences>(
    key: K,
    value: typeof preferences[K]
  ) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground">Customize your learning experience</p>
          </div>
          <Button onClick={saveSettings} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </motion.div>

        {/* Support Modes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Disability & Support Modes</CardTitle>
              <CardDescription>
                Select the ways you'd like the app to adapt. Each mode changes how the entire app looks and works.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MODE_ORDER.map(mode => {
                  const info = SUPPORT_MODE_INFO[mode];
                  return (
                    <ModeCard
                      key={mode}
                      icon={info.icon}
                      label={info.label}
                      subtitle={info.subtitle}
                      description={info.description}
                      features={info.features}
                      selected={hasMode(mode)}
                      onToggle={() => updateMode(mode, !hasMode(mode))}
                    />
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Timer Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Focus Timer</CardTitle>
              <CardDescription>
                Set your default focus session duration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                {TIMER_PRESETS.map(preset => (
                  <button
                    key={preset.value}
                    onClick={() => updatePreference('timerPreset', preset.value)}
                    className={`flex-1 p-4 rounded-lg border-2 text-center transition-all ${
                      preferences.timerPreset === preset.value
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="text-lg font-bold">{preset.label}</div>
                    <div className="text-xs text-muted-foreground">{preset.description}</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Dyslexia/Reading Settings */}
        {hasMode('dyslexia') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>📖 Dyslexia Settings</CardTitle>
                <CardDescription>
                  Font and spacing are already optimized. Fine-tune below:
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="one-section">One section at a time</Label>
                  <Switch
                    id="one-section"
                    checked={preferences.readingOneSectionAtATime}
                    onCheckedChange={v => updatePreference('readingOneSectionAtATime', v)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="highlight">Highlight current section</Label>
                  <Switch
                    id="highlight"
                    checked={preferences.readingHighlightCurrent}
                    onCheckedChange={v => updatePreference('readingHighlightCurrent', v)}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Sensory Settings */}
        {hasMode('sensory_safe') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>✨ Sensory-Safe Settings</CardTitle>
                <CardDescription>
                  Animations and bright colors are already disabled.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="sound-off">Sound off</Label>
                  <Switch
                    id="sound-off"
                    checked={preferences.sensorySoundOff}
                    onCheckedChange={v => updatePreference('sensorySoundOff', v)}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Motor Settings */}
        {hasMode('motor_difficulties') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>👆 Motor Accessibility</CardTitle>
                <CardDescription>
                  Larger buttons and touch targets are already enabled.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Label htmlFor="large-buttons">Extra large buttons</Label>
                  <Switch
                    id="large-buttons"
                    checked={preferences.motorLargeButtons}
                    onCheckedChange={v => updatePreference('motorLargeButtons', v)}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Reset */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Reset</CardTitle>
              <CardDescription>
                Start fresh with onboarding
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                onClick={() => navigate('/onboarding')}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Redo Onboarding
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AppLayout>
  );
}
