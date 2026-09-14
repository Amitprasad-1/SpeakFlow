export type PhonemeCategory = 'S_SH' | 'R_L' | 'TH' | 'B_P' | 'V_W' | 'F_V' | 'T_D' | 'K_G' | 'CH_J' | 'CONSONANT_CLUSTERS' | 'RAPID_SPEECH';
export interface PhonemeTarget {
    category: PhonemeCategory;
    label: string;
    description: string;
    targetSounds: string[];
    commonMistakePattern: string;
    practiceTip: string;
}
export interface WordAlignment {
    word: string;
    spokenWord?: string;
    status: 'correct' | 'hesitated' | 'skipped' | 'mispronounced' | 'pending';
    startTime?: number;
    endTime?: number;
    confidence?: number;
    targetPhoneme?: PhonemeCategory;
}
export interface SpeechEvaluationInput {
    targetText: string;
    spokenTranscript: string;
    durationMs: number;
    audioBuffer?: ArrayBuffer;
    expectedWordCount: number;
    wordTimestamps?: {
        word: string;
        timestamp: number;
    }[];
    targetPhonemes?: PhonemeCategory[];
}
export interface SpeechFeedback {
    pronunciationScore: number;
    clarityScore: number;
    fluencyScore: number;
    paceScore: number;
    accuracyScore: number;
    overallScore: number;
    wordsPerMinute: number;
    wordCount: number;
    skippedWords: string[];
    hesitationsCount: number;
    mispronouncedWords: string[];
    identifiedWeakSounds: PhonemeCategory[];
    actionableFeedback: string[];
    wordAlignments: WordAlignment[];
}
export interface TTSOptions {
    rate?: number;
    pitch?: number;
    voiceName?: string;
    lang?: string;
}
export interface AudioRecordingResult {
    audioBlob?: Blob;
    audioBuffer?: ArrayBuffer;
    durationMs: number;
    sampleRate: number;
}
export interface RecognitionCallbacks {
    onStart?: () => void;
    onWordDetected?: (word: string, isFinal: boolean, timestamp: number) => void;
    onTranscriptUpdate?: (transcript: string, isFinal: boolean) => void;
    onSpeechEnd?: () => void;
    onError?: (error: string) => void;
    onEnd?: () => void;
    autoEndOnSilence?: boolean;
    silenceThresholdMs?: number;
    onSilenceDetected?: (transcript: string) => void;
    noSpeechTimeoutMs?: number;
    onNoSpeechTimeout?: () => void;
}
export interface AudioVisualizerData {
    frequencyData: Uint8Array;
    timeDomainData: Uint8Array;
    rmsVolume: number;
    isSpeaking: boolean;
}
//# sourceMappingURL=speech.d.ts.map