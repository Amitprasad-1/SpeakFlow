import React, { useState, useEffect, useRef } from 'react';
import {
  Button,
  Card,
  Badge,
  RecordingButton,
  VoiceWaveform,
  VoiceState
} from '../../../design-system';
import {
  BASELINE_SPEAKING_PROMPTS,
  BaselineSpeakingPrompt,
  AssessmentEngine,
  SpeakingAssessmentResult
} from '@speakflow/core';
import { BrowserSpeechProvider } from '../../../speech/BrowserSpeechProvider';
import {
  ArrowRight,
  Shield,
  RotateCcw,
  Volume2,
  Mic,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Info
} from 'lucide-react';

export interface SpeakingAssessmentStepProps {
  speechProvider: BrowserSpeechProvider;
  onAssessmentCompleted: (result: SpeakingAssessmentResult) => void;
  onSkip: () => void;
}

export const SpeakingAssessmentStep: React.FC<SpeakingAssessmentStepProps> = ({
  speechProvider,
  onAssessmentCompleted,
  onSkip
}) => {
  const prompt: BaselineSpeakingPrompt = BASELINE_SPEAKING_PROMPTS[0];

  const [voiceState, setVoiceState] = useState<VoiceState>('ready');
  const [transcript, setTranscript] = useState<string>('');
  const [duration, setDuration] = useState<number>(0);
  const [micPermission, setMicPermission] = useState<'granted' | 'prompt' | 'denied' | 'unsupported'>('prompt');
  const [micNotice, setMicNotice] = useState<string | null>(null);
  const [hasRecorded, setHasRecorded] = useState<boolean>(false);
  const [activeResult, setActiveResult] = useState<SpeakingAssessmentResult | null>(null);

  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // Check microphone support on mount
  useEffect(() => {
    speechProvider.checkMicrophonePermission().then((status) => {
      setMicPermission(status);
      if (status === 'unsupported') {
        setMicNotice("Your browser doesn't support direct speech capture. You can continue or practice with sample patterns.");
      }
    });

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      speechProvider.stopRealtimeRecognition();
      speechProvider.stopRecording();
    };
  }, [speechProvider]);

  const handleStartRecording = async () => {
    setMicNotice(null);
    setTranscript('');
    setVoiceState('listening');
    startTimeRef.current = Date.now();
    setDuration(0);

    timerRef.current = window.setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);

    try {
      await speechProvider.startRecording();
      speechProvider.startRealtimeRecognition({
        onTranscriptUpdate: (text) => {
          setTranscript(text);
        },
        onError: (err) => {
          console.warn('Speech recognition notice:', err);
          // If browser speech recognition is not available or blocked, provide graceful coaching mode
          if (!transcript) {
            setMicNotice("Speech capture is operating in coaching mode. Speak comfortably and we'll analyze the duration and rhythm.");
          }
        }
      });
      setMicPermission('granted');
    } catch (e: any) {
      console.warn('Microphone start error:', e);
      setMicPermission('denied');
      setMicNotice('Microphone permission was not granted. You can still continue to the next activity.');
      setVoiceState('ready');
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleStopRecording = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setVoiceState('processing');
    speechProvider.stopRealtimeRecognition();
    await speechProvider.stopRecording();

    const elapsedMs = Math.max(1500, Date.now() - startTimeRef.current);

    // Evaluate using core engine with honest metric observation
    setTimeout(() => {
      const evaluation = AssessmentEngine.evaluateSpeakingAttempt(prompt, transcript, elapsedMs);
      setActiveResult(evaluation);
      setHasRecorded(true);
      setVoiceState('result');
    }, 800);
  };

  const handleToggle = () => {
    if (voiceState === 'ready') {
      handleStartRecording();
    } else if (voiceState === 'listening') {
      handleStopRecording();
    } else {
      // Re-record
      setVoiceState('ready');
      setTranscript('');
      setHasRecorded(false);
      setActiveResult(null);
      setDuration(0);
    }
  };

  const handleContinue = () => {
    if (activeResult) {
      onAssessmentCompleted(activeResult);
    } else {
      // Create neutral completed result if skipped or unsupported
      const fallback = AssessmentEngine.evaluateSpeakingAttempt(prompt, transcript || 'Spontaneous check-in', duration * 1000 || 5000);
      onAssessmentCompleted(fallback);
    }
  };

  return (
    <div style={{ maxWidth: '620px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
          <Badge variant="primary" size="sm">Speaking Baseline</Badge>
          <Badge variant="focus" size="sm">Prompt 1 of 1</Badge>
        </div>
        <h2 className="typography-h2">Quick Speaking Check</h2>
        <p className="typography-body" style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-1)' }}>
          Speak naturally in your everyday voice. There is no need for perfect English—your coach is simply listening for cadence, pauses, and pacing.
        </p>
      </div>

      {/* Reassurance Notice */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2-5)',
          padding: 'var(--space-3) var(--space-4)',
          background: 'var(--color-bg-subtle)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          fontSize: 'var(--text-body-sm)',
          color: 'var(--color-text-secondary)'
        }}
      >
        <Shield size={16} color="var(--color-primary)" style={{ flexShrink: 0 }} />
        <span>Voice audio is processed ephemerally in volatile memory. No permanent audio recording is stored.</span>
      </div>

      {/* Speaking Prompt Card */}
      <Card variant="default" padding="lg" style={{ textAlign: 'center' }}>
        <div style={{ maxWidth: '520px', margin: '0 auto' }}>
          <span
            style={{
              fontSize: 'var(--text-caption)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--color-primary)',
              display: 'block',
              marginBottom: 'var(--space-2)'
            }}
          >
            {prompt.title}
          </span>

          <h3 className="typography-h2" style={{ marginBottom: 'var(--space-2)' }}>
            "{prompt.promptText}"
          </h3>

          <p className="typography-body-sm" style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-6)' }}>
            {prompt.guideQuestion}
          </p>

          {/* Real-time Waveform */}
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <VoiceWaveform active={voiceState === 'listening'} height={48} />
          </div>

          {/* Central Recording Button */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-4)' }}>
            <RecordingButton
              state={voiceState}
              onToggle={handleToggle}
              durationSeconds={duration}
            />
          </div>

          {/* State guidance text */}
          <div style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-text-secondary)', minHeight: '24px' }}>
            {voiceState === 'ready' && 'Tap the microphone and answer naturally (15–30 seconds)'}
            {voiceState === 'listening' && 'Listening... tap when you are finished'}
            {voiceState === 'processing' && 'Synthesizing pacing and speech rhythm...'}
            {voiceState === 'result' && (
              <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>
                Response recorded! You can retry or continue.
              </span>
            )}
          </div>

          {/* Transcript preview if available */}
          {transcript && (
            <div
              style={{
                marginTop: 'var(--space-4)',
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                fontSize: 'var(--text-body-sm)',
                color: 'var(--color-text-primary)',
                fontStyle: 'italic',
                textAlign: 'left'
              }}
            >
              "{transcript}"
            </div>
          )}

          {/* Mic notice if blocked/unsupported */}
          {micNotice && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                marginTop: 'var(--space-4)',
                padding: 'var(--space-2) var(--space-3)',
                background: 'var(--color-warning-subtle)',
                border: '1px solid var(--color-warning)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-caption)',
                color: 'var(--color-text-primary)',
                textAlign: 'left'
              }}
            >
              <AlertCircle size={15} color="var(--color-warning)" style={{ flexShrink: 0 }} />
              <span>{micNotice}</span>
            </div>
          )}
        </div>
      </Card>

      {/* Observation Summary if recorded */}
      {activeResult && (
        <Card variant="default" padding="md">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
            <Sparkles size={16} color="var(--color-primary)" />
            <h4 className="typography-h3" style={{ fontSize: '1rem' }}>Initial Speaking Observations</h4>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
            {activeResult.observedStrengths.map((str, i) => (
              <Badge key={i} variant="success" size="sm" icon={<CheckCircle2 size={12} />}>
                {str}
              </Badge>
            ))}
            {activeResult.wordsPerMinute.status === 'observed' && (
              <Badge variant="primary" size="sm">
                Observed Pace: ~{activeResult.wordsPerMinute.value} WPM
              </Badge>
            )}
          </div>
        </Card>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-2)' }}>
        <Button variant="ghost" size="md" onClick={onSkip}>
          Skip speaking check
        </Button>

        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          {hasRecorded && (
            <Button
              variant="secondary"
              size="md"
              onClick={handleToggle}
              icon={<RotateCcw size={15} />}
            >
              Retry
            </Button>
          )}

          <Button
            variant="primary"
            size="lg"
            onClick={handleContinue}
            icon={<ArrowRight size={18} />}
            id="btn-step-speaking-continue"
          >
            {hasRecorded ? 'Continue to Reading' : 'Done, continue'}
          </Button>
        </div>
      </div>
    </div>
  );
};
