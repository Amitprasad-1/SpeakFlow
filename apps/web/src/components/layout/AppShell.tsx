import React from 'react';
import { BrandLogo } from '../common/BrandLogo';
import { ThemeToggle, ThemeMode } from '../common/ThemeToggle';
import { InstallAppButton } from '../common/InstallAppButton';
import {
  BookOpen,
  Zap,
  Sparkles,
  MessageSquare,
  User,
  Layers,
  Calendar,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Languages
} from 'lucide-react';

export type AppNavTab = 'reading' | 'twisters' | 'grammar' | 'phrases' | 'conversation' | 'profile' | 'progress' | 'home' | 'practice' | 'design-system';

export interface AppShellProps {
  activeTab: AppNavTab;
  onTabChange: (tab: AppNavTab) => void;
  themeMode: ThemeMode;
  onThemeModeChange: (mode: ThemeMode) => void;
  currentDate?: string;
  onDateChange?: (newDate: string) => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  activeTab,
  onTabChange,
  themeMode,
  onThemeModeChange,
  currentDate,
  onDateChange,
  children
}) => {
  const todayStr = React.useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, []);

  const isToday = !currentDate || currentDate === todayStr;

  const handleShiftDay = (offset: number) => {
    if (!onDateChange) return;
    const base = currentDate ? new Date(`${currentDate}T00:00:00`) : new Date();
    base.setDate(base.getDate() + offset);
    const y = base.getFullYear();
    const m = String(base.getMonth() + 1).padStart(2, '0');
    const d = String(base.getDate()).padStart(2, '0');
    onDateChange(`${y}-${m}-${d}`);
  };

  const formattedDateLabel = React.useMemo(() => {
    const active = currentDate ? new Date(`${currentDate}T00:00:00`) : new Date();
    const today = new Date(`${todayStr}T00:00:00`);
    const diffDays = Math.round((active.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    const dateShort = active.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    if (diffDays === 0) return `Today · ${dateShort}`;
    if (diffDays === 1) return `Tomorrow · ${dateShort}`;
    if (diffDays === -1) return `Yesterday · ${dateShort}`;
    return dateShort;
  }, [currentDate, todayStr]);

  const formattedShortDate = React.useMemo(() => {
    const active = currentDate ? new Date(`${currentDate}T00:00:00`) : new Date();
    const today = new Date(`${todayStr}T00:00:00`);
    const diffDays = Math.round((active.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    return active.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }, [currentDate, todayStr]);

  const primaryNavItems: { id: AppNavTab; label: string; mobileLabel: string; icon: any }[] = [
    { id: 'reading', label: '200-Word Reading', mobileLabel: 'Reading', icon: BookOpen },
    { id: 'twisters', label: 'Tongue Twisters', mobileLabel: 'Twisters', icon: Zap },
    { id: 'grammar', label: 'Words & Grammar', mobileLabel: 'Grammar', icon: Sparkles },
    { id: 'phrases', label: 'Daily Phrases (हिंदी)', mobileLabel: 'Phrases', icon: Languages },
    { id: 'conversation', label: 'AI Coach', mobileLabel: 'AI Coach', icon: MessageSquare },
    { id: 'profile', label: 'Profile & Settings', mobileLabel: 'Profile', icon: User }
  ];

  const [isSidebarHovered, setIsSidebarHovered] = React.useState(false);

  return (
    <div className="app-container">
      {/* Desktop Sidebar Navigation (Folded by default, unfolds smoothly on hover) */}
      <aside
        className={`sidebar ${isSidebarHovered ? 'expanded' : 'folded'}`}
        onMouseEnter={() => setIsSidebarHovered(true)}
        onMouseLeave={() => setIsSidebarHovered(false)}
        aria-label="Sidebar Navigation"
      >
        <div className="sidebar-logo">
          <BrandLogo size="md" showTagline={isSidebarHovered} collapsed={!isSidebarHovered} />
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
                title={item.label}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon size={19} />
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* Design System Preview Link */}
          <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-border-subtle)' }}>
            {isSidebarHovered && (
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
            )}
            <button
              className={`nav-item ${activeTab === 'design-system' ? 'active' : ''}`}
              onClick={() => onTabChange('design-system')}
              id="sidebar-nav-design-system"
              title="UI Kit (Developer Preview)"
            >
              <Layers size={18} color="var(--color-accent)" />
              <span>UI Kit</span>
            </button>
          </div>
        </nav>

        {/* Sidebar Consistent Theme Control */}
        <div
          style={{
            padding: isSidebarHovered ? 'var(--space-4)' : 'var(--space-3) 8px',
            borderTop: '1px solid var(--color-border-subtle)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          {isSidebarHovered ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', width: '100%' }}>
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
          ) : (
            <ThemeToggle mode={themeMode} onModeChange={onThemeModeChange} variant="compact" iconOnly={true} />
          )}
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

            {/* Section title (Desktop only, hidden on mobile) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <h2 className="typography-h3 header-section-title">
                {activeTab === 'reading'
                  ? 'Daily 200-Word Reading'
                  : activeTab === 'twisters'
                  ? 'Tongue Twisters'
                  : activeTab === 'grammar'
                  ? 'Words & Grammar Lab'
                  : activeTab === 'phrases'
                  ? 'Daily Phrases (हिंदी)'
                  : activeTab === 'conversation'
                  ? 'Conversational AI Coach'
                  : activeTab === 'profile'
                  ? 'Profile & Settings'
                  : activeTab}
              </h2>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            {/* Interactive Day Switcher */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '2px',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-pill)',
                padding: '2px 4px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
              }}
              title="Daily Refresh: SpeakFlow automatically updates everyday! Click ◀ or ▶ to preview yesterday, today, or tomorrow."
            >
              <button
                type="button"
                onClick={() => handleShiftDay(-1)}
                aria-label="Previous Day"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--color-text-secondary)',
                  cursor: 'pointer'
                }}
              >
                <ChevronLeft size={16} />
              </button>

              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '2px 6px',
                  fontSize: 'var(--text-caption)',
                  fontWeight: 700,
                  color: isToday ? 'var(--color-primary)' : 'var(--color-accent)',
                  whiteSpace: 'nowrap'
                }}
              >
                <Calendar size={13} />
                <span className="desktop-date-text">{formattedDateLabel}</span>
                <span className="mobile-date-text">{formattedShortDate}</span>
              </div>

              <button
                type="button"
                onClick={() => handleShiftDay(1)}
                aria-label="Next Day"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--color-text-secondary)',
                  cursor: 'pointer'
                }}
              >
                <ChevronRight size={16} />
              </button>

              {!isToday && onDateChange && (
                <button
                  type="button"
                  onClick={() => onDateChange(todayStr)}
                  title="Reset to today"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px',
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-primary-light)',
                    background: 'var(--color-primary-subtle)',
                    color: 'var(--color-primary)',
                    cursor: 'pointer',
                    marginLeft: '2px'
                  }}
                >
                  <RotateCcw size={10} />
                  <span>Today</span>
                </button>
              )}
            </div>

            <div className="header-install-btn">
              <InstallAppButton />
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
                <Icon size={19} />
                <span>{item.mobileLabel}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
