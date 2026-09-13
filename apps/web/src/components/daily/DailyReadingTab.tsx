import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Card, Badge } from '../../design-system';
import {
  ReadingPassage,
  READING_PASSAGES_CATALOG
} from '@speakflow/core';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  Mic,
  MicOff,
  BookOpen,
  ZoomIn,
  ZoomOut,
  CheckCircle2,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Video
} from 'lucide-react';
import { ReadingVideoRecorder } from './ReadingVideoRecorder';

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

  // Automated reading state
  const [activeSentenceIndex, setActiveSentenceIndex] = useState<number>(0);
  const [isAutomatedRunning, setIsAutomatedRunning] = useState<boolean>(false);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('speakflow_reading_voice_enabled') === 'true';
    }
    return false;
  });
  const [pacerSpeed, setPacerSpeed] = useState<120 | 150 | 180 | 210>(150);
  const [sentenceProgress, setSentenceProgress] = useState<number>(0);

  const [textSize, setTextSize] = useState<'normal' | 'large'>('normal');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isVideoRecorderOpen, setIsVideoRecorderOpen] = useState<boolean>(false);
  const [readingSeconds, setReadingSeconds] = useState<number>(0);
  const [hasCompleted, setHasCompleted] = useState<boolean>(false);
  const [estimatedWpm, setEstimatedWpm] = useState<number | null>(null);

  // Refs for timers and smooth scrolling
  const pacerTimerRef = useRef<any>(null);
  const recordTimerRef = useRef<any>(null);
  const sentenceRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pacerElapsedRef = useRef<number>(0);
  const isAutomatedRunningRef = useRef<boolean>(false);
  isAutomatedRunningRef.current = isAutomatedRunning;
  const voiceEnabledRef = useRef<boolean>(voiceEnabled);
  voiceEnabledRef.current = voiceEnabled;
  const activeSentenceIndexRef = useRef<number>(activeSentenceIndex);
  activeSentenceIndexRef.current = activeSentenceIndex;

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

  // Convert WPM speed to SpeechSynthesis rate
  const getSpeechRate = (wpm: number): number => {
    if (wpm <= 120) return 0.85;
    if (wpm <= 150) return 1.0;
    if (wpm <= 180) return 1.15;
    return 1.3;
  };

  // Speak sentence aloud with Web Speech API
  const speakSentenceAloud = (index: number) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    window.speechSynthesis.resume();

    const sentence = sentences[index];
    if (!sentence) return;

    const utterance = new SpeechSynthesisUtterance(sentence);
    utterance.rate = getSpeechRate(pacerSpeed);
    utterance.pitch = 1.0;

    utterance.onend = () => {
      // When sentence finishes speaking, advance if auto reading is active and voice is still ON
      if (isAutomatedRunningRef.current && voiceEnabledRef.current) {
        if (index + 1 < sentences.length) {
          playAutomatedSentence(index + 1);
        } else {
          setIsAutomatedRunning(false);
          isAutomatedRunningRef.current = false;
          setHasCompleted(true);
          setEstimatedWpm(pacerSpeed);
        }
      }
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis utterance error:', e);
      if (isAutomatedRunningRef.current && voiceEnabledRef.current) {
        if (index + 1 < sentences.length) {
          playAutomatedSentence(index + 1);
        }
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  // Core automated sentence playback
  const playAutomatedSentence = (index: number) => {
    if (index >= sentences.length) {
      // Completed full passage!
      setIsAutomatedRunning(false);
      isAutomatedRunningRef.current = false;
      setHasCompleted(true);
      setEstimatedWpm(pacerSpeed);
      window.speechSynthesis?.cancel();
      return;
    }

    setActiveSentenceIndex(index);
    activeSentenceIndexRef.current = index;
    scrollToSentence(index);
    setSentenceProgress(0);

    const currentSentence = sentences[index] || '';
    const wordCount = currentSentence.split(/\s+/).filter(Boolean).length;
    // Expected reading duration based on selected WPM
    const durationMs = Math.max(2200, (wordCount / pacerSpeed) * 60 * 1000);

    // 1. If voice audio is enabled, speak the sentence aloud
    if (voiceEnabledRef.current) {
      speakSentenceAloud(index);
    }

    // 2. Animate countdown progress line across the sentence
    if (pacerTimerRef.current) clearInterval(pacerTimerRef.current);
    pacerElapsedRef.current = 0;
    const intervalMs = 40;

    pacerTimerRef.current = setInterval(() => {
      pacerElapsedRef.current += intervalMs;
      const pct = Math.min(100, (pacerElapsedRef.current / durationMs) * 100);
      setSentenceProgress(pct);

      // If voice is muted, timer advances to the next sentence automatically
      if (!voiceEnabledRef.current && pct >= 100) {
        clearInterval(pacerTimerRef.current);
        if (isAutomatedRunningRef.current) {
          if (index + 1 < sentences.length) {
            playAutomatedSentence(index + 1);
          } else {
            setIsAutomatedRunning(false);
            isAutomatedRunningRef.current = false;
            setHasCompleted(true);
            setEstimatedWpm(pacerSpeed);
          }
        }
      }
    }, intervalMs);
  };

  // Handle Voice Toggle Button click (instant reactive connection)
  const handleToggleVoice = () => {
    const nextVoice = !voiceEnabled;
    setVoiceEnabled(nextVoice);
    voiceEnabledRef.current = nextVoice;

    if (typeof window !== 'undefined') {
      localStorage.setItem('speakflow_reading_voice_enabled', String(nextVoice));
    }

    if (nextVoice) {
      // User turned Voice ON! If auto-reading is running or ready, speak current sentence immediately
      speakSentenceAloud(activeSentenceIndexRef.current);
    } else {
      // User turned Voice OFF! Immediately silence speech synthesis
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }
  };

  // Toggle automated reading
  const toggleAutomatedReading = () => {
    if (isAutomatedRunning) {
      // Pause
      setIsAutomatedRunning(false);
      isAutomatedRunningRef.current = false;
      window.speechSynthesis?.cancel();
      if (pacerTimerRef.current) clearInterval(pacerTimerRef.current);
      return;
    }

    // Start
    setIsAutomatedRunning(true);
    isAutomatedRunningRef.current = true;
    setHasCompleted(false);

    const startIndex = activeSentenceIndex >= sentences.length - 1 ? 0 : activeSentenceIndex;
    playAutomatedSentence(startIndex);
  };

  // Manual jump to specific sentence
  const handleSelectSentence = (idx: number) => {
    setActiveSentenceIndex(idx);
    scrollToSentence(idx);
    setSentenceProgress(0);

    // If already running automatically, continue from selected sentence
    if (isAutomatedRunning) {
      playAutomatedSentence(idx);
    }
  };

  const handlePrevSentence = () => {
    if (activeSentenceIndex > 0) {
      const prev = activeSentenceIndex - 1;
      setActiveSentenceIndex(prev);
      scrollToSentence(prev);
      setSentenceProgress(0);
      if (isAutomatedRunning) playAutomatedSentence(prev);
    }
  };

  const handleNextSentence = () => {
    if (activeSentenceIndex < sentences.length - 1) {
      const next = activeSentenceIndex + 1;
      setActiveSentenceIndex(next);
      scrollToSentence(next);
      setSentenceProgress(0);
      if (isAutomatedRunning) playAutomatedSentence(next);
    }
  };

  // Microphone practice
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

    // Pause automated reading when mic practice starts
    setIsAutomatedRunning(false);
    window.speechSynthesis?.cancel();
    if (pacerTimerRef.current) clearInterval(pacerTimerRef.current);

    setHasCompleted(false);
    setEstimatedWpm(null);
    setReadingSeconds(0);
    setIsRecording(true);

    recordTimerRef.current = setInterval(() => {
      setReadingSeconds(prev => prev + 1);
    }, 1000);
  };

  const resetPractice = () => {
    setIsAutomatedRunning(false);
    window.speechSynthesis?.cancel();
    if (pacerTimerRef.current) clearInterval(pacerTimerRef.current);
    if (recordTimerRef.current) clearInterval(recordTimerRef.current);

    setSentenceProgress(0);
    setReadingSeconds(0);
    setHasCompleted(false);
    setEstimatedWpm(null);
    setIsRecording(false);
  };

  // Play single sentence audio on demand
  const playSingleAudio = (idx: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(sentences[idx]);
    utterance.rate = getSpeechRate(pacerSpeed);
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', maxWidth: '920px', margin: '0 auto', paddingBottom: 'var(--space-10)' }}>
      {/* 1. Header: Story Title & Reading Meta */}
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
              fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
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
              padding: '6px 12px',
              borderRadius: 'var(--radius-pill)',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              color: 'var(--color-text-primary)'
            }}
          >
            {textSize === 'normal' ? <ZoomIn size={14} /> : <ZoomOut size={14} />}
            <span>{textSize === 'normal' ? 'Larger Text' : 'Standard'}</span>
          </button>

          {(hasCompleted || isRecording || isAutomatedRunning || readingSeconds > 0) && (
            <button
              onClick={resetPractice}
              className="tap-interactive"
              title="Reset"
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-pill)',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
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

      {/* 2. Automated Action Toolbar */}
      <div
        className="reading-player-toolbar"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          padding: '10px 18px',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          boxShadow: isAutomatedRunning
            ? '0 6px 24px rgba(16, 185, 129, 0.25)'
            : '0 4px 16px rgba(0, 0, 0, 0.05)',
          position: 'sticky',
          top: '12px',
          zIndex: 30,
          backdropFilter: 'blur(12px)',
          transition: 'all 0.25s ease'
        }}
      >
        {/* Left / Row 1: Main Automated Read Button + Voice + Speed */}
        <div className="reading-player-row reading-player-row-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={toggleAutomatedReading}
            className="btn-shimmer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: 'var(--radius-pill)',
              border: 'none',
              background: isAutomatedRunning
                ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              boxShadow: isAutomatedRunning
                ? '0 0 16px rgba(239, 68, 68, 0.4)'
                : '0 0 16px rgba(16, 185, 129, 0.35)',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            }}
          >
            {isAutomatedRunning ? <Pause size={15} /> : <Play size={15} fill="currentColor" />}
            <span className="reading-btn-label-desktop">{isAutomatedRunning ? 'Pause Reading' : 'Start Auto Reading'}</span>
            <span className="reading-btn-label-mobile">{isAutomatedRunning ? 'Pause' : 'Auto Read'}</span>
          </button>

          {/* Voice Audio Toggle */}
          <button
            onClick={handleToggleVoice}
            title={voiceEnabled ? 'Voice audio ON (Click to turn OFF)' : 'Voice audio OFF (Click to turn ON)'}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '6px 10px',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--color-border)',
              background: voiceEnabled ? 'var(--color-primary-subtle)' : 'var(--color-surface)',
              color: voiceEnabled ? 'var(--color-primary)' : 'var(--color-text-muted)',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap'
            }}
          >
            {voiceEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
            <span>Voice {voiceEnabled ? 'ON' : 'OFF'}</span>
          </button>

          {/* Speed Presets */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', background: 'var(--color-surface-sunken)', padding: '2px 4px', borderRadius: 'var(--radius-pill)', border: '1px solid var(--color-border-subtle)' }}>
            {([120, 150, 180, 210] as const).map(wpm => (
              <button
                key={wpm}
                onClick={() => setPacerSpeed(wpm)}
                style={{
                  padding: '3px 7px',
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
            <span className="reading-btn-label-desktop" style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--color-text-muted)', paddingRight: '4px' }}>
              WPM
            </span>
          </div>
        </div>

        {/* Center/Right / Row 2: Sentence Stepper & Mic & Video */}
        <div className="reading-player-row reading-player-row-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Stepper */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
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

            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-primary)', minWidth: '65px', textAlign: 'center' }}>
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

          {/* Record Mic */}
          <button
            onClick={toggleRecording}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--color-border)',
              background: isRecording ? 'rgba(239, 68, 68, 0.15)' : 'var(--color-surface)',
              color: isRecording ? '#ef4444' : 'var(--color-text-primary)',
              fontWeight: 700,
              fontSize: '0.75rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {isRecording ? <MicOff size={14} /> : <Mic size={14} />}
            <span className="reading-btn-label-desktop">{isRecording ? `${readingSeconds}s` : 'Practice Mic'}</span>
            <span className="reading-btn-label-mobile">{isRecording ? `${readingSeconds}s` : 'Mic'}</span>
          </button>

          {/* Record Video with Camera & Voice */}
          <button
            onClick={() => setIsVideoRecorderOpen(prev => !prev)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-pill)',
              border: isVideoRecorderOpen ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
              background: isVideoRecorderOpen ? 'var(--color-primary-subtle)' : 'var(--color-surface)',
              color: isVideoRecorderOpen ? 'var(--color-primary)' : 'var(--color-text-primary)',
              fontWeight: 700,
              fontSize: '0.75rem',
              cursor: 'pointer',
              boxShadow: isVideoRecorderOpen ? '0 0 12px rgba(14, 165, 233, 0.25)' : 'none',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap'
            }}
            title="Record video & voice practice with webcam"
          >
            <Video size={14} color={isVideoRecorderOpen ? 'var(--color-primary)' : 'currentColor'} />
            <span className="reading-btn-label-desktop">{isVideoRecorderOpen ? 'Camera Live' : 'Record Video'}</span>
            <span className="reading-btn-label-mobile">{isVideoRecorderOpen ? 'Live' : 'Video'}</span>
          </button>
        </div>
      </div>

      {/* 3. The Continuous Reading Canvas: Automated Flow */}
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

            return (
              <div
                key={idx}
                ref={(el) => (sentenceRefs.current[idx] = el)}
                onClick={() => handleSelectSentence(idx)}
                style={{
                  position: 'relative',
                  padding: isActive ? '14px 18px' : '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  background: isActive
                    ? 'rgba(37, 99, 235, 0.09)'
                    : 'transparent',
                  borderLeft: isActive
                    ? '4px solid var(--color-primary)'
                    : isPast
                    ? '4px solid rgba(16, 185, 129, 0.45)'
                    : '4px solid transparent',
                  opacity: isActive ? 1.0 : isPast ? 0.65 : 0.82,
                  boxShadow: isActive ? '0 4px 16px rgba(37, 99, 235, 0.12)' : 'none',
                  transition: 'all 0.25s ease',
                  cursor: 'pointer'
                }}
              >
                {/* Sentence text with audio button */}
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
                      onClick={(e) => playSingleAudio(idx, e)}
                      title="Replay this sentence"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        border: 'none',
                        background: 'var(--color-surface-sunken)',
                        color: 'var(--color-primary)',
                        cursor: 'pointer',
                        flexShrink: 0,
                        marginTop: '2px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <Volume2 size={14} />
                    </button>
                  )}
                </div>

                {/* Animated Speed Pacer Countdown Line under the active sentence */}
                {isActive && isAutomatedRunning && (
                  <div
                    style={{
                      marginTop: '10px',
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

      {/* 4. Completion Modal Card (Only shown when truly completed) */}
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
                  You completed all {sentences.length} sentences ({passage.wordCount} words) smoothly!
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
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

      {/* Video & Voice Recording Mirror / Review Modal */}
      <ReadingVideoRecorder
        isOpen={isVideoRecorderOpen}
        onClose={() => setIsVideoRecorderOpen(false)}
        passageTitle={passage.title}
        totalWords={passage.wordCount}
        sentences={sentences}
        currentSentenceIndex={activeSentenceIndex}
        totalSentences={sentences.length}
        isAutoReading={isAutomatedRunning}
      />
    </div>
  );
};
