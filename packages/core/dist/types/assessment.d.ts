import { PhonemeCategory } from './speech.js';
import { DailyPracticeMinutes } from './user.js';
export type CommunicationContext = 'daily_life' | 'college' | 'job_interviews' | 'workplace' | 'meetings' | 'presentations' | 'customer_support' | 'travel' | 'talking_with_colleagues' | 'talking_with_strangers';
export type SpeakingConfidenceLevel = 'very_uncomfortable' | 'a_little_uncomfortable' | 'okay' | 'comfortable' | 'very_comfortable';
export type SelfReportedLevel = 'Beginner' | 'Elementary' | 'Intermediate' | 'Upper Intermediate' | 'Advanced' | 'Not sure';
export type PracticeDurationChoice = DailyPracticeMinutes | 'undecided';
export interface MetricObservation<T> {
    status: 'observed' | 'estimated' | 'unavailable';
    value: T;
    confidence?: number;
    note?: string;
}
export interface SpeakingAssessmentResult {
    promptId: string;
    promptText: string;
    transcript: MetricObservation<string>;
    durationMs: MetricObservation<number>;
    wordsPerMinute: MetricObservation<number>;
    wordCount: MetricObservation<number>;
    pausesDetected: MetricObservation<number>;
    fillerHesitations: MetricObservation<string[]>;
    observedStrengths: string[];
    observedOpportunities: string[];
}
export interface ReadingAssessmentResult {
    passageId: string;
    passageTitle: string;
    totalWords: number;
    wordsRead: MetricObservation<number>;
    wordsSkipped: MetricObservation<string[]>;
    approximatePaceWpm: MetricObservation<number>;
    durationMs: MetricObservation<number>;
    completionRate: MetricObservation<number>;
    observedStrengths: string[];
    observedOpportunities: string[];
}
export interface PronunciationItemResult {
    soundGroup: PhonemeCategory;
    targetPair: [string, string];
    targetWords: string[];
    transcript: MetricObservation<string>;
    matchStatus: MetricObservation<'matched' | 'developing' | 'unclear'>;
    attemptNumber: number;
}
export interface PronunciationAssessmentResult {
    items: PronunciationItemResult[];
    testedSoundGroups: PhonemeCategory[];
    priorityFocusSounds: PhonemeCategory[];
}
export interface RecommendedPracticePlan {
    durationMinutes: number;
    activitiesCount: number;
    primarySound: PhonemeCategory;
    secondarySound: PhonemeCategory;
    activitiesSummary: string[];
}
export interface BaselineAssessment {
    assessmentId: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
    completedAt?: string;
    status: 'not_started' | 'in_progress' | 'completed' | 'skipped';
    currentStep: number;
    name: string;
    preferredLanguage: string;
    selfReportedLevel: SelfReportedLevel;
    goals: string[];
    contexts: CommunicationContext[];
    dailyPracticePreference: PracticeDurationChoice;
    speakingConfidence: SpeakingConfidenceLevel;
    vocalWarmupCompleted?: boolean;
    speakingAssessment?: SpeakingAssessmentResult;
    readingAssessment?: ReadingAssessmentResult;
    pronunciationAssessment?: PronunciationAssessmentResult;
    observations: string[];
    estimatedStrengths: string[];
    estimatedWeaknesses: string[];
    recommendedFocusAreas: string[];
    recommendedDailyPlan?: RecommendedPracticePlan;
}
//# sourceMappingURL=assessment.d.ts.map