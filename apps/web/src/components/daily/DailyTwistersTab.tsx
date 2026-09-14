import React, { useState, useEffect } from 'react';
import { Card, Badge, Button } from '../../design-system';
import { VoiceWaveVisualizer } from '../common/VoiceWaveVisualizer';
import {
  TongueTwister,
  TONGUE_TWISTERS_CATALOG
} from '@speakflow/core';
import {
  Volume2,
  Mic,
  MicOff,
  Sparkles,
  Zap,
  CheckCircle2,
  RotateCw
} from 'lucide-react';
import { speakText, stopSpeaking, BrowserSpeechProvider } from '../../speech/BrowserSpeechProvider';

export interface DailyTwistersTabProps {
  currentDateString?: string;
}

export const DailyTwistersTab: React.FC<DailyTwistersTabProps> = ({
  currentDateString
}) => {
  // Select today's 4-5 tongue twisters based on calendar date
  const twisters: TongueTwister[] = React.useMemo(() => {
    let dayNum = new Date().getDate();
    if (currentDateString) {
      const parts = currentDateString.split('-');
      if (parts.length === 3) dayNum = parseInt(parts[2], 10) || dayNum;
    }
    const startIdx = (dayNum * 3) % (TONGUE_TWISTERS_CATALOG.length - 4);
    return TONGUE_TWISTERS_CATALOG.slice(startIdx, startIdx + 4);
  }, [currentDateString]);

  const [activeSpeed, setActiveSpeed] = useState<Record<string, 0.75 | 1.0 | 1.25>>({});
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [recordingId, setRecordingId] = useState<string | null>(null);
  const [completedTwisters, setCompletedTwisters] = useState<Record<string, boolean>>({});
  const [spokenTranscripts, setSpokenTranscripts] = useState<Record<string, string>>({});
  const [twisterScores, setTwisterScores] = useState<Record<string, number>>({});

  const speechProvider = React.useMemo(() => new BrowserSpeechProvider(), []);

  useEffect(() => {
    stopSpeaking();
    speechProvider.stopRealtimeRecognition();
    setPlayingId(null);
    setRecordingId(null);
  }, [currentDateString, speechProvider]);

  useEffect(() => {
    return () => {
      stopSpeaking();
      speechProvider.dispose();
    };
  }, [speechProvider]);

  const playTwister = (twister: TongueTwister, speed: 0.75 | 1.0 | 1.25) => {
    setPlayingId(twister.id);
    speakText(twister.text, {
      rate: speed,
      pitch: 1.0,
      onEnd: () => setPlayingId(null),
      onError: () => setPlayingId(null)
    });
  };

  const evaluateAndCompleteTwister = (twister: TongueTwister, text: string) => {
    const cleanTarget = twister.text.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
    const cleanSpoken = text.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();

    let score = 85;
    if (cleanSpoken) {
      const targetWords = cleanTarget.split(/\s+/).filter(Boolean);
      const spokenWords = cleanSpoken.split(/\s+/).filter(Boolean);
      let matchCount = 0;
      targetWords.forEach(tw => {
        if (spokenWords.includes(tw)) matchCount++;
      });
      score = Math.min(100, Math.max(65, Math.round((matchCount / Math.max(targetWords.length, 1)) * 100)));
    }

    setTwisterScores(prev => ({ ...prev, [twister.id]: score }));
    setCompletedTwisters(prev => ({ ...prev, [twister.id]: true }));
    setRecordingId(null);
    speechProvider.stopRealtimeRecognition();
  };

  const handleToggleRecord = (twister: TongueTwister) => {
    if (recordingId === twister.id) {
      const currentText = spokenTranscripts[twister.id] || '';
      evaluateAndCompleteTwister(twister, currentText);
      return;
    }

    // Stop speaking if model audio was playing
    stopSpeaking();
    setPlayingId(null);
    setRecordingId(twister.id);
    setSpokenTranscripts(prev => ({ ...prev, [twister.id]: '' }));

    // Start real continuous microphone speech recognition
    speechProvider.startRealtimeRecognition({
      autoEndOnSilence: true,
      silenceThresholdMs: 1400,
      noSpeechTimeoutMs: 8000,
      onTranscriptUpdate: (text: string) => {
        setSpokenTranscripts(prev => ({ ...prev, [twister.id]: text }));
      },
      onSilenceDetected: (finalText: string) => {
        evaluateAndCompleteTwister(twister, finalText);
      },
      onNoSpeechTimeout: () => {
        setRecordingId(null);
      },
      onError: () => {
        setRecordingId(null);
      }
    });
  };

  const completedCount = Object.values(completedTwisters).filter(Boolean).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', maxWidth: '820px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
            <Badge variant="primary">Speech Clarity Drills</Badge>
            <Badge variant={completedCount === twisters.length ? 'success' : 'level'}>
              {completedCount} of {twisters.length} Completed
            </Badge>
          </div>
          <h1 className="typography-h2">Today's Tongue Twisters</h1>
          <p className="typography-body-sm" style={{ color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Train your tongue and lips with tricky sound combinations. Start slow, then increase your speed!
          </p>
        </div>

        {completedCount === twisters.length && (
          <div className="celebrate-pop" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-success)', fontWeight: 700 }}>
            <CheckCircle2 size={20} />
            <span>All Clarity Drills Mastered!</span>
          </div>
        )}
      </div>

      {/* Twisters List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {twisters.map((twister, idx) => {
          const speed = activeSpeed[twister.id] || 1.0;
          const isPlaying = playingId === twister.id;
          const isRecording = recordingId === twister.id;
          const isDone = completedTwisters[twister.id];

          return (
            <Card
              key={twister.id}
              variant="default"
              padding="lg"
              className="card-hover-lift"
              style={{
                border: isDone ? '1px solid var(--color-success)' : '1px solid var(--color-border)',
                background: isDone ? 'linear-gradient(135deg, var(--color-surface) 0%, rgba(16, 185, 129, 0.05) 100%)' : 'var(--color-surface)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-3)',
                borderRadius: 'var(--radius-xl)'
              }}
            >
              {/* Badge & Target Sound */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <span style={{ fontWeight: 800, color: 'var(--color-primary)', fontSize: 'var(--text-body-sm)' }}>
                    #{idx + 1}
                  </span>
                  <Badge variant="focus">Sound: {twister.focusSound}</Badge>
                  <Badge variant="level">{twister.difficulty} Level</Badge>
                </div>

                {isDone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {twisterScores[twister.id] && (
                      <Badge variant="success">
                        {twisterScores[twister.id]}% Match
                      </Badge>
                    )}
                    <Badge variant="success" icon={<CheckCircle2 size={12} />}>
                      Mastered
                    </Badge>
                  </div>
                )}
              </div>

              {/* Twister Text */}
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1.5 }}>
                "{twister.text}"
              </div>

              {/* Phonetic & Coach Tip */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', background: 'var(--color-surface-sunken)', padding: 'var(--space-2-5) var(--space-3)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--text-caption)' }}>
                <span style={{ color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
                  {twister.phoneticBreakdown}
                </span>
                <span style={{ color: 'var(--color-text-secondary)' }}>
                  💡 <strong>Coach tip:</strong> {twister.tip}
                </span>
              </div>

              {/* Live Spoken Output */}
              {(isRecording || spokenTranscripts[twister.id]) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: isRecording ? 'rgba(239, 68, 68, 0.08)' : 'var(--color-surface-sunken)', borderRadius: 'var(--radius-sm)', border: `1px solid ${isRecording ? 'rgba(239, 68, 68, 0.25)' : 'var(--color-border-subtle)'}`, fontSize: 'var(--text-caption)' }}>
                  <Mic size={13} color={isRecording ? '#ef4444' : 'var(--color-primary)'} />
                  <span style={{ fontWeight: 600, color: isRecording ? '#ef4444' : 'var(--color-text-secondary)' }}>
                    {isRecording ? 'Listening (stops on pause):' : 'Spoken:'}
                  </span>
                  <span style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>
                    "{spokenTranscripts[twister.id] || (isRecording ? 'Recite now...' : '')}"
                  </span>
                </div>
              )}

              {/* Action Controls: Speed Selectors + Listen + Record */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)', paddingTop: 'var(--space-2)', borderTop: '1px solid var(--color-border-subtle)' }}>
                {/* Speed Toggles */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--color-surface-sunken)', padding: '3px 6px', borderRadius: 'var(--radius-pill)', border: '1px solid var(--color-border)' }}>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-text-muted)', marginRight: '4px' }}>SPEED:</span>
                  <button
                    onClick={() => setActiveSpeed((prev) => ({ ...prev, [twister.id]: 0.75 }))}
                    style={{
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-pill)',
                      border: 'none',
                      background: speed === 0.75 ? 'var(--color-primary)' : 'transparent',
                      color: speed === 0.75 ? '#fff' : 'var(--color-text-secondary)',
                      fontSize: 'var(--text-caption)',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Slow 0.75x
                  </button>
                  <button
                    onClick={() => setActiveSpeed((prev) => ({ ...prev, [twister.id]: 1.0 }))}
                    style={{
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-pill)',
                      border: 'none',
                      background: speed === 1.0 ? 'var(--color-primary)' : 'transparent',
                      color: speed === 1.0 ? '#fff' : 'var(--color-text-secondary)',
                      fontSize: 'var(--text-caption)',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Normal 1.0x
                  </button>
                  <button
                    onClick={() => setActiveSpeed((prev) => ({ ...prev, [twister.id]: 1.25 }))}
                    style={{
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-pill)',
                      border: 'none',
                      background: speed === 1.25 ? 'var(--color-primary)' : 'transparent',
                      color: speed === 1.25 ? '#fff' : 'var(--color-text-secondary)',
                      fontSize: 'var(--text-caption)',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Fast 1.25x
                  </button>
                </div>

                {/* Listen & Record Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <button
                    onClick={() => playTwister(twister, speed)}
                    className="speakflow-btn btn-variant-secondary"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 'var(--space-1-5)',
                      padding: 'var(--space-2) var(--space-3-5)',
                      borderRadius: 'var(--radius-pill)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: 'var(--text-body-sm)'
                    }}
                  >
                    <Volume2 size={16} />
                    <span>{isPlaying ? 'Playing...' : 'Listen'}</span>
                  </button>

                  <button
                    onClick={() => handleToggleRecord(twister)}
                    className={`speakflow-btn ${isRecording ? 'btn-variant-danger' : 'btn-variant-primary'} cta-breathing`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 'var(--space-1-5)',
                      padding: 'var(--space-2) var(--space-4)',
                      borderRadius: 'var(--radius-pill)',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: 'var(--text-body-sm)'
                    }}
                  >
                    {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
                    <span>{isRecording ? 'Listening (Pause to finish)' : isDone ? 'Practice Again' : 'Repeat & Test'}</span>
                  </button>

                  {(isPlaying || isRecording) && (
                    <VoiceWaveVisualizer
                      isActive={true}
                      size="sm"
                      color={isRecording ? 'var(--color-error)' : 'var(--color-primary)'}
                    />
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
