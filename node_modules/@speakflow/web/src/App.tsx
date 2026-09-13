import React, { useState, useEffect } from 'react';
import { AppShell, AppNavTab } from './components/layout/AppShell';
import { ThemeMode } from './components/common/ThemeToggle';
import { HomeView } from './components/views/HomeView';
import { PracticeView } from './components/views/PracticeView';
import { ProgressView } from './components/views/ProgressView';
import { ProfileView } from './components/views/ProfileView';
import { DesignSystemView } from './components/views/DesignSystemView';
import { OnboardingContainer } from './components/onboarding/OnboardingContainer';
import { demoUser, UserProfileData } from './data/demoData';
import { BrowserStorage } from './storage/BrowserStorage';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppNavTab>('home');

  // User profile from BrowserStorage or demoUser
  const [user, setUser] = useState<UserProfileData>(() => {
    const saved = BrowserStorage.getUserProfile();
    if (saved) {
      return {
        id: saved.id,
        name: saved.name,
        level: saved.level,
        dailyGoalMinutes: saved.dailyGoalMinutes,
        avatarInitials: saved.name ? saved.name.slice(0, 2).toUpperCase() : 'SF',
        goals: saved.goals
      };
    }
    return demoUser;
  });

  // Baseline assessment status
  const [baselineStatus, setBaselineStatus] = useState<'completed' | 'in_progress' | 'skipped' | 'not_started'>(() => {
    const savedAsmt = BrowserStorage.getBaselineAssessment();
    if (savedAsmt) return savedAsmt.status;
    const savedProfile = BrowserStorage.getUserProfile();
    if (savedProfile?.baselineAssessmentCompleted) return 'completed';
    return 'not_started';
  });

  // Decide if onboarding should be active
  const [isOnboardingActive, setIsOnboardingActive] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#onboarding') {
      return true;
    }
    const savedProfile = BrowserStorage.getUserProfile();
    return !savedProfile || !savedProfile.isOnboarded;
  });

  // Theme mode: 'dark' | 'light' | 'system'
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('speakflow_theme_mode') as ThemeMode;
    if (saved === 'dark' || saved === 'light' || saved === 'system') {
      return saved;
    }
    const legacy = localStorage.getItem('speakflow_theme');
    if (legacy === 'dark' || legacy === 'light') {
      return legacy;
    }
    return 'dark';
  });

  // Apply theme to document element and listen for OS changes when in 'system' mode
  useEffect(() => {
    const applyTheme = () => {
      let resolved: 'dark' | 'light' = 'dark';
      if (themeMode === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        resolved = prefersDark ? 'dark' : 'light';
      } else {
        resolved = themeMode;
      }
      document.documentElement.setAttribute('data-theme', resolved);
    };

    applyTheme();
    localStorage.setItem('speakflow_theme_mode', themeMode);

    if (themeMode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => applyTheme();
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [themeMode]);

  // If onboarding is active, render the dedicated onboarding flow
  if (isOnboardingActive) {
    return (
      <OnboardingContainer
        onComplete={(newProfile) => {
          setUser({
            id: newProfile.id,
            name: newProfile.name,
            level: newProfile.level,
            dailyGoalMinutes: newProfile.dailyGoalMinutes,
            avatarInitials: newProfile.name ? newProfile.name.slice(0, 2).toUpperCase() : 'SF',
            goals: newProfile.goals
          });
          setBaselineStatus(newProfile.baselineAssessmentCompleted ? 'completed' : 'skipped');
          setIsOnboardingActive(false);
          setActiveTab('home');
          if (window.location.hash === '#onboarding') {
            window.location.hash = '';
          }
        }}
        onExit={() => {
          setIsOnboardingActive(false);
          const asmt = BrowserStorage.getBaselineAssessment();
          setBaselineStatus(asmt?.status || 'in_progress');
          if (window.location.hash === '#onboarding') {
            window.location.hash = '';
          }
        }}
      />
    );
  }

  return (
    <AppShell
      activeTab={activeTab}
      onTabChange={setActiveTab}
      themeMode={themeMode}
      onThemeModeChange={setThemeMode}
    >
      {activeTab === 'home' && (
        <HomeView
          user={user}
          onNavigateToPractice={() => setActiveTab('practice')}
          onStartBaseline={() => setIsOnboardingActive(true)}
          baselineStatus={baselineStatus}
        />
      )}
      {activeTab === 'practice' && <PracticeView />}
      {activeTab === 'progress' && <ProgressView />}
      {activeTab === 'profile' && (
        <ProfileView
          user={user}
          themeMode={themeMode}
          onThemeModeChange={setThemeMode}
          onUpdateUser={(updated) => setUser((prev) => ({ ...prev, ...updated }))}
          onRetakeAssessment={() => setIsOnboardingActive(true)}
        />
      )}
      {activeTab === 'design-system' && <DesignSystemView />}
    </AppShell>
  );
};
