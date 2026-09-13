import { BrowserStorage } from '../storage/BrowserStorage';

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
}
