import React from 'react';

export type BadgeVariant =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'focus'
  | 'level';

export interface BadgeProps {
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'md',
  icon,
  children,
  className = '',
  style
}) => {
  return (
    <span
      className={`speakflow-badge badge-${variant} badge-size-${size} ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-1-5)',
        padding: size === 'sm' ? '0.125rem 0.5rem' : '0.25rem 0.625rem',
        borderRadius: 'var(--radius-pill)',
        fontSize: size === 'sm' ? 'var(--text-caption)' : 'var(--text-body-sm)',
        fontWeight: 600,
        lineHeight: 1.2,
        letterSpacing: '0.01em',
        userSelect: 'none',
        border: '1px solid transparent',
        ...style
      }}
    >
      {icon && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
