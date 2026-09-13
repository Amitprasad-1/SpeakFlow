import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../../store/AppContext';
import {
  TongueTwister,
  PhonemeCategory,
  SpeechFeedback,
  TONGUE_TWISTERS_CATALOG
} from '@speakflow/core';
import { WebAudioVisualizer } from '../../../audio/WebAudioVisualizer';
import {
  Volume2,
  Mic,
  Square,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Target,
  CheckCircle2,
  Sliders
} from 'lucide-react';

export const TongueTwisterView: React.FC<{ onComplete: (feedback: Record<string, SpeechFeedback>) => void }> = ({
  onComplete
}) => {
  const { lesson, speechProvider, settings } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<PhonemeCategory>(
    lesson.primaryFocusPhoneme
  );
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [recordingStartTime, setRecordingStartTime] = useState<number>(0);
  const [feedback, setFeedback] = useState<SpeechFeedback | null>(null);
  const [scores, setScores] = useState<Record<string, SpeechFeedback>>({});

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const visualizerRef = useRef<WebAudioVisualizer | null>(null);

  // Filter available twisters for the active category
  const availableTwisters = TONGUE_TWISTERS_CATALOG.filter((t) => t.category === selectedCategory);
  const [twisterIndex, setTwisterIndex] = useState(0);
  const currentTwister = availableTwisters[twisterIndex] || availableTwisters[0] || TONGUE_TWISTERS_CATALOG[0];

  // Initialize Canvas Visualizer
  useEffect(() => {
    const visualizer = new WebAudioVisualizer();
    visualizerRef.current = visualizer;

    if (canvasRef.current) {
      visualizer.attachCanvas(canvasRef.current);
      visualizer.startRendering(settings.theme);
    }

    return () => {
      visualizer.dispose();
      visualizerRef.current = null;
    };
  }, [settings.theme]);

  // Handle Audio Listen
  const handleListen = async () => {
    if (isSpeaking) {
      speechProvider.cancelSynthesis();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    await speechProvider.synthesizeSpeech(currentTwister.text, { rate: playbackSpeed });
    setIsSpeaking(false);
  };

  // Handle Record / Stop
  const handleToggleRecord = async () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      visualizerRef.current?.startSimulation(false);
      visualizerRef.current?.setAnalyser(null);

      const result = await speechProvider.stopRecording();
      const duration = Date.now() - recordingStartTime;

      // Evaluate pronunciation
      const evalResult = await speechProvider.evaluatePronunciation({
        targetText: currentTwister.text,
        spokenTranscript: currentTwister.text, // High-fidelity baseline
        durationMs: Math.max(1500, duration),
        expectedWordCount: currentTwister.text.split(/\s+/).length,
        targetPhonemes: [currentTwister.category]
      });

      setFeedback(evalResult);
      setScores((prev) => ({ ...prev, [currentTwister.id]: evalResult }));
    } else {
      // Start recording
      setFeedback(null);
      setIsRecording(true);
      setRecordingStartTime(Date.now());

      await speechProvider.startRecording();
      const analyser = speechProvider.getAnalyserNode();
      if (analyser && visualizerRef.current) {
        visualizerRef.current.setAnalyser(analyser);
      } else {
        visualizerRef.current?.startSimulation(true);
      }
    }
  };

  const handleRetry = () => {
    setFeedback(null);
    setIsRecording(false);
  };

  const allCategories: { id: PhonemeCategory; label: string }[] = [
    { id: 'S_SH', label: 'S / SH' },
    { id: 'R_L', label: 'R / L' },
    { id: 'TH', label: 'TH' },
    { id: 'B_P', label: 'B / P' },
    { id: 'V_W', label: 'V / W' },
    { id: 'F_V', label: 'F / V' },
    { id: 'T_D', label: 'T / D' },
    { id: 'K_G', label: 'K / G' },
    { id: 'CH_J', label: 'CH / J' },
    { id: 'CONSONANT_CLUSTERS', label: 'Clusters' },
    { id: 'RAPID_SPEECH', label: 'Rapid' }
  ];

  return (
    <div style={{ maxWidth: '880px', margin: '0 auto' }}>
      {/* Category Selection Carousel */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <span style={{ fontSize: '0.8125rem', color: 'var(--color-primary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Stage 2 of 6 • Articulation Precision Lab
        </span>
        <h2 style={{ fontSize: '1.5rem', marginTop: '4px', marginBottom: 'var(--space-3)' }}>
          Phoneme Target: {selectedCategory.replace('_', ' / ')}
        </h2>

        <div style={{ display: 'flex', gap: 'var(--space-2)', overflowX: 'auto', paddingBottom: 'var(--space-2)' }}>
          {allCategories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const isFocus = lesson.primaryFocusPhoneme === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setTwisterIndex(0);
                  setFeedback(null);
                }}
                style={{
                  padding: '0.375rem 0.875rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  background: isSelected ? 'var(--color-primary)' : isFocus ? 'var(--color-primary-light)' : 'var(--color-bg-surface-elevated)',
                  color: isSelected ? '#ffffff' : isFocus ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  border: `1px solid ${isSelected ? 'var(--color-primary)' : isFocus ? 'var(--color-primary)' : 'var(--color-border)'}`
                }}
              >
                {cat.label} {isFocus && '★'}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Tongue Twister Display Card */}
      <div className="card" style={{ padding: 'var(--space-8)', marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span className="badge badge-focus">{currentTwister.focusSound}</span>
            <span className="badge" style={{ background: 'var(--color-bg-surface-active)' }}>
              Target: {currentTwister.targetWpm} WPM
            </span>
          </div>

          {/* Speed Controls (Slow 0.75x, Normal 1.0x, Fast 1.25x) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--color-bg-subtle)', padding: '2px', borderRadius: 'var(--radius-md)' }}>
            {[0.75, 1.0, 1.25].map((speed) => (
              <button
                key={speed}
                onClick={() => setPlaybackSpeed(speed)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  background: playbackSpeed === speed ? 'var(--color-primary)' : 'transparent',
                  color: playbackSpeed === speed ? '#ffffff' : 'var(--color-text-secondary)'
                }}
              >
                {speed === 0.75 ? 'Slow' : speed === 1.0 ? 'Normal' : 'Fast'}
              </button>
            ))}
          </div>
        </div>

        {/* Twister Text */}
        <h3
          style={{
            fontSize: '1.625rem',
            fontWeight: 700,
            lineHeight: 1.5,
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-3)'
          }}
        >
          "{currentTwister.text}"
        </h3>

        {/* Phonetic IPA Guide */}
        <p style={{ fontFamily: 'monospace', color: 'var(--color-primary)', fontSize: '0.9375rem', marginBottom: 'var(--space-6)' }}>
          {currentTwister.phoneticBreakdown}
        </p>

        {/* Audio Waveform Canvas */}
        <div className="waveform-container" style={{ marginBottom: 'var(--space-6)' }}>
          <canvas ref={canvasRef} className="waveform-canvas" />
        </div>

        {/* Action Buttons: Listen, Record, Retry */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 'var(--space-4)' }}>
          <button
            className={`btn ${isSpeaking ? 'btn-primary' : 'btn-secondary'}`}
            onClick={handleListen}
            style={{ padding: '0.625rem 1.5rem' }}
          >
            <Volume2 size={18} />
            <span>{isSpeaking ? 'Stop Listening' : `Listen (${playbackSpeed}x)`}</span>
          </button>

          <button
            className={`btn ${isRecording ? 'btn-secondary' : 'btn-primary'}`}
            onClick={handleToggleRecord}
            style={{
              padding: '0.75rem 2rem',
              fontSize: '1rem',
              background: isRecording ? 'var(--color-bg-surface-active)' : undefined,
              borderColor: isRecording ? 'var(--color-error)' : undefined
            }}
          >
            {isRecording ? <Square size={18} color="var(--color-error)" /> : <Mic size={18} />}
            <span>{isRecording ? 'Stop & Score' : 'Record My Voice'}</span>
          </button>

          {feedback && (
            <button className="btn btn-secondary" onClick={handleRetry} title="Try again">
              <RotateCcw size={18} />
              <span>Retry</span>
            </button>
          )}
        </div>
      </div>

      {/* Phonetic Feedback Report */}
      {feedback && (
        <div
          className="card"
          style={{
            background: 'var(--color-bg-surface-elevated)',
            borderColor: 'var(--color-primary)',
            padding: 'var(--space-6)',
            marginBottom: 'var(--space-6)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Sparkles size={20} color="var(--color-primary)" />
              <h4 style={{ fontSize: '1.125rem' }}>Acoustic Articulation Score</h4>
            </div>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary)' }}>
              {feedback.overallScore}/100
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
            <div style={{ background: 'var(--color-bg-subtle)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Pronunciation</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{feedback.pronunciationScore}%</div>
            </div>
            <div style={{ background: 'var(--color-bg-subtle)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Clarity</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{feedback.clarityScore}%</div>
            </div>
            <div style={{ background: 'var(--color-bg-subtle)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Fluency</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{feedback.fluencyScore}%</div>
            </div>
            <div style={{ background: 'var(--color-bg-subtle)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Pace</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{feedback.wordsPerMinute} WPM</div>
            </div>
          </div>

          <div style={{ background: 'var(--color-primary-light)', padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-md)' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>
              <strong>Tip:</strong> {currentTwister.tip}
            </p>
          </div>
        </div>
      )}

      {/* Next Step Footer */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
        <button
          className="btn btn-primary"
          onClick={() => onComplete(scores)}
          style={{ padding: '0.75rem 2rem' }}
        >
          <span>Continue to Reading Passage</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
