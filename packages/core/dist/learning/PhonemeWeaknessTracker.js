"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhonemeWeaknessTracker = void 0;
class PhonemeWeaknessTracker {
    /**
     * Updates user skill profile dynamically after a practice session.
     */
    static updateProfileFromSession(profile, result) {
        const updated = JSON.parse(JSON.stringify(profile));
        // 1. Update Reading & Pronunciation Scores
        if (result.readingFeedback) {
            const fb = result.readingFeedback;
            updated.readingScore = Math.round(updated.readingScore * 0.6 + fb.accuracyScore * 0.4);
            updated.fluencyScore = Math.round(updated.fluencyScore * 0.6 + fb.fluencyScore * 0.4);
            updated.pronunciationScore = Math.round(updated.pronunciationScore * 0.6 + fb.pronunciationScore * 0.4);
            // Track mispronounced words
            for (const word of fb.mispronouncedWords) {
                if (!updated.frequentlyMispronouncedWords.includes(word)) {
                    updated.frequentlyMispronouncedWords.unshift(word);
                }
            }
            updated.frequentlyMispronouncedWords = updated.frequentlyMispronouncedWords.slice(0, 20);
            // Track weak sounds
            for (const sound of fb.identifiedWeakSounds) {
                const current = updated.soundSkills[sound];
                if (current) {
                    current.attemptsCount++;
                    current.accuracy = Math.max(10, Math.round(current.accuracy * 0.7 + fb.pronunciationScore * 0.3 - 15));
                    current.status = current.accuracy < 60 ? 'weak' : current.accuracy < 80 ? 'average' : 'strong';
                    current.lastPracticed = new Date().toISOString();
                }
            }
        }
        // 2. Update Tongue Twister Scores
        if (result.twisterScores) {
            for (const [twisterId, fb] of Object.entries(result.twisterScores)) {
                for (const sound of fb.identifiedWeakSounds) {
                    const current = updated.soundSkills[sound];
                    if (current) {
                        current.attemptsCount++;
                        current.accuracy = Math.min(100, Math.round(current.accuracy * 0.6 + fb.pronunciationScore * 0.4));
                        current.status = current.accuracy < 60 ? 'weak' : current.accuracy < 80 ? 'average' : 'strong';
                        current.lastPracticed = new Date().toISOString();
                    }
                }
            }
        }
        // 3. Update Speaking Scores
        if (result.speakingReport) {
            const sp = result.speakingReport;
            updated.speakingScore = Math.round(updated.speakingScore * 0.6 + sp.overallScore * 0.4);
            updated.grammarScore = Math.round(updated.grammarScore * 0.6 + sp.grammarScore * 0.4);
            updated.vocabularyScore = Math.round(updated.vocabularyScore * 0.6 + sp.vocabularyScore * 0.4);
        }
        // 4. Recalculate priority list of weak sounds
        const weakList = [];
        const sortedEntries = Object.entries(updated.soundSkills).sort(([, a], [, b]) => a.accuracy - b.accuracy);
        for (const [cat, data] of sortedEntries) {
            if (data.status === 'weak' || data.accuracy < 65) {
                weakList.push(cat);
            }
        }
        // Always have at least 1-2 focus sounds
        if (weakList.length === 0) {
            weakList.push(sortedEntries[0][0]);
        }
        updated.weakSounds = weakList;
        return updated;
    }
    /**
     * Initializes a balanced default skill profile for onboarding.
     */
    static createDefaultSkillProfile() {
        const categories = [
            'S_SH',
            'R_L',
            'TH',
            'B_P',
            'V_W',
            'F_V',
            'T_D',
            'K_G',
            'CH_J',
            'CONSONANT_CLUSTERS',
            'RAPID_SPEECH'
        ];
        const soundSkills = {};
        for (const cat of categories) {
            soundSkills[cat] = {
                category: cat,
                accuracy: cat === 'R_L' || cat === 'TH' ? 52 : 72, // Seed initial common challenges
                attemptsCount: 0,
                status: cat === 'R_L' || cat === 'TH' ? 'weak' : 'average'
            };
        }
        return {
            speakingScore: 68,
            pronunciationScore: 65,
            fluencyScore: 62,
            readingScore: 74,
            listeningScore: 78,
            vocabularyScore: 70,
            grammarScore: 72,
            weakSounds: ['R_L', 'TH'],
            soundSkills,
            frequentlyMispronouncedWords: ['literally', 'regularly', 'thoroughly'],
            vocabularyMastered: ['articulation', 'instantaneously', 'contextualize']
        };
    }
}
exports.PhonemeWeaknessTracker = PhonemeWeaknessTracker;
//# sourceMappingURL=PhonemeWeaknessTracker.js.map