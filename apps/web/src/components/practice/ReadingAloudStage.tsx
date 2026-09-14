import React, { useState, useEffect } from 'react';
import { Card, Badge, VoiceWaveform } from '../../design-system';
import { ReadingPassage, VocabularyWord } from '@speakflow/core';
import { Play, Pause, CheckCircle2, Volume2, Type, Sparkles } from 'lucide-react';
import { BrowserSpeechProvider } from '../../speech/BrowserSpeechProvider';

export interface ReadingAloudStageProps {
  passage: ReadingPassage;
  onCompleteStage: () => void;
  speechProvider: BrowserSpeechProvider;
}

export const ReadingAloudStage: React.FC<ReadingAloudStageProps> = ({
  passage,
  onCompleteStage,
  speechProvider
}) => {
  const [isReading, setIsReading] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [fontSizeScale, setFontSizeScale] = useState<'normal' | 'large'>('normal');
  const [transcript, setTranscript] = useState('');
  const [wordsDetected, setWordsDetected] = useState(0);
  const [selectedVocab, setSelectedVocab] = useState<VocabularyWord | null>(null);
  const [isDoneReading, setIsDoneReading] = useState(false);

  // Reading stopwatch timer
  useEffect(() => {
    let interval: number | null = null;
    if (isReading) {
      interval = window.setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isReading]);

  const finishReadingSession = () => {
    setIsReading(false);
    speechProvider.stopRealtimeRecognition();
    setIsDoneReading(true);
  };

  const handleToggleReading = () => {
    if (!isReading) {
      setIsReading(true);
      speechProvider.startRealtimeRecognition({
        autoEndOnSilence: true,
        silenceThresholdMs: 2500, // Generous pause threshold for reading passages
        noSpeechTimeoutMs: 12000,
        onTranscriptUpdate: (text) => {
          setTranscript(text);
          const words = text.trim().split(/\s+/).filter(Boolean).length;
          setWordsDetected(words);
        },
        onSilenceDetected: () => {
          // If user has read at least 6 words and paused for 2.5s, complete reading session
          finishReadingSession();
        },
        onNoSpeechTimeout: () => {
          setIsReading(false);
        },
        onError: () => {}
      });
    } else {
      finishReadingSession();
    }
  };

  const handlePlayVocabAudio = (word: VocabularyWord) => {
    speechProvider.synthesizeSpeech(`${word.word}. ${word.definition}`, { rate: 0.9 });
  };

  // Estimated WPM (words per minute) calculation
  const estimatedWpm = elapsedSeconds > 5 && wordsDetected > 0
    ? Math.round((wordsDetected / elapsedSeconds) * 60)
    : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', maxWidth: '820px', margin: '0 auto' }}>
      {/* Passage Card */}
      <Card variant="default" padding="lg">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
          <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
            <Badge variant="primary">{passage.topic}</Badge>
            <Badge variant="level">{passage.wordCount} Words</Badge>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <button
              onClick={() => setFontSizeScale((prev) => (prev === 'normal' ? 'large' : 'normal'))}
              className="speakflow-btn btn-variant-ghost"
              style={{ padding: 'var(--space-1-5) var(--space-2-5)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-body-sm)' }}
              title="Toggle font size"
            >
              <Type size={16} />
              <span style={{ marginLeft: '4px' }}>{fontSizeScale === 'normal' ? 'Larger Text' : 'Standard'}</span>
            </button>
            <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-muted)' }}>
              Target: 160–200 words
            </span>
          </div>
        </div>

        <h2 className="typography-h2" style={{ marginBottom: 'var(--space-4)' }}>
          {passage.title}
        </h2>

        {/* Passage text block */}
        <div
          style={{
            lineHeight: 1.85,
            fontSize: fontSizeScale === 'large' ? '1.25rem' : '1.0625rem',
            color: 'var(--color-text-primary)',
            background: 'var(--color-surface)',
            padding: 'var(--space-6)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            marginBottom: 'var(--space-6)',
            maxHeight: '400px',
            overflowY: 'auto'
          }}
        >
          {passage.passageText}
        </div>

        {/* Live reading audio feedback and duration */}
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <VoiceWaveform active={isReading} height={44} />
        </div>

        {/* Observed reading metrics */}
        {isDoneReading && (
          <div
            style={{
              padding: 'var(--space-4)',
              background: 'var(--color-surface-hover)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border-subtle)',
              marginBottom: 'var(--space-6)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: 'var(--space-3)',
              textAlign: 'center'
            }}
          >
            <div>
              <div style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                Reading Time
              </div>
              <div style={{ fontSize: 'var(--text-h3)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                {elapsedSeconds}s
              </div>
            </div>

            <div>
              <div style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                Words Detected
              </div>
              <div style={{ fontSize: 'var(--text-h3)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                {wordsDetected} / {passage.wordCount}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                Estimated Pace
              </div>
              <div style={{ fontSize: 'var(--text-h3)', fontWeight: 700, color: 'var(--color-primary)' }}>
                {estimatedWpm ? `${estimatedWpm} WPM` : 'Normal'}
              </div>
            </div>
          </div>
        )}

        {/* Control bar */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
          <button
            onClick={handleToggleReading}
            className={`speakflow-btn ${isReading ? 'btn-variant-secondary' : 'btn-variant-primary'}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: 'var(--space-3) var(--space-6)',
              borderRadius: 'var(--radius-md)',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {isReading ? <Pause size={18} /> : <Play size={18} />}
            <span>{isReading ? 'Pause / Finish Reading' : elapsedSeconds > 0 ? 'Resume Reading' : 'Start Reading Aloud'}</span>
          </button>

          <button
            onClick={onCompleteStage}
            className="speakflow-btn btn-variant-secondary"
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
            <CheckCircle2 size={18} color="var(--color-accent)" />
            <span>Complete Stage 3</span>
          </button>
        </div>
      </Card>

      {/* Exactly 6 Key Vocabulary Cards */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
          <Sparkles size={18} color="var(--color-primary)" />
          <h3 className="typography-h3" style={{ margin: 0 }}>
            6 Key Vocabulary Words in this Passage
          </h3>
        </div>
        <p className="typography-body-sm" style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
          Tap any word to listen to its phonetic pronunciation guide and definition.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-3)' }}>
          {passage.vocabularyWords.map((vocab) => (
            <div
              key={vocab.id}
              onClick={() => handlePlayVocabAudio(vocab)}
              style={{
                padding: 'var(--space-4)',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'border-color var(--motion-duration-fast) ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-1)' }}>
                <div style={{ fontWeight: 700, fontSize: 'var(--text-body)', color: 'var(--color-text-primary)' }}>
                  {vocab.word}
                </div>
                <Volume2 size={16} color="var(--color-primary)" />
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: 'var(--text-caption)', color: 'var(--color-primary)', marginBottom: 'var(--space-1)' }}>
                {vocab.phoneticIpa} • {vocab.syllableBreakdown}
              </div>
              <div style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)' }}>
                {vocab.definition}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
