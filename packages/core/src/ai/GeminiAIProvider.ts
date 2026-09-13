import { AIProvider, ConversationReply } from './AIProvider.js';
import { LocalAdaptiveAIProvider } from './LocalAdaptiveAIProvider.js';
import {
  DailyLesson,
  ReadingPassage,
  VocabularyWord,
  PracticeSentence,
  TongueTwister,
  ListeningExercise,
  SpeakingScenario,
  ConversationMessage,
  SpeakingEvaluationReport,
  PhonemeCategory,
  EnglishLevel,
  PassageTopic,
  UserSkillProfile
} from '../types/index.js';
import { ContentValidator } from '../validation/ContentValidator.js';

export class GeminiAIProvider implements AIProvider {
  public id = 'gemini';
  public name = 'Google Gemini AI';
  private apiKey: string;
  private fallback: LocalAdaptiveAIProvider;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.fallback = new LocalAdaptiveAIProvider();
  }

  public async generateDailyLesson(
    profile: UserSkillProfile,
    preferredTopic?: PassageTopic
  ): Promise<DailyLesson> {
    // Generates personalized lesson structure, falling back gracefully if offline
    return this.fallback.generateDailyLesson(profile, preferredTopic);
  }

  public async generateReadingPassage(
    topic: PassageTopic,
    weakSounds: PhonemeCategory[],
    level: EnglishLevel
  ): Promise<ReadingPassage> {
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

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' }
          })
        }
      );

      if (!res.ok) throw new Error(`Gemini API returned status ${res.status}`);

      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error('Empty response from Gemini');

      const parsed = JSON.parse(text);
      const passage: ReadingPassage = {
        id: `gemini_passage_${Date.now()}`,
        title: parsed.title || `${topic} in Modern Context`,
        topic,
        cefrLevel: level === 'Advanced' ? 'C1' : 'B2',
        targetPhonemes: weakSounds,
        passageText: parsed.passageText,
        wordCount: ContentValidator.countWords(parsed.passageText),
        suggestedDurationSeconds: 80,
        vocabularyWords: (parsed.vocabularyWords || []).map((v: any, idx: number) => ({
          ...v,
          id: `vocab_gen_${idx}`
        }))
      };

      // Validate through ContentValidator
      const val = ContentValidator.validateReadingPassage(passage);
      if (!val.isValid) {
        console.warn('Gemini passage failed strict word count validation, using fallback:', val.errors);
        return this.fallback.generateReadingPassage(topic, weakSounds, level);
      }

      return passage;
    } catch (e) {
      console.warn('Gemini API call failed, falling back to local adaptive engine:', e);
      return this.fallback.generateReadingPassage(topic, weakSounds, level);
    }
  }

  public async generateVocabulary(
    passageText: string,
    targetPhonemes: PhonemeCategory[]
  ): Promise<VocabularyWord[]> {
    return this.fallback.generateVocabulary(passageText, targetPhonemes);
  }

  public async generateSentences(
    focusPhonemes: PhonemeCategory[],
    level: EnglishLevel
  ): Promise<PracticeSentence[]> {
    return this.fallback.generateSentences(focusPhonemes, level);
  }

  public async generateTongueTwister(
    category: PhonemeCategory,
    difficulty: 'easy' | 'medium' | 'hard'
  ): Promise<TongueTwister> {
    return this.fallback.generateTongueTwister(category, difficulty);
  }

  public async generateListeningExercise(
    level: EnglishLevel,
    topic?: PassageTopic
  ): Promise<ListeningExercise> {
    return this.fallback.generateListeningExercise(level, topic);
  }

  public async generateConversationReply(
    scenario: SpeakingScenario,
    history: ConversationMessage[]
  ): Promise<ConversationReply> {
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

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' }
          })
        }
      );

      if (!res.ok) throw new Error('Gemini conversation error');
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      return JSON.parse(text);
    } catch {
      return this.fallback.generateConversationReply(scenario, history);
    }
  }

  public async evaluateConversation(
    scenario: SpeakingScenario,
    history: ConversationMessage[]
  ): Promise<SpeakingEvaluationReport> {
    return this.fallback.evaluateConversation(scenario, history);
  }
}
