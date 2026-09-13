export interface PrivacySettings {
  allowVoiceDataRetention: boolean; // Default false
  anonymizeAnalytics: boolean;      // Default true
  wipeAudioBufferImmediately: boolean; // Default true
}

export class AudioPrivacyManager {
  private static settings: PrivacySettings = {
    allowVoiceDataRetention: false,
    anonymizeAnalytics: true,
    wipeAudioBufferImmediately: true
  };

  public static getSettings(): PrivacySettings {
    return { ...this.settings };
  }

  public static updateSettings(newSettings: Partial<PrivacySettings>): void {
    this.settings = { ...this.settings, ...newSettings };
  }

  /**
   * Securely zeroes out in-memory audio buffers immediately after evaluation.
   */
  public static wipeBuffer(buffer?: ArrayBuffer | Float32Array): void {
    if (!buffer) return;
    try {
      if (buffer instanceof Float32Array) {
        buffer.fill(0);
      } else if (buffer instanceof ArrayBuffer) {
        new Uint8Array(buffer).fill(0);
      }
    } catch {
      // Buffer might be detached
    }
  }

  /**
   * Enforces privacy policy on recording result.
   */
  public static processRecordingForScoring<T>(
    buffer: ArrayBuffer | undefined,
    processor: () => T
  ): T {
    try {
      return processor();
    } finally {
      if (this.settings.wipeAudioBufferImmediately) {
        this.wipeBuffer(buffer);
      }
    }
  }

  /**
   * Sanitizes user inputs before sending to any cloud AI provider.
   */
  public static sanitizeLinguisticInput(text: string): string {
    if (!text) return '';
    // Strip common sensitive identifiers like emails, phone numbers, credit cards
    return text
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]')
      .replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE]')
      .replace(/\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g, '[CARD]');
  }
}
