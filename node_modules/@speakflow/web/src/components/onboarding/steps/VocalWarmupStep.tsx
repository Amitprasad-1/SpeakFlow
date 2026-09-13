import React, { useState } from 'react';
import { Button, Card, Badge } from '../../../design-system';
import { BASELINE_VOCAL_WARMUPS, BaselineVocalWarmup } from '@speakflow/core';
import { ArrowRight, Play, CheckCircle2, Sparkles, Volume2, Info } from 'lucide-react';

export interface VocalWarmupStepProps {
  onComplete: () => void;
  onSkip: () => void;
}

export const VocalWarmupStep: React.FC<VocalWarmupStepProps> = ({
  onComplete,
  onSkip
}) => {
  const [selectedWarmupIndex, setSelectedWarmupIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPracticed, setHasPracticed] = useState(false);

  const warmup = BASELINE_VOCAL_WARMUPS[selectedWarmupIndex] || BASELINE_VOCAL_WARMUPS[0];

  const handleSimulateWarmup = () => {
    setIsPlaying(true);
    setTimeout(() => {
      setIsPlaying(false);
      setHasPracticed(true);
    }, 3000);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
          <Sparkles size={18} color="var(--color-primary)" />
          <Badge variant="primary" size="sm">Optional Pre-Speech Prep</Badge>
        </div>
        <h2 className="typography-h2">Gentle Vocal Warm-Up</h2>
        <p className="typography-body" style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-1)' }}>
          Just like stretching before physical exercise, professional speakers take 15 seconds to relax facial muscles and warm up breath support.
        </p>
      </div>

      {/* Warmup tabs */}
      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
        {BASELINE_VOCAL_WARMUPS.map((w, idx) => (
          <button
            key={w.id}
            onClick={() => setSelectedWarmupIndex(idx)}
            style={{
              flex: 1,
              padding: 'var(--space-2-5) var(--space-2)',
              borderRadius: 'var(--radius-md)',
              background: selectedWarmupIndex === idx ? 'var(--color-primary-subtle)' : 'var(--color-surface)',
              border: `1.5px solid ${selectedWarmupIndex === idx ? 'var(--color-primary)' : 'var(--color-border)'}`,
              color: selectedWarmupIndex === idx ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              fontSize: 'var(--text-body-sm)',
              fontWeight: selectedWarmupIndex === idx ? 700 : 500,
              cursor: 'pointer',
              transition: 'all var(--motion-duration-fast) ease'
            }}
          >
            {w.title}
          </button>
        ))}
      </div>

      {/* Active Warmup Card */}
      <Card variant="elevated" padding="lg" style={{ textAlign: 'center' }}>
        <div style={{ maxWidth: '440px', margin: '0 auto' }}>
          <h3 className="typography-h3" style={{ marginBottom: 'var(--space-2)' }}>
            {warmup.title}
          </h3>
          <p className="typography-body" style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
            {warmup.description}
          </p>

          <div
            style={{
              background: 'var(--color-bg-subtle)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-4)',
              fontSize: 'var(--text-body-sm)',
              lineHeight: 1.6,
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--space-6)'
            }}
          >
            "{warmup.instruction}"
          </div>

          <Button
            variant={hasPracticed ? 'secondary' : 'primary'}
            size="md"
            onClick={handleSimulateWarmup}
            icon={hasPracticed ? <CheckCircle2 size={16} /> : <Volume2 size={16} />}
            disabled={isPlaying}
          >
            {isPlaying ? 'Listening & warming up (3s)...' : hasPracticed ? 'Practiced! Try again' : 'Practice with coach guide'}
          </Button>
        </div>
      </Card>

      {/* Non-medical disclaimer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          fontSize: 'var(--text-caption)',
          color: 'var(--color-text-muted)'
        }}
      >
        <Info size={14} style={{ flexShrink: 0 }} />
        <span>Vocal warm-ups are speech preparation exercises, not medical or clinical treatments.</span>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-2)' }}>
        <Button variant="ghost" size="md" onClick={onSkip}>
          Skip warm-up
        </Button>

        <Button
          variant="primary"
          size="lg"
          onClick={onComplete}
          icon={<ArrowRight size={18} />}
          id="btn-step-warmup-continue"
        >
          {hasPracticed ? 'Continue to Speaking Check' : 'Done, continue'}
        </Button>
      </div>
    </div>
  );
};
