// Demo data for guest mode and initial seeding
// Using REAL disability terminology for clarity and respect

export const SUPPORT_MODE_INFO = {
  dyslexia: {
    label: 'Dyslexia',
    subtitle: 'Have trouble reading text?',
    description: 'Reading feels easier with the right formatting',
    icon: '📖',
    features: [
      'Dyslexia-friendly font (OpenDyslexic)',
      'Wider letter & line spacing',
      'Shorter line width for easier tracking',
      'Content shown one section at a time',
      'Simplified AI tutor explanations',
    ],
  },
  adhd: {
    label: 'ADHD',
    subtitle: 'Struggle to stay focused or get started?',
    description: 'Tools to help you start and maintain focus',
    icon: '🎯',
    features: [
      'Prominent "Start 10 min focus" button',
      'Tasks broken into micro-steps',
      'Pomodoro-style focus timers',
      'Minimal clutter, clear next action',
      'Streaks & XP for motivation',
    ],
  },
  sensory_safe: {
    label: 'Sensory Sensitivity',
    subtitle: 'Sensitive to light, motion, or stimulation?',
    description: 'Includes epilepsy-safe design principles',
    icon: '✨',
    features: [
      'No flashing or rapid color changes',
      'All animations removed',
      'Soft, muted colors throughout',
      'No sound or audio alerts',
      'Calm, static interface',
    ],
  },
  autism: {
    label: 'Autism',
    subtitle: 'Prefer routine and predictability?',
    description: 'Consistent patterns you can rely on',
    icon: '🧩',
    features: [
      'Fixed, consistent layout positions',
      'Reduced choices (max 3 tasks)',
      'No surprise popups or changes',
      'Smooth, predictable transitions',
      'Same order every day',
    ],
  },
  dyscalculia: {
    label: 'Dyscalculia',
    subtitle: 'Math feels overwhelming?',
    description: 'Step-by-step math without time pressure',
    icon: '🔢',
    features: [
      'One math step at a time',
      'Visual grouping for numbers',
      'No timed math problems',
      'Clear step labels (Step 1, Step 2...)',
      'Simplified number presentation',
    ],
  },
  motor_difficulties: {
    label: 'Motor Difficulties',
    subtitle: 'Need larger touch targets?',
    description: 'Easier to tap, no drag-and-drop',
    icon: '👆',
    features: [
      'Extra-large buttons & touch targets',
      'No drag-and-drop interactions',
      'Buttons positioned for easy reach',
      'Simple up/down controls',
      'No precision movements required',
    ],
  },
  chronic_fatigue: {
    label: 'Chronic Fatigue / Energy Issues',
    subtitle: 'Energy varies day to day?',
    description: 'Adapts to how you feel today',
    icon: '⚡',
    features: [
      'Daily energy check-in',
      'Fewer tasks on low-energy days',
      'Shorter default sessions when tired',
      '"Minimum viable progress" messaging',
      'No guilt, just what works',
    ],
  },
};

// Type for the support modes
export type SupportModeKey = keyof typeof SUPPORT_MODE_INFO;

export const BOARDS = ['CBSE', 'IGCSE'] as const;

export const GRADES = [6, 7, 8, 9, 10, 11, 12] as const;

export const DEFAULT_SUBJECTS = [
  { name: 'Mathematics', icon: '📐' },
  { name: 'English', icon: '📚' },
  { name: 'Science', icon: '🔬' },
  { name: 'Computer Science', icon: '💻' },
  { name: 'Social Studies', icon: '🌍' },
];

export const TIMER_PRESETS = [
  { value: 10, label: '10 min', description: 'Quick focus burst' },
  { value: 25, label: '25 min', description: 'Pomodoro classic' },
  { value: 45, label: '45 min', description: 'Deep work session' },
] as const;

export const BADGES = [
  { id: 'first_session', name: 'First Step', description: 'Complete your first focus session', icon: '🌱' },
  { id: 'streak_3', name: '3 Day Streak', description: 'Study 3 days in a row', icon: '🔥' },
  { id: 'streak_7', name: 'Week Warrior', description: 'Study 7 days in a row', icon: '⭐' },
  { id: 'hours_5', name: 'Five Hours', description: 'Accumulate 5 hours of focus time', icon: '🏆' },
  { id: 'chapters_10', name: 'Bookworm', description: 'Complete 10 chapters', icon: '📚' },
];

export function generateMicroSteps(taskTitle: string, isDetailed: boolean): string[] {
  const baseSteps = [
    `Open ${taskTitle} materials`,
    'Read the summary',
    'Review key points',
    'Attempt practice questions',
    'Note any doubts',
  ];

  if (isDetailed) {
    return [
      `Find a quiet spot to study`,
      `Open ${taskTitle} materials`,
      'Take 3 deep breaths',
      'Read the first paragraph of the summary',
      'Pause and think about what you read',
      'Continue reading the rest of the summary',
      'Look at the first key point',
      'Try to explain it in your own words',
      'Continue with remaining key points',
      'Open the practice questions',
      'Read the first question carefully',
      'Try to answer without looking at options',
      'Check your answer',
      'Continue with remaining questions',
      'Write down any concepts you need to revisit',
      'Take a moment to celebrate your progress!',
    ];
  }

  return baseSteps;
}

export function generateDailyTasks(
  subjects: string[],
  maxTasks: number,
  chapters: any[]
): any[] {
  const tasks: any[] = [];
  const shuffledSubjects = [...subjects].sort(() => Math.random() - 0.5);
  
  for (let i = 0; i < Math.min(maxTasks, shuffledSubjects.length); i++) {
    const subject = shuffledSubjects[i];
    const subjectChapters = chapters.filter(c => 
      c.subjects?.name === subject || c.subject_name === subject
    );
    
    if (subjectChapters.length > 0) {
      const chapter = subjectChapters[Math.floor(Math.random() * subjectChapters.length)];
      tasks.push({
        title: chapter.title,
        subject_name: subject,
        chapter_id: chapter.id,
        estimated_minutes: 25,
        micro_steps: generateMicroSteps(chapter.title, false),
      });
    }
  }
  
  return tasks;
}

// AI Tutor system prompts based on disability modes
export function getAITutorSystemPrompt(modes: SupportModeKey[]): string {
  let basePrompt = `You are NeuroStudy AI Tutor, a helpful and patient educational assistant. `;
  
  if (modes.includes('dyslexia')) {
    basePrompt += `
IMPORTANT - DYSLEXIA ADAPTATIONS:
- Use SHORT sentences only (max 10-12 words each)
- Break explanations into bullet points
- Use simple, common words
- Avoid long paragraphs (max 2-3 sentences per paragraph)
- Use lots of spacing between ideas
- Explain concepts step by step
- Use analogies and real-world examples`;
  }
  
  if (modes.includes('adhd')) {
    basePrompt += `
IMPORTANT - ADHD ADAPTATIONS:
- Start with the KEY POINT immediately
- Keep responses SHORT and punchy
- Use action words: "Do this", "Try this"
- Add encouraging phrases
- Break everything into small steps
- End with a clear "NEXT ACTION" the student can take right now
- Use emojis sparingly for engagement 🎯`;
  }
  
  if (modes.includes('sensory_safe')) {
    basePrompt += `
IMPORTANT - SENSORY-SAFE ADAPTATIONS:
- Use calm, neutral language
- Avoid exclamation marks and caps
- Keep tone gentle and steady
- No overwhelming lists
- Simple, clear structure
- Minimal use of emojis`;
  }
  
  if (modes.includes('dyscalculia')) {
    basePrompt += `
IMPORTANT - DYSCALCULIA ADAPTATIONS:
- Break math into VERY small steps
- Show only ONE step at a time
- Use visual grouping (parentheses, spacing)
- Avoid mental math - show everything written out
- Use concrete examples before abstract concepts
- No time pressure language`;
  }
  
  if (modes.includes('autism')) {
    basePrompt += `
IMPORTANT - AUTISM ADAPTATIONS:
- Be LITERAL and precise
- Avoid idioms and figures of speech
- Consistent formatting every time
- Clear, predictable structure
- State expectations explicitly`;
  }
  
  basePrompt += `

Always be encouraging, never condescending. Meet the student where they are.`;
  
  return basePrompt;
}
