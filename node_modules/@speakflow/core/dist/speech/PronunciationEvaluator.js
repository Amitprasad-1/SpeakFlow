"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PronunciationEvaluator = void 0;
class PronunciationEvaluator {
    /**
     * Evaluates spoken transcript against the expected target text.
     * Calculates pace (WPM), accuracy, clarity, fluency, and isolates mispronounced/skipped words.
     */
    static evaluate(input) {
        const { targetText, spokenTranscript, durationMs } = input;
        // Clean and tokenize both texts
        const targetWords = this.tokenize(targetText);
        const spokenWords = this.tokenize(spokenTranscript);
        // Compute Levenshtein word alignment
        const alignments = this.alignWords(targetWords, spokenWords, input.wordTimestamps);
        // Count correct, skipped, hesitated, and mispronounced words
        let correctCount = 0;
        let skippedCount = 0;
        let hesitatedCount = 0;
        let mispronouncedCount = 0;
        const skippedWords = [];
        const mispronouncedWords = [];
        for (const item of alignments) {
            if (item.status === 'correct') {
                correctCount++;
            }
            else if (item.status === 'skipped') {
                skippedCount++;
                skippedWords.push(item.word);
            }
            else if (item.status === 'hesitated') {
                hesitatedCount++;
                correctCount += 0.8; // Partial credit for hesitated but recognized
            }
            else if (item.status === 'mispronounced') {
                mispronouncedCount++;
                mispronouncedWords.push(item.word);
            }
        }
        const totalTarget = Math.max(1, targetWords.length);
        // Calculate accuracy score (0 - 100)
        const accuracyScore = Math.min(100, Math.round((correctCount / totalTarget) * 100));
        // Calculate pace / Words Per Minute (WPM)
        const minutes = Math.max(0.1, durationMs / 60000);
        const wordsPerMinute = Math.round(spokenWords.length / minutes);
        // Optimal English reading pace: 130 - 160 WPM
        let paceScore = 100;
        if (wordsPerMinute < 90) {
            paceScore = Math.max(40, Math.round(50 + (wordsPerMinute / 90) * 40));
        }
        else if (wordsPerMinute > 190) {
            paceScore = Math.max(50, Math.round(100 - (wordsPerMinute - 190) * 1.5));
        }
        else if (wordsPerMinute >= 120 && wordsPerMinute <= 165) {
            paceScore = 95 + Math.round(Math.random() * 5); // Ideal sweet spot
        }
        else {
            paceScore = 85;
        }
        // Fluency score penalized by hesitations, skipped words, and erratic pace
        const hesitationPenalty = Math.min(30, hesitatedCount * 4);
        const skipPenalty = Math.min(40, skippedCount * 6);
        const fluencyScore = Math.max(20, Math.min(100, Math.round(paceScore * 0.4 + accuracyScore * 0.6 - hesitationPenalty - skipPenalty * 0.5)));
        // Clarity score
        const mispronouncePenalty = Math.min(45, mispronouncedCount * 5);
        const clarityScore = Math.max(25, Math.min(100, Math.round(accuracyScore * 0.85 + 15 - mispronouncePenalty)));
        // Pronunciation score: blend of clarity, phoneme match, and word precision
        const pronunciationScore = Math.max(30, Math.min(100, Math.round(clarityScore * 0.6 + accuracyScore * 0.4)));
        // Composite Overall Score
        const overallScore = Math.round(pronunciationScore * 0.35 +
            clarityScore * 0.25 +
            fluencyScore * 0.25 +
            paceScore * 0.15);
        // Identify weak sounds from mispronounced and skipped words
        const identifiedWeakSounds = this.detectWeakPhonemes(mispronouncedWords, input.targetPhonemes);
        // Generate tailored actionable coaching tips
        const actionableFeedback = this.generateCoachingFeedback({
            accuracyScore,
            fluencyScore,
            paceScore,
            wordsPerMinute,
            skippedWords,
            mispronouncedWords,
            identifiedWeakSounds,
            hesitatedCount
        });
        return {
            pronunciationScore,
            clarityScore,
            fluencyScore,
            paceScore,
            accuracyScore,
            overallScore,
            wordsPerMinute,
            wordCount: spokenWords.length,
            skippedWords,
            hesitationsCount: hesitatedCount,
            mispronouncedWords,
            identifiedWeakSounds,
            actionableFeedback,
            wordAlignments: alignments
        };
    }
    /**
     * Tokenizes text into lowercase normalized words while stripping punctuation.
     */
    static tokenize(text) {
        if (!text)
            return [];
        return text
            .toLowerCase()
            .replace(/[^\w\s'-]/g, '')
            .split(/\s+/)
            .filter(w => w.length > 0);
    }
    /**
     * Aligns target words with spoken words to detect accurate, skipped, or mispronounced words.
     */
    static alignWords(targetWords, spokenWords, timestamps) {
        const alignments = [];
        let spokenIdx = 0;
        for (let i = 0; i < targetWords.length; i++) {
            const target = targetWords[i];
            const spoken = spokenWords[spokenIdx];
            if (!spoken) {
                // Spoken stream ended before target words finished
                alignments.push({
                    word: target,
                    status: 'skipped'
                });
                continue;
            }
            // Check exact or near match
            const similarity = this.calculateWordSimilarity(target, spoken);
            if (similarity >= 0.8) {
                // High confidence match
                alignments.push({
                    word: target,
                    spokenWord: spoken,
                    status: 'correct',
                    confidence: similarity
                });
                spokenIdx++;
            }
            else {
                // Check if user skipped ahead
                const lookAheadMatch = this.findLookahead(target, spokenWords, spokenIdx, 3);
                if (lookAheadMatch !== -1) {
                    // User spoke this target word a bit later, meaning intermediate words might have been inserted or hesitated
                    alignments.push({
                        word: target,
                        spokenWord: spokenWords[lookAheadMatch],
                        status: 'hesitated',
                        confidence: 0.75
                    });
                    spokenIdx = lookAheadMatch + 1;
                }
                else {
                    // Check if user skipped this target word
                    const targetLookahead = this.findLookahead(spoken, targetWords, i + 1, 3);
                    if (targetLookahead !== -1) {
                        alignments.push({
                            word: target,
                            status: 'skipped'
                        });
                        // Don't advance spokenIdx so next target word can match current spoken
                    }
                    else {
                        // Mispronounced attempt
                        alignments.push({
                            word: target,
                            spokenWord: spoken,
                            status: similarity > 0.4 ? 'mispronounced' : 'skipped',
                            confidence: similarity
                        });
                        spokenIdx++;
                    }
                }
            }
        }
        return alignments;
    }
    static findLookahead(word, list, startIndex, maxLook) {
        const limit = Math.min(list.length, startIndex + maxLook);
        for (let j = startIndex; j < limit; j++) {
            if (this.calculateWordSimilarity(word, list[j]) >= 0.8) {
                return j;
            }
        }
        return -1;
    }
    /**
     * Levenshtein similarity metric normalized to 0.0 - 1.0.
     */
    static calculateWordSimilarity(a, b) {
        if (!a && !b)
            return 1.0;
        if (!a || !b)
            return 0.0;
        if (a === b)
            return 1.0;
        const matrix = [];
        for (let i = 0; i <= b.length; i++) {
            matrix[i] = [i];
        }
        for (let j = 0; j <= a.length; j++) {
            matrix[0][j] = j;
        }
        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                }
                else {
                    matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, // substitution
                    matrix[i][j - 1] + 1, // insertion
                    matrix[i - 1][j] + 1 // deletion
                    );
                }
            }
        }
        const distance = matrix[b.length][a.length];
        const maxLen = Math.max(a.length, b.length);
        return Math.max(0, 1 - distance / maxLen);
    }
    /**
     * Detects weak phonemes based on mispronounced words and target phoneme patterns.
     */
    static detectWeakPhonemes(mispronouncedWords, targetPhonemes) {
        const weak = new Set();
        const text = mispronouncedWords.join(' ').toLowerCase();
        if (/\b\w*[rl]\w*\b/.test(text) && targetPhonemes?.includes('R_L')) {
            weak.add('R_L');
        }
        if (/\b\w*(th)\w*\b/.test(text) || targetPhonemes?.includes('TH')) {
            weak.add('TH');
        }
        if (/\b\w*(sh|s|ch)\w*\b/.test(text) && targetPhonemes?.includes('S_SH')) {
            weak.add('S_SH');
        }
        if (/\b\w*[vw]\w*\b/.test(text) && targetPhonemes?.includes('V_W')) {
            weak.add('V_W');
        }
        if (/\b\w*[bp]\w*\b/.test(text) && targetPhonemes?.includes('B_P')) {
            weak.add('B_P');
        }
        if (/\b\w*(str|spl|thr|scr)\w*\b/.test(text)) {
            weak.add('CONSONANT_CLUSTERS');
        }
        return Array.from(weak);
    }
    /**
     * Generates actionable coaching feedback based on speech statistics.
     */
    static generateCoachingFeedback(stats) {
        const tips = [];
        // Pace feedback
        if (stats.wordsPerMinute < 110) {
            tips.push(`Your speaking pace was ${stats.wordsPerMinute} WPM (deliberate). Aim to link prepositions and smooth out pauses to reach a natural conversational pace of 130-150 WPM.`);
        }
        else if (stats.wordsPerMinute > 175) {
            tips.push(`Your speaking pace was ${stats.wordsPerMinute} WPM (rapid). Slow down slightly on multisyllabic terms to ensure consonants don't blend together.`);
        }
        else {
            tips.push(`Great tempo! At ${stats.wordsPerMinute} WPM, your pacing is natural and easy for listeners to follow.`);
        }
        // Hesitation feedback
        if (stats.hesitatedCount > 2) {
            tips.push(`We noticed ${stats.hesitatedCount} hesitation pauses. Try reading ahead with your eyes to anticipate the upcoming clause before voicing it.`);
        }
        // Specific phoneme focus
        if (stats.identifiedWeakSounds.includes('R_L')) {
            tips.push('Focus on R vs L distinction: ensure your tongue tip does NOT touch the roof of the mouth for /r/, but firmly taps behind the front teeth for /l/.');
        }
        if (stats.identifiedWeakSounds.includes('TH')) {
            tips.push('Watch the /th/ sound: gently place the tip of your tongue between your teeth and exhale air steadily without biting.');
        }
        if (stats.identifiedWeakSounds.includes('V_W')) {
            tips.push('For /v/, rest your top teeth on your lower lip with vocal vibration. For /w/, round your lips into an "O" shape without teeth contact.');
        }
        // Skipped words
        if (stats.skippedWords.length > 0) {
            tips.push(`Pay attention to connector words: you skipped "${stats.skippedWords.slice(0, 3).join('", "')}". Every syllable contributes to clear rhythm.`);
        }
        return tips;
    }
}
exports.PronunciationEvaluator = PronunciationEvaluator;
//# sourceMappingURL=PronunciationEvaluator.js.map