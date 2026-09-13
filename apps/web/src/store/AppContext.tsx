import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  UserProfile,
  DailyLesson,
  SessionResult,
  AIProvider,
  LocalAdaptiveAIProvider,
  GeminiAIProvider,
  PhonemeWeaknessTracker,
  PersonalizationEngine,
  AudioPrivacyManager
} from '@speakflow/core';
import { BrowserStorage, AppSettings } from '../storage/BrowserStorage';
import { BrowserSpeechProvider } from '../speech/BrowserSpeechProvider';

export type AppView = 'home' | 'practice' | 'progress' | 'profile' | 'onboarding';

interface AppContextType {
  user: UserProfile;
  lesson: DailyLesson;
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  practiceStep: number;
  setPracticeStep: (step: number) => void;
  speechProvider: BrowserSpeechProvider;
  aiProvider: AIProvider;
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  startDailyPractice: (step?: number) => void;
  nextPracticeStep: () => void;
  prevPracticeStep: () => void;
  completePracticeSession: (result: Partial<SessionResult>) => void;
  regenerateAdaptiveLesson: () => void;
  completeOnboarding: (name: string, goals: any[], level: any, dailyMinutes: any) => void;
  showSettingsModal: boolean;
  setShowSettingsModal: (show: boolean) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Initialize settings & speech provider
  const [settings, setSettingsState] = useState<AppSettings>(() => BrowserStorage.getSettings());
  const speechProvider = useMemo(() => new BrowserSpeechProvider(), []);

  // 2. Initialize AI Provider
  const aiProvider = useMemo<AIProvider>(() => {
    if (settings.aiProviderType === 'gemini' && settings.geminiApiKey) {
      return new GeminiAIProvider(settings.geminiApiKey);
    }
    return new LocalAdaptiveAIProvider();
  }, [settings.aiProviderType, settings.geminiApiKey]);

  // 3. User profile initialization
  const [user, setUser] = useState<UserProfile>(() => {
    const existing = BrowserStorage.getUserProfile();
    if (existing) return existing;
    return BrowserStorage.createInitialProfile();
  });

  // 4. Daily Lesson initialization
  const [lesson, setLesson] = useState<DailyLesson>(() => {
    const existing = BrowserStorage.getActiveLesson();
    if (existing) return existing;
    const initial = PersonalizationEngine.generateLesson(user.skills, user.level);
    BrowserStorage.saveActiveLesson(initial);
    return initial;
  });

  const [currentView, setCurrentView] = useState<AppView>(() => {
    return user.isOnboarded ? 'home' : 'onboarding';
  });
  const [practiceStep, setPracticeStep] = useState<number>(0);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);

  // Sync theme to DOM document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
    document.documentElement.style.setProperty('--font-scale', String(settings.fontScale));
  }, [settings.theme, settings.fontScale]);

  // Sync privacy settings to core manager
  useEffect(() => {
    AudioPrivacyManager.updateSettings({
      allowVoiceDataRetention: settings.allowVoiceDataRetention
    });
  }, [settings.allowVoiceDataRetention]);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettingsState(updated);
    BrowserStorage.saveSettings(updated);
  };

  const startDailyPractice = (step: number = 0) => {
    setPracticeStep(step);
    setCurrentView('practice');
  };

  const nextPracticeStep = () => {
    setPracticeStep((prev) => Math.min(6, prev + 1));
  };

  const prevPracticeStep = () => {
    setPracticeStep((prev) => Math.max(0, prev - 1));
  };

  const completePracticeSession = (result: Partial<SessionResult>) => {
    const fullResult: SessionResult = {
      lessonId: lesson.id,
      date: new Date().toISOString().split('T')[0],
      vocalCompleted: true,
      twisterScores: result.twisterScores || {},
      readingFeedback: result.readingFeedback,
      sentenceScores: result.sentenceScores || {},
      speakingReport: result.speakingReport,
      listeningScore: result.listeningScore ?? 90,
      totalPracticeMinutes: user.dailyGoalMinutes,
      compositeScore: result.compositeScore ?? 88
    };

    BrowserStorage.recordSessionResult(fullResult);

    // Adapt user profile
    const updatedSkills = PhonemeWeaknessTracker.updateProfileFromSession(user.skills, fullResult);
    const updatedUser: UserProfile = {
      ...user,
      skills: updatedSkills,
      totalMinutesPracticed: user.totalMinutesPracticed + user.dailyGoalMinutes,
      completedLessonsCount: user.completedLessonsCount + 1,
      streak: {
        ...user.streak,
        currentStreak: user.streak.currentStreak + 1,
        lastPracticeDate: new Date().toISOString().split('T')[0]
      }
    };

    setUser(updatedUser);
    BrowserStorage.saveUserProfile(updatedUser);

    // Mark lesson complete
    const completedLesson: DailyLesson = {
      ...lesson,
      isCompleted: true,
      score: fullResult.compositeScore
    };
    setLesson(completedLesson);
    BrowserStorage.saveActiveLesson(completedLesson);
  };

  const regenerateAdaptiveLesson = () => {
    const newLesson = PersonalizationEngine.generateLesson(user.skills, user.level);
    setLesson(newLesson);
    BrowserStorage.saveActiveLesson(newLesson);
  };

  const completeOnboarding = (name: string, goals: any[], level: any, dailyMinutes: any) => {
    const newProfile = BrowserStorage.createInitialProfile(name, goals, level, dailyMinutes);
    setUser(newProfile);
    const initialLesson = PersonalizationEngine.generateLesson(newProfile.skills, level);
    setLesson(initialLesson);
    BrowserStorage.saveActiveLesson(initialLesson);
    setCurrentView('home');
  };

  return (
    <AppContext.Provider
      value={{
        user,
        lesson,
        currentView,
        setCurrentView,
        practiceStep,
        setPracticeStep,
        speechProvider,
        aiProvider,
        settings,
        updateSettings,
        startDailyPractice,
        nextPracticeStep,
        prevPracticeStep,
        completePracticeSession,
        regenerateAdaptiveLesson,
        completeOnboarding,
        showSettingsModal,
        setShowSettingsModal
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
