import React, { useState, useEffect, useRef } from 'react';
import { Card, Badge, Button } from '../../design-system';
import { VoiceWaveVisualizer } from '../common/VoiceWaveVisualizer';
import {
  ReadingPassage,
  READING_PASSAGES_CATALOG,
  DailyPracticeEngine
} from '@speakflow/core';
import {
  Volume2,
  Play,
  Square,
  Mic,
  MicOff,
  Sparkles,
  BookOpen,
  ZoomIn,
  ZoomOut,
  Clock,
  CheckCircle2,
  RotateCcw
} from 'lucide-react';

export interface DailyReadingTabProps {
  currentDateString?: string;
}

export const DailyReadingTab: React.FC<DailyReadingTabProps> = ({
  currentDateString
}) => {
  // Select today's reading passage (160-200 words)
  const [passage, setPassage] = useState<ReadingPassage>(() => {
    let dayNum = new Date().getDate();
    if (currentDateString) {
      const parts = currentDateString.split('-');
      if (parts.length === 3) dayNum = parseInt(parts[2], 10) || dayNum;
    }
    const idx = dayNum % READING_PASSAGES_CATALOG.length;
    return READING_PASSAGES_CATALOG[idx] || READING_PASSAGES_CATALOG[0];
  });

  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<0.8 | 1.0>(1.0);
  const [textSize, setTextSize] = useState<'normal' | 'large'>('normal');
  const [isRecording, setIsRecording] = useState(false);
  const [readingSeconds, setReadingSeconds] = useState(0);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [estimatedWpm, setEstimatedWpm] = useState<number | null>(null);

  const timerRef = useRef<any>(null);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const toggleAudio = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    window.speechSynthesis.cancel();
    setIsPlayingAudio(true);

    const utterance = new SpeechSynthesisUtterance(passage.passageText);
    utterance.rate = playbackSpeed;
    utterance.pitch = 1.0;

    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
  };

  const toggleRecording = () => {
    if (isRecording) {
      // Finish recording
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);

      const mins = Math.max(0.1, readingSeconds / 60);
      const wpm = Math.round(passage.wordCount / mins);
      setEstimatedWpm(wpm);
      setHasCompleted(true);
      return;
    }

    // Start reading session
    setHasCompleted(false);
    setEstimatedWpm(null);
    setReadingSeconds(0);
    setIsRecording(true);

    timerRef.current = setInterval(() => {
      setReadingSeconds((prev) => prev + 1);
    }, 1000);
  };

  const resetPractice = () => {
    window.speechSynthesis?.cancel();
    setIsPlayingAudio(false);
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setReadingSeconds(0);
    setHasCompleted(false);
    setEstimatedWpm(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', maxWidth: '820px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
            <Badge variant="primary">Daily 200-Word Reading</Badge>
            <Badge variant="level">{passage.topic}</Badge>
            <Badge variant="focus">{passage.wordCount} words</Badge>
          </div>
          <h1 className="typography-h2">{passage.title}</h1>
          <p className="typography-body-sm" style={{ color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Read aloud every day to build speaking rhythm, breath control, and natural sentence flow.
          </p>
        </div>

        {/* Text Size & Reset */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <button
            onClick={() => setTextSize(prev => prev === 'normal' ? 'large' : 'normal')}
            className="tap-interactive"
            style={{
              padding: 'var(--space-1-5) var(--space-3)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: 'var(--text-body-sm)',
              fontWeight: 600,
              cursor: 'pointer',
              color: 'var(--color-text-primary)'
            }}
          >
            {textSize === 'normal' ? <ZoomIn size={16} /> : <ZoomOut size={16} />}
            <span>{textSize === 'normal' ? 'Larger Text' : 'Standard'}</span>
          </button>

          {(hasCompleted || isRecording || readingSeconds > 0) && (
            <button
              onClick={resetPractice}
              className="tap-interactive"
              style={{
                padding: 'var(--space-1-5) var(--space-3)',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: 'var(--text-body-sm)',
                fontWeight: 600,
                cursor: 'pointer',
                color: 'var(--color-text-secondary)'
              }}
            >
              <RotateCcw size={15} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Audio & Practice Control Bar */}
      <Card
        variant="elevated"
        padding="md"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--space-3)',
          background: 'linear-gradient(135deg, var(--color-surface) 0%, rgba(37, 99, 235, 0.05) 100%)'
        }}
      >
        {/* Listen Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <button
            onClick={toggleAudio}
            className="speakflow-btn btn-variant-secondary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: 'var(--space-2) var(--space-4)',
              borderRadius: 'var(--radius-pill)',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {isPlayingAudio ? <Square size={16} fill="currentColor" /> : <Volume2 size={18} />}
            <span>{isPlayingAudio ? 'Stop Audio' : 'Listen Native Speaker'}</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--color-surface-sunken)', padding: '2px 4px', borderRadius: 'var(--radius-pill)', border: '1px solid var(--color-border)' }}>
            <button
              onClick={() => setPlaybackSpeed(0.8)}
              style={{
                padding: '2px 8px',
                borderRadius: 'var(--radius-pill)',
                border: 'none',
                background: playbackSpeed === 0.8 ? 'var(--color-primary)' : 'transparent',
                color: playbackSpeed === 0.8 ? '#fff' : 'var(--color-text-secondary)',
                fontSize: 'var(--text-caption)',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              0.8x Slow
            </button>
            <button
              onClick={() => setPlaybackSpeed(1.0)}
              style={{
                padding: '2px 8px',
                borderRadius: 'var(--radius-pill)',
                border: 'none',
                background: playbackSpeed === 1.0 ? 'var(--color-primary)' : 'transparent',
                color: playbackSpeed === 1.0 ? '#fff' : 'var(--color-text-secondary)',
                fontSize: 'var(--text-caption)',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              1.0x Normal
            </button>
          </div>

          <VoiceWaveVisualizer isActive={isPlayingAudio} size="sm" color="var(--color-primary)" />
        </div>

        {/* Read Aloud & Mic Record Action */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <button
            onClick={toggleRecording}
            className={`speakflow-btn ${isRecording ? 'btn-variant-danger' : 'btn-variant-primary'} cta-breathing`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: 'var(--space-2-5) var(--space-5)',
              borderRadius: 'var(--radius-pill)',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: 'var(--text-body-sm)'
            }}
          >
            {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
            <span>{isRecording ? `Reading (${readingSeconds}s)... Tap to Finish` : 'Tap & Read Aloud'}</span>
          </button>

          {isRecording && (
            <VoiceWaveVisualizer isActive={true} size="sm" color="var(--color-error)" />
          )}
        </div>
      </Card>

      {/* Completion Summary Card */}
      {hasCompleted && estimatedWpm && (
        <Card variant="default" padding="md" className="celebrate-pop" style={{ borderLeft: '4px solid var(--color-success)', background: 'var(--color-surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <CheckCircle2 size={24} color="var(--color-success)" />
              <div>
                <div style={{ fontWeight: 700, fontSize: 'var(--text-body)', color: 'var(--color-text-primary)' }}>
                  Reading Session Complete!
                </div>
                <div className="typography-caption" style={{ color: 'var(--color-text-secondary)' }}>
                  You read {passage.wordCount} words in {readingSeconds} seconds.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                  {estimatedWpm} WPM
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
                  Target: 130–150 WPM
                </div>
              </div>
              <Badge variant={estimatedWpm >= 110 && estimatedWpm <= 160 ? 'success' : 'focus'}>
                {estimatedWpm < 110 ? 'Deliberate & Clear' : estimatedWpm > 160 ? 'Brisk Pace' : 'Natural Rhythm'}
              </Badge>
            </div>
          </div>
        </Card>
      )}

      {/* The 200-Word Reading Passage Container */}
      <Card
        variant="default"
        padding="lg"
        style={{
          lineHeight: textSize === 'large' ? 1.9 : 1.75,
          fontSize: textSize === 'large' ? '1.25rem' : '1.0625rem',
          color: 'var(--color-text-primary)',
          letterSpacing: '0.01em',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)'
        }}
      >
        <p style={{ margin: 0 }}>
          {passage.passageText}
        </p>
      </Card>

      {/* Key Vocabulary from Passage */}
      {passage.vocabularyWords && passage.vocabularyWords.length > 0 && (
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
            <BookOpen size={18} color="var(--color-primary)" />
            <h3 className="typography-h3">Key Vocabulary from Today's Story</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 'var(--space-3)' }}>
            {passage.vocabularyWords.map((vocab) => (
              <Card key={vocab.id} variant="default" padding="sm" style={{ borderLeft: '3px solid var(--color-primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 700, fontSize: 'var(--text-body)', color: 'var(--color-text-primary)' }}>
                    {vocab.word}
                  </span>
                  <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
                    {vocab.phoneticIpa}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)' }}>
                  {vocab.definition}
                </p>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
