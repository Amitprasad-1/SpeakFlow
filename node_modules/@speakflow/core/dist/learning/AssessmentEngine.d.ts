import { BaselineAssessment, SpeakingAssessmentResult, ReadingAssessmentResult, PronunciationItemResult, RecommendedPracticePlan } from '../types/assessment.js';
import { UserProfile } from '../types/user.js';
import { PhonemeCategory } from '../types/speech.js';
import { BaselineSpeakingPrompt, BaselineReadingPassage } from '../domain/baselineCatalogs.js';
export declare class AssessmentEngine {
    /**
     * Evaluates a spontaneous speaking prompt attempt with honest metric observation.
     */
    static evaluateSpeakingAttempt(prompt: BaselineSpeakingPrompt, spokenTranscript: string, durationMs: number): SpeakingAssessmentResult;
    /**
     * Evaluates a reading aloud attempt against the baseline reading passage.
     */
    static evaluateReadingAttempt(passage: BaselineReadingPassage, spokenTranscript: string, durationMs: number): ReadingAssessmentResult;
    /**
     * Evaluates a pronunciation word pair attempt (e.g. "red" / "led").
     */
    static evaluatePronunciationAttempt(soundGroup: PhonemeCategory, targetPair: [string, string], spokenTranscript: string, attemptNumber?: number): PronunciationItemResult;
    /**
     * Synthesizes assessment observations into constructive strengths, focus areas, and recommended sounds.
     */
    static createInitialFocusAreas(assessment: BaselineAssessment): {
        strengths: string[];
        focusAreas: string[];
        recommendedSounds: PhonemeCategory[];
        primarySound: PhonemeCategory;
        secondarySound: PhonemeCategory;
    };
    /**
     * Generates the tailored 15-minute first practice plan based on the assessment.
     */
    static createInitialPracticePlan(assessment: BaselineAssessment): RecommendedPracticePlan;
    /**
     * Builds the complete UserProfile and skill profile from the baseline assessment.
     */
    static buildInitialLearnerProfile(assessment: BaselineAssessment): UserProfile;
}
//# sourceMappingURL=AssessmentEngine.d.ts.map