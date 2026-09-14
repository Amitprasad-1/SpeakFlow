import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../../store/AppContext';
import {
  SpeakingScenario,
  ConversationMessage,
  SpeakingEvaluationReport,
  SPEAKING_SCENARIOS_CATALOG
} from '@speakflow/core';
import { WebAudioVisualizer } from '../../../audio/WebAudioVisualizer';
import {
  Mic,
  Square,
  Volume2,
  Send,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Bot,
  User,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export const SpeakingSimulatorView: React.FC<{
  onComplete: (report: SpeakingEvaluationReport) => void;
}> = ({ onComplete }) => {
  const { lesson, speechProvider, aiProvider, settings } = useApp();

  const [selectedScenario, setSelectedScenario] = useState<SpeakingScenario>(
    lesson.speakingChallenge
  );
  const [messages, setMessages] = useState<ConversationMessage[]>([
    {
      id: 'msg_0',
      sender: 'ai',
      text: selectedScenario.initialMessage,
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [evaluationReport, setEvaluationReport] = useState<SpeakingEvaluationReport | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const visualizerRef = useRef<WebAudioVisualizer | null>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiThinking]);

  // Visualizer Init
  useEffect(() => {
    const visualizer = new WebAudioVisualizer();
    visualizerRef.current = visualizer;

    if (canvasRef.current) {
      visualizer.attachCanvas(canvasRef.current);
      visualizer.startRendering(settings.theme);
    }

    return () => {
      visualizer.dispose();
      visualizerRef.current = null;
    };
  }, [settings.theme]);

  // Speak AI initial message on first load
  useEffect(() => {
    speechProvider.synthesizeSpeech(selectedScenario.initialMessage, { rate: 0.95 });
  }, [selectedScenario]);

  // Voice Recording Toggle
  const handleToggleRecord = async () => {
    if (isRecording) {
      setIsRecording(false);
      speechProvider.stopRealtimeRecognition();
      visualizerRef.current?.startSimulation(false);
      visualizerRef.current?.setAnalyser(null);

      await speechProvider.stopRecording();
      if (inputText.trim()) {
        handleSendMessage(inputText);
      }
    } else {
      setIsRecording(true);
      setInputText('');
      await speechProvider.startRecording();

      const analyser = speechProvider.getAnalyserNode();
      if (analyser && visualizerRef.current) {
        visualizerRef.current.setAnalyser(analyser);
      } else {
        visualizerRef.current?.startSimulation(true);
      }

      speechProvider.startRealtimeRecognition({
        autoEndOnSilence: true,
        silenceThresholdMs: 1600,
        noSpeechTimeoutMs: 8000,
        onTranscriptUpdate: (transcript) => {
          setInputText(transcript);
        },
        onSilenceDetected: (finalText) => {
          if (finalText.trim()) {
            handleToggleRecord();
          }
        },
        onNoSpeechTimeout: () => {
          handleToggleRecord();
        },
        onError: (err) => {
          console.warn('Speaking speech recognition warning:', err);
        }
      });
    }
  };

  // Send Message & Get AI Partner Response
  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ConversationMessage = {
      id: `msg_user_${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString()
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputText('');
    setIsAiThinking(true);

    try {
      const reply = await aiProvider.generateConversationReply(selectedScenario, newHistory);

      const aiMsg: ConversationMessage = {
        id: `msg_ai_${Date.now()}`,
        sender: 'ai',
        text: reply.replyText,
        timestamp: new Date().toLocaleTimeString(),
        feedback: {
          grammarCorrection: reply.grammarCorrection,
          naturalAlternative: reply.naturalAlternative
        }
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsAiThinking(false);

      // Synthesize partner audio response
      setIsAiSpeaking(true);
      await speechProvider.synthesizeSpeech(reply.replyText, { rate: 0.95 });
      setIsAiSpeaking(false);

      // Auto-start microphone after AI finishes speaking for continuous roleplay conversation!
      setTimeout(() => {
        handleToggleRecord();
      }, 400);
    } catch (e) {
      console.warn('AI reply generation error:', e);
      setIsAiThinking(false);
    }
  };

  // End Conversation & Generate Report
  const handleEvaluateConversation = async () => {
    setIsAiThinking(true);
    const report = await aiProvider.evaluateConversation(selectedScenario, messages);
    setEvaluationReport(report);
    setIsAiThinking(false);
  };

  return (
    <div style={{ maxWidth: '920px', margin: '0 auto' }}>
      {/* Header & Scenario Switcher */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-6)' }}>
        <div>
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-primary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Stage 5 of 6 • Interactive AI Speech Simulation
          </span>
          <h2 style={{ fontSize: '1.625rem', marginTop: '4px' }}>{selectedScenario.title}</h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginTop: '2px' }}>
            Partner: <strong style={{ color: 'var(--color-text-primary)' }}>{selectedScenario.roleAi}</strong> • Your Role: <strong style={{ color: 'var(--color-text-primary)' }}>{selectedScenario.roleUser}</strong>
          </p>
        </div>

        <select
          value={selectedScenario.id}
          onChange={(e) => {
            const sc = SPEAKING_SCENARIOS_CATALOG.find((s) => s.id === e.target.value);
            if (sc) {
              setSelectedScenario(sc);
              setMessages([
                {
                  id: 'msg_0',
                  sender: 'ai',
                  text: sc.initialMessage,
                  timestamp: new Date().toLocaleTimeString()
                }
              ]);
              setEvaluationReport(null);
            }
          }}
          style={{
            background: 'var(--color-bg-surface-elevated)',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border)',
            padding: 'var(--space-2) var(--space-4)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.875rem',
            fontWeight: 600
          }}
        >
          {SPEAKING_SCENARIOS_CATALOG.map((sc) => (
            <option key={sc.id} value={sc.id}>
              {sc.title}
            </option>
          ))}
        </select>
      </div>

      {/* Scenario Briefing Card */}
      <div
        style={{
          background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-bg-surface))',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-4) var(--space-6)',
          marginBottom: 'var(--space-6)'
        }}
      >
        <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', marginBottom: '2px' }}>
          Mission Context & Goal
        </div>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
          {selectedScenario.contextDescription}
        </p>
        <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
          <strong>Communication Target:</strong> {selectedScenario.goal}
        </div>
      </div>

      {/* Main Dialogue Box */}
      <div
        className="card"
        style={{
          height: '420px',
          overflowY: 'auto',
          padding: 'var(--space-6)',
          marginBottom: 'var(--space-4)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)'
        }}
      >
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: isUser ? 'flex-end' : 'flex-start'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: '4px' }}>
                {isUser ? <User size={14} color="var(--color-primary)" /> : <Bot size={14} color="var(--color-secondary)" />}
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                  {isUser ? selectedScenario.roleUser : selectedScenario.roleAi} • {msg.timestamp}
                </span>
              </div>

              <div
                style={{
                  maxWidth: '80%',
                  padding: 'var(--space-4)',
                  borderRadius: 'var(--radius-lg)',
                  background: isUser ? 'var(--color-primary)' : 'var(--color-bg-surface-elevated)',
                  color: isUser ? '#ffffff' : 'var(--color-text-primary)',
                  border: isUser ? 'none' : '1px solid var(--color-border)',
                  lineHeight: 1.6,
                  fontSize: '0.9375rem'
                }}
              >
                {msg.text}
              </div>

              {/* Coaching notes under AI bubble */}
              {msg.feedback?.naturalAlternative && (
                <div
                  style={{
                    maxWidth: '80%',
                    marginTop: '4px',
                    padding: 'var(--space-2) var(--space-3)',
                    background: 'var(--color-bg-subtle)',
                    borderLeft: '3px solid var(--color-secondary)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.75rem',
                    color: 'var(--color-text-secondary)'
                  }}
                >
                  <Sparkles size={12} color="var(--color-secondary)" style={{ display: 'inline', marginRight: '4px' }} />
                  {msg.feedback.naturalAlternative}
                </div>
              )}
            </div>
          );
        })}

        {isAiThinking && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>
            <Bot size={16} />
            <span>{selectedScenario.roleAi} is formulating thoughts...</span>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Waveform Bar & Voice Control */}
      <div className="waveform-container" style={{ height: '60px', marginBottom: 'var(--space-4)' }}>
        <canvas ref={canvasRef} className="waveform-canvas" />
      </div>

      {/* Recording & Input Bar */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
        <button
          className={`btn ${isRecording ? 'btn-secondary' : 'btn-primary'}`}
          onClick={handleToggleRecord}
          style={{
            padding: '0.75rem 1.5rem',
            borderColor: isRecording ? 'var(--color-error)' : undefined,
            minWidth: '170px'
          }}
        >
          {isRecording ? <Square size={18} color="var(--color-error)" /> : <Mic size={18} />}
          <span>{isRecording ? 'Stop & Send' : 'Speak Message'}</span>
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && inputText.trim()) {
              handleSendMessage(inputText);
            }
          }}
          placeholder="Type or speak your conversational response..."
          style={{
            flex: 1,
            background: 'var(--color-bg-surface-elevated)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '0 var(--space-4)',
            color: 'var(--color-text-primary)'
          }}
        />

        <button
          className="btn btn-secondary"
          onClick={() => handleSendMessage(inputText)}
          disabled={!inputText.trim()}
          style={{ padding: '0 1.25rem' }}
        >
          <Send size={18} />
        </button>

        <button
          className="btn btn-secondary"
          onClick={handleEvaluateConversation}
          title="Conclude conversation & generate report"
        >
          <span>End & Score</span>
        </button>
      </div>

      {/* Comprehensive Evaluation Report Card */}
      {evaluationReport && (
        <div
          className="card"
          style={{
            borderColor: 'var(--color-primary)',
            background: 'var(--color-bg-surface-elevated)',
            padding: 'var(--space-8)',
            marginBottom: 'var(--space-6)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
            <div>
              <span style={{ fontSize: '0.8125rem', color: 'var(--color-primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Executive Speech Evaluation
              </span>
              <h3 style={{ fontSize: '1.5rem', marginTop: '2px' }}>Roleplay Communication Report</h3>
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-primary)' }}>
              {evaluationReport.overallScore}/100
            </div>
          </div>

          {/* Metric Breakdown Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
            {[
              { label: 'Fluency', score: evaluationReport.fluencyScore },
              { label: 'Grammar', score: evaluationReport.grammarScore },
              { label: 'Vocabulary', score: evaluationReport.vocabularyScore },
              { label: 'Pronunciation', score: evaluationReport.pronunciationScore },
              { label: 'Structure', score: evaluationReport.sentenceStructureScore },
              { label: 'Naturalness', score: evaluationReport.naturalnessScore },
              { label: 'Confidence', score: evaluationReport.confidenceScore }
            ].map((m, idx) => (
              <div key={idx} style={{ background: 'var(--color-bg-subtle)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>{m.label}</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{m.score}%</div>
              </div>
            ))}
          </div>

          {/* Strengths & Alternatives */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
            <div>
              <h4 style={{ fontSize: '0.9375rem', color: 'var(--color-primary)', marginBottom: 'var(--space-2)' }}>Key Strengths</h4>
              <ul style={{ paddingLeft: 'var(--space-4)', fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                {evaluationReport.keyStrengths.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 style={{ fontSize: '0.9375rem', color: 'var(--color-warning)', marginBottom: 'var(--space-2)' }}>Areas for Polish</h4>
              <ul style={{ paddingLeft: 'var(--space-4)', fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                {evaluationReport.areasForImprovement.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Footer Navigation */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
        <button
          className="btn btn-primary"
          onClick={() => onComplete(evaluationReport || ({} as any))}
          style={{ padding: '0.75rem 2rem' }}
        >
          <span>Continue to Listening Lab</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
