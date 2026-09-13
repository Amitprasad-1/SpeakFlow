import React, { useState, useEffect } from 'react';
import { Card, Badge, VoiceWaveform } from '../../design-system';
import { VocalExercise } from '@speakflow/core';
import { Play, Pause, SkipForward, CheckCircle2, RotateCcw, Volume2 } from 'lucide-react';
import { BrowserSpeechProvider } from '../../speech/BrowserSpeechProvider';

export interface VocalWarmupStageProps {
  exercises: VocalExercise[];
  onCompleteStage: () => void;
  speechProvider: BrowserSpeechProvider;
}

export const VocalWarmupStage: React.FC<VocalWarmupStageProps> = ({
  exercises,
  onCompleteStage,
  speechProvider
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(exercises[0]?.durationSeconds || 45);
  const [phase, setPhase] = useState<'ready' | 'inhale' | 'exhale' | 'done'>('ready');

  const activeExercise = exercises[currentIndex] || exercises[0];

  useEffect(() => {
    setTimeLeft(activeExercise.durationSeconds);
    setTimerActive(false);
    setPhase('ready');
  }, [currentIndex, activeExercise]);

  // Gentle breathing cycle guide during active warm-up
  useEffect(() => {
    let interval: number | null = null;
    if (timerActive && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setTimerActive(false);
            setPhase('done');
            return 0;
          }
          // Cycle breathing animation every 6 seconds: 3s inhale, 3s warm-up phonation
          const cycle = prev % 6;
          if (cycle >= 3) {
            setPhase('inhale');
          } else {
            setPhase('exhale');
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, timeLeft]);

  const handleNextExercise = () => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onCompleteStage();
    }
  };

  const handleAudioDemo = () => {
    speechProvider.synthesizeSpeech(
      `Here is a gentle demonstration for ${activeExercise.title}. ${activeExercise.instructions[0]}`,
      { rate: 0.95 }
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', maxWidth: '720px', margin: '0 auto' }}>
      {/* Exercise context card */}
      <Card variant="default" padding="lg">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
          <Badge variant="primary">Warm-Up {currentIndex + 1} of {exercises.length}</Badge>
          <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-muted)' }}>
            Gentle Voice Warm-Up • Non-Medical
          </span>
        </div>

        <h2 className="typography-h2" style={{ marginBottom: 'var(--space-1)' }}>
          {activeExercise.title}
        </h2>
        <p className="typography-body" style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)' }}>
          {activeExercise.subtitle}
        </p>

        {/* Instructions list */}
        <div style={{ background: 'var(--color-surface-hover)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-6)' }}>
          <div style={{ fontWeight: 600, fontSize: 'var(--text-body-sm)', marginBottom: 'var(--space-2)', color: 'var(--color-text-primary)' }}>
            How to practice:
          </div>
          <ol style={{ margin: 0, paddingLeft: 'var(--space-5)', color: 'var(--color-text-secondary)', fontSize: 'var(--text-body)' }}>
            {activeExercise.instructions.map((inst, idx) => (
              <li key={idx} style={{ marginBottom: 'var(--space-1-5)' }}>
                {inst}
              </li>
            ))}
          </ol>
        </div>

        {/* Visual Breathing & Timer Guide */}
        <div style={{ textAlign: 'center', padding: 'var(--space-6) 0' }}>
          <div
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              margin: '0 auto var(--space-4)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              border: `4px solid ${timerActive ? 'var(--color-primary)' : 'var(--color-border)'}`,
              background: timerActive ? 'var(--color-primary-subtle)' : 'var(--color-surface)',
              transition: 'all 0.5s ease',
              transform: phase === 'inhale' ? 'scale(1.08)' : 'scale(1.0)'
            }}
          >
            <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
              {timeLeft}s
            </span>
            <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              {phase === 'ready' ? 'Ready' : phase === 'inhale' ? 'Inhale' : phase === 'exhale' ? 'Sustain Sound' : 'Complete'}
            </span>
          </div>

          <div style={{ maxWidth: '320px', margin: '0 auto var(--space-6)' }}>
            <VoiceWaveform active={timerActive} height={38} />
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            <button
              onClick={handleAudioDemo}
              className="speakflow-btn btn-variant-ghost"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                padding: 'var(--space-2-5) var(--space-4)',
                borderRadius: 'var(--radius-md)',
                fontWeight: 600,
                cursor: 'pointer'
              }}
              title="Listen to audio guide"
            >
              <Volume2 size={18} />
              <span>Guide</span>
            </button>

            {!timerActive && timeLeft > 0 && (
              <button
                onClick={() => setTimerActive(true)}
                className="speakflow-btn btn-variant-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  padding: 'var(--space-2-5) var(--space-5)',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Play size={18} />
                <span>Start Warm-Up</span>
              </button>
            )}

            {timerActive && (
              <button
                onClick={() => setTimerActive(false)}
                className="speakflow-btn btn-variant-secondary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  padding: 'var(--space-2-5) var(--space-5)',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Pause size={18} />
                <span>Pause</span>
              </button>
            )}

            {timeLeft < activeExercise.durationSeconds && (
              <button
                onClick={() => {
                  setTimerActive(false);
                  setTimeLeft(activeExercise.durationSeconds);
                  setPhase('ready');
                }}
                className="speakflow-btn btn-variant-ghost"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 'var(--space-1-5)',
                  padding: 'var(--space-2-5) var(--space-3-5)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer'
                }}
                title="Restart timer"
              >
                <RotateCcw size={16} />
                <span>Reset</span>
              </button>
            )}

            <button
              onClick={handleNextExercise}
              className="speakflow-btn btn-variant-secondary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                padding: 'var(--space-2-5) var(--space-4)',
                borderRadius: 'var(--radius-md)',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {timeLeft === 0 ? <CheckCircle2 size={18} color="var(--color-accent)" /> : <SkipForward size={18} />}
              <span>{currentIndex < exercises.length - 1 ? 'Next Warm-Up' : 'Complete Stage 1'}</span>
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};
