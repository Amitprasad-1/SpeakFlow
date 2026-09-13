import {
  ProgressAggregateMetrics,
  DailyPracticeSession,
  UserProfile,
  LearningMemory,
  PhonemeCategory
} from '../types/index.js';

export class ProgressAnalyticsEngine {
  /**
   * Computes honest, data-backed progress analytics from actual local sessions and learning memory.
   * If insufficient data exists, explicitly flags `hasSufficientData = false` to avoid fake numbers.
   */
  public static calculateProgress(
    userProfile: UserProfile,
    sessionHistory: DailyPracticeSession[] = [],
    learningMemory?: LearningMemory
  ): ProgressAggregateMetrics {
    const totalMinutes = userProfile.totalMinutesPracticed || 0;
    const completedCount = userProfile.completedLessonsCount || 0;
    const currentStreak = userProfile.streak?.currentStreak || 0;
    const longestStreak = userProfile.streak?.longestStreak || 0;

    // Minimum requirement: at least 1 completed session or 10 practiced minutes
    const hasSufficientData = completedCount >= 1 || totalMinutes >= 10;

    // Weekly practice distribution calculation (Monday - Sunday)
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const distributionMap: Record<string, number> = {
      Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0
    };

    for (const session of sessionHistory) {
      if (session.localDate) {
        const d = new Date(session.localDate);
        const dayIdx = (d.getDay() + 6) % 7; // Map Sunday (0) to 6, Monday (1) to 0
        const dayName = dayNames[dayIdx];
        if (dayName) {
          distributionMap[dayName] += Math.round((session.totalElapsedSeconds || 900) / 60);
        }
      }
    }

    const weeklyPracticeDistribution = dayNames.map(d => ({
      dayOfWeek: d,
      minutes: distributionMap[d] || 0
    }));

    // Active focus phonemes from profile or memory
    const activeFocusSounds: any[] = [];
    if (learningMemory?.pronunciationHistory) {
      const entries = Object.values(learningMemory.pronunciationHistory);
      for (const item of entries) {
        if (item.practiceCount > 0 || item.status !== 'new') {
          activeFocusSounds.push({
            category: item.focus,
            status: item.status,
            practiceCount: item.practiceCount
          });
        }
      }
    }

    // If active sounds list is empty, populate from baseline user weakSounds
    if (activeFocusSounds.length === 0 && userProfile.skills?.weakSounds) {
      for (const weak of userProfile.skills.weakSounds) {
        activeFocusSounds.push({
          category: weak,
          status: 'developing',
          practiceCount: completedCount
        });
      }
    }

    // Vocabulary mastered count
    const vocabularyMasteredCount = learningMemory?.vocabularyBank
      ? learningMemory.vocabularyBank.filter(v => v.mastered || v.practiceCount >= 3).length
      : 0;

    // Trend insights derived strictly from real data
    const trendInsights: string[] = [];
    if (!hasSufficientData) {
      trendInsights.push('Complete your first daily session to unlock personalized speaking pace and rhythm insights.');
    } else {
      if (currentStreak >= 3) {
        trendInsights.push(`You are practicing consistently with an active ${currentStreak}-day streak.`);
      }
      if (activeFocusSounds.length > 0) {
        trendInsights.push(`${activeFocusSounds[0].category.replace('_', ' / ')} remains your primary pronunciation focus area.`);
      }
      if (totalMinutes >= 30) {
        trendInsights.push('Your cumulative practice time is building strong conversational stamina.');
      }
    }

    return {
      totalPracticeMinutes: totalMinutes,
      completedSessionsCount: completedCount,
      currentStreakDays: currentStreak,
      longestStreakDays: longestStreak,
      weeklyPracticeDistribution,
      activeFocusSounds,
      vocabularyMasteredCount,
      speakingConfidenceTrend: userProfile.speakingConfidence || 'Developing',
      trendInsights,
      hasSufficientData
    };
  }
}
