import React, { useState, useEffect } from 'react';
import { AppShell, AppNavTab } from './components/layout/AppShell';
import { ThemeMode } from './components/common/ThemeToggle';
import { DailyReadingTab } from './components/daily/DailyReadingTab';
import { DailyTwistersTab } from './components/daily/DailyTwistersTab';
import { DailyGrammarLabTab } from './components/daily/DailyGrammarLabTab';
import { DailyPhrasesTab } from './components/daily/DailyPhrasesTab';
import { ConversationView } from './components/views/ConversationView';
import { ProgressView } from './components/views/ProgressView';
import { ProfileView } from './components/views/ProfileView';
import { HomeView } from './components/views/HomeView';
import { PracticeView } from './components/views/PracticeView';
import { DesignSystemView } from './components/views/DesignSystemView';
import { OnboardingContainer } from './components/onboarding/OnboardingContainer';
import { demoUser, UserProfileData } from './data/demoData';
import { BrowserStorage } from './storage/BrowserStorage';
import { AppRoute, getRouteFromPathname } from './routes';

export const App: React.FC = () => {
  // 1. First-class URL route state
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(() => {
    if (typeof window !== 'undefined') {
      const routeFromUrl = getRouteFromPathname(window.location.pathname);
      if (routeFromUrl === 'onboarding') return 'onboarding';
      if (window.location.hash === '#onboarding') return 'onboarding';
      return routeFromUrl || 'reading';
    }
    return 'reading';
  });

  // 2. User profile from BrowserStorage or demoUser
  const [user, setUser] = useState<UserProfileData>(() => {
    const saved = BrowserStorage.getUserProfile();
    if (saved && saved.name && saved.name !== 'Alex Chen' && saved.name !== 'Alex' && saved.name.trim() !== '') {
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

  // 3. Baseline assessment status
  const [baselineStatus, setBaselineStatus] = useState<'completed' | 'in_progress' | 'skipped' | 'not_started'>(() => {
    const savedAsmt = BrowserStorage.getBaselineAssessment();
    if (savedAsmt) return savedAsmt.status;
    const savedProfile = BrowserStorage.getUserProfile();
    if (savedProfile?.baselineAssessmentCompleted) return 'completed';
    return 'not_started';
  });

  // 4. Theme mode: 'dark' | 'light' | 'system'
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

  // 5. Active calendar date for daily learning tabs (YYYY-MM-DD)
  const [currentDate, setCurrentDate] = useState<string>(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  });

  // Browser History Navigation Sync
  const navigateTo = (route: AppRoute) => {
    const targetPath = route === 'home' ? '/' : `/${route}`;
    if (typeof window !== 'undefined' && window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }
    setCurrentRoute(route);
  };

  // Sync route on browser back/forward buttons (popstate)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(getRouteFromPathname(window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Apply theme to document element and listen for OS changes when in 'system' mode
  useEffect(() => {
    const applyTheme = () => {
      let resolved = 'obsidian';
      if (themeMode === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        resolved = prefersDark ? 'obsidian' : 'light';
      } else if (themeMode === 'dark') {
        resolved = 'obsidian';
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

  // Render Onboarding when on /onboarding route
  if (currentRoute === 'onboarding') {
    return (
      <OnboardingContainer
        onComplete={(newProfile) => {
          const sanitizedName =
            newProfile.name === 'Alex Chen' || newProfile.name === 'Alex' || !newProfile.name?.trim()
              ? 'Learner'
              : newProfile.name;

          setUser({
            id: newProfile.id,
            name: sanitizedName,
            level: newProfile.level,
            dailyGoalMinutes: newProfile.dailyGoalMinutes,
            avatarInitials: sanitizedName ? sanitizedName.slice(0, 2).toUpperCase() : 'SF',
            goals: newProfile.goals
          });
          setBaselineStatus(newProfile.baselineAssessmentCompleted ? 'completed' : 'skipped');
          navigateTo('home');
        }}
        onExit={() => {
          const asmt = BrowserStorage.getBaselineAssessment();
          setBaselineStatus(asmt?.status || 'in_progress');
          navigateTo('home');
        }}
      />
    );
  }

  // Active navigation tab for AppShell
  const activeNavTab: AppNavTab = currentRoute === 'design-system' ? 'design-system' : (currentRoute as AppNavTab);

  return (
    <AppShell
      activeTab={activeNavTab}
      onTabChange={(tab) => navigateTo(tab)}
      themeMode={themeMode}
      onThemeModeChange={setThemeMode}
      currentDate={currentDate}
      onDateChange={setCurrentDate}
    >
      <div key={currentRoute} className="animate-fade-in-up" style={{ width: '100%' }}>
        {currentRoute === 'reading' && <DailyReadingTab currentDateString={currentDate} />}
        {currentRoute === 'twisters' && <DailyTwistersTab currentDateString={currentDate} />}
        {currentRoute === 'grammar' && <DailyGrammarLabTab currentDateString={currentDate} />}
        {currentRoute === 'phrases' && <DailyPhrasesTab currentDateString={currentDate} />}
        {currentRoute === 'conversation' && (
          <ConversationView onReturnToHome={() => navigateTo('reading')} />
        )}
        {currentRoute === 'profile' && (
          <ProfileView
            user={user}
            themeMode={themeMode}
            onThemeModeChange={setThemeMode}
            onUpdateUser={(updated) => setUser((prev) => ({ ...prev, ...updated }))}
          />
        )}
        {currentRoute === 'home' && (
          <HomeView
            user={user}
            onNavigateToPractice={() => navigateTo('practice')}
            onNavigateToConversation={() => navigateTo('conversation')}
            onNavigateToPhrases={() => navigateTo('phrases')}
            onStartBaseline={() => navigateTo('onboarding')}
            baselineStatus={baselineStatus}
          />
        )}
        {currentRoute === 'practice' && (
          <PracticeView
            onReturnToHome={() => navigateTo('reading')}
            onSessionComplete={() => {}}
          />
        )}
        {currentRoute === 'progress' && <ProgressView />}
        {currentRoute === 'design-system' && <DesignSystemView />}
      </div>
    </AppShell>
  );
};
