import React, { useState } from 'react';
import { useApp } from '../../store/AppContext';
import { BrowserStorage } from '../../storage/BrowserStorage';
import {
  X,
  Shield,
  Key,
  Mic,
  Moon,
  Sun,
  Type,
  RotateCcw,
  Check,
  Cpu,
  Sparkles
} from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const {
    settings,
    updateSettings,
    showSettingsModal,
    setShowSettingsModal,
    speechProvider
  } = useApp();

  const [aiType, setAiType] = useState(settings.aiProviderType);
  const [geminiKey, setGeminiKey] = useState(settings.geminiApiKey || '');
  const [openAiKey, setOpenAiKey] = useState(settings.openAiApiKey || '');
  const [micState, setMicState] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  if (!showSettingsModal) return null;

  const handleSave = () => {
    updateSettings({
      aiProviderType: aiType,
      geminiApiKey: geminiKey.trim() || undefined,
      openAiApiKey: openAiKey.trim() || undefined
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleTestMic = async () => {
    const status = await speechProvider.checkMicrophonePermission();
    setMicState(status);
  };

  const handleResetData = () => {
    if (window.confirm('Reset all demo data and restore initial state?')) {
      BrowserStorage.resetToDemo();
      window.location.reload();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-4)'
      }}
    >
      <div
        className="card"
        style={{
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: 'var(--space-8)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Cpu size={22} color="var(--color-primary)" />
            <h3 style={{ fontSize: '1.25rem' }}>Engine Settings & AI Providers</h3>
          </div>
          <button className="btn-icon" onClick={() => setShowSettingsModal(false)}>
            <X size={18} />
          </button>
        </div>

        {/* AI Engine Selection */}
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
            AI Engine Provider
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
            {[
              { id: 'local', label: 'Local Adaptive', badge: 'Offline' },
              { id: 'gemini', label: 'Google Gemini', badge: 'Cloud' },
              { id: 'openai', label: 'OpenAI GPT', badge: 'Cloud' }
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setAiType(p.id as any)}
                style={{
                  padding: 'var(--space-3) var(--space-2)',
                  borderRadius: 'var(--radius-md)',
                  background: aiType === p.id ? 'var(--color-primary-light)' : 'var(--color-bg-subtle)',
                  border: `1px solid ${aiType === p.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  color: aiType === p.id ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  fontWeight: 600,
                  textAlign: 'center',
                  fontSize: '0.8125rem'
                }}
              >
                <div>{p.label}</div>
                <div style={{ fontSize: '0.6875rem', opacity: 0.8 }}>{p.badge}</div>
              </button>
            ))}
          </div>

          {/* Gemini API Key Input */}
          {aiType === 'gemini' && (
            <div style={{ background: 'var(--color-bg-subtle)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)' }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '4px' }}>
                Google Gemini API Key
              </label>
              <input
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="AIzaSy..."
                style={{
                  width: '100%',
                  background: 'var(--color-bg-surface-elevated)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: 'var(--space-2) var(--space-3)',
                  color: 'var(--color-text-primary)',
                  fontSize: '0.875rem',
                  marginBottom: '6px'
                }}
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                Your key is stored strictly in your browser local storage and never leaves your device.
              </p>
            </div>
          )}

          {/* OpenAI API Key Input */}
          {aiType === 'openai' && (
            <div style={{ background: 'var(--color-bg-subtle)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)' }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '4px' }}>
                OpenAI API Key
              </label>
              <input
                type="password"
                value={openAiKey}
                onChange={(e) => setOpenAiKey(e.target.value)}
                placeholder="sk-..."
                style={{
                  width: '100%',
                  background: 'var(--color-bg-surface-elevated)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: 'var(--space-2) var(--space-3)',
                  color: 'var(--color-text-primary)',
                  fontSize: '0.875rem',
                  marginBottom: '6px'
                }}
              />
            </div>
          )}
        </div>

        {/* Audio Diagnostics */}
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
            Microphone & Speech Diagnostics
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <button className="btn btn-secondary" onClick={handleTestMic}>
              <Mic size={16} />
              <span>Test Hardware Permission</span>
            </button>
            {micState && (
              <span style={{ fontSize: '0.8125rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                Status: {micState.toUpperCase()}
              </span>
            )}
          </div>
        </div>

        {/* Accessibility & Typography Scale */}
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
            Font Size Scale
          </label>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            {[
              { scale: 0.9, label: 'Compact' },
              { scale: 1.0, label: 'Normal' },
              { scale: 1.15, label: 'Large' }
            ].map((f) => (
              <button
                key={f.scale}
                onClick={() => updateSettings({ fontScale: f.scale })}
                style={{
                  flex: 1,
                  padding: 'var(--space-2)',
                  borderRadius: 'var(--radius-sm)',
                  background: settings.fontScale === f.scale ? 'var(--color-primary-light)' : 'var(--color-bg-subtle)',
                  border: `1px solid ${settings.fontScale === f.scale ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  color: settings.fontScale === f.scale ? 'var(--color-primary)' : 'var(--color-text-primary)',
                  fontWeight: 600,
                  fontSize: '0.8125rem'
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Privacy by Design */}
        <div
          style={{
            background: 'var(--color-bg-subtle)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-4)',
            marginBottom: 'var(--space-6)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: '4px' }}>
            <Shield size={16} color="var(--color-primary)" />
            <span style={{ fontSize: '0.8125rem', fontWeight: 700 }}>Voice Privacy Architecture</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
            Raw microphone audio is buffered strictly in volatile memory during active exercises and is immediately wiped once acoustic enunciation scoring completes. No permanent recordings are stored.
          </p>
        </div>

        {/* Save & Reset Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            className="btn btn-secondary"
            onClick={handleResetData}
            style={{ color: 'var(--color-error)' }}
          >
            <RotateCcw size={16} />
            <span>Reset Demo Data</span>
          </button>

          <button className="btn btn-primary" onClick={handleSave}>
            {isSaved ? <Check size={16} /> : null}
            <span>{isSaved ? 'Settings Saved' : 'Save Preferences'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
