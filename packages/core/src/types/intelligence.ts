import { PhonemeCategory, SpeakingScenario, ConversationMessage } from './index.js';

export type PronunciationCompetencyStatus = 'new' | 'developing' | 'improving' | 'stable';

export interface PronunciationFocusItem {
  focus: PhonemeCategory;
  firstObserved: string; // ISO Date
  lastPracticed: string; // ISO Date
  practiceCount: number;
  confidenceLevel: 'low' | 'moderate' | 'high';
  evidence: string;
  status: PronunciationCompetencyStatus;
}

export interface VocabularyBankItem {
  id: string;
  word: string;
  meaning: string;
  pronunciation: string;
  example: string;
  firstSeen: string;
  lastPracticed: string;
  practiceCount: number;
  mastered: boolean;
}

export interface RecurringMistakePattern {
  id: string;
  observedPattern: string;
  naturalAlternative: string;
  explanation: string;
  occurrenceCount: number;
  lastDetected: string;
}

export interface LearningMemory {
  userId: string;
  pronunciationHistory: Record<PhonemeCategory, PronunciationFocusItem>;
  vocabularyBank: VocabularyBankItem[];
  recurringPatterns: RecurringMistakePattern[];
  totalSessionsCompleted: number;
  totalSpeakingMinutes: number;
  lastCoachingInsight?: string;
  updatedAt: string;
}

export interface SpeakingObservedMetrics {
  wordCount: number;
  durationSeconds: number;
  estimatedWpm?: number;
  transcript: string;
  observedFillerWords: string[];
  approximatePacing: 'slow' | 'steady' | 'rapid';
}

export interface SpeakingCoachingFeedback {
  strength: string;
  improvementPoints: string[];
  naturalAlternative: {
    originalContext: string;
    suggestedAlternative: string;
    explanation: string;
  };
  nextPracticeSuggestion: string;
}

export interface SpeakingAnalysisReport {
  promptId: string;
  promptText: string;
  observedMetrics: SpeakingObservedMetrics;
  coachingFeedback: SpeakingCoachingFeedback;
  timestamp: string;
}

export type ConversationMode = 'practice' | 'interview' | 'workplace' | 'free';

export interface PostConversationReview {
  sessionId: string;
  mode: ConversationMode;
  turnsCount: number;
  durationSeconds: number;
  keyStrengths: string[];
  patternsToImprove: string[];
  usefulPhrases: string[];
  vocabularyEncountered: string[];
  nextStepRecommendation: string;
  timestamp: string;
}

export interface ConversationSession {
  id: string;
  mode: ConversationMode;
  scenario: SpeakingScenario;
  messages: ConversationMessage[];
  startedAt: string;
  endedAt?: string;
  isCompleted: boolean;
  review?: PostConversationReview;
}

export interface ProgressAggregateMetrics {
  totalPracticeMinutes: number;
  completedSessionsCount: number;
  currentStreakDays: number;
  longestStreakDays: number;
  weeklyPracticeDistribution: { dayOfWeek: string; minutes: number }[];
  activeFocusSounds: { category: PhonemeCategory; status: PronunciationCompetencyStatus; practiceCount: number }[];
  vocabularyMasteredCount: number;
  speakingConfidenceTrend: string;
  trendInsights: string[];
  hasSufficientData: boolean;
}
