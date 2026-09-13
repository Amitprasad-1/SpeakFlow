import { AudioRecordingResult, AudioVisualizerData, RecognitionCallbacks, SpeechEvaluationInput, SpeechFeedback, TTSOptions } from '../types/index.js';
export interface SpeechProvider {
    /**
     * Initializes audio context and requests microphone access.
     */
    initialize(): Promise<boolean>;
    /**
     * Starts recording audio ephemerally.
     */
    startRecording(): Promise<void>;
    /**
     * Stops recording audio and returns ephemeral buffer/blob.
     */
    stopRecording(): Promise<AudioRecordingResult>;
    /**
     * Starts real-time continuous speech recognition.
     */
    startRealtimeRecognition(callbacks: RecognitionCallbacks): void;
    /**
     * Stops active real-time speech recognition.
     */
    stopRealtimeRecognition(): void;
    /**
     * Synthesizes text into spoken audio with rate, pitch, and voice settings.
     */
    synthesizeSpeech(text: string, options?: TTSOptions): Promise<void>;
    /**
     * Stops any active speech synthesis.
     */
    cancelSynthesis(): void;
    /**
     * Subscribes to real-time audio visualization data stream (60fps).
     */
    subscribeVisualizer(callback: (data: AudioVisualizerData) => void): () => void;
    /**
     * Evaluates pronunciation and alignment.
     */
    evaluatePronunciation(input: SpeechEvaluationInput): Promise<SpeechFeedback>;
    /**
     * Performs an immediate diagnostic mic check.
     */
    checkMicrophonePermission(): Promise<'granted' | 'denied' | 'prompt' | 'unsupported'>;
    /**
     * Disposes audio context and releases hardware resources.
     */
    dispose(): void;
}
//# sourceMappingURL=SpeechProvider.d.ts.map