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
  VolumeX
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

  // Parse passage into clean individual sentences for guided speed reading
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

  // Smooth auto-scroll to keep active sentence centered
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', maxWidth: '840px', margin: '0 auto' }}>
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
            Interactive guided sentence reading — moves sentence by sentence to train reading speed and pronunciation cadence.
          </p>
        </div>

        {/* View Mode & Text Size Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          {/* View Mode Switcher */}
          <div style={{ display: 'flex', background: 'var(--color-surface-sunken)', padding: '2px', borderRadius: 'var(--radius-pill)', border: '1px solid var(--color-border)' }}>
            <button
              onClick={() => setViewMode('guided')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: 'var(--space-1) var(--space-2-5)',
                borderRadius: 'var(--radius-pill)',
                border: 'none',
                background: viewMode === 'guided' ? 'var(--color-primary)' : 'transparent',
                color: viewMode === 'guided' ? '#fff' : 'var(--color-text-secondary)',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <Gauge size={13} />
              <span>Guided Pacer</span>
            </button>
            <button
              onClick={() => setViewMode('full')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: 'var(--space-1) var(--space-2-5)',
                borderRadius: 'var(--radius-pill)',
                border: 'none',
                background: viewMode === 'full' ? 'var(--color-primary)' : 'transparent',
                color: viewMode === 'full' ? '#fff' : 'var(--color-text-secondary)',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <ListFilter size={13} />
              <span>Full Story</span>
            </button>
          </div>

          <button
            onClick={() => setTextSize(prev => prev === 'normal' ? 'large' : 'normal')}
            className="tap-interactive"
            title="Toggle Text Size"
            style={{
              padding: 'var(--space-1-5) var(--space-2-5)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: 'var(--text-caption)',
              fontWeight: 600,
              cursor: 'pointer',
              color: 'var(--color-text-primary)'
            }}
          >
            {textSize === 'normal' ? <ZoomIn size={15} /> : <ZoomOut size={15} />}
            <span>{textSize === 'normal' ? 'A+' : 'A-'}</span>
          </button>

          {(hasCompleted || isRecording || isPacerRunning || readingSeconds > 0) && (
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
                fontSize: 'var(--text-caption)',
                fontWeight: 600,
                cursor: 'pointer',
                color: 'var(--color-text-secondary)'
              }}
            >
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Interactive Control Bar */}
      <Card
        variant="elevated"
        padding="md"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--space-4)',
          background: 'linear-gradient(135deg, var(--color-surface) 0%, rgba(37, 99, 235, 0.06) 100%)',
          border: isPacerRunning ? '1px solid var(--color-primary)' : '1px solid var(--color-border)'
        }}
      >
        {/* Speed Pacer Launcher & Speed Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <button
            onClick={toggleSpeedPacer}
            className={`speakflow-btn ${isPacerRunning ? 'btn-variant-danger' : 'btn-variant-primary'} cta-breathing`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: 'var(--space-2-5) var(--space-5)',
              borderRadius: 'var(--radius-pill)',
              fontWeight: 800,
              cursor: 'pointer',
              fontSize: 'var(--text-body-sm)',
              boxShadow: isPacerRunning ? '0 0 15px rgba(239, 68, 68, 0.3)' : '0 0 15px rgba(37, 99, 235, 0.3)'
            }}
          >
            {isPacerRunning ? <Pause size={18} /> : <Play size={18} fill="currentColor" />}
            <span>{isPacerRunning ? 'Pause Pacer' : 'Start Speed Reading'}</span>
          </button>

          {/* Speed Selector (WPM) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--color-surface-sunken)', padding: '2px 4px', borderRadius: 'var(--radius-pill)', border: '1px solid var(--color-border)' }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, padding: '0 6px', color: 'var(--color-text-muted)' }}>
              SPEED:
            </span>
            {([120, 150, 180, 210] as const).map((wpm) => (
              <button
                key={wpm}
                onClick={() => setPacerSpeed(wpm)}
                style={{
                  padding: '2px 8px',
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
                {wpm} WPM
              </button>
            ))}
          </div>
        </div>

        {/* Secondary: Listen Audio & Read Aloud Mic */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          {/* Listen Native Speaker */}
          <button
            onClick={toggleAudio}
            className="speakflow-btn btn-variant-secondary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: 'var(--space-2) var(--space-3)',
              borderRadius: 'var(--radius-pill)',
              fontWeight: 700,
              fontSize: 'var(--text-caption)',
              cursor: 'pointer'
            }}
          >
            {isPlayingAudio ? <Square size={14} fill="currentColor" /> : <Volume2 size={15} />}
            <span>{isPlayingAudio ? 'Stop Audio' : 'Listen Native'}</span>
          </button>

          {/* Tap & Record Mic */}
          <button
            onClick={toggleRecording}
            className={`speakflow-btn ${isRecording ? 'btn-variant-danger' : 'btn-variant-secondary'}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: 'var(--space-2) var(--space-3)',
              borderRadius: 'var(--radius-pill)',
              fontWeight: 700,
              fontSize: 'var(--text-caption)',
              cursor: 'pointer'
            }}
          >
            {isRecording ? <MicOff size={14} /> : <Mic size={15} />}
            <span>{isRecording ? `${readingSeconds}s (Finish)` : 'Record Mic'}</span>
          </button>
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

      {/* VIEW MODE 1: Guided Speed-Pacer (Interactive sentence-by-sentence moving highlighter) */}
      {viewMode === 'guided' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {/* Top navigation mini-bar for sentences */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 var(--space-1)' }}>
            <span style={{ fontSize: 'var(--text-caption)', fontWeight: 700, color: 'var(--color-text-secondary)' }}>
              Sentence {activeSentenceIndex + 1} of {sentences.length}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <button
                onClick={handlePrevSentence}
                disabled={activeSentenceIndex === 0}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-surface)',
                  color: activeSentenceIndex === 0 ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: activeSentenceIndex === 0 ? 'not-allowed' : 'pointer'
                }}
              >
                <ChevronLeft size={14} />
                <span>Prev</span>
              </button>
              <button
                onClick={handleNextSentence}
                disabled={activeSentenceIndex === sentences.length - 1}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-surface)',
                  color: activeSentenceIndex === sentences.length - 1 ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: activeSentenceIndex === sentences.length - 1 ? 'not-allowed' : 'pointer'
                }}
              >
                <span>Next</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Vertical Sentence Stack with Active Highlight */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-3)',
              maxHeight: '620px',
              overflowY: 'auto',
              paddingRight: '6px',
              scrollBehavior: 'smooth'
            }}
          >
            {sentences.map((sentence, idx) => {
              const isActive = idx === activeSentenceIndex;
              const isSpeakingThis = idx === playingSentenceIndex;

              return (
                <div
                  key={idx}
                  ref={(el) => (sentenceRefs.current[idx] = el)}
                  onClick={() => handleSelectSentence(idx)}
                  className="tap-interactive"
                  style={{
                    position: 'relative',
                    padding: textSize === 'large' ? 'var(--space-4) var(--space-5)' : 'var(--space-3-5) var(--space-4)',
                    borderRadius: 'var(--radius-lg)',
                    border: isActive
                      ? '2px solid var(--color-primary)'
                      : '1px solid var(--color-border)',
                    background: isActive
                      ? 'linear-gradient(135deg, var(--color-surface) 0%, rgba(37, 99, 235, 0.08) 100%)'
                      : 'var(--color-surface)',
                    boxShadow: isActive
                      ? '0 6px 20px rgba(37, 99, 235, 0.18)'
                      : 'none',
                    opacity: isActive ? 1.0 : 0.42,
                    transform: isActive ? 'scale(1.015)' : 'scale(1.0)',
                    transition: 'all 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
                    cursor: 'pointer',
                    overflow: 'hidden'
                  }}
                  title={isActive ? 'Active sentence' : 'Click to jump to this sentence'}
                >
                  {/* Countdown Progress Bar for Active Sentence */}
                  {isActive && isPacerRunning && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        height: '4px',
                        width: `${sentenceProgress}%`,
                        background: 'linear-gradient(90deg, var(--color-primary) 0%, #38bdf8 100%)',
                        transition: 'width 40ms linear'
                      }}
                    />
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          fontSize: '0.6875rem',
                          fontWeight: 800,
                          background: isActive ? 'var(--color-primary)' : 'var(--color-surface-sunken)',
                          color: isActive ? '#fff' : 'var(--color-text-muted)'
                        }}
                      >
                        {idx + 1}
                      </span>
                      {isActive && (
                        <span
                          style={{
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                            color: 'var(--color-primary)'
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
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        border: 'none',
                        background: isSpeakingThis ? 'var(--color-primary)' : 'var(--color-surface-sunken)',
                        color: isSpeakingThis ? '#fff' : 'var(--color-text-secondary)',
                        cursor: 'pointer'
                      }}
                    >
                      <Volume2 size={13} />
                    </button>
                  </div>

                  {/* Sentence Text */}
                  <div
                    style={{
                      fontSize: textSize === 'large' ? '1.25rem' : '1.0625rem',
                      lineHeight: 1.7,
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                      letterSpacing: '0.01em'
                    }}
                  >
                    {sentence}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW MODE 2: Full Continuous Paragraph */}
      {viewMode === 'full' && (
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
      )}

      {/* Key Vocabulary from Today's Story */}
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
