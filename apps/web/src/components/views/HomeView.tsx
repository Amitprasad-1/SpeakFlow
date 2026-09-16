import React, { useMemo } from 'react';
import {
  ContinuePracticeCard,
  StatCard,
  StreakCard,
  ExerciseCard,
  VocabularyCard,
  SectionHeader,
  Badge,
  Card
} from '../../design-system';
import {
  demoUser,
  demoDailyLesson,
  demoStreak,
  demoProgress,
  demoWordOfTheDay,
  UserProfileData,
  DailyLessonData,
  StreakData,
  ProgressSummaryData,
  VocabularyItem
} from '../../data/demoData';
import { BrowserStorage } from '../../storage/BrowserStorage';
import { DailyPracticeSession } from '@speakflow/core';
import { Clock, Award, Target, Sparkles, ArrowRight, CheckCircle2, MessageSquare, Languages } from 'lucide-react';
import { QuickSpeechLab } from '../home/QuickSpeechLab';

export interface HomeViewProps {
  user?: UserProfileData;
  lesson?: DailyLessonData;
  streak?: StreakData;
  progress?: ProgressSummaryData;
  wordOfTheDay?: VocabularyItem;
  onNavigateToPractice: () => void;
  onNavigateToConversation?: () => void;
  onNavigateToPhrases?: () => void;
  onStartBaseline?: () => void;
  baselineStatus?: 'completed' | 'in_progress' | 'skipped' | 'not_started';
}

export const HomeView: React.FC<HomeViewProps> = ({
  user = demoUser,
  lesson = demoDailyLesson,
  streak = demoStreak,
  progress = demoProgress,
  wordOfTheDay = demoWordOfTheDay,
  onNavigateToPractice,
  onNavigateToConversation,
  onNavigateToPhrases,
  onStartBaseline,
  baselineStatus
}) => {
  // Query today's real session state if available in BrowserStorage
  const realSession: DailyPracticeSession | null = useMemo(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;
    return BrowserStorage.getDailySession(todayStr);
  }, []);

  const completedCount = useMemo(() => {
    if (!realSession) return 0;
    return realSession.stages.filter((s) => s.isCompleted || s.isSkipped).length;
  }, [realSession]);

  const practiceButtonLabel = useMemo(() => {
    if (!realSession || realSession.status === 'not_started') {
      return "Start Today's Practice";
    }
    if (realSession.status === 'completed') {
      return "Review Today's Practice";
    }
    return "Continue Today's Practice";
  }, [realSession]);

  const sessionTitle = realSession ? realSession.lessonTitle : lesson.title;
  const focusSound = realSession?.focusSounds[0] ? realSession.focusSounds[0].replace('_', ' / ') : lesson.focusSound;
  const stageProgress = realSession ? `${completedCount} of ${realSession.stages.length} completed` : lesson.stageProgress;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      {/* Secondary Baseline Assessment Entry */}
      {onStartBaseline && (
        <Card
          variant="default"
          padding="md"
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 'var(--space-3)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <Sparkles size={18} color="var(--color-primary)" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: 'var(--text-body)', color: 'var(--color-text-primary)' }}>
                {baselineStatus === 'in_progress'
                  ? 'Your baseline assessment is in progress'
                  : baselineStatus === 'completed'
                  ? 'Baseline assessment completed'
                  : 'Personalize your English baseline'}
              </div>
              <p style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                {baselineStatus === 'completed'
                  ? 'You can retake the assessment anytime to recalibrate your focus sounds.'
                  : 'Complete a quick 3-minute speaking check to personalize your daily practice plan.'}
              </p>
            </div>
          </div>
          <button
            onClick={onStartBaseline}
            className="speakflow-btn btn-variant-secondary"
            style={{
              padding: 'var(--space-2) var(--space-3-5)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-body-sm)',
              fontWeight: 600,
              cursor: 'pointer'
            }}
            id="btn-home-baseline"
          >
            {baselineStatus === 'in_progress'
              ? 'Resume Baseline'
              : baselineStatus === 'completed'
              ? 'Retake Assessment'
              : 'Take Baseline Assessment'}
          </button>
        </Card>
      )}
      {/* 1. Welcoming & Clear Orientation Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
          <Sparkles size={16} color="var(--color-primary)" />
          <span
            style={{
              fontSize: 'var(--text-caption)',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: 'var(--color-primary)',
              letterSpacing: '0.06em'
            }}
          >
            Daily Practice Session
          </span>
        </div>
        <h1 className="typography-h1">
          Welcome back, {user.name}
        </h1>
        <p className="typography-body" style={{ marginTop: 'var(--space-1)', maxWidth: '64ch' }}>
          {lesson.coachNote}
        </p>
      </div>

      {/* 2. Priority 1 & 2: What should I practice today? (Visual Focal Point) */}
      <ContinuePracticeCard
        title={sessionTitle}
        focusSound={focusSound}
        stageProgress={stageProgress}
        durationEstimate={realSession ? `${realSession.estimatedDuration} mins` : lesson.durationEstimate}
        buttonLabel={practiceButtonLabel}
        onStart={onNavigateToPractice}
      />

      {/* AI Coach Studio Quick Access */}
      {onNavigateToConversation && (
        <Card
          variant="conversation"
          padding="md"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 'var(--space-3)',
            background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.06) 0%, rgba(16, 185, 129, 0.06) 100%)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 'var(--radius-md)',
                background: 'rgba(37, 99, 235, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-primary)'
              }}
            >
              <MessageSquare size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <span style={{ fontWeight: 700, fontSize: 'var(--text-body)', color: 'var(--color-text-primary)' }}>
                  Conversational AI Coach Studio
                </span>
                <Badge variant="primary" size="sm">Interactive</Badge>
              </div>
              <p className="typography-caption" style={{ color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                Practice simulated job interviews, workplace dialogues, and spontaneous speaking with instant natural feedback.
              </p>
            </div>
          </div>
          <button
            onClick={onNavigateToConversation}
            className="speakflow-btn btn-variant-secondary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: 'var(--space-2) var(--space-4)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-body-sm)',
              fontWeight: 600,
              cursor: 'pointer'
            }}
            id="btn-home-ai-coach"
          >
            <span>Start Conversation</span>
            <ArrowRight size={16} />
          </button>
        </Card>
      )}

      {/* Everyday Hindi-to-English Spoken Expressions Card */}
      {onNavigateToPhrases && (
        <Card
          variant="default"
          padding="md"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 'var(--space-3)',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.07) 0%, rgba(239, 68, 68, 0.05) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.25)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 'var(--radius-md)',
                background: 'rgba(245, 158, 11, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#f59e0b'
              }}
            >
              <Languages size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <span style={{ fontWeight: 700, fontSize: 'var(--text-body)', color: 'var(--color-text-primary)' }}>
                  Everyday Spoken Phrases (हिंदी ➔ English)
                </span>
                <Badge variant="warning" size="sm">520+ Phrases</Badge>
              </div>
              <p className="typography-caption" style={{ color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                Master instant spoken English for real-life Hindi expressions ("मुझ पर हुक्म मत चलाओ", "बात खत्म", "दूर रहो").
              </p>
            </div>
          </div>
          <button
            onClick={onNavigateToPhrases}
            className="speakflow-btn btn-variant-secondary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: 'var(--space-2) var(--space-4)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-body-sm)',
              fontWeight: 600,
              cursor: 'pointer'
            }}
            id="btn-home-phrases"
          >
            <span>Practice Phrases</span>
            <ArrowRight size={16} />
          </button>
        </Card>
      )}

      {/* 60-Second Interactive Speech Lab */}
      <QuickSpeechLab />

      {/* 3. Priority 3: Today's Progress & Consistency */}
      <section>
        <SectionHeader
          title="Today's Progress"
          subtitle="Consistency is the key to natural spoken English."
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
          <StreakCard
            currentStreak={streak.currentStreak}
            longestStreak={streak.longestStreak}
            todayCompleted={streak.todayCompleted}
          />
          <StatCard
            label="Practice Time"
            value={`${progress.minutesPracticedToday} / ${user.dailyGoalMinutes} mins`}
            sublabel="Daily target commitment"
            icon={<Clock size={22} />}
            iconColor="var(--color-primary)"
          />
          <StatCard
            label="Completed Sessions"
            value={`${progress.completedSessionsCount} sessions`}
            sublabel={`${progress.totalMinutesPracticed} total minutes`}
            icon={<Award size={22} />}
            iconColor="var(--color-accent)"
          />
        </div>
      </section>

      {/* 4. Priority 4: Session Steps Overview */}
      <section>
        <SectionHeader
          title="Today's Practice Steps"
          subtitle="Six short exercises designed to improve pronunciation, rhythm, and confidence."
          actionLabel="Open Practice Studio"
          onAction={onNavigateToPractice}
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: 'var(--space-4)' }}>
          {lesson.stages.map((stage) => (
            <ExerciseCard
              key={stage.number}
              number={stage.number}
              title={stage.title}
              description={stage.description}
              category={stage.category}
              duration={stage.duration}
              completed={stage.completed}
              onSelect={onNavigateToPractice}
            />
          ))}
        </div>
      </section>

      {/* 5. Useful Learning Asset: Articulation Word of the Day */}
      <section>
        <SectionHeader
          title="Word of the Day"
          subtitle="A practical multisyllabic word to help you practice clear enunciation."
        />
        <VocabularyCard
          word={wordOfTheDay.word}
          ipa={wordOfTheDay.ipa}
          syllables={wordOfTheDay.syllables}
          definition={wordOfTheDay.definition}
          partOfSpeech={wordOfTheDay.partOfSpeech}
          onPlayAudio={() => {}}
        />
      </section>
    </div>
  );
};
