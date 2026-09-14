import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Card, Badge, VoiceWaveform, RecordingButton } from '../../design-system';
import {
  ConversationMode,
  ConversationSession,
  ConversationEngine,
  ConversationMessage,
  PostConversationReview
} from '@speakflow/core';
import { BrowserSpeechProvider } from '../../speech/BrowserSpeechProvider';
import { BrowserStorage } from '../../storage/BrowserStorage';
import { GeminiAIService } from '../../services/GeminiAIService';
import {
  MessageSquare,
  Briefcase,
  UserCheck,
  Compass,
  Sparkles,
  Volume2,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  Send,
  Zap,
  Info,
  Mic,
  PenTool,
  Key,
  ExternalLink,
  X,
  AlertCircle,
  Bot,
  User,
  Copy,
  Check
} from 'lucide-react';
import { VoiceWaveVisualizer } from '../common/VoiceWaveVisualizer';
import { ImpromptuSpeakingTab } from '../speaking/ImpromptuSpeakingTab';
import { EssayWritingTab } from '../writing/EssayWritingTab';

export interface ConversationViewProps {
  onReturnToHome?: () => void;
}

export const ConversationView: React.FC<ConversationViewProps> = ({
  onReturnToHome
}) => {
  const [subTab, setSubTab] = useState<'speaking' | 'writing' | 'chat'>('speaking');
  const speechProvider = useMemo(() => new BrowserSpeechProvider(), []);

  const [selectedMode, setSelectedMode] = useState<ConversationMode>('practice');
  const [session, setSession] = useState<ConversationSession>(() => {
    return ConversationEngine.startSession('practice');
  });

  const [voiceState, setVoiceState] = useState<'ready' | 'listening' | 'processing' | 'result'>('ready');
  const [transcript, setTranscript] = useState('');
  const [inputText, setInputText] = useState('');
  const [recordedDuration, setRecordedDuration] = useState(0);
  const [reviewReport, setReviewReport] = useState<PostConversationReview | null>(null);
  const [isSpeakingAi, setIsSpeakingAi] = useState(false);
  const [isAiConfigured, setIsAiConfigured] = useState(() => GeminiAIService.isConfigured());

  // In-chat key connector state
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [keyInput, setKeyInput] = useState('');
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [isKeySaved, setIsKeySaved] = useState(false);
  const [hideConnectBanner, setHideConnectBanner] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [isHandsFreeMode, setIsHandsFreeMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('speakflow_hands_free_mode');
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });
  const isHandsFreeModeRef = useRef(isHandsFreeMode);
  isHandsFreeModeRef.current = isHandsFreeMode;

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const silenceTimerRef = useRef<any>(null);
  const durationIntervalRef = useRef<any>(null);
  const latestTranscriptRef = useRef<string>('');
  const isSubmittingTurnRef = useRef<boolean>(false);
  const [hasDetectedSpeech, setHasDetectedSpeech] = useState(false);

  // Check Gemini configuration on mount
  useEffect(() => {
    setIsAiConfigured(GeminiAIService.isConfigured());
  }, []);

  // Auto-scroll chat to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session.messages, isSpeakingAi]);

  const clearVoiceTimers = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
  };

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      clearVoiceTimers();
      speechProvider.dispose();
    };
  }, [speechProvider]);

  const handleModeChange = (mode: ConversationMode) => {
    clearVoiceTimers();
    speechProvider.stopRealtimeRecognition();
    isSubmittingTurnRef.current = false;
    setSelectedMode(mode);
    setReviewReport(null);
    setTranscript('');
    setInputText('');
    setHasDetectedSpeech(false);
    setVoiceState('ready');
    const newSession = ConversationEngine.startSession(mode);
    setSession(newSession);
  };

  const handleSendTurn = async (rawText: string) => {
    const textToSubmit = rawText.trim();
    if (!textToSubmit) return;

    clearVoiceTimers();
    setVoiceState('processing');
    setInputText('');
    setTranscript('');
    setHasDetectedSpeech(false);
    setRecordedDuration(0);

    // 1. Append user message to conversation
    const userMsg: ConversationMessage = {
      id: `msg_user_${Date.now()}`,
      sender: 'user',
      text: textToSubmit,
      timestamp: new Date().toISOString()
    };

    const sessionWithUser: ConversationSession = {
      ...session,
      messages: [...session.messages, userMsg]
    };
    setSession(sessionWithUser);

    try {
      // 2. Query Gemini 1.5 Flash (with automatic fallback to intelligent offline engine)
      const coachResponse = await GeminiAIService.generateConversationReply({
        userMessage: textToSubmit,
        mode: session.mode,
        scenarioTitle: session.scenario.title,
        history: session.messages.map(m => ({ sender: m.sender, text: m.text }))
      });

      // 3. Append AI Coach response
      const aiMsg: ConversationMessage = {
        id: `msg_ai_${Date.now()}`,
        sender: 'ai',
        text: coachResponse.replyText,
        timestamp: new Date().toISOString(),
        feedback: coachResponse.suggestedPhrasing ? {
          naturalAlternative: coachResponse.suggestedPhrasing
        } : undefined
      };

      const updatedSession: ConversationSession = {
        ...sessionWithUser,
        messages: [...sessionWithUser.messages, aiMsg]
      };

      setSession(updatedSession);
      setVoiceState('ready');
      isSubmittingTurnRef.current = false;

      // 4. Speak AI response via speech synthesis
      setIsSpeakingAi(true);
      speechProvider.synthesizeSpeech(aiMsg.text, { rate: 1.0 }).finally(() => {
        setIsSpeakingAi(false);
        // Hands-Free Conversational Loop: automatically open microphone for user response!
        if (isHandsFreeModeRef.current) {
          setTimeout(() => {
            if (!isSubmittingTurnRef.current && isHandsFreeModeRef.current) {
              startListeningVoice();
            }
          }, 350);
        }
      });

      // 5. Trigger review report when turn threshold is reached
      const userTurns = updatedSession.messages.filter(m => m.sender === 'user').length;
      if (userTurns >= 3) {
        const report = ConversationEngine.generateReviewReport(updatedSession);
        setReviewReport(report);
        BrowserStorage.saveConversation({ ...updatedSession, isCompleted: true, review: report });
      }
    } catch (err) {
      console.warn('Fallback to local conversation processing:', err);
      const { updatedSession, replyMessage } = ConversationEngine.processUserTurn(session, textToSubmit);
      setSession(updatedSession);
      setVoiceState('ready');
      isSubmittingTurnRef.current = false;
      setIsSpeakingAi(true);
      speechProvider.synthesizeSpeech(replyMessage.text, { rate: 1.0 }).finally(() => {
        setIsSpeakingAi(false);
        // Hands-Free Conversational Loop: automatically open microphone for user response in fallback mode!
        if (isHandsFreeModeRef.current) {
          setTimeout(() => {
            if (!isSubmittingTurnRef.current && isHandsFreeModeRef.current) {
              startListeningVoice();
            }
          }, 350);
        }
      });
    }
  };

  const stopAndSubmitVoiceTurn = (forcedText?: string) => {
    if (isSubmittingTurnRef.current) return;
    isSubmittingTurnRef.current = true;
    clearVoiceTimers();
    speechProvider.stopRealtimeRecognition();

    const textToSubmit = (forcedText ?? latestTranscriptRef.current).trim();
    if (textToSubmit) {
      handleSendTurn(textToSubmit);
    } else {
      setVoiceState('ready');
      setRecordedDuration(0);
      setTranscript('');
      setHasDetectedSpeech(false);
      isSubmittingTurnRef.current = false;
    }
  };

  const startListeningVoice = () => {
    if (isSubmittingTurnRef.current || isSpeakingAi) return;
    isSubmittingTurnRef.current = false;
    latestTranscriptRef.current = '';
    setTranscript('');
    setHasDetectedSpeech(false);
    setRecordedDuration(0);
    setVoiceState('listening');

    clearVoiceTimers();
    durationIntervalRef.current = setInterval(() => {
      setRecordedDuration((prev) => prev + 1);
    }, 1000);

    speechProvider.startRealtimeRecognition({
      autoEndOnSilence: true,
      silenceThresholdMs: 1500,
      noSpeechTimeoutMs: 8000,
      onStart: () => {},
      onTranscriptUpdate: (fullText) => {
        if (isSubmittingTurnRef.current) return;
        latestTranscriptRef.current = fullText;
        setTranscript(fullText);

        const trimmed = fullText.trim();
        if (trimmed.length > 0) {
          setHasDetectedSpeech(true);
          // Redundant silence backup timer for edge-case browser speech engines
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
          }
          silenceTimerRef.current = setTimeout(() => {
            stopAndSubmitVoiceTurn();
          }, 1600);
        }
      },
      onSilenceDetected: (finalText) => {
        if (!isSubmittingTurnRef.current && finalText.trim().length > 0) {
          stopAndSubmitVoiceTurn(finalText);
        }
      },
      onNoSpeechTimeout: () => {
        // User turned on mic but did not speak within 8s - gracefully return to ready state
        if (!isSubmittingTurnRef.current) {
          setVoiceState('ready');
          clearVoiceTimers();
          setRecordedDuration(0);
          setHasDetectedSpeech(false);
        }
      },
      onSpeechEnd: () => {
        if (!isSubmittingTurnRef.current && latestTranscriptRef.current.trim().length > 0) {
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
          }
          silenceTimerRef.current = setTimeout(() => {
            stopAndSubmitVoiceTurn();
          }, 700);
        }
      },
      onEnd: () => {
        if (!isSubmittingTurnRef.current) {
          if (latestTranscriptRef.current.trim().length > 0) {
            stopAndSubmitVoiceTurn();
          } else {
            setVoiceState('ready');
            clearVoiceTimers();
            setRecordedDuration(0);
            setHasDetectedSpeech(false);
          }
        }
      },
      onError: (err) => {
        if (!isSubmittingTurnRef.current && !latestTranscriptRef.current.trim()) {
          setVoiceState('ready');
          clearVoiceTimers();
          setRecordedDuration(0);
          setHasDetectedSpeech(false);
        }
      }
    });
  };

  const handleToggleVoice = () => {
    if (voiceState === 'ready') {
      startListeningVoice();
    } else if (voiceState === 'listening') {
      stopAndSubmitVoiceTurn();
    } else {
      setVoiceState('ready');
      clearVoiceTimers();
      setRecordedDuration(0);
      setTranscript('');
      setHasDetectedSpeech(false);
    }
  };

  const handlePlayMessageAudio = (text: string) => {
    setIsSpeakingAi(true);
    speechProvider.synthesizeSpeech(text, { rate: 1.0 }).finally(() => {
      setIsSpeakingAi(false);
    });
  };

  const handleFinishConversation = () => {
    const report = ConversationEngine.generateReviewReport(session);
    setReviewReport(report);
    BrowserStorage.saveConversation({ ...session, isCompleted: true, review: report });
  };

  const modes: { id: ConversationMode; label: string; icon: any; description: string }[] = [
    { id: 'practice', label: 'Practice Mode', icon: Sparkles, description: 'Gentle turn-taking with supportive prompts.' },
    { id: 'interview', label: 'Interview Mode', icon: UserCheck, description: 'Structured behavioral & leadership questions.' },
    { id: 'workplace', label: 'Workplace Mode', icon: Briefcase, description: 'Realistic project alignment & stakeholder sync.' },
    { id: 'free', label: 'Free Conversation', icon: Compass, description: 'Casual dialogue with minimal interruptions.' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', maxWidth: '960px', margin: '0 auto', width: '100%', minWidth: 0, boxSizing: 'border-box' }}>
      {/* 3-Way Mode Switcher: Impromptu Speaking | Essay Writing | Interactive Chat */}
      <div className="coach-nav-switcher">
        <button
          onClick={() => setSubTab('speaking')}
          className={`coach-nav-btn tap-interactive ${subTab === 'speaking' ? 'active' : ''}`}
          style={{
            flex: 1,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '10px 14px',
            borderRadius: 'var(--radius-pill)',
            border: 'none',
            background: subTab === 'speaking' ? 'var(--color-primary)' : 'transparent',
            color: subTab === 'speaking' ? '#ffffff' : 'var(--color-text-secondary)',
            fontWeight: 800,
            fontSize: '0.8125rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap'
          }}
        >
          <Mic size={15} />
          <span className="coach-nav-label-desktop">Speaking (1-5m)</span>
          <span className="coach-nav-label-mobile">Speaking</span>
        </button>

        <button
          onClick={() => setSubTab('writing')}
          className={`coach-nav-btn tap-interactive ${subTab === 'writing' ? 'active' : ''}`}
          style={{
            flex: 1,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '10px 14px',
            borderRadius: 'var(--radius-pill)',
            border: 'none',
            background: subTab === 'writing' ? '#10b981' : 'transparent',
            color: subTab === 'writing' ? '#ffffff' : 'var(--color-text-secondary)',
            fontWeight: 800,
            fontSize: '0.8125rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap'
          }}
        >
          <PenTool size={15} />
          <span className="coach-nav-label-desktop">Writing (150-200w)</span>
          <span className="coach-nav-label-mobile">Writing</span>
        </button>

        <button
          onClick={() => setSubTab('chat')}
          className={`coach-nav-btn tap-interactive ${subTab === 'chat' ? 'active' : ''}`}
          style={{
            flex: 1,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '10px 14px',
            borderRadius: 'var(--radius-pill)',
            border: 'none',
            background: subTab === 'chat' ? 'var(--color-surface)' : 'transparent',
            color: subTab === 'chat' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
            fontWeight: 800,
            fontSize: '0.8125rem',
            cursor: 'pointer',
            boxShadow: subTab === 'chat' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap'
          }}
        >
          <MessageSquare size={15} />
          <span className="coach-nav-label-desktop">Chat Coach</span>
          <span className="coach-nav-label-mobile">Chat</span>
        </button>
      </div>

      {subTab === 'speaking' && <ImpromptuSpeakingTab />}
      {subTab === 'writing' && <EssayWritingTab />}
      {subTab === 'chat' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', maxWidth: '820px', margin: '0 auto', width: '100%' }}>
          {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)', flexWrap: 'wrap' }}>
          <Badge variant="focus">Conversational Coach</Badge>
          <Badge variant="level">{session.scenario.title}</Badge>
          <div style={{ marginLeft: 'auto' }}>
            {isAiConfigured ? (
              <button
                type="button"
                onClick={() => {
                  setKeyInput(GeminiAIService.getApiKey() || '');
                  setTestResult(null);
                  setShowKeyModal(true);
                }}
                className="tap-interactive"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  background: 'rgba(16, 185, 129, 0.12)',
                  color: '#10b981',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  cursor: 'pointer'
                }}
                title="Google Gemini 1.5 Flash is active! Tap to view or edit key."
              >
                <Sparkles size={13} />
                <span>Live Gemini 1.5 Flash</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setKeyInput(GeminiAIService.getApiKey() || '');
                  setTestResult(null);
                  setShowKeyModal(true);
                }}
                className="tap-interactive"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  background: 'rgba(99, 102, 241, 0.12)',
                  color: 'var(--color-primary)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  cursor: 'pointer'
                }}
                title="Smart Offline AI active. Tap to connect free Google Gemini for live ChatGPT/Gemini voice."
              >
                <Zap size={13} />
                <span>Offline AI • Connect Free Gemini</span>
              </button>
            )}
          </div>
        </div>
        <h1 className="typography-h1">AI English Conversation Studio</h1>
        <p className="typography-body" style={{ marginTop: 'var(--space-1)', maxWidth: '65ch' }}>
          Engage in natural spoken dialogue. SpeakFlow listens, understands your context, and responds like an interactive conversational coach.
        </p>
      </div>

      {/* Mode Selector Tabs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 'var(--space-2)' }}>
        {modes.map((m) => {
          const Icon = m.icon;
          const isSelected = selectedMode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => handleModeChange(m.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius-md)',
                background: isSelected ? 'var(--color-primary-subtle)' : 'var(--color-surface)',
                border: `1px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                color: isSelected ? 'var(--color-primary)' : 'var(--color-text-primary)',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all var(--motion-duration-fast) ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: '4px' }}>
                <Icon size={16} />
                <span style={{ fontWeight: 700, fontSize: 'var(--text-body-sm)' }}>{m.label}</span>
              </div>
              <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)' }}>
                {m.description}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Chat Interface */}
      <Card variant="default" padding="lg" style={{ display: 'flex', flexDirection: 'column', minHeight: '480px', borderRadius: '24px', background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.7) 100%)', border: '1px solid rgba(255, 255, 255, 0.08)', backdropFilter: 'blur(16px)', boxShadow: '0 16px 40px -10px rgba(0,0,0,0.4)' }}>
        {/* Scenario Banner */}
        <div className="chat-scenario-banner">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '9999px', background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', color: '#818cf8', fontSize: '0.75rem', fontWeight: 700 }}>
                <span className="chat-ai-live-dot" style={{ background: '#818cf8', boxShadow: '0 0 8px #818cf8' }} />
                Partner: {session.scenario.roleAi}
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '9999px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', fontSize: '0.75rem', fontWeight: 700 }}>
                👤 You: {session.scenario.roleUser}
              </span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '6px' }}>
              {session.scenario.title}
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
            🎯 <strong>Scenario Mission:</strong> {session.scenario.goal}
          </p>
        </div>

        {/* Dismissible Gemini Connect Callout */}
        {!isAiConfigured && !hideConnectBanner && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(16, 185, 129, 0.08) 100%)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
              marginBottom: 'var(--space-3)',
              flexWrap: 'wrap'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem' }}>
              <Sparkles size={16} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
              <span style={{ color: 'var(--color-text-primary)' }}>
                Want live <strong>ChatGPT / Gemini Voice</strong> level conversational AI? Connect your free Gemini API Key in seconds.
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={() => {
                  setKeyInput(GeminiAIService.getApiKey() || '');
                  setTestResult(null);
                  setShowKeyModal(true);
                }}
                className="speakflow-btn btn-variant-primary"
                style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '6px' }}
              >
                Connect Free Key
              </button>
              <button
                type="button"
                onClick={() => setHideConnectBanner(true)}
                style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '0.75rem', padding: '2px 4px' }}
                title="Dismiss"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Message Stream */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: 'var(--space-4)', maxHeight: '440px', overflowY: 'auto', paddingRight: 'var(--space-2)' }}>
          {session.messages.map((msg) => {
            const isAi = msg.sender === 'ai';
            return (
              <div
                key={msg.id}
                className={`chat-message-row ${isAi ? 'ai' : 'user'}`}
              >
                {isAi && (
                  <div className="chat-avatar-ai" title="AI Speech Coach">
                    <Bot size={18} />
                  </div>
                )}

                <div className={isAi ? 'chat-bubble-ai' : 'chat-bubble-user'}>
                  {/* Bubble Header */}
                  <div className="chat-bubble-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {isAi ? (
                        <>
                          <span style={{ fontWeight: 700, color: '#f1f5f9' }}>AI Coach</span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: isAiConfigured ? 'rgba(16, 185, 129, 0.15)' : 'rgba(99, 102, 241, 0.15)', color: isAiConfigured ? '#34d399' : '#818cf8', padding: '1px 8px', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 600 }}>
                            <span className="chat-ai-live-dot" style={{ background: isAiConfigured ? '#10b981' : '#818cf8' }} />
                            {isAiConfigured ? 'Gemini Live' : 'Smart Local'}
                          </span>
                        </>
                      ) : (
                        <span style={{ fontWeight: 700, color: 'rgba(255, 255, 255, 0.95)' }}>You</span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.6875rem', opacity: 0.65 }}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Bubble Message Text */}
                  <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                    {msg.text}
                  </div>

                  {/* Optional Coach Tip Badge underneath */}
                  {isAi && msg.feedback?.naturalAlternative && (
                    <div className="chat-tip-pill">
                      <Sparkles size={14} style={{ flexShrink: 0 }} />
                      <span>{msg.feedback.naturalAlternative}</span>
                    </div>
                  )}

                  {/* AI Bubble Action Bar */}
                  {isAi && (
                    <div className="chat-bubble-actions">
                      <button
                        type="button"
                        onClick={() => handlePlayMessageAudio(msg.text)}
                        className="chat-action-btn"
                        title="Listen to audio"
                      >
                        <Volume2 size={13} />
                        <span>Listen</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(msg.text);
                          setCopiedMsgId(msg.id);
                          setTimeout(() => setCopiedMsgId(null), 1500);
                        }}
                        className="chat-action-btn"
                        title="Copy text"
                      >
                        {copiedMsgId === msg.id ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                        <span>{copiedMsgId === msg.id ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  )}
                </div>

                {!isAi && (
                  <div className="chat-avatar-user" title="You">
                    <User size={18} />
                  </div>
                )}
              </div>
            );
          })}

          {/* AI Thinking Bubble */}
          {voiceState === 'processing' && (
            <div className="chat-message-row ai">
              <div className="chat-avatar-ai">
                <Bot size={18} />
              </div>
              <div className="chat-bubble-ai" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '12px 18px' }}>
                <Sparkles size={16} className="btn-spinner" style={{ color: 'var(--color-primary)' }} />
                <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>AI Coach is thinking & formulating reply...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Text Reply Floating Input Capsule */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (inputText.trim() && voiceState !== 'processing') {
              handleSendTurn(inputText);
            }
          }}
          className="chat-input-capsule"
          style={{ marginBottom: 'var(--space-3)' }}
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={voiceState === 'listening' ? '🎙️ Listening to your voice...' : 'Type your reply or tap the microphone below...'}
            disabled={voiceState === 'listening' || voiceState === 'processing'}
            className="chat-input-field"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || voiceState === 'processing'}
            className="chat-send-btn"
            title="Send reply"
          >
            <Send size={16} />
          </button>
        </form>

        {/* Live Audio Visualizer */}
        <div style={{ marginBottom: 'var(--space-3)' }}>
          <VoiceWaveform active={voiceState === 'listening'} height={36} />
        </div>

        {/* Live Observed Speech Pill */}
        {transcript && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: '8px',
              padding: '8px 18px',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.16) 0%, rgba(99, 102, 241, 0.16) 100%)',
              borderRadius: '9999px',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              margin: '0 auto 12px',
              maxWidth: '92%',
              boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
              animation: 'bubblePopIn 0.2s ease forwards'
            }}
          >
            <span className="chat-ai-live-dot" style={{ background: '#10b981' }} />
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Speaking:</span>
            <span style={{ fontWeight: 600, color: '#ffffff', fontSize: '0.875rem' }}>"{transcript}"</span>
            <span
              style={{
                fontSize: '0.6875rem',
                color: '#34d399',
                background: 'rgba(16, 185, 129, 0.2)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                padding: '2px 8px',
                borderRadius: '9999px',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                marginLeft: '4px'
              }}
            >
              <span>Auto-sends on pause ⏸️</span>
            </span>
          </div>
        )}

        {/* Interaction Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)', paddingTop: 'var(--space-3)', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <button
            onClick={() => handleModeChange(selectedMode)}
            className="speakflow-btn btn-variant-ghost"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1-5)', fontSize: 'var(--text-body-sm)', padding: 'var(--space-2) var(--space-3)' }}
          >
            <RotateCcw size={15} />
            <span>Restart</span>
          </button>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <div className={voiceState === 'listening' ? 'chat-mic-orb-listening' : ''} style={{ borderRadius: '50%' }}>
                <RecordingButton
                  state={voiceState}
                  onToggle={handleToggleVoice}
                  durationSeconds={recordedDuration}
                  statusLabel={
                    voiceState === 'listening'
                      ? (hasDetectedSpeech
                          ? 'Auto-sends on pause ⏸️'
                          : `Listening • ${recordedDuration}s`)
                      : undefined
                  }
                />
              </div>
              {voiceState === 'listening' && (
                <VoiceWaveVisualizer isActive={true} size="md" color="var(--color-error)" />
              )}
              {isSpeakingAi && (
                <VoiceWaveVisualizer isActive={true} size="md" color="var(--color-primary)" />
              )}
            </div>

            {/* Hands-Free Auto-Mic Mode Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => {
                  const next = !isHandsFreeMode;
                  setIsHandsFreeMode(next);
                  isHandsFreeModeRef.current = next;
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('speakflow_hands_free_mode', String(next));
                  }
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  border: `1px solid ${isHandsFreeMode ? 'rgba(16, 185, 129, 0.4)' : 'rgba(255, 255, 255, 0.15)'}`,
                  background: isHandsFreeMode ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.04)',
                  color: isHandsFreeMode ? '#34d399' : 'var(--color-text-secondary)',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                title={isHandsFreeMode ? 'Hands-Free Auto-Mic is ON: Mic starts when AI stops speaking, and auto-submits when you pause.' : 'Hands-Free Auto-Mic is OFF: Click mic manually.'}
              >
                <Zap size={11} fill={isHandsFreeMode ? 'currentColor' : 'none'} />
                <span>Auto-Mic Loop: {isHandsFreeMode ? 'ON' : 'OFF'}</span>
              </button>

              {voiceState === 'listening' && (
                <span
                  style={{
                    fontSize: '0.6875rem',
                    color: '#34d399',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span>• Auto-sends on 1.5s pause</span>
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleFinishConversation}
            className="speakflow-btn btn-variant-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1-5)', fontSize: 'var(--text-body-sm)', padding: 'var(--space-2) var(--space-3-5)', borderRadius: 'var(--radius-md)' }}
          >
            <CheckCircle2 size={16} color="var(--color-accent)" />
            <span>End & Review</span>
          </button>
        </div>
      </Card>

      {/* Post-Conversation Review Card */}
      {reviewReport && (
        <Card variant="elevated" padding="lg">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
            <Sparkles size={20} color="var(--color-primary)" />
            <h2 className="typography-h2" style={{ margin: 0 }}>
              Conversation Insights & Review
            </h2>
          </div>

          <p className="typography-body-sm" style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)' }}>
            Here is your personalized review based on {reviewReport.turnsCount} speaking turns in {reviewReport.mode} mode.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
            {/* Strengths */}
            <div style={{ padding: 'var(--space-4)', background: 'var(--color-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
              <div style={{ fontWeight: 700, fontSize: 'var(--text-body-sm)', color: 'var(--color-accent)', marginBottom: 'var(--space-2)' }}>
                ✓ What You Did Well
              </div>
              <ul style={{ margin: 0, paddingLeft: 'var(--space-4)', fontSize: 'var(--text-body-sm)', color: 'var(--color-text-secondary)' }}>
                {reviewReport.keyStrengths.map((s, idx) => (
                  <li key={idx} style={{ marginBottom: '4px' }}>{s}</li>
                ))}
              </ul>
            </div>

            {/* Improvement Points */}
            <div style={{ padding: 'var(--space-4)', background: 'var(--color-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
              <div style={{ fontWeight: 700, fontSize: 'var(--text-body-sm)', color: 'var(--color-primary)', marginBottom: 'var(--space-2)' }}>
                Patterns to Improve
              </div>
              <ul style={{ margin: 0, paddingLeft: 'var(--space-4)', fontSize: 'var(--text-body-sm)', color: 'var(--color-text-secondary)' }}>
                {reviewReport.patternsToImprove.map((p, idx) => (
                  <li key={idx} style={{ marginBottom: '4px' }}>{p}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Useful Phrases */}
          <div style={{ marginBottom: 'var(--space-6)', padding: 'var(--space-4)', background: 'var(--color-surface-hover)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
            <div style={{ fontWeight: 700, fontSize: 'var(--text-body-sm)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)' }}>
              Useful Phrases for Next Time:
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
              {reviewReport.usefulPhrases.map((phrase, idx) => (
                <span key={idx} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', padding: '4px 10px', borderRadius: 'var(--radius-sm)', fontSize: 'var(--text-body-sm)', fontWeight: 500 }}>
                  "{phrase}"
                </span>
              ))}
            </div>
          </div>

          {/* CTA action */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={() => {
                if (onReturnToHome) onReturnToHome();
              }}
              className="speakflow-btn btn-variant-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-2-5) var(--space-5)', borderRadius: 'var(--radius-md)', fontWeight: 700 }}
            >
              <span>Back to Dashboard</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </Card>
      )}
      </div>
    )}

      {/* Quick Gemini API Key Activation Modal */}
      {showKeyModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-4)'
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: '520px',
              width: '100%',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              padding: 'var(--space-6)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #6366f1, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                  <Sparkles size={16} />
                </div>
                <h3 style={{ margin: 0, fontSize: '1.125rem' }}>Connect Live Google Gemini</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowKeyModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: 'var(--space-4)' }}>
              Unlock real-time, ChatGPT & Gemini-level conversational voice intelligence. Google provides <strong>100% Free API keys</strong> at Google AI Studio (no credit card required).
            </p>

            <div style={{ marginBottom: 'var(--space-4)' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>
                Google Gemini API Key
              </label>
              <input
                type="password"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-surface-hover)',
                  color: 'var(--color-text-primary)',
                  fontSize: '0.875rem',
                  fontFamily: 'monospace',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {testResult && (
              <div
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '0.8125rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: 'var(--space-4)',
                  background: testResult.success ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                  border: testResult.success ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                  color: testResult.success ? '#10b981' : '#f87171'
                }}
              >
                {testResult.success ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                <span>{testResult.message}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: 'var(--space-5)' }}>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '0.75rem',
                  color: 'var(--color-primary)',
                  textDecoration: 'none',
                  fontWeight: 600
                }}
              >
                <span>Get Free Key at Google AI Studio</span>
                <ExternalLink size={12} />
              </a>

              <button
                type="button"
                onClick={async () => {
                  if (!keyInput.trim()) return;
                  setIsTestingKey(true);
                  setTestResult(null);
                  const res = await GeminiAIService.testConnection(keyInput.trim());
                  setIsTestingKey(false);
                  setTestResult(res);
                }}
                disabled={!keyInput.trim() || isTestingKey}
                className="speakflow-btn btn-variant-ghost"
                style={{ fontSize: '0.75rem', padding: '4px 8px' }}
              >
                {isTestingKey ? 'Testing...' : 'Test Connection'}
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setShowKeyModal(false)}
                className="speakflow-btn btn-variant-ghost"
                style={{ padding: '8px 16px', fontSize: '0.8125rem' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const trimmed = keyInput.trim();
                  const settings = BrowserStorage.getSettings();
                  settings.geminiApiKey = trimmed;
                  settings.aiProviderType = trimmed ? 'gemini' : 'local';
                  BrowserStorage.saveSettings(settings);
                  setIsAiConfigured(Boolean(trimmed));
                  setIsKeySaved(true);
                  setTimeout(() => {
                    setIsKeySaved(false);
                    setShowKeyModal(false);
                  }, 800);
                }}
                className="speakflow-btn btn-variant-primary"
                style={{ padding: '8px 18px', fontSize: '0.8125rem', fontWeight: 700 }}
              >
                {isKeySaved ? 'Activated! ✓' : 'Save & Activate Live AI'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
