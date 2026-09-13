import {
  UserProfile,
  DailyLesson,
  SessionResult,
  PhonemeWeaknessTracker,
  BaselineAssessment
} from '@speakflow/core';

const STORAGE_KEYS = {
  USER_PROFILE: 'speakflow_user_profile_v1',
  ACTIVE_LESSON: 'speakflow_active_lesson_v1',
  SESSION_HISTORY: 'speakflow_session_history_v1',
  SETTINGS: 'speakflow_settings_v1',
  API_KEYS: 'speakflow_api_keys_v1',
  BASELINE_ASSESSMENT: 'speakflow_baseline_assessment_v1'
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
      return JSON.parse(data);
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
}
