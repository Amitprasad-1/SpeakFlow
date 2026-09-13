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
          width={iconDimensions * 0.64}
          height={iconDimensions * 0.64}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Modern Voice Speech Flow Bubble */}
          <path
            d="M12 2C6.48 2 2 6.03 2 11C2 13.88 3.5 16.42 5.86 17.98L4.5 22L9.2 20.35C10.09 20.76 11.02 21 12 21C17.52 21 22 16.97 22 11C22 6.03 17.52 2 12 2Z"
            fill="currentColor"
            fillOpacity="0.22"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Pulsating Voice Frequency Waves */}
          <rect x="7.5" y="9" width="2" height="5" rx="1" fill="currentColor" />
          <rect x="11" y="6" width="2" height="11" rx="1" fill="currentColor" />
          <rect x="14.5" y="8" width="2" height="7" rx="1" fill="currentColor" />
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
