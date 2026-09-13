import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../../store/AppContext';
import { Play, Pause, CheckCircle2, Volume2, ArrowRight, RotateCcw, Activity } from 'lucide-react';

export const VocalWarmupView: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { lesson, speechProvider } = useApp();
  const warmups = lesson.vocalWarmups;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(warmups[0]?.durationSeconds || 45);
  const [isActive, setIsActive] = useState(false);
  const [hasCompletedCurrent, setHasCompletedCurrent] = useState(false);
  const [isPlayingTone, setIsPlayingTone] = useState(false);

  const currentExercise = warmups[currentIndex] || warmups[0];
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);

  // Timer Effect
  useEffect(() => {
    let interval: any = null;
    if (isActive && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    } else if (secondsRemaining === 0 && isActive) {
      setIsActive(false);
      setHasCompletedCurrent(true);
      stopTone();
    }
    return () => clearInterval(interval);
  }, [isActive, secondsRemaining]);

  const handleNextExercise = () => {
    stopTone();
    if (currentIndex < warmups.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setSecondsRemaining(warmups[nextIdx].durationSeconds);
      setIsActive(false);
      setHasCompletedCurrent(false);
    } else {
      onComplete();
    }
  };

  const handleRestart = () => {
    setSecondsRemaining(currentExercise.durationSeconds);
    setIsActive(false);
    setHasCompletedCurrent(false);
    stopTone();
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const playPitchTone = () => {
    if (isPlayingTone) {
      stopTone();
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(currentExercise.targetFrequencyHz || 220, ctx.currentTime);

      if (currentExercise.pitchDirection === 'glide' || currentExercise.pitchDirection === 'siren_wave') {
        osc.frequency.exponentialRampToValueAtTime(340, ctx.currentTime + 3);
        osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 6);
      }

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      oscillatorRef.current = osc;
      setIsPlayingTone(true);

      setTimeout(() => {
        setIsPlayingTone(false);
      }, 6000);
    } catch (e) {
      console.warn('Oscillator error:', e);
    }
  };

  const stopTone = () => {
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.stop();
      } catch {}
      oscillatorRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsPlayingTone(false);
  };

  const progressPct = Math.round(
    ((currentExercise.durationSeconds - secondsRemaining) / currentExercise.durationSeconds) * 100
  );

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Exercise Stepper Dots */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <div>
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-primary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Stage 1 of 6 • Vocal Physiology Studio
          </span>
          <h2 style={{ fontSize: '1.5rem', marginTop: '4px' }}>
            Exercise {currentIndex + 1} of {warmups.length}: {currentExercise.title}
          </h2>
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          {warmups.map((w, idx) => (
            <div
              key={w.id}
              onClick={() => {
                setCurrentIndex(idx);
                setSecondsRemaining(w.durationSeconds);
                setIsActive(false);
                setHasCompletedCurrent(false);
              }}
              style={{
                width: 12,
                height: 12,
                borderRadius: 'var(--radius-full)',
                backgroundColor:
                  idx === currentIndex
                    ? 'var(--color-primary)'
                    : idx < currentIndex
                    ? 'var(--color-success)'
                    : 'var(--color-bg-surface-active)',
                cursor: 'pointer'
              }}
              title={w.title}
            />
          ))}
        </div>
      </div>

      {/* Main Interactive Studio Card */}
      <div className="card" style={{ textAlign: 'center', padding: 'var(--space-8)', marginBottom: 'var(--space-6)' }}>
        {/* Animated Breathing / Resonance Ring */}
        <div style={{ position: 'relative', width: '220px', height: '220px', margin: '0 auto var(--space-6)' }}>
          {/* Outer Wave Pulse */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 'var(--radius-full)',
              background: 'radial-gradient(circle, var(--color-primary-light) 0%, transparent 70%)',
              transform: isActive ? 'scale(1.2)' : 'scale(1)',
              transition: 'transform 2s ease-in-out',
              animation: isActive ? 'pulse-ring 2.5s infinite ease-in-out' : 'none'
            }}
          />

          {/* Center Timer Circle */}
          <div
            style={{
              position: 'absolute',
              inset: '15px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--color-bg-surface-elevated)',
              border: `4px solid ${isActive ? 'var(--color-primary)' : 'var(--color-border)'}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: isActive ? 'var(--shadow-glow)' : 'none',
              transition: 'all var(--transition-normal)'
            }}
          >
            <span style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-family-heading)' }}>
              {secondsRemaining}s
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {isActive ? 'Inhale & Glide' : hasCompletedCurrent ? 'Completed' : 'Ready'}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
          <button className="btn btn-secondary" onClick={handleRestart} title="Restart timer">
            <RotateCcw size={18} />
          </button>

          <button
            className={`btn ${isActive ? 'btn-secondary' : 'btn-primary'}`}
            onClick={toggleTimer}
            style={{ padding: '0.75rem 2.5rem', fontSize: '1.125rem' }}
          >
            {isActive ? <Pause size={20} /> : <Play size={20} fill="currentColor" />}
            <span>{isActive ? 'Pause' : 'Start Timer'}</span>
          </button>

          <button
            className={`btn ${isPlayingTone ? 'btn-primary' : 'btn-secondary'}`}
            onClick={playPitchTone}
            title="Listen to target pitch tone"
          >
            <Volume2 size={18} />
            <span>Tone</span>
          </button>
        </div>

        {/* Benefits Note */}
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9375rem', fontStyle: 'italic', maxWidth: '600px', margin: '0 auto' }}>
          "{currentExercise.benefits}"
        </p>
      </div>

      {/* Instructions Breakdown */}
      <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
        <h3 style={{ fontSize: '1.125rem', marginBottom: 'var(--space-3)' }}>Performance Technique</h3>
        <ol style={{ paddingLeft: 'var(--space-5)', color: 'var(--color-text-secondary)', lineHeight: 1.8, fontSize: '0.9375rem' }}>
          {currentExercise.instructions.map((inst, i) => (
            <li key={i}>{inst}</li>
          ))}
        </ol>
      </div>

      {/* Next Step Footer */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
        <button
          className="btn btn-primary"
          onClick={handleNextExercise}
          style={{ padding: '0.75rem 2rem' }}
        >
          <span>{currentIndex === warmups.length - 1 ? 'Finish Warmups & Go to Twisters' : 'Next Exercise'}</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
