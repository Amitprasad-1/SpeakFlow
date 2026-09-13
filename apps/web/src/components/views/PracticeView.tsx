import React, { useState } from 'react';
import {
  Card,
  Badge,
  RecordingButton,
  VoiceWaveform,
  AudioPlayer,
  PlaybackSpeedControl,
  MicrophonePermissionState,
  SectionHeader,
  VoiceState
} from '../../design-system';
import { demoDailyLesson, DailyLessonData } from '../../data/demoData';

export interface PracticeViewProps {
  lesson?: DailyLessonData;
}

export const PracticeView: React.FC<PracticeViewProps> = ({
  lesson = demoDailyLesson
}) => {
  const [selectedStage, setSelectedStage] = useState<number>(1);
  const [voiceState, setVoiceState] = useState<VoiceState>('ready');
  const [duration, setDuration] = useState<number>(0);
  const [speed, setSpeed] = useState<number>(1.0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const handleToggleVoice = () => {
    if (voiceState === 'ready') {
      setVoiceState('listening');
      setDuration(1);
    } else if (voiceState === 'listening') {
      setVoiceState('processing');
      setTimeout(() => {
        setVoiceState('result');
      }, 1200);
    } else {
      setVoiceState('ready');
      setDuration(0);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      {/* Studio Header */}
      <div>
        <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
          <Badge variant="focus">Practice Studio</Badge>
          <Badge variant="level">Stage {selectedStage} of 6</Badge>
        </div>
        <h1 className="typography-h1">Daily Practice Arena</h1>
        <p className="typography-body" style={{ marginTop: 'var(--space-1)', maxWidth: '65ch' }}>
          Select an exercise below to practice speaking clearly, improving your rhythm, and building confidence.
        </p>
      </div>

      {/* Stage Selector Pills */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 'var(--space-2)' }}>
        {lesson.stages.map((st) => {
          const isSelected = selectedStage === st.number;
          return (
            <button
              key={st.number}
              onClick={() => {
                setSelectedStage(st.number);
                setVoiceState('ready');
              }}
              style={{
                padding: 'var(--space-3) var(--space-2)',
                borderRadius: 'var(--radius-md)',
                background: isSelected ? 'var(--color-primary-subtle)' : 'var(--color-surface)',
                border: `1px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                color: isSelected ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                fontWeight: 600,
                textAlign: 'center',
                fontSize: 'var(--text-caption)',
                cursor: 'pointer',
                transition: 'all var(--motion-duration-fast) ease'
              }}
            >
              <div style={{ fontSize: '0.6875rem', opacity: 0.8, textTransform: 'uppercase' }}>Stage {st.number}</div>
              <div style={{ marginTop: '2px', fontWeight: 700 }}>{st.title}</div>
            </button>
          );
        })}
      </div>

      {/* Main Interactive Studio Canvas Preview */}
      <Card variant="default" padding="lg" style={{ textAlign: 'center' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <Badge variant="primary" style={{ marginBottom: 'var(--space-4)' }}>
            Focus Sound: {lesson.focusSound}
          </Badge>

          {/* Reading / Twister Sentence Display */}
          <h2 className="typography-h2" style={{ marginBottom: 'var(--space-4)', lineHeight: 1.5 }}>
            {selectedStage === 1 && '"Inhale gently through your nose, keep your shoulders relaxed, and blow air smoothly through your lips."'}
            {selectedStage === 2 && '"Literally literary rivals rarely relish relevant lyrical revelations along rural routes."'}
            {selectedStage === 3 && '"Artificial intelligence is rapidly transforming workplace dynamics, yet clear communication remains an essential human leadership skill."'}
            {selectedStage === 4 && '"Our regional leaders regularly deliver real-time project updates to client stakeholders."'}
            {selectedStage === 5 && '"Could you walk me through a challenging project where unexpected obstacles arose and how you led your team?"'}
            {selectedStage === 6 && '"Listen to the team discussion dialogue and identify the key priorities agreed upon."'}
          </h2>

          <p className="typography-body-sm" style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-8)' }}>
            Tip: For /l/, press your tongue tip firmly behind your top front teeth. For /r/, pull your tongue back without touching the roof of your mouth.
          </p>

          {/* Real-time Waveform Preview */}
          <div style={{ marginBottom: 'var(--space-8)' }}>
            <VoiceWaveform active={voiceState === 'listening'} height={56} />
          </div>

          {/* Central Recording Button */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-6)' }}>
            <RecordingButton
              state={voiceState}
              onToggle={handleToggleVoice}
              durationSeconds={duration}
            />
          </div>

          {/* Audio Player & Speed Controller */}
          <div style={{ maxWidth: '480px', margin: '0 auto var(--space-6)' }}>
            <AudioPlayer
              title="Native Pronunciation Example"
              duration="0:18"
              isPlaying={isPlaying}
              onTogglePlay={() => setIsPlaying(!isPlaying)}
              speed={speed}
              onSpeedChange={setSpeed}
            />
          </div>

          <MicrophonePermissionState status="granted" />
        </div>
      </Card>
    </div>
  );
};
