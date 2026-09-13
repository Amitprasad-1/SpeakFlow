import React, { useState } from 'react';
import { Palette, Check, Sun, Moon } from 'lucide-react';
import { ThemePickerModal } from './ThemePickerModal';

export type ThemeMode = 'obsidian' | 'indigo' | 'ocean' | 'sunset' | 'light' | 'dark' | 'system';

export interface ThemePreset {
  id: ThemeMode;
  name: string;
  tagline: string;
  primaryColor: string;
  accentColor: string;
  bgPreview: string;
  cardPreview: string;
  isDark: boolean;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'obsidian',
    name: 'Obsidian Emerald',
    tagline: 'Deep dark obsidian with fresh emerald and cyan glow',
    primaryColor: '#10b981',
    accentColor: '#38bdf8',
    bgPreview: '#080c14',
    cardPreview: '#111827',
    isDark: true
  },
  {
    id: 'indigo',
    name: 'Royal Indigo',
    tagline: 'Velvet midnight with electric violet and neon magenta',
    primaryColor: '#8b5cf6',
    accentColor: '#ec4899',
    bgPreview: '#080914',
    cardPreview: '#14172e',
    isDark: true
  },
  {
    id: 'ocean',
    name: 'Cyber Ocean',
    tagline: 'Deep abyss navy with cyber cyan neon and cobalt',
    primaryColor: '#06b6d4',
    accentColor: '#3b82f6',
    bgPreview: '#050b14',
    cardPreview: '#0e1c31',
    isDark: true
  },
  {
    id: 'sunset',
    name: 'Sunset Amber',
    tagline: 'Espresso noir with warm amber and sunset crimson',
    primaryColor: '#f59e0b',
    accentColor: '#f43f5e',
    bgPreview: '#100b0d',
    cardPreview: '#20171a',
    isDark: true
  },
  {
    id: 'light',
    name: 'Studio Clean Light',
    tagline: 'Crisp alabaster slate with high-contrast forest teal',
    primaryColor: '#059669',
    accentColor: '#0284c7',
    bgPreview: '#f8fafc',
    cardPreview: '#ffffff',
    isDark: false
  }
];

export interface ThemeToggleProps {
  mode: ThemeMode;
  onModeChange: (mode: ThemeMode) => void;
  variant?: 'segmented' | 'compact' | 'cards';
  iconOnly?: boolean;
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  mode,
  onModeChange,
  variant = 'compact',
  iconOnly = false,
  className = ''
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Normalizing dark to obsidian for preset matching
  const resolvedMode = mode === 'dark' ? 'obsidian' : mode;
  const currentPreset = THEME_PRESETS.find((p) => p.id === resolvedMode) || THEME_PRESETS[0];

  // If cards variant (e.g. for Profile Settings View)
  if (variant === 'cards') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '12px'
          }}
        >
          {THEME_PRESETS.map((preset) => {
            const isSelected = resolvedMode === preset.id;

            return (
              <div
                key={preset.id}
                onClick={() => onModeChange(preset.id)}
                className="tap-interactive"
                style={{
                  padding: '14px',
                  borderRadius: 'var(--radius-xl)',
                  border: isSelected ? `2px solid ${preset.primaryColor}` : '1px solid var(--color-border)',
                  background: isSelected ? 'var(--color-primary-subtle)' : 'var(--color-surface)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  boxShadow: isSelected ? `0 0 16px ${preset.primaryColor}33` : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <div
                  style={{
                    height: '44px',
                    borderRadius: 'var(--radius-md)',
                    background: preset.bgPreview,
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    padding: '6px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: preset.primaryColor,
                      boxShadow: `0 0 6px ${preset.primaryColor}`
                    }}
                  />
                  <div
                    style={{
                      padding: '2px 8px',
                      borderRadius: '8px',
                      background: preset.accentColor,
                      color: '#ffffff',
                      fontSize: '0.625rem',
                      fontWeight: 800
                    }}
                  >
                    {preset.isDark ? 'DARK' : 'LIGHT'}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                    {preset.name}
                  </span>
                  {isSelected && (
                    <span
                      style={{
                        background: preset.primaryColor,
                        color: '#ffffff',
                        fontSize: '0.625rem',
                        fontWeight: 800,
                        padding: '1px 6px',
                        borderRadius: 'var(--radius-pill)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '2px'
                      }}
                    >
                      <Check size={9} /> Selected
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Segmented control (showing quick switcher buttons + Palette modal trigger)
  if (variant === 'segmented') {
    return (
      <>
        <div
          className={`theme-segmented-control ${className}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: 'var(--color-bg-subtle)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-pill)',
            padding: '3px',
            gap: '3px'
          }}
          role="group"
          aria-label="Theme mode selection"
        >
          {/* Quick theme buttons */}
          {THEME_PRESETS.slice(0, 3).map((preset) => {
            const isSelected = resolvedMode === preset.id;

            return (
              <button
                key={preset.id}
                onClick={() => onModeChange(preset.id)}
                className="tap-interactive"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 10px',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: '0.75rem',
                  fontWeight: isSelected ? 700 : 500,
                  background: isSelected ? 'var(--color-surface)' : 'transparent',
                  color: isSelected ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                  border: isSelected ? '1px solid var(--color-border)' : '1px solid transparent',
                  boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
                  cursor: 'pointer'
                }}
                aria-pressed={isSelected}
                title={preset.tagline}
              >
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: preset.primaryColor
                  }}
                />
                <span>{preset.name.split(' ')[0]}</span>
              </button>
            );
          })}

          {/* More themes button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="tap-interactive"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '5px 10px',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.75rem',
              fontWeight: 700,
              background: 'var(--color-primary-subtle)',
              color: 'var(--color-primary)',
              border: 'none',
              cursor: 'pointer'
            }}
            title="Browse all 5 themes"
          >
            <Palette size={13} />
            <span>Themes...</span>
          </button>
        </div>

        <ThemePickerModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          activeMode={mode}
          onSelectTheme={(newMode) => {
            onModeChange(newMode);
            setIsModalOpen(false);
          }}
        />
      </>
    );
  }

  // Compact variant (Default button that opens ThemePickerModal or quick cycles)
  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`tap-interactive ${className}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: iconOnly ? '0' : '8px',
          padding: iconOnly ? '8px' : '6px 12px',
          height: '36px',
          borderRadius: 'var(--radius-pill)',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          color: 'var(--color-text-primary)',
          fontSize: '0.78125rem',
          fontWeight: 700,
          cursor: 'pointer',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          transition: 'all 0.15s ease'
        }}
        title={`Current Theme: ${currentPreset.name} (Click to change)`}
        aria-label={`Current theme: ${currentPreset.name}. Click to switch theme.`}
      >
        <div
          style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: currentPreset.primaryColor,
            boxShadow: `0 0 8px ${currentPreset.primaryColor}`
          }}
        />
        <Palette size={15} color="var(--color-primary)" />
        {!iconOnly && <span>{currentPreset.name}</span>}
      </button>

      <ThemePickerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        activeMode={mode}
        onSelectTheme={(newMode) => {
          onModeChange(newMode);
          setIsModalOpen(false);
        }}
      />
    </>
  );
};
