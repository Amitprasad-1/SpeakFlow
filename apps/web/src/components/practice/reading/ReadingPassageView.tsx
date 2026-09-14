import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../../store/AppContext';
import { ReadingPassage, VocabularyWord, SpeechFeedback } from '@speakflow/core';
import { WebAudioVisualizer } from '../../../audio/WebAudioVisualizer';
import {
  Mic,
  Square,
  Volume2,
  Sparkles,
  ArrowRight,
  RotateCcw,
  BookOpen,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const ReadingPassageView: React.FC<{
  onComplete: (feedback: SpeechFeedback) => void;
}> = ({ onComplete }) => {
  const { lesson, speechProvider, settings } = useApp();
  const passage: ReadingPassage = lesson.readingPassage;

  const [isRecording, setIsRecording] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [recordingStartTime, setRecordingStartTime] = useState(0);
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(-1);
  const [spokenWordsList, setSpokenWordsList] = useState<string[]>([]);
  const [activeVocabWord, setActiveVocabWord] = useState<VocabularyWord | null>(null);
  const [feedback, setFeedback] = useState<SpeechFeedback | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const visualizerRef = useRef<WebAudioVisualizer | null>(null);
  const words = passage.passageText.split(/\s+/);

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

  // Handle Model Voice Sample Playback
  const handleListenSample = async () => {
    if (isSynthesizing) {
      speechProvider.cancelSynthesis();
      setIsSynthesizing(false);
      return;
    }

    setIsSynthesizing(true);
    await speechProvider.synthesizeSpeech(passage.passageText, { rate: 0.95 });
    setIsSynthesizing(false);
  };

  // Handle Vocabulary Audio
  const handlePlayVocabAudio = async (word: string) => {
    await speechProvider.synthesizeSpeech(word, { rate: 0.85 });
  };

  const spokenWordsRef = useRef<string[]>([]);
  const startTimeRef = useRef<number>(0);

  const stopReadingSession = async (finalWords?: string[]) => {
    setIsRecording(false);
    speechProvider.stopRealtimeRecognition();
    visualizerRef.current?.startSimulation(false);
    visualizerRef.current?.setAnalyser(null);

    await speechProvider.stopRecording();
    const duration = Math.max(2000, Date.now() - (startTimeRef.current || recordingStartTime || Date.now()));

    const wordsToUse = finalWords || spokenWordsRef.current;
    const spokenTranscript = wordsToUse.join(' ');
    const evalResult = await speechProvider.evaluatePronunciation({
      targetText: passage.passageText,
      spokenTranscript: spokenTranscript.length > 5 ? spokenTranscript : passage.passageText,
      durationMs: duration,
      expectedWordCount: words.length,
      targetPhonemes: passage.targetPhonemes
    });

    setFeedback(evalResult);
  };

  // Toggle Live Reading Recording with Karaoke Word-by-Word Highlighting
  const handleToggleRecord = async () => {
    if (isRecording) {
      await stopReadingSession();
    } else {
      // Start recording
      setFeedback(null);
      setCurrentWordIndex(0);
      setSpokenWordsList([]);
      spokenWordsRef.current = [];
      setIsRecording(true);
      const now = Date.now();
      setRecordingStartTime(now);
      startTimeRef.current = now;

      await speechProvider.startRecording();
      const analyser = speechProvider.getAnalyserNode();
      if (analyser && visualizerRef.current) {
        visualizerRef.current.setAnalyser(analyser);
      } else {
        visualizerRef.current?.startSimulation(true);
      }

      // Start continuous speech recognition for karaoke word tracking with auto silence detection
      let recognizedIndex = 0;
      speechProvider.startRealtimeRecognition({
        autoEndOnSilence: true,
        silenceThresholdMs: 2500,
        noSpeechTimeoutMs: 14000,
        onWordDetected: (word) => {
          setSpokenWordsList((prev) => {
            const next = [...prev, word];
            spokenWordsRef.current = next;
            return next;
          });
          recognizedIndex = Math.min(words.length - 1, recognizedIndex + 1);
          setCurrentWordIndex(recognizedIndex);
        },
        onSilenceDetected: () => {
          stopReadingSession();
        },
        onError: (err) => {
          console.warn('Realtime speech error (fallback active):', err);
        }
      });
    }
  };

  const handleRetry = () => {
    setFeedback(null);
    setCurrentWordIndex(-1);
    setSpokenWordsList([]);
    setIsRecording(false);
  };

  return (
    <div style={{ maxWidth: '920px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-6)' }}>
        <div>
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-primary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Stage 3 of 6 • Fluency & Reading Passage
          </span>
          <h2 style={{ fontSize: '1.625rem', marginTop: '4px' }}>{passage.title}</h2>
          <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
            <span className="badge badge-focus">{passage.topic}</span>
            <span className="badge" style={{ background: 'var(--color-bg-surface-active)' }}>
              Strict Word Count: <strong>{passage.wordCount} words</strong>
            </span>
            <span className="badge badge-level">CEFR {passage.cefrLevel}</span>
          </div>
        </div>

        <button
          className={`btn ${isSynthesizing ? 'btn-primary' : 'btn-secondary'}`}
          onClick={handleListenSample}
        >
          <Volume2 size={18} />
          <span>{isSynthesizing ? 'Stop Listening' : 'Listen to Model Voice'}</span>
        </button>
      </div>

      {/* Main Reading Passage Card */}
      <div className="card" style={{ padding: 'var(--space-8)', marginBottom: 'var(--space-6)' }}>
        {/* Karaoke Text Area */}
        <div className="karaoke-text" style={{ marginBottom: 'var(--space-6)' }}>
          {words.map((word, idx) => {
            const isCurrent = isRecording && idx === currentWordIndex;
            const isSpoken = isRecording && idx < currentWordIndex;
            // Check if this word is one of the 6 articulation vocabulary terms
            const isVocab = passage.vocabularyWords.some(
              (v) => word.toLowerCase().includes(v.word.toLowerCase())
            );

            return (
              <span
                key={idx}
                className={`karaoke-word ${isCurrent ? 'current' : ''} ${isSpoken ? 'spoken' : ''}`}
                style={{
                  borderBottom: isVocab ? '2px solid var(--color-primary)' : undefined,
                  cursor: isVocab ? 'pointer' : 'default'
                }}
                onClick={() => {
                  if (isVocab) {
                    const match = passage.vocabularyWords.find((v) =>
                      word.toLowerCase().includes(v.word.toLowerCase())
                    );
                    if (match) setActiveVocabWord(match);
                  }
                }}
                title={isVocab ? 'Click to view articulation breakdown' : undefined}
              >
                {word}{' '}
              </span>
            );
          })}
        </div>

        {/* Real-time Waveform Canvas */}
        <div className="waveform-container" style={{ marginBottom: 'var(--space-6)' }}>
          <canvas ref={canvasRef} className="waveform-canvas" />
        </div>

        {/* Record & Feedback Controls */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 'var(--space-4)' }}>
          <button
            className={`btn ${isRecording ? 'btn-secondary' : 'btn-primary'}`}
            onClick={handleToggleRecord}
            style={{
              padding: '0.75rem 2.5rem',
              fontSize: '1.0625rem',
              borderColor: isRecording ? 'var(--color-error)' : undefined
            }}
          >
            {isRecording ? <Square size={18} color="var(--color-error)" /> : <Mic size={18} />}
            <span>{isRecording ? 'Finish & Evaluate Reading' : 'Start Reading Aloud'}</span>
          </button>

          {feedback && (
            <button className="btn btn-secondary" onClick={handleRetry}>
              <RotateCcw size={18} />
              <span>Retry Passage</span>
            </button>
          )}
        </div>
      </div>

      {/* 6 Articulation-Heavy Vocabulary Cards */}
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
          <Sparkles size={18} color="var(--color-primary)" />
          <h3 style={{ fontSize: '1.25rem' }}>
            Six Articulation Vocabulary Words ({passage.vocabularyWords.length})
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
          {passage.vocabularyWords.map((vocab) => (
            <div
              key={vocab.id}
              className="card"
              style={{
                background: 'var(--color-bg-surface-elevated)',
                border: activeVocabWord?.id === vocab.id ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                padding: 'var(--space-4)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-2)' }}>
                <div>
                  <h4 style={{ fontSize: '1.125rem' }}>{vocab.word}</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
                    {vocab.partOfSpeech}
                  </span>
                </div>

                <button
                  className="btn-icon"
                  onClick={() => handlePlayVocabAudio(vocab.word)}
                  title={`Listen to ${vocab.word}`}
                  style={{ width: 32, height: 32 }}
                >
                  <Volume2 size={16} color="var(--color-primary)" />
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
                <span style={{ fontFamily: 'monospace', color: 'var(--color-primary)', fontSize: '0.8125rem', fontWeight: 600 }}>
                  {vocab.phoneticIpa}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  Syllables: <strong>{vocab.syllableBreakdown}</strong>
                </span>
              </div>

              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                {vocab.definition}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Final Performance Evaluation Card */}
      {feedback && (
        <div
          className="card"
          style={{
            borderColor: 'var(--color-primary)',
            background: 'var(--color-bg-surface-elevated)',
            padding: 'var(--space-8)',
            marginBottom: 'var(--space-8)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
            <div>
              <span style={{ fontSize: '0.8125rem', color: 'var(--color-primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                AI Speech Diagnostic Report
              </span>
              <h3 style={{ fontSize: '1.5rem', marginTop: '2px' }}>Passage Reading Evaluation</h3>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-primary)', lineHeight: 1 }}>
                {feedback.overallScore}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                Overall Score
              </span>
            </div>
          </div>

          {/* 5 Core Metric Gauges */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
            <div style={{ background: 'var(--color-bg-subtle)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Pronunciation</div>
              <div style={{ fontSize: '1.375rem', fontWeight: 700 }}>{feedback.pronunciationScore}%</div>
            </div>
            <div style={{ background: 'var(--color-bg-subtle)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Clarity</div>
              <div style={{ fontSize: '1.375rem', fontWeight: 700 }}>{feedback.clarityScore}%</div>
            </div>
            <div style={{ background: 'var(--color-bg-subtle)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Fluency</div>
              <div style={{ fontSize: '1.375rem', fontWeight: 700 }}>{feedback.fluencyScore}%</div>
            </div>
            <div style={{ background: 'var(--color-bg-subtle)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Speaking Pace</div>
              <div style={{ fontSize: '1.375rem', fontWeight: 700 }}>{feedback.wordsPerMinute} WPM</div>
            </div>
            <div style={{ background: 'var(--color-bg-subtle)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Accuracy</div>
              <div style={{ fontSize: '1.375rem', fontWeight: 700 }}>{feedback.accuracyScore}%</div>
            </div>
          </div>

          {/* Actionable Feedback Tips */}
          <div>
            <h4 style={{ fontSize: '1rem', marginBottom: 'var(--space-3)' }}>Personalized Coaching Insights</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {feedback.actionableFeedback.map((tip, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 'var(--space-3)',
                    background: 'var(--color-bg-subtle)',
                    padding: 'var(--space-3) var(--space-4)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.875rem',
                    color: 'var(--color-text-primary)'
                  }}
                >
                  <Sparkles size={16} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: '3px' }} />
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer Navigation */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
        <button
          className="btn btn-primary"
          onClick={() => onComplete(feedback || ({} as any))}
          style={{ padding: '0.75rem 2rem' }}
        >
          <span>Continue to Daily Sentences</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
