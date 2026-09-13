import { PhonemeCategory } from './speech.js';
export type EnglishGoal = 'Speaking' | 'Pronunciation' | 'Fluency' | 'Reading' | 'Listening' | 'Interview English' | 'Workplace English';
export type EnglishLevel = 'Beginner' | 'Elementary' | 'Intermediate' | 'Upper Intermediate' | 'Advanced';
export type DailyPracticeMinutes = 5 | 10 | 15 | 20 | 30;
export interface PhonemeSkillStatus {
    category: PhonemeCategory;
    accuracy: number;
    attemptsCount: number;
    status: 'weak' | 'average' | 'strong';
    lastPracticed?: string;
}
export interface UserSkillProfile {
    speakingScore: number;
    pronunciationScore: number;
    fluencyScore: number;
    readingScore: number;
    listeningScore: number;
    vocabularyScore: number;
    grammarScore: number;
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
        lastPracticeDate: string;
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
//# sourceMappingURL=user.d.ts.map