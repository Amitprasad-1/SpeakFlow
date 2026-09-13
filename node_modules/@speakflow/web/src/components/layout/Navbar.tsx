import React from 'react';
import { useApp } from '../../store/AppContext';
import { Flame, Clock, Target, Moon, Sun, Settings, Mic } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, lesson, settings, updateSettings, setShowSettingsModal } = useApp();

  const toggleTheme = () => {
    updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' });
  };

  const focusLabel = lesson.primaryFocusPhoneme.replace('_', ' / ');

  return (
    <header className="top-header">
      <div className="header-badges">
        {/* Streak Badge */}
        <div className="badge badge-streak" title="Daily streak count">
          <Flame size={16} fill="currentColor" />
          <span>{user.streak.currentStreak} Day Streak</span>
        </div>

        {/* Daily Goal Badge */}
        <div className="badge" style={{ background: 'var(--color-bg-surface-elevated)', border: '1px solid var(--color-border)' }}>
          <Clock size={15} color="var(--color-text-secondary)" />
          <span>{user.totalMinutesPracticed} mins total</span>
        </div>

        {/* Focus Sound of the Day */}
        <div className="badge badge-focus" title="Sound prioritized based on your speech patterns">
          <Target size={15} />
          <span>Focus: {focusLabel}</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        {/* Audio Mic Quick Status */}
        <button
          className="btn-icon"
          title="Audio Engine Ready"
          onClick={() => setShowSettingsModal(true)}
        >
          <Mic size={18} color="var(--color-primary)" />
        </button>

        {/* Theme Switcher */}
        <button
          className="btn-icon"
          onClick={toggleTheme}
          title={`Switch to ${settings.theme === 'dark' ? 'Light' : 'Dark'} mode`}
          aria-label="Toggle theme"
        >
          {settings.theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Settings Dialog Trigger */}
        <button
          className="btn-icon"
          onClick={() => setShowSettingsModal(true)}
          title="Settings & AI Providers"
          aria-label="Open Settings"
        >
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
};
