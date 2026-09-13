import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  AdaptiveIntelligenceEngine,
  ConversationEngine,
  ProgressAnalyticsEngine,
  PhonemeWeaknessTracker
} from '../dist/index.js';

describe('Prompt 5 Intelligence Engines & Coaching Verification', () => {
  const dummyProfile = {
    id: 'learner_101',
    name: 'Test Learner',
    goals: ['Workplace English', 'Speaking'],
    level: 'Intermediate',
    dailyGoalMinutes: 15,
    createdAt: '2026-09-01T00:00:00Z',
    isOnboarded: true,
    baselineAssessmentCompleted: true,
    skills: PhonemeWeaknessTracker.createDefaultSkillProfile(),
    streak: {
      currentStreak: 4,
      longestStreak: 7,
      lastPracticeDate: '2026-09-13'
    },
    totalMinutesPracticed: 60,
    completedLessonsCount: 4,
    speakingConfidence: 'Growing'
  };

  it('AdaptiveIntelligenceEngine analyzes spontaneous speech and produces structured coaching feedback', () => {
    const prompt = 'Could you explain a situation where unexpected obstacles arose?';
    const transcript = 'Actually we had a big obstacle during deployment because of server downtime. I have a doubt regarding how to fix it, so we met together.';
    const durationMs = 12000;

    const report = AdaptiveIntelligenceEngine.analyzeSpontaneousSpeech(
      'prompt_1',
      prompt,
      transcript,
      durationMs
    );

    // Verify observed metrics separation
    assert.strictEqual(report.observedMetrics.wordCount > 15, true);
    assert.strictEqual(report.observedMetrics.durationSeconds, 12);
    assert.ok(report.observedMetrics.estimatedWpm, 'Estimated WPM should be computed');
    assert.ok(report.observedMetrics.observedFillerWords.includes('actually'));

    // Verify 1 strength, 1-2 improvement points, 1 natural alternative
    assert.ok(report.coachingFeedback.strength.length > 0, 'Must provide 1 clear strength');
    assert.ok(
      report.coachingFeedback.improvementPoints.length >= 1 &&
      report.coachingFeedback.improvementPoints.length <= 2,
      'Must provide 1 to 2 actionable improvement points'
    );
    assert.ok(
      report.coachingFeedback.naturalAlternative.suggestedAlternative.includes('question') ||
      report.coachingFeedback.naturalAlternative.suggestedAlternative.length > 0,
      'Must provide a natural workplace alternative'
    );
    assert.ok(report.coachingFeedback.nextPracticeSuggestion.length > 0);
  });

  it('AdaptiveIntelligenceEngine progresses learning memory through competency stages', () => {
    let memory = AdaptiveIntelligenceEngine.createDefaultMemory('learner_101');
    assert.strictEqual(memory.pronunciationHistory['R_L'].status, 'new');

    const dummySession = {
      sessionId: 'session_1',
      userId: 'learner_101',
      localDate: '2026-09-13',
      createdAt: '2026-09-13T10:00:00Z',
      lessonTitle: 'R/L Mastery',
      lessonTheme: 'Workplace',
      estimatedDuration: 15,
      focusAreas: ['R/L'],
      focusSounds: ['R_L'],
      stages: [],
      currentStageIndex: 5,
      status: 'completed',
      totalElapsedSeconds: 900,
      completionPercentage: 100,
      stageResults: {}
    };

    // Practice 1 time -> developing
    memory = AdaptiveIntelligenceEngine.updateLearningMemory(memory, dummySession, [
      {
        id: 'v1',
        word: 'collaboration',
        phoneticIpa: '/kəˌlæb.əˈreɪ.ʃən/',
        syllableBreakdown: 'col-lab-o-ra-tion',
        primaryStressSyllable: 4,
        definition: 'Working together with others',
        partOfSpeech: 'noun',
        exampleInPassage: 'Great collaboration.',
        collocations: []
      }
    ]);
    assert.strictEqual(memory.pronunciationHistory['R_L'].status, 'developing');
    assert.strictEqual(memory.vocabularyBank.length, 1);
    assert.strictEqual(memory.vocabularyBank[0].word, 'collaboration');

    // Simulate multiple sessions up to 4 -> improving
    for (let i = 0; i < 3; i++) {
      memory = AdaptiveIntelligenceEngine.updateLearningMemory(memory, dummySession);
    }
    assert.strictEqual(memory.pronunciationHistory['R_L'].status, 'improving');

    // Simulate up to 7 -> stable
    for (let i = 0; i < 3; i++) {
      memory = AdaptiveIntelligenceEngine.updateLearningMemory(memory, dummySession);
    }
    assert.strictEqual(memory.pronunciationHistory['R_L'].status, 'stable');
  });

  it('ConversationEngine manages interactive multi-turn sessions and post-conversation reviews', () => {
    const session = ConversationEngine.startSession('interview');
    assert.strictEqual(session.mode, 'interview');
    assert.strictEqual(session.messages.length, 1);
    assert.strictEqual(session.messages[0].sender, 'ai');

    // Turn 1
    const turn1 = ConversationEngine.processUserTurn(
      session,
      'I led our engineering team through a complex database migration under a tight deadline.'
    );
    assert.strictEqual(turn1.updatedSession.messages.length, 3);
    assert.strictEqual(turn1.replyMessage.sender, 'ai');
    assert.ok(turn1.replyMessage.text.includes('elaborate') || turn1.replyMessage.text.includes('challenge'));

    // Generate Review
    const review = ConversationEngine.generateReviewReport(turn1.updatedSession);
    assert.strictEqual(review.mode, 'interview');
    assert.ok(review.keyStrengths.length > 0);
    assert.ok(review.patternsToImprove.length > 0);
    assert.ok(review.usefulPhrases.length > 0);
    assert.ok(review.nextStepRecommendation.length > 0);
  });

  it('ProgressAnalyticsEngine honestly calculates data-backed progress without vanity numbers', () => {
    // 1. New user with zero practice -> hasSufficientData: false
    const freshUser = { ...dummyProfile, totalMinutesPracticed: 0, completedLessonsCount: 0 };
    const emptyMetrics = ProgressAnalyticsEngine.calculateProgress(freshUser, []);
    assert.strictEqual(emptyMetrics.hasSufficientData, false);
    assert.ok(emptyMetrics.trendInsights[0].includes('Complete your first daily session'));

    // 2. Active learner with completed practice
    const activeMetrics = ProgressAnalyticsEngine.calculateProgress(dummyProfile, [
      {
        sessionId: 's1',
        userId: 'learner_101',
        localDate: '2026-09-13',
        createdAt: '2026-09-13T10:00:00Z',
        lessonTitle: 'Session',
        lessonTheme: 'AI',
        estimatedDuration: 15,
        focusAreas: [],
        focusSounds: ['R_L'],
        stages: [],
        currentStageIndex: 5,
        status: 'completed',
        totalElapsedSeconds: 900,
        completionPercentage: 100,
        stageResults: {}
      }
    ]);
    assert.strictEqual(activeMetrics.hasSufficientData, true);
    assert.strictEqual(activeMetrics.totalPracticeMinutes, 60);
    assert.strictEqual(activeMetrics.completedSessionsCount, 4);
    assert.strictEqual(activeMetrics.currentStreakDays, 4);
    assert.strictEqual(activeMetrics.weeklyPracticeDistribution.length, 7);
  });
});
