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

export type PracticeSessionStatus = 'not_started' | 'in_progress' | 'completed' | 'skipped';

export type StageType =
  | 'vocal_warmup'
  | 'tongue_twisters'
  | 'reading_aloud'
  | 'practical_sentences'
  | 'speaking_practice'
  | 'listening_exercise';

export interface DailyPracticeStage {
  stageNumber: number; // 1 to 6
  type: StageType;
  title: string;
  shortDescription: string;
  estimatedMinutes: number;
  isCompleted: boolean;
  isSkipped: boolean;
  data:
    | VocalWarmupStageData
    | TongueTwisterStageData
    | ReadingStageData
    | SentencesStageData
    | SpeakingStageData
    | ListeningStageData;
  result?: any;
}

export interface VocalWarmupStageData {
  exercises: VocalExercise[]; // strictly 2 to 3 selected exercises
}

export interface TongueTwisterStageData {
  twisters: TongueTwister[]; // strictly 3 to 5 selected twisters
}

export interface ReadingStageData {
  passage: ReadingPassage; // strictly 160-200 words with 6 vocabulary items
}

export interface SentencesStageData {
  sentences: PracticeSentence[]; // strictly 10-15 sentences
  category: string;
}

export interface SpeakingStageData {
  prompts: SpeakingScenario[]; // strictly 1-3 prompts
  mode: 'guided' | 'free';
}

export interface ListeningStageData {
  exercise: ListeningExercise; // 1 dialogue with 2-3 comprehension questions
}

export interface DailyPracticeSession {
  sessionId: string;
  userId: string;
  localDate: string; // YYYY-MM-DD
  createdAt: string;
  lessonTitle: string;
  lessonTheme: string;
  estimatedDuration: number; // in minutes (default 15)
  focusAreas: string[];
  focusSounds: PhonemeCategory[];
  stages: DailyPracticeStage[];
  currentStageIndex: number; // 0 to 5
  status: PracticeSessionStatus;
  startedAt?: string;
  completedAt?: string;
  totalElapsedSeconds: number;
  completionPercentage: number;
  stageResults: Record<number, any>;
  notes?: string;
}

