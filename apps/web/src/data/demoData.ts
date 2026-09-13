/**
 * Centralized Demo Data Layer for SpeakFlow
 * Structured to cleanly swap with real user and session data from @speakflow/core later.
 */

export interface UserProfileData {
  id: string;
  name: string;
  level: string;
  dailyGoalMinutes: number;
  avatarInitials: string;
  goals: string[];
}

export interface LessonStage {
  number: number;
  title: string;
  description: string;
  category: string;
  duration: string;
  completed: boolean;
}

export interface DailyLessonData {
  id: string;
  title: string;
  focusSound: string;
  stageProgress: string;
  durationEstimate: string;
  coachNote: string;
  currentStage: number;
  totalStages: number;
  stages: LessonStage[];
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  todayCompleted: boolean;
}

export interface SoundMatrixItem {
  sound: string;
  status: 'Needs Practice' | 'Developing' | 'Confident';
  score: number;
}

export interface ProgressSummaryData {
  pronunciationScore: number;
  fluencyScore: number;
  speakingPaceWpm: number;
  minutesPracticedToday: number;
  totalMinutesPracticed: number;
  completedSessionsCount: number;
  skills: {
    label: string;
    score: number;
    description: string;
  }[];
  soundMatrix: SoundMatrixItem[];
  frequentWords: string[];
}

export interface VocabularyItem {
  word: string;
  ipa: string;
  syllables: string;
  definition: string;
  partOfSpeech: string;
}

/* --------------------------------------------------------------------------
   Default Demo User Profile
   -------------------------------------------------------------------------- */
export const demoUser: UserProfileData = {
  id: 'usr_demo_01',
  name: 'Learner', // Neutral customizable demo profile name
  level: 'Intermediate (B2)',
  dailyGoalMinutes: 15,
  avatarInitials: 'SF',
  goals: [
    'Job Interview Communication',
    'Workplace Presentations',
    'Pronunciation Clarity',
    'Conversational Fluency'
  ]
};

/* --------------------------------------------------------------------------
   Today's Practice Lesson
   -------------------------------------------------------------------------- */
export const demoDailyLesson: DailyLessonData = {
  id: 'lesson_today_rl',
  title: 'R and L Clarity & Natural Flow',
  focusSound: 'R / L',
  stageProgress: 'Stage 1 of 6',
  durationEstimate: '15 mins',
  coachNote: "Today's practice focuses on distinguishing R and L sounds cleanly and maintaining a steady pace through longer sentences.",
  currentStage: 1,
  totalStages: 6,
  stages: [
    {
      number: 1,
      title: 'Vocal Warm-Up',
      description: 'Gentle lip and tongue exercises to prepare your voice.',
      category: 'Warm-Up',
      duration: '3 mins',
      completed: false
    },
    {
      number: 2,
      title: 'Tongue Twisters',
      description: 'Practice alternating between R and L sounds with clarity.',
      category: 'Pronunciation',
      duration: '2 mins',
      completed: false
    },
    {
      number: 3,
      title: 'Reading Aloud',
      description: 'Read a short passage at a natural conversational tempo.',
      category: 'Reading',
      duration: '4 mins',
      completed: false
    },
    {
      number: 4,
      title: 'Practical Sentences',
      description: 'Common workplace sentences with helpful pronunciation tips.',
      category: 'Workplace',
      duration: '3 mins',
      completed: false
    },
    {
      number: 5,
      title: 'Speaking Practice',
      description: 'Practice answering a realistic workplace discussion prompt.',
      category: 'Conversation',
      duration: '4 mins',
      completed: false
    },
    {
      number: 6,
      title: 'Listening Exercise',
      description: 'Listen to a natural dialogue and check your comprehension.',
      category: 'Listening',
      duration: '3 mins',
      completed: false
    }
  ]
};

/* --------------------------------------------------------------------------
   Streak Data
   -------------------------------------------------------------------------- */
export const demoStreak: StreakData = {
  currentStreak: 4,
  longestStreak: 12,
  todayCompleted: false
};

/* --------------------------------------------------------------------------
   Progress & Analytics Demo Data
   -------------------------------------------------------------------------- */
export const demoProgress: ProgressSummaryData = {
  pronunciationScore: 78,
  fluencyScore: 70,
  speakingPaceWpm: 138,
  minutesPracticedToday: 0,
  totalMinutesPracticed: 85,
  completedSessionsCount: 6,
  skills: [
    { label: 'Pronunciation Clarity', score: 78, description: 'Good progress' },
    { label: 'Speaking Rhythm & Pacing', score: 70, description: 'Focus area' },
    { label: 'Reading Aloud Flow', score: 82, description: 'Consistent' },
    { label: 'Listening Comprehension', score: 85, description: 'Strong' },
    { label: 'Practical Vocabulary', score: 74, description: 'Building steadily' }
  ],
  soundMatrix: [
    { sound: 'R / L', status: 'Needs Practice', score: 56 },
    { sound: 'TH Sounds', status: 'Needs Practice', score: 62 },
    { sound: 'S / SH', status: 'Developing', score: 75 },
    { sound: 'V / W', status: 'Confident', score: 84 },
    { sound: 'B / P', status: 'Confident', score: 88 },
    { sound: 'Consonant Clusters', status: 'Developing', score: 68 },
    { sound: 'CH / J', status: 'Confident', score: 86 },
    { sound: 'Connected Speech', status: 'Developing', score: 71 }
  ],
  frequentWords: [
    'literally',
    'regularly',
    'thoroughly',
    'clarify',
    'collaboration',
    'deliverable'
  ]
};

/* --------------------------------------------------------------------------
   Word of the Day
   -------------------------------------------------------------------------- */
export const demoWordOfTheDay: VocabularyItem = {
  word: 'articulation',
  ipa: '/ɑːˌtɪk.jʊˈleɪ.ʃən/',
  syllables: 'ar-tic-u-la-tion',
  definition: 'The clear and distinct formation of sounds in speech, making your words easy to understand.',
  partOfSpeech: 'noun'
};
