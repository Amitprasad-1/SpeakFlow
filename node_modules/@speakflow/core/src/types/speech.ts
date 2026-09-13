export type PhonemeCategory =
  | 'S_SH'
  | 'R_L'
  | 'TH'
  | 'B_P'
  | 'V_W'
  | 'F_V'
  | 'T_D'
  | 'K_G'
  | 'CH_J'
  | 'CONSONANT_CLUSTERS'
  | 'RAPID_SPEECH';

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
  wordTimestamps?: { word: string; timestamp: number }[];
  targetPhonemes?: PhonemeCategory[];
}

export interface SpeechFeedback {
  pronunciationScore: number; // 0-100
  clarityScore: number;       // 0-100
  fluencyScore: number;       // 0-100
  paceScore: number;          // 0-100
  accuracyScore: number;      // 0-100
  overallScore: number;       // 0-100
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
  rate?: number; // 0.5 to 2.0 (default 1.0)
  pitch?: number; // 0.5 to 1.5 (default 1.0)
  voiceName?: string;
  lang?: string; // 'en-US', 'en-GB'
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
  onError?: (error: string) => void;
  onEnd?: () => void;
}

export interface AudioVisualizerData {
  frequencyData: Uint8Array;
  timeDomainData: Uint8Array;
  rmsVolume: number; // 0.0 to 1.0
  isSpeaking: boolean;
}
