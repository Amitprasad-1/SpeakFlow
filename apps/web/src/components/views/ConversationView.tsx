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
  AlertCircle
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

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check Gemini configuration on mount
  useEffect(() => {
    setIsAiConfigured(GeminiAIService.isConfigured());
  }, []);

  // Auto-scroll chat to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session.messages, isSpeakingAi]);

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      speechProvider.dispose();
    };
  }, [speechProvider]);

  const handleModeChange = (mode: ConversationMode) => {
    setSelectedMode(mode);
    setReviewReport(null);
    setTranscript('');
    setInputText('');
    setVoiceState('ready');
    const newSession = ConversationEngine.startSession(mode);
    setSession(newSession);
  };

  const handleSendTurn = async (rawText: string) => {
    const textToSubmit = rawText.trim();
    if (!textToSubmit) return;

    setVoiceState('processing');
    setInputText('');
    setTranscript('');
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

      // 4. Speak AI response via speech synthesis
      setIsSpeakingAi(true);
      speechProvider.synthesizeSpeech(aiMsg.text, { rate: 1.0 }).finally(() => {
        setIsSpeakingAi(false);
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
      setIsSpeakingAi(true);
      speechProvider.synthesizeSpeech(replyMessage.text, { rate: 1.0 }).finally(() => {
        setIsSpeakingAi(false);
      });
    }
  };

  const handleToggleVoice = () => {
    if (voiceState === 'ready') {
      setVoiceState('listening');
      setRecordedDuration(1);
      setTranscript('');

      speechProvider.startRealtimeRecognition({
        onTranscriptUpdate: (text) => setTranscript(text),
        onError: () => {}
      });
    } else if (voiceState === 'listening') {
      speechProvider.stopRealtimeRecognition();
      const textToSubmit = transcript.trim() || "Yes, I understand and agree with that approach.";
      handleSendTurn(textToSubmit);
    } else {
      setVoiceState('ready');
      setRecordedDuration(0);
      setTranscript('');
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
      <Card variant="default" padding="lg" style={{ display: 'flex', flexDirection: 'column', minHeight: '440px' }}>
        {/* Scenario Banner */}
        <div style={{ padding: 'var(--space-3) var(--space-4)', background: 'var(--color-surface-hover)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)', marginBottom: 'var(--space-4)' }}>
          <span style={{ fontSize: 'var(--text-caption)', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase' }}>
            Partner: {session.scenario.roleAi} • You: {session.scenario.roleUser}
          </span>
          <p style={{ margin: '4px 0 0', fontSize: 'var(--text-body-sm)', color: 'var(--color-text-secondary)' }}>
            {session.scenario.goal}
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
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginBottom: 'var(--space-4)', maxHeight: '420px', overflowY: 'auto', paddingRight: 'var(--space-2)' }}>
          {session.messages.map((msg) => {
            const isAi = msg.sender === 'ai';
            return (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isAi ? 'flex-start' : 'flex-end'
                }}
              >
                <div
                  style={{
                    maxWidth: '82%',
                    padding: 'var(--space-3-5) var(--space-4)',
                    borderRadius: isAi ? 'var(--radius-lg) var(--radius-lg) var(--radius-lg) var(--radius-xs)' : 'var(--radius-lg) var(--radius-lg) var(--radius-xs) var(--radius-lg)',
                    background: isAi ? 'var(--color-surface-hover)' : 'var(--color-primary)',
                    color: isAi ? 'var(--color-text-primary)' : '#ffffff',
                    border: `1px solid ${isAi ? 'var(--color-border)' : 'transparent'}`,
                    lineHeight: 1.5,
                    fontSize: 'var(--text-body)'
                  }}
                >
                  {msg.text}
                </div>

                {/* Optional Coach Tip Badge underneath */}
                {isAi && msg.feedback?.naturalAlternative && (
                  <div style={{ marginTop: 'var(--space-1)', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: 'var(--text-caption)', color: 'var(--color-primary)', background: 'var(--color-primary-subtle)', padding: '2px 8px', borderRadius: 'var(--radius-sm)' }}>
                    <Sparkles size={12} />
                    <span>{msg.feedback.naturalAlternative}</span>
                  </div>
                )}

                {isAi && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                    <button
                      onClick={() => handlePlayMessageAudio(msg.text)}
                      className="speakflow-btn btn-variant-ghost"
                      style={{ padding: '2px 6px', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}
                      title="Replay message audio"
                    >
                      <Volume2 size={12} style={{ marginRight: '4px' }} /> Replay
                    </button>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', opacity: 0.8 }}>
                      {isAiConfigured ? '✨ Gemini 1.5 Flash' : '⚡ Smart Local AI'}
                    </span>
                  </div>
                )}
              </div>
            );
          })}

          {/* AI Thinking Bubble */}
          {voiceState === 'processing' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <div
                style={{
                  padding: 'var(--space-3) var(--space-4)',
                  borderRadius: 'var(--radius-lg) var(--radius-lg) var(--radius-lg) var(--radius-xs)',
                  background: 'var(--color-surface-hover)',
                  color: 'var(--color-text-secondary)',
                  border: '1px solid var(--color-border)',
                  fontSize: 'var(--text-body-sm)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Sparkles size={14} style={{ color: 'var(--color-primary)' }} />
                <span>AI Coach is thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Text Reply Input Box */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (inputText.trim() && voiceState !== 'processing') {
              handleSendTurn(inputText);
            }
          }}
          style={{
            display: 'flex',
            gap: 'var(--space-2)',
            alignItems: 'center',
            marginBottom: 'var(--space-3)'
          }}
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={voiceState === 'listening' ? 'Listening to voice...' : 'Type your reply or use microphone below...'}
            disabled={voiceState === 'listening' || voiceState === 'processing'}
            style={{
              flex: 1,
              padding: 'var(--space-2-5) var(--space-4)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
              color: 'var(--color-text-primary)',
              fontSize: 'var(--text-body-sm)',
              outline: 'none'
            }}
          />
          <button
            type="submit"
            disabled={!inputText.trim() || voiceState === 'processing'}
            className="speakflow-btn btn-variant-primary"
            style={{
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-2-5) var(--space-4)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              opacity: (!inputText.trim() || voiceState === 'processing') ? 0.5 : 1,
              cursor: (!inputText.trim() || voiceState === 'processing') ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              fontSize: 'var(--text-body-sm)'
            }}
            title="Send reply"
          >
            <Send size={14} />
            <span>Send</span>
          </button>
        </form>

        {/* Live Audio Visualizer */}
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <VoiceWaveform active={voiceState === 'listening'} height={36} />
        </div>

        {/* Live Observed Speech */}
        {transcript && (
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-3)', padding: 'var(--space-2) var(--space-3)', background: 'var(--color-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontSize: 'var(--text-body-sm)' }}>
            <span style={{ color: 'var(--color-text-muted)', marginRight: '6px' }}>Listening:</span>
            <span style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>"{transcript}"</span>
          </div>
        )}

        {/* Interaction Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--color-border-subtle)' }}>
          <button
            onClick={() => handleModeChange(selectedMode)}
            className="speakflow-btn btn-variant-ghost"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1-5)', fontSize: 'var(--text-body-sm)', padding: 'var(--space-2) var(--space-3)' }}
          >
            <RotateCcw size={15} />
            <span>Restart</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <RecordingButton
              state={voiceState}
              onToggle={handleToggleVoice}
              durationSeconds={recordedDuration}
            />
            {voiceState === 'listening' && (
              <VoiceWaveVisualizer isActive={true} size="md" color="var(--color-error)" />
            )}
            {isSpeakingAi && (
              <VoiceWaveVisualizer isActive={true} size="md" color="var(--color-primary)" />
            )}
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
