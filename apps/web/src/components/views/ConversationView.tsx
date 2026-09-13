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
  PenTool
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
      // 2. Query Gemini 1.5 Flash (with automatic fallback to offline heuristic)
      const coachResponse = await GeminiAIService.generateConversationReply({
        userMessage: textToSubmit,
        mode: session.mode,
        scenarioTitle: session.scenario.title,
        history: sessionWithUser.messages.map(m => ({ sender: m.sender, text: m.text }))
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', maxWidth: '960px', margin: '0 auto' }}>
      {/* 3-Way Mode Switcher: Impromptu Speaking | Essay Writing | Interactive Chat */}
      <div
        className="coach-nav-switcher"
        style={{
          display: 'flex',
          background: 'var(--color-surface-sunken)',
          padding: '4px',
          borderRadius: 'var(--radius-pill)',
          border: '1px solid var(--color-border)',
          gap: '4px',
          width: '100%',
          maxWidth: '720px',
          margin: '0 auto 8px auto'
        }}
      >
        <button
          onClick={() => setSubTab('speaking')}
          className={`coach-nav-btn ${subTab === 'speaking' ? 'active' : ''}`}
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
          <span>Speaking (1-5m)</span>
        </button>

        <button
          onClick={() => setSubTab('writing')}
          className={`coach-nav-btn ${subTab === 'writing' ? 'active' : ''}`}
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
          <span>Writing (150-200w)</span>
        </button>

        <button
          onClick={() => setSubTab('chat')}
          className={`coach-nav-btn ${subTab === 'chat' ? 'active' : ''}`}
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
          <span>Chat Coach</span>
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
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  background: 'rgba(16, 185, 129, 0.12)',
                  color: '#10b981',
                  border: '1px solid rgba(16, 185, 129, 0.25)'
                }}
                title="Powered by live Google Gemini 1.5 Flash LLM"
              >
                <Sparkles size={12} />
                Gemini 1.5 Flash Active
              </span>
            ) : (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  background: 'var(--color-surface)',
                  color: 'var(--color-text-secondary)',
                  border: '1px solid var(--color-border)'
                }}
                title="Local heuristic coaching active. Add your Gemini API key in Profile & Settings for live LLM conversations."
              >
                <Zap size={12} />
                Offline AI Coach
              </span>
            )}
          </div>
        </div>
        <h1 className="typography-h1">AI English Conversation Studio</h1>
        <p className="typography-body" style={{ marginTop: 'var(--space-1)', maxWidth: '65ch' }}>
          Engage in natural, single-question dialogue. SpeakFlow listens, responds in real-time, and gives supportive guidance.
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
                  <button
                    onClick={() => handlePlayMessageAudio(msg.text)}
                    className="speakflow-btn btn-variant-ghost"
                    style={{ padding: '2px 6px', marginTop: '2px', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}
                    title="Replay message audio"
                  >
                    <Volume2 size={12} style={{ marginRight: '4px' }} /> Replay
                  </button>
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
  </div>
);
};
