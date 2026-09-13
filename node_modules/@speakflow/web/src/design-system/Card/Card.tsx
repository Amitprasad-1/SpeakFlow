import React from 'react';
import { Loader2 } from 'lucide-react';

export type CardVariant =
  | 'default'
  | 'interactive'
  | 'elevated'
  | 'progress'
  | 'exercise'
  | 'statistic'
  | 'vocabulary'
  | 'conversation'
  | 'achievement';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  interactive?: boolean;
  loading?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  as?: 'div' | 'article' | 'section';
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  interactive = false,
  loading = false,
  padding = 'md',
  as: Component = 'div',
  children,
  className = '',
  style,
  onClick,
  ...rest
}) => {
  const isInteractive = interactive || variant === 'interactive' || Boolean(onClick);

  const paddingStyles: Record<string, string> = {
    none: '0',
    sm: 'var(--space-3)',
    md: 'var(--space-5)',
    lg: 'var(--space-8)'
  };

  return (
    <Component
      className={`speakflow-card card-variant-${variant} ${isInteractive ? 'is-interactive' : ''} ${className}`}
      onClick={isInteractive ? onClick : undefined}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      style={{
        padding: paddingStyles[padding],
        borderRadius: variant === 'achievement' ? 'var(--radius-xl)' : 'var(--radius-lg)',
        position: 'relative',
        transition: 'all var(--motion-duration-normal) var(--motion-ease-out)',
        ...style
      }}
      onKeyDown={(e) => {
        if (isInteractive && onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick(e as any);
        }
      }}
      {...rest}
    >
      {loading ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-8)',
            color: 'var(--color-text-muted)'
          }}
        >
          <Loader2 className="btn-spinner" size={24} />
        </div>
      ) : (
        children
      )}
    </Component>
  );
};
