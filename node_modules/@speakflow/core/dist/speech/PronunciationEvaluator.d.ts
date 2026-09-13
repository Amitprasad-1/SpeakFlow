import { SpeechEvaluationInput, SpeechFeedback } from '../types/index.js';
export declare class PronunciationEvaluator {
    /**
     * Evaluates spoken transcript against the expected target text.
     * Calculates pace (WPM), accuracy, clarity, fluency, and isolates mispronounced/skipped words.
     */
    static evaluate(input: SpeechEvaluationInput): SpeechFeedback;
    /**
     * Tokenizes text into lowercase normalized words while stripping punctuation.
     */
    static tokenize(text: string): string[];
    /**
     * Aligns target words with spoken words to detect accurate, skipped, or mispronounced words.
     */
    private static alignWords;
    private static findLookahead;
    /**
     * Levenshtein similarity metric normalized to 0.0 - 1.0.
     */
    static calculateWordSimilarity(a: string, b: string): number;
    /**
     * Detects weak phonemes based on mispronounced words and target phoneme patterns.
     */
    private static detectWeakPhonemes;
    /**
     * Generates actionable coaching feedback based on speech statistics.
     */
    private static generateCoachingFeedback;
}
//# sourceMappingURL=PronunciationEvaluator.d.ts.map