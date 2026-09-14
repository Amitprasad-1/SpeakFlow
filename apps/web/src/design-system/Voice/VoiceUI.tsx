import React, { useState, useEffect } from 'react';
import { Mic, Square, Loader2, Play, Pause, RotateCcw, Volume2, ShieldAlert, Check } from 'lucide-react';
import { Button } from '../Button/Button';

export type VoiceState = 'ready' | 'listening' | 'processing' | 'result';

/* --------------------------------------------------------------------------
   1. RecordingButton
   -------------------------------------------------------------------------- */
export interface RecordingButtonProps {
  state: VoiceState;
  onToggle: () => void;
  durationSeconds?: number;
  size?: 'md' | 'lg';
  disabled?: boolean;
  statusLabel?: string;
}

export const RecordingButton: React.FC<RecordingButtonProps> = ({
  state,
  onToggle,
  durationSeconds = 0,
  size = 'lg',
  disabled = false,
  statusLabel
}) => {
  const isRecording = state === 'listening';
  const isProcessing = state === 'processing';

  const buttonDimensions = size === 'lg' ? 76 : 60;
  const iconSize = size === 'lg' ? 28 : 22;

  return (
    <div
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--space-2)'
      }}
    >
      <div style={{ position: 'relative', width: buttonDimensions, height: buttonDimensions }}>
        {/* Animated Listening Pulse Ring */}
        {isRecording && (
          <div
            className="voice-pulse-ring"
            style={{
              position: 'absolute',
              inset: -8,
              borderRadius: 'var(--radius-pill)',
              border: '2px solid var(--color-error)',
              animation: 'pulseRing 1.8s infinite cubic-bezier(0.25, 1, 0.5, 1)'
            }}
          />
        )}

        {/* Main Central Button */}
        <button
          onClick={onToggle}
          disabled={disabled || isProcessing}
          aria-label={
            state === 'listening'
              ? 'Stop recording'
              : state === 'processing'
              ? 'Processing speech'
              : 'Start speaking'
          }
          style={{
            width: '100%',
            height: '100%',
            borderRadius: 'var(--radius-pill)',
            background:
              isRecording
                ? 'var(--color-error)'
                : isProcessing
                ? 'var(--color-surface-elevated)'
                : 'var(--color-primary)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: isProcessing ? '2px solid var(--color-primary)' : 'none',
            boxShadow: isRecording
              ? 'var(--shadow-recording)'
              : 'var(--shadow-glow)',
            transition: 'all var(--motion-duration-fast) var(--motion-ease-out)',
            transform: isRecording ? 'scale(1.05)' : 'scale(1)'
          }}
        >
          {isProcessing ? (
            <Loader2 className="btn-spinner" size={iconSize} color="var(--color-primary)" />
          ) : isRecording ? (
            <Square size={iconSize - 4} fill="currentColor" />
          ) : (
            <Mic size={iconSize} />
          )}
        </button>
      </div>

      {/* State Label & Timer */}
      <div style={{ textAlign: 'center' }}>
        <span
          style={{
            fontSize: 'var(--text-caption)',
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color:
              isRecording
                ? 'var(--color-error)'
                : isProcessing
                ? 'var(--color-accent)'
                : 'var(--color-text-secondary)'
          }}
        >
          {statusLabel || (
            state === 'listening'
              ? `Listening • ${durationSeconds}s`
              : state === 'processing'
              ? 'Analyzing speech...'
              : state === 'result'
              ? 'Evaluation ready'
              : 'Tap to speak'
          )}
        </span>
      </div>
    </div>
  );
};

/* --------------------------------------------------------------------------
   2. VoiceWaveform (Animated Sound Waves)
   -------------------------------------------------------------------------- */
export interface VoiceWaveformProps {
  active?: boolean;
  barCount?: number;
  height?: number;
  color?: string;
}

export const VoiceWaveform: React.FC<VoiceWaveformProps> = ({
  active = false,
  barCount = 28,
  height = 48,
  color = 'var(--color-primary)'
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '3px',
        height,
        width: '100%',
        padding: '0 var(--space-4)',
        background: 'var(--color-bg-subtle)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)'
      }}
      aria-hidden="true"
    >
      {Array.from({ length: barCount }).map((_, i) => {
        // Vary base heights
        const seed = Math.sin((i / barCount) * Math.PI);
        const minH = 6;
        const maxH = height * 0.75;
        const barHeight = active ? Math.max(minH, seed * maxH * (0.4 + (i % 3) * 0.3)) : minH;

        return (
          <div
            key={i}
            style={{
              width: '3px',
              height: `${barHeight}px`,
              backgroundColor: active ? color : 'var(--color-border-hover)',
              borderRadius: 'var(--radius-pill)',
              transition: active
                ? `height 0.15s ease ${(i * 0.02) % 0.2}s`
                : 'height 0.4s ease',
              animation: active ? `wavePulse 1.2s ease-in-out infinite ${(i * 0.04)}s` : 'none'
            }}
          />
        );
      })}
    </div>
  );
};

/* --------------------------------------------------------------------------
   3. PlaybackSpeedControl
   -------------------------------------------------------------------------- */
export interface PlaybackSpeedControlProps {
  speed: number; // 0.75, 1.0, 1.25
  onChange: (speed: number) => void;
}

export const PlaybackSpeedControl: React.FC<PlaybackSpeedControlProps> = ({ speed, onChange }) => {
  const speeds = [
    { value: 0.75, label: '0.75x Slow' },
    { value: 1.0, label: '1.0x Normal' },
    { value: 1.25, label: '1.25x Fast' }
  ];

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: 'var(--color-bg-subtle)',
        padding: '2px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border)'
      }}
    >
      {speeds.map((s) => {
        const isSelected = speed === s.value;
        return (
          <button
            key={s.value}
            onClick={() => onChange(s.value)}
            style={{
              padding: 'var(--space-1) var(--space-3)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--text-caption)',
              fontWeight: isSelected ? 700 : 500,
              background: isSelected ? 'var(--color-primary)' : 'transparent',
              color: isSelected ? 'var(--color-primary-on)' : 'var(--color-text-secondary)',
              transition: 'all var(--motion-duration-fast) ease'
            }}
          >
            {s.label}
          </button>
        );
      })}
    </div>
  );
};

/* --------------------------------------------------------------------------
   4. AudioPlayer
   -------------------------------------------------------------------------- */
export interface AudioPlayerProps {
  title?: string;
  duration?: string;
  isPlaying?: boolean;
  onTogglePlay?: () => void;
  speed?: number;
  onSpeedChange?: (speed: number) => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  title = 'Native Audio Sample',
  duration = '0:24',
  isPlaying = false,
  onTogglePlay,
  speed = 1.0,
  onSpeedChange
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 'var(--space-3) var(--space-4)',
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        gap: 'var(--space-3)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <button
          onClick={onTogglePlay}
          className="speakflow-btn btn-variant-primary"
          style={{
            width: 36,
            height: 36,
            borderRadius: 'var(--radius-pill)',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} fill="currentColor" />}
        </button>

        <div>
          <span style={{ fontSize: 'var(--text-body-sm)', fontWeight: 600, display: 'block' }}>
            {title}
          </span>
          <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-muted)' }}>
            Duration: {duration}
          </span>
        </div>
      </div>

      {onSpeedChange && <PlaybackSpeedControl speed={speed} onChange={onSpeedChange} />}
    </div>
  );
};

/* --------------------------------------------------------------------------
   5. MicrophonePermissionState
   -------------------------------------------------------------------------- */
export interface MicrophonePermissionStateProps {
  status: 'granted' | 'prompt' | 'denied';
  onRequestPermission?: () => void;
}

export const MicrophonePermissionState: React.FC<MicrophonePermissionStateProps> = ({
  status,
  onRequestPermission
}) => {
  if (status === 'granted') {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          padding: 'var(--space-2) var(--space-3)',
          background: 'var(--color-success-subtle)',
          color: 'var(--color-success)',
          borderRadius: 'var(--radius-sm)',
          fontSize: 'var(--text-caption)',
          fontWeight: 600
        }}
      >
        <Check size={14} />
        <span>Microphone connected and ready</span>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 'var(--space-3) var(--space-4)',
        background: status === 'denied' ? 'var(--color-error-subtle)' : 'var(--color-warning-subtle)',
        border: `1px solid ${status === 'denied' ? 'var(--color-error)' : 'var(--color-warning)'}`,
        borderRadius: 'var(--radius-md)',
        gap: 'var(--space-3)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        <ShieldAlert size={18} color={status === 'denied' ? 'var(--color-error)' : 'var(--color-warning)'} />
        <span style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-text-primary)' }}>
          {status === 'denied'
            ? 'Microphone access is blocked in browser settings.'
            : 'Microphone permission required for speech coaching.'}
        </span>
      </div>

      {onRequestPermission && (
        <Button size="sm" variant="secondary" onClick={onRequestPermission}>
          Allow Mic
        </Button>
      )}
    </div>
  );
};
