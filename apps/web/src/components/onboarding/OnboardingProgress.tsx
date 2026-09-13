import React from 'react';
import { ArrowLeft, X } from 'lucide-react';
import { Button } from '../../design-system';

export interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
  stepLabel?: string;
  onBack?: () => void;
  onPause?: () => void;
  canGoBack?: boolean;
}

export const OnboardingProgress: React.FC<OnboardingProgressProps> = ({
  currentStep,
  totalSteps,
  stepLabel,
  onBack,
  onPause,
  canGoBack = true
}) => {
  const percentage = Math.min(100, Math.max(0, (currentStep / totalSteps) * 100));

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-2)',
        marginBottom: 'var(--space-6)',
        width: '100%'
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          minHeight: '36px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          {canGoBack && onBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              icon={<ArrowLeft size={16} />}
              aria-label="Previous question"
            >
              Back
            </Button>
          )}
          {stepLabel && (
            <span
              style={{
                fontSize: 'var(--text-caption)',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--color-primary)'
              }}
            >
              {stepLabel}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <span
            style={{
              fontSize: 'var(--text-caption)',
              fontWeight: 600,
              color: 'var(--color-text-muted)'
            }}
          >
            {currentStep} of {totalSteps}
          </span>
          {onPause && (
            <button
              onClick={onPause}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--color-text-muted)',
                fontSize: 'var(--text-caption)',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: 'var(--space-1) var(--space-2)',
                borderRadius: 'var(--radius-sm)'
              }}
              title="Save progress and resume later"
              aria-label="Pause onboarding and resume later"
            >
              <X size={14} />
              <span>Save & Exit</span>
            </button>
          )}
        </div>
      </div>

      {/* Gentle, non-stressful progress bar */}
      <div
        style={{
          width: '100%',
          height: '4px',
          borderRadius: 'var(--radius-pill)',
          background: 'var(--color-border)',
          overflow: 'hidden'
        }}
        role="progressbar"
        aria-valuenow={currentStep}
        aria-valuemin={1}
        aria-valuemax={totalSteps}
        aria-label={`Step ${currentStep} of ${totalSteps}`}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: '100%',
            background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))',
            borderRadius: 'var(--radius-pill)',
            transition: 'width var(--motion-duration-normal) var(--motion-ease-out)'
          }}
        />
      </div>
    </div>
  );
};
