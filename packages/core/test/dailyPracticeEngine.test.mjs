import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  DailyPracticeEngine,
  ContentHistoryManager,
  ContentValidator,
  PhonemeWeaknessTracker
} from '../dist/index.js';

describe('DailyPracticeEngine & Content Validation (Prompt 4 Requirements)', () => {
  const dummyProfile = {
    id: 'user_test_42',
    name: 'Test Learner',
    goals: ['Workplace communication', 'Speaking'],
    level: 'Intermediate',
    dailyGoalMinutes: 15,
    createdAt: '2026-09-01T00:00:00Z',
    isOnboarded: true,
    baselineAssessmentCompleted: true,
    skills: PhonemeWeaknessTracker.createDefaultSkillProfile(),
    streak: {
      currentStreak: 3,
      longestStreak: 5,
      lastPracticeDate: '2026-09-12'
    },
    totalMinutesPracticed: 45,
    completedLessonsCount: 3
  };

  it('generates a valid 6-stage session tied to the local date', () => {
    const session = DailyPracticeEngine.createDailySession(dummyProfile, '2026-09-13');

    assert.strictEqual(session.localDate, '2026-09-13');
    assert.strictEqual(session.stages.length, 6);
    assert.strictEqual(session.status, 'not_started');
    assert.strictEqual(session.estimatedDuration, 15);

    // Validate full payload using strict ContentValidator
    const validation = ContentValidator.validateDailyPracticeSession(session);
    assert.strictEqual(validation.isValid, true, `Validation errors: ${validation.errors.join('; ')}`);
  });

  it('strictly validates reading passage word count (160 to 200 words) and 6 vocabulary items', () => {
    const session = DailyPracticeEngine.createDailySession(dummyProfile, '2026-09-13');
    const readingStage = session.stages.find((s) => s.type === 'reading_aloud');
    assert.ok(readingStage, 'Reading aloud stage must be present');

    const passage = readingStage.data.passage;
    assert.ok(passage, 'Reading passage must exist');

    const wordCount = ContentValidator.countWords(passage.passageText);
    assert.ok(wordCount >= 160, `Reading passage has ${wordCount} words, expected >= 160`);
    assert.ok(wordCount <= 200, `Reading passage has ${wordCount} words, expected <= 200`);

    assert.strictEqual(passage.vocabularyWords.length, 6, 'Reading passage must contain exactly 6 vocabulary words');
    for (const vocab of passage.vocabularyWords) {
      assert.ok(vocab.word && vocab.word.length > 0, 'Vocab word must have text');
      assert.ok(vocab.phoneticIpa, 'Vocab must have phonetic guide');
      assert.ok(vocab.definition, 'Vocab must have definition');
    }
  });

  it('strictly enforces 10 to 15 practical sentences per session', () => {
    const session = DailyPracticeEngine.createDailySession(dummyProfile, '2026-09-13');
    const sentencesStage = session.stages.find((s) => s.type === 'practical_sentences');
    assert.ok(sentencesStage, 'Practical sentences stage must be present');

    const sentences = sentencesStage.data.sentences;
    assert.ok(sentences.length >= 10, `Practical sentences count ${sentences.length} must be >= 10`);
    assert.ok(sentences.length <= 15, `Practical sentences count ${sentences.length} must be <= 15`);
  });

  it('strictly enforces 2 to 3 vocal warmups and 3 to 5 tongue twisters', () => {
    const session = DailyPracticeEngine.createDailySession(dummyProfile, '2026-09-13');

    const warmupStage = session.stages[0];
    assert.strictEqual(warmupStage.type, 'vocal_warmup');
    assert.ok(warmupStage.data.exercises.length >= 2 && warmupStage.data.exercises.length <= 3);

    const twisterStage = session.stages[1];
    assert.strictEqual(twisterStage.type, 'tongue_twisters');
    assert.ok(twisterStage.data.twisters.length >= 3 && twisterStage.data.twisters.length <= 5);
  });

  it('ensures no duplicate exercise IDs exist within a single daily session', () => {
    const session = DailyPracticeEngine.createDailySession(dummyProfile, '2026-09-13');
    const allIds = [];

    session.stages[0].data.exercises.forEach((w) => allIds.push(w.id));
    session.stages[1].data.twisters.forEach((t) => allIds.push(t.id));
    allIds.push(session.stages[2].data.passage.id);
    session.stages[3].data.sentences.forEach((s) => allIds.push(s.id));
    session.stages[4].data.prompts.forEach((p) => allIds.push(p.id));
    allIds.push(session.stages[5].data.exercise.id);

    const uniqueIds = new Set(allIds);
    assert.strictEqual(uniqueIds.size, allIds.length, 'There must be zero duplicate IDs inside a session');
  });

  it('multi-day test: verifies consecutive days produce differing, fresh content with ContentHistoryManager', () => {
    const historyManager = new ContentHistoryManager();

    // Day 1
    const day1Session = DailyPracticeEngine.createDailySession(dummyProfile, '2026-09-13', historyManager);
    historyManager.recordSession('2026-09-13', {
      readingPassageId: day1Session.stages[2].data.passage.id,
      tongueTwisterIds: day1Session.stages[1].data.twisters.map((t) => t.id),
      sentenceIds: day1Session.stages[3].data.sentences.map((s) => s.id),
      themeTopic: day1Session.lessonTheme
    });

    // Day 2
    const day2Session = DailyPracticeEngine.createDailySession(dummyProfile, '2026-09-14', historyManager);
    historyManager.recordSession('2026-09-14', {
      readingPassageId: day2Session.stages[2].data.passage.id,
      tongueTwisterIds: day2Session.stages[1].data.twisters.map((t) => t.id),
      sentenceIds: day2Session.stages[3].data.sentences.map((s) => s.id),
      themeTopic: day2Session.lessonTheme
    });

    // Day 3
    const day3Session = DailyPracticeEngine.createDailySession(dummyProfile, '2026-09-15', historyManager);

    // Reading passage must differ across consecutive days
    assert.notStrictEqual(
      day1Session.stages[2].data.passage.id,
      day2Session.stages[2].data.passage.id,
      'Day 1 and Day 2 passages must differ'
    );
    assert.notStrictEqual(
      day2Session.stages[2].data.passage.id,
      day3Session.stages[2].data.passage.id,
      'Day 2 and Day 3 passages must differ'
    );

    // Sessions are unique across days
    assert.notStrictEqual(day1Session.sessionId, day2Session.sessionId);
    assert.notStrictEqual(day2Session.sessionId, day3Session.sessionId);
  });

  it('streak logic: partial practice does NOT update streak; full completion increments streak correctly', () => {
    let session = DailyPracticeEngine.createDailySession(dummyProfile, '2026-09-13');

    // Complete only stage 1
    session = DailyPracticeEngine.completeStage(session, 1, { status: 'passed' });
    assert.strictEqual(session.status, 'in_progress');
    assert.strictEqual(session.completionPercentage < 80, true);

    const profileAfterStage1 = DailyPracticeEngine.applySessionCompletion(session, dummyProfile, 2);
    assert.strictEqual(profileAfterStage1.streak.currentStreak, 3, 'Streak should NOT advance for incomplete practice');

    // Complete all remaining stages
    session = DailyPracticeEngine.completeStage(session, 2, { status: 'passed' });
    session = DailyPracticeEngine.completeStage(session, 3, { status: 'passed' });
    session = DailyPracticeEngine.completeStage(session, 4, { status: 'passed' });
    session = DailyPracticeEngine.completeStage(session, 5, { status: 'passed' });
    session = DailyPracticeEngine.completeStage(session, 6, { status: 'passed' });

    assert.strictEqual(session.status, 'completed');
    assert.strictEqual(session.completionPercentage, 100);

    const profileAfterCompletion = DailyPracticeEngine.applySessionCompletion(session, dummyProfile, 15);
    // Last practice was 2026-09-12 (yesterday relative to 2026-09-13), so currentStreak moves from 3 to 4
    assert.strictEqual(profileAfterCompletion.streak.currentStreak, 4, 'Streak must increment to 4 after completed daily practice');
    assert.strictEqual(profileAfterCompletion.streak.lastPracticeDate, '2026-09-13');
    assert.strictEqual(profileAfterCompletion.totalMinutesPracticed, 60);
    assert.strictEqual(profileAfterCompletion.completedLessonsCount, 4);
  });
});
