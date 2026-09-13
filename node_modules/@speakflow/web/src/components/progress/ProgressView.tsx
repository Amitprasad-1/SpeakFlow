import React from 'react';
import { useApp } from '../../store/AppContext';
import { PhonemeCategory } from '@speakflow/core';
import {
  BarChart3,
  Flame,
  Clock,
  Award,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Volume2
} from 'lucide-react';

export const ProgressView: React.FC = () => {
  const { user, speechProvider } = useApp();
  const skills = user.skills;

  const coreSkills = [
    { label: 'Speaking', score: skills.speakingScore, color: 'var(--color-primary)' },
    { label: 'Pronunciation', score: skills.pronunciationScore, color: '#10b981' },
    { label: 'Fluency', score: skills.fluencyScore, color: '#06b6d4' },
    { label: 'Reading Aloud', score: skills.readingScore, color: '#6366f1' },
    { label: 'Listening', score: skills.listeningScore, color: '#8b5cf6' },
    { label: 'Vocabulary', score: skills.vocabularyScore, color: '#ec4899' },
    { label: 'Grammar', score: skills.grammarScore, color: '#f59e0b' }
  ];

  const phonemeList = Object.values(skills.soundSkills);

  const handlePlayWordAudio = (word: string) => {
    speechProvider.synthesizeSpeech(word, { rate: 0.85 });
  };

  return (
    <div style={{ maxWidth: '1040px', margin: '0 auto', padding: 'var(--space-6)' }}>
      {/* Top Banner */}
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <span style={{ fontSize: '0.8125rem', color: 'var(--color-primary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Personalized Speech Analytics
        </span>
        <h1 style={{ fontSize: '2rem', marginTop: 'var(--space-1)', marginBottom: 'var(--space-2)' }}>
          Learner Progress & Sound Matrix
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem' }}>
          SpeakFlow continuously observes your articulation patterns and automatically adapts future practice modules to your weak phonemes.
        </p>
      </div>

      {/* Top 3 KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 'var(--radius-lg)',
              background: 'rgba(245, 158, 11, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f59e0b'
            }}
          >
            <Flame size={28} fill="currentColor" />
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{user.streak.currentStreak} Days</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
              Current Streak (Best: {user.streak.longestStreak})
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 'var(--radius-lg)',
              background: 'var(--color-primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary)'
            }}
          >
            <Clock size={28} />
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{user.totalMinutesPracticed} Mins</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
              Total Speaking Practice
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 'var(--radius-lg)',
              background: 'var(--color-secondary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-secondary)'
            }}
          >
            <Award size={28} />
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{user.completedLessonsCount} Completed</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
              Daily Practice Missions
            </div>
          </div>
        </div>
      </div>

      {/* Core Skills Breakdown Bars */}
      <div className="card" style={{ padding: 'var(--space-8)', marginBottom: 'var(--space-8)' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: 'var(--space-6)' }}>Linguistic Competency Radar</h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {coreSkills.map((skill, idx) => (
            <div key={idx}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{skill.label}</span>
                <span style={{ fontWeight: 700, color: skill.color }}>{skill.score}%</span>
              </div>
              <div
                style={{
                  height: 8,
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--color-bg-subtle)',
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${skill.score}%`,
                    background: skill.color,
                    borderRadius: 'var(--radius-full)',
                    transition: 'width 1s ease-in-out'
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Phonetic Sound Weakness Matrix */}
      <div className="card" style={{ padding: 'var(--space-8)', marginBottom: 'var(--space-8)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem' }}>Phonetic Sound Weakness Matrix</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
              Continuous acoustic tracking across 11 key English sound categories.
            </p>
          </div>
          <span className="badge badge-focus">
            {skills.weakSounds.length} Priority Target{skills.weakSounds.length > 1 ? 's' : ''}
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 'var(--space-3)'
          }}
        >
          {phonemeList.map((ph) => {
            const isWeak = ph.status === 'weak' || ph.accuracy < 65;
            const isStrong = ph.status === 'strong' || ph.accuracy >= 80;

            return (
              <div
                key={ph.category}
                style={{
                  background: 'var(--color-bg-surface-elevated)',
                  border: `1px solid ${
                    isWeak ? 'rgba(239, 68, 68, 0.4)' : isStrong ? 'rgba(16, 185, 129, 0.3)' : 'var(--color-border)'
                  }`,
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-3) var(--space-4)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9375rem' }}>
                    {ph.category.replace('_', ' / ')}
                  </span>
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: isWeak ? 'var(--color-error)' : isStrong ? 'var(--color-success)' : 'var(--color-warning)'
                    }}
                  >
                    {ph.status}
                  </span>
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                  {ph.accuracy}%
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column: Frequently Mispronounced Words & Mastered Vocabulary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-6)' }}>
        {/* Mispronounced Words */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
            <AlertTriangle size={18} color="var(--color-warning)" />
            <h3 style={{ fontSize: '1.125rem' }}>Frequently Mispronounced Words</h3>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            {skills.frequentlyMispronouncedWords.map((word, idx) => (
              <button
                key={idx}
                className="btn btn-secondary"
                onClick={() => handlePlayWordAudio(word)}
                style={{ fontSize: '0.8125rem', padding: '0.375rem 0.75rem', gap: '6px' }}
                title={`Listen to correct pronunciation of ${word}`}
              >
                <span>{word}</span>
                <Volume2 size={13} color="var(--color-primary)" />
              </button>
            ))}
          </div>
        </div>

        {/* Mastered Vocabulary */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
            <BookOpen size={18} color="var(--color-primary)" />
            <h3 style={{ fontSize: '1.125rem' }}>Mastered Articulation Vocabulary</h3>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            {skills.vocabularyMastered.map((word, idx) => (
              <button
                key={idx}
                className="btn btn-secondary"
                onClick={() => handlePlayWordAudio(word)}
                style={{ fontSize: '0.8125rem', padding: '0.375rem 0.75rem', gap: '6px' }}
              >
                <span>{word}</span>
                <Volume2 size={13} color="var(--color-primary)" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
