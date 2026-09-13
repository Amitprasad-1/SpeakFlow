import { PhonemeCategory, SpeechFeedback } from './speech.js';
import { EnglishLevel } from './user.js';
export type VocalExerciseType = 'lip_trill' | 'tongue_trill' | 'straw_phonation' | 'humming' | 'sirens';
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
    syllableBreakdown: string;
    primaryStressSyllable: number;
    definition: string;
    partOfSpeech: string;
    exampleInPassage: string;
    collocations: string[];
    audioExampleUrl?: string;
    targetPhoneme?: PhonemeCategory;
}
export type PassageTopic = 'Technology' | 'Science' | 'AI' | 'Nature' | 'Travel' | 'Space' | 'Environment' | 'Career' | 'Workplace' | 'Daily life' | 'Communication' | 'Psychology' | 'Interesting facts' | 'Professional life';
export interface ReadingPassage {
    id: string;
    title: string;
    topic: PassageTopic;
    passageText: string;
    wordCount: number;
    cefrLevel: 'B1' | 'B2' | 'C1';
    targetPhonemes: PhonemeCategory[];
    vocabularyWords: VocabularyWord[];
    audioPromptUrl?: string;
    suggestedDurationSeconds: number;
}
export interface PracticeSentence {
    id: string;
    text: string;
    focusPhoneme: PhonemeCategory;
    contextCategory: 'Workplace' | 'Casual' | 'Presentation' | 'Interview';
    phoneticNotes: string;
    recommendedPauseIndices: number[];
    audioExampleUrl?: string;
}
export type SpeakingScenarioCategory = 'job_interview' | 'hr_interview' | 'workplace_conversation' | 'talking_to_colleague' | 'asking_for_help' | 'giving_project_update' | 'meeting_discussion' | 'presentation' | 'customer_interaction' | 'phone_conversation' | 'daily_conversation';
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
    speakers: {
        name: string;
        accent: string;
    }[];
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
    date: string;
    title: string;
    themeTopic: PassageTopic;
    primaryFocusPhoneme: PhonemeCategory;
    secondaryFocusPhoneme: PhonemeCategory;
    targetLevel: EnglishLevel;
    vocalWarmups: VocalExercise[];
    tongueTwisters: TongueTwister[];
    readingPassage: ReadingPassage;
    practicalSentences: PracticeSentence[];
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
    listeningScore: number;
    totalPracticeMinutes: number;
    compositeScore: number;
}
export type PracticeSessionStatus = 'not_started' | 'in_progress' | 'completed' | 'skipped';
export type StageType = 'vocal_warmup' | 'tongue_twisters' | 'reading_aloud' | 'practical_sentences' | 'speaking_practice' | 'listening_exercise';
export interface DailyPracticeStage {
    stageNumber: number;
    type: StageType;
    title: string;
    shortDescription: string;
    estimatedMinutes: number;
    isCompleted: boolean;
    isSkipped: boolean;
    data: VocalWarmupStageData | TongueTwisterStageData | ReadingStageData | SentencesStageData | SpeakingStageData | ListeningStageData;
    result?: any;
}
export interface VocalWarmupStageData {
    exercises: VocalExercise[];
}
export interface TongueTwisterStageData {
    twisters: TongueTwister[];
}
export interface ReadingStageData {
    passage: ReadingPassage;
}
export interface SentencesStageData {
    sentences: PracticeSentence[];
    category: string;
}
export interface SpeakingStageData {
    prompts: SpeakingScenario[];
    mode: 'guided' | 'free';
}
export interface ListeningStageData {
    exercise: ListeningExercise;
}
export interface DailyPracticeSession {
    sessionId: string;
    userId: string;
    localDate: string;
    createdAt: string;
    lessonTitle: string;
    lessonTheme: string;
    estimatedDuration: number;
    focusAreas: string[];
    focusSounds: PhonemeCategory[];
    stages: DailyPracticeStage[];
    currentStageIndex: number;
    status: PracticeSessionStatus;
    startedAt?: string;
    completedAt?: string;
    totalElapsedSeconds: number;
    completionPercentage: number;
    stageResults: Record<number, any>;
    notes?: string;
}
//# sourceMappingURL=lesson.d.ts.map