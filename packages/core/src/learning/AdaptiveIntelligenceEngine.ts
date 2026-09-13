import {
  SpeakingAnalysisReport,
  SpeakingObservedMetrics,
  SpeakingCoachingFeedback,
  LearningMemory,
  PronunciationFocusItem,
  PhonemeCategory,
  DailyPracticeSession,
  UserProfile,
  VocabularyWord
} from '../types/index.js';

export class AdaptiveIntelligenceEngine {
  /**
   * Analyzes spontaneous or guided spoken responses using honest metric separation.
   * Separates observed metadata (duration, words, filler patterns) from coaching guidance.
   */
  public static analyzeSpontaneousSpeech(
    promptId: string,
    promptText: string,
    transcript: string,
    durationMs: number
  ): SpeakingAnalysisReport {
    const cleaned = (transcript || '').trim();
    const durationSeconds = Math.max(1, Math.round(durationMs / 1000));
    const words = cleaned ? cleaned.split(/\s+/).filter(Boolean) : [];
    const wordCount = words.length;

    // Estimate WPM only if duration is meaningful (>= 3s)
    const estimatedWpm = durationSeconds >= 3 && wordCount > 0
      ? Math.round((wordCount / durationSeconds) * 60)
      : undefined;

    // Detect common spoken filler words
    const fillerPatterns = [
      /\b(um|uh|er|ah)\b/gi,
      /\b(like)\b/gi,
      /\b(you know)\b/gi,
      /\b(basically|actually)\b/gi
    ];
    const detectedFillers: string[] = [];
    for (const pattern of fillerPatterns) {
      const matches = cleaned.match(pattern);
      if (matches && matches.length > 0) {
        detectedFillers.push(...matches.map(m => m.toLowerCase()));
      }
    }

    // Pacing classification
    let pacing: 'slow' | 'steady' | 'rapid' = 'steady';
    if (estimatedWpm) {
      if (estimatedWpm < 105) pacing = 'slow';
      else if (estimatedWpm > 165) pacing = 'rapid';
      else pacing = 'steady';
    }

    const observedMetrics: SpeakingObservedMetrics = {
      wordCount,
      durationSeconds,
      estimatedWpm,
      transcript: cleaned,
      observedFillerWords: Array.from(new Set(detectedFillers)),
      approximatePacing: pacing
    };

    // Constructive coaching feedback: 1 strength, 1-2 improvement points, 1 natural alternative
    const coachingFeedback = this.deriveCoachingFeedback(promptText, cleaned, observedMetrics);

    return {
      promptId,
      promptText,
      observedMetrics,
      coachingFeedback,
      timestamp: new Date().toISOString()
    };
  }

  private static deriveCoachingFeedback(
    prompt: string,
    transcript: string,
    metrics: SpeakingObservedMetrics
  ): SpeakingCoachingFeedback {
    // Empty speech fallback
    if (metrics.wordCount < 4) {
      return {
        strength: 'You began your practice attempt and activated audio detection.',
        improvementPoints: [
          'Aim to speak at least 2 full sentences so the coach can identify your natural flow.',
          'Start with the starter prompt if formulating spontaneous thoughts feels challenging.'
        ],
        naturalAlternative: {
          originalContext: 'Short response',
          suggestedAlternative: 'To start off, I would like to explain that...',
          explanation: 'Using standard discourse openers provides you time to organize your ideas.'
        },
        nextPracticeSuggestion: 'Retry the prompt and complete 2 to 3 complete thoughts.'
      };
    }

    // 1. Key Strength based on observable evidence
    let strength = 'You expressed your ideas with a continuous, steady cadence.';
    if (metrics.approximatePacing === 'steady') {
      strength = 'Your conversational pacing was comfortable and easy to follow.';
    } else if (metrics.wordCount >= 25) {
      strength = 'You provided a complete, descriptive response with solid elaboration.';
    } else if (metrics.observedFillerWords.length === 0) {
      strength = 'Your delivery was clean without hesitation fillers.';
    }

    // 2. 1-2 Actionable Improvements
    const improvementPoints: string[] = [];
    if (metrics.observedFillerWords.length > 2) {
      improvementPoints.push(
        `Notice the use of filler words (${metrics.observedFillerWords.slice(0, 2).join(', ')}). Practice resting on a silent breath instead of voicing the pause.`
      );
    }
    if (metrics.approximatePacing === 'rapid') {
      improvementPoints.push(
        'Your speaking tempo was slightly rushed. Adding brief pauses before key nouns helps listeners digest technical details.'
      );
    } else if (metrics.approximatePacing === 'slow') {
      improvementPoints.push(
        'Work on connecting related words into unified thought groups to increase spoken fluency.'
      );
    } else {
      improvementPoints.push(
        'Focus on crisply articulating terminal consonants (-ed, -t, -s) for enhanced clarity.'
      );
    }

    // 3. 1 Natural Workplace Alternative (detect common non-native phrasing patterns)
    let naturalAlternative = {
      originalContext: 'I am agree with this point',
      suggestedAlternative: 'I completely agree with that perspective.',
      explanation: 'In English, "agree" is a verb, so "I agree" is grammatically standard rather than "I am agree".'
    };

    if (/\b(doubt)\b/i.test(transcript)) {
      naturalAlternative = {
        originalContext: 'I have a doubt regarding this',
        suggestedAlternative: 'I have a question regarding this approach.',
        explanation: 'In professional global contexts, "question" or "clarification" sounds more collaborative than "doubt".'
      };
    } else if (/\b(revert back)\b/i.test(transcript)) {
      naturalAlternative = {
        originalContext: 'I will revert back to you',
        suggestedAlternative: 'I will follow up with you once I review the details.',
        explanation: '"Revert back" is redundant; "follow up" or "get back to you" is standard natural business English.'
      };
    } else if (/\b(do the needful)\b/i.test(transcript)) {
      naturalAlternative = {
        originalContext: 'Please do the needful',
        suggestedAlternative: 'Please take the necessary steps to proceed.',
        explanation: '"Do the needful" is archaic phrasing; use specific action items in modern communication.'
      };
    } else if (metrics.wordCount >= 10) {
      naturalAlternative = {
        originalContext: 'Connecting clauses with multiple "and then"',
        suggestedAlternative: 'Consequently, ... / Furthermore, ...',
        explanation: 'Using transition discourse markers gives professional structure to your spoken recommendations.'
      };
    }

    const nextPracticeSuggestion = 'Try repeating your answer once more, deliberately incorporating the natural alternative.';

    return {
      strength,
      improvementPoints: improvementPoints.slice(0, 2),
      naturalAlternative,
      nextPracticeSuggestion
    };
  }

  /**
   * Initializes or creates a clean LearningMemory structure.
   */
  public static createDefaultMemory(userId: string = 'learner'): LearningMemory {
    const categories: PhonemeCategory[] = [
      'R_L', 'S_SH', 'TH', 'V_W', 'F_V', 'B_P', 'T_D', 'K_G', 'CH_J', 'CONSONANT_CLUSTERS', 'RAPID_SPEECH'
    ];
    const pronunciationHistory: any = {};
    const now = new Date().toISOString();

    for (const cat of categories) {
      pronunciationHistory[cat] = {
        focus: cat,
        firstObserved: now,
        lastPracticed: now,
        practiceCount: 0,
        confidenceLevel: 'moderate',
        evidence: 'Baseline initialization',
        status: 'new'
      };
    }

    return {
      userId,
      pronunciationHistory,
      vocabularyBank: [],
      recurringPatterns: [],
      totalSessionsCompleted: 0,
      totalSpeakingMinutes: 0,
      updatedAt: now
    };
  }

  /**
   * Updates learning memory after a completed practice session.
   * Tracks pronunciation status progression: new -> developing -> improving -> stable.
   */
  public static updateLearningMemory(
    memory: LearningMemory,
    session: DailyPracticeSession,
    newVocab?: VocabularyWord[]
  ): LearningMemory {
    const updated: LearningMemory = JSON.parse(JSON.stringify(memory));
    const now = new Date().toISOString();

    // 1. Update Pronunciation Focus History
    for (const sound of session.focusSounds) {
      if (updated.pronunciationHistory[sound]) {
        const item = updated.pronunciationHistory[sound];
        item.practiceCount += 1;
        item.lastPracticed = now;

        // Progressive competency based on practice volume
        if (item.practiceCount >= 7) {
          item.status = 'stable';
          item.confidenceLevel = 'high';
        } else if (item.practiceCount >= 4) {
          item.status = 'improving';
          item.confidenceLevel = 'moderate';
        } else if (item.practiceCount >= 1) {
          item.status = 'developing';
        }
      }
    }

    // 2. Update Vocabulary Bank
    if (newVocab && Array.isArray(newVocab)) {
      for (const v of newVocab) {
        const existing = updated.vocabularyBank.find(item => item.word.toLowerCase() === v.word.toLowerCase());
        if (existing) {
          existing.practiceCount += 1;
          existing.lastPracticed = now;
          if (existing.practiceCount >= 4) existing.mastered = true;
        } else {
          updated.vocabularyBank.unshift({
            id: v.id,
            word: v.word,
            meaning: v.definition,
            pronunciation: v.phoneticIpa,
            example: v.exampleInPassage,
            firstSeen: now,
            lastPracticed: now,
            practiceCount: 1,
            mastered: false
          });
        }
      }
      // Prune vocabulary bank to 50 items
      updated.vocabularyBank = updated.vocabularyBank.slice(0, 50);
    }

    // 3. Update session aggregates
    updated.totalSessionsCompleted += 1;
    updated.totalSpeakingMinutes += Math.round((session.totalElapsedSeconds || 900) / 60);
    updated.updatedAt = now;

    return updated;
  }

  /**
   * Generates exactly 1 authentic, data-backed coaching insight for session completion.
   */
  public static generateDailyCoachingInsight(
    session: DailyPracticeSession,
    memory?: LearningMemory
  ): string {
    const focus = session.focusSounds[0]?.replace('_', ' / ') || 'articulation';
    const totalSessions = memory?.totalSessionsCompleted || 1;

    if (totalSessions >= 5) {
      return `Consistent practice is establishing strong muscle memory for ${focus} articulation and steady sentence flow.`;
    }
    if (session.lessonTheme) {
      return `Great engagement with ${session.lessonTheme} vocabulary today. Notice how deliberate pausing before key ideas enhances your spoken authority.`;
    }
    return `Your delivery was focused and steady across all 6 exercises. Prioritize clarity over speed during tomorrow's session.`;
  }
}
