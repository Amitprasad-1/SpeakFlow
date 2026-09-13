"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersonalizationEngine = void 0;
const vocalWarmups_js_1 = require("../domain/vocalWarmups.js");
const tongueTwisters_js_1 = require("../domain/tongueTwisters.js");
const readingPassages_js_1 = require("../domain/readingPassages.js");
const practiceSentences_js_1 = require("../domain/practiceSentences.js");
const speakingScenarios_js_1 = require("../domain/speakingScenarios.js");
const listeningExercises_js_1 = require("../domain/listeningExercises.js");
const ContentValidator_js_1 = require("../validation/ContentValidator.js");
class PersonalizationEngine {
    /**
     * Generates a fully personalized Daily Practice Lesson tailored to the learner's weaknesses.
     */
    static generateLesson(profile, targetLevel = 'Intermediate', preferredTopic) {
        // 1. Identify primary & secondary focus weak sounds
        const primaryWeakness = profile.weakSounds[0] || 'R_L';
        const secondaryWeakness = profile.weakSounds[1] || 'S_SH';
        // 2. Select Vocal Warmups (tailored: tongue trill if R_L is weak)
        const warmups = [...vocalWarmups_js_1.VOCAL_WARMUPS_CATALOG];
        if (primaryWeakness === 'R_L') {
            // Prioritize Tongue Trill / Rolled R
            const tongueTrill = warmups.find(w => w.type === 'tongue_trill');
            if (tongueTrill) {
                warmups.splice(warmups.indexOf(tongueTrill), 1);
                warmups.unshift(tongueTrill);
            }
        }
        // 3. Select Tongue Twisters targeting weak sounds
        const twisters = tongueTwisters_js_1.TONGUE_TWISTERS_CATALOG.filter(t => t.category === primaryWeakness || t.category === secondaryWeakness);
        // If not enough twisters found for specific weak categories, add general clusters/rapid
        if (twisters.length < 2) {
            const fallback = tongueTwisters_js_1.TONGUE_TWISTERS_CATALOG.filter(t => t.category === 'CONSONANT_CLUSTERS' || t.category === 'RAPID_SPEECH');
            twisters.push(...fallback.slice(0, 2 - twisters.length));
        }
        // 4. Select Reading Passage (strictly 160 - 200 words, matching preferredTopic or rotating)
        let selectedPassage = readingPassages_js_1.READING_PASSAGES_CATALOG.find(p => preferredTopic ? p.topic === preferredTopic : p.targetPhonemes.includes(primaryWeakness));
        if (!selectedPassage) {
            selectedPassage = readingPassages_js_1.READING_PASSAGES_CATALOG[0];
        }
        // 5. Select 10-15 Practical Sentences targeting the weak phoneme
        const sentences = (0, practiceSentences_js_1.getSentencesForCategory)(primaryWeakness);
        // 6. Select Speaking Scenario
        const scenarioIndex = Math.floor(Math.random() * speakingScenarios_js_1.SPEAKING_SCENARIOS_CATALOG.length);
        const scenario = speakingScenarios_js_1.SPEAKING_SCENARIOS_CATALOG[scenarioIndex] || speakingScenarios_js_1.SPEAKING_SCENARIOS_CATALOG[0];
        // 7. Select Listening Exercise
        const listening = listeningExercises_js_1.LISTENING_EXERCISES_CATALOG[0];
        const todayStr = new Date().toISOString().split('T')[0];
        const lesson = {
            id: `lesson_${todayStr}_${primaryWeakness.toLowerCase()}`,
            date: todayStr,
            title: `Daily Mastery: Articulation & ${primaryWeakness.replace('_', ' / ')} Precision`,
            themeTopic: selectedPassage.topic,
            primaryFocusPhoneme: primaryWeakness,
            secondaryFocusPhoneme: secondaryWeakness,
            targetLevel,
            vocalWarmups: warmups,
            tongueTwisters: twisters.slice(0, 2),
            readingPassage: selectedPassage,
            practicalSentences: sentences,
            speakingChallenge: scenario,
            listeningExercise: listening,
            isCompleted: false
        };
        // Strict validation
        const validation = ContentValidator_js_1.ContentValidator.validateDailyLesson(lesson);
        if (!validation.isValid) {
            console.warn('Daily lesson generated with validation warnings:', validation.errors);
        }
        return lesson;
    }
}
exports.PersonalizationEngine = PersonalizationEngine;
//# sourceMappingURL=PersonalizationEngine.js.map