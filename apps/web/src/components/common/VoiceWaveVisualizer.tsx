import React from 'react';

export interface VoiceWaveVisualizerProps {
  isActive: boolean;
  barCount?: number;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const VoiceWaveVisualizer: React.FC<VoiceWaveVisualizerProps> = ({
  isActive,
  barCount = 7,
  color = 'var(--color-primary)',
  size = 'md',
  className = ''
}) => {
  const heightMap = {
    sm: 18,
    md: 26,
    lg: 38
  };

  const currentHeight = heightMap[size] || 26;

  return (
    <div
      className={`soundwave-visualizer ${isActive ? 'active' : ''} ${className}`}
      style={{ height: currentHeight }}
      aria-label={isActive ? 'Audio active soundwave' : 'Audio idle soundwave'}
    >
      {Array.from({ length: barCount }).map((_, index) => {
        // Staggered heights when idle
        const baseHeights = [0.4, 0.7, 0.5, 0.9, 0.6, 0.8, 0.45, 0.65, 0.35];
        const defaultRatio = baseHeights[index % baseHeights.length];
        const idleHeight = Math.max(4, Math.round(currentHeight * (isActive ? 0.3 : defaultRatio)));

        return (
          <span
            key={index}
            className="soundwave-bar"
            style={{
              backgroundColor: color,
              height: isActive ? `${currentHeight * defaultRatio}px` : `${idleHeight}px`,
              opacity: isActive ? 1 : 0.4
            }}
          />
        );
      })}
    </div>
  );
};
