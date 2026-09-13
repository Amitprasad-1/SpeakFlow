import React, { useState } from 'react';
import { useApp } from '../../../store/AppContext';
import { ListeningExercise } from '@speakflow/core';
import {
  Volume2,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  ArrowRight,
  HelpCircle,
  Sparkles
} from 'lucide-react';

export const ListeningLabView: React.FC<{
  onComplete: (score: number) => void;
}> = ({ onComplete }) => {
  const { lesson, speechProvider } = useApp();
  const exercise: ListeningExercise = lesson.listeningExercise;

  const [playbackSpeed, setPlaybackSpeed] = useState<0.75 | 1.0>(1.0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [showTranscript, setShowTranscript] = useState<boolean>(false);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handlePlayAudio = async () => {
    if (isPlaying) {
      speechProvider.cancelSynthesis();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    await speechProvider.synthesizeSpeech(exercise.dialogueTranscript, {
      rate: playbackSpeed,
      lang: 'en-US'
    });
    setIsPlaying(false);
  };

  const handleSelectAnswer = (qId: string, optIndex: number) => {
    if (submitted) return;
    setUserAnswers((prev) => ({ ...prev, [qId]: optIndex }));
  };

  const calculateScore = () => {
    let correct = 0;
    for (const q of exercise.questions) {
      if (userAnswers[q.id] === q.correctIndex) {
        correct++;
      }
    }
    return Math.round((correct / exercise.questions.length) * 100);
  };

  const handleSubmitQuiz = () => {
    setSubmitted(true);
  };

  const finalScore = calculateScore();

  return (
    <div style={{ maxWidth: '880px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-6)' }}>
        <div>
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-primary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Stage 6 of 6 • Active Listening Comprehension
          </span>
          <h2 style={{ fontSize: '1.625rem', marginTop: '4px' }}>{exercise.title}</h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
            {exercise.scenario}
          </p>
        </div>

        {/* Speed Controls: Slow / Normal */}
        <div style={{ display: 'flex', gap: '4px', background: 'var(--color-bg-surface-elevated)', padding: '3px', borderRadius: 'var(--radius-md)' }}>
          <button
            onClick={() => setPlaybackSpeed(0.75)}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8125rem',
              fontWeight: 700,
              background: playbackSpeed === 0.75 ? 'var(--color-primary)' : 'transparent',
              color: playbackSpeed === 0.75 ? '#ffffff' : 'var(--color-text-secondary)'
            }}
          >
            Slow (0.75x)
          </button>
          <button
            onClick={() => setPlaybackSpeed(1.0)}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8125rem',
              fontWeight: 700,
              background: playbackSpeed === 1.0 ? 'var(--color-primary)' : 'transparent',
              color: playbackSpeed === 1.0 ? '#ffffff' : 'var(--color-text-secondary)'
            }}
          >
            Normal (1.0x)
          </button>
        </div>
      </div>

      {/* Audio Player Card */}
      <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center', marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
          <button
            className={`btn ${isPlaying ? 'btn-secondary' : 'btn-primary'}`}
            onClick={handlePlayAudio}
            style={{ padding: '0.875rem 2.5rem', fontSize: '1.125rem' }}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} fill="currentColor" />}
            <span>{isPlaying ? 'Pause Audio' : `Play Dialogue (${playbackSpeed}x)`}</span>
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => setShowTranscript(!showTranscript)}
            title="Toggle Transcript"
          >
            {showTranscript ? <EyeOff size={18} /> : <Eye size={18} />}
            <span>{showTranscript ? 'Hide Transcript' : 'Reveal Transcript'}</span>
          </button>
        </div>

        {/* Revealed Transcript */}
        {showTranscript && (
          <div
            style={{
              background: 'var(--color-bg-subtle)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-6)',
              textAlign: 'left',
              lineHeight: 1.8,
              fontSize: '0.9375rem',
              whiteSpace: 'pre-line',
              color: 'var(--color-text-primary)'
            }}
          >
            {exercise.dialogueTranscript}
          </div>
        )}
      </div>

      {/* Comprehension Questions */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
          <HelpCircle size={18} color="var(--color-primary)" />
          <h3 style={{ fontSize: '1.25rem' }}>Comprehension Questions</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {exercise.questions.map((q, qIndex) => {
            const selectedIdx = userAnswers[q.id];
            const isCorrect = selectedIdx === q.correctIndex;

            return (
              <div key={q.id} className="card" style={{ padding: 'var(--space-6)' }}>
                <h4 style={{ fontSize: '1rem', marginBottom: 'var(--space-4)', color: 'var(--color-text-primary)' }}>
                  {qIndex + 1}. {q.question}
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  {q.options.map((opt, optIndex) => {
                    const isSelected = selectedIdx === optIndex;
                    let optBg = 'var(--color-bg-surface-elevated)';
                    let optBorder = 'var(--color-border)';

                    if (submitted) {
                      if (optIndex === q.correctIndex) {
                        optBg = 'rgba(16, 185, 129, 0.15)';
                        optBorder = 'var(--color-success)';
                      } else if (isSelected && !isCorrect) {
                        optBg = 'rgba(239, 68, 68, 0.15)';
                        optBorder = 'var(--color-error)';
                      }
                    } else if (isSelected) {
                      optBg = 'var(--color-primary-light)';
                      optBorder = 'var(--color-primary)';
                    }

                    return (
                      <button
                        key={optIndex}
                        onClick={() => handleSelectAnswer(q.id, optIndex)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: 'var(--space-3) var(--space-4)',
                          borderRadius: 'var(--radius-md)',
                          background: optBg,
                          border: `1px solid ${optBorder}`,
                          color: 'var(--color-text-primary)',
                          textAlign: 'left',
                          fontSize: '0.875rem'
                        }}
                      >
                        <span>{opt}</span>
                        {submitted && optIndex === q.correctIndex && (
                          <CheckCircle2 size={16} color="var(--color-success)" />
                        )}
                        {submitted && isSelected && !isCorrect && (
                          <XCircle size={16} color="var(--color-error)" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {submitted && (
                  <div
                    style={{
                      marginTop: 'var(--space-3)',
                      padding: 'var(--space-3)',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--color-bg-subtle)',
                      fontSize: '0.8125rem',
                      color: 'var(--color-text-secondary)'
                    }}
                  >
                    <strong>Explanation:</strong> {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Submit / Finish Buttons */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
        {!submitted ? (
          <button
            className="btn btn-primary"
            onClick={handleSubmitQuiz}
            disabled={Object.keys(userAnswers).length === 0}
            style={{ padding: '0.75rem 2rem' }}
          >
            <span>Submit Quiz</span>
          </button>
        ) : (
          <button
            className="btn btn-primary"
            onClick={() => onComplete(finalScore)}
            style={{ padding: '0.75rem 2.5rem' }}
          >
            <span>Finish Daily Session & View Progress</span>
            <ArrowRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
};
