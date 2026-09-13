import {
  UserProfile,
  DailyLesson,
  DailyPracticeSession,
  ContentHistoryData,
  SessionResult,
  PhonemeWeaknessTracker,
  BaselineAssessment,
  LearningMemory,
  ConversationSession,
  AdaptiveIntelligenceEngine
} from '@speakflow/core';

const STORAGE_KEYS = {
  USER_PROFILE: 'speakflow_user_profile_v1',
  ACTIVE_LESSON: 'speakflow_active_lesson_v1',
  SESSION_HISTORY: 'speakflow_session_history_v1',
  SETTINGS: 'speakflow_settings_v1',
  API_KEYS: 'speakflow_api_keys_v1',
  BASELINE_ASSESSMENT: 'speakflow_baseline_assessment_v1',
  CONTENT_HISTORY: 'speakflow_content_history_v1',
  DAILY_SESSION_PREFIX: 'speakflow_daily_session_',
  LEARNING_MEMORY: 'speakflow_learning_memory_v1',
  CONVERSATIONS_HISTORY: 'speakflow_conversations_v1',
  CUSTOM_PHRASES: 'speakflow_custom_phrases_v1',
  FAVORITE_PHRASES: 'speakflow_fav_phrases_v1'
};

export interface AppSettings {
  theme: 'dark' | 'light';
  fontScale: number; // 0.9, 1.0, 1.15
  aiProviderType: 'local' | 'gemini' | 'openai';
  geminiApiKey?: string;
  openAiApiKey?: string;
  allowVoiceDataRetention: boolean;
  hapticsEnabled: boolean;
}

export class BrowserStorage {
  public static getBaselineAssessment(): BaselineAssessment | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BASELINE_ASSESSMENT);
      if (!data) return null;
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  public static saveBaselineAssessment(assessment: BaselineAssessment): void {
    try {
      localStorage.setItem(STORAGE_KEYS.BASELINE_ASSESSMENT, JSON.stringify(assessment));
    } catch (e) {
      console.warn('Failed to save baseline assessment:', e);
    }
  }

  public static clearBaselineAssessment(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.BASELINE_ASSESSMENT);
    } catch (e) {
      console.warn('Failed to clear baseline assessment:', e);
    }
  }

  public static getUserProfile(): UserProfile | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      if (!data) return null;
      const profile: UserProfile = JSON.parse(data);
      // Migrate and sanitize any legacy demo names from earlier versions
      if (profile && (profile.name === 'Alex Chen' || profile.name === 'Alex' || !profile.name?.trim())) {
        profile.name = 'Learner';
        this.saveUserProfile(profile);
      }
      return profile;
    } catch {
      return null;
    }
  }

  public static saveUserProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.warn('Failed to save profile:', e);
    }
  }

  public static createInitialProfile(
    name: string = 'Learner',
    goals: any[] = ['Speaking', 'Pronunciation', 'Fluency'],
    level: any = 'Intermediate',
    dailyMinutes: any = 15
  ): UserProfile {
    const profile: UserProfile = {
      id: `user_${Date.now()}`,
      name,
      goals,
      level,
      dailyGoalMinutes: dailyMinutes,
      createdAt: new Date().toISOString(),
      isOnboarded: true,
      baselineAssessmentCompleted: true,
      skills: PhonemeWeaknessTracker.createDefaultSkillProfile(),
      streak: {
        currentStreak: 4,
        longestStreak: 12,
        lastPracticeDate: new Date().toISOString().split('T')[0]
      },
      totalMinutesPracticed: 85,
      completedLessonsCount: 6
    };
    this.saveUserProfile(profile);
    return profile;
  }

  public static getActiveLesson(): DailyLesson | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVE_LESSON);
      if (!data) return null;
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  public static saveActiveLesson(lesson: DailyLesson): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_LESSON, JSON.stringify(lesson));
    } catch (e) {
      console.warn('Failed to save lesson:', e);
    }
  }

  public static getDailySession(localDate: string): DailyPracticeSession | null {
    try {
      const data = localStorage.getItem(`${STORAGE_KEYS.DAILY_SESSION_PREFIX}${localDate}`);
      if (!data) return null;
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  public static saveDailySession(session: DailyPracticeSession): void {
    try {
      localStorage.setItem(
        `${STORAGE_KEYS.DAILY_SESSION_PREFIX}${session.localDate}`,
        JSON.stringify(session)
      );
    } catch (e) {
      console.warn('Failed to save daily practice session:', e);
    }
  }

  public static getAllDailySessions(): DailyPracticeSession[] {
    try {
      const sessions: DailyPracticeSession[] = [];
      if (typeof window === 'undefined') return [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(STORAGE_KEYS.DAILY_SESSION_PREFIX)) {
          const item = localStorage.getItem(key);
          if (item) {
            try {
              sessions.push(JSON.parse(item));
            } catch {}
          }
        }
      }
      return sessions.sort((a, b) => (b.localDate || '').localeCompare(a.localDate || ''));
    } catch {
      return [];
    }
  }

  public static getContentHistory(): ContentHistoryData {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CONTENT_HISTORY);
      if (!data) return { records: [] };
      return JSON.parse(data);
    } catch {
      return { records: [] };
    }
  }

  public static saveContentHistory(history: ContentHistoryData): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CONTENT_HISTORY, JSON.stringify(history));
    } catch (e) {
      console.warn('Failed to save content history:', e);
    }
  }

  public static getLearningMemory(userId: string = 'learner'): LearningMemory {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LEARNING_MEMORY);
      if (!data) return AdaptiveIntelligenceEngine.createDefaultMemory(userId);
      return JSON.parse(data);
    } catch {
      return AdaptiveIntelligenceEngine.createDefaultMemory(userId);
    }
  }

  public static saveLearningMemory(memory: LearningMemory): void {
    try {
      localStorage.setItem(STORAGE_KEYS.LEARNING_MEMORY, JSON.stringify(memory));
    } catch (e) {
      console.warn('Failed to save learning memory:', e);
    }
  }

  public static getSavedConversations(): ConversationSession[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS_HISTORY);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  public static saveConversation(conversation: ConversationSession): void {
    try {
      const existing = this.getSavedConversations();
      const filtered = existing.filter(c => c.id !== conversation.id);
      filtered.unshift(conversation);
      localStorage.setItem(STORAGE_KEYS.CONVERSATIONS_HISTORY, JSON.stringify(filtered.slice(0, 20)));
    } catch (e) {
      console.warn('Failed to save conversation:', e);
    }
  }

  public static getSessionHistory(): SessionResult[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SESSION_HISTORY);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  public static recordSessionResult(result: SessionResult): void {
    try {
      const history = this.getSessionHistory();
      history.unshift(result);
      localStorage.setItem(STORAGE_KEYS.SESSION_HISTORY, JSON.stringify(history.slice(0, 30)));
    } catch (e) {
      console.warn('Failed to record session:', e);
    }
  }

  public static getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!data) {
        return {
          theme: 'dark',
          fontScale: 1.0,
          aiProviderType: 'local',
          allowVoiceDataRetention: false,
          hapticsEnabled: true
        };
      }
      return JSON.parse(data);
    } catch {
      return {
        theme: 'dark',
        fontScale: 1.0,
        aiProviderType: 'local',
        allowVoiceDataRetention: false,
        hapticsEnabled: true
      };
    }
  }

  public static saveSettings(settings: AppSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save settings:', e);
    }
  }

  public static resetToDemo(): void {
    localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_LESSON);
    localStorage.removeItem(STORAGE_KEYS.SESSION_HISTORY);
  }

  public static getCustomPhrases(): any[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_PHRASES);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  public static saveCustomPhrases(phrases: any[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_PHRASES, JSON.stringify(phrases));
    } catch (e) {
      console.warn('Failed to save custom phrases:', e);
    }
  }

  public static addCustomPhrase(phrase: { hindi: string; english: string; category: string; notes?: string }): any {
    const customList = this.getCustomPhrases();
    const newPhrase = {
      ...phrase,
      id: `custom_${Date.now()}`,
      isCustom: true
    };
    customList.unshift(newPhrase);
    this.saveCustomPhrases(customList);
    return newPhrase;
  }

  public static deleteCustomPhrase(id: string): void {
    const customList = this.getCustomPhrases().filter((p) => p.id !== id);
    this.saveCustomPhrases(customList);
  }

  public static getFavoritePhraseIds(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FAVORITE_PHRASES);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  public static toggleFavoritePhrase(id: string): boolean {
    try {
      const favs = new Set<string>(this.getFavoritePhraseIds());
      let isNowFav = false;
      if (favs.has(id)) {
        favs.delete(id);
        isNowFav = false;
      } else {
        favs.add(id);
        isNowFav = true;
      }
      localStorage.setItem(STORAGE_KEYS.FAVORITE_PHRASES, JSON.stringify(Array.from(favs)));
      return isNowFav;
    } catch {
      return false;
    }
  }
}
