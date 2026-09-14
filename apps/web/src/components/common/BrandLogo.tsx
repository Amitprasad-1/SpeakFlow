import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showTagline?: boolean;
  collapsed?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showIcon = true,
  showTagline = true,
  collapsed = false,
  className = ''
}) => {
  const iconDimensions = {
    sm: 28,
    md: 36,
    lg: 48
  }[size];

  const fontSizes = {
    sm: '1rem',
    md: '1.25rem',
    lg: '1.625rem'
  }[size];

  return (
    <div
      className={`brand-logo ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        userSelect: 'none',
        textDecoration: 'none',
        color: 'var(--color-text-primary)'
      }}
    >
      {/* Authentic High-Definition Brand Mark */}
      {showIcon && (
        <img
          src="/logo-mark.png"
          alt="SpeakFlow"
          width={iconDimensions}
          height={iconDimensions}
          style={{
            width: iconDimensions,
            height: iconDimensions,
            borderRadius: '50%',
            objectFit: 'cover',
            background: '#ffffff',
            boxShadow: '0 4px 16px rgba(16, 185, 129, 0.25), 0 2px 8px rgba(14, 165, 233, 0.2)',
            flexShrink: 0
          }}
        />
      )}

      {/* Wordmark & Positioning */}
      {!collapsed && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: fontSizes,
              fontWeight: 700,
              letterSpacing: '-0.025em',
              color: 'var(--color-text-primary)'
            }}
          >
            Speak<span style={{ color: 'var(--color-primary)' }}>Flow</span>
          </span>
          {showTagline && (
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.625rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--color-text-muted)',
                marginTop: '2px'
              }}
            >
              Speaking & Reading Coach
            </span>
          )}
        </div>
      )}
    </div>
  );
};
