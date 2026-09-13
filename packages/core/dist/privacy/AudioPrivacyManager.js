"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioPrivacyManager = void 0;
class AudioPrivacyManager {
    static settings = {
        allowVoiceDataRetention: false,
        anonymizeAnalytics: true,
        wipeAudioBufferImmediately: true
    };
    static getSettings() {
        return { ...this.settings };
    }
    static updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
    }
    /**
     * Securely zeroes out in-memory audio buffers immediately after evaluation.
     */
    static wipeBuffer(buffer) {
        if (!buffer)
            return;
        try {
            if (buffer instanceof Float32Array) {
                buffer.fill(0);
            }
            else if (buffer instanceof ArrayBuffer) {
                new Uint8Array(buffer).fill(0);
            }
        }
        catch {
            // Buffer might be detached
        }
    }
    /**
     * Enforces privacy policy on recording result.
     */
    static processRecordingForScoring(buffer, processor) {
        try {
            return processor();
        }
        finally {
            if (this.settings.wipeAudioBufferImmediately) {
                this.wipeBuffer(buffer);
            }
        }
    }
    /**
     * Sanitizes user inputs before sending to any cloud AI provider.
     */
    static sanitizeLinguisticInput(text) {
        if (!text)
            return '';
        // Strip common sensitive identifiers like emails, phone numbers, credit cards
        return text
            .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]')
            .replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE]')
            .replace(/\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g, '[CARD]');
    }
}
exports.AudioPrivacyManager = AudioPrivacyManager;
//# sourceMappingURL=AudioPrivacyManager.js.map