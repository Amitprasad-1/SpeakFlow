import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Shuffle,
  Volume2,
  Download,
  Flame,
  Zap,
  ArrowRight,
  HelpCircle,
  Award,
  ChevronRight
} from 'lucide-react';
import { GeminiAIService, SpeechAnalysisReport } from '../../services/GeminiAIService';

interface TopicItem {
  id: string;
  category: string;
  topic: string;
  guideQuestions: string[];
}

const CURATED_TOPICS: TopicItem[] = [
  {
    id: 't_ai',
    category: 'Technology & AI',
    topic: 'How Artificial Intelligence is Changing Our Daily Habits',
    guideQuestions: [
      'What is one AI tool you use daily?',
      'Is AI making people more productive or more dependent?',
      'How do you envision the next 5 years?'
    ]
  },
  {
    id: 't_career',
    category: 'Career & Growth',
    topic: 'The Most Important Lesson I Learned from a Difficult Mistake',
    guideQuestions: [
      'What was the situation or mistake?',
      'How did you take ownership and fix it?',
      'How has it shaped your approach to work today?'
    ]
  },
  {
    id: 't_remote',
    category: 'Workplace Culture',
    topic: 'Working from Home vs Working in an Office: Which is Better?',
    guideQuestions: [
      'What are the distinct advantages of each mode?',
      'How does remote work impact collaboration and mental focus?',
      'What is your ideal balance?'
    ]
  },
  {
    id: 't_travel',
    category: 'Personal Life',
    topic: 'A Memorable Place That Changed My Perspective on Life',
    guideQuestions: [
      'Where was this place and why did you go?',
      'What happened that surprised or moved you?',
      'What did you learn about people or culture?'
    ]
  },
  {
    id: 't_habit',
    category: 'Self Improvement',
    topic: 'One Daily Habit That Everyone Should Build for Success',
    guideQuestions: [
      'What is the habit and why is it powerful?',
      'How does it compound over weeks and months?',
      'What is the easiest way to start it without quitting?'
    ]
  },
  {
    id: 't_leadership',
    category: 'Leadership & Opinions',
    topic: 'What Makes a Truly Inspiring Leader in Modern Times?',
    guideQuestions: [
      'Is leadership about authority or empathy and listening?',
      'Think of an inspiring leader you admire.',
      'How should a leader handle criticism and pressure?'
    ]
  }
];

export const ImpromptuSpeakingTab: React.FC = () => {
  // Setup Stage
  const [selectedTopic, setSelectedTopic] = useState<TopicItem>(CURATED_TOPICS[0]);
  const [customTopicInput, setCustomTopicInput] = useState<string>('');
  const [targetDuration, setTargetDuration] = useState<60 | 120 | 300>(60); // 1m, 2m, 5m
  const [prepDuration, setPrepDuration] = useState<15 | 20>(15); // 15s or 20s
  const [recordMode, setRecordMode] = useState<'audio' | 'video'>('video');

  // Phases: 'setup' -> 'prep' -> 'speaking' -> 'analyzing' -> 'feedback'
  const [phase, setPhase] = useState<'setup' | 'prep' | 'speaking' | 'analyzing' | 'feedback'>('setup');

  // Timers
  const [prepSecondsRemaining, setPrepSecondsRemaining] = useState<number>(15);
  const [speakingSecondsElapsed, setSpeakingSecondsElapsed] = useState<number>(0);

  // Streams & Recording
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [recordedMediaUrl, setRecordedMediaUrl] = useState<string | null>(null);
  const [mediaBlob, setMediaBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const liveVideoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const reviewVideoRef = useRef<HTMLVideoElement | null>(null);

  // Live Speech Recognition
  const [liveTranscript, setLiveTranscript] = useState<string>('');
  const speechRecognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef<string>('');

  // Audio level
  const [audioVolume, setAudioVolume] = useState<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // AI Feedback Report
  const [report, setReport] = useState<SpeechAnalysisReport | null>(null);

  // Cleanup media on unmount
  useEffect(() => {
    return () => {
      stopMediaTracks();
      if (speechRecognitionRef.current) {
        try { speechRecognitionRef.current.stop(); } catch {}
      }
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioContextRef.current) audioContextRef.current.close().catch(() => {});
    };
  }, []);

  const stopMediaTracks = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(t => t.stop());
      setMediaStream(null);
    }
  };

  // Setup camera & mic stream
  const initializeMedia = async (mode: 'audio' | 'video'): Promise<MediaStream | null> => {
    try {
      stopMediaTracks();
      const constraints: MediaStreamConstraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: mode === 'video' ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        } : false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setMediaStream(stream);

      if (liveVideoPreviewRef.current && mode === 'video') {
        liveVideoPreviewRef.current.srcObject = stream;
      }

      // Audio visualizer setup
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          audioContextRef.current = ctx;
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 256;
          analyserRef.current = analyser;
          const source = ctx.createMediaStreamSource(stream);
          source.connect(analyser);

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const checkVolume = () => {
            if (!analyserRef.current) return;
            analyserRef.current.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
            const avg = sum / dataArray.length;
            setAudioVolume(Math.min(100, Math.round(avg * 1.5)));
            animFrameRef.current = requestAnimationFrame(checkVolume);
          };
          checkVolume();
        }
      } catch (err) {
        console.warn('AudioContext volume meter failed:', err);
      }

      return stream;
    } catch (err: any) {
      console.error('Failed to get media devices:', err);
      alert('Camera or microphone permission is needed to record your speaking practice.');
      return null;
    }
  };

  // 1. Start Preparation Countdown
  const handleStartPrep = async () => {
    // If custom topic typed
    if (customTopicInput.trim()) {
      setSelectedTopic({
        id: `custom_${Date.now()}`,
        category: 'Custom Topic',
        topic: customTopicInput.trim(),
        guideQuestions: [
          'What is the core idea you want to communicate?',
          'Give a specific real-world example or story.',
          'What is your concluding recommendation?'
        ]
      });
    }

    setPrepSecondsRemaining(prepDuration);
    setPhase('prep');

    // Pre-initialize media during prep so permission is ready
    await initializeMedia(recordMode);
  };

  // Prep countdown timer
  useEffect(() => {
    if (phase !== 'prep') return;

    if (prepSecondsRemaining <= 0) {
      // Transition from prep to live speaking
      startSpeakingRecording();
      return;
    }

    const timer = setTimeout(() => {
      setPrepSecondsRemaining(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [phase, prepSecondsRemaining]);

  // 2. Start Live Speaking & Recording
  const startSpeakingRecording = async () => {
    setSpeakingSecondsElapsed(0);
    setLiveTranscript('');
    finalTranscriptRef.current = '';
    recordedChunksRef.current = [];
    setPhase('speaking');

    let activeStream = mediaStream;
    if (!activeStream) {
      activeStream = await initializeMedia(recordMode);
    }

    if (!activeStream) {
      alert('Unable to access microphone/camera. Please allow permissions.');
      setPhase('setup');
      return;
    }

    // Connect stream to video element
    if (liveVideoPreviewRef.current && recordMode === 'video') {
      liveVideoPreviewRef.current.srcObject = activeStream;
    }

    // MediaRecorder setup
    try {
      const mimeType = recordMode === 'video'
        ? (MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm')
        : 'audio/webm';

      const recorder = new MediaRecorder(activeStream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, {
          type: recordMode === 'video' ? 'video/webm' : 'audio/webm'
        });
        setMediaBlob(blob);
        const url = URL.createObjectURL(blob);
        setRecordedMediaUrl(url);
      };

      recorder.start(500);
    } catch (err) {
      console.warn('MediaRecorder init error:', err);
    }

    // Live Web Speech Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let interim = '';
          let final = '';
          for (let i = 0; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              final += transcript + ' ';
            } else {
              interim += transcript;
            }
          }
          finalTranscriptRef.current = (final + interim).trim();
          setLiveTranscript(finalTranscriptRef.current);
        };

        recognition.onerror = (err: any) => {
          console.warn('Speech recognition error:', err);
        };

        recognition.start();
        speechRecognitionRef.current = recognition;
      } catch (err) {
        console.warn('SpeechRecognition failed to start:', err);
      }
    }
  };

  // Speaking elapsed timer
  useEffect(() => {
    if (phase !== 'speaking') return;

    if (speakingSecondsElapsed >= targetDuration) {
      // Reached target duration! Auto-stop
      handleFinishSpeaking();
      return;
    }

    const timer = setTimeout(() => {
      setSpeakingSecondsElapsed(prev => prev + 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [phase, speakingSecondsElapsed, targetDuration]);

  // 3. Finish Speaking -> Analyze & Generate Feedback
  const handleFinishSpeaking = async () => {
    setPhase('analyzing');

    // Stop recorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    // Stop speech recognition
    if (speechRecognitionRef.current) {
      try { speechRecognitionRef.current.stop(); } catch {}
    }

    stopMediaTracks();

    const durationDone = Math.max(3, speakingSecondsElapsed);
    const spokenText = finalTranscriptRef.current.trim() || liveTranscript.trim() || 'I was thinking about the topic and how it affects our day to day life.';

    // Generate AI Feedback Report
    const feedbackReport = await GeminiAIService.analyzeSpeechPerformance({
      topic: selectedTopic.topic,
      transcript: spokenText,
      durationSeconds: durationDone,
      targetDurationSeconds: targetDuration
    });

    setReport(feedbackReport);
    setPhase('feedback');
  };

  // Pick Random Topic
  const handleRandomTopic = () => {
    const others = CURATED_TOPICS.filter(t => t.id !== selectedTopic.id);
    const random = others[Math.floor(Math.random() * others.length)] || CURATED_TOPICS[0];
    setSelectedTopic(random);
    setCustomTopicInput('');
  };

  // Reset to setup
  const handleReset = () => {
    stopMediaTracks();
    if (recordedMediaUrl) URL.revokeObjectURL(recordedMediaUrl);
    setRecordedMediaUrl(null);
    setMediaBlob(null);
    setReport(null);
    setLiveTranscript('');
    setPhase('setup');
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', paddingBottom: 'var(--space-12)' }}>
      {/* Top Header Card */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(16, 185, 129, 0.08) 100%)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)',
          padding: '24px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-primary)' }}>
              Extempore Simulator
            </span>
            <span style={{ background: 'var(--color-primary-subtle)', color: 'var(--color-primary)', fontSize: '0.6875rem', fontWeight: 700, padding: '2px 8px', borderRadius: 'var(--radius-pill)' }}>
              1 · 2 · 5 Min Drill
            </span>
          </div>
          <h1 style={{ fontSize: 'clamp(1.4rem, 2.5vw, 1.9rem)', fontWeight: 800, margin: 0, color: 'var(--color-text-primary)' }}>
            Impromptu Speaking & AI Video Coach
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', margin: '6px 0 0 0' }}>
            Get a topic, prepare for 15-20 seconds, speak freely with live video/voice, and receive sentence-by-sentence grammar replacements!
          </p>
        </div>

        {phase !== 'setup' && (
          <button
            onClick={handleReset}
            className="tap-interactive"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: 'var(--radius-pill)',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-secondary)',
              fontSize: '0.8125rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <RotateCcw size={14} />
            <span>Start Over</span>
          </button>
        )}
      </div>

      {/* =========================================================================
          PHASE 1: SETUP
          ========================================================================= */}
      {phase === 'setup' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* 1. Topic Selection Card */}
          <div
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              padding: '24px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🎯 Selected Topic</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                  ({selectedTopic.category})
                </span>
              </h2>

              <button
                onClick={handleRandomTopic}
                className="tap-interactive"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-pill)',
                  background: 'var(--color-primary-subtle)',
                  border: '1px solid var(--color-primary-subtle)',
                  color: 'var(--color-primary)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <Shuffle size={13} />
                <span>Surprise Me / Random Topic</span>
              </button>
            </div>

            {/* Featured Topic Display */}
            <div
              style={{
                background: 'var(--color-surface-sunken)',
                border: '1px solid var(--color-border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '18px 20px',
                marginBottom: '18px'
              }}
            >
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-primary)', lineHeight: 1.35 }}>
                "{selectedTopic.topic}"
              </div>

              {/* Guide questions */}
              <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                  Brainstorming Angles:
                </span>
                {selectedTopic.guideQuestions.map((q, idx) => (
                  <div key={idx} style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>•</span>
                    <span>{q}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Topic catalog quick chips */}
            <div style={{ marginBottom: '16px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', marginBottom: '8px' }}>
                Or pick another topic:
              </span>
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                {CURATED_TOPICS.map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSelectedTopic(item);
                      setCustomTopicInput('');
                    }}
                    className="tap-interactive"
                    style={{
                      padding: '8px 14px',
                      borderRadius: 'var(--radius-pill)',
                      border: selectedTopic.id === item.id ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                      background: selectedTopic.id === item.id ? 'var(--color-primary-subtle)' : 'var(--color-surface)',
                      color: selectedTopic.id === item.id ? 'var(--color-primary)' : 'var(--color-text-primary)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {item.topic.length > 34 ? `${item.topic.slice(0, 32)}...` : item.topic}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Topic write-in */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="text"
                placeholder="Or type any custom topic here (e.g. My First Interview Experience)..."
                value={customTopicInput}
                onChange={(e) => setCustomTopicInput(e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-surface-sunken)',
                  color: 'var(--color-text-primary)',
                  fontSize: '0.875rem'
                }}
              />
            </div>
          </div>

          {/* 2. Parameters Card: Duration, Prep Time & Recording Mode */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '16px'
            }}
          >
            {/* Speaking Duration */}
            <div
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-xl)',
                padding: '18px 20px'
              }}
            >
              <label style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                <Clock size={16} color="var(--color-primary)" />
                <span>Speaking Duration</span>
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                {[
                  { value: 60, label: '1 Min', desc: 'Quick Drill' },
                  { value: 120, label: '2 Min', desc: 'IELTS Standard' },
                  { value: 300, label: '5 Min', desc: 'Deep Speech' }
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setTargetDuration(opt.value as any)}
                    className="tap-interactive"
                    style={{
                      padding: '10px 8px',
                      borderRadius: 'var(--radius-lg)',
                      border: targetDuration === opt.value ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                      background: targetDuration === opt.value ? 'var(--color-primary-subtle)' : 'var(--color-surface-sunken)',
                      color: targetDuration === opt.value ? 'var(--color-primary)' : 'var(--color-text-primary)',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ fontWeight: 800, fontSize: '0.9375rem' }}>{opt.label}</div>
                    <div style={{ fontSize: '0.6875rem', opacity: 0.8, marginTop: '2px' }}>{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Prep Time */}
            <div
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-xl)',
                padding: '18px 20px'
              }}
            >
              <label style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                <Zap size={16} color="#f59e0b" />
                <span>Preparation Countdown</span>
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {[
                  { value: 15, label: '15 Seconds', desc: 'Instant Thinking' },
                  { value: 20, label: '20 Seconds', desc: 'Standard Prep' }
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setPrepDuration(opt.value as any)}
                    className="tap-interactive"
                    style={{
                      padding: '10px 8px',
                      borderRadius: 'var(--radius-lg)',
                      border: prepDuration === opt.value ? '2px solid #f59e0b' : '1px solid var(--color-border)',
                      background: prepDuration === opt.value ? 'rgba(245, 158, 11, 0.1)' : 'var(--color-surface-sunken)',
                      color: prepDuration === opt.value ? '#d97706' : 'var(--color-text-primary)',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ fontWeight: 800, fontSize: '0.9375rem' }}>{opt.label}</div>
                    <div style={{ fontSize: '0.6875rem', opacity: 0.8, marginTop: '2px' }}>{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Video vs Voice */}
            <div
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-xl)',
                padding: '18px 20px'
              }}
            >
              <label style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                <Video size={16} color="#06b6d4" />
                <span>Practice Mode</span>
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {[
                  { value: 'video', label: 'Video + Voice', icon: Video, desc: 'Webcam recording' },
                  { value: 'audio', label: 'Voice Only', icon: Mic, desc: 'Microphone only' }
                ].map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setRecordMode(opt.value as any)}
                      className="tap-interactive"
                      style={{
                        padding: '10px 8px',
                        borderRadius: 'var(--radius-lg)',
                        border: recordMode === opt.value ? '2px solid #06b6d4' : '1px solid var(--color-border)',
                        background: recordMode === opt.value ? 'rgba(6, 182, 212, 0.1)' : 'var(--color-surface-sunken)',
                        color: recordMode === opt.value ? '#0891b2' : 'var(--color-text-primary)',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontWeight: 800, fontSize: '0.875rem' }}>
                        <Icon size={14} />
                        <span>{opt.label}</span>
                      </div>
                      <div style={{ fontSize: '0.6875rem', opacity: 0.8, marginTop: '2px' }}>{opt.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action Button: Start 15-20s Preparation */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
            <button
              onClick={handleStartPrep}
              className="cta-breathing tap-interactive btn-shimmer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '16px 36px',
                borderRadius: 'var(--radius-pill)',
                background: 'linear-gradient(135deg, #2563eb 0%, #10b981 100%)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 800,
                fontSize: '1.05rem',
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(37, 99, 235, 0.35)'
              }}
            >
              <Play size={18} fill="currentColor" />
              <span>Start {prepDuration}s Preparation & Practice</span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          PHASE 2: PREPARATION COUNTDOWN (15-20s)
          ========================================================================= */}
      {phase === 'prep' && (
        <div
          style={{
            background: 'var(--color-surface)',
            border: '2px solid var(--color-primary)',
            borderRadius: 'var(--radius-2xl)',
            padding: 'clamp(24px, 4vw, 36px)',
            textAlign: 'center',
            boxShadow: '0 12px 36px rgba(37, 99, 235, 0.15)'
          }}
        >
          {/* Countdown Clock */}
          <div
            style={{
              width: '90px',
              height: '90px',
              borderRadius: '50%',
              background: 'rgba(245, 158, 11, 0.15)',
              border: '4px solid #f59e0b',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto'
            }}
          >
            <span style={{ fontSize: '2rem', fontWeight: 900, color: '#d97706', lineHeight: 1 }}>
              {prepSecondsRemaining}
            </span>
            <span style={{ fontSize: '0.625rem', fontWeight: 800, color: '#b45309', textTransform: 'uppercase' }}>
              Seconds
            </span>
          </div>

          <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Preparation Stage
          </span>
          <h2 style={{ fontSize: 'clamp(1.25rem, 3vw, 1.8rem)', fontWeight: 800, color: 'var(--color-text-primary)', margin: '8px 0 16px 0' }}>
            "{selectedTopic.topic}"
          </h2>

          {/* Structured 3-Point Mental Framework */}
          <div
            style={{
              maxWidth: '640px',
              margin: '0 auto 24px auto',
              background: 'var(--color-surface-sunken)',
              borderRadius: 'var(--radius-xl)',
              padding: '20px',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              border: '1px solid var(--color-border-subtle)'
            }}
          >
            <div style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--color-primary)', textTransform: 'uppercase' }}>
              Structure your ideas into 3 parts:
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--color-primary)', color: '#fff', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                1
              </span>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>The Opening Hook</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>State your clear stance or definition in one punchy sentence.</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#10b981', color: '#fff', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                2
              </span>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>The Core Real-World Example</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Share a practical story, personal moment, or notable fact.</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#8b5cf6', color: '#fff', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                3
              </span>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>The Lasting Conclusion</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Summarize what this means for you and future outlook.</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <button
              onClick={startSpeakingRecording}
              className="tap-interactive"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 28px',
                borderRadius: 'var(--radius-pill)',
                background: 'var(--color-primary)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.9375rem',
                cursor: 'pointer'
              }}
            >
              <Zap size={16} />
              <span>Ready! Start Speaking Now</span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          PHASE 3: LIVE SPEAKING & RECORDING
          ========================================================================= */}
      {phase === 'speaking' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Topic Title Reminder Header */}
          <div
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              padding: '16px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px'
            }}
          >
            <div>
              <span style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', color: '#ef4444' }}>
                🔴 Live Speaking Active
              </span>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                "{selectedTopic.topic}"
              </div>
            </div>

            {/* Time Countdown Gauge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: '#ef4444',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-pill)',
                  fontWeight: 800,
                  fontSize: '0.9375rem'
                }}
              >
                <Clock size={16} />
                <span>{formatTime(speakingSecondsElapsed)} / {formatTime(targetDuration)}</span>
              </div>

              <button
                onClick={handleFinishSpeaking}
                className="tap-interactive"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 18px',
                  borderRadius: 'var(--radius-pill)',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                <CheckCircle2 size={16} />
                <span>Done Speaking</span>
              </button>
            </div>
          </div>

          {/* Center Stage: Video Viewport or Audio Waveform */}
          <div
            style={{
              position: 'relative',
              background: '#090d16',
              borderRadius: 'var(--radius-2xl)',
              overflow: 'hidden',
              minHeight: '340px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
              border: '2px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            {recordMode === 'video' ? (
              <video
                ref={liveVideoPreviewRef}
                autoPlay
                muted
                playsInline
                style={{
                  width: '100%',
                  height: '100%',
                  maxHeight: '440px',
                  objectFit: 'cover',
                  transform: 'scaleX(-1)' // Mirror for natural webcam look
                }}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div
                  style={{
                    width: '90px',
                    height: '90px',
                    borderRadius: '50%',
                    background: 'rgba(37, 99, 235, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px auto',
                    border: '3px solid #2563eb'
                  }}
                >
                  <Mic size={40} color="#60a5fa" />
                </div>
                <h3 style={{ color: '#ffffff', fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
                  Listening to your voice...
                </h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem', marginTop: '6px' }}>
                  Speak clearly into your microphone
                </p>
              </div>
            )}

            {/* Volume indicator overlay */}
            <div
              style={{
                position: 'absolute',
                bottom: '16px',
                left: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(0, 0, 0, 0.65)',
                backdropFilter: 'blur(8px)',
                padding: '6px 12px',
                borderRadius: 'var(--radius-pill)',
                color: '#ffffff',
                fontSize: '0.75rem',
                fontWeight: 700
              }}
            >
              <Mic size={14} color="#10b981" />
              <span>Mic Active</span>
              <div style={{ width: '40px', height: '6px', background: 'rgba(255,255,255,0.2)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${audioVolume}%`, height: '100%', background: '#10b981', transition: 'width 0.1s ease' }} />
              </div>
            </div>

            {/* Elapsed Progress Bar */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'rgba(255, 255, 255, 0.2)'
              }}
            >
              <div
                style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, #10b981 0%, #3b82f6 100%)',
                  width: `${Math.min(100, (speakingSecondsElapsed / targetDuration) * 100)}%`,
                  transition: 'width 0.3s ease'
                }}
              />
            </div>
          </div>

          {/* Live Recognized Speech Transcript */}
          <div
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              padding: '20px',
              minHeight: '100px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
                Live Speech Recognition
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                {liveTranscript.split(/\s+/).filter(Boolean).length} words recognized
              </span>
            </div>

            <div
              style={{
                fontSize: '1rem',
                lineHeight: 1.6,
                color: liveTranscript ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                fontStyle: liveTranscript ? 'normal' : 'italic'
              }}
            >
              {liveTranscript || 'Start speaking! Your recognized words will appear here in real time...'}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          PHASE 4: ANALYZING
          ========================================================================= */}
      {phase === 'analyzing' && (
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-2xl)',
            padding: '60px 20px',
            textAlign: 'center'
          }}
        >
          <div
            style={{
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              background: 'var(--color-primary-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto'
            }}
          >
            <Sparkles size={36} color="var(--color-primary)" className="celebrate-pop" />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-text-primary)', margin: 0 }}>
            Analyzing Your Speech & Grammar...
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginTop: '8px' }}>
            Evaluating your video/voice recording, sentence structures, pacing, and vocabulary upgrades.
          </p>
        </div>
      )}

      {/* =========================================================================
          PHASE 5: DETAILED FEEDBACK & RECORDED MEDIA REVIEW
          ========================================================================= */}
      {phase === 'feedback' && report && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* 1. Score & Overview Card */}
          <div
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-2xl)',
              padding: '24px',
              boxShadow: '0 6px 24px rgba(0, 0, 0, 0.04)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-primary)' }}>
                  Speaking Diagnostic Report
                </span>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-text-primary)', margin: '4px 0' }}>
                  "{selectedTopic.topic}"
                </h2>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', margin: 0 }}>
                  {report.summary}
                </p>
              </div>

              {/* Overall Score Badge */}
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.12) 0%, rgba(16, 185, 129, 0.12) 100%)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '12px 24px',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--color-primary)', lineHeight: 1 }}>
                  {report.overallScore}
                </div>
                <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginTop: '4px' }}>
                  Fluency Score
                </div>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '12px',
                marginTop: '20px',
                paddingTop: '16px',
                borderTop: '1px solid var(--color-border-subtle)'
              }}
            >
              <div style={{ background: 'var(--color-surface-sunken)', padding: '10px 14px', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>Pacing (WPM)</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>{report.wpm} WPM</div>
              </div>

              <div style={{ background: 'var(--color-surface-sunken)', padding: '10px 14px', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>Duration</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>{formatTime(speakingSecondsElapsed)}</div>
              </div>

              <div style={{ background: 'var(--color-surface-sunken)', padding: '10px 14px', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>Filler Words</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: report.fillerWordsFound.length > 0 ? '#ef4444' : '#10b981' }}>
                  {report.fillerWordsFound.length > 0 ? report.fillerWordsFound.join(', ') : 'None detected! ✨'}
                </div>
              </div>

              <div style={{ background: 'var(--color-surface-sunken)', padding: '10px 14px', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>Analysis Engine</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                  {report.source === 'gemini' ? 'Gemini 1.5 Flash' : 'Offline Heuristic'}
                </div>
              </div>
            </div>
          </div>

          {/* 2. Recorded Video / Voice Player Review */}
          {recordedMediaUrl && (
            <div
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-2xl)',
                padding: '24px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {recordMode === 'video' ? <Video size={18} color="var(--color-primary)" /> : <Mic size={18} color="var(--color-primary)" />}
                  <span>Replay Your Recorded {recordMode === 'video' ? 'Video' : 'Voice'}</span>
                </h3>

                {mediaBlob && (
                  <a
                    href={recordedMediaUrl}
                    download={`SpeakFlow_Practice_${Date.now()}.${recordMode === 'video' ? 'webm' : 'webm'}`}
                    className="tap-interactive"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-pill)',
                      background: 'var(--color-surface-sunken)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text-secondary)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textDecoration: 'none'
                    }}
                  >
                    <Download size={13} />
                    <span>Download Recording</span>
                  </a>
                )}
              </div>

              {recordMode === 'video' ? (
                <div
                  style={{
                    background: '#000000',
                    borderRadius: 'var(--radius-xl)',
                    overflow: 'hidden',
                    maxHeight: '400px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <video
                    ref={reviewVideoRef}
                    src={recordedMediaUrl}
                    controls
                    playsInline
                    style={{ width: '100%', maxHeight: '400px' }}
                  />
                </div>
              ) : (
                <div style={{ background: 'var(--color-surface-sunken)', padding: '20px', borderRadius: 'var(--radius-lg)' }}>
                  <audio src={recordedMediaUrl} controls style={{ width: '100%' }} />
                </div>
              )}
            </div>
          )}

          {/* 3. Full Recognized Transcript */}
          <div
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-2xl)',
              padding: '24px'
            }}
          >
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 12px 0' }}>
              📝 Exactly What You Spoke (Transcript)
            </h3>
            <div
              style={{
                background: 'var(--color-surface-sunken)',
                borderRadius: 'var(--radius-lg)',
                padding: '18px 20px',
                fontSize: '0.9375rem',
                lineHeight: 1.7,
                color: 'var(--color-text-primary)'
              }}
            >
              {finalTranscriptRef.current || liveTranscript || 'No speech detected.'}
            </div>
          </div>

          {/* 4. Sentence-by-Sentence Grammar & Phrasing Replacements */}
          <div
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-2xl)',
              padding: '24px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Sparkles size={20} color="var(--color-primary)" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
                Sentence & Grammar Recommendations (What to Replace)
              </h3>
            </div>

            {report.sentenceCorrections.length === 0 ? (
              <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                Your spoken phrasing was clean and grammatically sound!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {report.sentenceCorrections.map((corr, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'var(--color-surface-sunken)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-xl)',
                      padding: '18px 20px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <span style={{ fontSize: '0.6875rem', fontWeight: 800, background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '3px 8px', borderRadius: 'var(--radius-pill)' }}>
                        Grammar Rule: {corr.grammarRule}
                      </span>
                    </div>

                    {/* What you spoke */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '8px' }}>
                      <span style={{ color: '#ef4444', fontWeight: 800, fontSize: '0.875rem', width: '20px' }}>❌</span>
                      <div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>What you said: </span>
                        <span style={{ fontSize: '0.875rem', color: '#dc2626', fontWeight: 600 }}>"{corr.originalSentence}"</span>
                      </div>
                    </div>

                    {/* Recommended replacement */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
                      <span style={{ color: '#10b981', fontWeight: 800, fontSize: '0.875rem', width: '20px' }}>✅</span>
                      <div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>Recommended replacement: </span>
                        <span style={{ fontSize: '0.9375rem', color: '#059669', fontWeight: 800 }}>"{corr.correctedSentence}"</span>
                      </div>
                    </div>

                    {/* Why */}
                    <div style={{ background: 'var(--color-surface)', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '0.8125rem', color: 'var(--color-text-secondary)', display: 'flex', gap: '6px' }}>
                      <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>💡 Why:</span>
                      <span>{corr.why}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 5. Vocabulary Upgrades */}
          {report.wordUpgrades.length > 0 && (
            <div
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-2xl)',
                padding: '24px'
              }}
            >
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={18} color="#f59e0b" />
                <span>Vocabulary Upgrades</span>
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                {report.wordUpgrades.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'var(--color-surface-sunken)',
                      border: '1px solid var(--color-border-subtle)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '14px 16px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                      <span style={{ textDecoration: 'line-through', color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>
                        {item.originalWord}
                      </span>
                      <ArrowRight size={13} color="var(--color-primary)" />
                      <span style={{ color: 'var(--color-primary)', fontWeight: 800, fontSize: '0.9375rem' }}>
                        {item.recommendedWord}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                      {item.context}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Row: Retry or Next */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <button
              onClick={handleStartPrep}
              className="tap-interactive"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                borderRadius: 'var(--radius-pill)',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              <RotateCcw size={16} />
              <span>Retry This Topic ({selectedTopic.topic.slice(0, 20)}...)</span>
            </button>

            <button
              onClick={handleReset}
              className="tap-interactive"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 28px',
                borderRadius: 'var(--radius-pill)',
                background: 'linear-gradient(135deg, #2563eb 0%, #10b981 100%)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              <span>Practice Another Topic</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
