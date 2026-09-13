import {
  DailyLesson,
  UserSkillProfile,
  PassageTopic,
  PhonemeCategory,
  EnglishLevel
} from '../types/index.js';
import { VOCAL_WARMUPS_CATALOG } from '../domain/vocalWarmups.js';
import { TONGUE_TWISTERS_CATALOG } from '../domain/tongueTwisters.js';
import { READING_PASSAGES_CATALOG } from '../domain/readingPassages.js';
import { getSentencesForCategory } from '../domain/practiceSentences.js';
import { SPEAKING_SCENARIOS_CATALOG } from '../domain/speakingScenarios.js';
import { LISTENING_EXERCISES_CATALOG } from '../domain/listeningExercises.js';
import { ContentValidator } from '../validation/ContentValidator.js';

export class PersonalizationEngine {
  /**
   * Generates a fully personalized Daily Practice Lesson tailored to the learner's weaknesses.
   */
  public static generateLesson(
    profile: UserSkillProfile,
    targetLevel: EnglishLevel = 'Intermediate',
    preferredTopic?: PassageTopic
  ): DailyLesson {
    // 1. Identify primary & secondary focus weak sounds
    const primaryWeakness = profile.weakSounds[0] || 'R_L';
    const secondaryWeakness = profile.weakSounds[1] || 'S_SH';

    // 2. Select Vocal Warmups (tailored: tongue trill if R_L is weak)
    const warmups = [...VOCAL_WARMUPS_CATALOG];
    if (primaryWeakness === 'R_L') {
      // Prioritize Tongue Trill / Rolled R
      const tongueTrill = warmups.find(w => w.type === 'tongue_trill');
      if (tongueTrill) {
        warmups.splice(warmups.indexOf(tongueTrill), 1);
        warmups.unshift(tongueTrill);
      }
    }

    // 3. Select Tongue Twisters targeting weak sounds
    const twisters = TONGUE_TWISTERS_CATALOG.filter(
      t => t.category === primaryWeakness || t.category === secondaryWeakness
    );
    // If not enough twisters found for specific weak categories, add general clusters/rapid
    if (twisters.length < 2) {
      const fallback = TONGUE_TWISTERS_CATALOG.filter(
        t => t.category === 'CONSONANT_CLUSTERS' || t.category === 'RAPID_SPEECH'
      );
      twisters.push(...fallback.slice(0, 2 - twisters.length));
    }

    // 4. Select Reading Passage (strictly 160 - 200 words, matching preferredTopic or rotating)
    let selectedPassage = READING_PASSAGES_CATALOG.find(
      p => preferredTopic ? p.topic === preferredTopic : p.targetPhonemes.includes(primaryWeakness)
    );
    if (!selectedPassage) {
      selectedPassage = READING_PASSAGES_CATALOG[0];
    }

    // 5. Select 10-15 Practical Sentences targeting the weak phoneme
    const sentences = getSentencesForCategory(primaryWeakness);

    // 6. Select Speaking Scenario
    const scenarioIndex = Math.floor(Math.random() * SPEAKING_SCENARIOS_CATALOG.length);
    const scenario = SPEAKING_SCENARIOS_CATALOG[scenarioIndex] || SPEAKING_SCENARIOS_CATALOG[0];

    // 7. Select Listening Exercise
    const listening = LISTENING_EXERCISES_CATALOG[0];

    const todayStr = new Date().toISOString().split('T')[0];

    const lesson: DailyLesson = {
      id: `lesson_${todayStr}_${primaryWeakness.toLowerCase()}`,
      date: todayStr,
      title: `Daily Mastery: Articulation & ${primaryWeakness.replace('_', ' / ')} Precision`,
      themeTopic: selectedPassage.topic,
      primaryFocusPhoneme: primaryWeakness,
      secondaryFocusPhoneme: secondaryWeakness,
      targetLevel,
      vocalWarmups: warmups,
      tongueTwisters: twisters.slice(0, 2),
      readingPassage: selectedPassage,
      practicalSentences: sentences,
      speakingChallenge: scenario,
      listeningExercise: listening,
      isCompleted: false
    };

    // Strict validation
    const validation = ContentValidator.validateDailyLesson(lesson);
    if (!validation.isValid) {
      console.warn('Daily lesson generated with validation warnings:', validation.errors);
    }

    return lesson;
  }
}
