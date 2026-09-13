import React from 'react';
import { Card } from '../Card/Card';
import { Button } from '../Button/Button';
import { Badge } from '../Badge/Badge';
import { ProgressRing } from '../Progress/ProgressRing';
import { ProgressBar } from '../Progress/ProgressBar';
import {
  Flame,
  Clock,
  Award,
  Play,
  Volume2,
  Sparkles,
  ArrowRight,
  Target
} from 'lucide-react';

/* --------------------------------------------------------------------------
   1. StatCard
   -------------------------------------------------------------------------- */
export interface StatCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  icon?: React.ReactNode;
  iconColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  sublabel,
  icon,
  iconColor = 'var(--color-primary)'
}) => {
  return (
    <Card variant="default" padding="md" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
      {icon && (
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-bg-subtle)',
            border: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: iconColor,
            flexShrink: 0
          }}
        >
          {icon}
        </div>
      )}
      <div>
        <div style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-display)', lineHeight: 1.15 }}>
          {value}
        </div>
        <div style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
          {label}
        </div>
        {sublabel && (
          <div style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            {sublabel}
          </div>
        )}
      </div>
    </Card>
  );
};

/* --------------------------------------------------------------------------
   2. StreakCard
   -------------------------------------------------------------------------- */
export interface StreakCardProps {
  currentStreak: number;
  longestStreak: number;
  todayCompleted?: boolean;
}

export const StreakCard: React.FC<StreakCardProps> = ({
  currentStreak,
  longestStreak,
  todayCompleted = true
}) => {
  return (
    <Card
      variant="default"
      padding="md"
      style={{
        borderLeft: '4px solid var(--color-warning)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 'var(--radius-pill)',
            background: 'var(--color-warning-subtle)',
            color: 'var(--color-warning)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Flame size={24} fill="currentColor" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-2)' }}>
            <span style={{ fontSize: '1.375rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
              {currentStreak} Day Streak
            </span>
            <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-muted)' }}>
              (Record: {longestStreak})
            </span>
          </div>
          <p style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-text-secondary)' }}>
            {todayCompleted ? 'Daily practice locked in for today.' : 'Practice today to protect your streak!'}
          </p>
        </div>
      </div>

      <Badge variant="warning" size="sm">
        Active
      </Badge>
    </Card>
  );
};

/* --------------------------------------------------------------------------
   3. ContinuePracticeCard (Hero Daily Mission)
   -------------------------------------------------------------------------- */
export interface ContinuePracticeCardProps {
  title: string;
  focusSound: string;
  stageProgress: string; // e.g. "Stage 2 of 6"
  durationEstimate: string; // e.g. "12 mins"
  onStart: () => void;
  buttonLabel?: string;
}

export const ContinuePracticeCard: React.FC<ContinuePracticeCardProps> = ({
  title,
  focusSound,
  stageProgress,
  durationEstimate,
  onStart,
  buttonLabel = "Start Today's Practice"
}) => {
  return (
    <Card
      variant="elevated"
      padding="lg"
      style={{
        background: 'linear-gradient(135deg, var(--color-surface) 0%, var(--color-bg-subtle) 100%)',
        border: '1px solid var(--color-border)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div style={{ maxWidth: '580px' }}>
          <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
            <Badge variant="focus" icon={<Target size={12} />}>
              Focus: {focusSound}
            </Badge>
            <Badge variant="level">
              {stageProgress}
            </Badge>
          </div>

          <h2 className="typography-h2" style={{ marginBottom: 'var(--space-2)' }}>
            {title}
          </h2>

          <p className="typography-body" style={{ marginBottom: 'var(--space-4)' }}>
            Today's lesson is designed to help you practice {focusSound} pronunciation and develop a steady, natural speaking rhythm.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', fontSize: 'var(--text-caption)', color: 'var(--color-text-muted)' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={13} /> {durationEstimate} practice
            </span>
            <span>• 6 integrated exercises</span>
          </div>
        </div>

        <Button
          variant="primary"
          size="lg"
          onClick={onStart}
          icon={<Play size={18} fill="currentColor" />}
          className="cta-breathing"
          style={{ cursor: 'pointer' }}
        >
          {buttonLabel}
        </Button>
      </div>
    </Card>
  );
};

/* --------------------------------------------------------------------------
   4. ExerciseCard (Studio Module Preview)
   -------------------------------------------------------------------------- */
export interface ExerciseCardProps {
  number: number;
  title: string;
  description: string;
  category: string;
  duration: string;
  completed?: boolean;
  onSelect?: () => void;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  number,
  title,
  description,
  category,
  duration,
  completed = false,
  onSelect
}) => {
  return (
    <Card
      variant="interactive"
      padding="md"
      onClick={onSelect}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%'
      }}
    >
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
          <Badge variant={completed ? 'success' : 'default'} size="sm">
            {completed ? 'Completed' : `Stage ${number}`}
          </Badge>
          <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-muted)' }}>
            {duration}
          </span>
        </div>

        <h3 className="typography-h3" style={{ marginBottom: 'var(--space-1)' }}>
          {title}
        </h3>
        <p className="typography-body-sm" style={{ color: 'var(--color-text-secondary)' }}>
          {description}
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-4)', paddingTop: 'var(--space-2)', borderTop: '1px solid var(--color-border-subtle)' }}>
        <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-primary)', fontWeight: 600 }}>
          {category}
        </span>
        <ArrowRight size={16} color="var(--color-text-muted)" />
      </div>
    </Card>
  );
};

/* --------------------------------------------------------------------------
   5. VocabularyCard (Articulation Term)
   -------------------------------------------------------------------------- */
export interface VocabularyCardProps {
  word: string;
  ipa: string;
  syllables: string;
  definition: string;
  partOfSpeech: string;
  onPlayAudio?: () => void;
}

export const VocabularyCard: React.FC<VocabularyCardProps> = ({
  word,
  ipa,
  syllables,
  definition,
  partOfSpeech,
  onPlayAudio
}) => {
  return (
    <Card variant="default" padding="md">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-2)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-2)' }}>
            <h3 className="typography-h3" style={{ fontSize: '1.25rem' }}>{word}</h3>
            <span style={{ fontSize: 'var(--text-caption)', fontStyle: 'italic', color: 'var(--color-text-muted)' }}>
              {partOfSpeech}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: '2px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', fontSize: 'var(--text-body-sm)', fontWeight: 600 }}>
              {ipa}
            </span>
            <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-muted)' }}>
              Syllables: <strong>{syllables}</strong>
            </span>
          </div>
        </div>

        {onPlayAudio && (
          <Button variant="icon" size="sm" onClick={onPlayAudio} aria-label={`Listen to pronunciation of ${word}`}>
            <Volume2 size={16} color="var(--color-primary)" />
          </Button>
        )}
      </div>

      <p className="typography-body-sm" style={{ color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
        {definition}
      </p>
    </Card>
  );
};
