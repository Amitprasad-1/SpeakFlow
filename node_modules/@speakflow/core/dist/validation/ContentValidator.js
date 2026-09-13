"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentValidator = void 0;
class ContentValidator {
    /**
     * Strictly counts words in a text passage using standard whitespace/word boundaries.
     */
    static countWords(text) {
        if (!text || typeof text !== 'string')
            return 0;
        const cleaned = text.trim();
        if (!cleaned)
            return 0;
        // Split by whitespace while filtering out empty entries
        return cleaned.split(/\s+/).filter(Boolean).length;
    }
    /**
     * Validates a reading passage according to strict product requirements:
     * 1. Word count must be strictly between 160 and 200 words.
     * 2. Must contain compound or complex sentences with natural punctuation.
     * 3. Must contain exactly 6 articulation-heavy multisyllabic vocabulary words.
     * 4. Vocabulary words must appear within the passage.
     */
    static validateReadingPassage(passage) {
        const errors = [];
        const warnings = [];
        if (!passage) {
            return { isValid: false, errors: ['Passage object is null or undefined.'], warnings: [] };
        }
        // 1. Strict Word Count Check (160 - 200 words)
        const wordCount = this.countWords(passage.passageText);
        if (wordCount < 160 || wordCount > 200) {
            errors.push(`Reading passage word count violation: expected 160-200 words, but received ${wordCount} words.`);
        }
        // 2. Vocabulary Count Check (Strictly 6 words)
        if (!passage.vocabularyWords || !Array.isArray(passage.vocabularyWords)) {
            errors.push('Vocabulary words list is missing or not an array.');
        }
        else if (passage.vocabularyWords.length !== 6) {
            errors.push(`Vocabulary count violation: expected exactly 6 articulation words, received ${passage.vocabularyWords.length}.`);
        }
        else {
            // Validate each vocabulary item
            passage.vocabularyWords.forEach((vocab, idx) => {
                const vocabResult = this.validateVocabularyWord(vocab);
                if (!vocabResult.isValid) {
                    errors.push(`Vocabulary word #${idx + 1} (${vocab.word || 'unknown'}) invalid: ${vocabResult.errors.join(', ')}`);
                }
                // Check if word appears in passage text (case-insensitive root search)
                if (vocab.word && passage.passageText) {
                    const root = vocab.word.toLowerCase().replace(/ing$|ed$|s$|es$/, '');
                    const inPassage = passage.passageText.toLowerCase().includes(root);
                    if (!inPassage) {
                        warnings.push(`Vocabulary word "${vocab.word}" could not be confirmed in passage text.`);
                    }
                }
            });
        }
        // 3. Sentence Structure & Punctuation Check
        const sentences = passage.passageText
            ? passage.passageText.split(/[.!?]+/).map(s => s.trim()).filter(Boolean)
            : [];
        if (sentences.length < 5) {
            warnings.push(`Passage has only ${sentences.length} sentences. Recommended: at least 6-10 compound/complex sentences.`);
        }
        // Check for natural commas (indicating compound/complex clauses)
        const commaCount = (passage.passageText.match(/,/g) || []).length;
        if (commaCount < 4) {
            warnings.push(`Passage has few natural pauses/commas (${commaCount}). Compound sentences recommended.`);
        }
        // 4. Safety & Tone check
        const safetyCheck = this.checkContentSafety(passage.passageText);
        if (!safetyCheck.isValid) {
            errors.push(...safetyCheck.errors);
        }
        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }
    /**
     * Validates individual multisyllabic vocabulary item.
     */
    static validateVocabularyWord(vocab) {
        const errors = [];
        const warnings = [];
        if (!vocab.word || vocab.word.trim().length === 0) {
            errors.push('Vocabulary word is empty.');
        }
        if (!vocab.phoneticIpa || !vocab.phoneticIpa.includes('/')) {
            warnings.push(`Phonetic IPA guide might be missing or unformatted for "${vocab.word}".`);
        }
        if (!vocab.syllableBreakdown || !vocab.syllableBreakdown.includes('-')) {
            warnings.push(`Syllable breakdown should contain hyphens (e.g. "ar-tic-u-late") for "${vocab.word}".`);
        }
        if (!vocab.definition || vocab.definition.trim().length < 5) {
            errors.push(`Definition is missing or too short for "${vocab.word}".`);
        }
        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }
    /**
     * Validates practical sentences (must have 10-15 sentences).
     */
    static validateSentences(sentences) {
        const errors = [];
        const warnings = [];
        if (!sentences || !Array.isArray(sentences)) {
            errors.push('Sentences list is not an array.');
        }
        else if (sentences.length < 10 || sentences.length > 15) {
            errors.push(`Sentence count violation: expected 10-15 practical sentences, received ${sentences.length}.`);
        }
        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }
    /**
     * Validates an entire Daily Lesson payload.
     */
    static validateDailyLesson(lesson) {
        const errors = [];
        const warnings = [];
        if (!lesson.title)
            errors.push('Lesson title is required.');
        if (!lesson.vocalWarmups || lesson.vocalWarmups.length < 4) {
            errors.push('Lesson must contain at least 4-5 vocal warmup exercises.');
        }
        if (!lesson.tongueTwisters || lesson.tongueTwisters.length === 0) {
            errors.push('Lesson must contain tongue twister exercises.');
        }
        // Validate reading passage
        const passageValidation = this.validateReadingPassage(lesson.readingPassage);
        if (!passageValidation.isValid) {
            errors.push(...passageValidation.errors);
        }
        warnings.push(...passageValidation.warnings);
        // Validate sentences (10-15)
        const sentencesValidation = this.validateSentences(lesson.practicalSentences);
        if (!sentencesValidation.isValid) {
            errors.push(...sentencesValidation.errors);
        }
        // Validate speaking scenario & listening exercise
        if (!lesson.speakingChallenge || !lesson.speakingChallenge.initialMessage) {
            errors.push('Speaking challenge is incomplete.');
        }
        if (!lesson.listeningExercise || !lesson.listeningExercise.dialogueTranscript) {
            errors.push('Listening exercise is incomplete.');
        }
        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }
    /**
     * Basic safety guardrail ensuring content is professional, clean, and educational.
     */
    static checkContentSafety(text) {
        const errors = [];
        if (!text)
            return { isValid: true, errors: [], warnings: [] };
        const offensiveRegex = /\b(profanity|hate|slur|explicit)\b/i;
        if (offensiveRegex.test(text)) {
            errors.push('Content contains restricted or inappropriate language.');
        }
        return {
            isValid: errors.length === 0,
            errors,
            warnings: []
        };
    }
}
exports.ContentValidator = ContentValidator;
//# sourceMappingURL=ContentValidator.js.map