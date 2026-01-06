import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { SupportModeKey } from '@/lib/demo-data';

// Export for backwards compatibility
export type SupportMode = SupportModeKey;

export type EnergyLevel = 'low' | 'normal' | 'high';

export interface UserPreferences {
  selectedModes: SupportModeKey[];
  timerPreset: 10 | 25 | 45;
  readingLargeFont: boolean;
  readingIncreasedSpacing: boolean;
  readingOneSectionAtATime: boolean;
  readingHighlightCurrent: boolean;
  sensoryReduceMotion: boolean;
  sensorySoundOff: boolean;
  motorLargeButtons: boolean;
}

export interface ExperienceProfile {
  // Computed from modes + energy
  defaultTimerMinutes: number;
  maxTasksToday: number;
  showQuickStart: boolean;
  microStepsGranularity: 'normal' | 'detailed';
  showEndingSoonBanner: boolean;
  untimed: boolean;
  mathStepMode: boolean;
  
  // CSS classes to apply
  bodyClasses: string[];
  
  // UI adjustments
  largeButtons: boolean;
  reducedChoices: boolean;
  consistentLayout: boolean;
  
  // Reading adjustments (for dyslexia)
  readingMode: {
    largeFont: boolean;
    increasedSpacing: boolean;
    oneSectionAtATime: boolean;
    highlightCurrent: boolean;
    dyslexiaFont: boolean;
  };
  
  // Sensory adjustments
  sensoryMode: {
    reduceMotion: boolean;
    mutedColors: boolean;
    noFlashing: boolean;
  };
  
  // Energy-based messaging
  energyMessage: string;
  
  // Active modes for AI tutor
  activeModes: SupportModeKey[];
}

interface ModeContextType {
  preferences: UserPreferences;
  setPreferences: React.Dispatch<React.SetStateAction<UserPreferences>>;
  energyLevel: EnergyLevel;
  setEnergyLevel: (level: EnergyLevel) => void;
  experienceProfile: ExperienceProfile;
  hasMode: (mode: SupportModeKey) => boolean;
  updateMode: (mode: SupportModeKey, enabled: boolean) => void;
  isGuestMode: boolean;
  setIsGuestMode: (value: boolean) => void;
}

const defaultPreferences: UserPreferences = {
  selectedModes: [],
  timerPreset: 25,
  readingLargeFont: false,
  readingIncreasedSpacing: false,
  readingOneSectionAtATime: false,
  readingHighlightCurrent: false,
  sensoryReduceMotion: false,
  sensorySoundOff: true,
  motorLargeButtons: false,
};

const ModeContext = createContext<ModeContextType | undefined>(undefined);

export function ModeProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    const saved = localStorage.getItem('neuro-study-preferences');
    return saved ? { ...defaultPreferences, ...JSON.parse(saved) } : defaultPreferences;
  });
  
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel>(() => {
    const saved = localStorage.getItem('neuro-study-energy-today');
    return (saved as EnergyLevel) || 'normal';
  });

  const [isGuestMode, setIsGuestMode] = useState(false);

  // Persist preferences
  useEffect(() => {
    localStorage.setItem('neuro-study-preferences', JSON.stringify(preferences));
  }, [preferences]);

  useEffect(() => {
    localStorage.setItem('neuro-study-energy-today', energyLevel);
  }, [energyLevel]);

  const hasMode = (mode: SupportModeKey) => preferences.selectedModes.includes(mode);

  const updateMode = (mode: SupportModeKey, enabled: boolean) => {
    setPreferences(prev => ({
      ...prev,
      selectedModes: enabled
        ? [...prev.selectedModes, mode]
        : prev.selectedModes.filter(m => m !== mode),
    }));
  };

  // Compute experience profile based on modes and energy
  const experienceProfile = useMemo<ExperienceProfile>(() => {
    const modes = preferences.selectedModes;
    const hasDyslexia = modes.includes('dyslexia');
    const hasADHD = modes.includes('adhd');
    const hasAutism = modes.includes('autism');
    const hasDyscalculia = modes.includes('dyscalculia');
    const hasSensory = modes.includes('sensory_safe');
    const hasMotor = modes.includes('motor_difficulties');
    const hasFatigue = modes.includes('chronic_fatigue');

    // Calculate default timer
    let defaultTimer: number = preferences.timerPreset;
    if (hasADHD && energyLevel !== 'low') {
      defaultTimer = 25;
    }
    if (energyLevel === 'low' || hasFatigue) {
      defaultTimer = Math.min(defaultTimer, 15);
    }
    if (energyLevel === 'high' && !hasFatigue) {
      defaultTimer = Math.max(defaultTimer, 45);
    }

    // Calculate max tasks
    let maxTasks = 5;
    if (energyLevel === 'low' || hasFatigue) maxTasks = 2;
    if (energyLevel === 'high' && !hasFatigue) maxTasks = 6;
    if (hasAutism && maxTasks > 3) maxTasks = 3;

    // Build body classes for global CSS changes
    const bodyClasses: string[] = [];
    if (hasSensory || preferences.sensoryReduceMotion) {
      bodyClasses.push('sensory-safe');
    }
    if (hasDyslexia) {
      bodyClasses.push('dyslexia-mode');
    }
    if (hasMotor || preferences.motorLargeButtons) {
      bodyClasses.push('motor-friendly');
    }
    if (hasADHD) {
      bodyClasses.push('adhd-mode');
    }
    if (hasAutism) {
      bodyClasses.push('autism-mode');
    }

    // Energy messages
    let energyMessage = "You've got this!";
    if (energyLevel === 'low' || hasFatigue) {
      energyMessage = "Minimum viable progress is enough today. Be gentle with yourself.";
    } else if (energyLevel === 'high') {
      energyMessage = "Feeling energetic! Let's make great progress.";
    }

    return {
      defaultTimerMinutes: defaultTimer,
      maxTasksToday: maxTasks,
      showQuickStart: hasADHD,
      microStepsGranularity: hasADHD ? 'detailed' : 'normal',
      showEndingSoonBanner: hasAutism,
      untimed: hasDyscalculia,
      mathStepMode: hasDyscalculia,
      bodyClasses,
      largeButtons: hasMotor || preferences.motorLargeButtons,
      reducedChoices: hasAutism,
      consistentLayout: hasAutism,
      readingMode: {
        largeFont: hasDyslexia || preferences.readingLargeFont,
        increasedSpacing: hasDyslexia || preferences.readingIncreasedSpacing,
        oneSectionAtATime: hasDyslexia || preferences.readingOneSectionAtATime,
        highlightCurrent: preferences.readingHighlightCurrent,
        dyslexiaFont: hasDyslexia,
      },
      sensoryMode: {
        reduceMotion: hasSensory || preferences.sensoryReduceMotion,
        mutedColors: hasSensory,
        noFlashing: hasSensory,
      },
      energyMessage,
      activeModes: modes,
    };
  }, [preferences, energyLevel]);

  // Apply body classes
  useEffect(() => {
    const body = document.body;
    // Remove all mode classes first
    body.classList.remove('sensory-safe', 'dyslexia-mode', 'motor-friendly', 'adhd-mode', 'autism-mode');
    // Add new classes
    experienceProfile.bodyClasses.forEach(cls => body.classList.add(cls));
  }, [experienceProfile.bodyClasses]);

  return (
    <ModeContext.Provider
      value={{
        preferences,
        setPreferences,
        energyLevel,
        setEnergyLevel,
        experienceProfile,
        hasMode,
        updateMode,
        isGuestMode,
        setIsGuestMode,
      }}
    >
      {children}
    </ModeContext.Provider>
  );
}

export function useMode() {
  const context = useContext(ModeContext);
  if (!context) {
    throw new Error('useMode must be used within a ModeProvider');
  }
  return context;
}
