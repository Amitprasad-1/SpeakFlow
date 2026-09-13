import { PhonemeCategory } from '../types/speech.js';
export interface BaselineSpeakingPrompt {
    id: string;
    title: string;
    promptText: string;
    guideQuestion: string;
    recommendedDurationSeconds: number;
}
export interface BaselineReadingPassage {
    id: string;
    title: string;
    passageText: string;
    wordCount: number;
    keyTargetPhonemes: PhonemeCategory[];
}
export interface BaselinePronunciationPair {
    id: string;
    soundGroup: PhonemeCategory;
    groupLabel: string;
    wordA: string;
    wordB: string;
    focusTip: string;
}
export interface BaselineVocalWarmup {
    id: string;
    title: string;
    description: string;
    instruction: string;
    durationSeconds: number;
}
export declare const BASELINE_SPEAKING_PROMPTS: BaselineSpeakingPrompt[];
export declare const BASELINE_READING_PASSAGE: BaselineReadingPassage;
export declare const BASELINE_PRONUNCIATION_PAIRS: BaselinePronunciationPair[];
export declare const BASELINE_VOCAL_WARMUPS: BaselineVocalWarmup[];
//# sourceMappingURL=baselineCatalogs.d.ts.map