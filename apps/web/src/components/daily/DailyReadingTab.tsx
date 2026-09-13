import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Card, Badge, Button } from '../../design-system';
import { VoiceWaveVisualizer } from '../common/VoiceWaveVisualizer';
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
  Sparkles,
  BookOpen,
  ZoomIn,
  ZoomOut,
  Clock,
  CheckCircle2,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Gauge,
  ListFilter,
  Check
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

  // State management
  const [activeSentenceIndex, setActiveSentenceIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'guided' | 'full'>('guided');
  const [isPacerRunning, setIsPacerRunning] = useState<boolean>(false);
  const [pacerSpeed, setPacerSpeed] = useState<120 | 150 | 180 | 210>(150);
  const [sentenceProgress, setSentenceProgress] = useState<number>(0);
  const [playingSentenceIndex, setPlayingSentenceIndex] = useState<number | null>(null);

  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<0.8 | 1.0>(1.0);
  const [textSize, setTextSize] = useState<'normal' | 'large'>('normal');

  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [readingSeconds, setReadingSeconds] = useState<number>(0);
  const [hasCompleted, setHasCompleted] = useState<boolean>(false);
  const [estimatedWpm, setEstimatedWpm] = useState<number | null>(null);

  // Refs for timers and smooth scrolling
  const timerRef = useRef<any>(null);
  const pacerTimerRef = useRef<any>(null);
  const sentenceRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pacerElapsedRef = useRef<number>(0);

  // Reset audio & reading progress when day changes
  useEffect(() => {
    resetPractice();
    setActiveSentenceIndex(0);
  }, [currentDateString, passage.id]);

  // Clean up audio & timers on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
      if (timerRef.current) clearInterval(timerRef.current);
      if (pacerTimerRef.current) clearInterval(pacerTimerRef.current);
    };
  }, []);

  // Smooth auto-scroll to keep active sentence comfortably in view
  const scrollToActiveSentence = (index: number) => {
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
    // e.g. 15 words at 150 WPM = 6.0 seconds. Minimum 2.4s so short sentences are legible.
    const targetDurationMs = Math.max(2400, (wordCount / pacerSpeed) * 60 * 1000);

    pacerElapsedRef.current = 0;
    const intervalMs = 40;

    scrollToActiveSentence(activeSentenceIndex);

    pacerTimerRef.current = setInterval(() => {
      pacerElapsedRef.current += intervalMs;
      const pct = Math.min(100, (pacerElapsedRef.current / targetDurationMs) * 100);
      setSentenceProgress(pct);

      if (pct >= 100) {
        clearInterval(pacerTimerRef.current);

        // Move to the next sentence from top to bottom
        if (activeSentenceIndex + 1 < sentences.length) {
          setActiveSentenceIndex(prev => prev + 1);
        } else {
          // Finished entire passage!
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

    // If at the end, wrap around to beginning
    if (activeSentenceIndex >= sentences.length - 1) {
      setActiveSentenceIndex(0);
    }
    setHasCompleted(false);
    setIsPacerRunning(true);
  };

  // Native Speaker audio playback with sentence-by-sentence tracking
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
    scrollToActiveSentence(startIndex);

    const utterance = new SpeechSynthesisUtterance(sentences[startIndex]);
    utterance.rate = playbackSpeed;
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
    utterance.rate = playbackSpeed;
    utterance.pitch = 1.0;
    utterance.onend = () => setPlayingSentenceIndex(null);
    utterance.onerror = () => setPlayingSentenceIndex(null);

    window.speechSynthesis.speak(utterance);
  };

  // Recording timer
  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);

      const mins = Math.max(0.1, readingSeconds / 60);
      const wpm = Math.round(passage.wordCount / mins);
      setEstimatedWpm(wpm);
      setHasCompleted(true);
      return;
    }

    // Start reading session
    window.speechSynthesis?.cancel();
    setIsPlayingAudio(false);
    setPlayingSentenceIndex(null);

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
    setPlayingSentenceIndex(null);
    setIsPacerRunning(false);
    if (pacerTimerRef.current) clearInterval(pacerTimerRef.current);
    if (timerRef.current) clearInterval(timerRef.current);

    setSentenceProgress(0);
    setReadingSeconds(0);
    setHasCompleted(false);
    setEstimatedWpm(null);
    setIsRecording(false);
  };

  const handleSelectSentence = (idx: number) => {
    setActiveSentenceIndex(idx);
    scrollToActiveSentence(idx);
  };

  const handlePrevSentence = () => {
    if (activeSentenceIndex > 0) {
      setActiveSentenceIndex(prev => prev - 1);
      scrollToActiveSentence(activeSentenceIndex - 1);
    }
  };

  const handleNextSentence = () => {
    if (activeSentenceIndex < sentences.length - 1) {
      setActiveSentenceIndex(prev => prev + 1);
      scrollToActiveSentence(activeSentenceIndex + 1);
    }
  };

  const totalProgressPercent = Math.round(((activeSentenceIndex + 1) / sentences.length) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', maxWidth: '860px', margin: '0 auto', paddingBottom: 'var(--space-8)' }}>
      {/* 1. Clean Editorial Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--color-primary)',
                background: 'var(--color-primary-subtle)',
                padding: '3px 10px',
                borderRadius: 'var(--radius-pill)',
                border: '1px solid var(--color-primary-light)'
              }}
            >
              Daily 200-Word Reading
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>•</span>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
              {passage.topic}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>•</span>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
              {passage.wordCount} words (~1 min)
            </span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(1.5rem, 3.2vw, 2rem)',
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

        {/* Top-Right Secondary Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* View Mode Toggle */}
          <div style={{ display: 'flex', background: 'var(--color-surface-sunken)', padding: '2px', borderRadius: 'var(--radius-pill)', border: '1px solid var(--color-border)' }}>
            <button
              onClick={() => setViewMode('guided')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                borderRadius: 'var(--radius-pill)',
                border: 'none',
                background: viewMode === 'guided' ? 'var(--color-primary)' : 'transparent',
                color: viewMode === 'guided' ? '#fff' : 'var(--color-text-secondary)',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Gauge size={13} />
              <span>Pacer</span>
            </button>
            <button
              onClick={() => setViewMode('full')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                borderRadius: 'var(--radius-pill)',
                border: 'none',
                background: viewMode === 'full' ? 'var(--color-primary)' : 'transparent',
                color: viewMode === 'full' ? '#fff' : 'var(--color-text-secondary)',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <ListFilter size={13} />
              <span>Full Story</span>
            </button>
          </div>

          {/* Text Size */}
          <button
            onClick={() => setTextSize(prev => prev === 'normal' ? 'large' : 'normal')}
            className="tap-interactive"
            title="Toggle Text Size"
            style={{
              padding: '5px 9px',
              borderRadius: 'var(--radius-md)',
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
            {textSize === 'normal' ? <ZoomIn size={14} /> : <ZoomOut size={14} />}
            <span>{textSize === 'normal' ? 'A+' : 'A-'}</span>
          </button>

          {(hasCompleted || isRecording || isPacerRunning || readingSeconds > 0) && (
            <button
              onClick={resetPractice}
              className="tap-interactive"
              title="Reset session"
              style={{
                padding: '5px 9px',
                borderRadius: 'var(--radius-md)',
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
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Sleek Floating Interaction Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--space-3)',
          padding: 'var(--space-3) var(--space-4)',
          background: 'var(--color-surface)',
          border: isPacerRunning ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: isPacerRunning
            ? '0 6px 24px rgba(16, 185, 129, 0.2)'
            : '0 4px 16px rgba(0, 0, 0, 0.05)',
          transition: 'all 0.25s ease'
        }}
      >
        {/* Left: Start Speed Reading Button + Speed Presets */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <button
            onClick={toggleSpeedPacer}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 22px',
              borderRadius: 'var(--radius-pill)',
              border: 'none',
              background: isPacerRunning
                ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.875rem',
              cursor: 'pointer',
              boxShadow: isPacerRunning
                ? '0 0 16px rgba(239, 68, 68, 0.4)'
                : '0 0 16px rgba(16, 185, 129, 0.35)',
              transition: 'all 0.2s ease'
            }}
          >
            {isPacerRunning ? <Pause size={17} /> : <Play size={17} fill="currentColor" />}
            <span>{isPacerRunning ? 'Pause Pacer' : 'Start Speed Reading'}</span>
          </button>

          {/* Speed Selector (WPM) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', background: 'var(--color-surface-sunken)', padding: '2px 4px', borderRadius: 'var(--radius-pill)', border: '1px solid var(--color-border)' }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: 800, padding: '0 4px', color: 'var(--color-text-muted)' }}>
              SPEED
            </span>
            {([120, 150, 180, 210] as const).map((wpm) => (
              <button
                key={wpm}
                onClick={() => setPacerSpeed(wpm)}
                style={{
                  padding: '3px 9px',
                  borderRadius: 'var(--radius-pill)',
                  border: 'none',
                  background: pacerSpeed === wpm ? 'var(--color-primary)' : 'transparent',
                  color: pacerSpeed === wpm ? '#fff' : 'var(--color-text-secondary)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {wpm}
              </button>
            ))}
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-text-muted)', paddingRight: '4px' }}>
              WPM
            </span>
          </div>
        </div>

        {/* Right: Audio Listen & Voice Recording */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          {/* Listen Native */}
          <button
            onClick={toggleAudio}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--color-border)',
              background: isPlayingAudio ? 'var(--color-primary-subtle)' : 'var(--color-surface)',
              color: isPlayingAudio ? 'var(--color-primary)' : 'var(--color-text-primary)',
              fontWeight: 700,
              fontSize: '0.8125rem',
              cursor: 'pointer'
            }}
          >
            {isPlayingAudio ? <Square size={14} fill="currentColor" /> : <Volume2 size={15} />}
            <span>{isPlayingAudio ? 'Stop' : 'Listen Native'}</span>
          </button>

          {/* Record Mic */}
          <button
            onClick={toggleRecording}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--color-border)',
              background: isRecording ? 'rgba(239, 68, 68, 0.15)' : 'var(--color-surface)',
              color: isRecording ? '#ef4444' : 'var(--color-text-primary)',
              fontWeight: 700,
              fontSize: '0.8125rem',
              cursor: 'pointer'
            }}
          >
            {isRecording ? <MicOff size={14} /> : <Mic size={15} />}
            <span>{isRecording ? `${readingSeconds}s` : 'Practice Mic'}</span>
          </button>
        </div>
      </div>

      {/* 3. Reading Progress Status Bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              Sentence {activeSentenceIndex + 1} of {sentences.length}
            </span>
            {isPacerRunning && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.6875rem',
                  fontWeight: 800,
                  color: '#10b981',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}
              >
                ● Pacing at {pacerSpeed} WPM
              </span>
            )}
          </div>

          {/* Previous / Next buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              onClick={handlePrevSentence}
              disabled={activeSentenceIndex === 0}
              aria-label="Previous sentence"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '2px',
                padding: '4px 10px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface)',
                color: activeSentenceIndex === 0 ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: activeSentenceIndex === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              <ChevronLeft size={14} />
              <span>Prev</span>
            </button>
            <button
              onClick={handleNextSentence}
              disabled={activeSentenceIndex === sentences.length - 1}
              aria-label="Next sentence"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '2px',
                padding: '4px 10px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface)',
                color: activeSentenceIndex === sentences.length - 1 ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: activeSentenceIndex === sentences.length - 1 ? 'not-allowed' : 'pointer'
              }}
            >
              <span>Next</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Global Progress Line */}
        <div style={{ height: '3px', background: 'var(--color-border-subtle)', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${totalProgressPercent}%`,
              background: 'var(--color-primary)',
              transition: 'width 0.25s ease'
            }}
          />
        </div>
      </div>

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
                  You read all {sentences.length} sentences ({passage.wordCount} words) at pacing speed!
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

      {/* 4. THE READING STAGE */}
      {viewMode === 'guided' ? (
        /* GUIDED TELEPROMPTER STREAM: Smooth flowing cards, zero clipping */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginTop: '4px' }}>
          {sentences.map((sentence, idx) => {
            const isActive = idx === activeSentenceIndex;
            const isPast = idx < activeSentenceIndex;
            const isSpeakingThis = idx === playingSentenceIndex;

            return (
              <div
                key={idx}
                ref={(el) => (sentenceRefs.current[idx] = el)}
                onClick={() => handleSelectSentence(idx)}
                style={{
                  position: 'relative',
                  padding: textSize === 'large' ? '22px 28px' : '18px 22px',
                  borderRadius: 'var(--radius-lg)',
                  border: isActive
                    ? '2px solid var(--color-primary)'
                    : '1px solid var(--color-border)',
                  background: isActive
                    ? 'var(--color-surface)'
                    : 'var(--color-surface)',
                  boxShadow: isActive
                    ? '0 8px 28px rgba(37, 99, 235, 0.18)'
                    : '0 1px 3px rgba(0, 0, 0, 0.04)',
                  opacity: isActive ? 1.0 : isPast ? 0.65 : 0.78,
                  transform: isActive ? 'scale(1.01)' : 'scale(1.0)',
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                  cursor: 'pointer',
                  minHeight: 'auto',
                  overflow: 'visible'
                }}
              >
                {/* Countdown Progress Bar under Active Sentence */}
                {isActive && isPacerRunning && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '3px',
                      background: 'linear-gradient(90deg, #10b981 0%, #38bdf8 100%)',
                      width: `${sentenceProgress}%`,
                      transition: 'width 40ms linear'
                    }}
                  />
                )}

                {/* Sentence Header Line */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        fontSize: '0.6875rem',
                        fontWeight: 800,
                        background: isActive
                          ? 'var(--color-primary)'
                          : isPast
                          ? 'var(--color-success)'
                          : 'var(--color-surface-sunken)',
                        color: isActive || isPast ? '#ffffff' : 'var(--color-text-secondary)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {isPast ? <Check size={11} strokeWidth={3} /> : idx + 1}
                    </span>

                    {isActive && (
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                          color: 'var(--color-primary)',
                          background: 'var(--color-primary-subtle)',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-sm)'
                        }}
                      >
                        {isPacerRunning ? 'Reading...' : isSpeakingThis ? 'Speaking...' : 'Current Focus'}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => playSingleSentence(idx, e)}
                    title="Listen to this sentence"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      border: 'none',
                      background: isSpeakingThis ? 'var(--color-primary)' : 'var(--color-surface-sunken)',
                      color: isSpeakingThis ? '#ffffff' : 'var(--color-text-secondary)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Volume2 size={14} />
                  </button>
                </div>

                {/* Sentence Text Content - Generous line-height, zero clipping */}
                <div
                  style={{
                    fontSize: textSize === 'large' ? '1.3rem' : '1.125rem',
                    lineHeight: 1.75,
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                    letterSpacing: '0.01em',
                    wordBreak: 'break-word'
                  }}
                >
                  {sentence}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* FULL STORY VIEW: Classic continuous typography with subtle sentence hover */
        <Card
          variant="default"
          padding="lg"
          style={{
            lineHeight: textSize === 'large' ? 2.0 : 1.85,
            fontSize: textSize === 'large' ? '1.25rem' : '1.125rem',
            color: 'var(--color-text-primary)',
            letterSpacing: '0.01em',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)'
          }}
        >
          <div style={{ display: 'inline' }}>
            {sentences.map((sentence, idx) => {
              const isActive = idx === activeSentenceIndex;
              return (
                <span
                  key={idx}
                  onClick={() => handleSelectSentence(idx)}
                  style={{
                    display: 'inline',
                    padding: '2px 4px',
                    borderRadius: '4px',
                    background: isActive ? 'var(--color-primary-subtle)' : 'transparent',
                    color: isActive ? 'var(--color-primary)' : 'inherit',
                    fontWeight: isActive ? 700 : 'inherit',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s ease',
                    marginRight: '6px'
                  }}
                  title="Click to select sentence"
                >
                  {sentence}
                </span>
              );
            })}
          </div>
        </Card>
      )}

      {/* 5. Key Vocabulary from Passage */}
      {passage.vocabularyWords && passage.vocabularyWords.length > 0 && (
        <section style={{ marginTop: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
            <BookOpen size={18} color="var(--color-primary)" />
            <h3 className="typography-h3">Key Vocabulary from Today's Story</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 'var(--space-3)' }}>
            {passage.vocabularyWords.map((vocab) => (
              <Card key={vocab.id} variant="default" padding="sm" style={{ borderLeft: '3px solid var(--color-primary)', background: 'var(--color-surface)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--color-text-primary)' }}>
                    {vocab.word}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
                    {vocab.phoneticIpa}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.45 }}>
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
