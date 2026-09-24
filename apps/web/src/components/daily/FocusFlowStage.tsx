import React, { useRef, useState, useEffect } from 'react';
import { Volume2, Sparkles, ChevronUp, ChevronDown, Film, Layers, Play, Pause, Flame, CheckCircle2, RotateCcw } from 'lucide-react';

export interface FocusFlowItem {
  text: string;
  levelNumber?: 1 | 2 | 3 | 4;
  levelLabel?: string;
  levelTone?: 'warmup' | 'flow' | 'agility' | 'climax';
  focusTip?: string;
  ipaHint?: string;
}

export interface FocusFlowStageProps {
  items: FocusFlowItem[];
  activeIndex: number;
  progressPercent: number; // 0 to 100% countdown for active sentence
  isAutoRunning: boolean;
  isBufferHolding?: boolean; // 1.2s transition breathing room
  textSize: 'normal' | 'large';
  onSelectIndex: (index: number) => void;
  onNext: () => void;
  onPrev: () => void;
  onPlaySingleAudio: (index: number, e?: React.MouseEvent) => void;
  onTogglePlayPause?: () => void;
  // Reel Challenge Specific Props
  isReelTheme?: boolean;
  viralHook?: string;
  drillEmoji?: string;
  drillTitle?: string;
  drillDifficulty?: string;
  reelLines?: string[];
}

export const FocusFlowStage: React.FC<FocusFlowStageProps> = ({
  items,
  activeIndex,
  progressPercent,
  isAutoRunning,
  isBufferHolding = false,
  textSize,
  onSelectIndex,
  onNext,
  onPrev,
  onPlaySingleAudio,
  onTogglePlayPause,
  isReelTheme = true,
  viralHook,
  drillEmoji = '📱',
  drillTitle,
  drillDifficulty,
  reelLines
}) => {
  const stageRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number | null>(null);

  // Transition state: Tracks exiting sentence and entering sentence
  const [transitionState, setTransitionState] = useState<{
    currentIndex: number;
    exitingIndex: number | null;
    direction: 'forward' | 'backward';
  }>({
    currentIndex: activeIndex,
    exitingIndex: null,
    direction: 'forward'
  });

  // Flow Presentation Style: 'viral-reel' (Red Instagram Reel Card), 'solo-reel' (Classic Stage), 'full-continuous' (All Reel text stacked)
  const [flowStyle, setFlowStyle] = useState<'viral-reel' | 'solo-reel' | 'full-continuous'>(
    isReelTheme ? 'viral-reel' : 'solo-reel'
  );

  // Synchronize when isReelTheme changes
  useEffect(() => {
    if (isReelTheme && flowStyle !== 'full-continuous') {
      setFlowStyle('viral-reel');
    }
  }, [isReelTheme]);

  // Trigger kinetic transition when activeIndex changes
  useEffect(() => {
    if (activeIndex !== transitionState.currentIndex) {
      const dir = activeIndex > transitionState.currentIndex ? 'forward' : 'backward';
      setTransitionState({
        currentIndex: activeIndex,
        exitingIndex: transitionState.currentIndex,
        direction: dir
      });

      const timer = setTimeout(() => {
        setTransitionState(prev => ({
          ...prev,
          exitingIndex: null
        }));
      }, 420);

      return () => clearTimeout(timer);
    }
  }, [activeIndex]);

  // Mobile Touch Swipe Handling (Swipe up = next, Swipe down = prev)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches && e.touches[0]) {
      touchStartY.current = e.touches[0].clientY;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const endY = e.changedTouches[0]?.clientY;
    if (endY === undefined) return;
    const diff = touchStartY.current - endY;

    if (diff > 40) {
      onNext();
    } else if (diff < -40) {
      onPrev();
    }
    touchStartY.current = null;
  };

  const currentItem = items[activeIndex];
  const exitingItem = transitionState.exitingIndex !== null ? items[transitionState.exitingIndex] : null;

  // Determine tone color for graduated level indicator
  const getToneBadgeStyle = (tone?: string, levelNum?: number, idx?: number) => {
    switch (tone) {
      case 'warmup':
        return {
          bg: isReelTheme ? 'rgba(251, 146, 60, 0.18)' : 'rgba(16, 185, 129, 0.14)',
          border: isReelTheme ? 'rgba(251, 146, 60, 0.45)' : 'rgba(16, 185, 129, 0.35)',
          color: isReelTheme ? '#fdba74' : '#10b981',
          label: '🟢 Step 1 · Warmup Cadence'
        };
      case 'flow':
        return {
          bg: isReelTheme ? 'rgba(56, 189, 248, 0.18)' : 'rgba(14, 165, 233, 0.14)',
          border: isReelTheme ? 'rgba(56, 189, 248, 0.45)' : 'rgba(14, 165, 233, 0.35)',
          color: isReelTheme ? '#7dd3fc' : '#0284c7',
          label: '🔵 Step 2 · Rhythmic Flow'
        };
      case 'agility':
        return {
          bg: isReelTheme ? 'rgba(250, 204, 21, 0.2)' : 'rgba(245, 158, 11, 0.16)',
          border: isReelTheme ? 'rgba(250, 204, 21, 0.5)' : 'rgba(245, 158, 11, 0.4)',
          color: isReelTheme ? '#fde047' : '#d97706',
          label: '🟡 Step 3 · Velocity & Agility'
        };
      case 'climax':
        return {
          bg: 'rgba(239, 68, 68, 0.25)',
          border: 'rgba(239, 68, 68, 0.55)',
          color: '#f87171',
          label: '🔥 Step 4 · Articulation Climax'
        };
      default: {
        const stepNum = levelNum || (idx !== undefined ? idx + 1 : activeIndex + 1);
        const total = items.length;
        const pct = stepNum / total;
        if (pct <= 0.35) {
          return {
            bg: 'rgba(16, 185, 129, 0.15)',
            border: 'rgba(16, 185, 129, 0.4)',
            color: '#34d399',
            label: `🟢 Step ${stepNum} of ${total} · Warmup`
          };
        } else if (pct <= 0.7) {
          return {
            bg: 'rgba(14, 165, 233, 0.15)',
            border: 'rgba(14, 165, 233, 0.4)',
            color: '#38bdf8',
            label: `🔵 Step ${stepNum} of ${total} · Steady Flow`
          };
        } else {
          return {
            bg: 'rgba(239, 68, 68, 0.2)',
            border: 'rgba(239, 68, 68, 0.45)',
            color: '#f87171',
            label: `🔥 Step ${stepNum} of ${total} · Climax`
          };
        }
      }
    }
  };

  // Helper to split sentence into words for real-time Karaoke teleprompter highlighting
  const renderKaraokeWords = (sentenceText: string, isCurrent: boolean) => {
    if (!sentenceText) return null;
    const words = sentenceText.split(' ');
    const activeWordIdx = isCurrent && isAutoRunning
      ? Math.min(words.length - 1, Math.floor((progressPercent / 100) * words.length))
      : -1;

    return (
      <span style={{ display: 'inline' }}>
        {words.map((word, wIdx) => {
          const isWordSpoken = isCurrent && isAutoRunning && wIdx < activeWordIdx;
          const isWordActive = isCurrent && isAutoRunning && wIdx === activeWordIdx;

          // Karaoke Word Style
          let wordStyle: React.CSSProperties = {
            display: 'inline-block',
            marginRight: '0.28em',
            transition: 'color 120ms ease, transform 120ms ease, text-shadow 120ms ease'
          };

          if (isWordActive) {
            wordStyle = {
              ...wordStyle,
              color: flowStyle === 'viral-reel' ? '#fde047' : '#38bdf8',
              transform: 'scale(1.08)',
              fontWeight: 800,
              textShadow: flowStyle === 'viral-reel'
                ? '0 0 18px rgba(253, 224, 71, 0.85), 0 0 6px rgba(253, 224, 71, 0.95)'
                : '0 0 16px rgba(56, 189, 248, 0.8)'
            };
          } else if (isWordSpoken) {
            wordStyle = {
              ...wordStyle,
              color: flowStyle === 'viral-reel' ? '#ffffff' : 'var(--color-text-primary)',
              opacity: 1
            };
          } else if (isCurrent && isAutoRunning) {
            wordStyle = {
              ...wordStyle,
              color: flowStyle === 'viral-reel' ? 'rgba(255, 255, 255, 0.65)' : 'var(--color-text-secondary)',
              opacity: 0.8
            };
          } else {
            wordStyle = {
              ...wordStyle,
              color: flowStyle === 'viral-reel' ? '#ffffff' : 'var(--color-text-primary)'
            };
          }

          return (
            <span key={wIdx} style={wordStyle}>
              {word}
            </span>
          );
        })}
      </span>
    );
  };

  // Helper to render a sentence box
  const renderSentenceContent = (
    item: FocusFlowItem,
    index: number,
    isCurrent: boolean,
    animationClass: string = ''
  ) => {
    const bInfo = getToneBadgeStyle(item?.levelTone, item?.levelNumber, index);
    const isReelCard = flowStyle === 'viral-reel';

    return (
      <div
        key={`${index}-${animationClass}`}
        className={`focus-flow-card ${animationClass}`}
        style={{
          position: 'relative',
          width: '100%',
          padding: textSize === 'large' ? '28px 32px' : '24px 26px',
          background: isReelCard
            ? 'linear-gradient(160deg, rgba(74, 4, 10, 0.88) 0%, rgba(35, 2, 5, 0.92) 100%)'
            : 'var(--color-surface-sunken)',
          border: isReelCard
            ? '1.5px solid rgba(239, 68, 68, 0.42)'
            : '1.5px solid var(--color-primary-subtle)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: isReelCard
            ? '0 16px 40px rgba(0, 0, 0, 0.5), 0 0 24px rgba(220, 38, 38, 0.25)'
            : isCurrent && isAutoRunning
            ? '0 12px 36px rgba(16, 185, 129, 0.16), 0 4px 16px rgba(0, 0, 0, 0.08)'
            : '0 8px 30px rgba(0, 0, 0, 0.06)',
          backdropFilter: 'blur(16px)',
          transform: 'translateZ(0)',
          willChange: 'transform, opacity, filter',
          zIndex: isCurrent ? 5 : 2
        }}
      >
        {/* Header Row: Level Step Tag & Audio Button */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            flexWrap: 'wrap',
            gap: '8px'
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: 'var(--radius-pill)',
              background: bInfo.bg,
              border: `1px solid ${bInfo.border}`,
              color: bInfo.color,
              fontSize: '0.75rem',
              fontWeight: 800,
              letterSpacing: '0.02em'
            }}
          >
            <span>{item?.levelLabel || bInfo.label}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isCurrent && isBufferHolding && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-pill)',
                  background: 'rgba(16, 185, 129, 0.22)',
                  border: '1px solid rgba(16, 185, 129, 0.5)',
                  color: '#34d399',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  animation: 'pulse 1.2s infinite'
                }}
              >
                <CheckCircle2 size={12} />
                <span>Breathe... next in 1s</span>
              </div>
            )}

            <button
              type="button"
              onClick={(e) => onPlaySingleAudio(index, e)}
              title="Listen to native pronunciation"
              aria-label="Listen audio"
              className="tap-interactive"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: 'var(--radius-pill)',
                border: isReelCard ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid var(--color-border)',
                background: isReelCard ? 'rgba(255, 255, 255, 0.1)' : 'var(--color-surface)',
                color: isReelCard ? '#ffffff' : 'var(--color-primary)',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Volume2 size={13} />
              <span>Hear Audio</span>
            </button>
          </div>
        </div>

        {/* Active Sentence Main Text with Dynamic Karaoke Word Highlighting */}
        <div
          onClick={onTogglePlayPause}
          title="Click to play/pause pacer"
          style={{
            fontSize: textSize === 'large' ? 'clamp(1.4rem, 3.4vw, 2.15rem)' : 'clamp(1.22rem, 2.8vw, 1.85rem)',
            fontWeight: 800,
            lineHeight: textSize === 'large' ? 1.75 : 1.65,
            color: isReelCard ? '#ffffff' : 'var(--color-text-primary)',
            letterSpacing: '-0.015em',
            textAlign: isReelCard ? 'center' : 'left',
            wordBreak: 'normal',
            overflowWrap: 'break-word',
            cursor: 'pointer',
            padding: '4px 0'
          }}
        >
          {renderKaraokeWords(item?.text, isCurrent)}
        </div>

        {/* Focus Articulation Tip */}
        {item?.focusTip && (
          <div
            style={{
              marginTop: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: isReelCard ? 'center' : 'flex-start',
              gap: '6px',
              fontSize: '0.75rem',
              color: isReelCard ? 'rgba(255, 255, 255, 0.72)' : 'var(--color-text-secondary)',
              lineHeight: 1.4
            }}
          >
            <Sparkles size={12} color={isReelCard ? '#fbbf24' : 'var(--color-primary)'} style={{ flexShrink: 0 }} />
            <span>{item.focusTip}</span>
          </div>
        )}

        {/* Animated Cadence Speed Pacer Bar at Base */}
        {isCurrent && isAutoRunning && (
          <div
            style={{
              marginTop: '18px',
              height: '5px',
              background: isReelCard ? 'rgba(255, 255, 255, 0.15)' : 'var(--color-border-subtle)',
              borderRadius: 'var(--radius-pill)',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${progressPercent}%`,
                background: isBufferHolding
                  ? 'linear-gradient(90deg, #10b981 0%, #34d399 100%)'
                  : isReelCard
                  ? 'linear-gradient(90deg, #ef4444 0%, #f59e0b 50%, #fde047 100%)'
                  : 'linear-gradient(90deg, #10b981 0%, #38bdf8 100%)',
                borderRadius: 'var(--radius-pill)',
                transition: 'width 40ms linear',
                boxShadow: isReelCard ? '0 0 10px rgba(245, 158, 11, 0.8)' : 'none'
              }}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      ref={stageRef}
      className="focus-flow-container"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        position: 'relative',
        width: '100%',
        minHeight: flowStyle === 'full-continuous' ? '460px' : '400px',
        maxHeight: flowStyle === 'full-continuous' ? '680px' : '560px',
        background: flowStyle === 'viral-reel'
          ? 'radial-gradient(circle at 50% 15%, #4a0307 0%, #200103 65%, #0d0001 100%)'
          : 'var(--color-surface)',
        border: flowStyle === 'viral-reel'
          ? '1.5px solid rgba(239, 68, 68, 0.45)'
          : '1px solid var(--color-border)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: flowStyle === 'viral-reel'
          ? '0 16px 48px rgba(0, 0, 0, 0.6), 0 0 32px rgba(220, 38, 38, 0.28)'
          : isAutoRunning
          ? '0 12px 40px rgba(16, 185, 129, 0.15), 0 4px 16px rgba(0, 0, 0, 0.05)'
          : '0 8px 30px rgba(0, 0, 0, 0.06)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 20px',
        overflow: flowStyle === 'full-continuous' ? 'auto' : 'hidden',
        userSelect: 'none',
        transition: 'all 0.3s ease'
      }}
    >
      {/* Top Header Row in Stage: Style Switcher & Step Navigation */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          left: '20px',
          right: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 15
        }}
      >
        {/* Style Switcher: Viral Reel vs Classic Solo vs Continuous Text */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: flowStyle === 'viral-reel' ? 'rgba(0, 0, 0, 0.45)' : 'var(--color-surface-sunken)',
            padding: '2px 4px',
            borderRadius: 'var(--radius-pill)',
            border: flowStyle === 'viral-reel' ? '1px solid rgba(239, 68, 68, 0.35)' : '1px solid var(--color-border)'
          }}
        >
          <button
            type="button"
            onClick={() => setFlowStyle('viral-reel')}
            title="Viral Reel Style: Deep Crimson Instagram Speed Challenge card"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 9px',
              borderRadius: 'var(--radius-pill)',
              border: 'none',
              background: flowStyle === 'viral-reel' ? '#ef4444' : 'transparent',
              color: flowStyle === 'viral-reel' ? '#ffffff' : 'var(--color-text-muted)',
              fontSize: '0.6875rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: flowStyle === 'viral-reel' ? '0 0 12px rgba(239, 68, 68, 0.6)' : 'none'
            }}
          >
            <Flame size={12} fill={flowStyle === 'viral-reel' ? 'currentColor' : 'none'} />
            <span>Reel Card</span>
          </button>

          <button
            type="button"
            onClick={() => setFlowStyle('solo-reel')}
            title="Kinetic Solo Flow: Crisp single sentence teleprompter"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 8px',
              borderRadius: 'var(--radius-pill)',
              border: 'none',
              background: flowStyle === 'solo-reel' ? 'var(--color-primary)' : 'transparent',
              color: flowStyle === 'solo-reel' ? '#ffffff' : 'var(--color-text-muted)',
              fontSize: '0.6875rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <Film size={11} />
            <span>Classic Stage</span>
          </button>

          <button
            type="button"
            onClick={() => setFlowStyle('full-continuous')}
            title="Continuous Reel Flow: Full stacked challenge lines like Instagram Reels"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 8px',
              borderRadius: 'var(--radius-pill)',
              border: 'none',
              background: flowStyle === 'full-continuous' ? '#d97706' : 'transparent',
              color: flowStyle === 'full-continuous' ? '#ffffff' : 'var(--color-text-muted)',
              fontSize: '0.6875rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <Layers size={11} />
            <span>Full Reel Text</span>
          </button>
        </div>

        {/* Prev / Next Step Arrows */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {activeIndex > 0 && (
            <button
              onClick={onPrev}
              title="Previous sentence (Swipe Down or Up Arrow)"
              aria-label="Previous sentence"
              className="tap-interactive"
              style={{
                background: flowStyle === 'viral-reel' ? 'rgba(0, 0, 0, 0.4)' : 'var(--color-surface-sunken)',
                border: flowStyle === 'viral-reel' ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid var(--color-border)',
                borderRadius: 'var(--radius-pill)',
                padding: '3px 8px',
                fontSize: '0.6875rem',
                color: flowStyle === 'viral-reel' ? '#ffffff' : 'var(--color-text-muted)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <ChevronUp size={13} />
              <span>Prev</span>
            </button>
          )}

          {activeIndex < items.length - 1 && (
            <button
              onClick={onNext}
              title="Next sentence (Swipe Up or Down Arrow)"
              aria-label="Next sentence"
              className="tap-interactive"
              style={{
                background: flowStyle === 'viral-reel' ? 'rgba(0, 0, 0, 0.4)' : 'var(--color-surface-sunken)',
                border: flowStyle === 'viral-reel' ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid var(--color-border)',
                borderRadius: 'var(--radius-pill)',
                padding: '3px 8px',
                fontSize: '0.6875rem',
                color: flowStyle === 'viral-reel' ? '#ffffff' : 'var(--color-text-muted)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span>Next</span>
              <ChevronDown size={13} />
            </button>
          )}
        </div>
      </div>

      {/* VIRAL REEL HOOK HEADER (If in Reel Mode) */}
      {flowStyle === 'viral-reel' && (
        <div
          style={{
            marginTop: '22px',
            marginBottom: '10px',
            textAlign: 'center',
            zIndex: 10
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '3px 12px',
              borderRadius: 'var(--radius-pill)',
              background: 'rgba(239, 68, 68, 0.25)',
              border: '1px solid rgba(239, 68, 68, 0.55)',
              color: '#fca5a5',
              fontSize: '0.6875rem',
              fontWeight: 800,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginBottom: '6px'
            }}
          >
            <span>{drillEmoji}</span>
            <span>VIRAL REEL SPEED CHALLENGE</span>
            {drillDifficulty && (
              <>
                <span>•</span>
                <span style={{ color: '#fde047' }}>{drillDifficulty}</span>
              </>
            )}
          </div>

          <h3
            style={{
              margin: '2px 0 0',
              fontSize: 'clamp(1rem, 2.2vw, 1.3rem)',
              fontFamily: 'Georgia, serif',
              fontWeight: 700,
              color: '#ffffff',
              letterSpacing: '0.01em',
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)'
            }}
          >
            {viralHook || 'Do you speak English fluently? Then try this:'}
          </h3>
        </div>
      )}

      {/* STAGE APERTURE VIEWPORT */}
      <div
        style={{
          width: '100%',
          maxWidth: '780px',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: flowStyle === 'viral-reel' ? '6px' : '18px'
        }}
      >
        {flowStyle === 'full-continuous' ? (
          /* MODE 3: FULL CONTINUOUS REEL TEXT (Matches Screenshot 2 from Instagram) */
          <div
            style={{
              width: '100%',
              maxHeight: '440px',
              overflowY: 'auto',
              padding: '20px 24px',
              background: 'radial-gradient(circle at 50% 20%, #4a0307 0%, #1e0103 100%)',
              border: '1.5px solid rgba(239, 68, 68, 0.35)',
              borderRadius: 'var(--radius-lg)',
              textAlign: 'center',
              boxShadow: '0 12px 36px rgba(0, 0, 0, 0.6)'
            }}
          >
            <div style={{ color: '#fca5a5', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>
              ⚡ Full Reel Speed Challenge
            </div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.2rem', color: '#fde047', fontWeight: 700, marginBottom: '14px' }}>
              {viralHook || 'Do you speak English fluently? Then try this:'}
            </div>

            <div
              style={{
                fontFamily: 'Georgia, serif',
                fontSize: textSize === 'large' ? '1.35rem' : '1.18rem',
                lineHeight: 1.85,
                color: '#ffffff',
                whiteSpace: 'pre-line',
                maxWidth: '600px',
                margin: '0 auto'
              }}
            >
              {reelLines && reelLines.length > 0
                ? reelLines.join('\n')
                : items.map(it => it.text).join('\n\n')}
            </div>
          </div>
        ) : (
          /* KINETIC SINGLE-SENTENCE SPOTLIGHT FLOW */
          <div
            style={{
              position: 'relative',
              width: '100%',
              minHeight: '220px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {/* Exiting Sentence */}
            {exitingItem && transitionState.direction === 'forward' && (
              renderSentenceContent(exitingItem, transitionState.exitingIndex!, false, 'kinetic-anim-exit-top')
            )}
            {exitingItem && transitionState.direction === 'backward' && (
              renderSentenceContent(exitingItem, transitionState.exitingIndex!, false, 'kinetic-anim-exit-bottom')
            )}

            {/* Active Sentence */}
            {currentItem && (
              renderSentenceContent(
                currentItem,
                activeIndex,
                true,
                transitionState.exitingIndex !== null
                  ? transitionState.direction === 'forward'
                    ? 'kinetic-anim-enter-bottom'
                    : 'kinetic-anim-enter-top'
                  : ''
              )
            )}
          </div>
        )}
      </div>

      {/* Bottom Pacing Guide & Sound Wave Indicator */}
      <div
        style={{
          marginTop: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '14px',
          fontSize: '0.6875rem',
          color: flowStyle === 'viral-reel' ? 'rgba(255, 255, 255, 0.65)' : 'var(--color-text-muted)'
        }}
      >
        <span>Sentence {activeIndex + 1} of {items.length}</span>
        <span>•</span>
        {isAutoRunning ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: flowStyle === 'viral-reel' ? '#fde047' : '#10b981', fontWeight: 700 }}>
            <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor', animation: 'pulse 1s infinite' }} />
            Pacer Running (Click to Pause)
          </span>
        ) : (
          <span>Space / Tap to Flow</span>
        )}
        <span>•</span>
        <span>Swipe &uarr;&darr; or &larr;&rarr;</span>
      </div>
    </div>
  );
};
