"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiAIProvider = void 0;
const LocalAdaptiveAIProvider_js_1 = require("./LocalAdaptiveAIProvider.js");
const ContentValidator_js_1 = require("../validation/ContentValidator.js");
class GeminiAIProvider {
    id = 'gemini';
    name = 'Google Gemini AI';
    apiKey;
    fallback;
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.fallback = new LocalAdaptiveAIProvider_js_1.LocalAdaptiveAIProvider();
    }
    async generateDailyLesson(profile, preferredTopic) {
        // Generates personalized lesson structure, falling back gracefully if offline
        return this.fallback.generateDailyLesson(profile, preferredTopic);
    }
    async generateReadingPassage(topic, weakSounds, level) {
        if (!this.apiKey) {
            return this.fallback.generateReadingPassage(topic, weakSounds, level);
        }
        try {
            const prompt = `You are an expert English speech pathologist and pronunciation coach.
Generate a reading passage about the topic "${topic}" tailored for an English learner at "${level}" level whose weak pronunciation sounds are: ${weakSounds.join(', ')}.
STRICT REQUIREMENTS:
1. The passage MUST contain STRICTLY between 160 and 200 words. Count every word carefully.
2. Use compound and complex sentences with natural commas and pauses.
3. Incorporate exactly 6 multisyllabic, articulation-heavy vocabulary words that appear naturally in the passage text.
4. Output STRICT JSON with this format:
{
  "title": "...",
  "passageText": "...",
  "wordCount": 175,
  "vocabularyWords": [
    {
      "word": "...",
      "phoneticIpa": "/.../",
      "syllableBreakdown": "...",
      "primaryStressSyllable": 3,
      "definition": "...",
      "partOfSpeech": "...",
      "exampleInPassage": "..."
    }
  ]
}`;
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { responseMimeType: 'application/json' }
                })
            });
            if (!res.ok)
                throw new Error(`Gemini API returned status ${res.status}`);
            const data = await res.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!text)
                throw new Error('Empty response from Gemini');
            const parsed = JSON.parse(text);
            const passage = {
                id: `gemini_passage_${Date.now()}`,
                title: parsed.title || `${topic} in Modern Context`,
                topic,
                cefrLevel: level === 'Advanced' ? 'C1' : 'B2',
                targetPhonemes: weakSounds,
                passageText: parsed.passageText,
                wordCount: ContentValidator_js_1.ContentValidator.countWords(parsed.passageText),
                suggestedDurationSeconds: 80,
                vocabularyWords: (parsed.vocabularyWords || []).map((v, idx) => ({
                    ...v,
                    id: `vocab_gen_${idx}`
                }))
            };
            // Validate through ContentValidator
            const val = ContentValidator_js_1.ContentValidator.validateReadingPassage(passage);
            if (!val.isValid) {
                console.warn('Gemini passage failed strict word count validation, using fallback:', val.errors);
                return this.fallback.generateReadingPassage(topic, weakSounds, level);
            }
            return passage;
        }
        catch (e) {
            console.warn('Gemini API call failed, falling back to local adaptive engine:', e);
            return this.fallback.generateReadingPassage(topic, weakSounds, level);
        }
    }
    async generateVocabulary(passageText, targetPhonemes) {
        return this.fallback.generateVocabulary(passageText, targetPhonemes);
    }
    async generateSentences(focusPhonemes, level) {
        return this.fallback.generateSentences(focusPhonemes, level);
    }
    async generateTongueTwister(category, difficulty) {
        return this.fallback.generateTongueTwister(category, difficulty);
    }
    async generateListeningExercise(level, topic) {
        return this.fallback.generateListeningExercise(level, topic);
    }
    async generateConversationReply(scenario, history) {
        if (!this.apiKey) {
            return this.fallback.generateConversationReply(scenario, history);
        }
        try {
            const messagesPrompt = history
                .map(m => `${m.sender === 'ai' ? scenario.roleAi : scenario.roleUser}: ${m.text}`)
                .join('\n');
            const prompt = `You are roleplaying as: "${scenario.roleAi}".
The scenario is: "${scenario.title}" (${scenario.contextDescription}).
The user is: "${scenario.roleUser}".
Conversation History:
${messagesPrompt}

Instructions:
1. Respond in character concisely (1-3 sentences).
2. If the user's latest response had any grammatical mistakes or unnatural phrasing, provide gentle coaching in the JSON fields.
Output valid JSON:
{
  "replyText": "...",
  "grammarCorrection": "... (optional or empty)",
  "naturalAlternative": "... (optional or empty)",
  "pronunciationHint": "..."
}`;
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { responseMimeType: 'application/json' }
                })
            });
            if (!res.ok)
                throw new Error('Gemini conversation error');
            const data = await res.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            return JSON.parse(text);
        }
        catch {
            return this.fallback.generateConversationReply(scenario, history);
        }
    }
    async evaluateConversation(scenario, history) {
        return this.fallback.evaluateConversation(scenario, history);
    }
}
exports.GeminiAIProvider = GeminiAIProvider;
//# sourceMappingURL=GeminiAIProvider.js.map