import React from 'react';
import { Card, Badge, SectionHeader } from '../../design-system';
import { ThemeToggle, ThemeMode } from '../common/ThemeToggle';
import {
  UserProfileData,
  demoUser,
  demoStreak,
  demoProgress,
  StreakData,
  ProgressSummaryData
} from '../../data/demoData';
import { Shield, CheckCircle2, UserCheck, Clock, Flame, Award, Smartphone } from 'lucide-react';
import { InstallAppButton } from '../common/InstallAppButton';
import { AISettingsCard } from '../common/AISettingsCard';

import { BrowserStorage } from '../../storage/BrowserStorage';

export interface ProfileViewProps {
  user?: UserProfileData;
  streak?: StreakData;
  progress?: ProgressSummaryData;
  themeMode: ThemeMode;
  onThemeModeChange: (mode: ThemeMode) => void;
  onUpdateUser?: (updated: Partial<UserProfileData>) => void;
  onRetakeAssessment?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user = demoUser,
  streak = demoStreak,
  progress = demoProgress,
  themeMode,
  onThemeModeChange,
  onRetakeAssessment
}) => {
  const savedProfile = BrowserStorage.getUserProfile();
  const effectiveStreak = savedProfile?.streak?.currentStreak ?? streak.currentStreak;
  const effectiveMinutes = savedProfile?.totalMinutesPracticed ?? progress.totalMinutesPracticed;
  const effectiveSessions = savedProfile?.completedLessonsCount ?? progress.completedSessionsCount;
  const initials =
    user.avatarInitials ||
    (user.name
      ? user.name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)
      : 'SF');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      {/* Profile Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--space-4)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 'var(--radius-pill)',
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '1.5rem',
              fontWeight: 700,
              boxShadow: 'var(--shadow-glow)'
            }}
            aria-label={`Avatar for ${user.name}`}
          >
            {initials}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <h1 className="typography-h1">{user.name}</h1>
              <Badge variant="success" size="sm" icon={<UserCheck size={12} />}>
                Active Learner
              </Badge>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-1)', flexWrap: 'wrap' }}>
              <Badge variant="level">{user.level}</Badge>
              <Badge variant="focus">{user.dailyGoalMinutes} Mins / Day Target</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Settings & Theme */}
      <Card variant="default" padding="md">
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-3)'
          }}
        >
          <div>
            <h3 className="typography-h3">Application Theme Styles</h3>
            <p className="typography-body-sm" style={{ color: 'var(--color-text-secondary)', marginTop: '2px' }}>
              Choose from 5 curated aesthetic color palettes. Your choice is saved locally and applies instantly.
            </p>
          </div>
          <ThemeToggle mode={themeMode} onModeChange={onThemeModeChange} variant="cards" />
        </div>
      </Card>

      {/* Assessment & Baseline Section */}
      <Card variant="default" padding="md">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 'var(--space-4)'
          }}
        >
          <div>
            <h3 className="typography-h3">Personalized Baseline Assessment</h3>
            <p className="typography-body-sm" style={{ color: 'var(--color-text-secondary)', marginTop: '2px' }}>
              Your speech baseline tunes your daily practice goals and pronunciation focus sounds.
            </p>
          </div>
          {onRetakeAssessment && (
            <button
              onClick={onRetakeAssessment}
              className="speakflow-btn btn-variant-secondary"
              style={{
                padding: 'var(--space-2) var(--space-4)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-body-sm)',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Retake Assessment
            </button>
          )}
        </div>
      </Card>

      {/* Active Communication Goals */}
      <Card variant="default" padding="lg">
        <SectionHeader
          title="Active Communication Goals"
          subtitle="Your personalized daily practice lessons adapt to these communication priorities."
        />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
          {user.goals.map((goal, i) => (
            <Badge key={i} variant="primary" icon={<CheckCircle2 size={13} />}>
              {goal}
            </Badge>
          ))}
        </div>
      </Card>

      {/* Account Performance Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
        <Card variant="default" padding="md" style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-2)' }}>
            <Flame size={24} color="var(--color-warning)" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-warning)' }}>
            {effectiveStreak} Days
          </div>
          <div className="typography-body-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Active Practice Streak
          </div>
        </Card>

        <Card variant="default" padding="md" style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-2)' }}>
            <Clock size={24} color="var(--color-primary)" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-primary)' }}>
            {effectiveMinutes} Mins
          </div>
          <div className="typography-body-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Total Practice Completed
          </div>
        </Card>

        <Card variant="default" padding="md" style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-2)' }}>
            <Award size={24} color="var(--color-accent)" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-accent)' }}>
            {effectiveSessions} Sessions
          </div>
          <div className="typography-body-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Lessons Finished
          </div>
        </Card>
      </div>

      {/* Google Gemini AI Speech Coach Configuration */}
      <AISettingsCard />

      {/* Standalone Native App Installation */}
      <Card variant="elevated" padding="lg">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Smartphone size={18} color="var(--color-primary)" />
              <h3 className="typography-h3" style={{ margin: 0 }}>Install SpeakFlow App</h3>
            </div>
            <p className="typography-body-sm" style={{ color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.5 }}>
              Install SpeakFlow as a native app on your phone or laptop for full-screen practice without browser address bars, fast launching, and offline support.
            </p>
          </div>
          <InstallAppButton />
        </div>
      </Card>

      {/* Voice Privacy Notice */}
      <Card variant="default" padding="md">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
          <Shield size={18} color="var(--color-primary)" />
          <h3 className="typography-h3">Voice Privacy by Design</h3>
        </div>
        <p className="typography-body-sm" style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
          All microphone audio is processed locally for pronunciation evaluation. No audio recordings are permanently stored on remote servers or shared with third parties.
        </p>
      </Card>
    </div>
  );
};
