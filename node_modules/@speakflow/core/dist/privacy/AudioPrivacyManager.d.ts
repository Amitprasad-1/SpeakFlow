export interface PrivacySettings {
    allowVoiceDataRetention: boolean;
    anonymizeAnalytics: boolean;
    wipeAudioBufferImmediately: boolean;
}
export declare class AudioPrivacyManager {
    private static settings;
    static getSettings(): PrivacySettings;
    static updateSettings(newSettings: Partial<PrivacySettings>): void;
    /**
     * Securely zeroes out in-memory audio buffers immediately after evaluation.
     */
    static wipeBuffer(buffer?: ArrayBuffer | Float32Array): void;
    /**
     * Enforces privacy policy on recording result.
     */
    static processRecordingForScoring<T>(buffer: ArrayBuffer | undefined, processor: () => T): T;
    /**
     * Sanitizes user inputs before sending to any cloud AI provider.
     */
    static sanitizeLinguisticInput(text: string): string;
}
//# sourceMappingURL=AudioPrivacyManager.d.ts.map