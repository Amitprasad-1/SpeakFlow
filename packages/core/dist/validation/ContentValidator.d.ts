import { ReadingPassage, DailyLesson, VocabularyWord, PracticeSentence } from '../types/index.js';
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}
export declare class ContentValidator {
    /**
     * Strictly counts words in a text passage using standard whitespace/word boundaries.
     */
    static countWords(text: string): number;
    /**
     * Validates a reading passage according to strict product requirements:
     * 1. Word count must be strictly between 160 and 200 words.
     * 2. Must contain compound or complex sentences with natural punctuation.
     * 3. Must contain exactly 6 articulation-heavy multisyllabic vocabulary words.
     * 4. Vocabulary words must appear within the passage.
     */
    static validateReadingPassage(passage: ReadingPassage): ValidationResult;
    /**
     * Validates individual multisyllabic vocabulary item.
     */
    static validateVocabularyWord(vocab: VocabularyWord): ValidationResult;
    /**
     * Validates practical sentences (must have 10-15 sentences).
     */
    static validateSentences(sentences: PracticeSentence[]): ValidationResult;
    /**
     * Validates an entire Daily Lesson payload.
     */
    static validateDailyLesson(lesson: DailyLesson): ValidationResult;
    /**
     * Validates an entire Daily Practice Session (PROMPT 4 standards).
     */
    static validateDailyPracticeSession(session: any): ValidationResult;
    /**
     * Basic safety guardrail ensuring content is professional, clean, and educational.
     */
    private static checkContentSafety;
}
//# sourceMappingURL=ContentValidator.d.ts.map