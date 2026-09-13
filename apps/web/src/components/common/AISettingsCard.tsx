import React, { useState, useEffect } from 'react';
import { Card, Badge } from '../../design-system';
import { BrowserStorage } from '../../storage/BrowserStorage';
import { GeminiAIService } from '../../services/GeminiAIService';
import {
  Sparkles,
  Key,
  CheckCircle2,
  ExternalLink,
  Eye,
  EyeOff,
  Zap,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

export const AISettingsCard: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const [showKey, setShowKey] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState<boolean>(false);

  useEffect(() => {
    const existing = GeminiAIService.getApiKey() || '';
    setApiKey(existing);
  }, []);

  const handleSave = () => {
    const settings = BrowserStorage.getSettings();
    settings.geminiApiKey = apiKey.trim();
    settings.aiProviderType = apiKey.trim() ? 'gemini' : 'local';
    BrowserStorage.saveSettings(settings);

    setSaveStatus('saved');
    setTestResult(null);
    setTimeout(() => setSaveStatus('idle'), 2500);
  };

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    const result = await GeminiAIService.testConnection(apiKey);
    setIsTesting(false);
    setTestResult(result);
  };

  const isConnected = Boolean(apiKey.trim()) && testResult?.success !== false;

  return (
    <Card variant="elevated" padding="lg">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #0ea5e9 0%, #10b981 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff'
              }}
            >
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="typography-h3" style={{ margin: 0 }}>
                AI Speech Coach Engine (Google Gemini)
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                Powered by Google Gemini 1.5 Flash for natural spoken dialogue & fluency feedback
              </span>
            </div>
          </div>

          <div>
            {apiKey.trim() ? (
              <Badge variant="primary" icon={<CheckCircle2 size={12} />}>
                Gemini 1.5 Flash Active
              </Badge>
            ) : (
              <Badge variant="default" icon={<Zap size={12} />}>
                Offline Heuristic Mode
              </Badge>
            )}
          </div>
        </div>

        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
          SpeakFlow can use <strong>Google Gemini 1.5 Flash</strong> to provide real-time, personalized conversational coaching.
          You can get a <strong>100% Free API Key</strong> (no credit card required) from Google AI Studio.
        </p>

        {/* API Key Input Field */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Gemini API Key
          </label>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Paste AI Studio API Key (AIzaSy...)"
                style={{
                  width: '100%',
                  padding: '10px 40px 10px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-surface)',
                  color: 'var(--color-text-primary)',
                  fontSize: '0.875rem',
                  fontFamily: 'monospace'
                }}
              />
              <button
                type="button"
                onClick={() => setShowKey((prev) => !prev)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--color-text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex'
                }}
                title={showKey ? 'Hide key' : 'Show key'}
              >
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <button
              type="button"
              onClick={handleSave}
              className="speakflow-btn btn-variant-primary"
              style={{
                padding: '10px 18px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8125rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {saveStatus === 'saved' ? 'Saved ✓' : 'Save Key'}
            </button>

            {apiKey.trim() && (
              <button
                type="button"
                onClick={handleTest}
                disabled={isTesting}
                className="speakflow-btn btn-variant-secondary"
                style={{
                  padding: '10px 16px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: isTesting ? 'wait' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <RefreshCw size={13} className={isTesting ? 'btn-spinner' : ''} />
                <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Test Feedback Banner */}
        {testResult && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '0.8125rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: testResult.success ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
              border: testResult.success ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
              color: testResult.success ? '#10b981' : '#f87171'
            }}
          >
            {testResult.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{testResult.message}</span>
          </div>
        )}

        {/* Action Link to Google AI Studio */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', paddingTop: '4px' }}>
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.8125rem',
              color: 'var(--color-primary)',
              fontWeight: 600,
              textDecoration: 'none'
            }}
          >
            <span>Get a 100% Free Gemini API Key at Google AI Studio</span>
            <ExternalLink size={13} />
          </a>

          <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
            Stored locally in your browser
          </span>
        </div>
      </div>
    </Card>
  );
};
