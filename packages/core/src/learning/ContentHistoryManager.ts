/**
 * ContentHistoryManager
 *
 * Tracks recently used practice content (reading passages, tongue twisters,
 * practical sentences, speaking scenarios, and listening exercises) to prevent
 * immediate repetition across consecutive days.
 */

export interface ContentHistoryRecord {
  date: string; // YYYY-MM-DD
  readingPassageId?: string;
  tongueTwisterIds: string[];
  sentenceIds: string[];
  speakingScenarioIds: string[];
  listeningExerciseId?: string;
  themeTopic?: string;
}

export interface ContentHistoryData {
  records: ContentHistoryRecord[]; // sorted newest first, pruned to e.g. 14 days
}

export class ContentHistoryManager {
  private history: ContentHistoryData;
  private maxRetentionDays: number;

  constructor(initialData?: ContentHistoryData, maxRetentionDays: number = 14) {
    this.history = initialData && Array.isArray(initialData.records)
      ? { records: [...initialData.records] }
      : { records: [] };
    this.maxRetentionDays = maxRetentionDays;
  }

  public getData(): ContentHistoryData {
    return { records: [...this.history.records] };
  }

  /**
   * Records completed or generated session content into history.
   */
  public recordSession(
    date: string,
    content: {
      readingPassageId?: string;
      tongueTwisterIds?: string[];
      sentenceIds?: string[];
      speakingScenarioIds?: string[];
      listeningExerciseId?: string;
      themeTopic?: string;
    }
  ): void {
    // Remove any previous entry for this exact date to allow clean overwrite
    this.history.records = this.history.records.filter((r) => r.date !== date);

    const record: ContentHistoryRecord = {
      date,
      readingPassageId: content.readingPassageId,
      tongueTwisterIds: content.tongueTwisterIds || [],
      sentenceIds: content.sentenceIds || [],
      speakingScenarioIds: content.speakingScenarioIds || [],
      listeningExerciseId: content.listeningExerciseId,
      themeTopic: content.themeTopic
    };

    this.history.records.unshift(record);

    // Prune older than retention window
    if (this.history.records.length > this.maxRetentionDays) {
      this.history.records = this.history.records.slice(0, this.maxRetentionDays);
    }
  }

  /**
   * Retrieves all IDs used in the last `daysBack` days (excluding target date if checking before recording).
   */
  public getRecentlyUsedPassageIds(daysBack: number = 7): Set<string> {
    const ids = new Set<string>();
    const slice = this.history.records.slice(0, daysBack);
    for (const rec of slice) {
      if (rec.readingPassageId) ids.add(rec.readingPassageId);
    }
    return ids;
  }

  public getRecentlyUsedTwisterIds(daysBack: number = 7): Set<string> {
    const ids = new Set<string>();
    const slice = this.history.records.slice(0, daysBack);
    for (const rec of slice) {
      for (const id of rec.tongueTwisterIds) ids.add(id);
    }
    return ids;
  }

  public getRecentlyUsedSentenceIds(daysBack: number = 7): Set<string> {
    const ids = new Set<string>();
    const slice = this.history.records.slice(0, daysBack);
    for (const rec of slice) {
      for (const id of rec.sentenceIds) ids.add(id);
    }
    return ids;
  }

  public getRecentlyUsedScenarioIds(daysBack: number = 7): Set<string> {
    const ids = new Set<string>();
    const slice = this.history.records.slice(0, daysBack);
    for (const rec of slice) {
      for (const id of rec.speakingScenarioIds) ids.add(id);
    }
    return ids;
  }

  public getRecentlyUsedListeningIds(daysBack: number = 7): Set<string> {
    const ids = new Set<string>();
    const slice = this.history.records.slice(0, daysBack);
    for (const rec of slice) {
      if (rec.listeningExerciseId) ids.add(rec.listeningExerciseId);
    }
    return ids;
  }

  public getRecentlyUsedTopics(daysBack: number = 4): Set<string> {
    const topics = new Set<string>();
    const slice = this.history.records.slice(0, daysBack);
    for (const rec of slice) {
      if (rec.themeTopic) topics.add(rec.themeTopic);
    }
    return topics;
  }
}
