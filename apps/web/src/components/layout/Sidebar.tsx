import React from 'react';
import { useApp, AppView } from '../../store/AppContext';
import { Home, Mic, BarChart3, User, Sparkles, AudioLines } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { currentView, setCurrentView, user, startDailyPractice } = useApp();

  const navItems: { id: AppView; label: string; icon: any }[] = [
    { id: 'home', label: 'Dashboard', icon: Home },
    { id: 'practice', label: 'Daily Practice', icon: Mic },
    { id: 'progress', label: 'Progress & Weaknesses', icon: BarChart3 },
    { id: 'profile', label: 'Learner Profile', icon: User }
  ];

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-logo">
        <div className="logo-icon">
          <AudioLines size={20} />
        </div>
        <div>
          <span style={{ letterSpacing: '-0.02em' }}>SpeakFlow</span>
          <span style={{ fontSize: '0.6875rem', display: 'block', color: 'var(--color-primary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            AI Speech Coach
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => {
                if (item.id === 'practice') {
                  startDailyPractice(0);
                } else {
                  setCurrentView(item.id);
                }
              }}
            >
              <Icon size={19} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom CTA Card */}
      <div style={{ padding: 'var(--space-4)' }}>
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(99, 102, 241, 0.12))',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-4)',
            textAlign: 'center'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-2)' }}>
            <Sparkles size={20} color="var(--color-primary)" />
          </div>
          <h4 style={{ fontSize: '0.875rem', marginBottom: 'var(--space-1)' }}>Daily Speech Lab</h4>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-3)' }}>
            Targeting /r/ vs /l/ and complex articulation today.
          </p>
          <button
            className="btn btn-primary"
            style={{ width: '100%', fontSize: '0.8125rem', padding: '0.45rem' }}
            onClick={() => startDailyPractice(0)}
          >
            Start Practice
          </button>
        </div>
      </div>
    </aside>
  );
};
