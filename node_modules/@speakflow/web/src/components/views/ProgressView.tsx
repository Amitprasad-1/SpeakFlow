import React, { useState, useMemo } from 'react';
import {
  Card,
  Badge,
  Button,
  SectionHeader,
  ProgressRing
} from '../../design-system';
import { BrowserStorage } from '../../storage/BrowserStorage';
import { ProgressAnalyticsEngine, UserProfile } from '@speakflow/core';
import {
  Clock,
  Flame,
  BookOpen,
  Info,
  Sparkles,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export const ProgressView: React.FC = () => {
  const [showBenchmarkSample, setShowBenchmarkSample] = useState(false);

  // Load real data from BrowserStorage
  const userProfile: UserProfile = useMemo(() => {
    const p = BrowserStorage.getUserProfile();
    if (p) return p;
    return BrowserStorage.createInitialProfile('Learner');
  }, []);

  const sessionHistory = useMemo(() => BrowserStorage.getAllDailySessions(), []);
  const learningMemory = useMemo(() => BrowserStorage.getLearningMemory(), []);
  const savedConversations = useMemo(() => BrowserStorage.getSavedConversations(), []);

  // Compute honest aggregate metrics
  const analytics = useMemo(() => {
    return ProgressAnalyticsEngine.calculateProgress(
      userProfile,
      sessionHistory,
      learningMemory
    );
  }, [userProfile, sessionHistory, learningMemory]);

  const vocabList = learningMemory.vocabularyBank || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
          <Badge variant="focus">Data-Backed Analytics</Badge>
          <Badge variant={analytics.hasSufficientData ? 'success' : 'level'}>
            {analytics.hasSufficientData ? 'Active Profile' : 'Awaiting More Practice'}
          </Badge>
        </div>
        <h1 className="typography-h1">Communication Progress & Memory</h1>
        <p className="typography-body" style={{ marginTop: 'var(--space-1)', maxWidth: '65ch' }}>
          Honest progress tracking powered by your real practice sessions, spoken vocabulary memory bank, and conversational reviews.
        </p>
      </div>

      {/* Honest Data Transparency Note */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 'var(--space-3)',
          padding: 'var(--space-3-5) var(--space-4)',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: 'var(--radius-lg)'
        }}
      >
        <ShieldCheck size={20} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: 'var(--text-body-sm)' }}>
          <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
            SpeakFlow Data Integrity Standard:
          </span>{' '}
          <span style={{ color: 'var(--color-text-secondary)' }}>
            We separate <strong>Observed</strong> data (session completion, duration, vocabulary), <strong>Estimated</strong> signals (tempo/WPM, pause cadence), and do not fabricate clinical phoneme accuracy without dedicated speech acoustic hardware.
          </span>
        </div>
      </div>

      {/* Top 4 Real Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
        <Card variant="default" padding="md">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 'var(--radius-md)',
                background: 'rgba(37, 99, 235, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-primary)'
              }}
            >
              <Clock size={22} />
            </div>
            <div>
              <div className="typography-caption" style={{ color: 'var(--color-text-secondary)' }}>Practice Time</div>
              <div className="typography-h2">{analytics.totalPracticeMinutes} <span style={{ fontSize: 'var(--text-body-sm)', fontWeight: 500 }}>mins</span></div>
            </div>
          </div>
        </Card>

        <Card variant="default" padding="md">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 'var(--radius-md)',
                background: 'rgba(16, 185, 129, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-success)'
              }}
            >
              <CheckCircle2 size={22} />
            </div>
            <div>
              <div className="typography-caption" style={{ color: 'var(--color-text-secondary)' }}>Completed Sessions</div>
              <div className="typography-h2">{analytics.completedSessionsCount}</div>
            </div>
          </div>
        </Card>

        <Card variant="default" padding="md">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 'var(--radius-md)',
                background: 'rgba(245, 158, 11, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-warning)'
              }}
            >
              <Flame size={22} />
            </div>
            <div>
              <div className="typography-caption" style={{ color: 'var(--color-text-secondary)' }}>Current Streak</div>
              <div className="typography-h2">{analytics.currentStreakDays} <span style={{ fontSize: 'var(--text-body-sm)', fontWeight: 500 }}>days</span></div>
            </div>
          </div>
        </Card>

        <Card variant="default" padding="md">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 'var(--radius-md)',
                background: 'rgba(139, 92, 246, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-secondary)'
              }}
            >
              <BookOpen size={22} />
            </div>
            <div>
              <div className="typography-caption" style={{ color: 'var(--color-text-secondary)' }}>Mastered Words</div>
              <div className="typography-h2">{analytics.vocabularyMasteredCount} <span style={{ fontSize: 'var(--text-body-sm)', fontWeight: 500 }}>/ {vocabList.length}</span></div>
            </div>
          </div>
        </Card>
      </div>

      {/* Insufficient Data Banner (if user has 0 sessions) */}
      {!analytics.hasSufficientData && (
        <Card
          variant="conversation"
          padding="lg"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4)',
            borderColor: 'var(--color-primary)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
            <Info size={24} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h3 className="typography-h3">Speech Profile is Initializing</h3>
              <p className="typography-body" style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-1)' }}>
                SpeakFlow does not show fake percentages or simulated graphs. Once you finish your first full Daily Practice session or complete an AI Coach Conversation, your personalized tempo, active retention curves, and rhythm trends will populate here automatically.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowBenchmarkSample(prev => !prev)}
            >
              {showBenchmarkSample ? 'Hide Reference Benchmark' : 'View Reference Benchmark'}
            </Button>
          </div>
        </Card>
      )}

      {/* Weekly Practice Distribution (Observed Minutes) */}
      <Card variant="default" padding="lg">
        <SectionHeader
          title="Weekly Practice Consistency"
          subtitle="Actual practice minutes recorded per day of the week."
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 'var(--space-2)', marginTop: 'var(--space-4)' }}>
          {analytics.weeklyPracticeDistribution.map((item, idx) => {
            const hasPracticed = item.minutes > 0;
            const maxMins = 30;
            const heightPct = Math.min(100, Math.max(12, (item.minutes / maxMins) * 100));

            return (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)' }}>
                <div
                  style={{
                    height: 120,
                    width: '100%',
                    maxWidth: 48,
                    background: 'var(--color-surface-sunken)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'flex-end',
                    padding: '2px',
                    overflow: 'hidden'
                  }}
                >
                  <div
                    style={{
                      height: `${hasPracticed ? heightPct : 6}%`,
                      width: '100%',
                      background: hasPracticed ? 'var(--color-primary)' : 'var(--color-border)',
                      borderRadius: 'var(--radius-xs)',
                      transition: 'height 0.3s ease'
                    }}
                  />
                </div>
                <span style={{ fontSize: 'var(--text-caption)', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                  {item.dayOfWeek}
                </span>
                <span style={{ fontSize: '0.6875rem', color: hasPracticed ? 'var(--color-primary)' : 'var(--color-text-muted)', fontWeight: 700 }}>
                  {item.minutes}m
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Vocabulary Memory Bank */}
      <section>
        <SectionHeader
          title="Spoken Vocabulary Memory Bank"
          subtitle="Vocabulary tracked through spaced repetition. Words advance as you practice them correctly."
        />

        {vocabList.length === 0 ? (
          <Card variant="default" padding="md" style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            <p className="typography-body">No vocabulary items in your bank yet. Complete the Word Practice stage in your Daily Practice to start adding target terms.</p>
          </Card>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 'var(--space-3)' }}>
            {vocabList.map((item) => (
              <Card
                key={item.id || item.word}
                variant="vocabulary"
                padding="sm"
                style={{
                  borderLeft: `3px solid ${item.mastered ? 'var(--color-success)' : 'var(--color-primary)'}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-1)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: 'var(--text-body)', color: 'var(--color-text-primary)' }}>
                    {item.word}
                  </span>
                  <Badge variant={item.mastered ? 'success' : 'focus'}>
                    {item.mastered ? 'Mastered' : 'Developing'}
                  </Badge>
                </div>
                {item.pronunciation && (
                  <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
                    {item.pronunciation}
                  </span>
                )}
                {item.meaning && (
                  <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)' }}>
                    {item.meaning}
                  </span>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-2)', fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)' }}>
                  <span>Practiced: {item.practiceCount}x</span>
                  <span>{item.example ? 'With example' : ''}</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Conversational AI History & Reviews */}
      <section>
        <SectionHeader
          title="Recent AI Coach Conversations"
          subtitle="Evaluations and natural alternatives provided during scenario coaching."
        />

        {savedConversations.length === 0 ? (
          <Card variant="default" padding="md" style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            <p className="typography-body">No recorded conversations yet. Open the AI Coach tab to practice workplace dialogues, job interviews, or spontaneous speaking.</p>
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {savedConversations.slice(-3).reverse().map((conv) => (
              <Card key={conv.id} variant="conversation" padding="md">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-2)' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <span className="typography-h3">
                        {conv.scenario?.title || 'Scenario Session'}
                      </span>
                      <Badge variant="focus">{conv.messages?.length || 0} messages</Badge>
                    </div>
                    <span className="typography-caption" style={{ color: 'var(--color-text-muted)' }}>
                      {conv.startedAt ? new Date(conv.startedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                    </span>
                  </div>
                </div>

                {conv.review && (
                  <div style={{ background: 'var(--color-surface-sunken)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                    {conv.review.keyStrengths?.length > 0 && (
                      <div>
                        <span style={{ fontSize: 'var(--text-caption)', fontWeight: 700, color: 'var(--color-success)' }}>Strength: </span>
                        <span style={{ fontSize: 'var(--text-body-sm)' }}>{conv.review.keyStrengths[0]}</span>
                      </div>
                    )}
                    {conv.review.patternsToImprove?.length > 0 && (
                      <div>
                        <span style={{ fontSize: 'var(--text-caption)', fontWeight: 700, color: 'var(--color-warning)' }}>Improvement: </span>
                        <span style={{ fontSize: 'var(--text-body-sm)' }}>{conv.review.patternsToImprove[0]}</span>
                      </div>
                    )}
                    {conv.review.usefulPhrases?.length > 0 && (
                      <div style={{ borderTop: '1px solid var(--color-border-subtle)', paddingTop: 'var(--space-1-5)' }}>
                        <span style={{ fontSize: 'var(--text-caption)', fontWeight: 700, color: 'var(--color-primary)' }}>Natural Phrase: </span>
                        <span style={{ fontSize: 'var(--text-body-sm)', fontStyle: 'italic' }}>"{conv.review.usefulPhrases[0]}"</span>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Reference Benchmark Preview (Toggleable) */}
      {showBenchmarkSample && (
        <Card variant="default" padding="lg" style={{ borderStyle: 'dashed' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
            <Sparkles size={18} color="var(--color-primary)" />
            <span className="typography-h3">Reference Benchmark Preview</span>
            <Badge variant="level">Sample Model</Badge>
          </div>
          <p className="typography-body" style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
            This sample shows how your personal fluency and pace targets will look once you accumulate 10+ daily sessions.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
            <Card variant="default" padding="sm" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <ProgressRing percentage={85} color="var(--color-primary)" />
              <div>
                <div style={{ fontWeight: 700 }}>Pacing Rhythm</div>
                <div className="typography-caption" style={{ color: 'var(--color-text-muted)' }}>Target: 130-150 WPM</div>
              </div>
            </Card>
            <Card variant="default" padding="sm" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <ProgressRing percentage={80} color="var(--color-accent)" />
              <div>
                <div style={{ fontWeight: 700 }}>Turn Completeness</div>
                <div className="typography-caption" style={{ color: 'var(--color-text-muted)' }}>Multi-clause answers</div>
              </div>
            </Card>
          </div>
        </Card>
      )}
    </div>
  );
};
