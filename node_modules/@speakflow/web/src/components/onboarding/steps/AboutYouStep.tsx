import React from 'react';
import { Button } from '../../../design-system';
import { OptionCard } from '../OptionCard';
import { SelfReportedLevel } from '@speakflow/core';
import { ArrowRight, User, Globe, HelpCircle } from 'lucide-react';

export interface AboutYouStepProps {
  name: string;
  onNameChange: (name: string) => void;
  preferredLanguage: string;
  onLanguageChange: (lang: string) => void;
  level: SelfReportedLevel;
  onLevelChange: (level: SelfReportedLevel) => void;
  onContinue: () => void;
}

export const AboutYouStep: React.FC<AboutYouStepProps> = ({
  name,
  onNameChange,
  preferredLanguage,
  onLanguageChange,
  level,
  onLevelChange,
  onContinue
}) => {
  const levels: { value: SelfReportedLevel; label: string; desc: string }[] = [
    { value: 'Beginner', label: 'Beginner (A1)', desc: 'Starting from simple everyday words and phrases' },
    { value: 'Elementary', label: 'Elementary (A2)', desc: 'Can understand basic questions and short answers' },
    { value: 'Intermediate', label: 'Intermediate (B1)', desc: 'Can hold simple conversations but pause for words' },
    { value: 'Upper Intermediate', label: 'Upper Intermediate (B2)', desc: 'Comfortable communicating; want natural rhythm & pronunciation' },
    { value: 'Advanced', label: 'Advanced (C1)', desc: 'Fluent; polishing professional nuance and articulation' },
    { value: 'Not sure', label: "I'm not sure", desc: 'No problem! Our short baseline exercises will help tailor your plan' }
  ];

  return (
    <div style={{ maxWidth: '580px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div>
        <h2 className="typography-h2">What should we call you?</h2>
        <p className="typography-body" style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-1)' }}>
          Tell us your name so your coach can address you personally.
        </p>

        <div style={{ marginTop: 'var(--space-4)' }}>
          <label
            htmlFor="onboarding-name-input"
            style={{ display: 'block', fontSize: 'var(--text-caption)', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 'var(--space-1)' }}
          >
            YOUR NAME
          </label>
          <input
            id="onboarding-name-input"
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="e.g. Alex, Maria, Rahul..."
            style={{
              width: '100%',
              padding: 'var(--space-3) var(--space-4)',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--color-border)',
              background: 'var(--color-surface)',
              color: 'var(--color-text-primary)',
              fontSize: 'var(--text-body)',
              fontFamily: 'var(--font-sans)',
              outline: 'none',
              transition: 'border-color var(--motion-duration-fast) ease'
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-primary)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border)';
            }}
          />
        </div>
      </div>

      <div>
        <h2 className="typography-h2">How would you describe your English today?</h2>
        <p className="typography-body" style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-1)' }}>
          Select the option that feels closest. You do not need to worry about being exact.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginTop: 'var(--space-4)' }}>
          {levels.map((lvl) => (
            <OptionCard
              key={lvl.value}
              id={`level-${lvl.value.toLowerCase().replace(/\s+/g, '-')}`}
              title={lvl.label}
              description={lvl.desc}
              selected={level === lvl.value}
              onSelect={() => onLevelChange(lvl.value)}
              badge={lvl.value === 'Not sure' ? 'Friendly' : undefined}
            />
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-4)' }}>
        <Button
          variant="primary"
          size="lg"
          onClick={onContinue}
          icon={<ArrowRight size={18} />}
          id="btn-step-about-continue"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};
