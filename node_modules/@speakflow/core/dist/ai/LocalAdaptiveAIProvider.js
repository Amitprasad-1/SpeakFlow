"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalAdaptiveAIProvider = void 0;
const PersonalizationEngine_js_1 = require("../learning/PersonalizationEngine.js");
const readingPassages_js_1 = require("../domain/readingPassages.js");
const tongueTwisters_js_1 = require("../domain/tongueTwisters.js");
const practiceSentences_js_1 = require("../domain/practiceSentences.js");
const listeningExercises_js_1 = require("../domain/listeningExercises.js");
const ContentValidator_js_1 = require("../validation/ContentValidator.js");
class LocalAdaptiveAIProvider {
    id = 'local_adaptive';
    name = 'SpeakFlow Adaptive Intelligence (Offline)';
    async generateDailyLesson(profile, preferredTopic) {
        return PersonalizationEngine_js_1.PersonalizationEngine.generateLesson(profile, 'Intermediate', preferredTopic);
    }
    async generateReadingPassage(topic, weakSounds, level) {
        const matched = readingPassages_js_1.READING_PASSAGES_CATALOG.find(p => p.topic === topic);
        const passage = matched || readingPassages_js_1.READING_PASSAGES_CATALOG[0];
        // Enforce validation
        const validation = ContentValidator_js_1.ContentValidator.validateReadingPassage(passage);
        if (!validation.isValid) {
            throw new Error(`Passage failed validation: ${validation.errors.join('; ')}`);
        }
        return passage;
    }
    async generateVocabulary(passageText, targetPhonemes) {
        const passage = readingPassages_js_1.READING_PASSAGES_CATALOG[0];
        return passage.vocabularyWords;
    }
    async generateSentences(focusPhonemes, level) {
        return (0, practiceSentences_js_1.getSentencesForCategory)(focusPhonemes[0] || 'R_L');
    }
    async generateTongueTwister(category, difficulty) {
        const twister = tongueTwisters_js_1.TONGUE_TWISTERS_CATALOG.find(t => t.category === category);
        return twister || tongueTwisters_js_1.TONGUE_TWISTERS_CATALOG[0];
    }
    async generateListeningExercise(level, topic) {
        return listeningExercises_js_1.LISTENING_EXERCISES_CATALOG[0];
    }
    async generateConversationReply(scenario, history) {
        const lastUserMessage = [...history].reverse().find(m => m.sender === 'user')?.text || '';
        // Analyze grammar and naturalness
        let grammarCorrection;
        let naturalAlternative;
        if (/\b(i am agree|i agree with you about that|he do not)\b/i.test(lastUserMessage)) {
            grammarCorrection = 'Say "I agree" rather than "I am agree".';
            naturalAlternative = 'A more native phrasing: "I completely align with that perspective."';
        }
        else if (lastUserMessage.split(/\s+/).length < 6) {
            naturalAlternative = 'Try elaborating with a supporting clause: "From my perspective, ... because ..."';
        }
        // Dynamic contextual responses matching the scenario
        let replyText = '';
        const turnCount = history.filter(m => m.sender === 'user').length;
        switch (scenario.category) {
            case 'job_interview':
                if (turnCount === 1) {
                    replyText =
                        'That is a very insightful example. How did you specifically measure the impact of your actions, and what feedback did you receive from your senior leadership?';
                }
                else if (turnCount === 2) {
                    replyText =
                        'Excellent articulation of the outcome. If you were faced with the exact same constraints again today, what is one strategic element you would approach differently?';
                }
                else {
                    replyText =
                        'Thank you for elaborating with such clarity and poise. Do you have any questions regarding our technical roadmap or team structure?';
                }
                break;
            case 'workplace_conversation':
                if (turnCount === 1) {
                    replyText =
                        'I appreciate you laying out those trade-offs. If we decide to defer the secondary feature set to next quarter, how will we manage the client expectations in the interim?';
                }
                else {
                    replyText =
                        'That sounds like a sensible mitigation plan. Let us draft a brief alignment memo and share it with the engineering leads before tomorrow afternoon.';
                }
                break;
            default:
                replyText =
                    'That makes complete sense. Could you share a bit more detail on how you plan to coordinate the next steps with the broader team?';
        }
        return {
            replyText,
            grammarCorrection,
            naturalAlternative,
            pronunciationHint: 'Remember to stress key nouns and pre-plan your breath marks.'
        };
    }
    async evaluateConversation(scenario, history) {
        const userMessages = history.filter(m => m.sender === 'user');
        const totalWords = userMessages.reduce((acc, m) => acc + m.text.split(/\s+/).length, 0);
        const fluencyScore = Math.min(95, Math.max(65, 70 + Math.min(20, totalWords / 5)));
        const grammarScore = 84;
        const vocabularyScore = 82;
        const pronunciationScore = 80;
        const sentenceStructureScore = 85;
        const naturalnessScore = 83;
        const confidenceScore = 86;
        const overallScore = Math.round((fluencyScore + grammarScore + vocabularyScore + pronunciationScore + sentenceStructureScore + naturalnessScore + confidenceScore) / 7);
        return {
            overallScore,
            fluencyScore,
            grammarScore,
            vocabularyScore,
            pronunciationScore,
            sentenceStructureScore,
            naturalnessScore,
            confidenceScore,
            keyStrengths: [
                'Maintained structured turn-taking without awkward silences.',
                'Used professional industry vocabulary relevant to the scenario.',
                'Demonstrated strong contextual awareness and active listening.'
            ],
            areasForImprovement: [
                'Practice linking conjunctions to build longer, more nuanced compound sentences.',
                'Avoid minor grammatical hesitation markers when transitioning between thoughts.',
                'Ensure final consonant stops (/t/, /d/) are voiced crisply at sentence endings.'
            ],
            correctionsAndAlternatives: [
                {
                    original: 'I think that we must do this because it is very good.',
                    naturalAlternative: 'I strongly recommend proceeding with this approach as it yields significant strategic value.',
                    explanation: 'Replaces generic informal verbs with persuasive executive terminology.'
                },
                {
                    original: 'We had some problem with the time and resources.',
                    naturalAlternative: 'We encountered unexpected resource constraints that compressed our delivery timeline.',
                    explanation: 'Elevates conversational vocabulary for senior professional settings.'
                }
            ]
        };
    }
}
exports.LocalAdaptiveAIProvider = LocalAdaptiveAIProvider;
//# sourceMappingURL=LocalAdaptiveAIProvider.js.map