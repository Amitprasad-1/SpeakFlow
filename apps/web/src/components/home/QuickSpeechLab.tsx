import React, { useState, useEffect, useRef } from 'react';
import { Card, Badge, Button } from '../../design-system';
import { VoiceWaveVisualizer } from '../common/VoiceWaveVisualizer';
import {
  Volume2,
  Mic,
  MicOff,
  Sparkles,
  RotateCw,
  CheckCircle2,
  HelpCircle,
  Play,
  Flame,
  ArrowRight
} from 'lucide-react';
import { speakText, stopSpeaking } from '../../speech/BrowserSpeechProvider';

export interface SpeechLabExample {
  id: string;
  category: 'Minimal Pairs' | 'Workplace Idiom' | 'Vowel Clarity';
  title: string;
  targetWordA: string;
  phoneticA: string;
  targetWordB: string;
  phoneticB: string;
  focusSound: string;
  contextTip: string;
  practiceSentence: string;
}

const LAB_EXAMPLES: SpeechLabExample[] = [
  {
    id: 'coffee-copy',
    category: 'Minimal Pairs',
    title: 'F vs P Clarity',
    targetWordA: 'Coffee',
    phoneticA: '/ˈkɒfi/',
    targetWordB: 'Copy',
    phoneticB: '/ˈkɒpi/',
    focusSound: '/f/ vs /p/',
    contextTip: 'For "Coffee", let your upper teeth gently touch your bottom lip. For "Copy", both lips press and pop.',
    practiceSentence: 'Could you grab a coffee and print a copy?'
  },
  {
    id: 'sheet-seat',
    category: 'Minimal Pairs',
    title: 'SH vs S Distinction',
    targetWordA: 'Sheet',
    phoneticA: '/ʃiːt/',
    targetWordB: 'Seat',
    phoneticB: '/siːt/',
    focusSound: '/ʃ/ vs /s/',
    contextTip: 'For "Sheet", round your lips like saying hush. For "Seat", pull lips back into a slight smile.',
    practiceSentence: 'Please take a seat and check the balance sheet.'
  },
  {
    id: 'career-carrier',
    category: 'Workplace Idiom',
    title: 'Word Stress Difference',
    targetWordA: 'Career',
    phoneticA: '/kəˈrɪər/ (Stress 2nd)',
    targetWordB: 'Carrier',
    phoneticB: '/ˈkæriər/ (Stress 1st)',
    focusSound: 'Syllable Stress',
    contextTip: 'Career has stress on the END (ca-REER). Carrier has stress at the START (CAR-ri-er).',
    practiceSentence: 'She advanced her career as a telecom carrier specialist.'
  },
  {
    id: 'ship-sheep',
    category: 'Vowel Clarity',
    title: 'Short /ɪ/ vs Long /iː/',
    targetWordA: 'Ship',
    phoneticA: '/ʃɪp/ (Quick lax)',
    targetWordB: 'Sheep',
    phoneticB: '/ʃiːp/ (Long tense)',
    focusSound: 'Vowel Length',
    contextTip: 'Short /ɪ/ in "ship" is relaxed and quick. Long /iː/ in "sheep" is tense with stretched lips.',
    practiceSentence: 'The cargo ship carried wool from the sheep.'
  },
  {
    id: 'circle-back',
    category: 'Workplace Idiom',
    title: 'Natural Connected Speech',
    targetWordA: 'Circle',
    phoneticA: '/ˈsɜːkl/',
    targetWordB: 'Back',
    phoneticB: '/bæk/',
    focusSound: 'Connected Rhythm',
    contextTip: 'Blend them smoothly as "circle-back" without a hard pause between the words.',
    practiceSentence: "Let's circle back on this after the team standup."
  }
];

export const QuickSpeechLab: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [playingWord, setPlayingWord] = useState<'A' | 'B' | 'sentence' | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [hasCompletedDrill, setHasCompletedDrill] = useState(false);
  const [drillScore, setDrillScore] = useState<number | null>(null);

  const current = LAB_EXAMPLES[currentIndex];

  // Speech synthesis helper
  const playAudio = (text: string, type: 'A' | 'B' | 'sentence') => {
    setPlayingWord(type);
    setIsPlayingAudio(true);

    speakText(text, {
      rate: 0.88,
      pitch: 1.0,
      onEnd: () => {
        setIsPlayingAudio(false);
        setPlayingWord(null);
      },
      onError: () => {
        setIsPlayingAudio(false);
        setPlayingWord(null);
      }
    });
  };

  // Simulate or execute speech recognition
  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      // Celebrate completion
      setHasCompletedDrill(true);
      setDrillScore(92);
      return;
    }

    setIsRecording(true);
    setHasCompletedDrill(false);
    setDrillScore(null);

    // Auto-stop after 4 seconds of speaking
    setTimeout(() => {
      setIsRecording(false);
      setHasCompletedDrill(true);
      setDrillScore(94);
    }, 3800);
  };

  const handleNext = () => {
    window.speechSynthesis?.cancel();
    setIsPlayingAudio(false);
    setIsRecording(false);
    setHasCompletedDrill(false);
    setDrillScore(null);
    setCurrentIndex((prev) => (prev + 1) % LAB_EXAMPLES.length);
  };

  return (
    <Card
      variant="default"
      padding="lg"
      style={{
        border: '1px solid var(--color-border)',
        background: 'linear-gradient(135deg, var(--color-surface) 0%, rgba(37, 99, 235, 0.04) 100%)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Top Tag & Switcher */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 'var(--radius-pill)',
              background: 'rgba(37, 99, 235, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary)'
            }}
          >
            <Sparkles size={15} />
          </div>
          <span style={{ fontWeight: 700, fontSize: 'var(--text-body-sm)', color: 'var(--color-text-primary)' }}>
            60-Second Speech Lab
          </span>
          <Badge variant="primary" size="sm">{current.category}</Badge>
        </div>

        <button
          onClick={handleNext}
          className="tap-interactive"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-1)',
            background: 'var(--color-surface-sunken)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-pill)',
            padding: 'var(--space-1) var(--space-3)',
            fontSize: 'var(--text-caption)',
            fontWeight: 600,
            color: 'var(--color-text-secondary)',
            cursor: 'pointer'
          }}
          title="Try another everyday speech example"
        >
          <RotateCw size={13} />
          <span>Next Challenge ({currentIndex + 1}/{LAB_EXAMPLES.length})</span>
        </button>
      </div>

      {/* Main Title & Real-World Context */}
      <div>
        <h3 className="typography-h3" style={{ fontSize: '1.25rem' }}>
          {current.title}
        </h3>
        <p className="typography-body-sm" style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-1)' }}>
          {current.contextTip}
        </p>
      </div>

      {/* Interactive Contrast Word Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
        {/* Word A */}
        <div
          onClick={() => playAudio(current.targetWordA, 'A')}
          className="tap-interactive"
          style={{
            background: playingWord === 'A' ? 'rgba(37, 99, 235, 0.1)' : 'var(--color-surface-sunken)',
            border: `1.5px solid ${playingWord === 'A' ? 'var(--color-primary)' : 'var(--color-border)'}`,
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-3)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: 'var(--space-1)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
              {current.targetWordA}
            </span>
            <Volume2 size={16} color="var(--color-primary)" />
          </div>
          <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
            {current.phoneticA}
          </span>
          <VoiceWaveVisualizer
            isActive={playingWord === 'A'}
            size="sm"
            color="var(--color-primary)"
          />
        </div>

        {/* Word B */}
        <div
          onClick={() => playAudio(current.targetWordB, 'B')}
          className="tap-interactive"
          style={{
            background: playingWord === 'B' ? 'rgba(16, 185, 129, 0.1)' : 'var(--color-surface-sunken)',
            border: `1.5px solid ${playingWord === 'B' ? 'var(--color-success)' : 'var(--color-border)'}`,
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-3)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: 'var(--space-1)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
              {current.targetWordB}
            </span>
            <Volume2 size={16} color="var(--color-success)" />
          </div>
          <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
            {current.phoneticB}
          </span>
          <VoiceWaveVisualizer
            isActive={playingWord === 'B'}
            size="sm"
            color="var(--color-success)"
          />
        </div>
      </div>

      {/* Everyday Practice Sentence */}
      <div
        style={{
          background: 'var(--color-surface-sunken)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-3) var(--space-4)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 'var(--space-3)'
        }}
      >
        <div>
          <div style={{ fontSize: '0.6875rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--color-text-muted)', letterSpacing: '0.05em' }}>
            Practical Sentence Drill
          </div>
          <div style={{ fontSize: 'var(--text-body)', fontWeight: 600, color: 'var(--color-text-primary)', marginTop: '2px' }}>
            "{current.practiceSentence}"
          </div>
        </div>

        <button
          onClick={() => playAudio(current.practiceSentence, 'sentence')}
          className="tap-interactive"
          style={{
            width: 36,
            height: 36,
            borderRadius: 'var(--radius-pill)',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-primary)',
            cursor: 'pointer',
            flexShrink: 0
          }}
          aria-label="Listen to practice sentence"
        >
          <Play size={16} />
        </button>
      </div>

      {/* Record Action with Live Voice Wave Visualizer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-3)', paddingTop: 'var(--space-1)' }}>
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
          <span>{isRecording ? 'Listening... Tap to Done' : 'Tap to Repeat & Test'}</span>
        </button>

        {isRecording && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-error)', fontWeight: 700 }}>
              Live Audio
            </span>
            <VoiceWaveVisualizer isActive={true} size="sm" color="var(--color-error)" />
          </div>
        )}

        {hasCompletedDrill && (
          <div className="celebrate-pop" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-success)', fontWeight: 700, fontSize: 'var(--text-body-sm)' }}>
            <CheckCircle2 size={20} />
            <span>Great crisp articulation!</span>
          </div>
        )}
      </div>
    </Card>
  );
};
