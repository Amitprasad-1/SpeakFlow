import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ContentValidator,
  READING_PASSAGES_CATALOG,
  PersonalizationEngine,
  PhonemeWeaknessTracker
} from '../dist/index.js';

test('ContentValidator word count accuracy', () => {
  const text = 'This is a test of five words.';
  assert.equal(ContentValidator.countWords(text), 7);
});

test('All catalog reading passages strictly satisfy 160-200 word count', () => {
  assert.ok(READING_PASSAGES_CATALOG.length >= 3, 'Should have at least 3 curated passages');

  for (const passage of READING_PASSAGES_CATALOG) {
    const actualWordCount = ContentValidator.countWords(passage.passageText);
    assert.ok(
      actualWordCount >= 160 && actualWordCount <= 200,
      `Passage "${passage.title}" has ${actualWordCount} words, which violates the 160-200 word rule.`
    );
    assert.equal(passage.wordCount, actualWordCount);

    const validation = ContentValidator.validateReadingPassage(passage);
    assert.ok(
      validation.isValid,
      `Passage "${passage.title}" failed validation: ${validation.errors.join(', ')}`
    );
    assert.equal(
      passage.vocabularyWords.length,
      6,
      `Passage "${passage.title}" must have exactly 6 vocabulary words.`
    );
  }
});

test('ContentValidator catches invalid word counts', () => {
  const shortPassage = {
    ...READING_PASSAGES_CATALOG[0],
    passageText: 'Too short passage with only a few words here.'
  };
  const val = ContentValidator.validateReadingPassage(shortPassage);
  assert.equal(val.isValid, false);
  assert.ok(val.errors.some(e => e.includes('word count violation')));
});

test('PersonalizationEngine prioritizes user weak phonemes in generated lesson', () => {
  const profile = PhonemeWeaknessTracker.createDefaultSkillProfile();
  profile.weakSounds = ['R_L', 'TH'];

  const lesson = PersonalizationEngine.generateLesson(profile, 'Intermediate');
  assert.ok(lesson);
  assert.equal(lesson.primaryFocusPhoneme, 'R_L');
  assert.ok(lesson.vocalWarmups.length >= 4);
  assert.ok(lesson.tongueTwisters.length >= 2);
  assert.ok(lesson.practicalSentences.length >= 10);
  assert.equal(lesson.readingPassage.vocabularyWords.length, 6);

  const lessonValidation = ContentValidator.validateDailyLesson(lesson);
  assert.ok(lessonValidation.isValid, `Daily lesson failed validation: ${lessonValidation.errors.join(', ')}`);
});
