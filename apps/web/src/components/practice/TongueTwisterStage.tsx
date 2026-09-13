import React, { useState } from 'react';
import { Card, Badge, RecordingButton, VoiceWaveform, AudioPlayer } from '../../design-system';
import { TongueTwister } from '@speakflow/core';
import { CheckCircle2, ChevronRight, RotateCcw, Volume2, Sparkles } from 'lucide-react';
import { BrowserSpeechProvider } from '../../speech/BrowserSpeechProvider';

export interface TongueTwisterStageProps {
  twisters: TongueTwister[];
  onCompleteStage: () => void;
  speechProvider: BrowserSpeechProvider;
}

export const TongueTwisterStage: React.FC<TongueTwisterStageProps> = ({
  twisters,
  onCompleteStage,
  speechProvider
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [tempo, setTempo] = useState<'slow' | 'normal' | 'fast'>('normal');
  const [voiceState, setVoiceState] = useState<'ready' | 'listening' | 'processing' | 'result'>('ready');
  const [recordedDuration, setRecordedDuration] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const activeTwister = twisters[currentIndex] || twisters[0];

  const handleToggleVoice = () => {
    if (voiceState === 'ready') {
      setVoiceState('listening');
      setRecordedDuration(1);
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
      }, 1000);
    } else {
      setVoiceState('ready');
      setRecordedDuration(0);
      setTranscript('');
    }
  };

  const handlePlayAudio = () => {
    setIsPlayingAudio(true);
    const rate = tempo === 'slow' ? 0.75 : tempo === 'fast' ? 1.25 : 1.0;
    speechProvider.synthesizeSpeech(activeTwister.text, { rate }).finally(() => {
      setIsPlayingAudio(false);
    });
  };

  const handleNextTwister = () => {
    setVoiceState('ready');
    setRecordedDuration(0);
    setTranscript('');
    if (currentIndex < twisters.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onCompleteStage();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', maxWidth: '740px', margin: '0 auto' }}>
      <Card variant="default" padding="lg">
        {/* Header with twister counter and focus sound */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <Badge variant="primary">Twister {currentIndex + 1} of {twisters.length}</Badge>
            <Badge variant="focus">{activeTwister.focusSound}</Badge>
          </div>
          <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-muted)' }}>
            Clarity First • Speed Second
          </span>
        </div>

        {/* Speed Progression Selector */}
        <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
          {(['slow', 'normal', 'fast'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTempo(t)}
              style={{
                flex: 1,
                padding: 'var(--space-2) var(--space-3)',
                borderRadius: 'var(--radius-md)',
                background: tempo === t ? 'var(--color-primary-subtle)' : 'var(--color-surface)',
                border: `1px solid ${tempo === t ? 'var(--color-primary)' : 'var(--color-border)'}`,
                color: tempo === t ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                fontWeight: 600,
                fontSize: 'var(--text-caption)',
                cursor: 'pointer',
                textTransform: 'capitalize'
              }}
            >
              {t === 'slow' ? '1. Slow & Crisp' : t === 'normal' ? '2. Normal Cadence' : '3. Fluent Speed'}
            </button>
          ))}
        </div>

        {/* Big Prominent Twister Text Display */}
        <div
          style={{
            background: 'var(--color-surface-hover)',
            padding: 'var(--space-6)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border-subtle)',
            textAlign: 'center',
            marginBottom: 'var(--space-6)'
          }}
        >
          <h2
            className="typography-h2"
            style={{
              fontSize: 'var(--text-h2)',
              lineHeight: 1.45,
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--space-3)'
            }}
          >
            "{activeTwister.text}"
          </h2>

          <div style={{ fontSize: 'var(--text-body-sm)', fontFamily: 'monospace', color: 'var(--color-text-muted)' }}>
            {activeTwister.phoneticBreakdown}
          </div>
        </div>

        {/* Coach Tip */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)', marginBottom: 'var(--space-6)', padding: 'var(--space-3)', background: 'var(--color-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
          <Sparkles size={16} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-text-secondary)' }}>
            <strong>Coach tip:</strong> {activeTwister.tip}
          </div>
        </div>

        {/* Live Audio & Waveform Area */}
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <VoiceWaveform active={voiceState === 'listening'} height={48} />
        </div>

        {/* Transcript or Recognition Feedback */}
        {transcript && (
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-4)', padding: 'var(--space-3)', background: 'var(--color-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
            <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>
              Detected Speech (Observed):
            </span>
            <span style={{ fontSize: 'var(--text-body)', fontWeight: 500, color: 'var(--color-text-primary)' }}>
              "{transcript}"
            </span>
          </div>
        )}

        {/* Central Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={handlePlayAudio}
              className="speakflow-btn btn-variant-ghost"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                padding: 'var(--space-3) var(--space-4)',
                borderRadius: 'var(--radius-md)',
                fontWeight: 600,
                cursor: 'pointer'
              }}
              title="Listen to native pronunciation"
            >
              <Volume2 size={18} />
              <span>{isPlayingAudio ? 'Playing...' : 'Listen'}</span>
            </button>

            <RecordingButton
              state={voiceState}
              onToggle={handleToggleVoice}
              durationSeconds={recordedDuration}
            />

            <button
              onClick={handleNextTwister}
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
              <span>{currentIndex < twisters.length - 1 ? 'Next Twister' : 'Complete Stage 2'}</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};
