import React from 'react';
import { Button, Card } from '../../../design-system';
import { Sparkles, ArrowRight, Shield, Clock, Award, CheckCircle2 } from 'lucide-react';
import { BrandLogo } from '../../common/BrandLogo';

export interface WelcomeStepProps {
  onStart: () => void;
  onSkip: () => void;
}

export const WelcomeStep: React.FC<WelcomeStepProps> = ({ onStart, onSkip }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        maxWidth: '580px',
        margin: '0 auto',
        padding: 'var(--space-4) 0'
      }}
    >
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <BrandLogo size="lg" showTagline={false} />
      </div>

      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          padding: 'var(--space-1) var(--space-3)',
          borderRadius: 'var(--radius-pill)',
          background: 'var(--color-primary-subtle)',
          color: 'var(--color-primary)',
          fontSize: 'var(--text-caption)',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: 'var(--space-3)'
        }}
      >
        <Sparkles size={14} />
        <span>Personalized English Coach</span>
      </div>

      <h1 className="typography-display" style={{ marginBottom: 'var(--space-3)', lineHeight: 1.15 }}>
        Let's understand how you communicate in English
      </h1>

      <p
        className="typography-body"
        style={{
          color: 'var(--color-text-secondary)',
          maxWidth: '52ch',
          marginBottom: 'var(--space-8)'
        }}
      >
        In about 3–5 minutes, SpeakFlow will guide you through a few friendly speaking, reading, and pronunciation exercises to build your personalized starting practice plan.
      </p>

      {/* Feature reassurance chips */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 'var(--space-3)',
          width: '100%',
          marginBottom: 'var(--space-8)'
        }}
      >
        <Card variant="default" padding="sm" style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Clock size={16} color="var(--color-primary)" />
          <span style={{ fontSize: 'var(--text-caption)', fontWeight: 600 }}>Short & friendly (~4 mins)</span>
        </Card>
        <Card variant="default" padding="sm" style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Award size={16} color="var(--color-accent)" />
          <span style={{ fontSize: 'var(--text-caption)', fontWeight: 600 }}>Not an exam or test</span>
        </Card>
        <Card variant="default" padding="sm" style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Shield size={16} color="var(--color-secondary)" />
          <span style={{ fontSize: 'var(--text-caption)', fontWeight: 600 }}>Private voice processing</span>
        </Card>
      </div>

      {/* Actions */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)',
          width: '100%',
          maxWidth: '360px'
        }}
      >
        <Button
          variant="primary"
          size="lg"
          onClick={onStart}
          icon={<ArrowRight size={18} />}
          id="btn-onboarding-start"
        >
          Let's begin
        </Button>

        <Button
          variant="ghost"
          size="md"
          onClick={onSkip}
          id="btn-onboarding-skip"
        >
          Skip for now
        </Button>
      </div>
    </div>
  );
};
