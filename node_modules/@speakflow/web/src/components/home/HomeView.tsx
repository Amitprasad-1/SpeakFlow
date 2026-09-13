import React from 'react';
import { useApp } from '../../store/AppContext';
import {
  Play,
  CheckCircle2,
  Flame,
  Award,
  Sparkles,
  ArrowRight,
  Target,
  Volume2,
  BookOpen,
  MessageSquare,
  Ear,
  RotateCw
} from 'lucide-react';

export const HomeView: React.FC = () => {
  const { user, lesson, startDailyPractice, regenerateAdaptiveLesson } = useApp();

  const focusSound = lesson.primaryFocusPhoneme.replace('_', ' / ');
  const wordOfTheDay = lesson.readingPassage.vocabularyWords[0];

  const stepsOverview = [
    { title: 'Vocal Warm-Ups', desc: 'Lip trills, tongue trills & sirens', time: '3 min', stepIndex: 0 },
    { title: 'Tongue Twisters', desc: `Targeting ${focusSound}`, time: '2 min', stepIndex: 1 },
    { title: 'Reading Passage', desc: `${lesson.readingPassage.topic} • 160-200 words`, time: '4 min', stepIndex: 2 },
    { title: 'Practical Sentences', desc: '10-12 workplace expressions', time: '3 min', stepIndex: 3 },
    { title: 'Speaking Simulation', desc: lesson.speakingChallenge.title, time: '4 min', stepIndex: 4 },
    { title: 'Listening Comprehension', desc: 'Speed control & quiz', time: '3 min', stepIndex: 5 }
  ];

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', padding: 'var(--space-6)' }}>
      {/* Welcome Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-8)' }}>
        <div>
          <span style={{ fontSize: '0.875rem', color: 'var(--color-primary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Daily Adaptive Practice
          </span>
          <h1 style={{ fontSize: '2rem', marginTop: 'var(--space-1)', marginBottom: 'var(--space-2)' }}>
            Welcome back, {user.name}
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem', maxWidth: '600px' }}>
            Your speech engine has customized today's mission to strengthen{' '}
            <strong style={{ color: 'var(--color-text-primary)' }}>{focusSound} articulation</strong> and conversational pacing.
          </p>
        </div>

        <button
          className="btn btn-secondary"
          onClick={regenerateAdaptiveLesson}
          title="Regenerate adaptive session"
          style={{ gap: 'var(--space-2)' }}
        >
          <RotateCw size={16} />
          <span>Refresh Lesson</span>
        </button>
      </div>

      {/* Main Hero Card: Today's Daily Mission */}
      <div className="card card-hero" style={{ marginBottom: 'var(--space-8)', padding: 'var(--space-8)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
          <div>
            <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
              <span className="badge badge-focus">
                <Target size={14} />
                Focus Sound: {focusSound}
              </span>
              <span className="badge badge-level">{user.level}</span>
            </div>
            <h2 style={{ fontSize: '1.625rem', marginBottom: 'var(--space-1)' }}>{lesson.title}</h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9375rem' }}>
              6 integrated stages • Estimated duration: ~{user.dailyGoalMinutes} minutes
            </p>
          </div>

          <button
            className="btn btn-primary"
            style={{ padding: '0.875rem 2rem', fontSize: '1.0625rem' }}
            onClick={() => startDailyPractice(0)}
          >
            <Play size={20} fill="currentColor" />
            <span>{lesson.isCompleted ? 'Practice Again' : 'Begin Daily Mission'}</span>
          </button>
        </div>

        {/* 6 Step Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 'var(--space-4)'
          }}
        >
          {stepsOverview.map((item, idx) => (
            <div
              key={idx}
              onClick={() => startDailyPractice(item.stepIndex)}
              style={{
                background: 'var(--color-bg-surface-elevated)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--color-primary-light)',
                    color: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.875rem'
                  }}
                >
                  {idx + 1}
                </div>
                <div>
                  <h4 style={{ fontSize: '0.9375rem', marginBottom: '2px' }}>{item.title}</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{item.desc}</p>
                </div>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                {item.time}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Section: Articulation Word of the Day & Quick Practice Labs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
        {/* Word of the Day Card */}
        {wordOfTheDay && (
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
              <Sparkles size={18} color="var(--color-primary)" />
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-primary)', letterSpacing: '0.05em' }}>
                Articulation Word of the Day
              </span>
            </div>

            <div style={{ marginBottom: 'var(--space-3)' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-3)' }}>
                <h3 style={{ fontSize: '1.75rem' }}>{wordOfTheDay.word}</h3>
                <span style={{ color: 'var(--color-text-secondary)', fontStyle: 'italic', fontSize: '0.9375rem' }}>
                  {wordOfTheDay.partOfSpeech}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginTop: 'var(--space-1)' }}>
                <span style={{ color: 'var(--color-primary)', fontWeight: 600, fontFamily: 'monospace', fontSize: '0.9375rem' }}>
                  {wordOfTheDay.phoneticIpa}
                </span>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>
                  Syllables: <strong>{wordOfTheDay.syllableBreakdown}</strong>
                </span>
              </div>
            </div>

            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginBottom: 'var(--space-4)', lineHeight: 1.6 }}>
              {wordOfTheDay.definition}
            </p>

            <div style={{ background: 'var(--color-bg-subtle)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--color-primary)' }}>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-primary)' }}>
                "{wordOfTheDay.exampleInPassage}"
              </p>
            </div>
          </div>
        )}

        {/* Quick Practice Modules */}
        <div className="card">
          <h3 style={{ fontSize: '1.25rem', marginBottom: 'var(--space-4)' }}>Direct Practice Labs</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <button
              className="btn btn-secondary"
              onClick={() => startDailyPractice(1)}
              style={{ flexDirection: 'column', alignItems: 'flex-start', padding: 'var(--space-4)', textAlign: 'left', height: '100px' }}
            >
              <Volume2 size={22} color="var(--color-primary)" style={{ marginBottom: 'var(--space-2)' }} />
              <span style={{ fontSize: '0.9375rem', fontWeight: 600 }}>Twister Lab</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>11 Phoneme sets</span>
            </button>

            <button
              className="btn btn-secondary"
              onClick={() => startDailyPractice(2)}
              style={{ flexDirection: 'column', alignItems: 'flex-start', padding: 'var(--space-4)', textAlign: 'left', height: '100px' }}
            >
              <BookOpen size={22} color="var(--color-secondary)" style={{ marginBottom: 'var(--space-2)' }} />
              <span style={{ fontSize: '0.9375rem', fontWeight: 600 }}>Reading Arena</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Karaoke speech tracking</span>
            </button>

            <button
              className="btn btn-secondary"
              onClick={() => startDailyPractice(4)}
              style={{ flexDirection: 'column', alignItems: 'flex-start', padding: 'var(--space-4)', textAlign: 'left', height: '100px' }}
            >
              <MessageSquare size={22} color="var(--color-info)" style={{ marginBottom: 'var(--space-2)' }} />
              <span style={{ fontSize: '0.9375rem', fontWeight: 600 }}>AI Roleplay</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>11 Realistic scenarios</span>
            </button>

            <button
              className="btn btn-secondary"
              onClick={() => startDailyPractice(5)}
              style={{ flexDirection: 'column', alignItems: 'flex-start', padding: 'var(--space-4)', textAlign: 'left', height: '100px' }}
            >
              <Ear size={22} color="var(--color-warning)" style={{ marginBottom: 'var(--space-2)' }} />
              <span style={{ fontSize: '0.9375rem', fontWeight: 600 }}>Listening Lab</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Speed controls & quiz</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
