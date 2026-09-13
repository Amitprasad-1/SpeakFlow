import { PhonemeCategory } from './speech.js';

export type EnglishGoal =
  | 'Speaking'
  | 'Pronunciation'
  | 'Fluency'
  | 'Reading'
  | 'Listening'
  | 'Interview English'
  | 'Workplace English';

export type EnglishLevel =
  | 'Beginner'
  | 'Elementary'
  | 'Intermediate'
  | 'Upper Intermediate'
  | 'Advanced';

export type DailyPracticeMinutes = 5 | 10 | 15 | 20 | 30;

export interface PhonemeSkillStatus {
  category: PhonemeCategory;
  accuracy: number; // 0-100
  attemptsCount: number;
  status: 'weak' | 'average' | 'strong';
  lastPracticed?: string; // ISO date
}

export interface UserSkillProfile {
  speakingScore: number;      // 0-100
  pronunciationScore: number; // 0-100
  fluencyScore: number;       // 0-100
  readingScore: number;       // 0-100
  listeningScore: number;     // 0-100
  vocabularyScore: number;    // 0-100
  grammarScore: number;       // 0-100
  weakSounds: PhonemeCategory[];
  soundSkills: Record<PhonemeCategory, PhonemeSkillStatus>;
  frequentlyMispronouncedWords: string[];
  vocabularyMastered: string[];
}

export interface UserProfile {
  id: string;
  name: string;
  avatar?: string;
  goals: EnglishGoal[];
  level: EnglishLevel;
  dailyGoalMinutes: DailyPracticeMinutes;
  createdAt: string;
  isOnboarded: boolean;
  baselineAssessmentCompleted: boolean;
  skills: UserSkillProfile;
  streak: {
    currentStreak: number;
    longestStreak: number;
    lastPracticeDate: string; // YYYY-MM-DD
  };
  totalMinutesPracticed: number;
  completedLessonsCount: number;
  assessmentId?: string;
  preferredLanguage?: string;
  communicationContexts?: string[];
  speakingConfidence?: string;
  strengthsSummary?: string[];
  focusAreasSummary?: string[];
}
