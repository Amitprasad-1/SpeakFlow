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
          width={iconDimensions * 0.74}
          height={iconDimensions * 0.74}
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Open Book Outline & Layered Pages */}
          <path
            d="M16 23C11.5 21 6 21.2 3.5 22.5V8.5C6 7.2 11.5 7 16 9M16 23C20.5 21 26 21.2 28.5 22.5V8.5C26 7.2 20.5 7 16 9"
            stroke="#ffffff"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Lower Page Layer Accent */}
          <path
            d="M3.5 25.2C6 23.9 11.5 23.8 16 25.6C20.5 23.8 26 23.9 28.5 25.2"
            stroke="#a7f3d0"
            strokeWidth="1.5"
            strokeLinecap="round"
          />

          {/* Acoustic Voice Waves on Left Page */}
          <path
            d="M7.5 12C6.8 13.5 6.8 16.5 7.5 18"
            stroke="#38bdf8"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M10 10.5C9 12.8 9 17.2 10 19.5"
            stroke="#bae6fd"
            strokeWidth="1.6"
            strokeLinecap="round"
          />

          {/* Acoustic Voice Waves on Right Page */}
          <path
            d="M24.5 12C25.2 13.5 25.2 16.5 24.5 18"
            stroke="#38bdf8"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M22 10.5C23 12.8 23 17.2 22 19.5"
            stroke="#bae6fd"
            strokeWidth="1.6"
            strokeLinecap="round"
          />

          {/* Central Studio Microphone */}
          {/* Mic Grille Head */}
          <circle cx="16" cy="9.5" r="3.2" stroke="#ffffff" strokeWidth="1.8" fill="rgba(56, 189, 248, 0.28)" />
          <line x1="13.2" y1="10.5" x2="18.8" y2="10.5" stroke="#ffffff" strokeWidth="1.2" />

          {/* Mic Handle Body */}
          <path
            d="M14.2 12.7L14.7 19.5C14.7 20.3 15.3 21 16 21C16.7 21 17.3 20.3 17.3 19.5L17.8 12.7"
            stroke="#ffffff"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="rgba(255, 255, 255, 0.18)"
          />
          {/* Handle Indicator Dot */}
          <circle cx="16" cy="16" r="0.65" fill="#a7f3d0" />

          {/* Microphone Audio Cable Curling Out */}
          <path
            d="M16 21C16 23.5 14 24.5 12.5 24.5C11 24.5 10 23.5 10 22"
            stroke="#a7f3d0"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
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
              Speaking & Reading Coach
            </span>
          )}
        </div>
      )}
    </div>
  );
};
