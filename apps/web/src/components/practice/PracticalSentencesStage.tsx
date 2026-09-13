import React, { useState } from 'react';
import { Card, Badge, RecordingButton, VoiceWaveform } from '../../design-system';
import { PracticeSentence } from '@speakflow/core';
import { Volume2, ChevronRight, CheckCircle2, RotateCcw } from 'lucide-react';
import { BrowserSpeechProvider } from '../../speech/BrowserSpeechProvider';

export interface PracticalSentencesStageProps {
  sentences: PracticeSentence[];
  onCompleteStage: () => void;
  speechProvider: BrowserSpeechProvider;
}

export const PracticalSentencesStage: React.FC<PracticalSentencesStageProps> = ({
  sentences,
  onCompleteStage,
  speechProvider
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [voiceState, setVoiceState] = useState<'ready' | 'listening' | 'processing' | 'result'>('ready');
  const [recordedDuration, setRecordedDuration] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const activeSentence = sentences[currentIndex] || sentences[0];

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
      }, 900);
    } else {
      setVoiceState('ready');
      setRecordedDuration(0);
      setTranscript('');
    }
  };

  const handlePlayAudio = () => {
    setIsPlayingAudio(true);
    speechProvider.synthesizeSpeech(activeSentence.text, { rate: 0.95 }).finally(() => {
      setIsPlayingAudio(false);
    });
  };

  const handleNext = () => {
    setVoiceState('ready');
    setRecordedDuration(0);
    setTranscript('');

    if (currentIndex < sentences.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onCompleteStage();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', maxWidth: '760px', margin: '0 auto' }}>
      <Card variant="default" padding="lg">
        {/* Progress & Category bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <Badge variant="primary">Sentence {currentIndex + 1} of {sentences.length}</Badge>
            <Badge variant="level">{activeSentence.contextCategory}</Badge>
          </div>

          <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-muted)' }}>
            Listen • Repeat • Record
          </span>
        </div>

        {/* Big Sentence Card */}
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
              lineHeight: 1.5,
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--space-3)'
            }}
          >
            "{activeSentence.text}"
          </h2>

          <div style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-text-secondary)', maxWidth: '540px', margin: '0 auto' }}>
            Tip: {activeSentence.phoneticNotes}
          </div>
        </div>

        {/* Live Audio Visualizer */}
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <VoiceWaveform active={voiceState === 'listening'} height={44} />
        </div>

        {/* Observed Spoken Output */}
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

        {/* Actions Controls */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
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
            onClick={handleNext}
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
            <span>{currentIndex < sentences.length - 1 ? 'Next Sentence' : 'Complete Stage 4'}</span>
            <ChevronRight size={18} />
          </button>
        </div>
      </Card>
    </div>
  );
};
