import React, { useState } from 'react';
import {
  Button,
  Card,
  Badge,
  ProgressRing,
  ProgressBar,
  SkillScoreBar,
  RecordingButton,
  VoiceWaveform,
  AudioPlayer,
  PlaybackSpeedControl,
  MicrophonePermissionState,
  SectionHeader,
  LoadingState,
  EmptyState,
  ErrorState,
  StatCard,
  StreakCard,
  ContinuePracticeCard,
  ExerciseCard,
  VocabularyCard,
  VoiceState
} from '../../design-system';
import {
  Play,
  Volume2,
  Mic,
  Flame,
  Award,
  BookOpen,
  Sparkles,
  Layers,
  ArrowRight,
  Shield,
  Target
} from 'lucide-react';

export const DesignSystemView: React.FC = () => {
  // Interactive preview states
  const [voiceState, setVoiceState] = useState<VoiceState>('ready');
  const [duration, setDuration] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioSpeed, setAudioSpeed] = useState(1.0);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [progressVal, setProgressVal] = useState(68);

  const toggleRecordingState = () => {
    if (voiceState === 'ready') {
      setVoiceState('listening');
      setDuration(1);
    } else if (voiceState === 'listening') {
      setVoiceState('processing');
      setTimeout(() => {
        setVoiceState('result');
      }, 1500);
    } else {
      setVoiceState('ready');
      setDuration(0);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-10)', paddingBottom: 'var(--space-12)' }}>
      {/* Overview Header */}
      <div>
        <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
          <Badge variant="focus">Design System v1.0</Badge>
          <Badge variant="level">Semantic Tokens</Badge>
        </div>
        <h1 className="typography-display">SpeakFlow Visual Identity</h1>
        <p className="typography-body-lg" style={{ maxWidth: '65ch', marginTop: 'var(--space-2)' }}>
          A calm, focused, and professional design system engineered specifically for an AI English Speech & Communication Coach.
        </p>
      </div>

      {/* 1. COLOR SYSTEM */}
      <section>
        <SectionHeader
          title="1. Semantic Color Palette"
          subtitle="Tokens switch automatically with theme without hardcoded values."
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--space-3)' }}>
          {[
            { name: 'Primary Emerald', var: 'var(--color-primary)', hex: 'Growth & Articulation' },
            { name: 'Accent Sky', var: 'var(--color-accent)', hex: 'Flow & Clarity' },
            { name: 'Secondary Indigo', var: 'var(--color-secondary)', hex: 'Intelligence' },
            { name: 'Surface', var: 'var(--color-surface)', hex: 'Card Fill' },
            { name: 'Elevated Surface', var: 'var(--color-surface-elevated)', hex: 'Modals & Floating' },
            { name: 'Success', var: 'var(--color-success)', hex: 'Mastery' },
            { name: 'Warning', var: 'var(--color-warning)', hex: 'Hesitations / Streaks' },
            { name: 'Error', var: 'var(--color-error)', hex: 'Mispronunciations' }
          ].map((color, i) => (
            <div
              key={i}
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden'
              }}
            >
              <div style={{ height: '48px', backgroundColor: color.var }} />
              <div style={{ padding: 'var(--space-2)' }}>
                <div style={{ fontSize: 'var(--text-caption)', fontWeight: 700 }}>{color.name}</div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>{color.hex}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. TYPOGRAPHY */}
      <section>
        <SectionHeader
          title="2. Typography Hierarchy"
          subtitle="Engineered for legible visual hierarchy and comfortable reading aloud."
        />
        <Card variant="default" padding="lg" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div>
            <span className="typography-caption">Display • 40px/48px</span>
            <div className="typography-display">Speak with Authority</div>
          </div>
          <div>
            <span className="typography-caption">H1 • 32px/36px</span>
            <div className="typography-h1">Daily Communication Mastery</div>
          </div>
          <div>
            <span className="typography-caption">H2 • 24px/28px</span>
            <div className="typography-h2">Pronunciation Clarity Analysis</div>
          </div>
          <div>
            <span className="typography-caption">H3 • 18px/24px</span>
            <div className="typography-h3">Tongue Twister & Phoneme Lab</div>
          </div>
          <div>
            <span className="typography-caption">Body Large • 18px (Aloud Reading)</span>
            <p className="reading-passage-text" style={{ margin: 'var(--space-1) 0' }}>
              "Artificial intelligence is rapidly transforming workplace dynamics, yet the most enduring competitive advantage remains authentic human articulation."
            </p>
          </div>
          <div>
            <span className="typography-caption">Body Regular • 15px</span>
            <p className="typography-body">
              Your speech coach evaluates vocal tempo, clarity, rhythm, and terminal consonant release in real time.
            </p>
          </div>
        </Card>
      </section>

      {/* 3. BUTTON SYSTEM */}
      <section>
        <SectionHeader
          title="3. Button System"
          subtitle="Variants, sizes, icon combinations, and accessible interactive states."
        />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)', alignItems: 'center' }}>
          <Button variant="primary">Primary Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="ghost">Ghost Button</Button>
          <Button variant="danger">Danger Button</Button>
          <Button variant="primary" icon={<Sparkles size={16} />}>
            With Icon
          </Button>
          <Button
            variant="secondary"
            loading={buttonLoading}
            onClick={() => {
              setButtonLoading(true);
              setTimeout(() => setButtonLoading(false), 2000);
            }}
          >
            Click for Loading State
          </Button>
          <Button variant="primary" disabled>
            Disabled Button
          </Button>
          <Button variant="icon" aria-label="Audio sample">
            <Volume2 size={18} color="var(--color-primary)" />
          </Button>
        </div>
      </section>

      {/* 4. VOICE UI DESIGN LANGUAGE */}
      <section>
        <SectionHeader
          title="4. Voice UI Design Language"
          subtitle="Dynamic states: Ready, Listening, Processing, and Result with reactive waveform."
        />
        <Card variant="default" padding="lg">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-8)', alignItems: 'center' }}>
            {/* Interactive Recording Button Preview */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-4)', textAlign: 'center' }}>
              <RecordingButton
                state={voiceState}
                onToggle={toggleRecordingState}
                durationSeconds={duration}
              />
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                {(['ready', 'listening', 'processing', 'result'] as VoiceState[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => setVoiceState(st)}
                    style={{
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      background: voiceState === st ? 'var(--color-primary)' : 'var(--color-bg-subtle)',
                      color: voiceState === st ? '#fff' : 'var(--color-text-secondary)',
                      border: '1px solid var(--color-border)'
                    }}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Waveform & Audio Player */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <VoiceWaveform active={voiceState === 'listening'} height={54} />

              <AudioPlayer
                title="Model Speaker: RP British Accent"
                duration="0:32"
                isPlaying={isPlayingAudio}
                onTogglePlay={() => setIsPlayingAudio(!isPlayingAudio)}
                speed={audioSpeed}
                onSpeedChange={setAudioSpeed}
              />

              <MicrophonePermissionState status="granted" />
            </div>
          </div>
        </Card>
      </section>

      {/* 5. PROGRESS VISUALIZATION */}
      <section>
        <SectionHeader
          title="5. Progress Visualizations"
          subtitle="Circular progress, linear bars, skill breakdowns, and streak trackers."
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-6)' }}>
          <Card variant="default" padding="md" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
            <ProgressRing percentage={progressVal} sublabel="Overall Score" />
            <ProgressRing percentage={88} color="var(--color-accent)" sublabel="Pronunciation" />
            <ProgressRing percentage={72} color="var(--color-warning)" sublabel="Pace WPM" />
          </Card>

          <Card variant="default" padding="md">
            <h3 className="typography-h3" style={{ marginBottom: 'var(--space-3)' }}>Speech Skill Breakdown</h3>
            <SkillScoreBar label="Articulation Clarity" score={84} levelDescription="Upper Intermediate" />
            <SkillScoreBar label="Fluency & Connected Speech" score={68} levelDescription="Target Area" color="var(--color-accent)" />
            <SkillScoreBar label="Speaking Cadence" score={92} levelDescription="Mastered" color="var(--color-success)" />
          </Card>
        </div>
      </section>

      {/* 6. CARD SYSTEM & DASHBOARD COMPONENTS */}
      <section>
        <SectionHeader
          title="6. Reusable Card Components"
          subtitle="Interactive cards for statistics, daily practice, exercises, and vocabulary."
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Hero Continue Card */}
          <ContinuePracticeCard
            title="Today's Practice: R & L Clarity & Natural Flow"
            focusSound="R / L"
            stageProgress="Stage 2 of 6"
            durationEstimate="12 mins"
            buttonLabel="Start Today's Practice"
            onStart={() => {}}
          />

          {/* Stats Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
            <StatCard label="Current Streak" value="4 Days" sublabel="Longest: 12 days" icon={<Flame size={24} />} iconColor="var(--color-warning)" />
            <StatCard label="Practice Minutes" value="85 mins" sublabel="+15 mins today" icon={<Award size={24} />} iconColor="var(--color-primary)" />
            <StatCard label="Focus Sounds Practiced" value="3 Sounds" sublabel="TH & S/SH progressing" icon={<Target size={24} />} iconColor="var(--color-accent)" />
          </div>

          {/* Exercise & Vocabulary Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
            <ExerciseCard
              number={2}
              title="Tongue Twister Studio"
              description="Practice alternating between R and L sounds with clarity and consistent rhythm."
              category="Pronunciation"
              duration="2 mins"
              completed={false}
            />

            <VocabularyCard
              word="articulation"
              ipa="/ɑːˌtɪk.jʊˈleɪ.ʃən/"
              syllables="ar-tic-u-la-tion"
              definition="The clear and distinct formation of speech sounds in spoken language."
              partOfSpeech="noun"
              onPlayAudio={() => {}}
            />
          </div>
        </div>
      </section>

      {/* 7. SYSTEM STATES */}
      <section>
        <SectionHeader
          title="7. System Feedback States"
          subtitle="Loading, empty, and non-blocking error notice states."
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
          <Card variant="default" padding="md">
            <LoadingState message="Connecting speech engine..." height={140} />
          </Card>
          <EmptyState
            title="No Recorded Attempts Yet"
            description="Your spoken audio attempts and pronunciation feedback will appear here."
            actionLabel="Start First Exercise"
            onAction={() => {}}
          />
          <ErrorState
            title="Microphone Busy"
            message="Another browser tab is using the audio input. Please close it to record."
            onRetry={() => {}}
          />
        </div>
      </section>
    </div>
  );
};
