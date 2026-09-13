import React, { useState } from 'react';
import { useApp } from '../../store/AppContext';
import { VocalWarmupView } from './vocal/VocalWarmupView';
import { TongueTwisterView } from './twisters/TongueTwisterView';
import { ReadingPassageView } from './reading/ReadingPassageView';
import { SentencesView } from './sentences/SentencesView';
import { SpeakingSimulatorView } from './speaking/SpeakingSimulatorView';
import { ListeningLabView } from './listening/ListeningLabView';
import {
  SpeechFeedback,
  SpeakingEvaluationReport,
  SessionResult
} from '@speakflow/core';
import {
  Sparkles,
  CheckCircle2,
  Award,
  ArrowRight,
  RotateCcw,
  Flame,
  Home,
  Target
} from 'lucide-react';

export const PracticeFlowView: React.FC = () => {
  const {
    practiceStep,
    setPracticeStep,
    completePracticeSession,
    setCurrentView,
    lesson,
    user
  } = useApp();

  const [sessionResults, setSessionResults] = useState<Partial<SessionResult>>({
    twisterScores: {},
    sentenceScores: {}
  });

  const stepTitles = [
    'Vocal Warm-Ups',
    'Tongue Twisters',
    'Reading Passage',
    'Practical Sentences',
    'Speaking Simulation',
    'Listening Lab',
    'Session Complete'
  ];

  // Stage Handlers
  const handleVocalComplete = () => {
    setSessionResults((prev) => ({ ...prev, vocalCompleted: true }));
    setPracticeStep(1);
  };

  const handleTwisterComplete = (scores: Record<string, SpeechFeedback>) => {
    setSessionResults((prev) => ({ ...prev, twisterScores: scores }));
    setPracticeStep(2);
  };

  const handleReadingComplete = (readingFeedback: SpeechFeedback) => {
    setSessionResults((prev) => ({ ...prev, readingFeedback }));
    setPracticeStep(3);
  };

  const handleSentencesComplete = (sentenceScores: Record<string, SpeechFeedback>) => {
    setSessionResults((prev) => ({ ...prev, sentenceScores }));
    setPracticeStep(4);
  };

  const handleSpeakingComplete = (speakingReport: SpeakingEvaluationReport) => {
    setSessionResults((prev) => ({ ...prev, speakingReport }));
    setPracticeStep(5);
  };

  const handleListeningComplete = (listeningScore: number) => {
    const compositeScore = Math.round(
      (sessionResults.readingFeedback?.overallScore ?? 85) * 0.4 +
      (sessionResults.speakingReport?.overallScore ?? 88) * 0.4 +
      listeningScore * 0.2
    );

    const finalResult = {
      ...sessionResults,
      listeningScore,
      compositeScore
    };

    setSessionResults(finalResult);
    completePracticeSession(finalResult);
    setPracticeStep(6);
  };

  return (
    <div style={{ maxWidth: '1040px', margin: '0 auto', padding: 'var(--space-6)' }}>
      {/* Stepper Header */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <div className="stepper-header">
          {stepTitles.map((title, idx) => (
            <div
              key={idx}
              className={`step-pill ${
                idx < practiceStep ? 'completed' : idx === practiceStep ? 'active' : ''
              }`}
              onClick={() => setPracticeStep(idx)}
              title={title}
              style={{ cursor: 'pointer' }}
            />
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
            Stage {practiceStep + 1} of 7: <strong style={{ color: 'var(--color-text-primary)' }}>{stepTitles[practiceStep]}</strong>
          </span>
          <button
            className="btn btn-secondary"
            onClick={() => setCurrentView('home')}
            style={{ padding: '0.375rem 0.875rem', fontSize: '0.8125rem' }}
          >
            <Home size={14} />
            <span>Dashboard</span>
          </button>
        </div>
      </div>

      {/* Render Current Practice Module */}
      {practiceStep === 0 && <VocalWarmupView onComplete={handleVocalComplete} />}
      {practiceStep === 1 && <TongueTwisterView onComplete={handleTwisterComplete} />}
      {practiceStep === 2 && <ReadingPassageView onComplete={handleReadingComplete} />}
      {practiceStep === 3 && <SentencesView onComplete={handleSentencesComplete} />}
      {practiceStep === 4 && <SpeakingSimulatorView onComplete={handleSpeakingComplete} />}
      {practiceStep === 5 && <ListeningLabView onComplete={handleListeningComplete} />}

      {/* Step 7: Final Session Summary & Adaptive Progression Card */}
      {practiceStep === 6 && (
        <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 'var(--radius-full)',
              background: 'var(--color-primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto var(--space-4)',
              boxShadow: 'var(--shadow-glow)'
            }}
          >
            <Award size={42} color="var(--color-primary)" />
          </div>

          <h2 style={{ fontSize: '2rem', marginBottom: 'var(--space-2)' }}>
            Daily Mission Mastered!
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.0625rem', maxWidth: '580px', margin: '0 auto var(--space-6)' }}>
            Spectacular work! Your vocal agility, articulation accuracy, and conversational confidence progressed significantly today.
          </p>

          {/* Core Achievement Badges */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-4)', flexWrap: 'wrap', marginBottom: 'var(--space-8)' }}>
            <div className="badge badge-streak" style={{ padding: 'var(--space-3) var(--space-5)', fontSize: '1rem' }}>
              <Flame size={20} fill="currentColor" />
              <span>{user.streak.currentStreak} Day Streak!</span>
            </div>
            <div className="badge badge-focus" style={{ padding: 'var(--space-3) var(--space-5)', fontSize: '1rem' }}>
              <Target size={20} />
              <span>Phoneme Target Improved: {lesson.primaryFocusPhoneme.replace('_', ' / ')}</span>
            </div>
            <div className="badge badge-level" style={{ padding: 'var(--space-3) var(--space-5)', fontSize: '1rem' }}>
              <Sparkles size={20} />
              <span>Composite Score: {sessionResults.compositeScore ?? 88}%</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-4)' }}>
            <button
              className="btn btn-secondary"
              onClick={() => setCurrentView('home')}
              style={{ padding: '0.75rem 2rem' }}
            >
              <span>Back to Dashboard</span>
            </button>

            <button
              className="btn btn-primary"
              onClick={() => setCurrentView('progress')}
              style={{ padding: '0.75rem 2rem' }}
            >
              <span>View Deep Analytics</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
