import React from 'react';
import {
  Card,
  Badge,
  ProgressRing,
  SkillScoreBar,
  SectionHeader
} from '../../design-system';
import { demoProgress, ProgressSummaryData } from '../../data/demoData';
import { Volume2, Info } from 'lucide-react';

export interface ProgressViewProps {
  progress?: ProgressSummaryData;
}

export const ProgressView: React.FC<ProgressViewProps> = ({
  progress = demoProgress
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      {/* Overview Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
          <Badge variant="focus">Progress Overview</Badge>
          <Badge variant="level">Sample Preview</Badge>
        </div>
        <h1 className="typography-h1">Speech & Communication Progress</h1>
        <p className="typography-body" style={{ marginTop: 'var(--space-1)', maxWidth: '65ch' }}>
          Track your pronunciation clarity, speaking pace, and consistency across daily practice sessions.
        </p>
      </div>

      {/* Notice Banner: Demo / Sample Data */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
          padding: 'var(--space-3) var(--space-4)',
          background: 'var(--color-info-subtle)',
          border: '1px solid var(--color-info)',
          borderRadius: 'var(--radius-md)',
          fontSize: 'var(--text-body-sm)',
          color: 'var(--color-text-primary)'
        }}
      >
        <Info size={18} color="var(--color-info)" style={{ flexShrink: 0 }} />
        <span>
          <strong>Sample data preview:</strong> The metrics below illustrate how your progress will be presented once you complete your daily practice sessions.
        </span>
      </div>

      {/* Top 3 Progress Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
        <Card variant="default" padding="md" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <ProgressRing percentage={progress.pronunciationScore} color="var(--color-primary)" />
          <div>
            <div className="typography-h3">Pronunciation</div>
            <div className="typography-caption" style={{ color: 'var(--color-text-secondary)' }}>Clarity score (Sample)</div>
          </div>
        </Card>

        <Card variant="default" padding="md" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <ProgressRing percentage={progress.fluencyScore} color="var(--color-accent)" />
          <div>
            <div className="typography-h3">Speaking Rhythm</div>
            <div className="typography-caption" style={{ color: 'var(--color-text-secondary)' }}>Flow & sentence pacing</div>
          </div>
        </Card>

        <Card variant="default" padding="md" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <ProgressRing percentage={progress.speakingPaceWpm} label={`${progress.speakingPaceWpm}`} color="var(--color-warning)" />
          <div>
            <div className="typography-h3">Speaking Tempo</div>
            <div className="typography-caption" style={{ color: 'var(--color-text-secondary)' }}>Words per minute (Target: 130-150)</div>
          </div>
        </Card>
      </div>

      {/* Skill Breakdown */}
      <Card variant="default" padding="lg">
        <SectionHeader
          title="Skill Areas"
          subtitle="Key areas to focus on for professional English communication."
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {progress.skills.map((skill, i) => (
            <SkillScoreBar
              key={i}
              label={skill.label}
              score={skill.score}
              levelDescription={skill.description}
              color={i === 0 ? 'var(--color-primary)' : i === 1 ? 'var(--color-accent)' : 'var(--color-secondary)'}
            />
          ))}
        </div>
      </Card>

      {/* Pronunciation Focus Areas */}
      <section>
        <SectionHeader
          title="Pronunciation Focus Areas"
          subtitle="Sounds that benefit from regular tongue-twister and sentence practice."
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 'var(--space-3)' }}>
          {progress.soundMatrix.map((item, i) => {
            const isNeedPractice = item.status === 'Needs Practice';
            const isDeveloping = item.status === 'Developing';

            return (
              <Card
                key={i}
                variant="default"
                padding="sm"
                style={{
                  borderLeft: `4px solid ${
                    isNeedPractice
                      ? 'var(--color-error)'
                      : isDeveloping
                      ? 'var(--color-warning)'
                      : 'var(--color-success)'
                  }`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 'var(--text-body-sm)', fontWeight: 700 }}>{item.sound}</span>
                  <span
                    style={{
                      fontSize: 'var(--text-caption)',
                      fontWeight: 700,
                      color:
                        isNeedPractice
                          ? 'var(--color-error)'
                          : isDeveloping
                          ? 'var(--color-warning)'
                          : 'var(--color-success)'
                    }}
                  >
                    {item.status}
                  </span>
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: 'var(--space-1)', color: 'var(--color-text-primary)' }}>
                  {item.score}%
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Words to Practice */}
      <section>
        <SectionHeader
          title="Words for Practice"
          subtitle="Multisyllabic words with challenging consonant clusters to review."
        />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
          {progress.frequentWords.map((word, i) => (
            <div
              key={i}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                padding: 'var(--space-1-5) var(--space-3)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-body-sm)'
              }}
            >
              <span>{word}</span>
              <Volume2 size={14} color="var(--color-primary)" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
