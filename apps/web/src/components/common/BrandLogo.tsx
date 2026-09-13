import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  collapsed?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
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
      {/* Scalable Vector Mark: Speech + Flow + Progress */}
      <div
        style={{
          width: iconDimensions,
          height: iconDimensions,
          borderRadius: size === 'sm' ? 'var(--radius-sm)' : 'var(--radius-md)',
          background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          boxShadow: 'var(--shadow-glow)',
          flexShrink: 0
        }}
        aria-hidden="true"
      >
        <svg
          width={iconDimensions * 0.62}
          height={iconDimensions * 0.62}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Dynamic flow soundwaves progressing upwards */}
          <path d="M4 12c0-3.3 2.7-6 6-6s6 2.7 6 6" />
          <path d="M8 12c0-1.1.9-2 2-2s2 .9 2 2" />
          <path d="M12 12v6" />
          <path d="M16 10l4-4m0 0h-3m3 0v3" />
        </svg>
      </div>

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
              AI Communication Coach
            </span>
          )}
        </div>
      )}
    </div>
  );
};
