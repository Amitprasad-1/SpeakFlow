import { PhonemeCategory, SpeechFeedback } from './speech.js';
import { EnglishLevel } from './user.js';

export type VocalExerciseType =
  | 'lip_trill'
  | 'tongue_trill'
  | 'straw_phonation'
  | 'humming'
  | 'sirens';

export interface VocalExercise {
  id: string;
  type: VocalExerciseType;
  title: string;
  subtitle: string;
  instructions: string[];
  durationSeconds: number;
  pitchDirection: 'steady' | 'ascending' | 'descending' | 'siren_wave' | 'glide';
  audioPromptUrl?: string;
  targetFrequencyHz?: number;
  benefits: string;
}

export interface TongueTwister {
  id: string;
  category: PhonemeCategory;
  text: string;
  difficulty: 'easy' | 'medium' | 'hard';
  focusSound: string;
  phoneticBreakdown: string;
  audioExampleUrl?: string;
  targetWpm: number;
  tip: string;
}

export interface VocabularyWord {
  id: string;
  word: string;
  phoneticIpa: string;
  syllableBreakdown: string; // e.g., "ar-tic-u-la-tion"
  primaryStressSyllable: number; // 1-indexed
  definition: string;
  partOfSpeech: string;
  exampleInPassage: string;
  collocations: string[];
  audioExampleUrl?: string;
  targetPhoneme?: PhonemeCategory;
}

export type PassageTopic =
  | 'Technology'
  | 'Science'
  | 'AI'
  | 'Nature'
  | 'Travel'
  | 'Space'
  | 'Environment'
  | 'Career'
  | 'Workplace'
  | 'Daily life'
  | 'Communication'
  | 'Psychology'
  | 'Interesting facts'
  | 'Professional life';

export interface ReadingPassage {
  id: string;
  title: string;
  topic: PassageTopic;
  passageText: string;
  wordCount: number; // Strictly between 160 and 200 words
  cefrLevel: 'B1' | 'B2' | 'C1';
  targetPhonemes: PhonemeCategory[];
  vocabularyWords: VocabularyWord[]; // Exactly 6 multisyllabic articulation words
  audioPromptUrl?: string;
  suggestedDurationSeconds: number;
}

export interface PracticeSentence {
  id: string;
  text: string;
  focusPhoneme: PhonemeCategory;
  contextCategory: 'Workplace' | 'Casual' | 'Presentation' | 'Interview';
  phoneticNotes: string;
  recommendedPauseIndices: number[]; // Character or word boundaries
  audioExampleUrl?: string;
}

export type SpeakingScenarioCategory =
  | 'job_interview'
  | 'hr_interview'
  | 'workplace_conversation'
  | 'talking_to_colleague'
  | 'asking_for_help'
  | 'giving_project_update'
  | 'meeting_discussion'
  | 'presentation'
  | 'customer_interaction'
  | 'phone_conversation'
  | 'daily_conversation';

export interface SpeakingScenario {
  id: string;
  category: SpeakingScenarioCategory;
  title: string;
  roleAi: string;
  roleUser: string;
  contextDescription: string;
  goal: string;
  sampleStarterPrompt: string;
  initialMessage: string;
}

export interface ConversationMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  audioUrl?: string;
  feedback?: {
    grammarCorrection?: string;
    naturalAlternative?: string;
    fluencyObservation?: string;
  };
}

export interface SpeakingEvaluationReport {
  overallScore: number;
  fluencyScore: number;
  grammarScore: number;
  vocabularyScore: number;
  pronunciationScore: number;
  sentenceStructureScore: number;
  naturalnessScore: number;
  confidenceScore: number;
  keyStrengths: string[];
  areasForImprovement: string[];
  correctionsAndAlternatives: {
    original: string;
    naturalAlternative: string;
    explanation: string;
  }[];
}

export interface ListeningExercise {
  id: string;
  title: string;
  scenario: string;
  dialogueTranscript: string;
  audioPromptUrl?: string;
  speakers: { name: string; accent: string }[];
  durationSeconds: number;
  questions: {
    id: string;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}

export interface DailyLesson {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  themeTopic: PassageTopic;
  primaryFocusPhoneme: PhonemeCategory;
  secondaryFocusPhoneme: PhonemeCategory;
  targetLevel: EnglishLevel;
  vocalWarmups: VocalExercise[];
  tongueTwisters: TongueTwister[];
  readingPassage: ReadingPassage;
  practicalSentences: PracticeSentence[]; // 10-15 sentences
  speakingChallenge: SpeakingScenario;
  listeningExercise: ListeningExercise;
  isCompleted: boolean;
  score?: number;
}

export interface SessionResult {
  lessonId: string;
  date: string;
  vocalCompleted: boolean;
  twisterScores: Record<string, SpeechFeedback>;
  readingFeedback?: SpeechFeedback;
  sentenceScores: Record<string, SpeechFeedback>;
  speakingReport?: SpeakingEvaluationReport;
  listeningScore: number; // 0-100
  totalPracticeMinutes: number;
  compositeScore: number;
}
