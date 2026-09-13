import React, { useState, useEffect } from 'react';
import { Card, Badge } from '../../design-system';
import { VoiceWaveVisualizer } from '../common/VoiceWaveVisualizer';
import {
  DailyGrammarLabEngine,
  DailyGrammarLabData,
  DailyIdiomPhrase
} from '@speakflow/core';
import {
  Sparkles,
  Volume2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  BookOpen,
  ArrowRight,
  MessageSquare,
  Compass
} from 'lucide-react';

export interface DailyGrammarLabTabProps {
  currentDateString?: string;
}

export const DailyGrammarLabTab: React.FC<DailyGrammarLabTabProps> = ({
  currentDateString
}) => {
  const [activeSection, setActiveSection] = useState<'all' | 'articles' | 'prepositions' | 'idioms'>('all');
  const [playingPhrase, setPlayingPhrase] = useState<string | null>(null);

  const labData: DailyGrammarLabData = React.useMemo(() => {
    return DailyGrammarLabEngine.getDailyGrammar(currentDateString);
  }, [currentDateString]);

  useEffect(() => {
    window.speechSynthesis?.cancel();
    setPlayingPhrase(null);
  }, [currentDateString]);

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  const playAudio = (text: string, phraseName: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    setPlayingPhrase(phraseName);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;

    utterance.onend = () => setPlayingPhrase(null);
    utterance.onerror = () => setPlayingPhrase(null);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', maxWidth: '820px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
          <Badge variant="primary">Daily Words & Grammar Lab</Badge>
          <Badge variant="focus">Theme: {labData.theme}</Badge>
        </div>
        <h1 className="typography-h2">Articles, Prepositions & Everyday Phrases</h1>
        <p className="typography-body-sm" style={{ color: 'var(--color-text-secondary)', marginTop: '4px' }}>
          Master the subtle differences in daily English that make you sound fluent, natural, and confident.
        </p>
      </div>

      {/* Filter Segmented Bar */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveSection('all')}
          style={{
            padding: 'var(--space-2) var(--space-4)',
            borderRadius: 'var(--radius-pill)',
            border: '1px solid var(--color-border)',
            background: activeSection === 'all' ? 'var(--color-primary)' : 'var(--color-surface)',
            color: activeSection === 'all' ? '#fff' : 'var(--color-text-primary)',
            fontWeight: 700,
            fontSize: 'var(--text-body-sm)',
            cursor: 'pointer'
          }}
        >
          All Topics ({labData.articles.length + labData.prepositions.length + labData.idiomsAndPhrases.length})
        </button>

        <button
          onClick={() => setActiveSection('articles')}
          style={{
            padding: 'var(--space-2) var(--space-4)',
            borderRadius: 'var(--radius-pill)',
            border: '1px solid var(--color-border)',
            background: activeSection === 'articles' ? 'var(--color-primary)' : 'var(--color-surface)',
            color: activeSection === 'articles' ? '#fff' : 'var(--color-text-primary)',
            fontWeight: 700,
            fontSize: 'var(--text-body-sm)',
            cursor: 'pointer'
          }}
        >
          Articles (A / An / The)
        </button>

        <button
          onClick={() => setActiveSection('prepositions')}
          style={{
            padding: 'var(--space-2) var(--space-4)',
            borderRadius: 'var(--radius-pill)',
            border: '1px solid var(--color-border)',
            background: activeSection === 'prepositions' ? 'var(--color-primary)' : 'var(--color-surface)',
            color: activeSection === 'prepositions' ? '#fff' : 'var(--color-text-primary)',
            fontWeight: 700,
            fontSize: 'var(--text-body-sm)',
            cursor: 'pointer'
          }}
        >
          Prepositions
        </button>

        <button
          onClick={() => setActiveSection('idioms')}
          style={{
            padding: 'var(--space-2) var(--space-4)',
            borderRadius: 'var(--radius-pill)',
            border: '1px solid var(--color-border)',
            background: activeSection === 'idioms' ? 'var(--color-primary)' : 'var(--color-surface)',
            color: activeSection === 'idioms' ? '#fff' : 'var(--color-text-primary)',
            fontWeight: 700,
            fontSize: 'var(--text-body-sm)',
            cursor: 'pointer'
          }}
        >
          Everyday Idioms & Phrases
        </button>
      </div>

      {/* 1. ARTICLES SECTION */}
      {(activeSection === 'all' || activeSection === 'articles') && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--color-primary)' }}>
              1. Articles in Daily English (A, An, The)
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {labData.articles.map((item, idx) => (
              <Card key={idx} variant="default" padding="md" style={{ borderLeft: '4px solid var(--color-primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-1)' }}>
                  <span style={{ fontWeight: 800, fontSize: 'var(--text-body)', color: 'var(--color-text-primary)' }}>
                    {item.rule}
                  </span>
                  <Badge variant={item.article === 'the' ? 'focus' : item.article === 'no_article' ? 'level' : 'primary'}>
                    {item.article === 'no_article' ? 'No Article (Ø)' : `Article: ${item.article.toUpperCase()}`}
                  </Badge>
                </div>

                <p style={{ margin: 0, fontSize: 'var(--text-body-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                  {item.explanation}
                </p>

                {/* Example sentence */}
                <div style={{ margin: 'var(--space-2) 0', padding: 'var(--space-2) var(--space-3)', background: 'var(--color-surface-sunken)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-subtle)' }}>
                  <span style={{ fontSize: 'var(--text-caption)', fontWeight: 700, color: 'var(--color-success)', marginRight: '6px' }}>
                    Correct Example:
                  </span>
                  <span style={{ fontSize: 'var(--text-body-sm)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    "{item.exampleSentence}"
                  </span>
                </div>

                {/* Common Mistake vs Correction */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-2)', fontSize: 'var(--text-caption)' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', color: 'var(--color-error)' }}>
                    <XCircle size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span><strong>Mistake:</strong> {item.commonMistake}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', color: 'var(--color-success)' }}>
                    <CheckCircle2 size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span><strong>Fix:</strong> {item.correction}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* 2. PREPOSITIONS SECTION */}
      {(activeSection === 'all' || activeSection === 'prepositions') && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--color-accent)' }}>
              2. Prepositions in Everyday Context
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {labData.prepositions.map((item, idx) => (
              <Card key={idx} variant="default" padding="md" style={{ borderLeft: '4px solid var(--color-accent)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-1)' }}>
                  <span style={{ fontWeight: 800, fontSize: 'var(--text-body)', color: 'var(--color-text-primary)' }}>
                    {item.preposition}
                  </span>
                  <Badge variant="level">{item.usageContext}</Badge>
                </div>

                <p style={{ margin: 0, fontSize: 'var(--text-body-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                  {item.explanation}
                </p>

                {/* Example sentence */}
                <div style={{ margin: 'var(--space-2) 0', padding: 'var(--space-2) var(--space-3)', background: 'var(--color-surface-sunken)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-subtle)' }}>
                  <span style={{ fontSize: 'var(--text-caption)', fontWeight: 700, color: 'var(--color-success)', marginRight: '6px' }}>
                    Natural Usage:
                  </span>
                  <span style={{ fontSize: 'var(--text-body-sm)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    "{item.exampleSentence}"
                  </span>
                </div>

                {/* Common Mistake vs Correction */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-2)', fontSize: 'var(--text-caption)' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', color: 'var(--color-error)' }}>
                    <XCircle size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span><strong>Incorrect:</strong> {item.commonMistake}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', color: 'var(--color-success)' }}>
                    <CheckCircle2 size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span><strong>Natural:</strong> {item.correction}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* 3. IDIOMS & EVERYDAY PHRASES SECTION */}
      {(activeSection === 'all' || activeSection === 'idioms') && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--color-warning)' }}>
              3. Today's Everyday Idioms & Phrases
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 'var(--space-3)' }}>
            {labData.idiomsAndPhrases.map((item, idx) => {
              const isPlaying = playingPhrase === item.phrase;

              return (
                <Card
                  key={idx}
                  variant="default"
                  padding="md"
                  style={{
                    borderLeft: '4px solid var(--color-warning)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 'var(--space-3)'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
                      <span style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                        "{item.phrase}"
                      </span>
                      <Badge variant="warning">{item.context}</Badge>
                    </div>

                    <p style={{ margin: 0, fontSize: 'var(--text-body-sm)', color: 'var(--color-text-secondary)' }}>
                      {item.meaning}
                    </p>

                    {/* Dialogue Example */}
                    <div style={{ marginTop: 'var(--space-3)', padding: 'var(--space-2-5)', background: 'var(--color-surface-sunken)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--text-caption)', lineHeight: 1.5 }}>
                      <div style={{ color: 'var(--color-text-muted)' }}>
                        <strong>A:</strong> "{item.exampleDialogue.speakerA}"
                      </div>
                      <div style={{ color: 'var(--color-text-primary)', fontWeight: 600, marginTop: '2px' }}>
                        <strong>B:</strong> "{item.exampleDialogue.speakerB}"
                      </div>
                    </div>
                  </div>

                  {/* Audio Button */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 'var(--space-2)', paddingTop: 'var(--space-2)', borderTop: '1px solid var(--color-border-subtle)' }}>
                    {isPlaying && (
                      <VoiceWaveVisualizer isActive={true} size="sm" color="var(--color-warning)" />
                    )}
                    <button
                      onClick={() => playAudio(item.audioText, item.phrase)}
                      className="speakflow-btn btn-variant-secondary"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: 'var(--space-1-5) var(--space-3)',
                        borderRadius: 'var(--radius-pill)',
                        fontSize: 'var(--text-caption)',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      <Volume2 size={14} />
                      <span>{isPlaying ? 'Playing...' : 'Listen Natural Pronunciation'}</span>
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};
