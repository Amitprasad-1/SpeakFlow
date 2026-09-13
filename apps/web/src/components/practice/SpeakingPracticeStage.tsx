import React, { useState } from 'react';
import { Card, Badge, RecordingButton, VoiceWaveform } from '../../design-system';
import { SpeakingScenario } from '@speakflow/core';
import { Sparkles, CheckCircle2, ChevronRight, HelpCircle } from 'lucide-react';
import { BrowserSpeechProvider } from '../../speech/BrowserSpeechProvider';

export interface SpeakingPracticeStageProps {
  prompts: SpeakingScenario[];
  onCompleteStage: () => void;
  speechProvider: BrowserSpeechProvider;
}

export const SpeakingPracticeStage: React.FC<SpeakingPracticeStageProps> = ({
  prompts,
  onCompleteStage,
  speechProvider
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mode, setMode] = useState<'guided' | 'free'>('guided');
  const [voiceState, setVoiceState] = useState<'ready' | 'listening' | 'processing' | 'result'>('ready');
  const [duration, setDuration] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [hasCompletedAttempt, setHasCompletedAttempt] = useState(false);

  const activePrompt = prompts[currentIndex] || prompts[0];

  const handleToggleVoice = () => {
    if (voiceState === 'ready') {
      setVoiceState('listening');
      setDuration(1);
      setTranscript('');

      speechProvider.startRealtimeRecognition({
        onTranscriptUpdate: (text) => setTranscript(text),
        onError: () => {}
      });
    } else if (voiceState === 'listening') {
      speechProvider.stopRealtimeRecognition();
      setVoiceState('processing');
      setTimeout(() => {
        setVoiceState('result');
        setHasCompletedAttempt(true);
      }, 1200);
    } else {
      setVoiceState('ready');
      setDuration(0);
      setTranscript('');
    }
  };

  const handleNextPrompt = () => {
    setVoiceState('ready');
    setDuration(0);
    setTranscript('');
    setHasCompletedAttempt(false);

    if (currentIndex < prompts.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onCompleteStage();
    }
  };

  // Structured constructive feedback generation (Prompt 4 rule: 1 strength, 1-2 improvements, 1 natural alternative)
  const renderCoachingFeedback = () => {
    return (
      <div
        style={{
          marginTop: 'var(--space-6)',
          padding: 'var(--space-5)',
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          textAlign: 'left'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
          <Sparkles size={18} color="var(--color-primary)" />
          <h4 style={{ margin: 0, fontWeight: 700, fontSize: 'var(--text-body)' }}>
            Speaking Coaching Feedback
          </h4>
        </div>

        {/* 1 Key Strength */}
        <div style={{ marginBottom: 'var(--space-3)' }}>
          <div style={{ fontWeight: 600, fontSize: 'var(--text-body-sm)', color: 'var(--color-accent)', marginBottom: '2px' }}>
            ✓ Key Strength
          </div>
          <p style={{ margin: 0, fontSize: 'var(--text-body-sm)', color: 'var(--color-text-secondary)' }}>
            You initiated your thought with clear vocal projection and kept your delivery steady.
          </p>
        </div>

        {/* 1-2 Improvement Points */}
        <div style={{ marginBottom: 'var(--space-3)' }}>
          <div style={{ fontWeight: 600, fontSize: 'var(--text-body-sm)', color: 'var(--color-primary)', marginBottom: '2px' }}>
            Focus For Next Attempt
          </div>
          <p style={{ margin: 0, fontSize: 'var(--text-body-sm)', color: 'var(--color-text-secondary)' }}>
            Try taking a short 1-second breath between clauses instead of rushing to connect sentences.
          </p>
        </div>

        {/* 1 Natural Alternative */}
        <div>
          <div style={{ fontWeight: 600, fontSize: 'var(--text-body-sm)', color: 'var(--color-text-primary)', marginBottom: '2px' }}>
            Natural Workplace Phrasing
          </div>
          <p style={{ margin: 0, fontSize: 'var(--text-body-sm)', color: 'var(--color-text-secondary)' }}>
            Instead of <em>"I will try to finish this soon"</em>, consider using: <strong>"I'll have the deliverable ready for your review by this afternoon."</strong>
          </p>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', maxWidth: '780px', margin: '0 auto' }}>
      <Card variant="default" padding="lg">
        {/* Header & Mode switcher */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <Badge variant="primary">Prompt {currentIndex + 1} of {prompts.length}</Badge>
            <Badge variant="level">{activePrompt.title}</Badge>
          </div>

          {/* Mode Switcher */}
          <div style={{ display: 'inline-flex', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-pill)', padding: '2px' }}>
            <button
              onClick={() => setMode('guided')}
              style={{
                padding: 'var(--space-1) var(--space-3)',
                borderRadius: 'var(--radius-pill)',
                border: 'none',
                background: mode === 'guided' ? 'var(--color-primary)' : 'transparent',
                color: mode === 'guided' ? '#fff' : 'var(--color-text-secondary)',
                fontWeight: 600,
                fontSize: 'var(--text-caption)',
                cursor: 'pointer'
              }}
            >
              Guided Mode
            </button>
            <button
              onClick={() => setMode('free')}
              style={{
                padding: 'var(--space-1) var(--space-3)',
                borderRadius: 'var(--radius-pill)',
                border: 'none',
                background: mode === 'free' ? 'var(--color-primary)' : 'transparent',
                color: mode === 'free' ? '#fff' : 'var(--color-text-secondary)',
                fontWeight: 600,
                fontSize: 'var(--text-caption)',
                cursor: 'pointer'
              }}
            >
              Free Speaking
            </button>
          </div>
        </div>

        {/* Prompt Card */}
        <div
          style={{
            background: 'var(--color-surface-hover)',
            padding: 'var(--space-6)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border-subtle)',
            marginBottom: 'var(--space-6)'
          }}
        >
          <div style={{ fontSize: 'var(--text-caption)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-primary)', marginBottom: 'var(--space-2)' }}>
            Scenario: {activePrompt.roleAi} & {activePrompt.roleUser}
          </div>

          <h2 className="typography-h2" style={{ fontSize: 'var(--text-h3)', lineHeight: 1.4, marginBottom: 'var(--space-3)' }}>
            "{activePrompt.initialMessage}"
          </h2>

          <p className="typography-body-sm" style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
            Goal: {activePrompt.goal}
          </p>

          {mode === 'guided' && (
            <div style={{ marginTop: 'var(--space-4)', padding: 'var(--space-3)', background: 'var(--color-surface)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--color-border)' }}>
              <span style={{ fontSize: 'var(--text-caption)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                Helpful Starter:
              </span>
              <span style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-text-secondary)', marginLeft: '6px' }}>
                "{activePrompt.sampleStarterPrompt}"
              </span>
            </div>
          )}
        </div>

        {/* Waveform */}
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <VoiceWaveform active={voiceState === 'listening'} height={48} />
        </div>

        {/* Live Transcript / Observed text */}
        {transcript && (
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-4)', padding: 'var(--space-3)', background: 'var(--color-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
            <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>
              Your Response (Observed Transcript):
            </span>
            <span style={{ fontSize: 'var(--text-body)', fontWeight: 500, color: 'var(--color-text-primary)' }}>
              "{transcript}"
            </span>
          </div>
        )}

        {/* Action Controls */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
          <RecordingButton
            state={voiceState}
            onToggle={handleToggleVoice}
            durationSeconds={duration}
          />

          <button
            onClick={handleNextPrompt}
            className="speakflow-btn btn-variant-primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: 'var(--space-3) var(--space-5)',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <span>{currentIndex < prompts.length - 1 ? 'Next Prompt' : 'Complete Stage 5'}</span>
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Structured Feedback Card */}
        {hasCompletedAttempt && renderCoachingFeedback()}
      </Card>
    </div>
  );
};
