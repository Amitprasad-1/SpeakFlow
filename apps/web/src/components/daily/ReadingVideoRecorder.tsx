import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  AlertCircle
} from 'lucide-react';

export interface ReadingVideoRecorderProps {
  isOpen: boolean;
  onClose: () => void;
  passageTitle: string;
  totalWords: number;
  currentSentenceIndex?: number;
  totalSentences?: number;
  isAutoReading?: boolean;
}

export const ReadingVideoRecorder: React.FC<ReadingVideoRecorderProps> = ({
  isOpen,
  onClose,
  passageTitle,
  totalWords,
  currentSentenceIndex = 0,
  totalSentences = 1
}) => {
  // Video and Stream State
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(true);
  const [isMicActive, setIsMicActive] = useState<boolean>(true);
  const [isMirrored, setIsMirrored] = useState<boolean>(true);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  // Recording State
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);

  // Audio volume visualizer level (0 - 100)
  const [audioLevel, setAudioLevel] = useState<number>(0);

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
      videoPreviewRef.current.srcObject = stream;
    }
  }, [stream]);

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

  // 2. Start Recording
  const startRecording = () => {
    if (!stream) return;

    recordedChunksRef.current = [];
    setRecordedVideoUrl(null);
    setRecordedBlob(null);

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
        setShowReviewModal(true);
      };

      recorder.start(1000); // 1-second timeslices
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordingSeconds(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Failed to start MediaRecorder:', err);
      alert('Unable to start video recorder: ' + err.message);
    }
  };

  // 3. Stop Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
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

  // Calculate estimated WPM from recording
  const recordedWpm = Math.round((totalWords / Math.max(0.1, recordingSeconds / 60)));

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Floating Picture-in-Picture Camera Mirror Window */}
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: isMinimized ? '200px' : '320px',
          background: 'var(--color-surface-elevated, #18181b)',
          border: isRecording ? '2px solid #ef4444' : '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg, 16px)',
          boxShadow: isRecording
            ? '0 12px 36px rgba(239, 68, 68, 0.35), 0 4px 12px rgba(0, 0, 0, 0.4)'
            : '0 12px 32px rgba(0, 0, 0, 0.35)',
          zIndex: 100,
          overflow: 'hidden',
          transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Mirror Header Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            background: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(8px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Video size={13} color="var(--color-primary, #0ea5e9)" />
                <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-text-secondary, #94a3b8)' }}>
                  Camera Mirror
                </span>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {/* Mirror Flip */}
            <button
              onClick={() => setIsMirrored((prev) => !prev)}
              title={isMirrored ? 'Mirror flip ON' : 'Mirror flip OFF'}
              style={{
                background: 'transparent',
                border: 'none',
                color: isMirrored ? 'var(--color-primary, #0ea5e9)' : '#94a3b8',
                cursor: 'pointer',
                padding: '3px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <FlipHorizontal size={13} />
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
                padding: '3px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              {isMinimized ? <Maximize2 size={13} /> : <Minimize2 size={13} />}
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
                padding: '3px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Video Viewport Area */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: isMinimized ? '112px' : '180px',
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
              ref={videoPreviewRef}
              autoPlay
              playsInline
              muted // Always muted in preview so user does not hear feedback echo
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: isMirrored ? 'scaleX(-1)' : 'none',
                transition: 'transform 0.2s ease'
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
              onClick={startRecording}
              disabled={Boolean(permissionError)}
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
        </div>
      </div>

      {/* 5. Video Playback & Speech Review Modal */}
      {showReviewModal && recordedVideoUrl && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
            padding: '16px'
          }}
        >
          <div
            style={{
              background: 'var(--color-surface, #1e293b)',
              border: '1px solid var(--color-border, #334155)',
              borderRadius: '20px',
              maxWidth: '640px',
              width: '100%',
              overflow: 'hidden',
              boxShadow: '0 20px 48px rgba(0, 0, 0, 0.5)',
              animation: 'fadeIn 0.2s ease-out'
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderBottom: '1px solid var(--color-border-subtle, #334155)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} color="var(--color-primary, #0ea5e9)" />
                <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 800, color: 'var(--color-text-primary, #f8fafc)' }}>
                  Your Reading Video & Speech Review
                </h3>
              </div>
              <button
                onClick={() => setShowReviewModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Video Player Preview */}
            <div
              style={{
                background: '#09090b',
                width: '100%',
                maxHeight: '340px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
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
                  maxHeight: '340px',
                  objectFit: 'contain'
                }}
              />
            </div>

            {/* Stats & Fluency Feedback Card */}
            <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '10px',
                  background: 'var(--color-bg-subtle, #0f172a)',
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1px solid var(--color-border, #334155)',
                  textAlign: 'center'
                }}
              >
                <div>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-text-muted, #94a3b8)', textTransform: 'uppercase' }}>
                    Duration
                  </span>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-primary, #f8fafc)', marginTop: '2px' }}>
                    {formatTime(recordingSeconds)}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-text-muted, #94a3b8)', textTransform: 'uppercase' }}>
                    Words Read
                  </span>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary, #0ea5e9)', marginTop: '2px' }}>
                    {totalWords}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-text-muted, #94a3b8)', textTransform: 'uppercase' }}>
                    Reading Pace
                  </span>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981', marginTop: '2px' }}>
                    {recordedWpm} <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>WPM</span>
                  </div>
                </div>
              </div>

              <div
                style={{
                  fontSize: '0.8125rem',
                  color: 'var(--color-text-secondary, #94a3b8)',
                  background: 'rgba(14, 165, 233, 0.08)',
                  border: '1px solid rgba(14, 165, 233, 0.25)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Sparkles size={16} color="#0ea5e9" style={{ flexShrink: 0 }} />
                <span>
                  Great articulation! Watching your mouth movements and eye contact helps develop confident natural public speaking cadence.
                </span>
              </div>

              {/* Action Buttons: Download, Retake, Close */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: '10px',
                  marginTop: '4px'
                }}
              >
                <button
                  onClick={() => {
                    setShowReviewModal(false);
                    startRecording();
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border, #334155)',
                    background: 'transparent',
                    color: 'var(--color-text-secondary, #94a3b8)',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <RotateCcw size={14} />
                  <span>Record Again</span>
                </button>

                <button
                  onClick={handleDownload}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 18px',
                    borderRadius: '8px',
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
                  <span>Download Video (.webm)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
