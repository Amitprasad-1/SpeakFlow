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
  Video,
  Zap,
  Layers,
  Eye
} from 'lucide-react';
import { FocusFlowStage, FocusFlowItem } from './FocusFlowStage';
import { getDailyFluencyDrill, FluencyDrillPassage, FLUENCY_DRILLS_CATALOG } from '../../data/fluencyDrillsCatalog';
import { ReadingVideoRecorder } from './ReadingVideoRecorder';
import { speakText, stopSpeaking, BrowserSpeechProvider } from '../../speech/BrowserSpeechProvider';

export type ReadingTrack = 'fluency' | 'executive' | 'conversational';
export type ReadingPresentationMode = 'focus-flow' | 'full-passage';
export type PacerSpeedOption = 90 | 130 | 170 | 210 | 250;

export interface DailyReadingTabProps {
  currentDateString?: string;
}

export const DailyReadingTab: React.FC<DailyReadingTabProps> = ({
  currentDateString
}) => {
  // Reading Track Selection: Defaults to High-Energy Fluency Drills
  const [activeTrack, setActiveTrack] = useState<ReadingTrack>('fluency');

  // Presentation Mode: Focus Flow Mode (teleprompter reel stage) vs Full Passage
  const [presentationMode, setPresentationMode] = useState<ReadingPresentationMode>('focus-flow');

  // Selected Drill ID (Defaults to daily rotation, user can click any viral drill)
  const [selectedDrillId, setSelectedDrillId] = useState<string | null>(null);

  // 1. Daily Fluency Drill Passage (Selectable drill or daily rotation)
  const fluencyPassage: FluencyDrillPassage = useMemo(() => {
    return getDailyFluencyDrill(currentDateString, selectedDrillId || undefined);
  }, [currentDateString, selectedDrillId]);

  // 2. Curated Standard Passages (Executive Leadership and Conversational tracks)
  const executivePassage: ReadingPassage = useMemo(() => {
    let dayNum = new Date().getDate();
    if (currentDateString) {
      const parts = currentDateString.split('-');
      if (parts.length === 3) dayNum = parseInt(parts[2], 10) || dayNum;
    }
    const filtered = READING_PASSAGES_CATALOG.filter(
      p => p.topic === 'Communication' || p.topic === 'Professional life' || p.topic === 'Psychology'
    );
    const pool = filtered.length > 0 ? filtered : READING_PASSAGES_CATALOG;
    const safeDay = Math.abs(dayNum);
    return pool[safeDay % pool.length] || pool[0];
  }, [currentDateString]);

  const conversationalPassage: ReadingPassage = useMemo(() => {
    let dayNum = new Date().getDate();
    if (currentDateString) {
      const parts = currentDateString.split('-');
      if (parts.length === 3) dayNum = parseInt(parts[2], 10) || dayNum;
    }
    const filtered = READING_PASSAGES_CATALOG.filter(
      p => p.topic === 'Daily life' || p.topic === 'Interesting facts' || p.topic === 'Nature'
    );
    const pool = filtered.length > 0 ? filtered : READING_PASSAGES_CATALOG;
    const safeDay = Math.abs(dayNum);
    return pool[safeDay % pool.length] || pool[0];
  }, [currentDateString]);

  // Active Passage Metadata based on track
  const currentMetadata = useMemo(() => {
    if (activeTrack === 'fluency') {
      return {
        id: fluencyPassage.id,
        title: fluencyPassage.title,
        topic: fluencyPassage.category,
        wordCount: fluencyPassage.totalWords,
        targetPhonemes: fluencyPassage.targetPhonemes,
        readTime: '< 1 min drill'
      };
    } else if (activeTrack === 'executive') {
      return {
        id: executivePassage.id,
        title: executivePassage.title,
        topic: executivePassage.topic,
        wordCount: executivePassage.wordCount,
        targetPhonemes: executivePassage.targetPhonemes,
        readTime: '~1 min read'
      };
    } else {
      return {
        id: conversationalPassage.id,
        title: conversationalPassage.title,
        topic: conversationalPassage.topic,
        wordCount: conversationalPassage.wordCount,
        targetPhonemes: conversationalPassage.targetPhonemes,
        readTime: '~1 min read'
      };
    }
  }, [activeTrack, fluencyPassage, executivePassage, conversationalPassage]);

  // Build clean individual sentences with gradual level progression
  const { sentences, flowItems, vocabularyList } = useMemo(() => {
    if (activeTrack === 'fluency') {
      const sList = fluencyPassage.sentences.map(s => s.text);
      const fItems: FocusFlowItem[] = fluencyPassage.sentences.map(s => ({
        text: s.text,
        levelNumber: s.levelNumber,
        levelLabel: s.levelLabel,
        levelTone: s.levelTone,
        focusTip: s.focusTip,
        ipaHint: s.ipaHint
      }));
      const vList = fluencyPassage.keyVocabulary.map((v, i) => ({
        id: `vocab_fl_${i}`,
        word: v.word,
        phoneticIpa: v.ipa,
        definition: v.definition
      }));
      return { sentences: sList, flowItems: fItems, vocabularyList: vList };
    }

    // Standard passage tracks
    const rawPassage = activeTrack === 'executive' ? executivePassage : conversationalPassage;
    const matches = rawPassage.passageText.match(/[^.!?]+[.!?]+(?:\s+|$)|[^.!?]+$/g);
    const sList = matches ? matches.map(s => s.trim()).filter(Boolean) : [rawPassage.passageText];

    // Gradually calculate difficulty steps for standard passage sentences
    const totalSentences = sList.length;
    const fItems: FocusFlowItem[] = sList.map((text, idx) => {
      const ratio = (idx + 1) / totalSentences;
      if (ratio <= 0.28) {
        return {
          text,
          levelNumber: 1,
          levelLabel: `🟢 Step 1 · Warmup Rhythm (${idx + 1}/${totalSentences})`,
          levelTone: 'warmup',
          focusTip: 'Open your jaw comfortably and establish a relaxed breathing pace.'
        };
      } else if (ratio <= 0.62) {
        return {
          text,
          levelNumber: 2,
          levelLabel: `🔵 Step 2 · Rhythmic Flow (${idx + 1}/${totalSentences})`,
          levelTone: 'flow',
          focusTip: 'Observe commas for deliberate pauses and connect words naturally.'
        };
      } else if (ratio <= 0.88) {
        return {
          text,
          levelNumber: 3,
          levelLabel: `🟡 Step 3 · Cadence Acceleration (${idx + 1}/${totalSentences})`,
          levelTone: 'agility',
          focusTip: 'Emphasize operative nouns and maintain steady diaphragmatic breath support.'
        };
      } else {
        return {
          text,
          levelNumber: 4,
          levelLabel: `🔥 Step 4 · Articulation Climax (${idx + 1}/${totalSentences})`,
          levelTone: 'climax',
          focusTip: 'Deliver with high confidence and crisp terminal consonants.'
        };
      }
    });

    const vList = rawPassage.vocabularyWords || [];
    return { sentences: sList, flowItems: fItems, vocabularyList: vList };
  }, [activeTrack, fluencyPassage, executivePassage, conversationalPassage]);

  // Automated reading & navigation state
  const [activeSentenceIndex, setActiveSentenceIndex] = useState<number>(0);
  const [isAutomatedRunning, setIsAutomatedRunning] = useState<boolean>(false);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('speakflow_reading_voice_enabled') === 'true';
    }
    return false;
  });
  const [pacerSpeed, setPacerSpeed] = useState<PacerSpeedOption>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('speakflow_reading_pacer_speed');
      if (saved && ['90', '120', '130', '150', '170', '180', '210', '250'].includes(saved)) {
        const num = Number(saved);
        if (num === 120) return 130;
        if (num === 150) return 170;
        if (num === 180) return 170;
        return num as PacerSpeedOption;
      }
    }
    return 130;
  });
  const [sentenceProgress, setSentenceProgress] = useState<number>(0);
  const [isBufferHolding, setIsBufferHolding] = useState<boolean>(false);

  const [textSize, setTextSize] = useState<'normal' | 'large'>('normal');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [liveSpokenTranscript, setLiveSpokenTranscript] = useState<string>('');
  const [spokenWordsCount, setSpokenWordsCount] = useState<number>(0);
  const [isVideoRecorderOpen, setIsVideoRecorderOpen] = useState<boolean>(false);
  const [isCameraRecording, setIsCameraRecording] = useState<boolean>(false);
  const [recordingTrigger, setRecordingTrigger] = useState<number>(0);
  const [readingSeconds, setReadingSeconds] = useState<number>(0);
  const [hasCompleted, setHasCompleted] = useState<boolean>(false);
  const [estimatedWpm, setEstimatedWpm] = useState<number | null>(null);

  const speechProvider = useMemo(() => new BrowserSpeechProvider(), []);

  // Refs for timers & synchronized state
  const pacerTimerRef = useRef<any>(null);
  const recordTimerRef = useRef<any>(null);
  const bufferTimerRef = useRef<any>(null);
  const sentenceRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pacerElapsedRef = useRef<number>(0);
  const isAutomatedRunningRef = useRef<boolean>(false);
  isAutomatedRunningRef.current = isAutomatedRunning;
  const voiceEnabledRef = useRef<boolean>(voiceEnabled);
  voiceEnabledRef.current = voiceEnabled;
  const activeSentenceIndexRef = useRef<number>(activeSentenceIndex);
  activeSentenceIndexRef.current = activeSentenceIndex;
  const pacerSpeedRef = useRef<PacerSpeedOption>(pacerSpeed);
  pacerSpeedRef.current = pacerSpeed;
  const playAutomatedSentenceRef = useRef<(index: number) => void>(() => {});

  // Reset when day, passage, or track changes
  useEffect(() => {
    resetPractice();
    setActiveSentenceIndex(0);
  }, [currentDateString, currentMetadata.id, activeTrack]);

  // Clean up timers & speech on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
      if (pacerTimerRef.current) clearInterval(pacerTimerRef.current);
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
      speechProvider.dispose();
    };
  }, [speechProvider]);

  // Smooth scroll active sentence into view (in full passage view)
  const scrollToSentence = (index: number) => {
    if (presentationMode === 'full-passage') {
      const el = sentenceRefs.current[index];
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  // Convert WPM speed to SpeechSynthesis rate
  const getSpeechRate = (wpm: number): number => {
    if (wpm <= 90) return 0.8;
    if (wpm <= 130) return 0.95;
    if (wpm <= 170) return 1.15;
    if (wpm <= 210) return 1.35;
    return 1.5;
  };

  // Speak sentence aloud with Web Speech API
  const speakSentenceAloud = (index: number) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    window.speechSynthesis.resume();

    const sentence = sentences[index];
    if (!sentence) return;

    const utterance = new SpeechSynthesisUtterance(sentence);
    utterance.rate = getSpeechRate(pacerSpeedRef.current);
    utterance.pitch = 1.0;

    utterance.onend = () => {
      if (isAutomatedRunningRef.current && voiceEnabledRef.current) {
        setIsBufferHolding(true);
        if (bufferTimerRef.current) clearTimeout(bufferTimerRef.current);
        bufferTimerRef.current = setTimeout(() => {
          setIsBufferHolding(false);
          if (isAutomatedRunningRef.current) {
            if (index + 1 < sentences.length) {
              playAutomatedSentenceRef.current(index + 1);
            } else {
              setIsAutomatedRunning(false);
              isAutomatedRunningRef.current = false;
              setHasCompleted(true);
              setEstimatedWpm(pacerSpeedRef.current);
            }
          }
        }, 1100);
      }
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis utterance error:', e);
      if (isAutomatedRunningRef.current && voiceEnabledRef.current) {
        if (index + 1 < sentences.length) {
          playAutomatedSentenceRef.current(index + 1);
        }
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  // Calculate intelligent, syllable-aware duration so hard tongue-twisters don't vanish too fast
  const calculateReadingDuration = (sentence: string, targetWpm: number): number => {
    if (!sentence) return 4000;
    const words = sentence.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) return 4000;

    let weightedWordCount = 0;
    for (const word of words) {
      const clean = word.toLowerCase().replace(/[^a-z]/g, '');
      const charCount = clean.length;
      const syllableCount = Math.max(1, (clean.match(/[aeiouy]{1,2}/g) || []).length);
      // Hard or multisyllabic tongue-twister words take significantly longer to articulate
      if (charCount > 8 || syllableCount >= 3) {
        weightedWordCount += 1.65;
      } else if (charCount > 5 || syllableCount >= 2) {
        weightedWordCount += 1.25;
      } else {
        weightedWordCount += 1.0;
      }
    }

    // Natural pauses at punctuation
    const commaCount = (sentence.match(/[,;:]/g) || []).length;
    const periodCount = (sentence.match(/[.!?]/g) || []).length;
    const punctuationPauseMs = commaCount * 320 + periodCount * 450;

    const baseDurationMs = (weightedWordCount / targetWpm) * 60 * 1000;
    const totalDurationMs = baseDurationMs + punctuationPauseMs;

    // Minimum floor so sentences NEVER vanish too fast
    const minFloor = Math.max(3400, (130 / targetWpm) * 4800);
    return Math.max(minFloor, totalDurationMs);
  };

  // Core automated sentence flow playback
  const playAutomatedSentence = (index: number) => {
    if (index >= sentences.length) {
      setIsAutomatedRunning(false);
      isAutomatedRunningRef.current = false;
      setIsBufferHolding(false);
      setHasCompleted(true);
      setEstimatedWpm(pacerSpeedRef.current);
      window.speechSynthesis?.cancel();
      return;
    }

    if (bufferTimerRef.current) {
      clearTimeout(bufferTimerRef.current);
      bufferTimerRef.current = null;
    }
    setIsBufferHolding(false);

    setActiveSentenceIndex(index);
    activeSentenceIndexRef.current = index;
    scrollToSentence(index);
    setSentenceProgress(0);

    const currentSentence = sentences[index] || '';
    const durationMs = calculateReadingDuration(currentSentence, pacerSpeedRef.current);

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

      // If voice is muted, timer advances to the next sentence automatically with a breathing buffer
      if (!voiceEnabledRef.current && pct >= 100) {
        clearInterval(pacerTimerRef.current);
        if (isAutomatedRunningRef.current) {
          // Graceful breathing hold (1.2s) so sentence doesn't vanish too fast
          setIsBufferHolding(true);
          bufferTimerRef.current = setTimeout(() => {
            setIsBufferHolding(false);
            if (isAutomatedRunningRef.current) {
              if (index + 1 < sentences.length) {
                playAutomatedSentenceRef.current(index + 1);
              } else {
                setIsAutomatedRunning(false);
                isAutomatedRunningRef.current = false;
                setHasCompleted(true);
                setEstimatedWpm(pacerSpeedRef.current);
              }
            }
          }, 1200);
        }
      }
    }, intervalMs);
  };
  playAutomatedSentenceRef.current = playAutomatedSentence;

  // Handle WPM Speed Preset change (immediate reactive update)
  const handlePacerSpeedChange = (wpm: PacerSpeedOption) => {
    setPacerSpeed(wpm);
    pacerSpeedRef.current = wpm;
    if (typeof window !== 'undefined') {
      localStorage.setItem('speakflow_reading_pacer_speed', String(wpm));
    }
    if (isAutomatedRunningRef.current) {
      playAutomatedSentence(activeSentenceIndexRef.current);
    }
  };

  // Handle Voice Toggle Button click
  const handleToggleVoice = () => {
    const nextVoice = !voiceEnabled;
    setVoiceEnabled(nextVoice);
    voiceEnabledRef.current = nextVoice;

    if (typeof window !== 'undefined') {
      localStorage.setItem('speakflow_reading_voice_enabled', String(nextVoice));
    }

    if (nextVoice) {
      speakSentenceAloud(activeSentenceIndexRef.current);
    } else {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }
  };

  // Start automated reading
  const startAutoReading = () => {
    if (isAutomatedRunning) return;
    setIsAutomatedRunning(true);
    isAutomatedRunningRef.current = true;
    setHasCompleted(false);

    const startIndex = activeSentenceIndex >= sentences.length - 1 ? 0 : activeSentenceIndex;
    playAutomatedSentence(startIndex);
  };

  // Stop / Pause automated reading
  const stopAutoReading = () => {
    setIsAutomatedRunning(false);
    isAutomatedRunningRef.current = false;
    window.speechSynthesis?.cancel();
    if (pacerTimerRef.current) clearInterval(pacerTimerRef.current);
  };

  // Restart flow from beginning (Sentence 1)
  const handleRestart = () => {
    window.speechSynthesis?.cancel();
    if (pacerTimerRef.current) clearInterval(pacerTimerRef.current);
    if (bufferTimerRef.current) clearTimeout(bufferTimerRef.current);
    setIsBufferHolding(false);
    setActiveSentenceIndex(0);
    activeSentenceIndexRef.current = 0;
    setSentenceProgress(0);
    setHasCompleted(false);
    scrollToSentence(0);

    if (isAutomatedRunning) {
      playAutomatedSentence(0);
    }
  };

  // Toggle automated reading
  const toggleAutomatedReading = () => {
    if (isAutomatedRunning) {
      stopAutoReading();
      return;
    }
    startAutoReading();

    // Trigger video recorder if camera mirror is open and ready
    if (isVideoRecorderOpen && !isCameraRecording) {
      setRecordingTrigger(prev => prev + 1);
    }
  };

  // Manual jump to specific sentence
  const handleSelectSentence = (idx: number) => {
    if (bufferTimerRef.current) clearTimeout(bufferTimerRef.current);
    setIsBufferHolding(false);
    setActiveSentenceIndex(idx);
    scrollToSentence(idx);
    setSentenceProgress(0);

    if (isAutomatedRunning) {
      playAutomatedSentence(idx);
    }
  };

  const handlePrevSentence = () => {
    if (activeSentenceIndex > 0) {
      if (bufferTimerRef.current) clearTimeout(bufferTimerRef.current);
      setIsBufferHolding(false);
      const prev = activeSentenceIndex - 1;
      setActiveSentenceIndex(prev);
      scrollToSentence(prev);
      setSentenceProgress(0);
      if (isAutomatedRunning) playAutomatedSentence(prev);
    }
  };

  const handleNextSentence = () => {
    if (activeSentenceIndex < sentences.length - 1) {
      if (bufferTimerRef.current) clearTimeout(bufferTimerRef.current);
      setIsBufferHolding(false);
      const next = activeSentenceIndex + 1;
      setActiveSentenceIndex(next);
      scrollToSentence(next);
      setSentenceProgress(0);
      if (isAutomatedRunning) playAutomatedSentence(next);
    }
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.code === 'Space') {
        e.preventDefault();
        toggleAutomatedReading();
      } else if (e.code === 'ArrowDown' || e.code === 'ArrowRight') {
        e.preventDefault();
        handleNextSentence();
      } else if (e.code === 'ArrowUp' || e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrevSentence();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleRestart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAutomatedRunning, activeSentenceIndex, sentences.length]);

  // Microphone practice with real speech recognition
  const stopMicPractice = () => {
    setIsRecording(false);
    speechProvider.stopRealtimeRecognition();
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }

    const durationSec = Math.max(1, readingSeconds);
    const mins = durationSec / 60;
    const words = spokenWordsCount > 5 ? spokenWordsCount : currentMetadata.wordCount;
    const wpm = Math.min(350, Math.max(50, Math.round(words / mins)));
    setEstimatedWpm(wpm);
    setHasCompleted(true);
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopMicPractice();
      return;
    }

    setIsAutomatedRunning(false);
    window.speechSynthesis?.cancel();
    if (pacerTimerRef.current) clearInterval(pacerTimerRef.current);
    if (bufferTimerRef.current) clearTimeout(bufferTimerRef.current);
    setIsBufferHolding(false);

    setHasCompleted(false);
    setEstimatedWpm(null);
    setReadingSeconds(0);
    setSpokenWordsCount(0);
    setLiveSpokenTranscript('');
    setIsRecording(true);

    recordTimerRef.current = setInterval(() => {
      setReadingSeconds(prev => prev + 1);
    }, 1000);

    speechProvider.startRealtimeRecognition({
      autoEndOnSilence: true,
      silenceThresholdMs: 2800,
      noSpeechTimeoutMs: 15000,
      onTranscriptUpdate: (text) => {
        setLiveSpokenTranscript(text);
        const count = text.trim().split(/\s+/).filter(Boolean).length;
        setSpokenWordsCount(count);
      },
      onSilenceDetected: () => stopMicPractice(),
      onNoSpeechTimeout: () => stopMicPractice(),
      onError: (err) => console.warn('Daily reading mic recognition notice:', err)
    });
  };

  const resetPractice = () => {
    setIsAutomatedRunning(false);
    window.speechSynthesis?.cancel();
    speechProvider.stopRealtimeRecognition();
    if (pacerTimerRef.current) clearInterval(pacerTimerRef.current);
    if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    if (bufferTimerRef.current) clearTimeout(bufferTimerRef.current);
    setIsBufferHolding(false);

    setSentenceProgress(0);
    setReadingSeconds(0);
    setSpokenWordsCount(0);
    setLiveSpokenTranscript('');
    setHasCompleted(false);
    setEstimatedWpm(null);
    setIsRecording(false);
  };

  const playSingleAudio = (idx: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (sentences[idx]) {
      speakText(sentences[idx], { rate: getSpeechRate(pacerSpeedRef.current) });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', maxWidth: '920px', margin: '0 auto', paddingBottom: 'var(--space-10)' }}>
      {/* 0. Track Switcher Pills: Fluency Drills vs Executive vs Conversational */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
          padding: '8px 12px',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setActiveTrack('fluency')}
            className={`focus-flow-track-pill ${activeTrack === 'fluency' ? 'is-active' : ''}`}
            title="Daily speed cadence & rapid tongue-twister challenge drills (like viral reels)"
          >
            <Zap size={14} color={activeTrack === 'fluency' ? 'var(--color-primary)' : 'currentColor'} />
            <span>⚡ Fluency Drills (Reels Style)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTrack('executive')}
            className={`focus-flow-track-pill ${activeTrack === 'executive' ? 'is-active' : ''}`}
            title="Executive leadership, persuasive rhetoric, and corporate boardroom speech"
          >
            <BookOpen size={14} color={activeTrack === 'executive' ? 'var(--color-primary)' : 'currentColor'} />
            <span>👔 Executive & Leadership</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTrack('conversational')}
            className={`focus-flow-track-pill ${activeTrack === 'conversational' ? 'is-active' : ''}`}
            title="Everyday conversational flow, natural storytelling, and daily life"
          >
            <Sparkles size={14} color={activeTrack === 'conversational' ? 'var(--color-primary)' : 'currentColor'} />
            <span>☕ Conversational Flow</span>
          </button>
        </div>

        {/* Presentation Mode Switch: Focus Flow Mode vs Full Passage */}
        <div className="focus-flow-mode-switch">
          <button
            type="button"
            onClick={() => setPresentationMode('focus-flow')}
            className={`focus-flow-mode-btn ${presentationMode === 'focus-flow' ? 'is-active' : ''}`}
            title="Focus Flow Mode: Sentences glide vertically into spotlight one by one"
          >
            <Eye size={13} />
            <span>Focus Flow</span>
          </button>
          <button
            type="button"
            onClick={() => setPresentationMode('full-passage')}
            className={`focus-flow-mode-btn ${presentationMode === 'full-passage' ? 'is-active' : ''}`}
            title="Full Passage View: View all sentences together in document format"
          >
            <Layers size={13} />
            <span>Full Passage</span>
          </button>
        </div>
      </div>

      {/* Viral Drills Selector (Available when Fluency track is active) */}
      {activeTrack === 'fluency' && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            padding: '12px 16px',
            background: 'linear-gradient(135deg, rgba(74, 4, 10, 0.65) 0%, rgba(20, 1, 3, 0.85) 100%)',
            border: '1.5px solid rgba(239, 68, 68, 0.35)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '1rem' }}>🔥</span>
              <span style={{ fontWeight: 800, fontSize: '0.8125rem', color: '#fca5a5', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Viral Speed Reading Reels & Challenges
              </span>
            </div>
            <span style={{ fontSize: '0.6875rem', color: 'rgba(255, 255, 255, 0.7)' }}>
              Click any drill to challenge your speed articulation
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              overflowX: 'auto',
              paddingBottom: '4px',
              scrollbarWidth: 'thin'
            }}
          >
            {FLUENCY_DRILLS_CATALOG.map((drill) => {
              const isSelected = fluencyPassage.id === drill.id;
              return (
                <button
                  key={drill.id}
                  type="button"
                  onClick={() => {
                    setSelectedDrillId(drill.id);
                    resetPractice();
                    setActiveSentenceIndex(0);
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-pill)',
                    border: isSelected
                      ? '1.5px solid #ef4444'
                      : '1px solid rgba(255, 255, 255, 0.15)',
                    background: isSelected
                      ? 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)'
                      : 'rgba(255, 255, 255, 0.08)',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    boxShadow: isSelected ? '0 0 14px rgba(239, 68, 68, 0.5)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>{drill.emoji}</span>
                  <span>{drill.title}</span>
                  {drill.difficulty === 'Extreme Viral' && (
                    <span style={{ fontSize: '0.625rem', background: 'rgba(0, 0, 0, 0.35)', padding: '2px 5px', borderRadius: '4px', color: '#fde047' }}>
                      HOT
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 1. Header: Story Title & Reading Meta */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-primary)' }}>
              {currentMetadata.topic}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>•</span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
              {currentMetadata.wordCount} words
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>•</span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
              {currentMetadata.readTime}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>•</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-success)', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: 'var(--radius-pill)' }}>
              Refreshed Daily
            </span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(1.4rem, 2.8vw, 2.1rem)',
              fontWeight: 800,
              color: 'var(--color-text-primary)',
              lineHeight: 1.25,
              margin: 0,
              letterSpacing: '-0.02em'
            }}
          >
            {currentMetadata.title}
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

      {/* 2. Clean Automated Control Panel Toolbar */}
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
        {/* Left Row: Start / Pause + Restart + Voice + Speed */}
        <div className="reading-player-row reading-player-row-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Main Start / Pause Button */}
          <button
            onClick={toggleAutomatedReading}
            className="btn-shimmer"
            title={
              isCameraRecording
                ? 'Camera recording is active! Click to pause reading'
                : isAutomatedRunning
                ? 'Click to pause reading flow (Spacebar)'
                : isVideoRecorderOpen
                ? 'Start auto-reading and video recording together'
                : 'Start auto reading with paced sentence flow (Spacebar)'
            }
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: 'var(--radius-pill)',
              border: 'none',
              background: isCameraRecording
                ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                : isAutomatedRunning
                ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              boxShadow: isCameraRecording
                ? '0 0 16px rgba(239, 68, 68, 0.45)'
                : isAutomatedRunning
                ? '0 0 16px rgba(245, 158, 11, 0.4)'
                : '0 0 16px rgba(16, 185, 129, 0.35)',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            }}
          >
            {isCameraRecording ? (
              <>
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#ffffff',
                    animation: 'pulse 1s infinite'
                  }}
                />
                <span className="reading-btn-label-desktop">
                  {isAutomatedRunning ? 'Pause (Rec Live)' : 'Resume (Rec Live)'}
                </span>
                <span className="reading-btn-label-mobile">REC</span>
              </>
            ) : isAutomatedRunning ? (
              <>
                <Pause size={15} />
                <span className="reading-btn-label-desktop">Pause Flow</span>
                <span className="reading-btn-label-mobile">Pause</span>
              </>
            ) : (
              <>
                <Play size={15} fill="currentColor" />
                <span className="reading-btn-label-desktop">Start Focus Flow</span>
                <span className="reading-btn-label-mobile">Start Flow</span>
              </>
            )}
          </button>

          {/* Dedicated Restart Button */}
          <button
            onClick={handleRestart}
            title="Restart from beginning (Press 'R')"
            aria-label="Restart flow"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '7px 11px',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
              color: 'var(--color-text-secondary)',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap'
            }}
          >
            <RotateCcw size={13} />
            <span className="reading-btn-label-desktop">Restart</span>
          </button>

          {/* Voice Audio Toggle */}
          <button
            onClick={handleToggleVoice}
            title={voiceEnabled ? 'Voice audio ON (Click to mute)' : 'Voice audio OFF (Click to listen along)'}
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
            {([90, 130, 170, 210, 250] as const).map(wpm => (
              <button
                key={wpm}
                onClick={() => handlePacerSpeedChange(wpm)}
                title={`Set reading pace to ${wpm} WPM (${wpm === 90 ? 'Practice' : wpm === 130 ? 'Natural' : wpm === 170 ? 'Fast' : wpm === 210 ? 'Reel Speed' : 'God Mode'})`}
                aria-label={`${wpm} words per minute`}
                style={{
                  padding: '3px 7px',
                  borderRadius: 'var(--radius-pill)',
                  border: 'none',
                  background: pacerSpeed === wpm
                    ? (activeTrack === 'fluency' ? '#ef4444' : 'var(--color-primary)')
                    : 'transparent',
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

        {/* Right Row: Next / Prev Sentence Stepper & Mic & Video */}
        <div className="reading-player-row reading-player-row-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Stepper (< Sentence X of Y >) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              onClick={handlePrevSentence}
              disabled={activeSentenceIndex === 0}
              aria-label="Previous sentence (Left Arrow or Swipe Down)"
              title="Previous sentence"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                border: 'none',
                background: 'var(--color-surface-sunken)',
                color: activeSentenceIndex === 0 ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
                cursor: activeSentenceIndex === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              <ChevronLeft size={15} />
            </button>

            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-primary)', minWidth: '65px', textAlign: 'center' }}>
              {activeSentenceIndex + 1} of {sentences.length}
            </span>

            <button
              onClick={handleNextSentence}
              disabled={activeSentenceIndex === sentences.length - 1}
              aria-label="Next sentence (Right Arrow or Swipe Up)"
              title="Next sentence"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                border: 'none',
                background: 'var(--color-surface-sunken)',
                color: activeSentenceIndex === sentences.length - 1 ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
                cursor: activeSentenceIndex === sentences.length - 1 ? 'not-allowed' : 'pointer'
              }}
            >
              <ChevronRight size={15} />
            </button>
          </div>

          {/* Practice Mic Button */}
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

          {/* Record Video Button */}
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
            title="Record video & speech with camera"
          >
            <Video size={14} color={isVideoRecorderOpen ? 'var(--color-primary)' : 'currentColor'} />
            <span className="reading-btn-label-desktop">{isVideoRecorderOpen ? 'Camera Live' : 'Record Video'}</span>
            <span className="reading-btn-label-mobile">{isVideoRecorderOpen ? 'Live' : 'Video'}</span>
          </button>
        </div>
      </div>

      {/* Active Camera Live Bar Notification */}
      {isVideoRecorderOpen && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            padding: '10px 16px',
            background: 'linear-gradient(90deg, rgba(14, 165, 233, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)',
            border: '1px solid rgba(14, 165, 233, 0.3)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 2px 8px rgba(14, 165, 233, 0.08)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
              <span style={{ position: 'absolute', width: '16px', height: '16px', borderRadius: '50%', border: '2px solid #10b981', opacity: 0.6, animation: 'pulse 1.5s infinite' }} />
            </div>
            <div>
              <span style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--color-text-primary)' }}>
                Webcam & Speech Live
              </span>
              <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                Floating camera mirror is active. Start reading to see your facial articulation and record your practice!
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsVideoRecorderOpen(false)}
            style={{
              padding: '4px 10px',
              fontSize: '0.75rem',
              fontWeight: 600,
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-pill)',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            Turn Camera Off
          </button>
        </div>
      )}

      {/* Live Voice Recording Pill */}
      {isRecording && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            padding: '10px 18px',
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(37, 99, 235, 0.12) 100%)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} />
              <span style={{ position: 'absolute', width: '20px', height: '20px', borderRadius: '50%', border: '2px solid #ef4444', opacity: 0.6, animation: 'pulse 1.2s infinite' }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 700, fontSize: '0.8125rem', color: '#ef4444' }}>
                  Microphone Recording Active ({readingSeconds}s)
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                  • {spokenWordsCount} words detected
                </span>
              </div>
              <p style={{ margin: '2px 0 0', fontSize: '0.8125rem', color: 'var(--color-text-primary)', fontWeight: 500 }}>
                {liveSpokenTranscript ? `"${liveSpokenTranscript}"` : 'Read aloud the active sentence... pauses automatically when you stop!'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={stopMicPractice}
            className="speakflow-btn btn-variant-danger"
            style={{ padding: '4px 12px', fontSize: '0.75rem', borderRadius: 'var(--radius-pill)', fontWeight: 700 }}
          >
            Finish Reading
          </button>
        </div>
      )}

      {/* 3. MAIN PRESENTATION AREA: Focus Flow Mode vs Full Passage View */}
      {presentationMode === 'focus-flow' ? (
        <FocusFlowStage
          items={flowItems}
          activeIndex={activeSentenceIndex}
          progressPercent={sentenceProgress}
          isAutoRunning={isAutomatedRunning}
          isBufferHolding={isBufferHolding}
          textSize={textSize}
          onSelectIndex={handleSelectSentence}
          onNext={handleNextSentence}
          onPrev={handlePrevSentence}
          onPlaySingleAudio={playSingleAudio}
          onTogglePlayPause={toggleAutomatedReading}
          isReelTheme={activeTrack === 'fluency'}
          viralHook={fluencyPassage.viralHook}
          drillEmoji={fluencyPassage.emoji}
          drillTitle={fluencyPassage.title}
          drillDifficulty={fluencyPassage.difficulty}
          reelLines={fluencyPassage.reelLines}
        />
      ) : (
        /* Full Passage Continuous Canvas */
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            padding: 'clamp(24px, 4vw, 36px)',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.04)',
            position: 'relative'
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
              const item = flowItems[idx];

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
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                    <div>
                      {item?.levelLabel && (
                        <span style={{ display: 'inline-block', fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '4px' }}>
                          {item.levelLabel}
                        </span>
                      )}
                      <div
                        style={{
                          fontSize: textSize === 'large' ? '1.3rem' : '1.125rem',
                          fontWeight: isActive ? 600 : 400,
                          color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                          letterSpacing: '0.005em'
                        }}
                      >
                        {sentence}
                      </div>
                    </div>

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
      )}

      {/* 4. Completion Modal Card */}
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
                  You completed all {sentences.length} sentences ({currentMetadata.wordCount} words) smoothly!
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

      {/* 5. Key Vocabulary from Today's Story / Drill */}
      {vocabularyList && vocabularyList.length > 0 && (
        <section style={{ marginTop: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-3)' }}>
            <BookOpen size={17} color="var(--color-primary)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--color-text-primary)' }}>
              Key Vocabulary & Articulation Words
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
            {vocabularyList.map((vocab: any) => (
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
        passageTitle={currentMetadata.title}
        totalWords={currentMetadata.wordCount}
        sentences={sentences}
        currentSentenceIndex={activeSentenceIndex}
        totalSentences={sentences.length}
        isAutoReading={isAutomatedRunning}
        onStartAutoReading={startAutoReading}
        onStopAutoReading={stopAutoReading}
        onRecordingStateChange={setIsCameraRecording}
        recordingTrigger={recordingTrigger}
      />
    </div>
  );
};
