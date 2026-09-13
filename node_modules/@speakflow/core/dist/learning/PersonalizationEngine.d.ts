import { DailyLesson, UserSkillProfile, PassageTopic, EnglishLevel } from '../types/index.js';
export declare class PersonalizationEngine {
    /**
     * Generates a fully personalized Daily Practice Lesson tailored to the learner's weaknesses.
     */
    static generateLesson(profile: UserSkillProfile, targetLevel?: EnglishLevel, preferredTopic?: PassageTopic): DailyLesson;
}
//# sourceMappingURL=PersonalizationEngine.d.ts.map