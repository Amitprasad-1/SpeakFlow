import React from 'react';
import { BrandLogo } from '../common/BrandLogo';
import { ThemeToggle, ThemeMode } from '../common/ThemeToggle';
import {
  BookOpen,
  Zap,
  Sparkles,
  MessageSquare,
  User,
  Layers,
  Calendar
} from 'lucide-react';

export type AppNavTab = 'reading' | 'twisters' | 'grammar' | 'conversation' | 'profile' | 'progress' | 'home' | 'practice' | 'design-system';

export interface AppShellProps {
  activeTab: AppNavTab;
  onTabChange: (tab: AppNavTab) => void;
  themeMode: ThemeMode;
  onThemeModeChange: (mode: ThemeMode) => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  activeTab,
  onTabChange,
  themeMode,
  onThemeModeChange,
  children
}) => {
  const primaryNavItems: { id: AppNavTab; label: string; icon: any }[] = [
    { id: 'reading', label: '200-Word Reading', icon: BookOpen },
    { id: 'twisters', label: 'Tongue Twisters', icon: Zap },
    { id: 'grammar', label: 'Words & Grammar', icon: Sparkles },
    { id: 'conversation', label: 'AI Coach', icon: MessageSquare },
    { id: 'profile', label: 'Profile & Settings', icon: User }
  ];

  return (
    <div className="app-container">
      {/* Desktop Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <BrandLogo size="md" showTagline={true} />
        </div>

        <nav className="sidebar-nav" aria-label="Main Navigation">
          {primaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => onTabChange(item.id)}
                id={`sidebar-nav-${item.id}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon size={19} />
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* Design System Preview Link */}
          <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-border-subtle)' }}>
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--color-text-muted)',
                paddingLeft: 'var(--space-3)',
                display: 'block',
                marginBottom: 'var(--space-1)'
              }}
            >
              Developer Preview
            </span>
            <button
              className={`nav-item ${activeTab === 'design-system' ? 'active' : ''}`}
              onClick={() => onTabChange('design-system')}
              id="sidebar-nav-design-system"
            >
              <Layers size={18} color="var(--color-accent)" />
              <span>UI Kit</span>
            </button>
          </div>
        </nav>

        {/* Sidebar Consistent Theme Control */}
        <div style={{ padding: 'var(--space-4)', borderTop: '1px solid var(--color-border-subtle)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--color-text-muted)',
                paddingLeft: 'var(--space-1)'
              }}
            >
              Theme
            </span>
            <ThemeToggle mode={themeMode} onModeChange={onThemeModeChange} variant="segmented" />
          </div>
        </div>
      </aside>

      {/* Main Wrapper */}
      <div className="main-wrapper">
        {/* Top Header (Desktop contextual + Mobile brand bar) */}
        <header className="top-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            {/* Mobile-only logo */}
            <div className="mobile-logo-wrapper" style={{ display: 'flex', alignItems: 'center' }}>
              <BrandLogo size="sm" showTagline={false} />
            </div>

            {/* Section title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <h2 className="typography-h3">
                {activeTab === 'reading'
                  ? 'Daily 200-Word Reading'
                  : activeTab === 'twisters'
                  ? 'Tongue Twisters'
                  : activeTab === 'grammar'
                  ? 'Words & Grammar Lab'
                  : activeTab === 'conversation'
                  ? 'Conversational AI Coach'
                  : activeTab === 'profile'
                  ? 'Profile & Settings'
                  : activeTab}
              </h2>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: 'var(--space-1) var(--space-2-5)',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-pill)',
                fontSize: 'var(--text-caption)',
                fontWeight: 700,
                color: 'var(--color-primary)'
              }}
            >
              <Calendar size={13} />
              <span>{new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
            </div>
            <ThemeToggle mode={themeMode} onModeChange={onThemeModeChange} variant="compact" />
          </div>
        </header>

        {/* Page Content Container */}
        <main className="main-content">
          {children}
        </main>

        {/* Mobile Bottom Navigation Dock */}
        <nav className="bottom-nav" aria-label="Mobile Navigation">
          {primaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className={`bottom-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => onTabChange(item.id)}
                id={`mobile-nav-${item.id}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
          {/* Mobile Design System Tab */}
          <button
            className={`bottom-nav-item ${activeTab === 'design-system' ? 'active' : ''}`}
            onClick={() => onTabChange('design-system')}
            id="mobile-nav-design-system"
          >
            <Layers size={20} />
            <span>UI Kit</span>
          </button>
        </nav>
      </div>
    </div>
  );
};
