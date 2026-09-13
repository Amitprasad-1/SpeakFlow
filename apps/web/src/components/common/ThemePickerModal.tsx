import React, { useEffect } from 'react';
import { Palette, Check, X, Sparkles } from 'lucide-react';
import { ThemeMode, THEME_PRESETS, ThemePreset } from './ThemeToggle';

interface ThemePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeMode: ThemeMode;
  onSelectTheme: (mode: ThemeMode) => void;
}

export const ThemePickerModal: React.FC<ThemePickerModalProps> = ({
  isOpen,
  onClose,
  activeMode,
  onSelectTheme
}) => {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const resolvedActive = activeMode === 'dark' ? 'obsidian' : activeMode;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backgroundColor: 'rgba(0, 0, 0, 0.72)',
        backdropFilter: 'blur(10px)',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '680px',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-2xl)',
          padding: '28px',
          boxShadow: '0 20px 48px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Palette size={20} color="var(--color-primary)" />
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: 'var(--color-text-primary)' }}>
                Application Theme Styles
              </h2>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', margin: 0 }}>
              Choose your preferred visual atmosphere. Each theme includes tailored typography, ambient mesh lighting, and contrast-checked cards.
            </p>
          </div>

          <button
            onClick={onClose}
            className="tap-interactive"
            style={{
              background: 'var(--color-surface-sunken)',
              border: '1px solid var(--color-border)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-text-muted)',
              cursor: 'pointer'
            }}
            aria-label="Close theme modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Themes Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '14px'
          }}
        >
          {THEME_PRESETS.map((preset) => {
            const isSelected = resolvedActive === preset.id;

            return (
              <div
                key={preset.id}
                onClick={() => onSelectTheme(preset.id)}
                className="tap-interactive"
                style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-xl)',
                  border: isSelected ? `2px solid ${preset.primaryColor}` : '1px solid var(--color-border)',
                  background: isSelected ? 'var(--color-primary-subtle)' : 'var(--color-surface-sunken)',
                  cursor: 'pointer',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  boxShadow: isSelected ? `0 0 16px ${preset.primaryColor}33` : 'none',
                  transition: 'all 0.18s ease'
                }}
              >
                {/* Visual Swatch Preview Bar */}
                <div
                  style={{
                    height: '60px',
                    borderRadius: 'var(--radius-lg)',
                    background: preset.bgPreview,
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    padding: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {/* Subtle card mockup inside */}
                  <div
                    style={{
                      background: preset.cardPreview,
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      padding: '6px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <div
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: preset.primaryColor,
                        boxShadow: `0 0 8px ${preset.primaryColor}`
                      }}
                    />
                    <div
                      style={{
                        width: '36px',
                        height: '6px',
                        borderRadius: '3px',
                        background: preset.isDark ? '#ffffff' : '#0f172a',
                        opacity: 0.8
                      }}
                    />
                  </div>

                  {/* Accent chip */}
                  <div
                    style={{
                      padding: '3px 8px',
                      borderRadius: '10px',
                      background: preset.accentColor,
                      color: '#ffffff',
                      fontSize: '0.625rem',
                      fontWeight: 800
                    }}
                  >
                    ACCENT
                  </div>
                </div>

                {/* Text Info */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                        {preset.name}
                      </span>
                      {isSelected && (
                        <span
                          style={{
                            background: preset.primaryColor,
                            color: '#ffffff',
                            fontSize: '0.625rem',
                            fontWeight: 800,
                            padding: '2px 6px',
                            borderRadius: 'var(--radius-pill)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '2px'
                          }}
                        >
                          <Check size={10} /> Active
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '2px', lineHeight: 1.35 }}>
                      {preset.tagline}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid var(--color-border-subtle)' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Sparkles size={12} color="var(--color-primary)" />
            <span>Theme choice is saved locally across your browser sessions.</span>
          </span>

          <button
            onClick={onClose}
            className="tap-interactive"
            style={{
              padding: '8px 20px',
              borderRadius: 'var(--radius-pill)',
              background: 'var(--color-primary)',
              color: '#ffffff',
              border: 'none',
              fontSize: '0.8125rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
