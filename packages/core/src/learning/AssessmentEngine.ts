import {
  BaselineAssessment,
  SpeakingAssessmentResult,
  ReadingAssessmentResult,
  PronunciationItemResult,
  PronunciationAssessmentResult,
  RecommendedPracticePlan,
  MetricObservation
} from '../types/assessment.js';
import {
  UserProfile,
  UserSkillProfile,
  EnglishLevel,
  DailyPracticeMinutes
} from '../types/user.js';
import { PhonemeCategory } from '../types/speech.js';
import {
  BaselineSpeakingPrompt,
  BaselineReadingPassage,
  BASELINE_PRONUNCIATION_PAIRS
} from '../domain/baselineCatalogs.js';
import { PhonemeWeaknessTracker } from './PhonemeWeaknessTracker.js';

export class AssessmentEngine {
  /**
   * Evaluates a spontaneous speaking prompt attempt with honest metric observation.
   */
  public static evaluateSpeakingAttempt(
    prompt: BaselineSpeakingPrompt,
    spokenTranscript: string,
    durationMs: number
  ): SpeakingAssessmentResult {
    const cleanText = spokenTranscript.trim();
    const words = cleanText ? cleanText.split(/\s+/).filter(w => w.length > 0) : [];
    const wordCount = words.length;

    const hasSpeech = wordCount > 0;
    const durationSeconds = durationMs / 1000;
    const wpm = (hasSpeech && durationSeconds > 2) ? Math.round((wordCount / durationSeconds) * 60) : 0;

    // Detect common fillers/hesitations
    const fillerWordsCatalog = ['um', 'uh', 'er', 'ah', 'like', 'you know'];
    const detectedFillers = words.filter(w => fillerWordsCatalog.includes(w.toLowerCase()));

    // Estimated pauses based on duration vs word count expectation
    const expectedSecondsForWords = wordCount / 2.3; // ~140 wpm
    const excessTime = Math.max(0, durationSeconds - expectedSecondsForWords);
    const estimatedPauses = Math.min(8, Math.floor(excessTime / 1.5));

    // Constructive Strengths
    const strengths: string[] = [];
    if (wordCount >= 10) {
      strengths.push('Spoke continuously and shared detailed thoughts');
    } else if (wordCount > 0) {
      strengths.push('Willingness to begin speaking spontaneously');
    }
    if (wpm >= 110 && wpm <= 160) {
      strengths.push('Natural conversational pace');
    } else if (wpm > 160) {
      strengths.push('Energetic speaking tempo');
    } else if (wpm > 0 && wpm < 110) {
      strengths.push('Deliberate and thoughtful word selection');
    }
    if (detectedFillers.length === 0 && hasSpeech) {
      strengths.push('Low hesitation frequency');
    }

    // Constructive Opportunities
    const opportunities: string[] = [];
    if (wpm < 110 && hasSpeech) {
      opportunities.push('Developing a continuous, steady speaking rhythm');
    } else if (wpm > 165) {
      opportunities.push('Allowing natural pauses at sentence boundaries');
    }
    if (detectedFillers.length > 2) {
      opportunities.push('Replacing filler sounds with confident short pauses');
    }
    if (wordCount < 15 && hasSpeech) {
      opportunities.push('Expanding thoughts with one extra supporting sentence');
    }

    return {
      promptId: prompt.id,
      promptText: prompt.promptText,
      transcript: {
        status: hasSpeech ? 'observed' : 'unavailable',
        value: cleanText,
        confidence: hasSpeech ? 0.9 : 0
      },
      durationMs: {
        status: durationMs > 0 ? 'observed' : 'unavailable',
        value: durationMs
      },
      wordsPerMinute: {
        status: (hasSpeech && durationSeconds > 2) ? 'observed' : 'unavailable',
        value: wpm,
        note: wpm > 0 ? `Calculated from ${wordCount} words across ${(durationSeconds).toFixed(1)}s` : 'Speech too short for reliable WPM'
      },
      wordCount: {
        status: hasSpeech ? 'observed' : 'unavailable',
        value: wordCount
      },
      pausesDetected: {
        status: hasSpeech ? 'estimated' : 'unavailable',
        value: estimatedPauses,
        note: 'Estimated from phrase pacing intervals'
      },
      fillerHesitations: {
        status: hasSpeech ? 'observed' : 'unavailable',
        value: detectedFillers
      },
      observedStrengths: strengths.length > 0 ? strengths : ['Engaged with the speaking exercise'],
      observedOpportunities: opportunities.length > 0 ? opportunities : ['Maintain daily speaking practice']
    };
  }

  /**
   * Evaluates a reading aloud attempt against the baseline reading passage.
   */
  public static evaluateReadingAttempt(
    passage: BaselineReadingPassage,
    spokenTranscript: string,
    durationMs: number
  ): ReadingAssessmentResult {
    const targetWords = passage.passageText
      .toLowerCase()
      .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 0);

    const spokenWords = spokenTranscript
      .toLowerCase()
      .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 0);

    const hasSpeech = spokenWords.length > 0;
    const durationSeconds = durationMs / 1000;
    const wpm = (hasSpeech && durationSeconds > 2) ? Math.round((spokenWords.length / durationSeconds) * 60) : 0;

    // Track matched words in sequence
    let matchedCount = 0;
    let spokenIndex = 0;
    const skipped: string[] = [];

    for (let i = 0; i < targetWords.length; i++) {
      const target = targetWords[i];
      let found = false;
      const lookAhead = Math.min(spokenWords.length, spokenIndex + 5);

      for (let j = spokenIndex; j < lookAhead; j++) {
        if (spokenWords[j] === target) {
          matchedCount++;
          spokenIndex = j + 1;
          found = true;
          break;
        }
      }

      if (!found && i < spokenWords.length) {
        skipped.push(target);
      }
    }

    const completionRate = hasSpeech ? Math.min(100, Math.round((matchedCount / targetWords.length) * 100)) : 0;

    // Constructive feedback
    const strengths: string[] = [];
    if (completionRate >= 80) {
      strengths.push('Excellent reading completeness and persistence');
    } else if (completionRate >= 50) {
      strengths.push('Solid reading pace through longer sentence structures');
    } else if (hasSpeech) {
      strengths.push('Started reading multisyllabic passage with focus');
    }

    if (wpm >= 120 && wpm <= 155) {
      strengths.push('Optimal reading tempo for listener comprehension');
    }

    const opportunities: string[] = [];
    if (completionRate < 70 && hasSpeech) {
      opportunities.push('Pacing aloud through full multi-clause sentences');
    }
    if (skipped.length > 5) {
      opportunities.push('Slowing down slightly on consonant cluster words');
    }

    return {
      passageId: passage.id,
      passageTitle: passage.title,
      totalWords: targetWords.length,
      wordsRead: {
        status: hasSpeech ? 'observed' : 'unavailable',
        value: matchedCount
      },
      wordsSkipped: {
        status: hasSpeech ? 'observed' : 'unavailable',
        value: skipped.slice(0, 8)
      },
      approximatePaceWpm: {
        status: (hasSpeech && durationSeconds > 2) ? 'observed' : 'unavailable',
        value: wpm,
        note: 'Word count divided by active reading duration'
      },
      durationMs: {
        status: durationMs > 0 ? 'observed' : 'unavailable',
        value: durationMs
      },
      completionRate: {
        status: hasSpeech ? 'estimated' : 'unavailable',
        value: completionRate,
        note: 'Percentage of passage words matched sequentially'
      },
      observedStrengths: strengths.length > 0 ? strengths : ['Engaged with reading aloud'],
      observedOpportunities: opportunities.length > 0 ? opportunities : ['Daily aloud reading practice']
    };
  }

  /**
   * Evaluates a pronunciation word pair attempt (e.g. "red" / "led").
   */
  public static evaluatePronunciationAttempt(
    soundGroup: PhonemeCategory,
    targetPair: [string, string],
    spokenTranscript: string,
    attemptNumber: number = 1
  ): PronunciationItemResult {
    const cleanText = spokenTranscript.toLowerCase().trim();
    const spokenTokens = cleanText.split(/\s+/);

    const wordA = targetPair[0].toLowerCase();
    const wordB = targetPair[1].toLowerCase();

    const hasA = spokenTokens.includes(wordA);
    const hasB = spokenTokens.includes(wordB);

    let matchStatus: 'matched' | 'developing' | 'unclear' = 'unclear';
    if (hasA && hasB) {
      matchStatus = 'matched';
    } else if (hasA || hasB) {
      matchStatus = 'developing';
    } else if (cleanText.length > 0) {
      matchStatus = 'developing';
    }

    return {
      soundGroup,
      targetPair,
      targetWords: [wordA, wordB],
      transcript: {
        status: cleanText.length > 0 ? 'observed' : 'unavailable',
        value: cleanText
      },
      matchStatus: {
        status: cleanText.length > 0 ? 'observed' : 'unavailable',
        value: matchStatus,
        note: matchStatus === 'matched' ? 'Both distinct words captured' : matchStatus === 'developing' ? 'One sound captured clearly' : 'Needs practice'
      },
      attemptNumber
    };
  }

  /**
   * Synthesizes assessment observations into constructive strengths, focus areas, and recommended sounds.
   */
  public static createInitialFocusAreas(assessment: BaselineAssessment): {
    strengths: string[];
    focusAreas: string[];
    recommendedSounds: PhonemeCategory[];
    primarySound: PhonemeCategory;
    secondarySound: PhonemeCategory;
  } {
    const strengths: string[] = [];
    const focusAreas: string[] = [];
    const identifiedWeaknesses: PhonemeCategory[] = [];

    // 1. Evaluate Pronunciation Check Results
    if (assessment.pronunciationAssessment?.items?.length) {
      for (const item of assessment.pronunciationAssessment.items) {
        if (item.matchStatus.value === 'developing' || item.matchStatus.value === 'unclear') {
          if (!identifiedWeaknesses.includes(item.soundGroup)) {
            identifiedWeaknesses.push(item.soundGroup);
          }
        } else if (item.matchStatus.value === 'matched') {
          strengths.push(`Clear distinction on ${item.soundGroup.replace('_', ' / ')} word pairs`);
        }
      }
    }

    // Default priority sounds if none were weak
    if (!identifiedWeaknesses.includes('R_L')) identifiedWeaknesses.push('R_L');
    if (!identifiedWeaknesses.includes('TH')) identifiedWeaknesses.push('TH');
    if (!identifiedWeaknesses.includes('S_SH')) identifiedWeaknesses.push('S_SH');

    const primarySound = identifiedWeaknesses[0] || 'R_L';
    const secondarySound = identifiedWeaknesses[1] || 'TH';

    // 2. Evaluate Reading Assessment
    if (assessment.readingAssessment) {
      const reading = assessment.readingAssessment;
      if (reading.observedStrengths.length) {
        strengths.push(reading.observedStrengths[0]);
      }
      if (reading.completionRate.value >= 70) {
        strengths.push('Good reading continuity across long sentences');
      } else {
        focusAreas.push('Sentence pacing and breath support during aloud reading');
      }
    }

    // 3. Evaluate Speaking Assessment
    if (assessment.speakingAssessment) {
      const speaking = assessment.speakingAssessment;
      if (speaking.observedStrengths.length) {
        strengths.push(speaking.observedStrengths[0]);
      }
      if (speaking.wordsPerMinute.value > 0) {
        if (speaking.wordsPerMinute.value >= 115 && speaking.wordsPerMinute.value <= 155) {
          strengths.push('Natural speaking pace in spontaneous response');
        } else if (speaking.wordsPerMinute.value < 115) {
          focusAreas.push('Building fluid conversational momentum');
        }
      }
    }

    // 4. Incorporate Confidence & Goals
    if (assessment.speakingConfidence === 'very_uncomfortable' || assessment.speakingConfidence === 'a_little_uncomfortable') {
      focusAreas.push('Low-pressure confidence building in everyday workplace scenarios');
    } else {
      strengths.push('Positive attitude toward regular speaking practice');
    }

    // Sound-specific focus area
    focusAreas.unshift(`${primarySound.replace('_', ' and ')} clarity and natural flow`);

    // Ensure at least 3 strengths and 3 focus areas
    const defaultStrengths = [
      'Active commitment to daily English growth',
      'Clear motivation to practice speaking out loud',
      'Thoughtful engagement with communication exercises'
    ];
    for (const str of defaultStrengths) {
      if (strengths.length >= 3) break;
      if (!strengths.includes(str)) {
        strengths.push(str);
      }
    }

    const defaultOpportunities = [
      'Connected speech and natural sentence pauses',
      'Maintaining clear terminal consonant releases',
      'Conversational rhythm in spontaneous responses'
    ];
    for (const opt of defaultOpportunities) {
      if (focusAreas.length >= 3) break;
      if (!focusAreas.includes(opt)) {
        focusAreas.push(opt);
      }
    }

    return {
      strengths: Array.from(new Set(strengths)).slice(0, 4),
      focusAreas: Array.from(new Set(focusAreas)).slice(0, 4),
      recommendedSounds: identifiedWeaknesses,
      primarySound,
      secondarySound
    };
  }

  /**
   * Generates the tailored 15-minute first practice plan based on the assessment.
   */
  public static createInitialPracticePlan(assessment: BaselineAssessment): RecommendedPracticePlan {
    const focus = this.createInitialFocusAreas(assessment);
    const duration =
      typeof assessment.dailyPracticePreference === 'number'
        ? assessment.dailyPracticePreference
        : 15;

    return {
      durationMinutes: duration,
      activitiesCount: 6,
      primarySound: focus.primarySound,
      secondarySound: focus.secondarySound,
      activitiesSummary: [
        'Vocal Warm-Up: Gentle lip & tongue relaxation',
        `Tongue Twisters: ${focus.primarySound.replace('_', ' / ')} sound repetition`,
        'Reading Aloud: 160-word conversational passage',
        'Practical Sentences: 10 contextual sentences',
        'Speaking Practice: Spontaneous scenario response',
        'Listening Exercise: Natural dialogue comprehension'
      ]
    };
  }

  /**
   * Builds the complete UserProfile and skill profile from the baseline assessment.
   */
  public static buildInitialLearnerProfile(assessment: BaselineAssessment): UserProfile {
    const focus = this.createInitialFocusAreas(assessment);
    const defaultSkills = PhonemeWeaknessTracker.createDefaultSkillProfile();

    // Calibrate initial scores based on self-reported level and assessment
    let baseScore = 65;
    if (assessment.selfReportedLevel === 'Beginner') baseScore = 48;
    else if (assessment.selfReportedLevel === 'Elementary') baseScore = 55;
    else if (assessment.selfReportedLevel === 'Intermediate' || assessment.selfReportedLevel === 'Not sure') baseScore = 68;
    else if (assessment.selfReportedLevel === 'Upper Intermediate') baseScore = 78;
    else if (assessment.selfReportedLevel === 'Advanced') baseScore = 86;

    // Reading assessment boost
    const readingBonus = assessment.readingAssessment?.completionRate.value
      ? Math.round((assessment.readingAssessment.completionRate.value - 50) * 0.2)
      : 0;

    const finalSkills: UserSkillProfile = {
      ...defaultSkills,
      speakingScore: Math.min(95, Math.max(40, baseScore)),
      pronunciationScore: Math.min(95, Math.max(40, baseScore - 2)),
      fluencyScore: Math.min(95, Math.max(40, baseScore - 4)),
      readingScore: Math.min(95, Math.max(45, baseScore + readingBonus)),
      weakSounds: focus.recommendedSounds
    };

    // Mark primary & secondary focus sounds in the soundSkills map
    if (finalSkills.soundSkills[focus.primarySound]) {
      finalSkills.soundSkills[focus.primarySound].status = 'weak';
      finalSkills.soundSkills[focus.primarySound].accuracy = Math.max(45, baseScore - 15);
    }
    if (finalSkills.soundSkills[focus.secondarySound]) {
      finalSkills.soundSkills[focus.secondarySound].status = 'average';
      finalSkills.soundSkills[focus.secondarySound].accuracy = Math.max(55, baseScore - 8);
    }

    const levelMapping: EnglishLevel =
      assessment.selfReportedLevel === 'Beginner'
        ? 'Beginner'
        : assessment.selfReportedLevel === 'Elementary'
        ? 'Elementary'
        : assessment.selfReportedLevel === 'Upper Intermediate'
        ? 'Upper Intermediate'
        : assessment.selfReportedLevel === 'Advanced'
        ? 'Advanced'
        : 'Intermediate';

    const dailyMinutes: DailyPracticeMinutes =
      typeof assessment.dailyPracticePreference === 'number'
        ? assessment.dailyPracticePreference
        : 15;

    const rawName = assessment.name?.trim() || '';
    const cleanName = (rawName === 'Alex Chen' || rawName === 'Alex' || rawName === '') ? 'Learner' : rawName;

    return {
      id: assessment.userId || `user_${Date.now()}`,
      name: cleanName,
      goals: assessment.goals as any,
      level: levelMapping,
      dailyGoalMinutes: dailyMinutes,
      createdAt: new Date().toISOString(),
      isOnboarded: true,
      baselineAssessmentCompleted: assessment.status === 'completed',
      assessmentId: assessment.assessmentId,
      preferredLanguage: assessment.preferredLanguage || 'English',
      communicationContexts: assessment.contexts,
      speakingConfidence: assessment.speakingConfidence,
      strengthsSummary: focus.strengths,
      focusAreasSummary: focus.focusAreas,
      skills: finalSkills,
      streak: {
        currentStreak: 0,
        longestStreak: 0,
        lastPracticeDate: ''
      },
      totalMinutesPracticed: 0,
      completedLessonsCount: 0
    };
  }
}
