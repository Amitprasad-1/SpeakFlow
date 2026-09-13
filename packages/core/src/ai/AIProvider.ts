import {
  DailyLesson,
  ReadingPassage,
  VocabularyWord,
  PracticeSentence,
  TongueTwister,
  ListeningExercise,
  SpeakingScenario,
  ConversationMessage,
  SpeakingEvaluationReport,
  PhonemeCategory,
  EnglishLevel,
  PassageTopic,
  UserSkillProfile,
  SessionResult
} from '../types/index.js';

export interface AIProviderConfig {
  apiKey?: string;
  modelName?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ConversationReply {
  replyText: string;
  grammarCorrection?: string;
  naturalAlternative?: string;
  pronunciationHint?: string;
  turnFeedback?: string;
}

export interface AIProvider {
  id: string;
  name: string;

  /**
   * Generates a fully personalized Daily Practice Lesson.
   */
  generateDailyLesson(profile: UserSkillProfile, preferredTopic?: PassageTopic): Promise<DailyLesson>;

  /**
   * Generates a 160-200 word reading passage targeting specific weak sounds.
   */
  generateReadingPassage(
    topic: PassageTopic,
    weakSounds: PhonemeCategory[],
    level: EnglishLevel
  ): Promise<ReadingPassage>;

  /**
   * Extracts or generates 6 articulation-heavy multisyllabic vocabulary words.
   */
  generateVocabulary(passageText: string, targetPhonemes: PhonemeCategory[]): Promise<VocabularyWord[]>;

  /**
   * Generates 10-15 practical English sentences focused on specific sounds.
   */
  generateSentences(focusPhonemes: PhonemeCategory[], level: EnglishLevel): Promise<PracticeSentence[]>;

  /**
   * Generates a tongue twister for a specific phoneme category.
   */
  generateTongueTwister(category: PhonemeCategory, difficulty: 'easy' | 'medium' | 'hard'): Promise<TongueTwister>;

  /**
   * Generates an audio listening exercise with comprehension quiz.
   */
  generateListeningExercise(level: EnglishLevel, topic?: PassageTopic): Promise<ListeningExercise>;

  /**
   * Generates conversational AI partner reply for speaking simulation.
   */
  generateConversationReply(
    scenario: SpeakingScenario,
    history: ConversationMessage[]
  ): Promise<ConversationReply>;

  /**
   * Generates comprehensive end-of-conversation evaluation report.
   */
  evaluateConversation(
    scenario: SpeakingScenario,
    history: ConversationMessage[]
  ): Promise<SpeakingEvaluationReport>;
}
