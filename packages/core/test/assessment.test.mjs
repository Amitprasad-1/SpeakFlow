import test from 'node:test';
import assert from 'node:assert/strict';
import {
  AssessmentEngine,
  BASELINE_SPEAKING_PROMPTS,
  BASELINE_READING_PASSAGE,
  BASELINE_PRONUNCIATION_PAIRS,
  BASELINE_VOCAL_WARMUPS,
  ContentValidator
} from '../dist/index.js';

test('Baseline Catalogs integrity', () => {
  // 1. Prompts
  assert.ok(BASELINE_SPEAKING_PROMPTS.length >= 2, 'Should have at least 2 speaking prompts');
  assert.ok(BASELINE_SPEAKING_PROMPTS[0].promptText.length > 0);

  // 2. Reading passage word count: 80 - 120 words
  const passageWords = ContentValidator.countWords(BASELINE_READING_PASSAGE.passageText);
  assert.ok(
    passageWords >= 80 && passageWords <= 120,
    `Baseline reading passage has ${passageWords} words, which must be strictly between 80 and 120 words.`
  );

  // 3. Pronunciation pairs
  assert.ok(BASELINE_PRONUNCIATION_PAIRS.length >= 4, 'Should test at least 4 pronunciation pairs');
  const soundGroups = BASELINE_PRONUNCIATION_PAIRS.map(p => p.soundGroup);
  assert.ok(soundGroups.includes('R_L'));
  assert.ok(soundGroups.includes('TH'));

  // 4. Vocal warmups
  assert.ok(BASELINE_VOCAL_WARMUPS.length >= 2, 'Should have at least 2 friendly vocal warmups');
});

test('AssessmentEngine evaluates spontaneous speaking with honest metric observation', () => {
  const prompt = BASELINE_SPEAKING_PROMPTS[0];
  const transcript = 'Hello, my name is Priya. I am a software engineer and I want to communicate more confidently with my global team.';
  const durationMs = 8000; // 8 seconds

  const result = AssessmentEngine.evaluateSpeakingAttempt(prompt, transcript, durationMs);

  assert.equal(result.promptId, prompt.id);
  assert.equal(result.transcript.status, 'observed');
  assert.equal(result.durationMs.status, 'observed');
  assert.equal(result.wordCount.status, 'observed');
  assert.ok(result.wordCount.value >= 15);
  assert.equal(result.wordsPerMinute.status, 'observed');
  assert.ok(result.wordsPerMinute.value >= 100);
  assert.equal(result.pausesDetected.status, 'estimated');
  assert.ok(result.observedStrengths.length > 0);
  assert.ok(result.observedOpportunities.length > 0);
});

test('AssessmentEngine handles empty or unavailable speaking gracefully', () => {
  const prompt = BASELINE_SPEAKING_PROMPTS[0];
  const result = AssessmentEngine.evaluateSpeakingAttempt(prompt, '', 0);

  assert.equal(result.transcript.status, 'unavailable');
  assert.equal(result.wordCount.value, 0);
  assert.equal(result.wordsPerMinute.status, 'unavailable');
});

test('AssessmentEngine evaluates reading aloud and calculates completion and pace', () => {
  const passage = BASELINE_READING_PASSAGE;
  // Partial spoken transcript
  const transcript = 'Clear communication is not about using complex vocabulary or speaking very quickly. In everyday life and at work, the most effective speakers speak with a calm, steady rhythm.';
  const durationMs = 12000;

  const result = AssessmentEngine.evaluateReadingAttempt(passage, transcript, durationMs);

  assert.equal(result.passageId, passage.id);
  assert.equal(result.wordsRead.status, 'observed');
  assert.ok(result.wordsRead.value >= 20);
  assert.equal(result.completionRate.status, 'estimated');
  assert.ok(result.completionRate.value > 0 && result.completionRate.value <= 100);
  assert.ok(result.observedStrengths.length > 0);
});

test('AssessmentEngine evaluates pronunciation pair matching', () => {
  const result1 = AssessmentEngine.evaluatePronunciationAttempt('R_L', ['red', 'led'], 'I see the red light and led the way');
  assert.equal(result1.matchStatus.value, 'matched');

  const result2 = AssessmentEngine.evaluatePronunciationAttempt('R_L', ['rice', 'lice'], 'I only eat warm rice');
  assert.equal(result2.matchStatus.value, 'developing');

  const result3 = AssessmentEngine.evaluatePronunciationAttempt('TH', ['think', 'sink'], '');
  assert.equal(result3.matchStatus.status, 'unavailable');
});

test('AssessmentEngine builds personalized starting profile and recommendations', () => {
  const mockAssessment = {
    assessmentId: 'test_asmt_1',
    userId: 'usr_test',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'completed',
    currentStep: 10,
    name: 'Sarah',
    preferredLanguage: 'Spanish',
    selfReportedLevel: 'Intermediate',
    goals: ['Job interviews', 'Workplace communication'],
    contexts: ['workplace', 'job_interviews'],
    dailyPracticePreference: 15,
    speakingConfidence: 'okay',
    pronunciationAssessment: {
      items: [
        AssessmentEngine.evaluatePronunciationAttempt('R_L', ['red', 'led'], 'led led'),
        AssessmentEngine.evaluatePronunciationAttempt('TH', ['think', 'sink'], 'think sink')
      ],
      testedSoundGroups: ['R_L', 'TH'],
      priorityFocusSounds: ['R_L']
    }
  };

  const focus = AssessmentEngine.createInitialFocusAreas(mockAssessment);
  assert.ok(focus.strengths.length >= 3);
  assert.ok(focus.focusAreas.length >= 3);
  assert.equal(focus.primarySound, 'R_L');

  const plan = AssessmentEngine.createInitialPracticePlan(mockAssessment);
  assert.equal(plan.durationMinutes, 15);
  assert.equal(plan.activitiesCount, 6);
  assert.equal(plan.primarySound, 'R_L');

  const profile = AssessmentEngine.buildInitialLearnerProfile(mockAssessment);
  assert.equal(profile.name, 'Sarah');
  assert.equal(profile.level, 'Intermediate');
  assert.equal(profile.dailyGoalMinutes, 15);
  assert.equal(profile.skills.weakSounds[0], 'R_L');
  assert.ok(profile.strengthsSummary.length >= 3);
  assert.ok(profile.focusAreasSummary.length >= 3);
});

test('AssessmentEngine sanitizes legacy demo names to Learner', () => {
  const assessmentWithLegacyName = {
    assessmentId: 'test_legacy',
    userId: 'usr_legacy',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'completed',
    currentStep: 10,
    name: 'Alex Chen',
    preferredLanguage: 'English',
    selfReportedLevel: 'Intermediate',
    goals: ['Speaking'],
    contexts: ['workplace'],
    dailyPracticePreference: 15,
    speakingConfidence: 'okay'
  };

  const profile = AssessmentEngine.buildInitialLearnerProfile(assessmentWithLegacyName);
  assert.equal(profile.name, 'Learner', 'Legacy "Alex Chen" must be sanitized to "Learner"');

  const profileShortAlex = AssessmentEngine.buildInitialLearnerProfile({
    ...assessmentWithLegacyName,
    name: 'Alex'
  });
  assert.equal(profileShortAlex.name, 'Learner', 'Legacy "Alex" must be sanitized to "Learner"');
});

