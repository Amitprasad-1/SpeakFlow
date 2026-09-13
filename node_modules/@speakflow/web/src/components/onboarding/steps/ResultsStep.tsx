import React from 'react';
import { Button, Card, Badge, SectionHeader } from '../../../design-system';
import { BaselineAssessment, RecommendedPracticePlan } from '@speakflow/core';
import {
  Sparkles,
  CheckCircle2,
  Target,
  ArrowRight,
  Clock,
  Award,
  Layers,
  Flame,
  UserCheck
} from 'lucide-react';

export interface ResultsStepProps {
  assessment: BaselineAssessment;
  plan: RecommendedPracticePlan;
  strengths: string[];
  focusAreas: string[];
  onStartPractice: () => void;
  onReviewProfile: () => void;
}

export const ResultsStep: React.FC<ResultsStepProps> = ({
  assessment,
  plan,
  strengths,
  focusAreas,
  onStartPractice,
  onReviewProfile
}) => {
  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Header */}
      <div style={{ textAlign: 'center' }}>
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
          <span>Baseline Assessment Complete</span>
        </div>

        <h1 className="typography-h1" style={{ marginBottom: 'var(--space-2)' }}>
          Your SpeakFlow Starting Profile
        </h1>
        <p className="typography-body" style={{ color: 'var(--color-text-secondary)', maxWidth: '52ch', margin: '0 auto' }}>
          Great job! Based on your communication goals and speech patterns, here is your personalized roadmap.
        </p>
      </div>

      {/* Starting Profile Summary Card */}
      <Card variant="elevated" padding="lg">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 'var(--radius-pill)',
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '1.25rem'
              }}
            >
              {assessment.name.slice(0, 2).toUpperCase() || 'SF'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <h3 className="typography-h3">{assessment.name || 'Learner'}</h3>
                <Badge variant="success" size="sm" icon={<UserCheck size={12} />}>
                  Ready to Flow
                </Badge>
              </div>
              <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)' }}>
                Level: {assessment.selfReportedLevel} • {assessment.dailyPracticePreference} mins / day
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-6)' }}>
          {/* Strengths */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
              <Award size={18} color="var(--color-primary)" />
              <h4 className="typography-h3" style={{ fontSize: '1rem' }}>Your Strengths</h4>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {strengths.map((str, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)', fontSize: 'var(--text-body-sm)' }}>
                  <CheckCircle2 size={16} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{str}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Focus Areas */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
              <Target size={18} color="var(--color-accent)" />
              <h4 className="typography-h3" style={{ fontSize: '1rem' }}>Your Focus Areas</h4>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {focusAreas.map((area, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)', fontSize: 'var(--text-body-sm)' }}>
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 'var(--radius-pill)',
                      background: 'var(--color-accent)',
                      flexShrink: 0,
                      marginTop: '7px'
                    }}
                  />
                  <span>{area}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Recommended First Session Card */}
      <Card
        variant="default"
        padding="lg"
        style={{
          background: 'linear-gradient(135deg, var(--color-surface) 0%, var(--color-bg-subtle) 100%)',
          borderLeft: '4px solid var(--color-primary)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Clock size={18} color="var(--color-primary)" />
            <h3 className="typography-h3">Today's Recommended Session</h3>
          </div>
          <Badge variant="primary">
            {plan.durationMinutes} mins • {plan.activitiesCount} exercises
          </Badge>
        </div>

        <p className="typography-body-sm" style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
          Your first personalized practice session is ready. It targets <strong>{plan.primarySound.replace('_', ' / ')}</strong> articulation and continuous conversational pacing.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-2)', fontSize: 'var(--text-caption)' }}>
          {plan.activitiesSummary.map((item, i) => (
            <div
              key={i}
              style={{
                padding: 'var(--space-2) var(--space-3)',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--color-text-primary)'
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </Card>

      {/* Action Buttons */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--space-3)',
          marginTop: 'var(--space-4)'
        }}
      >
        <Button
          variant="secondary"
          size="md"
          onClick={onReviewProfile}
          id="btn-results-review-profile"
        >
          Review My Profile
        </Button>

        <Button
          variant="primary"
          size="lg"
          onClick={onStartPractice}
          icon={<ArrowRight size={18} />}
          id="btn-results-start-practice"
        >
          Start My Practice
        </Button>
      </div>
    </div>
  );
};
