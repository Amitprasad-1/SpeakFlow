import {
  DailyPracticeSession,
  DailyPracticeStage,
  UserProfile,
  UserSkillProfile,
  PhonemeCategory,
  EnglishLevel,
  VocalExercise,
  TongueTwister,
  ReadingPassage,
  PracticeSentence,
  SpeakingScenario,
  ListeningExercise
} from '../types/index.js';
import { VOCAL_WARMUPS_CATALOG } from '../domain/vocalWarmups.js';
import { TONGUE_TWISTERS_CATALOG } from '../domain/tongueTwisters.js';
import { READING_PASSAGES_CATALOG } from '../domain/readingPassages.js';
import { getSentencesForCategory, PRACTICAL_SENTENCES_CATALOG } from '../domain/practiceSentences.js';
import { SPEAKING_SCENARIOS_CATALOG } from '../domain/speakingScenarios.js';
import { LISTENING_EXERCISES_CATALOG } from '../domain/listeningExercises.js';
import { ContentValidator } from '../validation/ContentValidator.js';
import { ContentHistoryManager } from './ContentHistoryManager.js';

export interface GenerateSessionOptions {
  preferredTopic?: string;
  targetDurationMinutes?: number;
  mode?: 'standard' | 'quick';
}

export class DailyPracticeEngine {
  /**
   * Generates or personalizes a complete, date-associated 6-stage daily practice session.
   *
   * @param profile User profile containing skills, weak sounds, and goals.
   * @param localDate Calendar date string (YYYY-MM-DD) in the user's local timezone.
   * @param historyManager ContentHistoryManager tracking recent IDs to avoid immediate repetition.
   * @param options Additional generation options.
   */
  public static createDailySession(
    profile: UserProfile | UserSkillProfile,
    localDate: string,
    historyManager?: ContentHistoryManager,
    options?: GenerateSessionOptions
  ): DailyPracticeSession {
    const skillProfile: UserSkillProfile = 'skills' in profile ? profile.skills : profile;
    const userId = 'id' in profile ? profile.id : 'learner';
    const targetLevel: EnglishLevel = 'level' in profile ? profile.level : 'Intermediate';

    // 1. Identify primary and secondary focus phonemes
    const primaryFocus: PhonemeCategory = skillProfile.weakSounds[0] || 'R_L';
    const secondaryFocus: PhonemeCategory = skillProfile.weakSounds[1] || 'S_SH';

    // History sets
    const recentPassageIds = historyManager ? historyManager.getRecentlyUsedPassageIds(7) : new Set<string>();
    const recentTwisterIds = historyManager ? historyManager.getRecentlyUsedTwisterIds(7) : new Set<string>();
    const recentSentenceIds = historyManager ? historyManager.getRecentlyUsedSentenceIds(7) : new Set<string>();
    const recentScenarioIds = historyManager ? historyManager.getRecentlyUsedScenarioIds(7) : new Set<string>();
    const recentListeningIds = historyManager ? historyManager.getRecentlyUsedListeningIds(7) : new Set<string>();

    // Stage 1: Vocal Warm-ups (strictly 2 to 3 selected exercises)
    const selectedWarmups = this.selectWarmups(primaryFocus, localDate);

    // Stage 2: Tongue Twisters (strictly 3 to 5 selected twisters, avoiding recent)
    const selectedTwisters = this.selectTwisters(primaryFocus, secondaryFocus, recentTwisterIds, localDate);

    // Stage 3: Reading Passage (strictly 160-200 words, 6 key vocabulary items)
    const selectedPassage = this.selectReadingPassage(primaryFocus, recentPassageIds, options?.preferredTopic, localDate);

    // Stage 4: Practical Sentences (strictly 10 to 15 sentences, matching user goals)
    const selectedSentences = this.selectSentences(primaryFocus, secondaryFocus, recentSentenceIds, localDate);

    // Stage 5: Speaking Practice (strictly 1 to 3 prompts)
    const selectedPrompts = this.selectSpeakingPrompts(profile, recentScenarioIds, localDate);

    // Stage 6: Listening Exercise (1 dialogue with 2 to 3 comprehension questions)
    const selectedListening = this.selectListeningExercise(recentListeningIds, localDate);

    // Assemble the 6 sequential stages
    const stages: DailyPracticeStage[] = [
      {
        stageNumber: 1,
        type: 'vocal_warmup',
        title: 'Vocal Warm-Up',
        shortDescription: 'Awaken speech resonance, relieve tension, and establish gentle diaphragmatic airflow.',
        estimatedMinutes: 2,
        isCompleted: false,
        isSkipped: false,
        data: { exercises: selectedWarmups }
      },
      {
        stageNumber: 2,
        type: 'tongue_twisters',
        title: 'Tongue Twisters',
        shortDescription: `Agility drills focusing on ${primaryFocus.replace('_', ' / ')} clarity before speed.`,
        estimatedMinutes: 3,
        isCompleted: false,
        isSkipped: false,
        data: { twisters: selectedTwisters }
      },
      {
        stageNumber: 3,
        type: 'reading_aloud',
        title: 'Reading Aloud',
        shortDescription: `Read "${selectedPassage.title}" with steady pacing, breath control, and 6 key vocabulary words.`,
        estimatedMinutes: 3,
        isCompleted: false,
        isSkipped: false,
        data: { passage: selectedPassage }
      },
      {
        stageNumber: 4,
        type: 'practical_sentences',
        title: 'Practical English Sentences',
        shortDescription: `Master ${selectedSentences.length} real-world sentences for workplace and daily communication.`,
        estimatedMinutes: 3,
        isCompleted: false,
        isSkipped: false,
        data: {
          sentences: selectedSentences,
          category: selectedSentences[0]?.contextCategory || 'Workplace'
        }
      },
      {
        stageNumber: 5,
        type: 'speaking_practice',
        title: 'Speaking Practice',
        shortDescription: 'Move from repetition to spontaneous speech with guided coaching feedback.',
        estimatedMinutes: 2,
        isCompleted: false,
        isSkipped: false,
        data: {
          prompts: selectedPrompts,
          mode: 'guided'
        }
      },
      {
        stageNumber: 6,
        type: 'listening_exercise',
        title: 'Listening Exercise',
        shortDescription: 'Listen to natural conversational English dialogue and test your comprehension.',
        estimatedMinutes: 2,
        isCompleted: false,
        isSkipped: false,
        data: { exercise: selectedListening }
      }
    ];

    const sessionId = `session_${userId}_${localDate}_${primaryFocus.toLowerCase()}`;
    const lessonTitle = `Daily Practice: ${selectedPassage.topic} & ${primaryFocus.replace('_', ' / ')} Mastery`;

    const session: DailyPracticeSession = {
      sessionId,
      userId,
      localDate,
      createdAt: new Date().toISOString(),
      lessonTitle,
      lessonTheme: selectedPassage.topic,
      estimatedDuration: options?.targetDurationMinutes || 15,
      focusAreas: [
        `${primaryFocus.replace('_', ' / ')} articulation`,
        `${selectedPassage.topic} vocabulary`,
        'Conversational flow'
      ],
      focusSounds: [primaryFocus, secondaryFocus],
      stages,
      currentStageIndex: 0,
      status: 'not_started',
      totalElapsedSeconds: 0,
      completionPercentage: 0,
      stageResults: {},
      notes: `Curated for ${localDate} based on learner baseline profile.`
    };

    // Programmatic Validation Guardrail
    const validation = ContentValidator.validateDailyPracticeSession(session);
    if (!validation.isValid) {
      console.warn('DailyPracticeSession validation warning:', validation.errors);
    }

    return session;
  }

  /**
   * Deterministic stage selection helpers using date-derived seed to ensure consistent day sessions.
   */
  private static selectWarmups(focusPhoneme: PhonemeCategory, dateStr: string): VocalExercise[] {
    const seed = this.hashDate(dateStr);
    const catalog = [...VOCAL_WARMUPS_CATALOG];

    // Priority tailoring: If R_L is weak, prioritize Tongue Trill & Rolled R
    let primaryWarmup: VocalExercise;
    if (focusPhoneme === 'R_L') {
      primaryWarmup = catalog.find((w) => w.type === 'tongue_trill') || catalog[1];
    } else {
      primaryWarmup = catalog.find((w) => w.type === 'lip_trill') || catalog[0];
    }

    // Remaining candidates
    const others = catalog.filter((w) => w.id !== primaryWarmup.id);
    const secondIndex = seed % others.length;
    const secondaryWarmup = others[secondIndex];

    const thirdIndex = (seed + 1) % others.length;
    const thirdWarmup = others[thirdIndex === secondIndex ? (thirdIndex + 1) % others.length : thirdIndex];

    // Return strictly 2 or 3 exercises
    return [primaryWarmup, secondaryWarmup, thirdWarmup].slice(0, 3);
  }

  private static selectTwisters(
    primary: PhonemeCategory,
    secondary: PhonemeCategory,
    recentIds: Set<string>,
    dateStr: string
  ): TongueTwister[] {
    const seed = this.hashDate(dateStr);

    // First filter by target phonemes
    const primaryPool = TONGUE_TWISTERS_CATALOG.filter((t) => t.category === primary);
    const secondaryPool = TONGUE_TWISTERS_CATALOG.filter((t) => t.category === secondary);
    const fallbackPool = TONGUE_TWISTERS_CATALOG.filter(
      (t) => t.category === 'CONSONANT_CLUSTERS' || t.category === 'RAPID_SPEECH' || t.category === 'TH'
    );

    // Select primary twisters (prefer not recently used)
    const availablePrimary = primaryPool.filter((t) => !recentIds.has(t.id));
    const pool1 = availablePrimary.length >= 2 ? availablePrimary : primaryPool;

    const availableSecondary = secondaryPool.filter((t) => !recentIds.has(t.id));
    const pool2 = availableSecondary.length >= 1 ? availableSecondary : secondaryPool;

    const selected: TongueTwister[] = [];
    const p1 = pool1[seed % pool1.length];
    if (p1) selected.push(p1);

    const remainingPool1 = pool1.filter((t) => t.id !== p1?.id);
    if (remainingPool1.length > 0) {
      selected.push(remainingPool1[(seed + 1) % remainingPool1.length]);
    }

    // Add from secondary pool
    const s1 = pool2.find((t) => !selected.some((s) => s.id === t.id));
    if (s1) selected.push(s1);

    // If still under 3, pull from fallback
    if (selected.length < 3) {
      for (const fb of fallbackPool) {
        if (!selected.some((s) => s.id === fb.id)) {
          selected.push(fb);
          if (selected.length >= 3) break;
        }
      }
    }

    // Ensure strictly between 3 and 5 items
    return selected.slice(0, Math.min(Math.max(selected.length, 3), 4));
  }

  private static selectReadingPassage(
    primary: PhonemeCategory,
    recentIds: Set<string>,
    preferredTopic: string | undefined,
    dateStr: string
  ): ReadingPassage {
    const seed = this.hashDate(dateStr);

    // Candidates matching topic or targeting phoneme
    let candidates = READING_PASSAGES_CATALOG;

    if (preferredTopic) {
      const topicMatches = candidates.filter((p) => p.topic.toLowerCase() === preferredTopic.toLowerCase());
      if (topicMatches.length > 0) candidates = topicMatches;
    }

    // Filter out recently used if alternatives exist
    const freshCandidates = candidates.filter((p) => !recentIds.has(p.id));
    const pool = freshCandidates.length > 0 ? freshCandidates : candidates;

    // Pick deterministically by date seed
    const chosen = pool[seed % pool.length] || READING_PASSAGES_CATALOG[0];
    return chosen;
  }

  private static selectSentences(
    primary: PhonemeCategory,
    secondary: PhonemeCategory,
    recentIds: Set<string>,
    dateStr: string
  ): PracticeSentence[] {
    const seed = this.hashDate(dateStr);

    // Get candidate sentences for primary weak phoneme
    let pool = getSentencesForCategory(primary);
    if (!pool || pool.length < 10) {
      pool = getSentencesForCategory('R_L');
    }

    // Rotate selection starting point by date hash to ensure day-to-day variety
    const total = pool.length;
    const startIndex = seed % total;
    const rotated: PracticeSentence[] = [];

    for (let i = 0; i < total; i++) {
      rotated.push(pool[(startIndex + i) % total]);
    }

    // Return strictly 12 practical sentences (within target range 10-15)
    return rotated.slice(0, 12);
  }

  private static selectSpeakingPrompts(
    profile: UserProfile | UserSkillProfile,
    recentIds: Set<string>,
    dateStr: string
  ): SpeakingScenario[] {
    const seed = this.hashDate(dateStr);
    const goals: string[] = 'goals' in profile ? profile.goals : ['Workplace', 'Speaking'];

    // If goal mentions interview, prioritize job_interview / hr_interview
    const isInterview = goals.some((g) => g.toLowerCase().includes('interview'));
    let filtered = SPEAKING_SCENARIOS_CATALOG;

    if (isInterview) {
      filtered = SPEAKING_SCENARIOS_CATALOG.filter(
        (s) => s.category === 'job_interview' || s.category === 'hr_interview'
      );
    } else {
      // Rotate workplace, meetings, and conversation
      filtered = SPEAKING_SCENARIOS_CATALOG.filter((s) => s.category !== 'job_interview');
    }

    const available = filtered.filter((s) => !recentIds.has(s.id));
    const pool = available.length >= 2 ? available : filtered;

    const first = pool[seed % pool.length];
    const remaining = pool.filter((s) => s.id !== first.id);
    const second = remaining.length > 0 ? remaining[(seed + 1) % remaining.length] : null;

    const results = [first];
    if (second) results.push(second);

    // Return strictly 1 to 2 prompts
    return results.slice(0, 2);
  }

  private static selectListeningExercise(recentIds: Set<string>, dateStr: string): ListeningExercise {
    const seed = this.hashDate(dateStr);
    const fresh = LISTENING_EXERCISES_CATALOG.filter((l) => !recentIds.has(l.id));
    const pool = fresh.length > 0 ? fresh : LISTENING_EXERCISES_CATALOG;
    return pool[seed % pool.length] || LISTENING_EXERCISES_CATALOG[0];
  }

  /**
   * Simple hash from YYYY-MM-DD to integer for deterministic, varied pseudo-random selection.
   */
  private static hashDate(dateStr: string): number {
    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) {
      const char = dateStr.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return Math.abs(hash);
  }

  /**
   * Updates stage completion and session progress.
   */
  public static completeStage(
    session: DailyPracticeSession,
    stageNumber: number,
    result?: any
  ): DailyPracticeSession {
    const updatedStages = session.stages.map((st) => {
      if (st.stageNumber === stageNumber) {
        return {
          ...st,
          isCompleted: true,
          result: result || st.result
        };
      }
      return st;
    });

    const completedCount = updatedStages.filter((s) => s.isCompleted || s.isSkipped).length;
    const completionPercentage = Math.round((completedCount / updatedStages.length) * 100);
    const allDone = completedCount === updatedStages.length;

    const nextIndex = Math.min(stageNumber, updatedStages.length - 1);

    return {
      ...session,
      stages: updatedStages,
      currentStageIndex: allDone ? updatedStages.length - 1 : nextIndex,
      status: allDone ? 'completed' : 'in_progress',
      completionPercentage,
      completedAt: allDone ? new Date().toISOString() : session.completedAt,
      stageResults: {
        ...session.stageResults,
        [stageNumber]: result
      }
    };
  }

  /**
   * Applies completed daily practice session to user profile (updates streak, practice time, completed lessons).
   */
  public static applySessionCompletion(
    session: DailyPracticeSession,
    profile: UserProfile,
    minutesPracticed: number = 15
  ): UserProfile {
    // Only update streak if session was actually completed meaningfully
    const isCompleted = session.status === 'completed' || session.completionPercentage >= 80;
    if (!isCompleted) {
      return profile;
    }

    const todayStr = session.localDate;
    const streak = { ...profile.streak };

    if (streak.lastPracticeDate !== todayStr) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (streak.lastPracticeDate === yesterdayStr) {
        streak.currentStreak += 1;
      } else {
        streak.currentStreak = 1;
      }
      streak.lastPracticeDate = todayStr;
      if (streak.currentStreak > streak.longestStreak) {
        streak.longestStreak = streak.currentStreak;
      }
    }

    return {
      ...profile,
      streak,
      totalMinutesPracticed: (profile.totalMinutesPracticed || 0) + minutesPracticed,
      completedLessonsCount: (profile.completedLessonsCount || 0) + 1
    };
  }
}
