import React, { useRef, useState, useEffect } from 'react';
import { Volume2, Sparkles, ChevronUp, ChevronDown, Film, Layers } from 'lucide-react';

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
  textSize: 'normal' | 'large';
  onSelectIndex: (index: number) => void;
  onNext: () => void;
  onPrev: () => void;
  onPlaySingleAudio: (index: number, e?: React.MouseEvent) => void;
}

export const FocusFlowStage: React.FC<FocusFlowStageProps> = ({
  items,
  activeIndex,
  progressPercent,
  isAutoRunning,
  textSize,
  onSelectIndex,
  onNext,
  onPrev,
  onPlaySingleAudio
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

  // Flow Presentation Style: 'solo-reel' (Only 1 sentence moving bottom to top out of screen) vs 'triad'
  const [flowStyle, setFlowStyle] = useState<'solo-reel' | 'triad'>('solo-reel');

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
      // Swiped UP -> Advance to next sentence
      onNext();
    } else if (diff < -40) {
      // Swiped DOWN -> Go back to prev sentence
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
          bg: 'rgba(16, 185, 129, 0.12)',
          border: 'rgba(16, 185, 129, 0.35)',
          color: '#10b981',
          label: '🟢 Step 1 · Warmup Cadence'
        };
      case 'flow':
        return {
          bg: 'rgba(14, 165, 233, 0.12)',
          border: 'rgba(14, 165, 233, 0.35)',
          color: '#0284c7',
          label: '🔵 Step 2 · Rhythmic Flow'
        };
      case 'agility':
        return {
          bg: 'rgba(245, 158, 11, 0.14)',
          border: 'rgba(245, 158, 11, 0.4)',
          color: '#d97706',
          label: '🟡 Step 3 · Velocity & Agility'
        };
      case 'climax':
        return {
          bg: 'rgba(239, 68, 68, 0.14)',
          border: 'rgba(239, 68, 68, 0.4)',
          color: '#ef4444',
          label: '🔥 Step 4 · Articulation Climax'
        };
      default: {
        const stepNum = levelNum || (idx !== undefined ? idx + 1 : activeIndex + 1);
        const total = items.length;
        const pct = stepNum / total;
        if (pct <= 0.35) {
          return {
            bg: 'rgba(16, 185, 129, 0.12)',
            border: 'rgba(16, 185, 129, 0.35)',
            color: '#10b981',
            label: `🟢 Step ${stepNum} of ${total} · Natural Warmup`
          };
        } else if (pct <= 0.7) {
          return {
            bg: 'rgba(14, 165, 233, 0.12)',
            border: 'rgba(14, 165, 233, 0.35)',
            color: '#0284c7',
            label: `🔵 Step ${stepNum} of ${total} · Steady Flow`
          };
        } else {
          return {
            bg: 'rgba(239, 68, 68, 0.14)',
            border: 'rgba(239, 68, 68, 0.4)',
            color: '#ef4444',
            label: `🔥 Step ${stepNum} of ${total} · Cadence Climax`
          };
        }
      }
    }
  };

  const badgeInfo = getToneBadgeStyle(currentItem?.levelTone, currentItem?.levelNumber);

  // Helper to render a sentence box
  const renderSentenceContent = (
    item: FocusFlowItem,
    index: number,
    isCurrent: boolean,
    animationClass: string = ''
  ) => {
    const bInfo = getToneBadgeStyle(item?.levelTone, item?.levelNumber, index);

    return (
      <div
        key={`${index}-${animationClass}`}
        className={`focus-flow-card ${animationClass}`}
        style={{
          position: 'relative',
          width: '100%',
          padding: textSize === 'large' ? '28px 32px' : '24px 26px',
          background: 'var(--color-surface-sunken)',
          border: '1.5px solid var(--color-primary-subtle)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: isCurrent && isAutoRunning
            ? '0 12px 36px rgba(16, 185, 129, 0.16), 0 4px 16px rgba(0, 0, 0, 0.08)'
            : '0 8px 30px rgba(0, 0, 0, 0.06)',
          transform: 'translateZ(0)',
          willChange: 'transform, opacity, filter',
          zIndex: isCurrent ? 5 : 2
        }}
      >
        {/* Header Row: Gradual Level Step Tag & Audio Button */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '14px',
            flexWrap: 'wrap',
            gap: '8px'
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: 'var(--radius-pill)',
              background: bInfo.bg,
              border: `1px solid ${bInfo.border}`,
              color: bInfo.color,
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.01em'
            }}
          >
            <span>{item?.levelLabel || bInfo.label}</span>
          </div>

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
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
              color: 'var(--color-primary)',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Volume2 size={13} />
            <span>Hear Audio</span>
          </button>
        </div>

        {/* Active Sentence Main Text: High Legibility, Spacious */}
        <div
          style={{
            fontSize: textSize === 'large' ? 'clamp(1.4rem, 3.4vw, 2.05rem)' : 'clamp(1.22rem, 2.8vw, 1.75rem)',
            fontWeight: 700,
            lineHeight: textSize === 'large' ? 1.75 : 1.65,
            color: 'var(--color-text-primary)',
            letterSpacing: '-0.01em',
            textAlign: 'left',
            wordBreak: 'normal',
            overflowWrap: 'break-word'
          }}
        >
          {item?.text}
        </div>

        {/* Focus Articulation Tip */}
        {item?.focusTip && (
          <div
            style={{
              marginTop: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.75rem',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.4
            }}
          >
            <Sparkles size={12} color="var(--color-primary)" style={{ flexShrink: 0 }} />
            <span>{item.focusTip}</span>
          </div>
        )}

        {/* Animated Cadence Speed Pacer Bar at Base */}
        {isCurrent && isAutoRunning && (
          <div
            style={{
              marginTop: '16px',
              height: '4px',
              background: 'var(--color-border-subtle)',
              borderRadius: 'var(--radius-pill)',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${progressPercent}%`,
                background: 'linear-gradient(90deg, #10b981 0%, #38bdf8 100%)',
                borderRadius: 'var(--radius-pill)',
                transition: 'width 40ms linear'
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
        minHeight: '380px',
        maxHeight: '520px',
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: isAutoRunning
          ? '0 12px 40px rgba(16, 185, 129, 0.15), 0 4px 16px rgba(0, 0, 0, 0.05)'
          : '0 8px 30px rgba(0, 0, 0, 0.06)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 20px',
        overflow: 'hidden',
        userSelect: 'none',
        transition: 'all 0.3s ease'
      }}
    >
      {/* Cinema / Teleprompter Corner Reticle Markers */}
      <div className="kinetic-reticle-tl" />
      <div className="kinetic-reticle-tr" />
      <div className="kinetic-reticle-bl" />
      <div className="kinetic-reticle-br" />

      {/* Top & Bottom Vignette Mask Overlays */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '60px',
          background: 'linear-gradient(to bottom, var(--color-surface) 15%, transparent 100%)',
          zIndex: 10,
          pointerEvents: 'none'
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '60px',
          background: 'linear-gradient(to top, var(--color-surface) 15%, transparent 100%)',
          zIndex: 10,
          pointerEvents: 'none'
        }}
      />

      {/* Top Header Row in Stage: Mode Toggle & Navigation Cues */}
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
        {/* Style Switcher: Solo Reel (1 sentence) vs Context Stack */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--color-surface-sunken)', padding: '2px 4px', borderRadius: 'var(--radius-pill)', border: '1px solid var(--color-border)' }}>
          <button
            type="button"
            onClick={() => setFlowStyle('solo-reel')}
            title="Solo Reel Flow: Exactly one sentence in frame, moves bottom to top then exits screen"
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
            <span>Solo Reel Flow</span>
          </button>
          <button
            type="button"
            onClick={() => setFlowStyle('triad')}
            title="Triad View: Active sentence with subtle previews above and below"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 8px',
              borderRadius: 'var(--radius-pill)',
              border: 'none',
              background: flowStyle === 'triad' ? 'var(--color-primary)' : 'transparent',
              color: flowStyle === 'triad' ? '#ffffff' : 'var(--color-text-muted)',
              fontSize: '0.6875rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <Layers size={11} />
            <span>Context Previews</span>
          </button>
        </div>

        {/* Prev / Next Small Step Arrows */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {activeIndex > 0 && (
            <button
              onClick={onPrev}
              title="Previous sentence (Swipe Down or Up Arrow)"
              aria-label="Previous sentence"
              className="tap-interactive focus-flow-nav-arrow-up"
              style={{
                background: 'var(--color-surface-sunken)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-pill)',
                padding: '3px 8px',
                fontSize: '0.6875rem',
                color: 'var(--color-text-muted)',
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
              className="tap-interactive focus-flow-nav-arrow-down"
              style={{
                background: 'var(--color-surface-sunken)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-pill)',
                padding: '3px 8px',
                fontSize: '0.6875rem',
                color: 'var(--color-text-muted)',
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
          marginTop: '18px'
        }}
      >
        {flowStyle === 'solo-reel' ? (
          /* MODE 1: PURE SOLO REEL FLOW (Exact Reel Flow: Enters from bottom, exits out the top) */
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
            {/* 1. Exiting Sentence (Moving Upward and completely OUT of the top of the screen) */}
            {exitingItem && transitionState.direction === 'forward' && (
              renderSentenceContent(exitingItem, transitionState.exitingIndex!, false, 'kinetic-anim-exit-top')
            )}

            {/* 1b. Exiting Sentence Backward (Moving Downward and out the bottom) */}
            {exitingItem && transitionState.direction === 'backward' && (
              renderSentenceContent(exitingItem, transitionState.exitingIndex!, false, 'kinetic-anim-exit-bottom')
            )}

            {/* 2. Active Sentence (Entering from bottom and locking into center focus) */}
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
        ) : (
          /* MODE 2: TRIAD CONTEXT VIEW */
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              position: 'relative',
              gap: '16px'
            }}
          >
            {/* Previous preview */}
            {activeIndex > 0 && items[activeIndex - 1] ? (
              <div
                onClick={() => onSelectIndex(activeIndex - 1)}
                className="focus-flow-item focus-flow-prev"
                style={{
                  width: '100%',
                  padding: '8px 16px',
                  textAlign: 'center',
                  opacity: 0.28,
                  transform: 'scale(0.92) translateY(-4px)',
                  filter: 'blur(0.4px)',
                  cursor: 'pointer',
                  transition: 'all 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
                  lineHeight: 1.5,
                  fontSize: textSize === 'large' ? '1.1rem' : '0.95rem',
                  color: 'var(--color-text-secondary)',
                  userSelect: 'none'
                }}
              >
                {items[activeIndex - 1].text}
              </div>
            ) : (
              <div style={{ height: '24px', opacity: 0 }} />
            )}

            {/* Center Active */}
            {renderSentenceContent(currentItem, activeIndex, true)}

            {/* Next preview */}
            {activeIndex < items.length - 1 && items[activeIndex + 1] ? (
              <div
                onClick={() => onSelectIndex(activeIndex + 1)}
                className="focus-flow-item focus-flow-next"
                style={{
                  width: '100%',
                  padding: '8px 16px',
                  textAlign: 'center',
                  opacity: 0.35,
                  transform: 'scale(0.92) translateY(4px)',
                  filter: 'blur(0.4px)',
                  cursor: 'pointer',
                  transition: 'all 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
                  lineHeight: 1.5,
                  fontSize: textSize === 'large' ? '1.1rem' : '0.95rem',
                  color: 'var(--color-text-secondary)',
                  userSelect: 'none'
                }}
              >
                {items[activeIndex + 1].text}
              </div>
            ) : (
              <div style={{ height: '24px', opacity: 0 }} />
            )}
          </div>
        )}
      </div>

      {/* Bottom Pacing Guide / Touch Swipe Helper Text */}
      <div
        style={{
          marginTop: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          fontSize: '0.6875rem',
          color: 'var(--color-text-muted)'
        }}
      >
        <span>Sentence {activeIndex + 1} of {items.length}</span>
        <span>•</span>
        <span>{flowStyle === 'solo-reel' ? 'Pure Solo Reel Focus' : 'Context Flow'}</span>
        <span>•</span>
        <span>Swipe up &darr;&uarr; or use Space / &larr;&rarr; to flow</span>
      </div>
    </div>
  );
};
