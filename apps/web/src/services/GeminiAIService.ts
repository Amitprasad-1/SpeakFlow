import { BrowserStorage } from '../storage/BrowserStorage';
import { SpeakingTopicItem, WritingTopicItem } from '../data/topicCatalog';

export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

export interface CoachResponse {
  replyText: string;
  coachingTip?: string;
  suggestedPhrasing?: string;
  source: 'gemini' | 'offline_heuristic';
}

export class GeminiAIService {
  /**
   * Retrieves the configured Gemini API key from settings or environment variables.
   */
  public static getApiKey(): string | null {
    try {
      const settings = BrowserStorage.getSettings();
      if (settings.geminiApiKey && settings.geminiApiKey.trim()) {
        return settings.geminiApiKey.trim();
      }
    } catch {}

    // Check Vite environment variable fallback if provided
    try {
      const meta = import.meta as any;
      if (meta && meta.env && meta.env.VITE_GEMINI_API_KEY) {
        return String(meta.env.VITE_GEMINI_API_KEY).trim();
      }
    } catch {}

    return null;
  }

  /**
   * Checks whether real Gemini AI is configured and ready.
   */
  public static isConfigured(): boolean {
    return Boolean(this.getApiKey());
  }

  /**
   * Tests the Gemini API Key connection.
   */
  public static async testConnection(key?: string): Promise<{ success: boolean; message: string }> {
    const apiKey = key?.trim() || this.getApiKey();
    if (!apiKey) {
      return { success: false, message: 'No API key provided.' };
    }

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Respond with exactly two words: "Connected successfully".' }] }]
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errMsg = errorData.error?.message || `HTTP ${res.status}`;
        return { success: false, message: `Gemini API Error: ${errMsg}` };
      }

      const data = await res.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      return { success: true, message: `Connected to Gemini 1.5 Flash! (${reply.trim()})` };
    } catch (err: any) {
      return { success: false, message: `Network error connecting to Gemini: ${err.message}` };
    }
  }

  /**
   * Generates a conversational speech coaching response.
   */
  public static async generateConversationReply(params: {
    userMessage: string;
    mode: 'practice' | 'interview' | 'workplace' | 'free';
    scenarioTitle: string;
    history: ChatMessage[];
  }): Promise<CoachResponse> {
    const apiKey = this.getApiKey();

    if (!apiKey) {
      return {
        replyText: this.getOfflineFallbackReply(params.userMessage, params.mode),
        source: 'offline_heuristic'
      };
    }

    const systemPrompt = `You are SpeakFlow AI, an elite, warm, and supportive English communication coach and conversational partner.
The user is practicing their spoken English in ${params.mode.toUpperCase()} mode for the scenario: "${params.scenarioTitle}".

RULES:
1. Speak naturally as a dialogue partner. Keep responses conversational, concise (2-3 sentences), and friendly so it can be spoken via text-to-speech.
2. If the user makes a minor grammar, vocabulary, or pronunciation phrasing slip, gently weave one brief natural alternative in parentheses (e.g., "(A natural way to say that is: '...')").
3. Always finish with ONE engaging question or prompt to encourage the user to keep speaking.
4. Avoid markdown bullet points or long paragraphs; keep it strictly like human dialogue.`;

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

      // Format conversation history for Gemini API
      const contents = [
        {
          role: 'user',
          parts: [{ text: `SYSTEM INSTRUCTIONS:\n${systemPrompt}\n\nLet's start our spoken conversation.` }]
        },
        {
          role: 'model',
          parts: [{ text: `Understood! I'm ready to coach and converse with you warmly.` }]
        }
      ];

      // Append recent history (up to last 6 turns)
      const recentHistory = params.history.slice(-6);
      recentHistory.forEach((msg) => {
        contents.push({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        });
      });

      // Append current user message
      contents.push({
        role: 'user',
        parts: [{ text: params.userMessage }]
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 250,
            topP: 0.95
          }
        })
      });

      if (!response.ok) {
        console.warn('Gemini request failed, falling back to offline coach:', response.status);
        return {
          replyText: this.getOfflineFallbackReply(params.userMessage, params.mode),
          source: 'offline_heuristic'
        };
      }

      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

      if (!generatedText) {
        return {
          replyText: this.getOfflineFallbackReply(params.userMessage, params.mode),
          source: 'offline_heuristic'
        };
      }

      return {
        replyText: generatedText,
        source: 'gemini'
      };
    } catch (err) {
      console.warn('Error contacting Gemini API:', err);
      return {
        replyText: this.getOfflineFallbackReply(params.userMessage, params.mode),
        source: 'offline_heuristic'
      };
    }
  }

  /**
   * Offline heuristic fallback if Gemini is not configured or network drops.
   */
  private static getOfflineFallbackReply(
    userText: string,
    mode: 'practice' | 'interview' | 'workplace' | 'free'
  ): string {
    const text = userText.toLowerCase();

    if (mode === 'interview') {
      if (text.includes('experience') || text.includes('project') || text.includes('work')) {
        return "That sounds like a impactful challenge. How did you measure success or handle unexpected setbacks along the way?";
      }
      return "Thank you for sharing that. Could you tell me more about how you collaborated with your teammates in that situation?";
    }

    if (mode === 'workplace') {
      if (text.includes('timeline') || text.includes('deadline') || text.includes('priority')) {
        return "I appreciate you flagging the timeline. What do you see as the top priority to deliver first?";
      }
      return "That aligns well with our team roadmap. What resources or support do you need from the team to execute this smoothly?";
    }

    // Casual / Practice
    if (text.includes('yes') || text.includes('agree') || text.includes('sure')) {
      return "Glad to hear that! What part of your day are you most looking forward to tackling next?";
    }
    return "That's a great perspective! How do you usually approach that in your day-to-day routine?";
  }

  /**
   * Translates an everyday Hindi conversational phrase into natural spoken English.
   */
  public static async translateHindiToEnglish(hindiText: string): Promise<string> {
    const apiKey = this.getApiKey();
    if (!apiKey) return '';

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const prompt = `Translate this everyday Hindi conversational phrase into a natural, concise, real-world English spoken sentence. Return ONLY the English translation, no explanations, no quotes.\n\nHindi: "${hindiText}"`;

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 60 }
        })
      });

      if (!res.ok) return '';
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      return text ? text.trim().replace(/^["']|["']$/g, '') : '';
    } catch {
      return '';
    }
  }

  /**
   * Fetches/generates fresh daily real-world spoken Hindi-to-English phrases
   * inspired by popular educational microlearning formats (@VibesOfLearning reference).
   */
  public static async fetchFreshDailyPhrases(theme?: string): Promise<Array<{
    id: string;
    hindi: string;
    english: string;
    category: 'punchy' | 'assertive' | 'requests' | 'daily';
    isCustom?: boolean;
  }>> {
    const apiKey = this.getApiKey();
    if (!apiKey) return [];

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const prompt = `You are an expert English communication coach specializing in popular, real-world Hindi-to-English spoken sentences (like the trending educational carousel series by @VibesOfLearning).
Generate 10 fresh, practical, and highly authentic everyday spoken sentences.
Avoid generic textbook sentences. Focus on modern expressions used in daily arguments, polite requests, confidence, and casual chats.
${theme ? `Focus on the theme: "${theme}".` : ''}

Output a STRICT JSON ARRAY of 10 objects:
[
  {
    "hindi": "मुझ पर हुक्म मत चलाओ।",
    "english": "Don't order me around.",
    "category": "assertive"
  }
]
Allowed category values: "punchy" | "assertive" | "requests" | "daily"`;

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 600,
            responseMimeType: 'application/json'
          }
        })
      });

      if (!res.ok) return [];
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) return [];

      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) return [];

      return parsed.map((item: any, idx: number) => ({
        id: `ai_fresh_${Date.now()}_${idx}`,
        hindi: String(item.hindi || '').trim(),
        english: String(item.english || '').trim(),
        category: (['punchy', 'assertive', 'requests', 'daily'].includes(item.category)
          ? item.category
          : 'daily') as any,
        isCustom: true
      })).filter((p) => p.hindi && p.english);
    } catch (err) {
      console.warn('Failed to fetch fresh daily phrases from Gemini:', err);
      return [];
    }
  }

  /**
   * Evaluates spoken speech transcript from impromptu speaking (1-5 min)
   * providing exact sentence-by-sentence grammar replacements and word upgrades.
   */
  public static async analyzeSpeechPerformance(params: {
    topic: string;
    transcript: string;
    durationSeconds: number;
    targetDurationSeconds: number;
  }): Promise<SpeechAnalysisReport> {
    const apiKey = this.getApiKey();
    const cleanTranscript = (params.transcript || '').trim();
    const words = cleanTranscript ? cleanTranscript.split(/\s+/).filter(Boolean) : [];
    const wpm = params.durationSeconds > 2 && words.length > 0
      ? Math.round((words.length / params.durationSeconds) * 60)
      : 0;

    // 1. Try real Gemini API if configured
    if (apiKey && cleanTranscript.length > 15) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const prompt = `You are an elite speech and pronunciation coach.
The user just completed an extempore/impromptu speech on the topic: "${params.topic}".
Spoken Duration: ${params.durationSeconds} seconds (Target: ${params.targetDurationSeconds} seconds).
Recognized Speech Transcript:
"${cleanTranscript}"

Analyze the speech critically and constructively.
Return STRICT JSON format matching this schema exactly:
{
  "overallScore": 82,
  "pacingFeedback": "Crisp and well-paced, averaging ${wpm} WPM.",
  "strengths": [
    "Compelling opening sentence addressing the topic directly",
    "Confident flow with clear logical sequence"
  ],
  "sentenceCorrections": [
    {
      "originalSentence": "exact snippet of what the user spoke with error",
      "correctedSentence": "exact grammatically perfect and natural native replacement",
      "grammarRule": "Subject-verb agreement / Tense consistency / Article usage / Natural phrasing",
      "why": "Clear, concise 1-sentence explanation of why this replacement is better"
    }
  ],
  "wordUpgrades": [
    {
      "originalWord": "good",
      "recommendedWord": "compelling",
      "context": "Use 'compelling argument' instead of 'good argument' to sound more authoritative"
    }
  ],
  "fillerWordsFound": ["um", "like"],
  "summary": "Warm 2-sentence feedback encouraging their speaking progress and highlighting the main takeaway."
}`;

        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 900,
              responseMimeType: 'application/json'
            }
          })
        });

        if (res.ok) {
          const data = await res.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            const parsed = JSON.parse(text);
            return {
              overallScore: Math.min(100, Math.max(40, parsed.overallScore || 75)),
              wpm,
              pacingFeedback: parsed.pacingFeedback || `${wpm} words per minute.`,
              strengths: Array.isArray(parsed.strengths) ? parsed.strengths : ['Good effort formulating ideas spontaneously.'],
              sentenceCorrections: Array.isArray(parsed.sentenceCorrections) ? parsed.sentenceCorrections : [],
              wordUpgrades: Array.isArray(parsed.wordUpgrades) ? parsed.wordUpgrades : [],
              fillerWordsFound: Array.isArray(parsed.fillerWordsFound) ? parsed.fillerWordsFound : [],
              summary: parsed.summary || 'Solid speaking session! Keep refining your sentence precision.',
              source: 'gemini'
            };
          }
        }
      } catch (err) {
        console.warn('Gemini speech analysis fallback to heuristic:', err);
      }
    }

    // 2. High-Quality Offline Heuristic Analyzer (Always reliable)
    return this.getOfflineSpeechAnalysis(params.topic, cleanTranscript, params.durationSeconds, wpm);
  }

  /**
   * Offline heuristic analyzer for speech performance
   */
  private static getOfflineSpeechAnalysis(
    topic: string,
    transcript: string,
    durationSeconds: number,
    wpm: number
  ): SpeechAnalysisReport {
    const words = transcript ? transcript.split(/\s+/).filter(Boolean) : [];
    const lower = transcript.toLowerCase();

    // Filler words detection
    const fillers = ['um', 'uh', 'er', 'ah', 'like', 'you know', 'basically', 'actually', 'literally'];
    const foundFillers: string[] = [];
    for (const f of fillers) {
      const regex = new RegExp(`\\b${f}\\b`, 'gi');
      if (regex.test(transcript)) {
        foundFillers.push(f);
      }
    }

    // Pacing rating
    let pacingFeedback = `Steady pace at ${wpm} WPM.`;
    if (wpm > 0 && wpm < 110) pacingFeedback = `Your pacing was measured at ${wpm} WPM. Aim to connect your ideas into smooth thought groups to build conversational rhythm.`;
    else if (wpm > 165) pacingFeedback = `Your speaking tempo was rapid (${wpm} WPM). Taking deliberate micro-pauses at commas and periods gives listeners time to absorb your thoughts.`;
    else if (wpm > 0) pacingFeedback = `Your tempo was very natural (${wpm} WPM), right in the ideal 120–150 WPM conversational zone.`;

    // Rule-based sentence corrections
    const sentenceCorrections: SentenceCorrection[] = [];

    const checks: Array<{
      pattern: RegExp;
      rule: string;
      replacement: (match: string) => { orig: string; corr: string; why: string };
    }> = [
      {
        pattern: /\b(i am agree|i'm agree)\b/i,
        rule: 'Verb Usage (Agree is a verb)',
        replacement: () => ({
          orig: 'I am agree with this',
          corr: 'I agree with this / I completely agree',
          why: 'In English, "agree" is already a verb; do not use "am" with it.'
        })
      },
      {
        pattern: /\b(people is|everyone are)\b/i,
        rule: 'Subject-Verb Agreement',
        replacement: (m) => ({
          orig: m.toLowerCase().includes('people') ? 'People is thinking...' : 'Everyone are saying...',
          corr: m.toLowerCase().includes('people') ? 'People are thinking...' : 'Everyone is saying...',
          why: m.toLowerCase().includes('people')
            ? '"People" is a plural noun requiring the plural verb "are".'
            : '"Everyone" is grammatically singular and takes the singular verb "is".'
        })
      },
      {
        pattern: /\b(discuss about)\b/i,
        rule: 'Redundant Preposition',
        replacement: () => ({
          orig: 'We should discuss about this topic',
          corr: 'We should discuss this topic / We should talk about this topic',
          why: 'The verb "discuss" already means "talk about", so adding "about" is redundant.'
        })
      },
      {
        pattern: /\b(revert back)\b/i,
        rule: 'Redundant Phrase',
        replacement: () => ({
          orig: 'I will revert back to you',
          corr: 'I will follow up with you / I will get back to you',
          why: '"Revert back" is redundant. "Follow up" or "reply" is standard professional English.'
        })
      },
      {
        pattern: /\b(more better|more easier|more faster)\b/i,
        rule: 'Double Comparative',
        replacement: (m) => ({
          orig: `It is ${m}`,
          corr: `It is ${m.replace(/more\s+/i, '')}`,
          why: 'Do not combine "more" with "-er" comparative adjectives.'
        })
      },
      {
        pattern: /\b(depend of)\b/i,
        rule: 'Preposition Collocation',
        replacement: () => ({
          orig: 'It depends of the situation',
          corr: 'It depends on the situation',
          why: 'The verb "depend" strictly collocates with the preposition "on", never "of".'
        })
      },
      {
        pattern: /\b(give exam|giving exam)\b/i,
        rule: 'Collocation (Take an exam)',
        replacement: () => ({
          orig: 'I was giving my exam',
          corr: 'I was taking my exam / I was sitting for my exam',
          why: 'Students take or sit for an exam; teachers or examiners give/administer an exam.'
        })
      }
    ];

    for (const chk of checks) {
      const m = transcript.match(chk.pattern);
      if (m) {
        const rep = chk.replacement(m[0]);
        sentenceCorrections.push({
          originalSentence: rep.orig,
          correctedSentence: rep.corr,
          grammarRule: chk.rule,
          why: rep.why
        });
      }
    }

    // Default constructive example if speech is clean or short
    if (sentenceCorrections.length === 0 && words.length >= 8) {
      sentenceCorrections.push({
        originalSentence: 'Connecting multiple thoughts with "and then, and then..."',
        correctedSentence: 'Use transitional signposts: "Furthermore, ...", "Consequently, ...", "From my perspective, ..."',
        grammarRule: 'Discourse Markers & Transitions',
        why: 'Transition words give your extempore speech professional cadence and clarity.'
      });
    }

    // Vocabulary upgrades
    const wordUpgrades: WordUpgrade[] = [];
    const vocabUpgradesMap: Record<string, { upgrade: string; context: string }> = {
      good: { upgrade: 'compelling / impactful', context: 'Instead of "a good point", say "a compelling point".' },
      bad: { upgrade: 'detrimental / adverse', context: 'Instead of "bad effect", use "adverse effect".' },
      big: { upgrade: 'substantial / pivotal', context: 'Instead of "a big reason", use "a pivotal factor".' },
      important: { upgrade: 'crucial / essential', context: 'Instead of "very important", use "essential or paramount".' },
      think: { upgrade: 'maintain / believe', context: 'Instead of "I think that", use "I maintain that".' },
      very: { upgrade: 'deliberately / highly', context: 'Replace "very" with more precise descriptive adjectives.' }
    };

    for (const [w, up] of Object.entries(vocabUpgradesMap)) {
      if (new RegExp(`\\b${w}\\b`, 'i').test(transcript)) {
        wordUpgrades.push({
          originalWord: w,
          recommendedWord: up.upgrade,
          context: up.context
        });
        if (wordUpgrades.length >= 3) break;
      }
    }

    const strengths = [
      words.length >= 15 ? 'Maintained a sustained monologue covering the core theme.' : 'Stepped up to formulate extempore thoughts on the spot.',
      foundFillers.length === 0 ? 'Clean vocal delivery with minimal hesitation fillers.' : 'Spoke clearly with recognizable vocabulary.',
      'Showed willingness to express ideas spontaneously.'
    ];

    const score = Math.min(95, Math.max(50, 65 + (words.length > 25 ? 15 : 5) - (foundFillers.length * 4) - (sentenceCorrections.length * 3)));

    return {
      overallScore: score,
      wpm,
      pacingFeedback,
      strengths,
      sentenceCorrections,
      wordUpgrades,
      fillerWordsFound: Array.from(new Set(foundFillers)),
      summary: `You tackled "${topic}" with genuine spontaneity! Review the sentence and vocabulary enhancements below to make your next attempt even sharper.`,
      source: 'offline_heuristic'
    };
  }

  /**
   * Evaluates an essay/paragraph written by the user (target: 150 to 200 words)
   * providing sentence-by-sentence grammar replacements, word upgrades, and polished model rewrite.
   */
  public static async analyzeWritingSubmission(params: {
    topic: string;
    essayText: string;
    targetMinWords?: number;
    targetMaxWords?: number;
  }): Promise<WritingAnalysisReport> {
    const apiKey = this.getApiKey();
    const cleanText = (params.essayText || '').trim();
    const words = cleanText ? cleanText.split(/\s+/).filter(Boolean) : [];
    const wordCount = words.length;
    const minWords = params.targetMinWords || 150;
    const maxWords = params.targetMaxWords || 200;

    let wordCountStatus: 'under' | 'perfect' | 'over' = 'perfect';
    if (wordCount < minWords) wordCountStatus = 'under';
    else if (wordCount > maxWords) wordCountStatus = 'over';

    // 1. Try real Gemini API
    if (apiKey && cleanText.length > 30) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const prompt = `You are an expert Cambridge/IELTS English writing examiner.
The student wrote a 150-200 word essay on the topic: "${params.topic}".
Word count: ${wordCount} words (Target: ${minWords}-${maxWords} words).
Student's Essay Text:
"""
${cleanText}
"""

Evaluate this essay thoroughly and constructively.
Return a STRICT JSON object matching this schema:
{
  "overallScore": 84,
  "cefrLevel": "B2",
  "strengths": [
    "Clear paragraph structure with introduction and conclusion",
    "Effective vocabulary used in the second sentence"
  ],
  "sentenceCorrections": [
    {
      "originalSentence": "exact sentence from the essay containing an error or awkward phrasing",
      "correctedSentence": "exact grammatically perfect and polished replacement",
      "grammarRule": "Name of grammar rule (e.g. Subject-Verb Agreement, Preposition Choice, Run-on Sentence)",
      "why": "Clear explanation of what was wrong and how the replacement fixes it"
    }
  ],
  "vocabularyRecommendations": [
    {
      "originalWord": "good",
      "recommendedWord": "beneficial / constructive",
      "context": "Replace 'good things' with 'constructive benefits' to elevate academic tone"
    }
  ],
  "polishedRewrite": "A complete, beautifully polished 150-180 word model version of the student's exact ideas written in natural C1-level English.",
  "summary": "Inspiring 2-sentence feedback summarizing their writing capability and key area to focus on."
}`;

        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 1200,
              responseMimeType: 'application/json'
            }
          })
        });

        if (res.ok) {
          const data = await res.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            const parsed = JSON.parse(text);
            return {
              overallScore: Math.min(100, Math.max(40, parsed.overallScore || 78)),
              wordCount,
              wordCountStatus,
              cefrLevel: (['B1', 'B2', 'C1', 'C2'].includes(parsed.cefrLevel) ? parsed.cefrLevel : 'B2') as any,
              strengths: Array.isArray(parsed.strengths) ? parsed.strengths : ['Good overall structure and paragraph cohesion.'],
              sentenceCorrections: Array.isArray(parsed.sentenceCorrections) ? parsed.sentenceCorrections : [],
              vocabularyRecommendations: Array.isArray(parsed.vocabularyRecommendations) ? parsed.vocabularyRecommendations : [],
              polishedRewrite: parsed.polishedRewrite || cleanText,
              summary: parsed.summary || 'Well-written piece with clear ideas. Review the corrections to polish your prose.',
              source: 'gemini'
            };
          }
        }
      } catch (err) {
        console.warn('Gemini writing analysis fallback to heuristic:', err);
      }
    }

    // 2. High-Quality Offline Writing Analyzer
    return this.getOfflineWritingAnalysis(params.topic, cleanText, wordCount, wordCountStatus);
  }

  /**
   * Offline heuristic analyzer for writing submissions
   */
  private static getOfflineWritingAnalysis(
    topic: string,
    text: string,
    wordCount: number,
    wordCountStatus: 'under' | 'perfect' | 'over'
  ): WritingAnalysisReport {
    const sentenceCorrections: SentenceCorrection[] = [];

    // Check common writing grammar mistakes
    const checks: Array<{
      pattern: RegExp;
      rule: string;
      handler: (match: string) => { orig: string; corr: string; why: string };
    }> = [
      {
        pattern: /\b(people is|the society is thinking|they was)\b/i,
        rule: 'Subject-Verb Agreement',
        handler: () => ({
          orig: 'People is dependent on technology in everyday life.',
          corr: 'People are dependent on technology in everyday life.',
          why: '"People" is a plural noun and requires the plural verb "are".'
        })
      },
      {
        pattern: /\b(without (?:to )?realize|without know)\b/i,
        rule: 'Preposition + Gerund (-ing)',
        handler: () => ({
          orig: 'People use it without realize the drawbacks.',
          corr: 'People use it without realizing the drawbacks.',
          why: 'Prepositions (like "without", "by", "for") must be followed by a gerund (-ing form).'
        })
      },
      {
        pattern: /\b(in these days|in today world)\b/i,
        rule: 'Idiomatic Time Expression',
        handler: () => ({
          orig: 'In these days, life has become very fast.',
          corr: 'Nowadays / In today\'s world, life has become very fast.',
          why: 'Use "Nowadays" or the possessive "In today\'s world" for natural written English.'
        })
      },
      {
        pattern: /\b(each and every|first and foremost)\b/i,
        rule: 'Wordiness & Redundancy',
        handler: () => ({
          orig: 'Each and every person should take responsibility.',
          corr: 'Every person should take responsibility / Everyone should take responsibility.',
          why: '"Each and every" is repetitive; choosing either "each" or "every" is cleaner.'
        })
      },
      {
        pattern: /\b(a lot of|lots of)\b/i,
        rule: 'Formal Academic Register',
        handler: () => ({
          orig: 'There are a lot of benefits.',
          corr: 'There are numerous benefits / There are substantial benefits.',
          why: '"A lot of" is informal spoken English; replace with "numerous", "substantial", or "considerable" in essays.'
        })
      }
    ];

    for (const c of checks) {
      if (c.pattern.test(text)) {
        const res = c.handler('');
        sentenceCorrections.push({
          originalSentence: res.orig,
          correctedSentence: res.corr,
          grammarRule: c.rule,
          why: res.why
        });
      }
    }

    if (sentenceCorrections.length === 0) {
      sentenceCorrections.push({
        originalSentence: 'Combining ideas with simple coordinating conjunctions ("and", "but")',
        correctedSentence: 'Use compound-complex structures with subordination ("Although...", "Whereas...", "Not only... but also...")',
        grammarRule: 'Syntactic Variety',
        why: 'Varying sentence length and structure demonstrates advanced written proficiency.'
      });
    }

    // Vocabulary recommendations
    const vocabularyRecommendations: WordUpgrade[] = [
      {
        originalWord: 'good / nice',
        recommendedWord: 'advantageous / invaluable',
        context: 'Use "invaluable opportunity" instead of "good opportunity".'
      },
      {
        originalWord: 'problem',
        recommendedWord: 'predicament / challenge',
        context: 'Use "pressing challenge" instead of "big problem".'
      },
      {
        originalWord: 'make',
        recommendedWord: 'cultivate / establish',
        context: 'Use "cultivate healthy habits" instead of "make good habits".'
      }
    ];

    const strengths = [
      wordCountStatus === 'perfect'
        ? `Hit the sweet spot with ${wordCount} words (ideal 150-200 word target).`
        : `Formulated a structured piece containing ${wordCount} words on "${topic}".`,
      'Maintained consistent paragraph development with an opening and supporting points.',
      'Demonstrated practical communication ability with functional vocabulary.'
    ];

    // Build polished rewrite
    const polishedRewrite = `${topic} is a subject that demands careful consideration in modern society. To begin with, individuals often encounter situations where clear communication and strategic planning dictate long-term success. Furthermore, embracing constructive habits allows us to overcome unexpected hurdles with resilience. Ultimately, by maintaining consistent effort and remaining adaptable to change, we can foster meaningful progress in both our personal and professional journeys.`;

    const score = wordCountStatus === 'perfect' ? 84 : (wordCount < 150 ? 72 : 78);

    return {
      overallScore: score,
      wordCount,
      wordCountStatus,
      cefrLevel: score >= 80 ? 'B2' : 'B1',
      strengths,
      sentenceCorrections,
      vocabularyRecommendations,
      polishedRewrite,
      summary: `Solid essay draft on "${topic}". Incorporate the sentence enhancements and vocabulary upgrades below to take your written English to the next level.`,
      source: 'offline_heuristic'
    };
  }

  /**
   * Generates fresh, dynamic extempore speaking topics on the fly using Gemini AI or procedural generator.
   */
  public static async generateDynamicSpeakingTopics(category?: string): Promise<SpeakingTopicItem[]> {
    const apiKey = this.getApiKey();
    const effectiveCategory = category && category !== 'All' ? category : 'General Communication & Current Trends';

    if (apiKey) {
      try {
        const prompt = `Generate 4 brand new, highly engaging impromptu speaking topics for English learners and job seekers.
Category: "${effectiveCategory}".
Format your response as a valid JSON array of objects with the exact keys:
[
  {
    "category": "${effectiveCategory}",
    "topic": "Compelling Title Here",
    "guideQuestions": [
      "Point or question 1",
      "Point or question 2",
      "Point or question 3"
    ]
  }
]
Return ONLY raw JSON, with no markdown code blocks or additional text.`;

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.8,
              maxOutputTokens: 1024
            }
          })
        });

        if (res.ok) {
          const data = await res.json();
          const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          const cleanedJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleanedJson);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map((item: any, idx: number) => ({
              id: `ai_spk_${Date.now()}_${idx}`,
              category: item.category || effectiveCategory,
              topic: item.topic || 'Dynamic AI Topic',
              guideQuestions: Array.isArray(item.guideQuestions) && item.guideQuestions.length > 0
                ? item.guideQuestions
                : ['What is your primary stance?', 'Can you share a real-world example?', 'What is your final takeaway?'],
              isAiGenerated: true
            }));
          }
        }
      } catch (err) {
        console.warn('Gemini topic generation fallback triggered:', err);
      }
    }

    // Procedural Fallback Generator with varied creative angles
    const fallbackSeed = [
      {
        topic: `The Real Impact of ${effectiveCategory.includes('AI') ? 'Autonomous Agents' : 'Rapid Technological Change'} on Human Connection`,
        guideQuestions: [
          'How is technology altering the depth of everyday conversations?',
          'What is one benefit and one drawback you observe personally?',
          'How can we preserve genuine interpersonal trust?'
        ]
      },
      {
        topic: `Why Adaptability Is Becoming More Valuable Than Specialization in Modern Careers`,
        guideQuestions: [
          'How fast do modern industries change and render old skills obsolete?',
          'What mindset helps someone quickly learn new domains?',
          'How do you personally embrace unexpected professional pivots?'
        ]
      },
      {
        topic: `Should Public Speaking and Negotiation Be Mandatory Courses in High School?`,
        guideQuestions: [
          'Why are verbal persuasion and conflict resolution critical life skills?',
          'How does fear of public speaking hold talented people back?',
          'What would an ideal practical curriculum look like?'
        ]
      },
      {
        topic: `Lessons Learned from Navigating an Unforeseen Crisis Under Tight Deadlines`,
        guideQuestions: [
          'What was the high-pressure situation and what was at stake?',
          'How did you maintain emotional composure and communicate effectively?',
          'What advice would you give to someone facing a similar challenge?'
        ]
      }
    ];

    return fallbackSeed.map((item, idx) => ({
      id: `ai_spk_proc_${Date.now()}_${idx}`,
      category: effectiveCategory,
      topic: item.topic,
      guideQuestions: item.guideQuestions,
      isAiGenerated: true
    }));
  }

  /**
   * Generates fresh essay writing topics on the fly using Gemini AI or procedural generator.
   */
  public static async generateDynamicWritingTopics(category?: string): Promise<WritingTopicItem[]> {
    const apiKey = this.getApiKey();
    const effectiveCategory = category && category !== 'All' ? category : 'Modern Society & Technology';

    if (apiKey) {
      try {
        const prompt = `Generate 4 brand new, highly engaging 150-200 word essay prompts for English writing diagnostics.
Category: "${effectiveCategory}".
Format your response as a valid JSON array of objects with the exact keys:
[
  {
    "category": "${effectiveCategory}",
    "title": "Compelling Title Here",
    "starterPrompt": "Engaging opening sentence to spark writing...",
    "outlinePoints": [
      "Introduction: Outline aspect 1",
      "Body: Outline aspect 2",
      "Conclusion: Outline aspect 3"
    ]
  }
]
Return ONLY raw JSON, with no markdown code blocks or additional text.`;

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.8,
              maxOutputTokens: 1024
            }
          })
        });

        if (res.ok) {
          const data = await res.json();
          const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          const cleanedJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleanedJson);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map((item: any, idx: number) => ({
              id: `ai_wrt_${Date.now()}_${idx}`,
              category: item.category || effectiveCategory,
              title: item.title || 'Dynamic AI Writing Prompt',
              starterPrompt: item.starterPrompt || 'Consider how modern society approaches this topic...',
              outlinePoints: Array.isArray(item.outlinePoints) && item.outlinePoints.length > 0
                ? item.outlinePoints
                : ['Introduction: Define the issue.', 'Body: Provide 2 key arguments.', 'Conclusion: State your verdict.'],
              isAiGenerated: true
            }));
          }
        }
      } catch (err) {
        console.warn('Gemini writing topic generation fallback triggered:', err);
      }
    }

    // Procedural Fallback Generator
    const fallbackSeed = [
      {
        title: `The Ethics of Generative AI in Creative Arts and Journalism`,
        starterPrompt: `As generative AI models create compelling art, music, and journalism, the boundaries of copyright and human creativity are challenged...`,
        outlinePoints: [
          'Introduction: Rapid rise of generative AI in creative professions.',
          'Body: Efficiency and creative assistance vs ethical authorship and job security.',
          'Conclusion: Sustainable collaboration between human creators and AI tools.'
        ]
      },
      {
        title: `Is Digital Nomadism the Future of White-Collar Employment?`,
        starterPrompt: `With high-speed internet and cloud software, millions of workers now choose to live abroad while working remotely...`,
        outlinePoints: [
          'Introduction: The growing appeal of global remote work.',
          'Body: Cultural immersion and flexibility vs tax hurdles and time-zone isolation.',
          'Conclusion: Why hybrid nomadism offers the healthiest sustainable balance.'
        ]
      },
      {
        title: `Rethinking Mental Health Days in Fast-Paced Workplaces`,
        starterPrompt: `Chronic burnout in competitive industries has prompted companies to reconsider proactive mental well-being policies...`,
        outlinePoints: [
          'Introduction: Rising stress levels across modern corporate environments.',
          'Body: Productivity gains and employee retention vs potential workload bottlenecks.',
          'Conclusion: Creating a supportive company culture where taking breaks is normalized.'
        ]
      },
      {
        title: `The Role of Renewable Energy in Economic Independence`,
        starterPrompt: `Transitioning to wind, solar, and battery storage represents not only an ecological priority, but a strategic economic shift...`,
        outlinePoints: [
          'Introduction: The dual imperative of ecological sustainability and economic sovereignty.',
          'Body: Long-term cost stability and clean job growth vs upfront infrastructure capital.',
          'Conclusion: Why aggressive investment in renewables guarantees future security.'
        ]
      }
    ];

    return fallbackSeed.map((item, idx) => ({
      id: `ai_wrt_proc_${Date.now()}_${idx}`,
      category: effectiveCategory,
      title: item.title,
      starterPrompt: item.starterPrompt,
      outlinePoints: item.outlinePoints,
      isAiGenerated: true
    }));
  }
}

export interface SentenceCorrection {
  originalSentence: string;
  correctedSentence: string;
  grammarRule: string;
  why: string;
}

export interface WordUpgrade {
  originalWord: string;
  recommendedWord: string;
  context: string;
}

export interface SpeechAnalysisReport {
  overallScore: number;
  wpm: number;
  pacingFeedback: string;
  strengths: string[];
  sentenceCorrections: SentenceCorrection[];
  wordUpgrades: WordUpgrade[];
  fillerWordsFound: string[];
  summary: string;
  source: 'gemini' | 'offline_heuristic';
}

export interface WritingAnalysisReport {
  overallScore: number;
  wordCount: number;
  wordCountStatus: 'under' | 'perfect' | 'over';
  cefrLevel: 'B1' | 'B2' | 'C1' | 'C2';
  strengths: string[];
  sentenceCorrections: SentenceCorrection[];
  vocabularyRecommendations: WordUpgrade[];
  polishedRewrite: string;
  summary: string;
  source: 'gemini' | 'offline_heuristic';
}

