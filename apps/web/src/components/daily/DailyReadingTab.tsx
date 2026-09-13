import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Card, Badge } from '../../design-system';
import {
  ReadingPassage,
  READING_PASSAGES_CATALOG
} from '@speakflow/core';
import {
  Volume2,
  Play,
  Pause,
  Square,
  Mic,
  MicOff,
  BookOpen,
  ZoomIn,
  ZoomOut,
  CheckCircle2,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export interface DailyReadingTabProps {
  currentDateString?: string;
}

export const DailyReadingTab: React.FC<DailyReadingTabProps> = ({
  currentDateString
}) => {
  // Select today's reading passage (160-200 words) dynamically based on date
  const passage: ReadingPassage = useMemo(() => {
    let dayNum = new Date().getDate();
    if (currentDateString) {
      const parts = currentDateString.split('-');
      if (parts.length === 3) dayNum = parseInt(parts[2], 10) || dayNum;
    }
    const safeDay = Math.abs(dayNum);
    const idx = safeDay % READING_PASSAGES_CATALOG.length;
    return READING_PASSAGES_CATALOG[idx] || READING_PASSAGES_CATALOG[0];
  }, [currentDateString]);

  // Parse passage into clean individual sentences
  const sentences = useMemo<string[]>(() => {
    if (!passage?.passageText) return [];
    const matches = passage.passageText.match(/[^.!?]+[.!?]+(?:\s+|$)|[^.!?]+$/g);
    if (!matches) return [passage.passageText];
    return matches.map(s => s.trim()).filter(Boolean);
  }, [passage?.passageText]);

  // State
  const [activeSentenceIndex, setActiveSentenceIndex] = useState<number>(0);
  const [isPacerRunning, setIsPacerRunning] = useState<boolean>(false);
  const [pacerSpeed, setPacerSpeed] = useState<120 | 150 | 180 | 210>(150);
  const [sentenceProgress, setSentenceProgress] = useState<number>(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [playingSentenceIndex, setPlayingSentenceIndex] = useState<number | null>(null);

  const [textSize, setTextSize] = useState<'normal' | 'large'>('normal');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [readingSeconds, setReadingSeconds] = useState<number>(0);
  const [hasCompleted, setHasCompleted] = useState<boolean>(false);
  const [estimatedWpm, setEstimatedWpm] = useState<number | null>(null);

  // Refs
  const pacerTimerRef = useRef<any>(null);
  const recordTimerRef = useRef<any>(null);
  const sentenceRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const pacerElapsedRef = useRef<number>(0);

  // Reset when day or passage changes
  useEffect(() => {
    resetPractice();
    setActiveSentenceIndex(0);
  }, [currentDateString, passage.id]);

  // Clean up timers & speech on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
      if (pacerTimerRef.current) clearInterval(pacerTimerRef.current);
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    };
  }, []);

  // Smooth scroll active sentence into view
  const scrollToSentence = (index: number) => {
    const el = sentenceRefs.current[index];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Speed Pacer Countdown: automatically pushes user to read quickly sentence by sentence
  useEffect(() => {
    if (!isPacerRunning || sentences.length === 0) {
      if (pacerTimerRef.current) clearInterval(pacerTimerRef.current);
      setSentenceProgress(0);
      return;
    }

    const currentSentence = sentences[activeSentenceIndex] || '';
    const wordCount = currentSentence.split(/\s+/).filter(Boolean).length;
    // Calculate expected reading duration for this specific sentence based on WPM
    // e.g. 15 words at 150 WPM = 6.0 seconds. Minimum 2.4s.
    const targetDurationMs = Math.max(2400, (wordCount / pacerSpeed) * 60 * 1000);

    pacerElapsedRef.current = 0;
    const intervalMs = 40;

    scrollToSentence(activeSentenceIndex);

    pacerTimerRef.current = setInterval(() => {
      pacerElapsedRef.current += intervalMs;
      const pct = Math.min(100, (pacerElapsedRef.current / targetDurationMs) * 100);
      setSentenceProgress(pct);

      if (pct >= 100) {
        clearInterval(pacerTimerRef.current);

        // Advance to next sentence from top to bottom
        if (activeSentenceIndex + 1 < sentences.length) {
          setActiveSentenceIndex(prev => prev + 1);
        } else {
          // Completed full story!
          setIsPacerRunning(false);
          setHasCompleted(true);
          setEstimatedWpm(pacerSpeed);
        }
      }
    }, intervalMs);

    return () => {
      if (pacerTimerRef.current) clearInterval(pacerTimerRef.current);
    };
  }, [isPacerRunning, activeSentenceIndex, pacerSpeed, sentences]);

  const toggleSpeedPacer = () => {
    if (isPacerRunning) {
      setIsPacerRunning(false);
      return;
    }

    // Stop competing speech synthesis
    window.speechSynthesis?.cancel();
    setIsPlayingAudio(false);
    setPlayingSentenceIndex(null);

    // If at the end, start from sentence 0
    if (activeSentenceIndex >= sentences.length - 1) {
      setActiveSentenceIndex(0);
    }
    setHasCompleted(false);
    setIsPacerRunning(true);
  };

  // Native Speaker audio playback with sentence tracking
  const playSequentialAudio = (startIndex: number) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    if (startIndex >= sentences.length) {
      setIsPlayingAudio(false);
      setPlayingSentenceIndex(null);
      return;
    }

    setActiveSentenceIndex(startIndex);
    setPlayingSentenceIndex(startIndex);
    scrollToSentence(startIndex);

    const utterance = new SpeechSynthesisUtterance(sentences[startIndex]);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      if (startIndex + 1 < sentences.length) {
        playSequentialAudio(startIndex + 1);
      } else {
        setIsPlayingAudio(false);
        setPlayingSentenceIndex(null);
      }
    };

    utterance.onerror = () => {
      setIsPlayingAudio(false);
      setPlayingSentenceIndex(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  const toggleAudio = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      setPlayingSentenceIndex(null);
      return;
    }

    setIsPacerRunning(false);
    setIsPlayingAudio(true);
    playSequentialAudio(activeSentenceIndex < sentences.length ? activeSentenceIndex : 0);
  };

  // Play single individual sentence
  const playSingleSentence = (idx: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    setIsPlayingAudio(false);
    setIsPacerRunning(false);

    setActiveSentenceIndex(idx);
    setPlayingSentenceIndex(idx);

    const utterance = new SpeechSynthesisUtterance(sentences[idx]);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setPlayingSentenceIndex(null);
    utterance.onerror = () => setPlayingSentenceIndex(null);

    window.speechSynthesis.speak(utterance);
  };

  // Microphone read aloud
  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);

      const mins = Math.max(0.1, readingSeconds / 60);
      const wpm = Math.round(passage.wordCount / mins);
      setEstimatedWpm(wpm);
      setHasCompleted(true);
      return;
    }

    window.speechSynthesis?.cancel();
    setIsPlayingAudio(false);
    setPlayingSentenceIndex(null);
    setIsPacerRunning(false);

    setHasCompleted(false);
    setEstimatedWpm(null);
    setReadingSeconds(0);
    setIsRecording(true);

    recordTimerRef.current = setInterval(() => {
      setReadingSeconds(prev => prev + 1);
    }, 1000);
  };

  const resetPractice = () => {
    window.speechSynthesis?.cancel();
    setIsPlayingAudio(false);
    setPlayingSentenceIndex(null);
    setIsPacerRunning(false);
    if (pacerTimerRef.current) clearInterval(pacerTimerRef.current);
    if (recordTimerRef.current) clearInterval(recordTimerRef.current);

    setSentenceProgress(0);
    setReadingSeconds(0);
    setHasCompleted(false);
    setEstimatedWpm(null);
    setIsRecording(false);
  };

  const handleSelectSentence = (idx: number) => {
    setActiveSentenceIndex(idx);
    scrollToSentence(idx);
  };

  const handlePrevSentence = () => {
    if (activeSentenceIndex > 0) {
      setActiveSentenceIndex(prev => prev - 1);
      scrollToSentence(activeSentenceIndex - 1);
    }
  };

  const handleNextSentence = () => {
    if (activeSentenceIndex < sentences.length - 1) {
      setActiveSentenceIndex(prev => prev + 1);
      scrollToSentence(activeSentenceIndex + 1);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', maxWidth: '780px', margin: '0 auto', paddingBottom: 'var(--space-10)' }}>
      {/* 1. Clean Minimalist Title Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-primary)' }}>
              {passage.topic}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>•</span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
              {passage.wordCount} words
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>•</span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
              ~1 min read
            </span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(1.5rem, 3.2vw, 2.1rem)',
              fontWeight: 800,
              color: 'var(--color-text-primary)',
              lineHeight: 1.25,
              margin: 0,
              letterSpacing: '-0.02em'
            }}
          >
            {passage.title}
          </h1>
        </div>

        {/* Text size & Reset */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => setTextSize(prev => prev === 'normal' ? 'large' : 'normal')}
            className="tap-interactive"
            title="Adjust text size"
            style={{
              padding: '6px 10px',
              borderRadius: 'var(--radius-pill)',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              color: 'var(--color-text-primary)'
            }}
          >
            {textSize === 'normal' ? <ZoomIn size={13} /> : <ZoomOut size={13} />}
            <span>{textSize === 'normal' ? 'Larger' : 'Standard'}</span>
          </button>

          {(hasCompleted || isRecording || isPacerRunning || readingSeconds > 0) && (
            <button
              onClick={resetPractice}
              className="tap-interactive"
              title="Reset"
              style={{
                padding: '6px 10px',
                borderRadius: 'var(--radius-pill)',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                color: 'var(--color-text-secondary)'
              }}
            >
              <RotateCcw size={12} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Unified Sleek Floating Toolbar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          padding: '10px 16px',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-pill)',
          boxShadow: isPacerRunning
            ? '0 6px 20px rgba(16, 185, 129, 0.22)'
            : '0 4px 16px rgba(0, 0, 0, 0.05)',
          position: 'sticky',
          top: '12px',
          zIndex: 30,
          backdropFilter: 'blur(10px)'
        }}
      >
        {/* Left: Speed Pacer Launch Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={toggleSpeedPacer}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 18px',
              borderRadius: 'var(--radius-pill)',
              border: 'none',
              background: isPacerRunning
                ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              boxShadow: isPacerRunning
                ? '0 0 14px rgba(239, 68, 68, 0.4)'
                : '0 0 14px rgba(16, 185, 129, 0.35)',
              transition: 'all 0.2s ease'
            }}
          >
            {isPacerRunning ? <Pause size={15} /> : <Play size={15} fill="currentColor" />}
            <span>{isPacerRunning ? 'Pause' : 'Start Pacer'}</span>
          </button>

          {/* Speed Presets */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', background: 'var(--color-surface-sunken)', padding: '2px 4px', borderRadius: 'var(--radius-pill)', border: '1px solid var(--color-border-subtle)' }}>
            {([120, 150, 180, 210] as const).map(wpm => (
              <button
                key={wpm}
                onClick={() => setPacerSpeed(wpm)}
                style={{
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-pill)',
                  border: 'none',
                  background: pacerSpeed === wpm ? 'var(--color-primary)' : 'transparent',
                  color: pacerSpeed === wpm ? '#ffffff' : 'var(--color-text-secondary)',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {wpm}
              </button>
            ))}
            <span style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--color-text-muted)', paddingRight: '4px' }}>
              WPM
            </span>
          </div>
        </div>

        {/* Center: Sentence Stepper */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={handlePrevSentence}
            disabled={activeSentenceIndex === 0}
            aria-label="Previous sentence"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              border: 'none',
              background: 'var(--color-surface-sunken)',
              color: activeSentenceIndex === 0 ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
              cursor: activeSentenceIndex === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            <ChevronLeft size={14} />
          </button>

          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-primary)', minWidth: '85px', textAlign: 'center' }}>
            {activeSentenceIndex + 1} of {sentences.length}
          </span>

          <button
            onClick={handleNextSentence}
            disabled={activeSentenceIndex === sentences.length - 1}
            aria-label="Next sentence"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              border: 'none',
              background: 'var(--color-surface-sunken)',
              color: activeSentenceIndex === sentences.length - 1 ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
              cursor: activeSentenceIndex === sentences.length - 1 ? 'not-allowed' : 'pointer'
            }}
          >
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Right: Native Audio & Record Mic */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={toggleAudio}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--color-border)',
              background: isPlayingAudio ? 'var(--color-primary-subtle)' : 'var(--color-surface)',
              color: isPlayingAudio ? 'var(--color-primary)' : 'var(--color-text-primary)',
              fontWeight: 700,
              fontSize: '0.75rem',
              cursor: 'pointer'
            }}
          >
            {isPlayingAudio ? <Square size={13} fill="currentColor" /> : <Volume2 size={13} />}
            <span>{isPlayingAudio ? 'Stop' : 'Listen'}</span>
          </button>

          <button
            onClick={toggleRecording}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--color-border)',
              background: isRecording ? 'rgba(239, 68, 68, 0.15)' : 'var(--color-surface)',
              color: isRecording ? '#ef4444' : 'var(--color-text-primary)',
              fontWeight: 700,
              fontSize: '0.75rem',
              cursor: 'pointer'
            }}
          >
            {isRecording ? <MicOff size={13} /> : <Mic size={13} />}
            <span>{isRecording ? `${readingSeconds}s` : 'Mic'}</span>
          </button>
        </div>
      </div>

      {/* 3. The Continuous Reading Canvas (Editorial, Fluid, No Box-in-Box) */}
      <div
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)',
          padding: 'clamp(24px, 4vw, 36px)',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.04)',
          position: 'relative',
          overflow: 'visible'
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: textSize === 'large' ? '18px' : '14px',
            lineHeight: textSize === 'large' ? 1.85 : 1.75
          }}
        >
          {sentences.map((sentence, idx) => {
            const isActive = idx === activeSentenceIndex;
            const isPast = idx < activeSentenceIndex;
            const isSpeakingThis = idx === playingSentenceIndex;

            return (
              <div
                key={idx}
                ref={(el) => (sentenceRefs.current[idx] = el as any)}
                onClick={() => handleSelectSentence(idx)}
                style={{
                  position: 'relative',
                  padding: isActive ? '12px 16px' : '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  background: isActive
                    ? 'rgba(37, 99, 235, 0.08)'
                    : 'transparent',
                  borderLeft: isActive
                    ? '4px solid var(--color-primary)'
                    : isPast
                    ? '4px solid rgba(16, 185, 129, 0.4)'
                    : '4px solid transparent',
                  opacity: isActive ? 1.0 : isPast ? 0.6 : 0.78,
                  transition: 'all 0.24s ease',
                  cursor: 'pointer'
                }}
              >
                {/* Sentence text with inline controls */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                  <span
                    style={{
                      fontSize: textSize === 'large' ? '1.3rem' : '1.125rem',
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                      letterSpacing: '0.005em'
                    }}
                  >
                    {sentence}
                  </span>

                  {/* Audio button for active sentence */}
                  {isActive && (
                    <button
                      type="button"
                      onClick={(e) => playSingleSentence(idx, e)}
                      title="Hear this sentence"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        border: 'none',
                        background: isSpeakingThis ? 'var(--color-primary)' : 'var(--color-surface-sunken)',
                        color: isSpeakingThis ? '#ffffff' : 'var(--color-text-secondary)',
                        cursor: 'pointer',
                        flexShrink: 0,
                        marginTop: '2px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <Volume2 size={13} />
                    </button>
                  )}
                </div>

                {/* Animated Speed Pacer Countdown Line under the active sentence */}
                {isActive && isPacerRunning && (
                  <div
                    style={{
                      marginTop: '8px',
                      height: '3px',
                      background: 'var(--color-border-subtle)',
                      borderRadius: 'var(--radius-pill)',
                      overflow: 'hidden'
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${sentenceProgress}%`,
                        background: 'linear-gradient(90deg, #10b981 0%, #38bdf8 100%)',
                        transition: 'width 40ms linear'
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Completion Modal Card (Only shown when truly completed at the bottom) */}
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
                  You read all {sentences.length} sentences ({passage.wordCount} words) smoothly.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                  {estimatedWpm} WPM
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
                  Target: 130–160 WPM
                </div>
              </div>
              <Badge variant={estimatedWpm >= 120 && estimatedWpm <= 180 ? 'success' : 'focus'}>
                {estimatedWpm < 120 ? 'Deliberate & Clear' : estimatedWpm > 180 ? 'High-Velocity Speed' : 'Natural Rhythm'}
              </Badge>
            </div>
          </div>
        </Card>
      )}

      {/* 5. Key Vocabulary from Today's Story */}
      {passage.vocabularyWords && passage.vocabularyWords.length > 0 && (
        <section style={{ marginTop: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-3)' }}>
            <BookOpen size={17} color="var(--color-primary)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--color-text-primary)' }}>
              Key Vocabulary from Today's Story
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '12px' }}>
            {passage.vocabularyWords.map((vocab) => (
              <div
                key={vocab.id}
                style={{
                  padding: '12px 14px',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderLeft: '3px solid var(--color-primary)',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>
                    {vocab.word}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
                    {vocab.phoneticIpa}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-secondary)', lineHeight: 1.45 }}>
                  {vocab.definition}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
