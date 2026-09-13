import React, { useState, useEffect, useRef } from 'react';
import {
  Button,
  Card,
  Badge,
  RecordingButton,
  VoiceState
} from '../../../design-system';
import {
  BASELINE_READING_PASSAGE,
  AssessmentEngine,
  ReadingAssessmentResult
} from '@speakflow/core';
import { BrowserSpeechProvider } from '../../../speech/BrowserSpeechProvider';
import {
  ArrowRight,
  BookOpen,
  RotateCcw,
  CheckCircle2,
  Clock,
  Sparkles,
  Play,
  Square
} from 'lucide-react';

export interface ReadingAssessmentStepProps {
  speechProvider: BrowserSpeechProvider;
  onAssessmentCompleted: (result: ReadingAssessmentResult) => void;
  onSkip: () => void;
}

export const ReadingAssessmentStep: React.FC<ReadingAssessmentStepProps> = ({
  speechProvider,
  onAssessmentCompleted,
  onSkip
}) => {
  const passage = BASELINE_READING_PASSAGE;

  const [isReading, setIsReading] = useState<boolean>(false);
  const [seconds, setSeconds] = useState<number>(0);
  const [transcript, setTranscript] = useState<string>('');
  const [hasCompleted, setHasCompleted] = useState<boolean>(false);
  const [activeResult, setActiveResult] = useState<ReadingAssessmentResult | null>(null);

  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      speechProvider.stopRealtimeRecognition();
      speechProvider.stopRecording();
    };
  }, [speechProvider]);

  const handleStartReading = async () => {
    setIsReading(true);
    setTranscript('');
    setSeconds(0);
    startTimeRef.current = Date.now();

    timerRef.current = window.setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    try {
      await speechProvider.startRecording();
      speechProvider.startRealtimeRecognition({
        onTranscriptUpdate: (text) => {
          setTranscript(text);
        }
      });
    } catch (e) {
      console.warn('Speech capture notice during reading:', e);
    }
  };

  const handleFinishReading = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setIsReading(false);
    speechProvider.stopRealtimeRecognition();
    await speechProvider.stopRecording();

    const elapsedMs = Math.max(3000, Date.now() - startTimeRef.current);

    // Evaluate using core engine
    const evaluation = AssessmentEngine.evaluateReadingAttempt(passage, transcript, elapsedMs);
    setActiveResult(evaluation);
    setHasCompleted(true);
  };

  const handleReset = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsReading(false);
    setSeconds(0);
    setTranscript('');
    setHasCompleted(false);
    setActiveResult(null);
  };

  const handleContinue = () => {
    if (activeResult) {
      onAssessmentCompleted(activeResult);
    } else {
      const fallback = AssessmentEngine.evaluateReadingAttempt(passage, transcript || passage.passageText.slice(0, 150), seconds * 1000 || 15000);
      onAssessmentCompleted(fallback);
    }
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
          <Badge variant="focus" size="sm">Reading Aloud</Badge>
          <Badge variant="level" size="sm">80–120 Words</Badge>
        </div>
        <h2 className="typography-h2">Reading Aloud Assessment</h2>
        <p className="typography-body" style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-1)' }}>
          Read the short passage below aloud at your natural conversational tempo. When you are done, tap <strong>Finish Reading</strong>.
        </p>
      </div>

      {/* Reading Passage Card */}
      <Card variant="elevated" padding="lg">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
          <span style={{ fontSize: 'var(--text-caption)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-primary)', letterSpacing: '0.05em' }}>
            {passage.title}
          </span>
          <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-muted)' }}>
            {passage.wordCount} words
          </span>
        </div>

        {/* Comfortable 1.85 line-height reading passage layout */}
        <p
          className="reading-passage-text"
          style={{
            fontSize: '1.125rem',
            lineHeight: 1.85,
            color: 'var(--color-text-primary)',
            letterSpacing: '0.01em',
            padding: 'var(--space-4)',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-bg-subtle)',
            border: '1px solid var(--color-border)'
          }}
        >
          "{passage.passageText}"
        </p>

        {/* Live reading control bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 'var(--space-6)',
            paddingTop: 'var(--space-4)',
            borderTop: '1px solid var(--color-border-subtle)',
            flexWrap: 'wrap',
            gap: 'var(--space-3)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Clock size={16} color="var(--color-text-muted)" />
            <span style={{ fontSize: 'var(--text-body)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
              {Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, '0')}
            </span>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            {!isReading && !hasCompleted && (
              <Button
                variant="primary"
                size="md"
                onClick={handleStartReading}
                icon={<Play size={16} fill="currentColor" />}
                id="btn-start-reading"
              >
                Start Reading Aloud
              </Button>
            )}

            {isReading && (
              <Button
                variant="danger"
                size="md"
                onClick={handleFinishReading}
                icon={<Square size={16} fill="currentColor" />}
                id="btn-finish-reading"
              >
                Finish Reading
              </Button>
            )}

            {hasCompleted && (
              <Button
                variant="secondary"
                size="md"
                onClick={handleReset}
                icon={<RotateCcw size={15} />}
              >
                Re-read
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Observation Summary if completed */}
      {activeResult && (
        <Card variant="default" padding="md">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
            <Sparkles size={16} color="var(--color-primary)" />
            <h4 className="typography-h3" style={{ fontSize: '1rem' }}>Reading Aloud Observations</h4>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
            {activeResult.observedStrengths.map((str, i) => (
              <Badge key={i} variant="success" size="sm" icon={<CheckCircle2 size={12} />}>
                {str}
              </Badge>
            ))}
            {activeResult.approximatePaceWpm.value > 0 && (
              <Badge variant="primary" size="sm">
                Pace: ~{activeResult.approximatePaceWpm.value} WPM
              </Badge>
            )}
          </div>
        </Card>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-2)' }}>
        <Button variant="ghost" size="md" onClick={onSkip}>
          Skip reading check
        </Button>

        <Button
          variant="primary"
          size="lg"
          onClick={handleContinue}
          icon={<ArrowRight size={18} />}
          id="btn-step-reading-continue"
        >
          {hasCompleted ? 'Continue to Pronunciation Check' : 'Done, continue'}
        </Button>
      </div>
    </div>
  );
};
