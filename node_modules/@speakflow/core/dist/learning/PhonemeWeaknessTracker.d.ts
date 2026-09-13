import { UserSkillProfile, SessionResult } from '../types/index.js';
export declare class PhonemeWeaknessTracker {
    /**
     * Updates user skill profile dynamically after a practice session.
     */
    static updateProfileFromSession(profile: UserSkillProfile, result: SessionResult): UserSkillProfile;
    /**
     * Initializes a balanced default skill profile for onboarding.
     */
    static createDefaultSkillProfile(): UserSkillProfile;
}
//# sourceMappingURL=PhonemeWeaknessTracker.d.ts.map