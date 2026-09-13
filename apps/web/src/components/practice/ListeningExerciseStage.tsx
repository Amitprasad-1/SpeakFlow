import React, { useState } from 'react';
import { Card, Badge, AudioPlayer } from '../../design-system';
import { ListeningExercise } from '@speakflow/core';
import { Play, Pause, CheckCircle2, RotateCcw, HelpCircle, Volume2 } from 'lucide-react';
import { BrowserSpeechProvider } from '../../speech/BrowserSpeechProvider';

export interface ListeningExerciseStageProps {
  exercise: ListeningExercise;
  onCompleteStage: () => void;
  speechProvider: BrowserSpeechProvider;
}

export const ListeningExerciseStage: React.FC<ListeningExerciseStageProps> = ({
  exercise,
  onCompleteStage,
  speechProvider
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1.0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [showExplanation, setShowExplanation] = useState<Record<string, boolean>>({});

  const handleTogglePlay = () => {
    if (!isPlaying) {
      setIsPlaying(true);
      speechProvider.synthesizeSpeech(exercise.dialogueTranscript, { rate: speed }).finally(() => {
        setIsPlaying(false);
      });
    } else {
      speechProvider.cancelSynthesis();
      setIsPlaying(false);
    }
  };

  const handleSelectAnswer = (qId: string, optionIdx: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [qId]: optionIdx }));
    setShowExplanation((prev) => ({ ...prev, [qId]: true }));
  };

  const allAnswered = exercise.questions.every((q) => selectedAnswers[q.id] !== undefined);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', maxWidth: '780px', margin: '0 auto' }}>
      <Card variant="default" padding="lg">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <Badge variant="primary">Listening Comprehension</Badge>
            <Badge variant="level">Stage 6 of 6</Badge>
          </div>
          <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-muted)' }}>
            Speed Options: 0.75x • 1x • 1.25x
          </span>
        </div>

        <h2 className="typography-h2" style={{ marginBottom: 'var(--space-2)' }}>
          {exercise.title}
        </h2>
        <p className="typography-body" style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)' }}>
          {exercise.scenario}
        </p>

        {/* Audio Player Card with Speed Controls */}
        <div
          style={{
            background: 'var(--color-surface-hover)',
            padding: 'var(--space-5)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border-subtle)',
            marginBottom: 'var(--space-8)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <button
                onClick={handleTogglePlay}
                className="speakflow-btn btn-variant-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  padding: 'var(--space-2-5) var(--space-4)',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                <span>{isPlaying ? 'Pause Audio' : 'Play Dialogue'}</span>
              </button>
              <span style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-text-muted)' }}>
                ~{exercise.durationSeconds}s audio prompt
              </span>
            </div>

            {/* Playback speed selector */}
            <div style={{ display: 'flex', gap: 'var(--space-1-5)' }}>
              {[0.75, 1.0, 1.25].map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setSpeed(s);
                    if (isPlaying) {
                      speechProvider.cancelSynthesis();
                      setIsPlaying(true);
                      speechProvider.synthesizeSpeech(exercise.dialogueTranscript, { rate: s }).finally(() => {
                        setIsPlaying(false);
                      });
                    }
                  }}
                  style={{
                    padding: 'var(--space-1) var(--space-2-5)',
                    borderRadius: 'var(--radius-sm)',
                    background: speed === s ? 'var(--color-primary)' : 'var(--color-surface)',
                    color: speed === s ? '#fff' : 'var(--color-text-secondary)',
                    border: '1px solid var(--color-border)',
                    fontSize: 'var(--text-caption)',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Comprehension Questions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <h3 className="typography-h3" style={{ margin: 0 }}>
            Comprehension Questions ({exercise.questions.length})
          </h3>

          {exercise.questions.map((q, qIndex) => {
            const selectedIdx = selectedAnswers[q.id];
            const isAnswered = selectedIdx !== undefined;

            return (
              <div
                key={q.id}
                style={{
                  padding: 'var(--space-5)',
                  background: 'var(--color-surface)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)'
                }}
              >
                <div style={{ fontWeight: 600, fontSize: 'var(--text-body)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-3)' }}>
                  {qIndex + 1}. {q.question}
                </div>

                {/* Multiple choice options */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  {q.options.map((opt, optIdx) => {
                    const isSelected = selectedIdx === optIdx;
                    const isCorrect = optIdx === q.correctIndex;

                    let optionBorder = 'var(--color-border)';
                    let optionBg = 'var(--color-surface-hover)';

                    if (isAnswered) {
                      if (isSelected) {
                        optionBorder = isCorrect ? 'var(--color-accent)' : '#ef4444';
                        optionBg = isCorrect ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)';
                      } else if (isCorrect) {
                        optionBorder = 'var(--color-accent)';
                      }
                    }

                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleSelectAnswer(q.id, optIdx)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: 'var(--space-3) var(--space-4)',
                          borderRadius: 'var(--radius-md)',
                          border: `1px solid ${optionBorder}`,
                          background: optionBg,
                          color: 'var(--color-text-primary)',
                          textAlign: 'left',
                          fontSize: 'var(--text-body-sm)',
                          cursor: 'pointer',
                          transition: 'all var(--motion-duration-fast) ease'
                        }}
                      >
                        <span style={{ fontWeight: 700, marginRight: 'var(--space-2)', opacity: 0.7 }}>
                          {String.fromCharCode(65 + optIdx)}.
                        </span>
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Explanation feedback */}
                {isAnswered && (
                  <div
                    style={{
                      marginTop: 'var(--space-3)',
                      padding: 'var(--space-3)',
                      borderRadius: 'var(--radius-sm)',
                      background: selectedIdx === q.correctIndex ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.08)',
                      fontSize: 'var(--text-body-sm)',
                      color: 'var(--color-text-secondary)'
                    }}
                  >
                    <strong>{selectedIdx === q.correctIndex ? '✓ Correct! ' : 'Explanation: '}</strong>
                    {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Complete button */}
        <div style={{ marginTop: 'var(--space-8)', textAlign: 'center' }}>
          <button
            onClick={onCompleteStage}
            disabled={!allAnswered}
            className="speakflow-btn btn-variant-primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: 'var(--space-3) var(--space-6)',
              borderRadius: 'var(--radius-md)',
              fontWeight: 700,
              cursor: allAnswered ? 'pointer' : 'not-allowed',
              opacity: allAnswered ? 1 : 0.6
            }}
          >
            <CheckCircle2 size={18} />
            <span>Finish Daily Practice Session</span>
          </button>
        </div>
      </Card>
    </div>
  );
};
