import React from 'react';

export interface ProgressBarProps {
  percentage: number; // 0-100
  height?: number;   // default 6px
  color?: string;    // default var(--color-primary)
  showLabel?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  percentage,
  height = 6,
  color = 'var(--color-primary)',
  showLabel = false,
  className = ''
}) => {
  const clamped = Math.max(0, Math.min(100, percentage));

  return (
    <div className={`speakflow-progress-bar ${className}`} style={{ width: '100%' }}>
      {showLabel && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 'var(--space-1)' }}>
          <span style={{ fontSize: 'var(--text-caption)', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
            {clamped}%
          </span>
        </div>
      )}
      <div
        style={{
          width: '100%',
          height,
          backgroundColor: 'var(--color-bg-subtle)',
          borderRadius: 'var(--radius-pill)',
          overflow: 'hidden',
          border: '1px solid var(--color-border-subtle)'
        }}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          style={{
            height: '100%',
            width: `${clamped}%`,
            backgroundColor: color,
            borderRadius: 'var(--radius-pill)',
            transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        />
      </div>
    </div>
  );
};

export interface SkillScoreBarProps {
  label: string;
  score: number; // 0-100
  levelDescription?: string;
  color?: string;
}

export const SkillScoreBar: React.FC<SkillScoreBarProps> = ({
  label,
  score,
  levelDescription,
  color = 'var(--color-primary)'
}) => {
  return (
    <div style={{ marginBottom: 'var(--space-3)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-1)' }}>
        <div>
          <span style={{ fontSize: 'var(--text-body-sm)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            {label}
          </span>
          {levelDescription && (
            <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-muted)', marginLeft: 'var(--space-2)' }}>
              ({levelDescription})
            </span>
          )}
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-body-sm)', fontWeight: 700, color }}>
          {score}%
        </span>
      </div>
      <ProgressBar percentage={score} color={color} height={7} />
    </div>
  );
};
