import React from 'react';
import { Check } from 'lucide-react';

export interface OptionCardProps {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  selected: boolean;
  onSelect: () => void;
  multiSelect?: boolean;
  disabled?: boolean;
  badge?: string;
}

export const OptionCard: React.FC<OptionCardProps> = ({
  id,
  title,
  description,
  icon,
  selected,
  onSelect,
  multiSelect = false,
  disabled = false,
  badge
}) => {
  return (
    <button
      id={`option-${id}`}
      type="button"
      role={multiSelect ? 'checkbox' : 'radio'}
      aria-checked={selected}
      aria-disabled={disabled}
      disabled={disabled}
      onClick={onSelect}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        padding: 'var(--space-4)',
        borderRadius: 'var(--radius-lg)',
        background: selected ? 'var(--color-primary-subtle)' : 'var(--color-surface)',
        border: `1.5px solid ${selected ? 'var(--color-primary)' : 'var(--color-border)'}`,
        boxShadow: selected ? 'var(--shadow-sm)' : 'none',
        textAlign: 'left',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all var(--motion-duration-fast) var(--motion-ease-out)',
        opacity: disabled ? 0.6 : 1,
        outline: 'none',
        position: 'relative'
      }}
      onMouseEnter={(e) => {
        if (!selected && !disabled) {
          e.currentTarget.style.borderColor = 'var(--color-border-hover)';
          e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)';
        }
      }}
      onMouseLeave={(e) => {
        if (!selected && !disabled) {
          e.currentTarget.style.borderColor = 'var(--color-border)';
          e.currentTarget.style.backgroundColor = 'var(--color-surface)';
        }
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flex: 1 }}>
        {icon && (
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 'var(--radius-md)',
              background: selected ? 'var(--color-primary-glow)' : 'var(--color-bg-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: selected ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              flexShrink: 0
            }}
          >
            {icon}
          </div>
        )}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span
              style={{
                fontSize: 'var(--text-body)',
                fontWeight: selected ? 600 : 500,
                color: selected ? 'var(--color-text-primary)' : 'var(--color-text-primary)'
              }}
            >
              {title}
            </span>
            {badge && (
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  padding: '1px 6px',
                  borderRadius: 'var(--radius-pill)',
                  background: 'var(--color-accent-subtle)',
                  color: 'var(--color-accent)'
                }}
              >
                {badge}
              </span>
            )}
          </div>
          {description && (
            <div
              style={{
                fontSize: 'var(--text-body-sm)',
                color: 'var(--color-text-secondary)',
                marginTop: '2px'
              }}
            >
              {description}
            </div>
          )}
        </div>
      </div>

      {/* Checkbox indicator */}
      <div
        style={{
          width: 22,
          height: 22,
          borderRadius: multiSelect ? 'var(--radius-xs)' : 'var(--radius-pill)',
          border: `2px solid ${selected ? 'var(--color-primary)' : 'var(--color-border)'}`,
          background: selected ? 'var(--color-primary)' : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          flexShrink: 0,
          marginLeft: 'var(--space-3)',
          transition: 'all var(--motion-duration-fast) ease'
        }}
      >
        {selected && <Check size={14} strokeWidth={3} />}
      </div>
    </button>
  );
};
