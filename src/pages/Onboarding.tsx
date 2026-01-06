import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useMode, SupportMode } from '@/contexts/ModeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ModeCard } from '@/components/ui/mode-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { SUPPORT_MODE_INFO, BOARDS, GRADES, DEFAULT_SUBJECTS, TIMER_PRESETS, SupportModeKey } from '@/lib/demo-data';
import { ArrowLeft, ArrowRight, Check, Target, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const STEPS = ['support', 'academics', 'preferences'] as const;

// Order modes to show primary ones first
const MODE_ORDER: SupportModeKey[] = ['dyslexia', 'adhd', 'sensory_safe', 'autism', 'dyscalculia', 'motor_difficulties', 'chronic_fatigue'];

export default function Onboarding() {
  const [searchParams] = useSearchParams();
  const isGuest = searchParams.get('guest') === 'true';
  
  const [step, setStep] = useState(0);
  const [selectedModes, setSelectedModes] = useState<SupportModeKey[]>([]);
  const [board, setBoard] = useState<string>('CBSE');
  const [grade, setGrade] = useState<number>(8);
  const [subjects, setSubjects] = useState<string[]>(['Mathematics', 'English', 'Science']);
  const [timerPreset, setTimerPreset] = useState<10 | 25 | 45>(25);
  const [readingSettings, setReadingSettings] = useState({
    largeFont: false,
    increasedSpacing: false,
    oneSectionAtATime: false,
    highlightCurrent: false,
  });
  const [sensorySettings, setSensorySettings] = useState({
    reduceMotion: false,
    soundOff: true,
  });
  const [motorSettings, setMotorSettings] = useState({
    largeButtons: false,
  });

  const { setPreferences, setIsGuestMode, experienceProfile } = useMode();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (isGuest) {
      setIsGuestMode(true);
    }
  }, [isGuest, setIsGuestMode]);

  // Immediately apply mode changes for live preview
  useEffect(() => {
    setPreferences(prev => ({
      ...prev,
      selectedModes: selectedModes as SupportMode[],
    }));
  }, [selectedModes, setPreferences]);

  const toggleMode = (mode: SupportModeKey) => {
    setSelectedModes(prev =>
      prev.includes(mode)
        ? prev.filter(m => m !== mode)
        : [...prev, mode]
    );
  };

  const toggleSubject = (subject: string) => {
    setSubjects(prev =>
      prev.includes(subject)
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
    );
  };

  const handleComplete = async () => {
    // Update mode context
    setPreferences({
      selectedModes: selectedModes as SupportMode[],
      timerPreset,
      readingLargeFont: readingSettings.largeFont,
      readingIncreasedSpacing: readingSettings.increasedSpacing,
      readingOneSectionAtATime: readingSettings.oneSectionAtATime,
      readingHighlightCurrent: readingSettings.highlightCurrent,
      sensoryReduceMotion: sensorySettings.reduceMotion,
      sensorySoundOff: sensorySettings.soundOff,
      motorLargeButtons: motorSettings.largeButtons,
    });

    // Save to database if logged in
    if (user && !isGuest) {
      try {
        // Map new mode keys to database enum values
        const dbModes = selectedModes.map(mode => {
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
          board: board as 'CBSE' | 'IGCSE',
          grade,
          selected_modes: dbModes as any,
          timer_preset: timerPreset,
          reading_large_font: readingSettings.largeFont,
          reading_increased_spacing: readingSettings.increasedSpacing,
          reading_one_section_at_a_time: readingSettings.oneSectionAtATime,
          reading_highlight_current: readingSettings.highlightCurrent,
          sensory_reduce_motion: sensorySettings.reduceMotion,
          sensory_sound_off: sensorySettings.soundOff,
          motor_large_buttons: motorSettings.largeButtons,
          onboarding_completed: true,
        }).eq('user_id', user.id);

        // Save subjects
        await supabase.from('user_subjects').delete().eq('user_id', user.id);
        if (subjects.length > 0) {
          await supabase.from('user_subjects').insert(
            subjects.map(s => ({ user_id: user.id, subject_name: s }))
          );
        }
      } catch (error) {
        console.error('Error saving preferences:', error);
      }
    }

    toast({
      title: 'Welcome to NeuroStudy!',
      description: 'Your personalized learning environment is ready.',
    });
    navigate('/home');
  };

  const canProceed = () => {
    if (step === 0) return true; // Modes are optional
    if (step === 1) return board && grade && subjects.length > 0;
    return true;
  };

  // Get active mode names for preview
  const activeModeLabels = selectedModes.map(m => SUPPORT_MODE_INFO[m].label);

  return (
    <div className="min-h-screen gradient-calm py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-primary flex items-center justify-center">
            <Target className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Let's personalize your experience</h1>
          <p className="text-muted-foreground mt-2">
            The entire app will adapt based on your selections
          </p>
          
          {/* Progress */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {STEPS.map((s, i) => (
              <React.Fragment key={s}>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    i < step
                      ? 'bg-primary text-primary-foreground'
                      : i === step
                      ? 'bg-primary/20 text-primary border-2 border-primary'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {i < step ? <Check className="w-5 h-5" /> : i + 1}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`w-16 h-1 rounded ${i < step ? 'bg-primary' : 'bg-muted'}`} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Live preview indicator */}
          {selectedModes.length > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm">
              <Eye className="w-4 h-4" />
              <span>Live preview: {activeModeLabels.join(', ')}</span>
            </div>
          )}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {step === 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">What should NeuroStudy adapt for?</CardTitle>
                  <CardDescription className="text-base">
                    Select all that apply. Each selection changes how the entire app looks and works.
                    <br />
                    <strong className="text-primary">Try selecting different options to see instant changes!</strong>
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
                          selected={selectedModes.includes(mode)}
                          onToggle={() => toggleMode(mode)}
                        />
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Your academics</CardTitle>
                  <CardDescription>
                    Tell us about what you're studying
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Board</Label>
                      <Select value={board} onValueChange={setBoard}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select board" />
                        </SelectTrigger>
                        <SelectContent>
                          {BOARDS.map(b => (
                            <SelectItem key={b} value={b}>{b}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Grade</Label>
                      <Select value={String(grade)} onValueChange={v => setGrade(Number(v))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select grade" />
                        </SelectTrigger>
                        <SelectContent>
                          {GRADES.map(g => (
                            <SelectItem key={g} value={String(g)}>Grade {g}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Subjects</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {DEFAULT_SUBJECTS.map(sub => (
                        <div
                          key={sub.name}
                          className="flex items-center space-x-3"
                        >
                          <Checkbox
                            id={sub.name}
                            checked={subjects.includes(sub.name)}
                            onCheckedChange={() => toggleSubject(sub.name)}
                          />
                          <Label htmlFor={sub.name} className="flex items-center gap-2 cursor-pointer">
                            <span>{sub.icon}</span>
                            {sub.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>Fine-tune your preferences</CardTitle>
                  <CardDescription>
                    These are based on your selections. Adjust as needed.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Timer Preset */}
                  <div className="space-y-3">
                    <Label>Default focus timer</Label>
                    <div className="flex gap-3">
                      {TIMER_PRESETS.map(preset => (
                        <button
                          key={preset.value}
                          onClick={() => setTimerPreset(preset.value)}
                          className={`flex-1 p-4 rounded-lg border-2 text-center transition-all ${
                            timerPreset === preset.value
                              ? 'border-primary bg-primary/10'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="text-lg font-bold">{preset.label}</div>
                          <div className="text-xs text-muted-foreground">{preset.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dyslexia/Reading Support Preview */}
                  {selectedModes.includes('dyslexia') && (
                    <div className="space-y-3 p-4 rounded-lg bg-muted/50 border-l-4 border-primary">
                      <Label className="text-base font-semibold flex items-center gap-2">
                        📖 Dyslexia Settings
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Font, spacing, and layout are already optimized. Fine-tune below:
                      </p>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="one-section">Show one section at a time</Label>
                          <Switch
                            id="one-section"
                            checked={readingSettings.oneSectionAtATime}
                            onCheckedChange={v => setReadingSettings(p => ({ ...p, oneSectionAtATime: v }))}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="highlight">Highlight current section</Label>
                          <Switch
                            id="highlight"
                            checked={readingSettings.highlightCurrent}
                            onCheckedChange={v => setReadingSettings(p => ({ ...p, highlightCurrent: v }))}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Sensory Safe Preview */}
                  {selectedModes.includes('sensory_safe') && (
                    <div className="space-y-3 p-4 rounded-lg bg-muted/50 border-l-4 border-primary">
                      <Label className="text-base font-semibold flex items-center gap-2">
                        ✨ Sensory-Safe Settings
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Animations and bright colors are already disabled.
                      </p>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="sound-off">Sound off</Label>
                          <Switch
                            id="sound-off"
                            checked={sensorySettings.soundOff}
                            onCheckedChange={v => setSensorySettings(p => ({ ...p, soundOff: v }))}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Motor Friendly Preview */}
                  {selectedModes.includes('motor_difficulties') && (
                    <div className="space-y-3 p-4 rounded-lg bg-muted/50 border-l-4 border-primary">
                      <Label className="text-base font-semibold flex items-center gap-2">
                        👆 Motor-Friendly Settings
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Larger buttons and touch targets are already enabled.
                      </p>
                    </div>
                  )}

                  {/* ADHD Preview */}
                  {selectedModes.includes('adhd') && (
                    <div className="space-y-3 p-4 rounded-lg bg-muted/50 border-l-4 border-primary">
                      <Label className="text-base font-semibold flex items-center gap-2">
                        🎯 ADHD Settings
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Quick-start buttons, micro-steps, and focus tools are enabled.
                        Default timer is set to 25 min (or 10 min on low energy days).
                      </p>
                    </div>
                  )}

                  {/* Summary of active modes */}
                  {selectedModes.length > 0 && (
                    <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                      <h4 className="font-semibold text-primary mb-2">Your personalized experience includes:</h4>
                      <ul className="space-y-1">
                        {selectedModes.map(mode => (
                          <li key={mode} className="text-sm flex items-center gap-2">
                            <span>{SUPPORT_MODE_INFO[mode].icon}</span>
                            <span className="font-medium">{SUPPORT_MODE_INFO[mode].label}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => setStep(s => s - 1)}
            disabled={step === 0}
            size="lg"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {step < STEPS.length - 1 ? (
            <Button
              onClick={() => setStep(s => s + 1)}
              disabled={!canProceed()}
              size="lg"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleComplete} size="lg" className="px-8">
              <Check className="w-4 h-4 mr-2" />
              Complete Setup
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
