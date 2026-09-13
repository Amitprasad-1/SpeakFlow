import React from 'react';
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
import { Clock, Award, Target, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

export interface HomeViewProps {
  user?: UserProfileData;
  lesson?: DailyLessonData;
  streak?: StreakData;
  progress?: ProgressSummaryData;
  wordOfTheDay?: VocabularyItem;
  onNavigateToPractice: () => void;
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
  onStartBaseline,
  baselineStatus
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      {/* Optional Baseline Completion Banner if skipped or in-progress */}
      {(baselineStatus === 'skipped' || baselineStatus === 'in_progress') && onStartBaseline && (
        <Card
          variant="default"
          padding="md"
          style={{
            background: 'var(--color-primary-subtle)',
            border: '1px solid var(--color-primary)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 'var(--space-3)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <Sparkles size={20} color="var(--color-primary)" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                {baselineStatus === 'in_progress' ? 'Resume Your English Baseline' : 'Personalize Your English Baseline'}
              </div>
              <p style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                Complete a quick 3-minute speaking check to further tune your daily practice plan.
              </p>
            </div>
          </div>
          <button
            onClick={onStartBaseline}
            className="speakflow-btn btn-variant-primary"
            style={{
              padding: 'var(--space-2) var(--space-4)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-body-sm)',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {baselineStatus === 'in_progress' ? 'Resume Baseline' : 'Complete Baseline'}
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
        title={lesson.title}
        focusSound={lesson.focusSound}
        stageProgress={lesson.stageProgress}
        durationEstimate={lesson.durationEstimate}
        buttonLabel="Start Today's Practice"
        onStart={onNavigateToPractice}
      />

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
