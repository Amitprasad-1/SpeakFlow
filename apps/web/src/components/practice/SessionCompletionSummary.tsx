import React from 'react';
import { Card, Badge, StreakCard } from '../../design-system';
import { DailyPracticeSession } from '@speakflow/core';
import { CheckCircle2, Clock, Flame, ArrowRight, RotateCcw, Sparkles } from 'lucide-react';

export interface SessionCompletionSummaryProps {
  session: DailyPracticeSession;
  onDoneForToday: () => void;
  onReviewPractice: () => void;
  streakCount: number;
}

export const SessionCompletionSummary: React.FC<SessionCompletionSummaryProps> = ({
  session,
  onDoneForToday,
  onReviewPractice,
  streakCount
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', maxWidth: '680px', margin: '0 auto', textAlign: 'center' }}>
      <Card variant="elevated" padding="lg">
        {/* Celebration Header */}
        <div
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: 'var(--color-primary-subtle)',
            border: '2px solid var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto var(--space-4)'
          }}
        >
          <CheckCircle2 size={36} color="var(--color-primary)" />
        </div>

        <Badge variant="primary" style={{ marginBottom: 'var(--space-2)' }}>
          Session Complete
        </Badge>

        <h1 className="typography-h1" style={{ marginBottom: 'var(--space-2)' }}>
          Practice Complete!
        </h1>
        <p className="typography-body" style={{ color: 'var(--color-text-secondary)', maxWidth: '480px', margin: '0 auto var(--space-6)' }}>
          Great dedication. You completed all 6 stages of today's English communication workout.
        </p>

        {/* Practice Stats Summary Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: 'var(--space-3)',
            marginBottom: 'var(--space-6)',
            textAlign: 'center'
          }}
        >
          <div style={{ padding: 'var(--space-4)', background: 'var(--color-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
              Practice Time
            </div>
            <div style={{ fontSize: 'var(--text-h2)', fontWeight: 800, color: 'var(--color-text-primary)' }}>
              15 mins
            </div>
            <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)' }}>Daily target met</span>
          </div>

          <div style={{ padding: 'var(--space-4)', background: 'var(--color-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
              Stages Done
            </div>
            <div style={{ fontSize: 'var(--text-h2)', fontWeight: 800, color: 'var(--color-primary)' }}>
              6 / 6
            </div>
            <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)' }}>All exercises finished</span>
          </div>

          <div style={{ padding: 'var(--space-4)', background: 'var(--color-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
              Daily Streak
            </div>
            <div style={{ fontSize: 'var(--text-h2)', fontWeight: 800, color: 'var(--color-accent)' }}>
              {streakCount} Days
            </div>
            <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)' }}>Active streak active</span>
          </div>
        </div>

        {/* Coach Daily Insight */}
        <div
          style={{
            padding: 'var(--space-4)',
            background: 'var(--color-surface-hover)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border-subtle)',
            textAlign: 'left',
            marginBottom: 'var(--space-8)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
            <Sparkles size={16} color="var(--color-primary)" />
            <div style={{ fontWeight: 700, fontSize: 'var(--text-body-sm)', color: 'var(--color-text-primary)' }}>
              Coach Insight for Today:
            </div>
          </div>
          <p style={{ margin: 0, fontSize: 'var(--text-body-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
            Your rhythm across practical workplace sentences was clear and steady. Continue pausing slightly before operative nouns during tomorrow's practice.
          </p>
        </div>

        {/* Primary and Secondary CTA */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <button
            onClick={onDoneForToday}
            className="speakflow-btn btn-variant-primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: 'var(--space-3) var(--space-6)',
              borderRadius: 'var(--radius-md)',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <span>Done for Today</span>
            <ArrowRight size={18} />
          </button>

          <button
            onClick={onReviewPractice}
            className="speakflow-btn btn-variant-secondary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: 'var(--space-3) var(--space-5)',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <RotateCcw size={16} />
            <span>Review Today's Practice</span>
          </button>
        </div>
      </Card>
    </div>
  );
};
