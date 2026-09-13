import React from 'react';
import { useApp } from '../../store/AppContext';
import {
  User,
  Target,
  Clock,
  Flame,
  Award,
  Settings,
  Shield,
  CheckCircle2,
  Sliders
} from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { user, setShowSettingsModal } = useApp();

  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: 'var(--space-6)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-8)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 'var(--radius-full)',
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '1.75rem',
              fontWeight: 800,
              boxShadow: 'var(--shadow-glow)'
            }}
          >
            {user.name.charAt(0)}
          </div>
          <div>
            <h1 style={{ fontSize: '1.875rem' }}>{user.name}</h1>
            <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: '4px' }}>
              <span className="badge badge-level">{user.level}</span>
              <span className="badge badge-focus">{user.dailyGoalMinutes} min/day commitment</span>
            </div>
          </div>
        </div>

        <button className="btn btn-secondary" onClick={() => setShowSettingsModal(true)}>
          <Settings size={18} />
          <span>Settings</span>
        </button>
      </div>

      {/* Selected Goals */}
      <div className="card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
        <h3 style={{ fontSize: '1.125rem', marginBottom: 'var(--space-4)' }}>Active Learning Goals</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
          {user.goals.map((g, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                background: 'var(--color-primary-light)',
                color: 'var(--color-primary)',
                padding: 'var(--space-2) var(--space-4)',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.875rem',
                fontWeight: 600
              }}
            >
              <CheckCircle2 size={16} />
              <span>{g}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Account Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-primary)' }}>
            {user.streak.currentStreak}
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Day Streak
          </div>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-secondary)' }}>
            {user.totalMinutesPracticed}
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Minutes Practiced
          </div>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#06b6d4' }}>
            {user.completedLessonsCount}
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Lessons Completed
          </div>
        </div>
      </div>

      {/* Architecture & Multi-Platform Commercial Roadmap Info */}
      <div className="card" style={{ padding: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
          <Shield size={18} color="var(--color-primary)" />
          <h3 style={{ fontSize: '1.125rem' }}>Multi-Platform Commercial Architecture</h3>
        </div>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: 'var(--space-4)' }}>
          SpeakFlow runs on a shared core engine (`@speakflow/core`) decoupling business domain logic, speech analysis, and AI providers from UI presentation. The companion native mobile client for Android and iOS operates from the identical logic core using native audio threads and haptic feedback.
        </p>

        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <span className="badge" style={{ background: 'var(--color-bg-subtle)' }}>Web App: Active</span>
          <span className="badge" style={{ background: 'var(--color-bg-subtle)' }}>iOS TestFlight: Ready Blueprint</span>
          <span className="badge" style={{ background: 'var(--color-bg-subtle)' }}>Android Play Store: Ready Blueprint</span>
        </div>
      </div>
    </div>
  );
};
