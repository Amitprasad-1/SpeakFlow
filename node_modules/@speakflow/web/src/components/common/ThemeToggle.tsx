import React from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';

export type ThemeMode = 'dark' | 'light' | 'system';

export interface ThemeToggleProps {
  mode: ThemeMode;
  onModeChange: (mode: ThemeMode) => void;
  variant?: 'segmented' | 'compact';
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  mode,
  onModeChange,
  variant = 'segmented',
  className = ''
}) => {
  const options: { value: ThemeMode; label: string; icon: any }[] = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Laptop }
  ];

  if (variant === 'compact') {
    // Cycle between light -> dark -> system
    const handleCycle = () => {
      if (mode === 'dark') onModeChange('light');
      else if (mode === 'light') onModeChange('system');
      else onModeChange('dark');
    };

    const currentOption = options.find((o) => o.value === mode) || options[0];
    const Icon = currentOption.icon;

    return (
      <button
        onClick={handleCycle}
        className={`speakflow-btn btn-variant-ghost ${className}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          padding: 'var(--space-2) var(--space-3)',
          borderRadius: 'var(--radius-md)',
          fontSize: 'var(--text-caption)',
          fontWeight: 600,
          color: 'var(--color-text-secondary)'
        }}
        title={`Theme: ${currentOption.label} (Click to change)`}
        aria-label={`Current theme: ${currentOption.label}. Click to switch theme.`}
      >
        <Icon size={16} />
        <span>Theme: {currentOption.label}</span>
      </button>
    );
  }

  // Segmented control
  return (
    <div
      className={`theme-segmented-control ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: 'var(--color-bg-subtle)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: '2px',
        gap: '2px'
      }}
      role="group"
      aria-label="Theme mode selection"
    >
      {options.map((opt) => {
        const isSelected = mode === opt.value;
        const Icon = opt.icon;

        return (
          <button
            key={opt.value}
            onClick={() => onModeChange(opt.value)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-1-5)',
              padding: 'var(--space-1) var(--space-2-5)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--text-caption)',
              fontWeight: isSelected ? 600 : 500,
              background: isSelected ? 'var(--color-surface)' : 'transparent',
              color: isSelected ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
              border: isSelected ? '1px solid var(--color-border)' : '1px solid transparent',
              boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
              cursor: 'pointer',
              transition: 'all var(--motion-duration-fast) ease'
            }}
            aria-pressed={isSelected}
            aria-label={`${opt.label} mode`}
          >
            <Icon size={14} color={isSelected ? 'var(--color-primary)' : 'currentColor'} />
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
};
