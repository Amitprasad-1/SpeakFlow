import { AIProvider, ConversationReply } from './AIProvider.js';
import { DailyLesson, ReadingPassage, VocabularyWord, PracticeSentence, TongueTwister, ListeningExercise, SpeakingScenario, ConversationMessage, SpeakingEvaluationReport, PhonemeCategory, EnglishLevel, PassageTopic, UserSkillProfile } from '../types/index.js';
export declare class LocalAdaptiveAIProvider implements AIProvider {
    id: string;
    name: string;
    generateDailyLesson(profile: UserSkillProfile, preferredTopic?: PassageTopic): Promise<DailyLesson>;
    generateReadingPassage(topic: PassageTopic, weakSounds: PhonemeCategory[], level: EnglishLevel): Promise<ReadingPassage>;
    generateVocabulary(passageText: string, targetPhonemes: PhonemeCategory[]): Promise<VocabularyWord[]>;
    generateSentences(focusPhonemes: PhonemeCategory[], level: EnglishLevel): Promise<PracticeSentence[]>;
    generateTongueTwister(category: PhonemeCategory, difficulty: 'easy' | 'medium' | 'hard'): Promise<TongueTwister>;
    generateListeningExercise(level: EnglishLevel, topic?: PassageTopic): Promise<ListeningExercise>;
    generateConversationReply(scenario: SpeakingScenario, history: ConversationMessage[]): Promise<ConversationReply>;
    evaluateConversation(scenario: SpeakingScenario, history: ConversationMessage[]): Promise<SpeakingEvaluationReport>;
}
//# sourceMappingURL=LocalAdaptiveAIProvider.d.ts.map