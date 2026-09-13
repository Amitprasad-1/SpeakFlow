import React from 'react';
import { Badge } from '../../design-system';
import { ArrowLeft, Clock } from 'lucide-react';

export interface DailyPracticeHeaderProps {
  currentStage: number; // 1 to 6
  totalStages: number;
  stageTitle: string;
  focusSound?: string;
  elapsedSeconds: number;
  onExit: () => void;
  onSelectStage: (stageNum: number) => void;
  completedStages: Set<number>;
}

export const DailyPracticeHeader: React.FC<DailyPracticeHeaderProps> = ({
  currentStage,
  totalStages,
  stageTitle,
  focusSound,
  elapsedSeconds,
  onExit,
  onSelectStage,
  completedStages
}) => {
  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {/* Top action row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--space-2)'
        }}
      >
        <button
          onClick={onExit}
          className="speakflow-btn btn-variant-ghost"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            padding: 'var(--space-2) var(--space-3)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--text-body-sm)',
            cursor: 'pointer'
          }}
          aria-label="Pause and return to dashboard"
        >
          <ArrowLeft size={16} />
          <span>Dashboard</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          {focusSound && <Badge variant="primary">Focus: {focusSound}</Badge>}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-1)',
              fontSize: 'var(--text-body-sm)',
              color: 'var(--color-text-secondary)',
              fontWeight: 600,
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              padding: 'var(--space-1) var(--space-2-5)',
              borderRadius: 'var(--radius-pill)'
            }}
          >
            <Clock size={14} color="var(--color-primary)" />
            <span>{formatTime(elapsedSeconds)}</span>
          </div>
        </div>
      </div>

      {/* Stage progress stepper */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${totalStages}, 1fr)`,
          gap: 'var(--space-2)'
        }}
        role="tablist"
        aria-label="Daily practice stages"
      >
        {Array.from({ length: totalStages }, (_, idx) => {
          const num = idx + 1;
          const isActive = num === currentStage;
          const isDone = completedStages.has(num);

          let bg = 'var(--color-surface)';
          let borderColor = 'var(--color-border)';
          let textColor = 'var(--color-text-secondary)';

          if (isActive) {
            bg = 'var(--color-primary-subtle)';
            borderColor = 'var(--color-primary)';
            textColor = 'var(--color-primary)';
          } else if (isDone) {
            bg = 'var(--color-surface-hover)';
            borderColor = 'var(--color-border-subtle)';
            textColor = 'var(--color-text-primary)';
          }

          return (
            <button
              key={num}
              onClick={() => onSelectStage(num)}
              role="tab"
              aria-selected={isActive}
              style={{
                padding: 'var(--space-2)',
                borderRadius: 'var(--radius-md)',
                background: bg,
                border: `1px solid ${borderColor}`,
                color: textColor,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all var(--motion-duration-fast) ease',
                outline: 'none'
              }}
            >
              <div style={{ fontSize: '0.6875rem', fontWeight: 700, opacity: 0.85 }}>
                {isDone ? '✓ ' : ''}STAGE {num}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
