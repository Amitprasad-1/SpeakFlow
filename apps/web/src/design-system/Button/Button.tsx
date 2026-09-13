import React from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'icon';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  disabled = false,
  children,
  className = '',
  style,
  ...rest
}) => {
  const isIconButton = variant === 'icon' || (!children && icon);

  // Size specific metrics
  const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
    sm: {
      padding: isIconButton ? 'var(--space-2)' : 'var(--space-1-5) var(--space-3)',
      fontSize: 'var(--text-caption)',
      minHeight: '34px',
      gap: 'var(--space-1-5)'
    },
    md: {
      padding: isIconButton ? 'var(--space-2-5)' : 'var(--space-2-5) var(--space-4)',
      fontSize: 'var(--text-button)',
      minHeight: 'var(--min-touch-target)', // 44px for accessibility
      gap: 'var(--space-2)'
    },
    lg: {
      padding: isIconButton ? 'var(--space-3)' : 'var(--space-3) var(--space-6)',
      fontSize: 'var(--text-body)',
      minHeight: '50px',
      gap: 'var(--space-2-5)'
    }
  };

  // Variant specific styling
  const variantClasses = `btn-variant-${variant}`;

  return (
    <button
      className={`speakflow-btn ${variantClasses} ${loading ? 'is-loading' : ''} ${className}`}
      disabled={disabled || loading}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-sans)',
        fontWeight: 'var(--text-button-weight)',
        borderRadius: isIconButton ? 'var(--radius-pill)' : 'var(--radius-md)',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        width: fullWidth ? '100%' : undefined,
        position: 'relative',
        userSelect: 'none',
        transition: 'all var(--motion-duration-fast) var(--motion-ease-out)',
        ...sizeStyles[size],
        ...style
      }}
      {...rest}
    >
      {loading ? (
        <Loader2 className="btn-spinner" size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} />
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="btn-icon-wrapper">{icon}</span>}
          {children && <span>{children}</span>}
          {icon && iconPosition === 'right' && <span className="btn-icon-wrapper">{icon}</span>}
        </>
      )}
    </button>
  );
};
