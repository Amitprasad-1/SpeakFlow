import React from 'react';
import { Button } from '../../../design-system';
import { OptionCard } from '../OptionCard';
import { PracticeDurationChoice, SpeakingConfidenceLevel } from '@speakflow/core';
import { ArrowRight, Clock, Smile, Sparkles } from 'lucide-react';

export interface PreferencesStepProps {
  duration: PracticeDurationChoice;
  onDurationChange: (duration: PracticeDurationChoice) => void;
  confidence: SpeakingConfidenceLevel;
  onConfidenceChange: (confidence: SpeakingConfidenceLevel) => void;
  onContinue: () => void;
}

export const PreferencesStep: React.FC<PreferencesStepProps> = ({
  duration,
  onDurationChange,
  confidence,
  onConfidenceChange,
  onContinue
}) => {
  const durations: { value: PracticeDurationChoice; label: string; desc: string; badge?: string }[] = [
    { value: 5, label: '5 minutes / day', desc: 'A quick, low-pressure daily warm-up' },
    { value: 10, label: '10 minutes / day', desc: 'Steady, consistent pronunciation practice' },
    { value: 15, label: '15 minutes / day', desc: 'Recommended: Full 6-exercise practice routine', badge: 'Recommended' },
    { value: 20, label: '20 minutes / day', desc: 'Focused improvement with extra speaking time' },
    { value: 30, label: '30 minutes / day', desc: 'Intensive immersion for upcoming interviews' },
    { value: 'undecided', label: "I'll decide later", desc: 'Start with 15 minutes and adjust anytime in settings' }
  ];

  const confidenceLevels: { value: SpeakingConfidenceLevel; label: string; emoji: string; desc: string }[] = [
    { value: 'very_uncomfortable', label: 'Very uncomfortable', emoji: '😟', desc: 'I hesitate often and feel nervous' },
    { value: 'a_little_uncomfortable', label: 'A little uncomfortable', emoji: '😐', desc: 'I can speak, but I worry about mistakes' },
    { value: 'okay', label: 'Okay', emoji: '🙂', desc: 'Comfortable in casual chats, want polish' },
    { value: 'comfortable', label: 'Comfortable', emoji: '😊', desc: 'Speak well, working on nuance & rhythm' },
    { value: 'very_comfortable', label: 'Very comfortable', emoji: '🌟', desc: 'Confident, polishing executive delivery' }
  ];

  return (
    <div style={{ maxWidth: '620px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      {/* 1. Daily Commitment */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
          <Clock size={18} color="var(--color-primary)" />
          <h2 className="typography-h2">Daily Practice Duration</h2>
        </div>
        <p className="typography-body" style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
          How many minutes can you comfortably invest each day? Consistency is far more effective than long occasional sessions.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: 'var(--space-2)' }}>
          {durations.map((d) => (
            <OptionCard
              key={String(d.value)}
              id={`duration-${d.value}`}
              title={d.label}
              description={d.desc}
              badge={d.badge}
              selected={duration === d.value}
              onSelect={() => onDurationChange(d.value)}
            />
          ))}
        </div>
      </div>

      {/* 2. Speaking Confidence */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
          <Smile size={18} color="var(--color-accent)" />
          <h2 className="typography-h2">How comfortable are you speaking English right now?</h2>
        </div>
        <p className="typography-body" style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
          This is a self-reported baseline, not a test score. We use this only to pace your initial exercises gently.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {confidenceLevels.map((c) => (
            <OptionCard
              key={c.value}
              id={`conf-${c.value}`}
              title={`${c.emoji} ${c.label}`}
              description={c.desc}
              selected={confidence === c.value}
              onSelect={() => onConfidenceChange(c.value)}
            />
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
        <Button
          variant="primary"
          size="lg"
          onClick={onContinue}
          icon={<ArrowRight size={18} />}
          id="btn-step-pref-continue"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};
