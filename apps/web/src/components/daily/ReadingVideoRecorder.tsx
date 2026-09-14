import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Square,
  Play,
  Pause,
  Download,
  RotateCcw,
  X,
  Minimize2,
  Maximize2,
  FlipHorizontal,
  Volume2,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  FileText,
  Volume1,
  MessageSquareQuote,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  GripHorizontal,
  Move
} from 'lucide-react';
import { speakText, stopSpeaking } from '../../speech/BrowserSpeechProvider';

export interface ReadingVideoRecorderProps {
  isOpen: boolean;
  onClose: () => void;
  passageTitle: string;
  totalWords: number;
  sentences?: string[];
  currentSentenceIndex?: number;
  totalSentences?: number;
  isAutoReading?: boolean;
  onStartAutoReading?: () => void;
  onStopAutoReading?: () => void;
  onRecordingStateChange?: (isRecording: boolean) => void;
  recordingTrigger?: number;
}

interface SentenceComparison {
  actual: string;
  actualWordTokens: { word: string; isSpoken: boolean }[];
  spokenWords: { word: string; isMatch: boolean }[];
  spokenText: string;
  isSpoken: boolean;
  matchScore: number;
}

export const ReadingVideoRecorder: React.FC<ReadingVideoRecorderProps> = ({
  isOpen,
  onClose,
  passageTitle,
  totalWords,
  sentences = [],
  currentSentenceIndex = 0,
  totalSentences = 1,
  isAutoReading = false,
  onStartAutoReading,
  onStopAutoReading,
  onRecordingStateChange,
  recordingTrigger = 0
}) => {
  // Video and Stream State
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(true);
  const [isMicActive, setIsMicActive] = useState<boolean>(true);
  const [isMirrored, setIsMirrored] = useState<boolean>(true);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  
  // Draggable & Resizable State
  const [coords, setCoords] = useState<{ x: number; y: number } | null>(null);
  const [windowWidth, setWindowWidth] = useState<number>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 640) return 260;
    return 340;
  });
  const isDraggingRef = useRef<boolean>(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; startX: number; startY: number }>({
    mouseX: 0,
    mouseY: 0,
    startX: 0,
    startY: 0
  });
  const isResizingRef = useRef<boolean>(false);
  const resizeStartRef = useRef<{ mouseX: number; startWidth: number }>({
    mouseX: 0,
    startWidth: 340
  });
  const windowRef = useRef<HTMLDivElement | null>(null);

  // Recording State
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);

  // Real Speech Recognition Transcripts
  const [spokenTranscript, setSpokenTranscript] = useState<string>('');
  const recognitionRef = useRef<any>(null);
  const spokenTranscriptRef = useRef<string>('');
  const isRecordingRef = useRef<boolean>(false);

  // Audio volume visualizer level (0 - 100)
  const [audioLevel, setAudioLevel] = useState<number>(0);

  // Playing model audio for single sentence
  const [speakingSentenceIdx, setSpeakingSentenceIdx] = useState<number | null>(null);

  // Refs
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const reviewVideoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // 1. Initialize Camera & Mic when recorder opens
  const startCamera = useCallback(async () => {
    try {
      setPermissionError(null);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      setStream(mediaStream);
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = mediaStream;
        videoPreviewRef.current.play().catch(() => {});
      }

      // Audio level analyser
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const audioCtx = new AudioCtx();
          const source = audioCtx.createMediaStreamSource(mediaStream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 64;
          source.connect(analyser);

          audioContextRef.current = audioCtx;
          analyserRef.current = analyser;

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const checkVolume = () => {
            if (!analyserRef.current) return;
            analyserRef.current.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const avg = sum / dataArray.length;
            setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
            animFrameRef.current = requestAnimationFrame(checkVolume);
          };
          checkVolume();
        }
      } catch (err) {
        console.warn('AudioContext volume meter not supported', err);
      }
    } catch (err: any) {
      console.error('Camera/Mic permission error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionError('Camera or Microphone access was denied. Please allow camera and microphone access in your browser settings to record.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setPermissionError('No camera or microphone device found. Please connect a webcam or headset.');
      } else {
        setPermissionError('Unable to start camera and microphone: ' + (err.message || 'Unknown error'));
      }
    }
  }, []);

  // Stop all media tracks and audio context
  const stopAllMedia = useCallback(() => {
    isRecordingRef.current = false;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    analyserRef.current = null;
  }, [stream]);

  // Handle open / close lifecycle
  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      if (isRecording) {
        stopRecording();
      }
      stopAllMedia();
    }

    return () => {
      stopAllMedia();
    };
  }, [isOpen]);

  // Keep preview connected when stream changes
  useEffect(() => {
    if (videoPreviewRef.current && stream) {
      if (videoPreviewRef.current.srcObject !== stream) {
        videoPreviewRef.current.srcObject = stream;
      }
      videoPreviewRef.current.play().catch(() => {});
    }
  }, [stream]);

  // Callback ref for guaranteed video element attachment on mount
  const handleVideoRef = useCallback((node: HTMLVideoElement | null) => {
    videoPreviewRef.current = node;
    if (node && stream) {
      if (node.srcObject !== stream) {
        node.srcObject = stream;
      }
      node.play().catch(() => {});
    }
  }, [stream]);

  // Window Drag Handler (Move anywhere on screen)
  const handleDragStart = useCallback((clientX: number, clientY: number) => {
    isDraggingRef.current = true;
    const currentRect = windowRef.current?.getBoundingClientRect();
    const defaultX = typeof window !== 'undefined' ? Math.max(16, window.innerWidth - windowWidth - 28) : 20;
    const defaultY = 85;
    const startX = currentRect ? currentRect.left : (coords?.x ?? defaultX);
    const startY = currentRect ? currentRect.top : (coords?.y ?? defaultY);
    dragStartRef.current = { mouseX: clientX, mouseY: clientY, startX, startY };
  }, [coords, windowWidth]);

  // Window Resize Handler (Expand/shrink freely)
  const handleResizeStart = useCallback((clientX: number) => {
    isResizingRef.current = true;
    resizeStartRef.current = { mouseX: clientX, startWidth: windowWidth };
  }, [windowWidth]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (isDraggingRef.current) {
        const deltaX = e.clientX - dragStartRef.current.mouseX;
        const deltaY = e.clientY - dragStartRef.current.mouseY;
        const newX = Math.min(Math.max(10, dragStartRef.current.startX + deltaX), window.innerWidth - windowWidth - 10);
        const newY = Math.min(Math.max(10, dragStartRef.current.startY + deltaY), window.innerHeight - 80);
        setCoords({ x: newX, y: newY });
      } else if (isResizingRef.current) {
        const deltaX = e.clientX - resizeStartRef.current.mouseX;
        const newWidth = Math.min(Math.max(220, resizeStartRef.current.startWidth + deltaX), Math.min(640, window.innerWidth - 20));
        setWindowWidth(newWidth);
      }
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
      isResizingRef.current = false;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        if (isDraggingRef.current) {
          const deltaX = touch.clientX - dragStartRef.current.mouseX;
          const deltaY = touch.clientY - dragStartRef.current.mouseY;
          const newX = Math.min(Math.max(10, dragStartRef.current.startX + deltaX), window.innerWidth - windowWidth - 10);
          const newY = Math.min(Math.max(10, dragStartRef.current.startY + deltaY), window.innerHeight - 80);
          setCoords({ x: newX, y: newY });
        } else if (isResizingRef.current) {
          const deltaX = touch.clientX - resizeStartRef.current.mouseX;
          const newWidth = Math.min(Math.max(220, resizeStartRef.current.startWidth + deltaX), Math.min(640, window.innerWidth - 20));
          setWindowWidth(newWidth);
        }
      }
    };

    const onTouchEnd = () => {
      isDraggingRef.current = false;
      isResizingRef.current = false;
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [windowWidth]);

  // Toggle Camera video track
  const toggleCameraTrack = () => {
    if (!stream) return;
    const videoTrack = stream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setIsCameraActive(videoTrack.enabled);
    }
  };

  // Toggle Microphone audio track
  const toggleMicTrack = () => {
    if (!stream) return;
    const audioTrack = stream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsMicActive(audioTrack.enabled);
    }
  };

  // 2. Start Recording with Video + Real Continuous Speech Recognition
  const startRecording = () => {
    if (!stream) return;

    recordedChunksRef.current = [];
    setRecordedVideoUrl(null);
    setRecordedBlob(null);
    setSpokenTranscript('');
    spokenTranscriptRef.current = '';
    isRecordingRef.current = true;

    // Pick supported MIME type
    let mimeType = 'video/webm;codecs=vp9,opus';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm;codecs=vp8,opus';
    }
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm';
    }
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = '';
    }

    try {
      const options: MediaRecorderOptions = mimeType ? { mimeType } : {};
      const recorder = new MediaRecorder(stream, options);

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const finalBlob = new Blob(recordedChunksRef.current, {
          type: mimeType || 'video/webm'
        });
        const url = URL.createObjectURL(finalBlob);
        setRecordedBlob(finalBlob);
        setRecordedVideoUrl(url);
        setSpokenTranscript(spokenTranscriptRef.current);
        setShowReviewModal(true);
      };

      recorder.start(1000); // 1-second timeslices
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordingSeconds(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);

      // Start Real Speech Recognition
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const rec = new SpeechRecognition();
          rec.continuous = true;
          rec.interimResults = true;
          rec.lang = 'en-US';
          rec.maxAlternatives = 1;

          let accumulatedFinal = '';

          rec.onresult = (event: any) => {
            let interim = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
              const transcriptPiece = event.results[i][0].transcript;
              if (event.results[i].isFinal) {
                accumulatedFinal += ' ' + transcriptPiece;
              } else {
                interim += ' ' + transcriptPiece;
              }
            }
            const fullRealSpoken = (accumulatedFinal + ' ' + interim).trim();
            if (fullRealSpoken) {
              spokenTranscriptRef.current = fullRealSpoken;
              setSpokenTranscript(fullRealSpoken);
            }
          };

          rec.onerror = (e: any) => {
            console.warn('SpeechRecognition error:', e.error);
          };

          rec.onend = () => {
            // Auto-restart if user is still actively recording video
            if (isRecordingRef.current) {
              try {
                rec.start();
              } catch {}
            }
          };

          rec.start();
          recognitionRef.current = rec;
        } catch (err) {
          console.warn('Speech recognition could not be started:', err);
        }
      }
    } catch (err: any) {
      console.error('Failed to start MediaRecorder:', err);
      alert('Unable to start video recorder: ' + err.message);
    }
  };

  // 3. Stop Recording
  const stopRecording = () => {
    isRecordingRef.current = false;
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
  };

  // Interconnection: Notify parent whenever recording state changes
  useEffect(() => {
    onRecordingStateChange?.(isRecording);
  }, [isRecording, onRecordingStateChange]);

  // Interconnection: Start recording if externally triggered by "Start Auto Reading"
  useEffect(() => {
    if (recordingTrigger && recordingTrigger > 0 && isOpen && !isRecording && stream) {
      startRecording();
    }
  }, [recordingTrigger]);

  // Interconnected record toggle: starts/stops camera video recording AND auto-reading together
  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording();
      if (onStopAutoReading) {
        onStopAutoReading();
      }
    } else {
      startRecording();
      if (onStartAutoReading) {
        onStartAutoReading();
      }
    }
  };

  // 4. Download Video
  const handleDownload = () => {
    if (!recordedVideoUrl) return;
    const a = document.createElement('a');
    a.href = recordedVideoUrl;
    const dateStr = new Date().toISOString().slice(0, 10);
    const cleanTitle = passageTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    a.download = `speakflow-reading-${cleanTitle}-${dateStr}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Listen to native model pronunciation
  const playModelAudio = (sentence: string, idx: number) => {
    setSpeakingSentenceIdx(idx);
    speakText(sentence, {
      rate: 0.95,
      pitch: 1.0,
      onEnd: () => setSpeakingSentenceIdx(null),
      onError: () => setSpeakingSentenceIdx(null)
    });
  };

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // 5. Authentic Alignment: Match Real Spoken Words against Actual Sentences
  const sentenceComparisons = useMemo<SentenceComparison[]>(() => {
    const rawSpokenTokens = spokenTranscript
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (rawSpokenTokens.length === 0) {
      // Nothing was spoken yet in this recording
      return sentences.map((sent) => {
        const rawWords = sent.split(/\s+/).filter(Boolean);
        return {
          actual: sent,
          actualWordTokens: rawWords.map((w) => ({ word: w, isSpoken: false })),
          spokenWords: [],
          spokenText: '',
          isSpoken: false,
          matchScore: 0
        };
      });
    }

    // Greedily distribute actual spoken words across the sentences in sequence
    let currentSpokenIdx = 0;

    return sentences.map((actualSent) => {
      const rawActualWords = actualSent.split(/\s+/).filter(Boolean);
      const normActualWords = rawActualWords.map((w) =>
        w.toLowerCase().replace(/[^a-z0-9]/g, '')
      );

      // If we ran out of spoken words, this sentence wasn't reached yet
      if (currentSpokenIdx >= rawSpokenTokens.length) {
        return {
          actual: actualSent,
          actualWordTokens: rawActualWords.map((w) => ({ word: w, isSpoken: false })),
          spokenWords: [],
          spokenText: '',
          isSpoken: false,
          matchScore: 0
        };
      }

      const assignedTokens: string[] = [];

      while (currentSpokenIdx < rawSpokenTokens.length) {
        const token = rawSpokenTokens[currentSpokenIdx];
        const normToken = token.toLowerCase().replace(/[^a-z0-9]/g, '');

        const matchesCurrent = normActualWords.includes(normToken);

        if (matchesCurrent) {
          assignedTokens.push(token);
          currentSpokenIdx++;
          // If we matched up to the length of this sentence, stop
          if (assignedTokens.length >= rawActualWords.length + 3) {
            break;
          }
        } else {
          // Token doesn't directly match. It could be an extra word or mispronunciation
          // Check if it belongs to this sentence or next sentence
          if (assignedTokens.length === 0) {
            // Include first spoken tokens for this sentence
            assignedTokens.push(token);
            currentSpokenIdx++;
          } else {
            // Already started this sentence, check if it's extra word or belongs further
            if (assignedTokens.length < normActualWords.length) {
              assignedTokens.push(token);
              currentSpokenIdx++;
            } else {
              break;
            }
          }
        }
      }

      const isSpoken = assignedTokens.length > 0;
      const spokenWords = assignedTokens.map((word) => {
        const norm = word.toLowerCase().replace(/[^a-z0-9]/g, '');
        const isMatch = normActualWords.includes(norm);
        return { word, isMatch };
      });

      const matchedCount = spokenWords.filter((w) => w.isMatch).length;
      const matchScore =
        normActualWords.length > 0
          ? Math.min(100, Math.round((matchedCount / normActualWords.length) * 100))
          : 0;

      const actualWordTokens = rawActualWords.map((raw) => {
        const norm = raw.toLowerCase().replace(/[^a-z0-9]/g, '');
        const wasSpoken = assignedTokens.some(
          (t) => t.toLowerCase().replace(/[^a-z0-9]/g, '') === norm
        );
        return { word: raw, isSpoken: wasSpoken };
      });

      return {
        actual: actualSent,
        actualWordTokens,
        spokenWords,
        spokenText: assignedTokens.join(' '),
        isSpoken,
        matchScore
      };
    });
  }, [sentences, spokenTranscript]);

  // Real Count of Words Spoken in Video
  const actualSpokenWordsCount = useMemo(() => {
    const tokens = spokenTranscript.trim().split(/\s+/).filter(Boolean);
    return tokens.length;
  }, [spokenTranscript]);

  // Real Calculated Reading Pace (WPM based on ACTUAL spoken words, not the entire 160-word passage!)
  const recordedWpm = useMemo(() => {
    if (actualSpokenWordsCount === 0 || recordingSeconds === 0) return 0;
    const mins = Math.max(0.08, recordingSeconds / 60);
    return Math.round(actualSpokenWordsCount / mins);
  }, [actualSpokenWordsCount, recordingSeconds]);

  // Overall Accuracy of Spoken Sentences
  const overallAccuracy = useMemo(() => {
    const spokenSentences = sentenceComparisons.filter((s) => s.isSpoken);
    if (spokenSentences.length === 0) return 0;
    const sum = spokenSentences.reduce((acc, c) => acc + c.matchScore, 0);
    return Math.round(sum / spokenSentences.length);
  }, [sentenceComparisons]);

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <>
      {/* Floating Picture-in-Picture Camera Mirror Window (Draggable & Resizable) */}
      <div
        ref={windowRef}
        className="speakflow-camera-mirror"
        style={{
          position: 'fixed',
          left: coords ? `${coords.x}px` : 'auto',
          top: coords ? `${coords.y}px` : '85px',
          right: coords ? 'auto' : 'clamp(16px, 2.5vw, 32px)',
          bottom: 'auto',
          width: isMinimized ? '220px' : `${windowWidth}px`,
          maxWidth: 'calc(100vw - 20px)',
          background: 'var(--color-surface-elevated, #18181b)',
          border: isRecording ? '2px solid #ef4444' : '2px solid var(--color-primary)',
          borderRadius: 'var(--radius-lg, 16px)',
          boxShadow: isRecording
            ? '0 16px 48px rgba(239, 68, 68, 0.4), 0 4px 16px rgba(0, 0, 0, 0.6)'
            : '0 16px 48px rgba(0, 0, 0, 0.6), 0 0 24px rgba(14, 165, 233, 0.25)',
          zIndex: 99999,
          overflow: 'hidden',
          transition: isDraggingRef.current || isResizingRef.current ? 'none' : 'box-shadow 0.2s ease, border-color 0.2s ease',
          display: 'flex',
          flexDirection: 'column',
          userSelect: isDraggingRef.current || isResizingRef.current ? 'none' : 'auto'
        }}
      >
        {/* Draggable Mirror Header Bar */}
        <div
          onMouseDown={(e) => {
            if ((e.target as HTMLElement).closest('button')) return;
            e.preventDefault();
            handleDragStart(e.clientX, e.clientY);
          }}
          onTouchStart={(e) => {
            if ((e.target as HTMLElement).closest('button')) return;
            if (e.touches.length > 0) {
              handleDragStart(e.touches[0].clientX, e.touches[0].clientY);
            }
          }}
          title="Click & hold to drag camera anywhere on screen"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(8px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            cursor: 'grab',
            userSelect: 'none',
            touchAction: 'none'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                color: '#94a3b8'
              }}
              title="Hold and drag to move"
            >
              <GripHorizontal size={16} />
            </div>

            {isRecording ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#ef4444',
                    animation: 'pulse 1s infinite'
                  }}
                />
                <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#ef4444', letterSpacing: '0.05em' }}>
                  REC {formatTime(recordingSeconds)}
                </span>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#10b981',
                    boxShadow: '0 0 8px #10b981'
                  }}
                />
                <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-text-primary, #ffffff)' }}>
                  Webcam Live
                </span>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {/* Quick Size Toggle Button (SM / MD / LG) */}
            <button
              onClick={() => {
                setWindowWidth((prev) => {
                  if (prev <= 290) return 360;
                  if (prev <= 390) return 480;
                  return 270;
                });
              }}
              title={`Resize camera (Current: ${windowWidth}px). Click to cycle: Small (270px), Medium (360px), Large (480px)`}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '4px',
                color: '#e2e8f0',
                cursor: 'pointer',
                padding: '2px 6px',
                fontSize: '0.6875rem',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                lineHeight: 1
              }}
            >
              {windowWidth > 400 ? 'LG' : windowWidth > 300 ? 'MD' : 'SM'}
            </button>

            {/* Reset Position (if user moved it) */}
            {coords && (
              <button
                onClick={() => setCoords(null)}
                title="Reset camera position beside reading text"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <RotateCcw size={13} />
              </button>
            )}

            {/* Mirror Flip */}
            <button
              onClick={() => setIsMirrored((prev) => !prev)}
              title={isMirrored ? 'Mirror flip ON' : 'Mirror flip OFF'}
              style={{
                background: 'transparent',
                border: 'none',
                color: isMirrored ? 'var(--color-primary, #0ea5e9)' : '#94a3b8',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <FlipHorizontal size={14} />
            </button>

            {/* Minimize / Maximize */}
            <button
              onClick={() => setIsMinimized((prev) => !prev)}
              title={isMinimized ? 'Expand camera' : 'Minimize camera'}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              title="Close camera"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Video Viewport Area (Scales proportionately with windowWidth) */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: isMinimized ? '110px' : `${Math.round(windowWidth * 0.58)}px`,
            maxHeight: isMinimized ? '110px' : '58vh',
            background: '#09090b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
          }}
        >
          {permissionError ? (
            <div
              style={{
                padding: '12px',
                textAlign: 'center',
                color: '#f87171',
                fontSize: '0.75rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <AlertCircle size={20} />
              <span>{permissionError}</span>
              <button
                onClick={startCamera}
                style={{
                  marginTop: '4px',
                  padding: '4px 8px',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  borderRadius: '4px',
                  background: '#ef4444',
                  color: '#ffffff',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Retry Camera
              </button>
            </div>
          ) : !isCameraActive ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                color: '#64748b'
              }}
            >
              <VideoOff size={24} />
              <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Camera Turned Off</span>
            </div>
          ) : (
            <video
              ref={handleVideoRef}
              autoPlay
              playsInline
              muted // Always muted in preview so user does not hear feedback echo
              onLoadedMetadata={(e) => {
                (e.target as HTMLVideoElement).play().catch(() => {});
              }}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: isMirrored ? 'scaleX(-1)' : 'none',
                transition: 'transform 0.2s ease',
                display: 'block'
              }}
            />
          )}

          {/* Real-time Voice Audio Volume Wave Indicator (Bottom of video) */}
          {isMicActive && !permissionError && (
            <div
              style={{
                position: 'absolute',
                bottom: '8px',
                left: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: 'rgba(0, 0, 0, 0.65)',
                padding: '2px 8px',
                borderRadius: '12px',
                backdropFilter: 'blur(4px)'
              }}
            >
              <Volume2 size={11} color={audioLevel > 15 ? '#10b981' : '#94a3b8'} />
              <div
                style={{
                  width: '40px',
                  height: '4px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '2px',
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    width: `${audioLevel}%`,
                    height: '100%',
                    background: audioLevel > 50 ? '#ef4444' : '#10b981',
                    transition: 'width 0.08s ease'
                  }}
                />
              </div>
            </div>
          )}

          {/* Reading Sentence Progress Badge */}
          <div
            style={{
              position: 'absolute',
              top: '8px',
              left: '10px',
              background: 'rgba(0, 0, 0, 0.65)',
              color: '#ffffff',
              padding: '2px 8px',
              borderRadius: '10px',
              fontSize: '0.625rem',
              fontWeight: 700,
              backdropFilter: 'blur(4px)'
            }}
          >
            Sentence {currentSentenceIndex + 1}/{totalSentences}
          </div>

          {/* LIVE Speech Subtitle Banner (Proves mic is actually listening!) */}
          {isRecording && (
            <div
              style={{
                position: 'absolute',
                bottom: '32px',
                left: '10px',
                right: '10px',
                background: 'rgba(0, 0, 0, 0.75)',
                color: '#f8fafc',
                padding: '3px 8px',
                borderRadius: '6px',
                fontSize: '0.6875rem',
                fontWeight: 600,
                backdropFilter: 'blur(4px)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                borderLeft: '2px solid #10b981'
              }}
            >
              {spokenTranscript ? `🎙️ ${spokenTranscript}` : '🎙️ Speak sentence into mic...'}
            </div>
          )}
        </div>

        {/* Video & Mic Control Buttons */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            background: 'var(--color-surface, #1e293b)',
            gap: '8px'
          }}
        >
          {/* Track Toggles */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              onClick={toggleCameraTrack}
              title={isCameraActive ? 'Turn off camera' : 'Turn on camera'}
              style={{
                background: isCameraActive ? 'rgba(255, 255, 255, 0.08)' : 'rgba(239, 68, 68, 0.2)',
                color: isCameraActive ? 'var(--color-text-secondary, #cbd5e1)' : '#ef4444',
                border: 'none',
                borderRadius: '6px',
                padding: '5px 8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              {isCameraActive ? <Video size={14} /> : <VideoOff size={14} />}
            </button>

            <button
              onClick={toggleMicTrack}
              title={isMicActive ? 'Mute microphone' : 'Unmute microphone'}
              style={{
                background: isMicActive ? 'rgba(255, 255, 255, 0.08)' : 'rgba(239, 68, 68, 0.2)',
                color: isMicActive ? 'var(--color-text-secondary, #cbd5e1)' : '#ef4444',
                border: 'none',
                borderRadius: '6px',
                padding: '5px 8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              {isMicActive ? <Mic size={14} /> : <MicOff size={14} />}
            </button>
          </div>

          {/* Main Action Button (Record / Stop) */}
          {isRecording ? (
            <button
              onClick={stopRecording}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '20px',
                border: 'none',
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.75rem',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)'
              }}
            >
              <Square size={13} fill="currentColor" />
              <span>Stop & Review</span>
            </button>
          ) : (
            <button
              onClick={handleToggleRecording}
              disabled={Boolean(permissionError)}
              title="Starts camera recording & reading flow simultaneously"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '20px',
                border: 'none',
                background: Boolean(permissionError)
                  ? '#64748b'
                  : 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.75rem',
                cursor: Boolean(permissionError) ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 8px rgba(14, 165, 233, 0.35)'
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#ef4444'
                }}
              />
              <span>Record Video</span>
            </button>
          )}

          {/* Connected Auto-Reading Flow Toggle */}
          {onStartAutoReading && onStopAutoReading && (
            <button
              onClick={() => {
                if (isAutoReading) {
                  onStopAutoReading();
                } else {
                  onStartAutoReading();
                }
              }}
              title={isAutoReading ? 'Pause passage auto-reading' : 'Start passage auto-reading'}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '5px 8px',
                borderRadius: '6px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                background: isAutoReading ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                color: isAutoReading ? '#10b981' : '#cbd5e1',
                fontSize: '0.6875rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {isAutoReading ? <Pause size={12} /> : <Play size={12} fill="currentColor" />}
              <span>{isAutoReading ? 'Reading ON' : 'Read'}</span>
            </button>
          )}
        </div>

        {/* Drag Resize Corner Handle (Bottom-Right) */}
        {!isMinimized && (
          <div
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleResizeStart(e.clientX);
            }}
            onTouchStart={(e) => {
              if (e.touches.length > 0) {
                e.stopPropagation();
                handleResizeStart(e.touches[0].clientX);
              }
            }}
            title="Drag horizontally to resize camera"
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: '24px',
              height: '24px',
              cursor: 'nwse-resize',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'flex-end',
              padding: '3px',
              zIndex: 35,
              userSelect: 'none',
              touchAction: 'none'
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ opacity: 0.65, pointerEvents: 'none' }}>
              <path d="M10 2L2 10M10 6L6 10M10 10L10 10" stroke="#94a3b8" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </div>
        )}
      </div>

      {/* 5. Authentic Video Review Studio: Real Voice Match */}
      {showReviewModal && recordedVideoUrl && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100000,
            padding: '16px'
          }}
        >
          <div
            style={{
              background: 'var(--color-surface, #0f172a)',
              border: '1px solid var(--color-border, #334155)',
              borderRadius: '24px',
              maxWidth: '1140px',
              width: '100%',
              maxHeight: '92vh',
              overflow: 'hidden',
              boxShadow: '0 24px 64px rgba(0, 0, 0, 0.65)',
              display: 'flex',
              flexDirection: 'column',
              animation: 'fadeIn 0.25s ease-out'
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 24px',
                borderBottom: '1px solid var(--color-border-subtle, #334155)',
                background: 'rgba(15, 23, 42, 0.85)',
                backdropFilter: 'blur(8px)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, var(--color-primary, #0ea5e9) 0%, #10b981 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff'
                  }}
                >
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: '1.2rem',
                      fontWeight: 800,
                      color: 'var(--color-text-primary, #f8fafc)',
                      letterSpacing: '-0.015em'
                    }}
                  >
                    Your Reading Video & Speech Comparison Studio
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary, #94a3b8)' }}>
                    Watch your recorded video on the left and see what words you actually spoke matched against the passage on the right
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {overallAccuracy > 0 ? (
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-pill)',
                      background: 'rgba(16, 185, 129, 0.15)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      color: '#10b981',
                      fontSize: '0.75rem',
                      fontWeight: 700
                    }}
                  >
                    <CheckCircle2 size={13} />
                    <span>{overallAccuracy}% Voice Accuracy</span>
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-pill)',
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#f87171',
                      fontSize: '0.75rem',
                      fontWeight: 700
                    }}
                  >
                    <span>In Progress</span>
                  </div>
                )}

                <button
                  onClick={() => setShowReviewModal(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: '6px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Body: Split Screen Comparison */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(320px, 460px) 1fr',
                gap: '0',
                flex: 1,
                overflow: 'hidden'
              }}
              className="review-split-grid"
            >
              {/* Left Column: Video Playback & Real Stats */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  borderRight: '1px solid var(--color-border, #334155)',
                  background: 'var(--color-bg-subtle, #09090b)',
                  overflowY: 'auto',
                  padding: '20px'
                }}
              >
                {/* Video Player with Audio */}
                <div
                  style={{
                    borderRadius: '14px',
                    overflow: 'hidden',
                    background: '#000000',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <video
                    ref={reviewVideoRef}
                    src={recordedVideoUrl}
                    controls
                    autoPlay
                    playsInline
                    style={{
                      width: '100%',
                      maxHeight: '260px',
                      display: 'block',
                      objectFit: 'contain'
                    }}
                  />
                </div>

                {/* Real Metrics Summary Grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '8px',
                    marginTop: '16px',
                    background: 'var(--color-surface, #1e293b)',
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1px solid var(--color-border, #334155)',
                    textAlign: 'center'
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--color-text-muted, #94a3b8)', textTransform: 'uppercase' }}>
                      Duration
                    </span>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-text-primary, #f8fafc)', marginTop: '2px' }}>
                      {formatTime(recordingSeconds)}
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--color-text-muted, #94a3b8)', textTransform: 'uppercase' }}>
                      Words Spoken
                    </span>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-primary, #0ea5e9)', marginTop: '2px' }}>
                      {actualSpokenWordsCount} <span style={{ fontSize: '0.6875rem', color: '#64748b' }}>/ {totalWords}</span>
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--color-text-muted, #94a3b8)', textTransform: 'uppercase' }}>
                      Reading Pace
                    </span>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#10b981', marginTop: '2px' }}>
                      {recordedWpm} <span style={{ fontSize: '0.6875rem', fontWeight: 600 }}>WPM</span>
                    </div>
                  </div>
                </div>

                {/* Real Microphone Transcript Banner */}
                <div
                  style={{
                    marginTop: '14px',
                    padding: '12px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MessageSquareQuote size={14} color="#0ea5e9" />
                    <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                      Full Voice Transcript from Video:
                    </span>
                  </div>

                  {spokenTranscript ? (
                    <p style={{ margin: 0, fontSize: '0.8125rem', color: '#e2e8f0', lineHeight: 1.5, fontStyle: 'italic' }}>
                      "{spokenTranscript}"
                    </p>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: '#f87171', fontStyle: 'italic' }}>
                      No words were picked up by the microphone in this {recordingSeconds}s recording. Make sure your microphone is unmuted and speak clearly!
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '10px', marginTop: 'auto', paddingTop: '18px' }}>
                  <button
                    onClick={() => {
                      setShowReviewModal(false);
                      startRecording();
                    }}
                    style={{
                      flex: 1,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid var(--color-border, #334155)',
                      background: 'transparent',
                      color: 'var(--color-text-secondary, #94a3b8)',
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    <RotateCcw size={14} />
                    <span>Record Again</span>
                  </button>

                  <button
                    onClick={handleDownload}
                    style={{
                      flex: 1.2,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '10px 16px',
                      borderRadius: '10px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: '#ffffff',
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 2px 10px rgba(16, 185, 129, 0.35)'
                    }}
                  >
                    <Download size={14} />
                    <span>Download (.webm)</span>
                  </button>
                </div>
              </div>

              {/* Right Column: Sentence-by-Sentence Real Voice Matching */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  background: 'var(--color-surface, #0f172a)',
                  overflowY: 'auto',
                  padding: '20px 24px',
                  maxHeight: 'calc(92vh - 75px)'
                }}
              >
                {/* Column Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '16px',
                    paddingBottom: '12px',
                    borderBottom: '1px solid var(--color-border-subtle, #334155)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={16} color="var(--color-primary, #0ea5e9)" />
                    <span style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--color-text-primary, #f8fafc)' }}>
                      Sentence Verification: Actual vs What You Spoke
                    </span>
                  </div>

                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted, #94a3b8)', fontWeight: 600 }}>
                    {sentences.length} Sentences in Passage
                  </span>
                </div>

                {/* Sentence by Sentence List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {sentenceComparisons.map((item, idx) => {
                    const isPlaying = speakingSentenceIdx === idx;

                    return (
                      <div
                        key={idx}
                        style={{
                          background: 'var(--color-bg-subtle, #1e293b)',
                          border: item.isSpoken
                            ? '1px solid rgba(16, 185, 129, 0.35)'
                            : '1px solid var(--color-border, #334155)',
                          borderRadius: '12px',
                          padding: '14px 16px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px',
                          opacity: item.isSpoken ? 1.0 : 0.68,
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {/* Sentence Header + Match Badge + Audio Button */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span
                              style={{
                                fontSize: '0.6875rem',
                                fontWeight: 800,
                                color: '#0ea5e9',
                                background: 'rgba(14, 165, 233, 0.15)',
                                padding: '2px 8px',
                                borderRadius: '6px'
                              }}
                            >
                              Sentence {idx + 1}
                            </span>

                            {item.isSpoken ? (
                              <span
                                style={{
                                  fontSize: '0.6875rem',
                                  fontWeight: 700,
                                  color: item.matchScore >= 70 ? '#10b981' : '#f59e0b'
                                }}
                              >
                                {item.matchScore}% Spoken Accuracy
                              </span>
                            ) : (
                              <span
                                style={{
                                  fontSize: '0.6875rem',
                                  fontWeight: 600,
                                  color: '#64748b',
                                  background: 'rgba(255, 255, 255, 0.05)',
                                  padding: '2px 6px',
                                  borderRadius: '4px'
                                }}
                              >
                                Not Spoken in this {formatTime(recordingSeconds)} video
                              </span>
                            )}
                          </div>

                          <button
                            onClick={() => playModelAudio(item.actual, idx)}
                            title="Listen to native model pronunciation"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              border: '1px solid var(--color-border, #334155)',
                              background: isPlaying ? 'var(--color-primary-subtle, rgba(14, 165, 233, 0.2))' : 'transparent',
                              color: isPlaying ? '#0ea5e9' : 'var(--color-text-secondary, #94a3b8)',
                              fontSize: '0.6875rem',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            <Volume1 size={13} />
                            <span>{isPlaying ? 'Playing...' : 'Hear Audio'}</span>
                          </button>
                        </div>

                        {/* 1. What's Actual (Original Story Sentence) */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span
                            style={{
                              fontSize: '0.625rem',
                              fontWeight: 800,
                              textTransform: 'uppercase',
                              letterSpacing: '0.06em',
                              color: 'var(--color-text-muted, #94a3b8)'
                            }}
                          >
                            Actual Passage Sentence:
                          </span>
                          <p
                            style={{
                              margin: 0,
                              fontSize: '0.9375rem',
                              fontWeight: 600,
                              color: 'var(--color-text-primary, #f8fafc)',
                              lineHeight: 1.55
                            }}
                          >
                            {item.actualWordTokens.map((token, wIdx) => (
                              <span
                                key={wIdx}
                                style={{
                                  display: 'inline-block',
                                  marginRight: '4px',
                                  color: token.isSpoken ? '#34d399' : '#e2e8f0',
                                  textDecoration: token.isSpoken ? 'none' : 'none'
                                }}
                              >
                                {token.word}
                              </span>
                            ))}
                          </p>
                        </div>

                        {/* 2. What I Speak (REAL User Voice Spoken in Video) */}
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            background: item.isSpoken ? 'rgba(0, 0, 0, 0.35)' : 'rgba(255, 255, 255, 0.02)',
                            borderLeft: item.isSpoken ? '3px solid #10b981' : '3px solid #64748b'
                          }}
                        >
                          <span
                            style={{
                              fontSize: '0.625rem',
                              fontWeight: 800,
                              textTransform: 'uppercase',
                              letterSpacing: '0.06em',
                              color: item.isSpoken ? '#10b981' : '#64748b'
                            }}
                          >
                            What You Spoke with Voice:
                          </span>

                          {item.isSpoken ? (
                            <div
                              style={{
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                color: '#e2e8f0',
                                lineHeight: 1.5
                              }}
                            >
                              {item.spokenWords.map((token, wIdx) => (
                                <span
                                  key={wIdx}
                                  style={{
                                    display: 'inline-block',
                                    marginRight: '4px',
                                    color: token.isMatch ? '#34d399' : '#fbbf24',
                                    fontWeight: token.isMatch ? 700 : 500
                                  }}
                                  title={token.isMatch ? 'Matched passage word' : 'Extra or unverified pronunciation word'}
                                >
                                  {token.word}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <div
                              style={{
                                fontSize: '0.8125rem',
                                color: '#64748b',
                                fontStyle: 'italic'
                              }}
                            >
                              (You stopped recording at {formatTime(recordingSeconds)} before reading this sentence)
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>,
    document.body
  );
};
