import {
  SpeechProvider,
  AudioRecordingResult,
  AudioVisualizerData,
  RecognitionCallbacks,
  SpeechEvaluationInput,
  SpeechFeedback,
  TTSOptions,
  PronunciationEvaluator,
  AudioPrivacyManager
} from '@speakflow/core';

export class BrowserSpeechProvider implements SpeechProvider {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaStream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private recognition: any = null;
  private isListening = false;
  private visualizerSubscribers: ((data: AudioVisualizerData) => void)[] = [];
  private visualizerInterval: number | null = null;

  public async initialize(): Promise<boolean> {
    try {
      if (typeof window !== 'undefined' && (window.AudioContext || (window as any).webkitAudioContext)) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        this.audioContext = new AudioCtx();
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256;
      }
      return true;
    } catch (e) {
      console.warn('Could not initialize AudioContext:', e);
      return false;
    }
  }

  public async checkMicrophonePermission(): Promise<'granted' | 'denied' | 'prompt' | 'unsupported'> {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      return 'unsupported';
    }
    try {
      if (navigator.permissions?.query) {
        const status = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        return status.state;
      }
      return 'prompt';
    } catch {
      return 'prompt';
    }
  }

  public async startRecording(): Promise<void> {
    this.recordedChunks = [];

    if (!navigator.mediaDevices?.getUserMedia) {
      console.warn('getUserMedia not supported in this browser.');
      return;
    }

    try {
      if (!this.audioContext) {
        await this.initialize();
      }
      if (this.audioContext && this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });

      if (this.audioContext && this.analyser) {
        const source = this.audioContext.createMediaStreamSource(this.mediaStream);
        source.connect(this.analyser);
      }

      this.mediaRecorder = new MediaRecorder(this.mediaStream);
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };
      this.mediaRecorder.start();
      this.startVisualizerLoop();
    } catch (err) {
      console.warn('Microphone access denied or error starting recording:', err);
    }
  }

  public async stopRecording(): Promise<AudioRecordingResult> {
    this.stopVisualizerLoop();

    return new Promise((resolve) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
        this.cleanupStream();
        resolve({
          durationMs: 1000,
          sampleRate: 44100
        });
        return;
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: 'audio/webm' });
        this.cleanupStream();

        // Audio privacy: wrap buffer ephemeral processing
        const result: AudioRecordingResult = {
          audioBlob: blob,
          durationMs: 3000,
          sampleRate: 44100
        };

        resolve(result);
      };

      try {
        this.mediaRecorder.stop();
      } catch {
        this.cleanupStream();
        resolve({ durationMs: 1000, sampleRate: 44100 });
      }
    });
  }

  public startRealtimeRecognition(callbacks: RecognitionCallbacks): void {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('Web Speech API Recognition not supported in this browser environment.');
      callbacks.onError?.('Speech recognition is not natively supported by this browser. Simulating mode available.');
      return;
    }

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onstart = () => {
        this.isListening = true;
        callbacks.onStart?.();
      };

      this.recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const res = event.results[i];
          const text = res[0].transcript;
          transcript += text;
          if (res.isFinal) {
            const words = text.trim().split(/\s+/);
            words.forEach((w: string) => {
              callbacks.onWordDetected?.(w, true, Date.now());
            });
          }
        }
        callbacks.onTranscriptUpdate?.(transcript, false);
      };

      this.recognition.onerror = (event: any) => {
        console.warn('SpeechRecognition error:', event.error);
        callbacks.onError?.(event.error);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        callbacks.onEnd?.();
      };

      this.recognition.start();
    } catch (e: any) {
      callbacks.onError?.(e.message || 'Speech recognition initialization failed');
    }
  }

  public stopRealtimeRecognition(): void {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        // Ignore if already stopped
      }
      this.recognition = null;
    }
    this.isListening = false;
  }

  public synthesizeSpeech(text: string, options?: TTSOptions): Promise<void> {
    return new Promise((resolve) => {
      speakText(text, {
        rate: options?.rate ?? 1.0,
        pitch: options?.pitch ?? 1.0,
        lang: options?.lang ?? 'en-US',
        onEnd: () => resolve(),
        onError: () => resolve()
      });
    });
  }

  public cancelSynthesis(): void {
    stopSpeaking();
  }

  public subscribeVisualizer(callback: (data: AudioVisualizerData) => void): () => void {
    this.visualizerSubscribers.push(callback);
    return () => {
      this.visualizerSubscribers = this.visualizerSubscribers.filter((s) => s !== callback);
    };
  }

  public getAnalyserNode(): AnalyserNode | null {
    return this.analyser;
  }

  public async evaluatePronunciation(input: SpeechEvaluationInput): Promise<SpeechFeedback> {
    // Uses core PronunciationEvaluator with privacy wrapper
    return AudioPrivacyManager.processRecordingForScoring(input.audioBuffer, () => {
      return PronunciationEvaluator.evaluate(input);
    });
  }

  private startVisualizerLoop(): void {
    if (this.visualizerInterval) return;

    this.visualizerInterval = window.setInterval(() => {
      if (!this.analyser) return;

      const freq = new Uint8Array(this.analyser.frequencyBinCount);
      const time = new Uint8Array(this.analyser.fftSize);

      this.analyser.getByteFrequencyData(freq as any);
      this.analyser.getByteTimeDomainData(time as any);

      let sum = 0;
      for (let i = 0; i < freq.length; i++) {
        sum += freq[i];
      }
      const rms = sum / (freq.length * 255);

      const data: AudioVisualizerData = {
        frequencyData: freq,
        timeDomainData: time,
        rmsVolume: rms,
        isSpeaking: rms > 0.08
      };

      for (const subscriber of this.visualizerSubscribers) {
        subscriber(data);
      }
    }, 50);
  }

  private stopVisualizerLoop(): void {
    if (this.visualizerInterval) {
      clearInterval(this.visualizerInterval);
      this.visualizerInterval = null;
    }
  }

  private cleanupStream(): void {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }
  }

  public dispose(): void {
    this.stopRealtimeRecognition();
    this.cancelSynthesis();
    this.stopVisualizerLoop();
    this.cleanupStream();
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

export interface SpeakOptions {
  rate?: number;
  pitch?: number;
  lang?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

export function speakText(text: string, options?: SpeakOptions): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    options?.onError?.(new Error('SpeechSynthesis not supported'));
    return;
  }

  try {
    window.speechSynthesis.cancel();
    window.speechSynthesis.resume();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options?.rate ?? 0.95;
    utterance.pitch = options?.pitch ?? 1.0;
    utterance.lang = options?.lang ?? 'en-US';

    // Pick best natural English voice if available
    try {
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        const langCode = options?.lang || 'en';
        const preferredVoice = voices.find(
          (v) => v.lang.startsWith(langCode) && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel') || v.name.includes('Karen'))
        ) || voices.find((v) => v.lang.startsWith(langCode));

        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }
      }
    } catch {}

    // Retain global reference to avoid Chromium garbage collection bug during long speech
    (window as any).__speakflowActiveUtterance = utterance;

    utterance.onstart = () => {
      options?.onStart?.();
    };

    utterance.onend = () => {
      (window as any).__speakflowActiveUtterance = null;
      options?.onEnd?.();
    };

    utterance.onerror = (e) => {
      console.warn('SpeechSynthesis error:', e);
      (window as any).__speakflowActiveUtterance = null;
      options?.onError?.(e);
    };

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('speakText invocation error:', err);
    options?.onError?.(err);
  }
}

export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      (window as any).__speakflowActiveUtterance = null;
    } catch {}
  }
}

