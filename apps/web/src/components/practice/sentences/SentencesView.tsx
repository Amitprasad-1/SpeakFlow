import React, { useState } from 'react';
import { useApp } from '../../../store/AppContext';
import { PracticeSentence, SpeechFeedback } from '@speakflow/core';
import { Volume2, Mic, Square, Check, ArrowRight, RotateCcw, Sparkles } from 'lucide-react';

export const SentencesView: React.FC<{
  onComplete: (scores: Record<string, SpeechFeedback>) => void;
}> = ({ onComplete }) => {
  const { lesson, speechProvider } = useApp();
  const sentences: PracticeSentence[] = lesson.practicalSentences;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStartTime, setRecordingStartTime] = useState(0);
  const [scores, setScores] = useState<Record<string, SpeechFeedback>>({});
  const [feedback, setFeedback] = useState<SpeechFeedback | null>(null);

  const currentSentence = sentences[currentIndex] || sentences[0];

  const handleListen = async () => {
    if (isListening) {
      speechProvider.cancelSynthesis();
      setIsListening(false);
      return;
    }
    setIsListening(true);
    await speechProvider.synthesizeSpeech(currentSentence.text, { rate: 0.9 });
    setIsListening(false);
  };

  const handleToggleRecord = async () => {
    if (isRecording) {
      setIsRecording(false);
      await speechProvider.stopRecording();
      const duration = Math.max(1200, Date.now() - recordingStartTime);

      const evalResult = await speechProvider.evaluatePronunciation({
        targetText: currentSentence.text,
        spokenTranscript: currentSentence.text,
        durationMs: duration,
        expectedWordCount: currentSentence.text.split(/\s+/).length,
        targetPhonemes: [currentSentence.focusPhoneme]
      });

      setFeedback(evalResult);
      setScores((prev) => ({ ...prev, [currentSentence.id]: evalResult }));
    } else {
      setFeedback(null);
      setIsRecording(true);
      setRecordingStartTime(Date.now());
      await speechProvider.startRecording();
    }
  };

  const handleNext = () => {
    if (currentIndex < sentences.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setFeedback(null);
      setIsRecording(false);
    } else {
      onComplete(scores);
    }
  };

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <div>
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-primary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Stage 4 of 6 • Daily Practical Sentences
          </span>
          <h2 style={{ fontSize: '1.5rem', marginTop: '4px' }}>
            Sentence {currentIndex + 1} of {sentences.length}
          </h2>
        </div>

        <span className="badge badge-focus">{currentSentence.contextCategory} Context</span>
      </div>

      {/* Progress Dots */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: 'var(--space-6)' }}>
        {sentences.map((s, idx) => (
          <div
            key={s.id}
            onClick={() => {
              setCurrentIndex(idx);
              setFeedback(null);
            }}
            style={{
              flex: 1,
              height: '6px',
              borderRadius: 'var(--radius-full)',
              background:
                idx === currentIndex
                  ? 'var(--color-primary)'
                  : scores[s.id]
                  ? 'var(--color-success)'
                  : 'var(--color-bg-surface-active)',
              cursor: 'pointer'
            }}
            title={s.text}
          />
        ))}
      </div>

      {/* Sentence Main Card */}
      <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center', marginBottom: 'var(--space-6)' }}>
        <h3
          style={{
            fontSize: '1.625rem',
            fontWeight: 600,
            lineHeight: 1.6,
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-4)',
            maxWidth: '680px',
            margin: '0 auto var(--space-4)'
          }}
        >
          "{currentSentence.text}"
        </h3>

        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9375rem', marginBottom: 'var(--space-6)' }}>
          <strong style={{ color: 'var(--color-primary)' }}>Phonetic Guidance:</strong> {currentSentence.phoneticNotes}
        </p>

        {/* Listen and Record Controls */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 'var(--space-4)' }}>
          <button
            className={`btn ${isListening ? 'btn-primary' : 'btn-secondary'}`}
            onClick={handleListen}
            style={{ padding: '0.625rem 1.5rem' }}
          >
            <Volume2 size={18} />
            <span>{isListening ? 'Stop' : 'Listen Native'}</span>
          </button>

          <button
            className={`btn ${isRecording ? 'btn-secondary' : 'btn-primary'}`}
            onClick={handleToggleRecord}
            style={{ padding: '0.75rem 2rem', fontSize: '1.0625rem', borderColor: isRecording ? 'var(--color-error)' : undefined }}
          >
            {isRecording ? <Square size={18} color="var(--color-error)" /> : <Mic size={18} />}
            <span>{isRecording ? 'Stop & Evaluate' : 'Record Sentence'}</span>
          </button>
        </div>
      </div>

      {/* Immediate Sentence Score */}
      {feedback && (
        <div
          className="card"
          style={{
            background: 'var(--color-bg-surface-elevated)',
            borderColor: 'var(--color-primary)',
            padding: 'var(--space-4) var(--space-6)',
            marginBottom: 'var(--space-6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <Sparkles size={22} color="var(--color-primary)" />
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem' }}>Score: {feedback.overallScore}/100</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                Clarity: {feedback.clarityScore}% • Fluency: {feedback.fluencyScore}% • Pace: {feedback.wordsPerMinute} WPM
              </div>
            </div>
          </div>

          <button className="btn btn-secondary" onClick={() => setFeedback(null)}>
            <RotateCcw size={16} />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Navigation Footer */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
        <button
          className="btn btn-primary"
          onClick={handleNext}
          style={{ padding: '0.75rem 2rem' }}
        >
          <span>{currentIndex === sentences.length - 1 ? 'Go to Speaking Simulation' : 'Next Sentence'}</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
